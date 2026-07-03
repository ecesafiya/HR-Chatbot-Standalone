import "./App.css";
import { useState, useRef, useEffect } from "react";
import {
  IoSend,
  IoRefresh,
  IoTrash,
} from "react-icons/io5";

function ChatBot() {

  const [selectedService, setSelectedService] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [waitingForEmployeeId, setWaitingForEmployeeId] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const handleServiceSelect = (service) => {

    setSelectedService(service);

    let reply = "";

    if (service === "general") {
      reply =
        "📘 General FAQs selected.\n\nAsk me anything about Pi Systems, company details, interview process, careers or internships.";
    } else if (service === "onboarding") {
      reply =
        "📝 Onboarding Help selected.\n\nAsk me about joining, documents, laptop, ID card, email, payroll or training.";
    } else {
      reply =
        "👨‍💼 HR Helpdesk selected.\n\nAsk me about leave policy, attendance, salary, holidays, payslips or HR policies.";
    }

    setMessages([
      {
        sender: "bot",
        text: reply,
      },
    ]);
  };

  const handleSend = async () => {

    if (!input.trim()) return;

    const userMessage = input;
    // HR Helpdesk: Ask for Employee ID first
if (
  selectedService === "hr" &&
  !waitingForEmployeeId &&
  (
    userMessage.toLowerCase().includes("employee") ||
    userMessage.toLowerCase().includes("my details") ||
    userMessage.toLowerCase().includes("my profile")
  )
) {
  setMessages((prev) => [
    ...prev,
    {
      sender: "user",
      text: userMessage,
    },
    {
      sender: "bot",
      text: "Sure! Please enter your Employee ID (e.g., EMP101).",
    },
  ]);

  setWaitingForEmployeeId(true);
  setInput("");
  return;
}

    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: userMessage,
      },
    ]);

    setInput("");

    try {

      const response = await fetch(
        "http://127.0.0.1:8000/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: userMessage,
          }),
        }
      );

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: data.reply,
        },
      ]);
      if (waitingForEmployeeId) {
  setWaitingForEmployeeId(false);
}

    } catch {

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "⚠️ Backend connection failed.",
        },
      ]);

    }

  };

  return (
    <>
  {!isOpen && (
    <button
      onClick={() => setIsOpen(true)}
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "65px",
        height: "65px",
        borderRadius: "50%",
        border: "none",
        background: "#2563eb",
        color: "white",
        fontSize: "28px",
        cursor: "pointer",
        boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
        zIndex: 999,
      }}
    >
      💬
    </button>
  )}

  {isOpen && (

    <div className="chat-container">

      <div
  className="header"
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  }}
>
  <span>Pi Systems HR Assistant</span>

  <button
    onClick={() => setIsOpen(false)}
    style={{
      background: "transparent",
      border: "none",
      color: "white",
      fontSize: "22px",
      cursor: "pointer",
    }}
  >
    ✕
  </button>
</div>

      <div className="chat-messages">

        <div className="bot-message">
          👋 Hello! Welcome to Pi Systems.
        </div>

        {!selectedService ? (
          <>

            <div className="bot-message">
              Please choose a service to continue.
            </div>

            <button
              className="button"
              onClick={() => handleServiceSelect("general")}
            >
              📘 General FAQs
            </button>

            <button
              className="button"
              onClick={() => handleServiceSelect("onboarding")}
            >
              📝 Onboarding Help
            </button>

            <button
              className="button"
              onClick={() => handleServiceSelect("hr")}
            >
              👨‍💼 HR Helpdesk
            </button>

          </>
        ) : (
          <>
          {messages.map((msg, index) => (
              <div
                key={index}
                className={
                  msg.sender === "user"
                    ? "user-message"
                    : "bot-message"
                }
              >
                <div style={{ whiteSpace: "pre-line" }}>
  {msg.text}
</div>

              </div>
            ))}

            <div ref={messagesEndRef}></div>

          </>
        )}

      </div>

      {selectedService && (
        <>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginTop: "10px",
            }}
          >

            <input
              className="input-box"
              placeholder="Ask your HR question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSend();
                }
              }}
              style={{
  flex: 1,
  height: "42px",
}}

            />

            <button
              onClick={handleSend}
              title="Send Message"
              style={{
                border: "none",
                background: "#2563eb",
                color: "white",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IoSend />
            </button>
            <button
  onClick={() => {
    setSelectedService("");
    setMessages([]);
    setInput("");
  }}
  title="Change Service"
  style={{
    border: "none",
    background: "#f59e0b",
    color: "white",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }}
>
  <IoRefresh />
</button>

<button
  onClick={() => {
    setMessages([]);
    setInput("");
  }}
  title="Clear Chat"
  style={{
    border: "none",
    background: "#ef4444",
    color: "white",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }}
>
  <IoTrash />
</button>

</div>

        </>
      )}

    </div>

  )}

  </>

  );

}

export default ChatBot;
