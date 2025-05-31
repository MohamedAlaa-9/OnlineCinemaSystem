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

      // Add bot response
      const botResponse = getWidgetBotResponse(message)
      addWidgetMessage("bot", botResponse)

      // Scroll to bottom
      chatbotMessages.scrollTop = chatbotMessages.scrollHeight
    }, 1500)
  })

  // Add welcome message after a short delay
  setTimeout(() => {
    addWidgetMessage("bot", "Hello! 👋 How can I help you today?")
  }, 1000)
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

// Function to get bot response for the widget
function getWidgetBotResponse(userInput) {
  // Convert to lowercase for easier matching
  const input = userInput.toLowerCase()

  // Simple responses for the widget
  if (input.includes("hello") || input.includes("hi") || input.includes("hey")) {
    return "Hello! How can I assist you today?"
  } else if (input.includes("movie") || input.includes("showing")) {
    return "We have several movies showing today including Avengers, Batman, and Dune. Would you like more details?"
  } else if (input.includes("ticket") || input.includes("book")) {
    return "You can book tickets on our website or through our app. Would you like me to guide you through the process?"
  } else if (input.includes("time") || input.includes("schedule")) {
    return "Our showtimes vary by movie. The first show starts at 10:00 AM and the last show is at 10:30 PM."
  } else if (input.includes("price") || input.includes("cost") || input.includes("discount")) {
    return "Regular tickets are $12. We offer discounts for students, seniors, and on Tuesdays."
  } else if (input.includes("thank")) {
    return "You're welcome! Is there anything else I can help you with?"
  } else if (input.includes("bye")) {
    return "Goodbye! Enjoy your day!"
  } else {
    return "For more detailed information, please visit our website or contact our customer service."
  }
}
