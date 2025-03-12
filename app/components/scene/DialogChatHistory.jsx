'use client';

import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import TextPlane from './TextPlane';
import PropTypes from 'prop-types';

/**
 * DialogChatHistory - A component that displays a chat history with a typewriter animation effect
 * 
 * @param {Object} props
 * @param {Array} props.position - [x,y,z] position coordinates
 * @param {Array} props.rotation - [x,y,z] rotation in radians
 * @param {number|Array} props.scale - Scale factor(s)
 * @param {Array} props.dialogHistory - Array of dialog messages to display
 * @param {number} props.typingSpeed - Speed of the typing animation (characters per second)
 * @param {number} props.delayBetweenMessages - Delay between messages in milliseconds
 */
export default function DialogChatHistory({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  dialogHistory = [
    { speaker: "You", message: "Hello Tia! How are you today?" },
    { speaker: "Tia", message: "I'm doing great! How can I help you with your learning journey?" },
    { speaker: "You", message: "I'm interested in learning more about AI." },
    { speaker: "Tia", message: "That's wonderful! AI is a fascinating field with many applications." }
  ],
  typingSpeed = 20, // characters per second
  delayBetweenMessages = 1000, // milliseconds
  width = 3,
  height = 1.5,
  backgroundColor = "rgba(10,10,10,1)",
  borderColor = "rgba(138,43,226,0.8)",
  onSendMessage = null // Callback for when user sends a message
}) {
  const [currentDialogIndex, setCurrentDialogIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [completedMessages, setCompletedMessages] = useState([]);
  const timeRef = useRef(0);
  const messageDelayRef = useRef(0);
  
  // Format the current message with speaker and alignment
  const getCurrentMessage = () => {
    if (currentDialogIndex >= dialogHistory.length) return "";
    const { speaker, message } = dialogHistory[currentDialogIndex];
    // Return the message without the speaker prefix in the text
    return { 
      text: message, 
      speaker,
      speakerColor: speaker === 'You' ? '#0000FF' : '#8A2BE2' // Blue for You, Purple for Tia
    };
  };
  
  // Format all messages for display
  const getFormattedMessages = () => {
    const messages = [...completedMessages];
    if (displayedText) {
      messages.push(displayedText);
    }
    return messages;
  };
  
  // Handle the typing animation
  useFrame((state, delta) => {
    if (currentDialogIndex >= dialogHistory.length) return;
    
    if (isTyping) {
      timeRef.current += delta;
      const messageObj = getCurrentMessage();
      const fullText = messageObj.text;
      const charactersToShow = Math.floor(timeRef.current * typingSpeed);
      
      if (charactersToShow < fullText.length) {
        setDisplayedText({ 
          text: fullText.substring(0, charactersToShow), 
          speaker: messageObj.speaker,
          speakerColor: messageObj.speakerColor,
          align: messageObj.speaker === 'You' ? 'right' : 'left' // Set proper alignment during typing
        });
      } else {
        // Message is complete
        setDisplayedText({
          ...messageObj,
          align: messageObj.speaker === 'You' ? 'right' : 'left' // Ensure proper alignment when complete
        });
        setIsTyping(false);
        messageDelayRef.current = 0;
      }
    } else {
      // Wait before showing the next message
      messageDelayRef.current += delta * 1000; // convert to milliseconds
      if (messageDelayRef.current >= delayBetweenMessages) {
        // Move to next message
        setCompletedMessages(prev => [...prev, displayedText]);
        setDisplayedText("");
        setCurrentDialogIndex(prev => prev + 1);
        setIsTyping(true);
        timeRef.current = 0;
      }
    }
  });
  
  // Format messages with alignment based on speaker and add background color info
  const visibleMessages = () => {
    const messages = getFormattedMessages();
    // Adjust this number based on your text plane size and font size
    const maxVisibleMessages = 4;
    const lastMessages = messages.slice(-maxVisibleMessages);
    
    // Format messages with alignment, speaker info, and background color
    return lastMessages.map(msg => {
      if (typeof msg === 'string') {
        // Handle legacy string format for backward compatibility
        const speaker = msg.startsWith('You:') ? 'You' : 'Tia';
        const text = msg.substring(msg.indexOf(':') + 1).trim(); // Remove speaker prefix
        return { 
          text: text, 
          align: speaker === 'You' ? 'right' : 'left',
          speaker: speaker,
          backgroundColor: speaker === 'You' ? 'rgba(138,43,226,0.3)' : 'rgba(70,130,180,0.3)',
          speakerColor: speaker === 'You' ? '#0000FF' : '#8A2BE2' // Blue for You, Purple for Tia
        };
      } else {
        // Handle new object format with speaker info
        const speaker = msg.speaker;
        return { 
          text: msg.text, 
          align: speaker === 'You' ? 'right' : 'left',
          speaker: speaker,
          backgroundColor: speaker === 'You' ? 'rgba(138,43,226,0.3)' : 'rgba(70,130,180,0.3)',
          speakerColor: speaker === 'You' ? '#0000FF' : '#8A2BE2' // Blue for You, Purple for Tia
        };
      }
    });
  };
  
  // Add a new message to the chat
  const addMessage = (newMessage) => {
    // Add the message to the completed messages
    setCompletedMessages(prev => [
      ...prev, 
      {
        text: newMessage.message,
        speaker: newMessage.speaker,
        align: newMessage.speaker === 'You' ? 'right' : 'left',
        backgroundColor: newMessage.speaker === 'You' ? 'rgba(138,43,226,0.3)' : 'rgba(70,130,180,0.3)',
        speakerColor: newMessage.speaker === 'You' ? '#0000FF' : '#8A2BE2'
      }
    ]);
  };
  
  // Expose the addMessage function through the onSendMessage prop
  useEffect(() => {
    if (onSendMessage) {
      onSendMessage.current = addMessage;
    }
  }, [onSendMessage]);
  
  return (
    <TextPlane
      position={position}
      rotation={rotation}
      scale={scale}
      text={visibleMessages()}
      textColor="#000000"
      backgroundColor={backgroundColor}
      width={width}
      height={height}
      fontSize={20}
      fontFamily="Open Sans, sans-serif"
      fontWeight="normal"
      borderRadius={10}
      borderColor={borderColor}
      borderWidth={0}
    />
  );
}

DialogChatHistory.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number),
  rotation: PropTypes.arrayOf(PropTypes.number),
  scale: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.arrayOf(PropTypes.number)
  ]),
  dialogHistory: PropTypes.arrayOf(
    PropTypes.shape({
      speaker: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired
    })
  ),
  typingSpeed: PropTypes.number,
  delayBetweenMessages: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
  backgroundColor: PropTypes.string,
  borderColor: PropTypes.string
};
