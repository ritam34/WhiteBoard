import { useState, useEffect, useRef } from 'react';

function TextTool({ isActive, position, onComplete, initialText = '', fontSize = 20, color = '#000000' }) {
  const [text, setText] = useState(initialText);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isActive]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleComplete();
    } else if (e.key === 'Escape') {
      onComplete(null);
    }
  };

  const handleComplete = () => {
    if (text.trim()) {
      onComplete(text.trim());
    } else {
      onComplete(null);
    }
  };

  const handleBlur = () => {
    setTimeout(handleComplete, 100);
  };

  if (!isActive) return null;

  return (
    <div
      className="fixed z-[60]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <textarea
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className="border-2 border-blue-500 rounded px-2 py-1 min-w-[200px] resize-none outline-none"
        style={{
          fontSize: `${fontSize}px`,
          color: color,
          fontFamily: 'Arial, sans-serif',
          lineHeight: '1.2',
          background: 'rgba(255, 255, 255, 0.9)',
        }}
        rows={1}
        placeholder="Type text..."
      />
      <div className="text-xs text-gray-500 mt-1">
        Press Enter to save, Esc to cancel
      </div>
    </div>
  );
}

export default TextTool;