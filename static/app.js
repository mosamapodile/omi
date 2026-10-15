const form = document.querySelector("#chat-form");
const input = document.querySelector("#message-input");
const messages = document.querySelector("#messages");
const hero = document.querySelector("#hero");
const conversation = document.querySelector("#conversation");
const button = document.querySelector("#send-button");
const status = document.querySelector("#connection-status");
const systemStatus = document.querySelector("#system-status");
const orbScene = document.querySelector("#orb-scene");
const starsContainer = document.querySelector("#stars");
const newChatButton = document.querySelector("#new-chat");

let conversationId = null;
let isThinking = false;

/* ---------------------------------
   STARFIELD
--------------------------------- */

function createStars() {
  const fragment = document.createDocumentFragment();
  const count = window.innerWidth < 700 ? 65 : 130;

  for (let i = 0; i < count; i++) {
    const star = document.createElement("span");
    star.className = "star";

    const size = Math.random() * 1.8 + 0.4;

    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;

    star.style.setProperty(
      "--duration",
      `${Math.random() * 4 + 2}s`
    );

    star.style.setProperty(
      "--delay",
      `${Math.random() * -6}s`
    );

    fragment.appendChild(star);
  }

  starsContainer.appendChild(fragment);
}

createStars();

/* ---------------------------------
   ORB INTERACTION
--------------------------------- */

if (orbScene) {
  orbScene.addEventListener("mousemove", (event) => {
    if (isThinking) return;

    const rect = orbScene.getBoundingClientRect();

    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    orbScene.style.transform =
      `rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
  });

  orbScene.addEventListener("mouseleave", () => {
    orbScene.style.transform = "";
  });
}

/* ---------------------------------
   CHAT INTERFACE
--------------------------------- */

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

function activateChat() {
  document.body.classList.add("chat-active");
  conversation.classList.add("active");
}

function setThinking(value) {
  isThinking = value;
  button.disabled = value;
  input.disabled = value;

  if (orbScene) {
    orbScene.classList.toggle("thinking", value);
  }

  if (value) {
    status.textContent = "✦ OMI IS THINKING";
    systemStatus.textContent = "PROCESSING";
  } else {
    status.textContent = "✦ READY TO EXPLORE";
    systemStatus.textContent = "SYSTEM ONLINE";
  }
}

async function sendMessage(message) {
  if (!message.trim() || isThinking) return;

  activateChat();
  setThinking(true);

  addMessage("user", message);

  const pending = addMessage("assistant pending", "Thinking...");

  input.value = "";

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
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    conversationId = data.conversation_id;

    pending.classList.remove("pending");
    pending.textContent = data.reply;

    if (data.mode === "demo") {
      status.textContent = "✦ DEMO MODE";
    } else {
      status.textContent = "✦ CONNECTED TO AZURE";
    }

  } catch (error) {
    console.error("omi request failed:", error);

    pending.classList.remove("pending");
    pending.textContent =
      "I couldn't connect right now. Please try again.";

    status.textContent = "✦ CONNECTION ERROR";

  } finally {
    setThinking(false);
    input.focus();
  }
}

/* ---------------------------------
   FORM
--------------------------------- */

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const message = input.value.trim();

  await sendMessage(message);
});

/* ---------------------------------
   SUGGESTED PROMPTS
--------------------------------- */

document.querySelectorAll(".suggestion").forEach((suggestion) => {
  suggestion.addEventListener("click", () => {
    const prompt = suggestion.dataset.prompt;

    sendMessage(prompt);
  });
});

/* ---------------------------------
   NEW CONVERSATION
--------------------------------- */

newChatButton.addEventListener("click", () => {
  if (isThinking) return;

  conversationId = null;
  messages.innerHTML = "";

  conversation.classList.remove("active");
  document.body.classList.remove("chat-active");

  status.textContent = "✦ READY TO EXPLORE";
  systemStatus.textContent = "SYSTEM ONLINE";

  input.value = "";
  input.focus();
});

/* ---------------------------------
   INITIAL HEALTH CHECK
--------------------------------- */

async function checkHealth() {
  try {
    const response = await fetch("/api/health");

    if (!response.ok) {
      throw new Error("Health check failed");
    }

    const data = await response.json();

    if (data.mode === "demo") {
      status.textContent = "✦ DEMO MODE";
    } else {
      status.textContent = "✦ AZURE CONNECTED";
    }

  } catch (error) {
    systemStatus.textContent = "OFFLINE";
    status.textContent = "✦ CONNECTION UNAVAILABLE";
  }
}

checkHealth();
