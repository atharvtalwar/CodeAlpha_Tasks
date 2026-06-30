function joinChat() {
  const nameInput = document.getElementById("username-input").value.trim();
  if (nameInput) {
    localStorage.setItem("ConnectUs_user", nameInput);
    window.location.href = "chat.html";
  } else {
    alert("Please enter a name!");
  }
}

const path = window.location.pathname;

if (path.includes("chat.html")) {
  const userName = localStorage.getItem("ConnectUs_user");
  if (!userName) window.location.href = "index.html";

  document.getElementById("user-display").innerText = `Hi, ${userName}`;
  const socket = io("http://localhost:5000");
  const messageContainer = document.getElementById("message-container");
  const form = document.getElementById("send-container");
  const messageInput = document.getElementById("message-input");

  const appendMessage = (message, position, sender = "") => {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message");
    messageElement.classList.add(position);

    if (position === "system-message") {
      messageElement.innerText = message;
    } else {
      let senderHTML = sender
        ? `<span class="message-sender">${sender}</span>`
        : "";
      messageElement.innerHTML = `${senderHTML}${message}`;
    }
    messageContainer.append(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;
  };

  socket.on("load-history", (history) => {
    history.forEach((data) => appendMessage(data.message, "left", data.name));
    if (history.length > 0)
      appendMessage("--- Previous Messages Loaded ---", "system-message");
  });

  socket.emit("new-user-joined", userName);

  socket.on("user-connected", (name) =>
    appendMessage(`${name} joined`, "system-message"),
  );
  socket.on("receive-message", (data) =>
    appendMessage(data.message, "left", data.name),
  );
  socket.on("user-disconnected", (name) =>
    appendMessage(`${name} left`, "system-message"),
  );

  // Chat clear karne ka listener
  socket.on("chat-cleared", () => {
    messageContainer.innerHTML = "";
    appendMessage("Chat history was cleared by a user", "system-message");
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const message = messageInput.value.trim();
    if (message) {
      appendMessage(message, "right", "You");
      socket.emit("send-message", message);
      messageInput.value = "";
    }
  });

  window.clearChat = () => {
    if (confirm("Delete all chat history for everyone?")) {
      socket.emit("clear-chat-request");
    }
  };
}

function leaveChat() {
  localStorage.removeItem("ConnectUs_user");
  window.location.href = "index.html";
}
