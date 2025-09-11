import React, { useState, useEffect } from 'react';
import './Message.css';

const Message = ({ type, text, duration = 4000, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show message
    setTimeout(() => setIsVisible(true), 100);
    
    // Auto hide
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

  const getIcon = () => type === 'success' ? '✓' : '✕';

  return (
    <div className="message-container">
      <div className={`message ${type} ${isVisible ? 'show' : ''}`}>
        <span className="message-icon">{getIcon()}</span>
        <span>{text}</span>
        <button className="message-close" onClick={handleClose}>✕</button>
      </div>
    </div>
  );
};

// Simple hook for easy usage
export const useMessage = () => {
  const [messages, setMessages] = useState([]);

  const showSuccess = (text) => {
    const id = Date.now();
    setMessages(prev => [...prev, { id, type: 'success', text }]);
  };

  const showError = (text) => {
    const id = Date.now();
    setMessages(prev => [...prev, { id, type: 'error', text }]);
  };

  const hideMessage = (id) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  };

  const MessageContainer = () => (
    <>
      {messages.map(message => (
        <Message
          key={message.id}
          type={message.type}
          text={message.text}
          onClose={() => hideMessage(message.id)}
        />
      ))}
    </>
  );

  return { showSuccess, showError, MessageContainer };
};

export default Message;
