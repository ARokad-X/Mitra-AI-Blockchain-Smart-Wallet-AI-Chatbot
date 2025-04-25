// import ChatInterface from "./components/ChatInterface";
// import { ConnectAndSIWE } from "./components/ConnectAndSIWE";

// export default function Home() {
//   return (
//     <main className="min-h-screen bg-gray-50">
//       <ConnectAndSIWE />
//       <div className="container mx-auto">
//         <h1 className="text-3xl font-bold text-center py-6">
//           AI Chat Assistant
//         </h1>
//         <ChatInterface />
//       </div>
//     </main>
//   );
// }

"use client";

import { useState, useRef, useEffect } from "react";
import { useAccount, useConnect } from "wagmi";
import { cbWalletConnector } from "./wagmi";
import { Share, Send, Menu } from "lucide-react";
import Head from "next/head";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isConnected && address) {
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content: `WALLET_CREATED:${address}`,
        },
      ]);
    }
  }, [isConnected, address]);

  const handleWalletConnection = async () => {
    try {
      console.log("Connecting wallet");
      connect({ connector: cbWalletConnector });
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content: "Failed to connect wallet. Please try again.",
        },
      ]);
    }
  };

  const handleFunctionCall = async (functionName: string) => {
    switch (functionName) {
      case "connect_wallet":
        await handleWalletConnection();
        break;
      default:
        console.warn("Unknown function:", functionName);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          walletAddress: address,
          isConnected: isConnected,
        }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      // Check for function call in the response
      const functionMatch = data.response.match(/<function>(.*?)<\/function>/);
      if (functionMatch) {
        const functionName = functionMatch[1];
        // Remove the function call from the message
        const cleanMessage = data.response
          .replace(/<function>.*?<\/function>/, "")
          .trim();
        if (cleanMessage) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: cleanMessage },
          ]);
        }
        // Execute the function after adding the message
        await handleFunctionCall(functionName);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.response },
        ]);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, there was an error processing your request.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <Head>
        <title>Chat UI</title>
        <meta
          name="description"
          content="Responsive Chat UI built with Next.js"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 cursor-pointer">
            <span className="font-bold font-mono text-2xl">Mitra AI</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {isConnected ? (
            <button className="hidden md:block px-4 py-2 rounded-full bg-green-600 hover:bg-green-700 transition">
              {address?.substring(0, 6)}...
              {address?.substring(address.length - 4)}
            </button>
          ) : (
            <button
              onClick={handleWalletConnection}
              className="hidden md:block px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700 transition"
            >
              Connect Wallet
            </button>
          )}
          <button className="p-2 rounded-full hover:bg-gray-800 transition">
            <Share className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === "user"
                  ? "bg-blue-600 text-white"
                  : message.role === "system"
                  ? "bg-green-600 text-white"
                  : "bg-gray-800 text-white"
              }`}
            >
              {message.content.startsWith("WALLET_CREATED:")
                ? `Your Base Smart Wallet has been created! Address: ${
                    message.content.split(":")[1]
                  }`
                : message.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 text-white rounded-lg p-4">
              Thinking...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4">
        <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isConnected
                ? "Ask me anything or type 'open wallet' to view your wallet"
                : "Ask anything"
            }
            className="w-full p-4 pr-24 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 bottom-2 p-2 rounded-full hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
