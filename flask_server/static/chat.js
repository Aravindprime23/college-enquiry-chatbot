const chatInput = document.getElementById("chat-input");
const chatForm = document.getElementById("chat-form");
const chatbotFigure = document.querySelector(".mobile");
const micBtn = document.getElementById("mic_btn");
micBtn.style.backgroundColor = "#1979fa"; // Set initial mic button color
let apiURL = "";
let recognition;

// Toggle chatbot visibility
function toggleChatBot() {
    chatbotFigure.classList.toggle("hidden");
}

// Send message function
function sendMessage(userMsg) {
    if (!userMsg.trim()) return;

    addMessage(userMsg, "outgoing");

    fetch(`http://127.0.0.1:5000/chatbot_api/${apiURL}`, {
        method: "POST",
        body: JSON.stringify({ message: userMsg }),
        mode: "cors",
        headers: { "Content-Type": "application/json" }
    })
    .then((r) => r.json())
    .then((r) => {
        apiURL = r.url || "";
        addMessage(r.response, "incoming");

        if (r.data) {
            addPDFBtn(r.data);
        }
    });

    chatInput.value = ""; // Clear input field after sending
}

// Event listener for form submission
chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    sendMessage(chatInput.value);
});

// Function to add messages to chat
function addMessage(message, msgType) {
    const chatMessage = document.createElement("div");
    chatMessage.classList.add("chat-message", `${msgType}-message`);
    chatMessage.innerText = message;
    document.querySelector(".chat-messages").appendChild(chatMessage);
    document.querySelector(".chat-messages").scrollTop =
        document.querySelector(".chat-messages").scrollHeight;
}

// Function to add PDF button if chatbot responds with a file
function addPDFBtn(data) {
    const chatMessage = document.createElement("div");
    chatMessage.classList.add("chat-message", "incoming-message", "file-message");
    chatMessage.innerText = data.filename;
    chatMessage.onclick = () => {
        window.open(data.link);
    };
    document.querySelector(".chat-messages").appendChild(chatMessage);
    document.querySelector(".chat-messages").scrollTop =
        document.querySelector(".chat-messages").scrollHeight;
}

// Speech-to-text functionality
if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = navigator.language || "en-US"; // Auto-detect browser language

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        chatInput.value = transcript; // Just set the value, don't send it
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
    };

    recognition.onend = () => {
        micBtn.style.backgroundColor = "#1979fa"; // Reset mic button color after recording
    };

    micBtn.addEventListener("click", () => {
        micBtn.style.backgroundColor = "red"; // Indicate recording is active
        recognition.start();
    });
} else {
    console.warn("Speech recognition not supported in this browser.");
    micBtn.style.display = "none"; // Hide mic button if speech recognition isn't supported
}
