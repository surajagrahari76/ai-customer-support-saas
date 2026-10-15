(function () {
    const script = document.currentScript || document.querySelector("script[data-owner-id]");
    if (!script) {
        console.error("SupportAI ChatBot: script tag not found");
        return;
    }

    const ownerId = script.getAttribute("data-owner-id");
    if (!ownerId) {
        console.error("SupportAI ChatBot: data-owner-id attribute is required on script tag");
        return;
    }

    const apiBase = new URL(script.src).origin;
    const apiUrl = `${apiBase}/api/chat`;

    // Host element attached to document body
    const host = document.createElement("div");
    host.id = "supportai-chat-root";
    document.body.appendChild(host);

    // Isolated Shadow DOM
    const shadow = host.attachShadow({ mode: "open" });

    const styles = `
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }

        .chat-toggle-btn {
            position: fixed;
            bottom: 24px;
            right: 24px;
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background: #111827;
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            cursor: pointer;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
            transition: transform 0.2s ease, background 0.2s ease;
            z-index: 2147483647;
            border: none;
            outline: none;
        }

        .chat-toggle-btn:hover {
            transform: scale(1.05);
            background: #000000;
        }

        .chat-toggle-btn:active {
            transform: scale(0.95);
        }

        .chat-window {
            position: fixed;
            bottom: 92px;
            right: 24px;
            width: 360px;
            max-width: calc(100vw - 32px);
            height: 520px;
            max-height: calc(100vh - 120px);
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.18), 0 1px 3px rgba(0, 0, 0, 0.08);
            display: none;
            flex-direction: column;
            overflow: hidden;
            z-index: 2147483647;
            border: 1px solid #e5e7eb;
        }

        .chat-window.open {
            display: flex;
        }

        .chat-header {
            background: #111827;
            color: #ffffff;
            padding: 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .chat-header-title {
            font-size: 15px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .chat-status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #10b981;
        }

        .chat-close-btn {
            background: transparent;
            border: none;
            color: #9ca3af;
            font-size: 18px;
            cursor: pointer;
            padding: 4px;
            line-height: 1;
            transition: color 0.15s ease;
        }

        .chat-close-btn:hover {
            color: #ffffff;
        }

        .chat-messages {
            flex: 1;
            padding: 16px;
            overflow-y: auto;
            background: #f9fafb;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .chat-bubble {
            max-width: 82%;
            padding: 10px 14px;
            border-radius: 14px;
            font-size: 14px;
            line-height: 1.45;
            word-break: break-word;
            white-space: pre-wrap;
        }

        .chat-bubble.user {
            align-self: flex-end;
            background: #111827;
            color: #ffffff;
            border-bottom-right-radius: 4px;
        }

        .chat-bubble.bot {
            align-self: flex-start;
            background: #e5e7eb;
            color: #111827;
            border-bottom-left-radius: 4px;
        }

        .chat-bubble.typing {
            align-self: flex-start;
            background: #e5e7eb;
            color: #6b7280;
            font-style: italic;
            font-size: 13px;
        }

        .chat-footer {
            padding: 12px;
            background: #ffffff;
            border-top: 1px solid #e5e7eb;
            display: flex;
            gap: 8px;
        }

        .chat-input {
            flex: 1;
            padding: 10px 14px;
            border: 1px solid #d1d5db;
            border-radius: 20px;
            font-size: 14px;
            outline: none;
            background: #ffffff;
            color: #111827;
            transition: border-color 0.15s ease;
        }

        .chat-input:focus {
            border-color: #111827;
        }

        .chat-send-btn {
            background: #111827;
            color: #ffffff;
            border: none;
            border-radius: 20px;
            padding: 10px 16px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: background 0.15s ease, opacity 0.15s ease;
        }

        .chat-send-btn:hover:not(:disabled) {
            background: #000000;
        }

        .chat-send-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    `;

    const template = `
        <style>${styles}</style>
        <button class="chat-toggle-btn" aria-label="Open Customer Support Chat">🗨️</button>
        <div class="chat-window" role="dialog" aria-label="Customer Support">
            <div class="chat-header">
                <div class="chat-header-title">
                    <span class="chat-status-dot"></span>
                    <span>Customer Support</span>
                </div>
                <button class="chat-close-btn" aria-label="Close Chat">✕</button>
            </div>
            <div class="chat-messages" id="messages-container">
                <div class="chat-bubble bot">Hi! How can I help you today?</div>
            </div>
            <div class="chat-footer">
                <input type="text" class="chat-input" placeholder="Type a message..." aria-label="Your message" />
                <button class="chat-send-btn">Send</button>
            </div>
        </div>
    `;

    shadow.innerHTML = template;

    const toggleBtn = shadow.querySelector(".chat-toggle-btn");
    const chatWindow = shadow.querySelector(".chat-window");
    const closeBtn = shadow.querySelector(".chat-close-btn");
    const messagesContainer = shadow.querySelector("#messages-container");
    const input = shadow.querySelector(".chat-input");
    const sendBtn = shadow.querySelector(".chat-send-btn");

    function toggleChat() {
        const isOpen = chatWindow.classList.toggle("open");
        if (isOpen) {
            input.focus();
        }
    }

    toggleBtn.addEventListener("click", toggleChat);
    closeBtn.addEventListener("click", () => chatWindow.classList.remove("open"));

    function addMessage(text, sender) {
        const bubble = document.createElement("div");
        bubble.className = `chat-bubble ${sender}`;
        bubble.textContent = text;
        messagesContainer.appendChild(bubble);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return bubble;
    }

    let isSending = false;

    async function handleSend() {
        const text = input.value.trim();
        if (!text || isSending) return;

        isSending = true;
        sendBtn.disabled = true;

        addMessage(text, "user");
        input.value = "";

        const typingBubble = addMessage("Typing...", "typing");

        let reply = "Sorry, something went wrong. Please try again later.";
        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: text,
                    ownerId: ownerId,
                }),
            });

            const data = await response.json().catch(() => null);
            if (data && typeof data.reply === "string") {
                reply = data.reply;
            } else if (data && typeof data.message === "string") {
                reply = data.message;
            }
        } catch (err) {
            console.error("SupportAI ChatBot network error:", err);
        } finally {
            if (typingBubble.parentNode) {
                typingBubble.remove();
            }
            addMessage(reply, "bot");
            isSending = false;
            sendBtn.disabled = false;
            input.focus();
        }
    }

    sendBtn.addEventListener("click", handleSend);
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });
})();
  