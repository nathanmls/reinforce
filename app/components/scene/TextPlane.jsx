'use client';

import { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';

/**
 * TextPlane - A component that creates a plane with text texture
 * This avoids the complexity and errors often encountered with drei's Text
 *
 * @param {Object} props
 * @param {Array} props.position - [x,y,z] position coordinates
 * @param {Array} props.rotation - [x,y,z] rotation in radians
 * @param {number|Array} props.scale - Scale factor(s)
 * @param {string} props.text - Legacy text to display (use textTitle/textSubtitle instead)
 * @param {string} props.textTitle - Title text to display
 * @param {string} props.textSubtitle - Subtitle text to display
 * @param {string} props.textColor - Color of the text
 * @param {string} props.backgroundColor - Background color (use rgba for transparency)
 * @param {number} props.width - Width of the plane
 * @param {number} props.height - Height of the plane
 * @param {number} props.fontSize - Base font size
 * @param {number} props.titleSize - Title font size (0 means use fontSize)
 * @param {number} props.subtitleSize - Subtitle font size (0 means use fontSize)
 * @param {string} props.fontFamily - Font family
 * @param {string} props.fontWeight - Font weight for title
 * @param {string} props.subtitleWeight - Font weight for subtitle
 * @param {number} props.borderRadius - Border radius as percentage (0-100) of smallest dimension
 * @param {string} props.borderColor - Color of the border
 * @param {number} props.borderWidth - Width of the border
 * @param {boolean} props.html - Legacy HTML support (use textTitle/textSubtitle instead)
 * @param {string} props.textAlign - Text alignment (left, center, right)
 * @param {number} props.padding - Padding as percentage (0-1) of dimensions
 * @param {boolean} props.responsive - Whether to adjust for mobile
 * @param {number} props.verticalOffset - Vertical position offset (-1 to 1)
 * @param {number} props.paragraphSpacing - Spacing between paragraphs as multiple of base font size
 */
export default function TextPlane({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  text = '', // Legacy prop, still supported for backward compatibility
  textTitle = '', // Title text
  textSubtitle = '', // Subtitle text
  textColor = '#ffffff',
  backgroundColor = 'rgba(0,0,0,0.5)',
  width = 2,
  height = 0.5,
  fontSize = 36, // Base font size
  titleSize = 0, // Title font size (0 means use fontSize)
  subtitleSize = 0, // Subtitle font size (0 means use fontSize)
  fontFamily = 'Arial, sans-serif',
  fontWeight = 'bold',
  subtitleWeight = '', // Subtitle font weight (empty means use fontWeight)
  borderRadius = 20, // Border radius as percentage (0-100) of smallest dimension
  borderColor = 'rgba(255,255,255,0.8)',
  borderWidth = 2,
  html = false, // Legacy HTML support
  textAlign = 'center',
  padding = 0.1,
  responsive = true,
  verticalOffset = 0, // Vertical position offset (positive moves up, negative moves down)
  paragraphSpacing = 0.5, // Spacing between paragraphs as multiple of base font size
}) {
  const meshRef = useRef();
  const [isMounted, setIsMounted] = useState(false);

  // Handle client-side only rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check if we're on mobile
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };
      
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  // Create a texture for the text
  const texture = useMemo(() => {
    if (!isMounted) return null;

    // Create a canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Adjust for high-DPI displays
    const pixelRatio = window.devicePixelRatio || 1;
    
    // Calculate canvas dimensions based on the plane dimensions
    // Use a higher resolution for better text quality
    const canvasWidth = Math.round(1024 * (width / Math.max(width, height)) * pixelRatio);
    const canvasHeight = Math.round(1024 * (height / Math.max(width, height)) * pixelRatio);

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Calculate padding in pixels
    const paddingX = canvasWidth * padding;
    const paddingY = canvasHeight * padding;

    // Calculate border radius in pixels
    const minDimension = Math.min(canvasWidth, canvasHeight);
    const radiusPixels = (borderRadius / 100) * minDimension;
    
    // Draw background with rounded corners
    ctx.fillStyle = backgroundColor;
    // Create rounded rectangle path for background
    roundRect(ctx, 0, 0, canvasWidth, canvasHeight, radiusPixels);
    ctx.fill();
    
    // Draw border if specified
    if (borderWidth > 0) {
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = borderWidth * pixelRatio;
      
      // Draw rounded rectangle for border (slightly smaller to account for border width)
      roundRect(ctx, borderWidth / 2, borderWidth / 2, 
                canvasWidth - borderWidth, canvasHeight - borderWidth, 
                radiusPixels);
      ctx.stroke();
    }

    // Set text properties
    ctx.fillStyle = textColor;
    
    // Determine which text rendering approach to use
    if (((textTitle && typeof textTitle === 'string') || 
         (textSubtitle && typeof textSubtitle === 'string')) && !html) {
      // Use the new title/subtitle approach
      const actualTitleSize = titleSize > 0 ? titleSize : fontSize;
      const actualSubtitleSize = subtitleSize > 0 ? subtitleSize : fontSize;
      const actualSubtitleWeight = subtitleWeight || fontWeight;
      
      renderTitleAndSubtitle(
        ctx, 
        textTitle, 
        textSubtitle, 
        canvasWidth, 
        canvasHeight, 
        actualTitleSize, 
        actualSubtitleSize,
        fontFamily,
        fontWeight,
        actualSubtitleWeight,
        paddingX,
        paddingY,
        textAlign,
        paragraphSpacing,
        verticalOffset
      );
    } else if (html && text && typeof text === 'string') {
      // Legacy HTML formatting approach
      renderFormattedText(ctx, text, canvasWidth, canvasHeight, fontSize, padding);
    } else {
      // Simple text rendering without formatting
      ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      // Find a valid string to render
      let textToRender = '';
      if (typeof text === 'string' && text) {
        textToRender = text;
      } else if (typeof textTitle === 'string' && textTitle) {
        textToRender = textTitle;
      } else if (typeof textSubtitle === 'string' && textSubtitle) {
        textToRender = textSubtitle;
      }
      
      if (textToRender) {
        drawTextWithWrapping(ctx, textToRender, paddingX, paddingY, canvasWidth - paddingX * 2, fontSize, textAlign);
      }
    }

    // Helper function to draw rounded rectangles
    function roundRect(ctx, x, y, width, height, radius) {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    }

    // Helper function to render title and subtitle
    function renderTitleAndSubtitle(
      ctx, 
      title, 
      subtitle, 
      canvasWidth, 
      canvasHeight, 
      titleSize, 
      subtitleSize,
      fontFamily,
      titleWeight,
      subtitleWeight,
      paddingX,
      paddingY,
      textAlign,
      paragraphSpacing,
      verticalOffset
    ) {
      // First, measure and calculate the heights
      let titleHeight = 0;
      let subtitleHeight = 0;
      let titleLines = [];
      let subtitleLines = [];
      
      // Process title if present
      if (title) {
        ctx.font = `${titleWeight} ${titleSize}px ${fontFamily}`;
        titleLines = wrapText(ctx, title, canvasWidth - paddingX * 2);
        titleHeight = titleLines.length * (titleSize * 1.2); // Line height factor
      }
      
      // Process subtitle if present
      if (subtitle) {
        ctx.font = `${subtitleWeight} ${subtitleSize}px ${fontFamily}`;
        subtitleLines = wrapText(ctx, subtitle, canvasWidth - paddingX * 2);
        subtitleHeight = subtitleLines.length * (subtitleSize * 1.2); // Line height factor
      }
      
      // Calculate total content height
      let totalContentHeight = titleHeight;
      if (titleHeight > 0 && subtitleHeight > 0) {
        totalContentHeight += paragraphSpacing * titleSize; // Add spacing between title and subtitle
      }
      totalContentHeight += subtitleHeight;
      
      // Calculate starting Y position to center all content vertically
      // Apply vertical offset (positive moves up, negative moves down)
      const verticalOffsetPixels = verticalOffset * canvasHeight;
      const startY = ((canvasHeight - totalContentHeight) / 2) - verticalOffsetPixels;
      
      let currentY = startY;
      
      // Draw title
      if (titleLines.length > 0) {
        ctx.font = `${titleWeight} ${titleSize}px ${fontFamily}`;
        ctx.textBaseline = 'top';
        
        titleLines.forEach(line => {
          // Calculate X position based on alignment
          let x;
          if (textAlign === 'center') {
            x = canvasWidth / 2;
            ctx.textAlign = 'center';
          } else if (textAlign === 'right') {
            x = canvasWidth - paddingX;
            ctx.textAlign = 'right';
          } else { // left
            x = paddingX;
            ctx.textAlign = 'left';
          }
          
          // Draw the line
          ctx.fillText(line, x, currentY);
          currentY += titleSize * 1.2; // Move to next line with 1.2x line height
        });
      }
      
      // Add spacing between title and subtitle if both exist
      if (titleLines.length > 0 && subtitleLines.length > 0) {
        currentY += paragraphSpacing * titleSize;
      }
      
      // Draw subtitle
      if (subtitleLines.length > 0) {
        ctx.font = `${subtitleWeight} ${subtitleSize}px ${fontFamily}`;
        ctx.textBaseline = 'top';
        
        subtitleLines.forEach(line => {
          // Calculate X position based on alignment
          let x;
          if (textAlign === 'center') {
            x = canvasWidth / 2;
            ctx.textAlign = 'center';
          } else if (textAlign === 'right') {
            x = canvasWidth - paddingX;
            ctx.textAlign = 'right';
          } else { // left
            x = paddingX;
            ctx.textAlign = 'left';
          }
          
          // Draw the line
          ctx.fillText(line, x, currentY);
          currentY += subtitleSize * 1.2; // Move to next line with 1.2x line height
        });
      }
    }
    
    // Helper function to wrap text into lines
    function wrapText(ctx, text, maxWidth) {
      // Handle null, undefined, or non-string values
      if (!text || typeof text !== 'string') {
        return [];
      }
      
      const words = text.split(' ');
      const lines = [];
      let currentLine = '';
      
      words.forEach(word => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const { width } = ctx.measureText(testLine);
        
        if (width <= maxWidth) {
          currentLine = testLine;
        } else {
          // If this is the first word and it's too long, force it on its own line
          if (!currentLine) {
            lines.push(word);
          } else {
            lines.push(currentLine);
            currentLine = word;
          }
        }
      });
      
      // Add the last line
      if (currentLine) {
        lines.push(currentLine);
      }
      
      return lines;
    }

    // Helper function to draw text with wrapping
    function drawTextWithWrapping(ctx, text, x, y, maxWidth, fontSize, align) {
      if (!text || typeof text !== 'string') return;
      
      const lines = wrapText(ctx, text, maxWidth);
      if (lines.length === 0) return;
      
      const lineHeight = fontSize * 1.2;
      
      // Calculate total height
      const totalHeight = lines.length * lineHeight;
      
      // Calculate starting Y position for vertical centering
      const startY = y + ((canvasHeight - totalHeight - y * 2) / 2);
      
      lines.forEach((line, index) => {
        // Calculate X position based on alignment
        let xPos;
        if (align === 'center') {
          xPos = canvasWidth / 2;
          ctx.textAlign = 'center';
        } else if (align === 'right') {
          xPos = canvasWidth - x;
          ctx.textAlign = 'right';
        } else { // left
          xPos = x;
          ctx.textAlign = 'left';
        }
        
        ctx.fillText(line, xPos, startY + index * lineHeight);
      });
    }

    // Simplified function to render formatted text with different font sizes
    function renderFormattedText(ctx, htmlText, canvasWidth, canvasHeight, baseFontSize, paddingPercent) {
      // Parse the HTML-like text to extract formatting tags
      const segments = parseHtmlText(htmlText);
      
      // Calculate padding in pixels
      const paddingX = canvasWidth * paddingPercent;
      const paddingY = canvasHeight * paddingPercent;
      
      // Available space for text
      const availableWidth = canvasWidth - (paddingX * 2);
      
      // Track line info
      let lines = [];
      let currentLine = { segments: [], width: 0, height: 0, y: 0 };
      
      // First pass: collect all segments into a single array, treating newlines as regular segments
      // This ensures we process all text as one unit for better centering
      let allSegments = [];
      
      segments.forEach(segment => {
        if (segment.isNewline) {
          // Add a special newline segment
          allSegments.push({
            ...segment,
            isNewline: true
          });
        } else {
          allSegments.push(segment);
        }
      });
      
      // Group segments into paragraphs
      let paragraphs = [];
      let currentParagraph = [];
      
      allSegments.forEach(segment => {
        if (segment.isNewline) {
          if (currentParagraph.length > 0) {
            paragraphs.push(currentParagraph);
            currentParagraph = [];
          }
        } else {
          currentParagraph.push(segment);
        }
      });
      
      // Add the last paragraph if not empty
      if (currentParagraph.length > 0) {
        paragraphs.push(currentParagraph);
      }
      
      // Calculate the total content height first to center everything properly
      let totalContentHeight = 0;
      let tempLines = [];
      
      // First pass - calculate total height without rendering
      paragraphs.forEach(paragraph => {
        // Reset for new paragraph
        let lineSegments = [];
        let lineWidth = 0;
        let maxFontSize = 0;
        
        // Process each segment in the paragraph
        paragraph.forEach(segment => {
          // Set font for measurement
          const fontSize = segment.fontSize || baseFontSize;
          const segmentFontWeight = segment.fontWeight || fontWeight;
          ctx.font = `${segmentFontWeight} ${fontSize}px ${fontFamily}`;
          
          // Track max font size for line height calculation
          maxFontSize = Math.max(maxFontSize, fontSize);
          
          // Split text into words
          const words = segment.text.split(' ');
          let currentWordIndex = 0;
          
          while (currentWordIndex < words.length) {
            // Start with an empty segment for this line
            let lineText = '';
            let lineTextWidth = 0;
            
            // Add words until we exceed width or run out of words
            while (currentWordIndex < words.length) {
              const word = words[currentWordIndex];
              // Use a smaller space for better text appearance
              const wordWithSpace = lineText.length > 0 ? ' ' + word : word;
              // Don't reduce width for better text alignment
              const testWidth = ctx.measureText(lineText + wordWithSpace).width;
              
              if (lineWidth + testWidth <= availableWidth || lineText === '') {
                lineText += wordWithSpace;
                lineTextWidth = testWidth;
                currentWordIndex++;
              } else {
                break;
              }
            }
            
            // Add this segment to the current line
            if (lineText.trim() !== '') {
              lineSegments.push({
                text: lineText,
                fontSize,
                fontWeight: segmentFontWeight
              });
              lineWidth += lineTextWidth;
            }
            
            // If we have more words, start a new line
            if (currentWordIndex < words.length) {
              // Add the current line to temp lines array
              if (lineSegments.length > 0) {
                tempLines.push({
                  segments: lineSegments,
                  height: maxFontSize * 1.2,
                  width: lineWidth
                });
                
                // Track total height
                totalContentHeight += maxFontSize * 1.2;
                
                // Reset for next line
                lineSegments = [];
                lineWidth = 0;
              }
            }
          }
        });
        
        // Add the last line of this paragraph if not empty
        if (lineSegments.length > 0) {
          tempLines.push({
            segments: lineSegments,
            height: maxFontSize * 1.2,
            width: lineWidth
          });
          totalContentHeight += maxFontSize * 1.2;
        }
        
        // Add paragraph spacing using the custom spacing value
        totalContentHeight += baseFontSize * paragraphSpacing;
      });
      
      // Calculate the starting Y position to center all content
      // Add extra padding at the top to ensure proper vertical centering
      // Apply vertical offset (positive moves up, negative moves down)
      const startY = (canvasHeight - totalContentHeight) / 2 + paddingY - (verticalOffset * canvasHeight);
      let positionY = startY;
      
      // Second pass - actually create the lines with proper Y positions
      tempLines.forEach((tempLine, index) => {
        lines.push({
          segments: tempLine.segments,
          height: tempLine.height,
          width: tempLine.width,
          y: positionY + tempLine.height / 2
        });
        
        // Move to next line
        positionY += tempLine.height;
        
        // Add paragraph spacing after paragraphs
        // Check if this is the last line of a paragraph by looking at the next line
        if (index < tempLines.length - 1 && 
            tempLines[index + 1].segments[0]?.fontSize !== tempLine.segments[0]?.fontSize) {
          // Use the custom paragraph spacing value
          positionY += baseFontSize * paragraphSpacing;
        }
      });
      
      // No need for additional vertical offset since we've already calculated
      // the proper starting position to center all content
      
      // Draw each line
      lines.forEach(line => {
        // Calculate starting X position based on text alignment
        let currentX;
        if (textAlign === 'center') {
          currentX = canvasWidth / 2 - line.width / 2;
        } else if (textAlign === 'right') {
          currentX = canvasWidth - paddingX - line.width;
        } else { // left
          currentX = paddingX;
        }
        
        // Draw each segment in the line
        // Force text alignment to be centered for all segments
        ctx.textAlign = 'center';
        
        if (textAlign === 'center') {
          // For centered text, draw each segment centered
          let segmentX = canvasWidth / 2;
          line.segments.forEach(segment => {
            ctx.font = `${segment.fontWeight} ${segment.fontSize}px ${fontFamily}`;
            ctx.fillStyle = textColor;
            ctx.fillText(segment.text, segmentX, line.y);
          });
        } else {
          // For left/right aligned text, draw segments sequentially
          line.segments.forEach(segment => {
            ctx.font = `${segment.fontWeight} ${segment.fontSize}px ${fontFamily}`;
            ctx.fillStyle = textColor;
            ctx.fillText(segment.text, currentX, line.y);
            currentX += ctx.measureText(segment.text).width;
          });
        }
      });
    }
    
    // Simplified function to parse HTML-like text into segments with formatting
    function parseHtmlText(htmlText) {
      const segments = [];
      
      // Handle actual newlines in the text - be more strict about newlines
      // to prevent unintended paragraph breaks
      const paragraphs = htmlText.split(/\n\n+/);
      paragraphs.forEach((paragraph, paragraphIndex) => {
        if (paragraphIndex > 0) {
          // Add a newline segment between paragraphs
          segments.push({ text: '\n', isNewline: true });
        }
        
        if (paragraph.trim() === '') return;
        
        // Regular expression to match <span style="...">text</span> patterns
        const spanRegex = /<span\s+style="([^"]*)">([^<]*)<\/span>/g;
        
        let match;
        let lastIndex = 0;
        
        while ((match = spanRegex.exec(paragraph)) !== null) {
          // Add text before the match as a regular segment
          if (match.index > lastIndex) {
            const beforeText = paragraph.substring(lastIndex, match.index);
            if (beforeText.trim() !== '') {
              segments.push({ text: beforeText.trim() });
            }
          }
          
          // Extract style attributes and text
          const styleAttr = match[1];
          const spanText = match[2];
          
          // Parse style attributes
          const fontSize = extractStyleValue(styleAttr, 'font-size');
          const fontWeight = extractStyleValue(styleAttr, 'font-weight');
          
          // Add the styled segment
          if (spanText.trim() !== '') {
            segments.push({
              text: spanText.trim(),
              fontSize: fontSize ? parseInt(fontSize) : null,
              fontWeight: fontWeight || null
            });
          }
          
          lastIndex = match.index + match[0].length;
        }
        
        // Add any remaining text after the last match
        if (lastIndex < paragraph.length) {
          const remainingText = paragraph.substring(lastIndex);
          if (remainingText.trim() !== '') {
            segments.push({ text: remainingText.trim() });
          }
        }
      });
      
      // If no segments were found, return the entire text as one segment
      if (segments.length === 0) {
        segments.push({ text: htmlText });
      }
      
      return segments;
    }
    
    // Helper function to extract style values
    function extractStyleValue(styleAttr, property) {
      const regex = new RegExp(property + '\\s*:\\s*([^;]+)');
      const match = styleAttr.match(regex);
      return match ? match[1].trim() : null;
    }
    
    // Helper function to get x-coordinate based on alignment
    function getAlignedX(align, canvasWidth, text) {
      switch (align) {
        case 'left':
          return padding * canvasWidth;
        case 'right':
          return canvasWidth - (padding * canvasWidth);
        case 'center':
        default:
          return canvasWidth / 2;
      }
    }
    
    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    
    return texture;
  }, [
    isMounted,
    text,
    textTitle,
    textSubtitle,
    textColor,
    backgroundColor,
    fontSize,
    titleSize,
    subtitleSize,
    fontFamily,
    fontWeight,
    subtitleWeight,
    html,
    textAlign,
    padding,
    width,
    height,
    borderRadius,
    borderColor,
    borderWidth,
    isMobile,
    responsive,
    verticalOffset,
    paragraphSpacing,
  ]);

  // Apply texture to mesh material when it changes
  useEffect(() => {
    if (texture && meshRef.current && meshRef.current.material) {
      meshRef.current.material.map = texture;
      meshRef.current.material.transparent = true;
      meshRef.current.material.needsUpdate = true;
      
      return () => {
        if (texture) texture.dispose();
      };
    }
  }, [texture]);
  
  // Don't render on server
  if (!isMounted) return null;

  // Adjust width for mobile if responsive is enabled
  let adjustedWidth = width;
  if (responsive && isMobile) {
    adjustedWidth = width * 0.7; // Make narrower on mobile for better fit
  }

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
      scale={typeof scale === 'number' ? [scale, scale, scale] : scale}
    >
      <planeGeometry args={[adjustedWidth, height]} />
      <meshBasicMaterial transparent={true} />
    </mesh>
  );
}
