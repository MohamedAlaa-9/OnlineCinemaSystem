document.addEventListener("DOMContentLoaded", () => {
  // Create the chatbot widget elements
  createChatbotWidget()

  // Add event listeners
  const chatbotButton = document.getElementById("chatbotButton")
  const chatbotPopup = document.getElementById("chatbotPopup")
  const closeChatbot = document.getElementById("closeChatbot")
  const chatbotForm = document.getElementById("chatbotWidgetForm")
  const chatbotMessages = document.getElementById("chatbotWidgetMessages")

  // Toggle chatbot popup when button is clicked
  chatbotButton.addEventListener("click", () => {
    chatbotPopup.classList.toggle("show")
    chatbotButton.classList.toggle("active")

    // If opening the chatbot, scroll to bottom of messages
    if (chatbotPopup.classList.contains("show")) {
      chatbotMessages.scrollTop = chatbotMessages.scrollHeight
    }
  })

  // Close chatbot when close button is clicked
  closeChatbot.addEventListener("click", () => {
    chatbotPopup.classList.remove("show")
    chatbotButton.classList.remove("active")
  })

  // Handle form submission
  chatbotForm.addEventListener("submit", (e) => {
    e.preventDefault()
    const input = document.getElementById("chatbotWidgetInput")
    const message = input.value.trim()

    if (message === "") return

    // Add user message
    addWidgetMessage("user", message)
    input.value = ""

    // Show typing indicator
    const typingIndicator = document.getElementById("chatbotWidgetTyping")
    typingIndicator.style.display = "block"

    // Scroll to bottom
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight

    // Simulate bot response after delay
    setTimeout(() => {
      // Hide typing indicator
      typingIndicator.style.display = "none"

      // Get response from API and show it
      getWidgetBotResponse(message).then(botResponse => {
        addWidgetMessage("bot", botResponse)
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight
      })
    }, 1500)
  })
})

// Function to create the chatbot widget HTML
function createChatbotWidget() {
  const chatbotWidget = document.createElement("div")
  chatbotWidget.className = "chatbot-widget"
  chatbotWidget.innerHTML = `
        <button id="chatbotButton" class="chatbot-button">
            <i class="fas fa-comment"></i>
            <i class="fas fa-times"></i>
        </button>
        
        <div id="chatbotPopup" class="chatbot-popup">
            <div class="chatbot-popup-header">
                <div class="chatbot-popup-title">
                    <i class="fas fa-robot me-2"></i>
                    Cinema Assistant
                </div>
                <div class="chatbot-popup-actions">
                    <button id="closeChatbot" class="chatbot-action-button" title="Close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            
            <div id="chatbotWidgetMessages" class="chatbot-popup-messages">
                <!-- Messages will be added here -->
                
                <!-- Typing indicator -->
                <div id="chatbotWidgetTyping" class="chatbot-message bot" style="display: none;">
                    <div class="chatbot-message-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="chatbot-message-bubble typing-bubble">
                        <div class="typing-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                </div>
            </div>
            
            <form id="chatbotWidgetForm" class="chatbot-popup-input">
                <input type="text" id="chatbotWidgetInput" placeholder="Type your message..." required>
                <button type="submit">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </form>
        </div>
    `

  document.body.appendChild(chatbotWidget)
}

// Function to add a message to the widget chat
function addWidgetMessage(sender, message) {
  const chatbotMessages = document.getElementById("chatbotWidgetMessages")
  const typingIndicator = document.getElementById("chatbotWidgetTyping")

  const messageElement = document.createElement("div")
  messageElement.className = `chatbot-message ${sender}`

  if (sender === "bot") {
    messageElement.innerHTML = `
            <div class="chatbot-message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="chatbot-message-bubble">${message}</div>
        `
  } else {
    messageElement.innerHTML = `
            <div class="chatbot-message-bubble">${message}</div>
        `
  }

  // Insert before typing indicator
  chatbotMessages.insertBefore(messageElement, typingIndicator)
}

// Function to get bot response from backend API
function getWidgetBotResponse(userInput) {
  return fetch("http://127.0.0.1:8000/api/help/message/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message: userInput })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("Failed to fetch response from chatbot API")
      }
      return response.json()
    })
    .then(data => {
      return data.response || "Sorry, I didn't understand that."
    })
    .catch(error => {
      console.error("Chatbot API error:", error)
      return "Sorry, there was a problem getting a response. Please try again later."
    })
}
