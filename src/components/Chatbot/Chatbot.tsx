import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, X, Send } from 'lucide-react'
import { getBotResponse, bakeryInfo } from './chatbotRules'
import './chatbot.css'

interface ChatMessage {
  id: number
  sender: 'bot' | 'user'
  text: string
  quickReplies?: string[]
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 0,
  sender: 'bot',
  text: 'Hi! 👋 Welcome to Avyan Bakehouse. How can we help you?',
  quickReplies: ['Menu', 'Opening Hours', 'Order Now', 'Contact Us'],
}

const TYPING_DELAY = 700

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const idRef = useRef(1)
  const navigate = useNavigate()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleToggle = () => {
    setIsOpen((prev) => {
      if (!prev && messages.length === 0) {
        setMessages([WELCOME_MESSAGE])
      }
      return !prev
    })
  }

  const scrollToContact = () => {
    if (window.location.pathname === '/') {
      const el = document.querySelector(bakeryInfo.contactSection)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
        return
      }
    }
    navigate('/' + bakeryInfo.contactSection)
  }

  const sendMessage = (raw?: string) => {
    const text = (raw ?? input).trim()
    if (!text || isTyping) return

    const userMessage: ChatMessage = { id: idRef.current++, sender: 'user', text }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    window.setTimeout(() => {
      const reply = getBotResponse(text)
      const botMessage: ChatMessage = {
        id: idRef.current++,
        sender: 'bot',
        text: reply.text,
        quickReplies: reply.quickReplies,
      }
      setMessages((prev) => [...prev, botMessage])
      setIsTyping(false)
    }, TYPING_DELAY)
  }

  const handleQuickReply = (reply: string) => {
    switch (reply) {
      case 'View Menu':
      case 'Order Now':
        navigate(bakeryInfo.menuRoute)
        break
      case 'Contact Us':
        scrollToContact()
        break
      default:
        sendMessage(reply)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage()
  }

  return (
    <div className="chatbot">
      {isOpen && (
        <div className="chatbot__window" role="dialog" aria-label="Avyan Bakehouse chat">
          <header className="chatbot__header">
            <div className="chatbot__header-icon">
              <MessageCircle size={20} className='chatbot-icon' />
            </div>
            <div className="chatbot__header-text">
              <h3>Avyan Bakehouse</h3>
              <p>How can we help?</p>
            </div>
            <button
              className="chatbot__close"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </header>

          <div className="chatbot__messages">
            {messages.map((m) => (
              <div key={m.id} className={`chatbot__msg chatbot__msg--${m.sender}`}>
                <p>{m.text}</p>
                {m.quickReplies && (
                  <div className="chatbot__quick">
                    {m.quickReplies.map((q) => (
                      <button
                        key={q}
                        className="chatbot__quick-btn"
                        onClick={() => handleQuickReply(q)}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="chatbot__msg chatbot__msg--bot">
                <p className="chatbot__typing">
                  Avyan is typing
                  <span className="chatbot__dots">
                    <i></i>
                    <i></i>
                    <i></i>
                  </span>
                </p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chatbot__input" onSubmit={handleSubmit}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              aria-label="Type your message"
            />
            <button type="submit" aria-label="Send message" disabled={!input.trim()}>
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      <button
        className="chatbot__toggle"
        onClick={handleToggle}
        aria-label={isOpen ? 'Close chatbot' : 'Open chatbot'}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  )
}
