import "./App.css";
import { useState } from "react";

function GeneralFAQs({ goHome }) {
  const [messages, setMessages] = useState([
  {
    sender: "bot",
    text: "Welcome to General FAQs. Ask me anything about the company."
  }
]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {

  if (!input.trim()) return;

  setMessages((prev) => [
    ...prev,
    { sender: "user", text: input }
  ]);

  try {

    setLoading(true);
    const response = await fetch("http://127.0.0.1:8000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: input,
      }),
    });

    const data = await response.json();
    setLoading(false);
    console.log(data);

    setMessages((prev) => [
      ...prev,
      {
        sender: "bot",
        text: data.reply,
      },
    ]);

  } catch (error) {

    setLoading(false);
    setMessages((prev) => [
      ...prev,
      {
        sender: "bot",
        text: "Backend connection failed.",
      },
    ]);

  }

  setInput("");

};

  return (
    <div className="chat-container">
      <div className="header">General FAQs</div>

      <div className="chat-messages">
  {messages.map((msg, index) => (
    <div
      key={index}
      className={msg.sender === "user" ? "user-message" : "bot-message"}
    >
      {msg.text}
    </div>
  ))}
  {loading && (
  <div className="bot-message">
    🤖 AI is typing...
  </div>
)}
</div>

      <input
        className="input-box"
        placeholder="Ask a question..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
  if (e.key === "Enter") {
    handleSend();
  }
}}
      />

      <button className="button" onClick={handleSend}>
        Send
      </button>

      <button className="button" onClick={goHome}>
        ← Back to Home
      </button>
    </div>
  );
}

export default GeneralFAQs;