import React, { useEffect } from "react";
import "./ChatBot.css";

function ChatBot() {
  useEffect(() => {
    // Attach FAQ listeners to trigger chatbot
    const faqItems = document.querySelectorAll(".faq-preview li");
    const inputForm = document.querySelector(".faq-form");

    faqItems.forEach((item) => {
      item.addEventListener("click", () => {
        const question = item.textContent.trim();
        if (window.botpressWebChat) {
          window.botpressWebChat.sendEvent({ type: "show" });
          window.botpressWebChat.sendPayload({ type: "text", text: question });
        }
      });
    });

    if (inputForm) {
      inputForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = e.target.querySelector("input");
        const question = input.value.trim();
        if (question && window.botpressWebChat) {
          window.botpressWebChat.sendEvent({ type: "show" });
          window.botpressWebChat.sendPayload({ type: "text", text: question });
          input.value = "";
        }
      });
    }

    return () => {
      faqItems.forEach((item) => item.replaceWith(item.cloneNode(true)));
    };
  }, []);
  return (
    <section className="faq-preview">
      <h3>Ask BreatheSafeAI</h3>
      <ul>
        <li>💨 How can I improve indoor air quality?</li>
        <li>😷 What is the safe AQI for children?</li>
        <li>🌿 How does the AI analyze my breathing?</li>
        <li>🏠 What plants help purify indoor air?</li>
        <li>🚗 How does traffic affect air pollution levels?</li>
        <li>🔥 What are PM2.5 and PM10 particles?</li>
      </ul>
      <form className="faq-form">
        <input type="text" placeholder="Type your question..." />
        <button type="submit">Ask</button>
      </form>
    </section>
  );
}

export default ChatBot;
