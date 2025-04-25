// pages/index.js
import { useState, useRef, useEffect } from "react";
import Head from "next/head";
import {
  Copy,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  Link,
  RefreshCcw,
  Share,
  MoreHorizontal,
  Search,
  MapPin,
  Image,
  Send,
  Menu,
} from "lucide-react";

export default function Home() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hey! 😊 What's up?", sender: "user" },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim() === "") return;

    setMessages([
      ...messages,
      { id: messages.length + 1, text: inputMessage, sender: "user" },
    ]);
    setInputMessage("");

    // Simulate response (in a real app, this would be an API call)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: "I'm just a demo response. In a real app, this would come from your AI service.",
          sender: "assistant",
        },
      ]);
    }, 1000);
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
          <Menu className="w-6 h-6" />
          <div className="flex items-center gap-2 cursor-pointer">
            <span className="font-medium">ChatGPT</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="hidden md:block px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700 transition">
            Hello
          </button>
          <button className="p-2 rounded-full hover:bg-gray-800 transition">
            <Share className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full bg-blue-500 text-white">S</button>
        </div>
      </header>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-3xl ${
                message.sender === "user" ? "bg-blue-600" : "bg-gray-800"
              } rounded-lg px-4 py-2`}
            >
              {message.text}
            </div>
          </div>
        ))}

        {messages.length > 0 && message.sender === "user" && (
          <div className="flex items-center gap-2 mt-2">
            <button className="p-1 rounded hover:bg-gray-700">
              <Copy className="w-4 h-4" />
            </button>
            <button className="p-1 rounded hover:bg-gray-700">
              <ThumbsUp className="w-4 h-4" />
            </button>
            <button className="p-1 rounded hover:bg-gray-700">
              <ThumbsDown className="w-4 h-4" />
            </button>
            <button className="p-1 rounded hover:bg-gray-700">
              <Volume2 className="w-4 h-4" />
            </button>
            <button className="p-1 rounded hover:bg-gray-700">
              <Link className="w-4 h-4" />
            </button>
            <button className="p-1 rounded hover:bg-gray-700">
              <RefreshCcw className="w-4 h-4" />
            </button>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4">
        <form onSubmit={sendMessage} className="relative max-w-3xl mx-auto">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask anything"
            className="w-full p-4 pr-24 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
          />
          <div className="absolute bottom-2 left-2 flex gap-2">
            <button
              type="button"
              className="p-2 rounded-full hover:bg-gray-700"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="p-2 rounded-full hover:bg-gray-700"
            >
              <MapPin className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="p-2 rounded-full hover:bg-gray-700"
            >
              <Image className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="p-2 rounded-full hover:bg-gray-700"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
          <button
            type="submit"
            className="absolute right-2 bottom-2 p-2 rounded-full hover:bg-gray-700"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
