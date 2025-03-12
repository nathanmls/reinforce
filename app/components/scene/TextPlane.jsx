'use client';

import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

/**
 * TextPlane - A simple component that creates a plane with text texture
 * This avoids the complexity and errors often encountered with drei's Text
 * 
 * @param {Object} props
 * @param {Array} props.position - [x,y,z] position coordinates
 * @param {Array} props.rotation - [x,y,z] rotation in radians
 * @param {number|Array} props.scale - Scale factor(s)
 * @param {string|Array} props.text - Text to display, can be a string or array of strings for multi-line
 * @param {string} props.textColor - Color of the text
 * @param {string} props.backgroundColor - Background color (use rgba for transparency)
 * @param {number} props.width - Width of the plane
 * @param {number} props.height - Height of the plane
 * @param {number} props.borderRadius - Border radius for rounded corners
 * @param {string} props.borderColor - Color of the border
 * @param {number} props.borderWidth - Width of the border
 */
export default function TextPlane({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  text = "Text",
  textColor = "#ffffff",
  backgroundColor = "rgba(0,0,0,0.5)",
  width = 2,
  height = 0.5,
  fontSize = 36,
  fontFamily = "Arial, sans-serif",
  fontWeight = "bold",
  borderRadius = 20, // Now as a percentage (0-100) of the smallest dimension
  borderColor = "rgba(255,255,255,0.8)",
  borderWidth = 2
}) {
  const meshRef = useRef();
  const [isMounted, setIsMounted] = useState(false);
  
  // Handle client-side only rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Create and update the text texture
  useEffect(() => {
    if (!isMounted || !meshRef.current) return;
    
    // Create canvas for text rendering
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    // Set canvas size (higher resolution for better quality)
    // Calculate canvas dimensions based on the aspect ratio of the plane
    const aspectRatio = width / height;
    const baseResolution = 1024; // Base resolution for the longer dimension
    
    if (aspectRatio >= 1) {
      // Width is greater than or equal to height
      canvas.width = baseResolution;
      canvas.height = Math.round(baseResolution / aspectRatio);
    } else {
      // Height is greater than width
      canvas.height = baseResolution;
      canvas.width = Math.round(baseResolution * aspectRatio);
    }
    
    // Clear canvas with transparent background first
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate border radius in canvas coordinates as a percentage of the smaller dimension
    // This ensures consistent rounded corners regardless of aspect ratio
    const smallerDimension = Math.min(canvas.width, canvas.height);
    const cornerRadius = smallerDimension * (borderRadius / 100);
    
    // Draw rounded rectangle background using a more reliable method
    roundRect(context, 0, 0, canvas.width, canvas.height, cornerRadius);
    
    // Helper function to draw rounded rectangles
    function roundRect(ctx, x, y, width, height, radius) {
      if (width < 2 * radius) radius = width / 2;
      if (height < 2 * radius) radius = height / 2;
      
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.arcTo(x + width, y, x + width, y + height, radius);
      ctx.arcTo(x + width, y + height, x, y + height, radius);
      ctx.arcTo(x, y + height, x, y, radius);
      ctx.arcTo(x, y, x + width, y, radius);
      ctx.closePath();
    }
    
    // Fill with background color
    context.fillStyle = backgroundColor;
    context.fill();
    
    // Add border if borderWidth > 0
    if (borderWidth > 0) {
      context.strokeStyle = borderColor;
      context.lineWidth = borderWidth;
      context.stroke();
    }
    
    // Configure text style (font will be set with responsive size later)
    context.fillStyle = textColor;
    // textAlign will be set per line based on alignment
    context.textBaseline = 'middle';
    
    // Add a subtle shadow for better readability
    context.shadowColor = 'rgba(0,0,0,0.5)';
    context.shadowBlur = 8;
    context.shadowOffsetX = 2;
    context.shadowOffsetY = 2;
    
    // Calculate responsive font size based on canvas dimensions
    // This ensures text scales properly with different aspect ratios
    const responsiveFontSize = Math.min(canvas.width, canvas.height) * (fontSize / 500);
    
    // Draw text - handle multiple lines with alignment
    // Convert text to array of lines if it's a string
    const lineHeight = responsiveFontSize * 1.2; // 1.2 is a standard line height multiplier
    
    // Normalize the text format to handle both string and object formats
    const normalizedLines = Array.isArray(text) ? text : [text];
    const formattedLines = normalizedLines.map(line => {
      if (typeof line === 'string') {
        return { text: line, align: 'center' };
      }
      return line;
    });
    
    // Calculate text wrapping based on canvas width
    const maxTextWidth = canvas.width * 0.85; // Leave some margin
    const wrappedLines = [];
    
    // Configure text style with responsive font size
    context.font = `${fontWeight} ${responsiveFontSize}px ${fontFamily}`;
    
    // Process each line and apply text wrapping if needed
    formattedLines.forEach(line => {
      const words = line.text.split(' ');
      let currentLine = '';
      
      // Log the line object to debug
      console.log('Processing line:', line);
      
      words.forEach(word => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const metrics = context.measureText(testLine);
        
        if (metrics.width > maxTextWidth && currentLine) {
          // Make sure to preserve all properties from the original line
          wrappedLines.push({ 
            text: currentLine, 
            align: line.align,
            speaker: line.speaker,
            speakerColor: line.speakerColor,
            backgroundColor: line.backgroundColor
          });
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      });
      
      if (currentLine) {
        // Make sure to preserve all properties from the original line
        wrappedLines.push({ 
          text: currentLine, 
          align: line.align,
          speaker: line.speaker,
          speakerColor: line.speakerColor,
          backgroundColor: line.backgroundColor
        });
      }
    });
    
    // Log the wrapped lines to debug
    console.log('Wrapped lines:', wrappedLines);
    
    // Draw the wrapped lines with message bubbles and spacing
    if (wrappedLines.length === 1) {
      // Single line - ensure proper alignment even for single messages
      const line = wrappedLines[0];
      const alignedX = getAlignedX(line.align, canvas.width, line.text);
      drawMessageBubble(line, alignedX, canvas.height / 2);
    } else {
      // Multiple lines - calculate vertical positioning with spacing between messages
      // Group messages by speaker for bubble rendering
      const messageGroups = [];
      let currentGroup = [];
      let currentSpeaker = null;
      
      wrappedLines.forEach(line => {
        if (line.speaker !== currentSpeaker && currentGroup.length > 0) {
          messageGroups.push(currentGroup);
          currentGroup = [line];
          currentSpeaker = line.speaker;
        } else {
          currentGroup.push(line);
          currentSpeaker = line.speaker;
        }
      });
      
      // Add the last group
      if (currentGroup.length > 0) {
        messageGroups.push(currentGroup);
      }
      
      // Calculate total height with spacing between message groups
      // Add extra space for speaker names above bubbles
      const speakerNameHeight = responsiveFontSize * 1.0; // Height for speaker name
      const messageSpacing = lineHeight * 1.2; // Space between different speakers' messages (increased)
      const totalMessageGroupHeight = messageGroups.reduce((total, group) => {
        return total + (group.length * lineHeight) + messageSpacing + speakerNameHeight;
      }, 0) - messageSpacing; // Subtract the last spacing
      
      let currentY = (canvas.height - totalMessageGroupHeight) / 2;
      
      // Draw each message group
      messageGroups.forEach(group => {
        const groupHeight = group.length * lineHeight;
        
        // Draw each line in the group
        group.forEach((line, lineIndex) => {
          const y = currentY + (lineIndex * lineHeight);
          
          // Mark the first line in each group to show the speaker name
          const lineWithSpeaker = {
            ...line,
            showSpeaker: lineIndex === 0 // Only show speaker for first message in group
          };
          
          drawMessageBubble(lineWithSpeaker, getAlignedX(line.align, canvas.width, line.text), y);
        });
        
        // Move to the next group with spacing (including space for speaker name)
        currentY += groupHeight + messageSpacing + (responsiveFontSize * 0.8);
      });
    }
    
    // Helper function to draw a message bubble with background color and speaker name above
    function drawMessageBubble(line, x, y) {
      // Calculate text dimensions
      const metrics = context.measureText(line.text);
      const textWidth = metrics.width;
      
      // Adjust bubble dimensions for better appearance
      const bubblePadding = responsiveFontSize * 0.7; // Increased padding
      const bubbleWidth = textWidth + (bubblePadding * 2);
      const bubbleHeight = lineHeight + bubblePadding; // Increased height
      const bubbleRadius = Math.min(bubbleHeight / 3, responsiveFontSize * 0.5); // Capped radius
      
      // Calculate bubble position based on alignment
      let bubbleX;
      if (line.align === 'left') {
        // Left align - position from left edge
        bubbleX = responsiveFontSize; // Fixed distance from left edge
      } else if (line.align === 'right') {
        // Right align - position from right edge
        bubbleX = canvas.width - bubbleWidth - responsiveFontSize; // Fixed distance from right edge
      } else { // center
        bubbleX = (canvas.width - bubbleWidth) / 2;
      }
      
      // Center the bubble vertically at the given y position
      const bubbleY = y - (bubbleHeight / 2);
      
      // Save current context state
      context.save();
      
      // Draw speaker name above the bubble with specified color
      // Only show speaker for the first message in a group
      if (line.speaker && line.showSpeaker) {
        // Set font for speaker name (bold)
        const originalFont = context.font;
        context.font = `bold ${responsiveFontSize * 0.8}px ${fontFamily}`;
        
        // Calculate speaker name position (above the bubble)
        const speakerY = bubbleY - (responsiveFontSize * 0.6);
        
        // Position speaker name based on alignment
        let speakerX;
        if (line.align === 'left') {
          speakerX = bubbleX + (bubblePadding * 0.5); // Slightly indented from bubble edge
          context.textAlign = 'left';
        } else if (line.align === 'right') {
          speakerX = bubbleX + bubbleWidth - (bubblePadding * 0.5); // Aligned to right edge of bubble
          context.textAlign = 'right';
        } else {
          speakerX = bubbleX + (bubbleWidth / 2); // Centered above bubble
          context.textAlign = 'center';
        }
        
        // Set speaker name color
        context.fillStyle = line.speakerColor || '#000000';
        
        // Draw speaker name
        context.fillText(line.speaker, speakerX, speakerY);
        
        // Restore original font
        context.font = originalFont;
      }
      
      // Draw bubble background
      context.beginPath();
      context.roundRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, bubbleRadius);
      context.fillStyle = line.backgroundColor || backgroundColor;
      context.fill();
      
      // Draw message text with proper alignment
      context.fillStyle = textColor;
      
      // Set text position within bubble
      let textX;
      if (line.align === 'left') {
        textX = bubbleX + bubblePadding; // Left-aligned text
        context.textAlign = 'left';
      } else if (line.align === 'right') {
        textX = bubbleX + bubbleWidth - bubblePadding; // Right-aligned text
        context.textAlign = 'right';
      } else {
        textX = bubbleX + (bubbleWidth / 2); // Centered text
        context.textAlign = 'center';
      }
      
      // Ensure text is vertically centered within the bubble
      const textY = bubbleY + (bubbleHeight / 2);
      context.fillText(line.text, textX, textY);
      
      // Restore context state
      context.restore();
    }
    
    // Helper function to get x-coordinate based on alignment
    // This is now only used for initial positioning, actual bubble placement is handled in drawMessageBubble
    function getAlignedX(align, canvasWidth, text) {
      // For message bubbles, we'll use a fixed position based on the canvas width
      // This ensures consistent positioning regardless of text length
      const padding = responsiveFontSize * 1.2; // Increased padding for better appearance
      
      switch(align) {
        case 'left': 
          // For left alignment, use a fixed position from left edge
          return padding * 2;
        case 'right': 
          // For right alignment, use a fixed position from right edge
          return canvasWidth - (padding * 2);
        case 'center':
        default: 
          // Center alignment
          return canvasWidth / 2;
      }
    }
    
    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    
    // Apply texture to mesh material
    if (meshRef.current.material) {
      meshRef.current.material.map = texture;
      meshRef.current.material.transparent = true;
      meshRef.current.material.needsUpdate = true;
    }
    
    // Clean up
    return () => {
      if (texture) texture.dispose();
    };
  }, [isMounted, text, textColor, backgroundColor, fontSize, fontFamily, fontWeight]);
  
  // Don't render on server
  if (!isMounted) return null;
  
  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
      scale={typeof scale === 'number' ? [scale, scale, scale] : scale}
    >
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial transparent={true} />
    </mesh>
  );
}
