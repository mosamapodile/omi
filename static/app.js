const form = document.querySelector("#chat-form");
const input = document.querySelector("#message-input");
const messages = document.querySelector("#messages");
const welcome = document.querySelector("#welcome");
const button = document.querySelector("#send-button");
const status = document.querySelector("#status");

let conversationId = null;

function addMessage(role, content) {
  const element = document.createElement("div");
  element.className = `message ${role}`;
  element.textContent = content;

  messages.appendChild(element);
  element.scrollIntoView({
    behavior: "smooth",
    block: "end"
  });

  return element;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const message = input.value.trim();
  if (!message) return;

  welcome.hidden = true;
  input.value = "";
  button.disabled = true;

  addMessage("user", message);
  const pending = addMessage("assistant", "Thinking...");
  status.textContent = "omi is thinking";

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message,
        conversation_id: conversationId
      })
    });

    if (!response.ok) {
      throw new Error("Request failed");
    }

    const data = await response.json();

    conversationId = data.conversation_id;
    pending.textContent = data.reply;
    status.textContent = `omi is ready · ${data.mode}`;

  } catch (error) {
    pending.textContent =
      "Something went wrong. Please try again.";
    status.textContent = "connection error";
  } finally {
    button.disabled = false;
    input.focus();
  }
});
