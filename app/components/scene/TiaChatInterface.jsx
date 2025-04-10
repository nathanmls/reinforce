/**
 * TiaChatInterface Component
 *
 * A chat interface for interacting with Tia, the virtual mentor character.
 * Features a typewriter effect for displaying messages and handles user input.
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './TiaChatInterface.module.css';

/**
 * TiaChatInterface Component
 *
 * Renders a chat interface for interacting with Tia, including:
 * - Message history display with typewriter animation effect
 * - Input field for user messages
 * - Auto-scrolling to latest messages
 *
 * @param {Object} props Component props
 * @param {Array} props.messages Array of message objects with role and message properties
 * @param {Function} props.onSendMessage Callback function when user sends a message
 * @param {number} props.typingSpeed Speed of the typewriter effect in milliseconds per character
 * @returns {JSX.Element} The rendered chat interface
 */
const TiaChatInterface = ({
  messages = [],
  onSendMessage,
  typingSpeed = 30,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [typingText, setTypingText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedMessages, setDisplayedMessages] = useState([]);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Handle input change
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage({
        role: 'user',
        message: inputValue.trim(),
      });
      setInputValue('');
    }
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Process new messages and handle typewriter effect
  useEffect(() => {
    // If we have new messages that haven't been displayed yet
    if (messages.length > currentMessageIndex) {
      const nextMessage = messages[currentMessageIndex];

      // If it's a tentative message (like "Thinking..."), show it immediately
      if (nextMessage.tentative) {
        setDisplayedMessages((prev) => [
          ...prev,
          { ...nextMessage, fullyTyped: true },
        ]);
        setCurrentMessageIndex(currentMessageIndex + 1);
        return;
      }

      // Start typing animation for non-tentative messages
      setIsTyping(true);
      setTypingText('');

      // Clear any existing typing animation
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Recursive function to type out the message character by character
      const typeMessage = (message, index = 0) => {
        if (index <= message.length) {
          setTypingText(message.substring(0, index));

          typingTimeoutRef.current = setTimeout(() => {
            typeMessage(message, index + 1);
          }, typingSpeed);
        } else {
          // Typing complete
          setIsTyping(false);
          setTypingText('');

          // Add the fully typed message to displayed messages
          setDisplayedMessages((prev) => [
            ...prev.filter((m) => !m.tentative), // Remove any tentative messages
            { ...nextMessage, fullyTyped: true },
          ]);

          // Move to the next message
          setCurrentMessageIndex(currentMessageIndex + 1);
        }
      };

      // Start typing the message
      typeMessage(nextMessage.message);
    }

    // Cleanup typing animation on unmount
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [messages, currentMessageIndex, typingSpeed]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [displayedMessages, typingText]);

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <h3>Chat with Tia</h3>
      </div>

      <div className={styles.messagesContainer}>
        {/* Render displayed messages */}
        {displayedMessages.map((msg, index) => (
          <div
            key={`${msg.role}-${index}`}
            className={`${styles.messageItem} ${
              msg.role === 'user' ? styles.userMessage : styles.aiMessage
            }`}
          >
            <div className={styles.messageBubble}>
              <div className={styles.messageContent}>{msg.message}</div>
            </div>
            <div className={styles.messageSender}>
              {msg.role === 'user' ? 'You' : 'Tia'}
            </div>
          </div>
        ))}

        {/* Render currently typing message */}
        {isTyping && (
          <div className={`${styles.messageItem} ${styles.aiMessage}`}>
            <div className={styles.messageBubble}>
              <div className={styles.messageContent}>
                {typingText}
                <span className={styles.typingCursor}></span>
              </div>
            </div>
            <div className={styles.messageSender}>Tia</div>
          </div>
        )}

        {/* Show typing indicator for tentative messages */}
        {messages.some((m) => m.tentative && !displayedMessages.includes(m)) &&
          !isTyping && (
            <div className={`${styles.messageItem} ${styles.aiMessage}`}>
              <div className={styles.messageBubble}>
                <div className={styles.typingIndicator}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

        {/* Invisible element to scroll to */}
        <div ref={messagesEndRef} />
      </div>

      <form className={styles.inputForm} onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Type your message...?"
          className={styles.messageInput}
        />
        <button type="submit" className={styles.sendButton}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22 2L11 13"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M22 2L15 22L11 13L2 9L22 2Z"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default TiaChatInterface;
