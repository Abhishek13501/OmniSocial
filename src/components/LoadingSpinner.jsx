import React, { useState, useEffect } from 'react';

const LoadingSpinner = ({ message = 'Loading...', size = 'md', statusMessages = [] }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    if (statusMessages.length === 0) return;

    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % statusMessages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [statusMessages]);

  const activeMessage = statusMessages.length > 0 
    ? statusMessages[currentMessageIndex] 
    : message;

  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      {/* Outer spinning glowing circle */}
      <div className="relative mb-4">
        <div className={`rounded-full border-t-brand-500 border-r-transparent border-b-indigo-500 border-l-transparent animate-spin ${sizeClasses[size] || sizeClasses.md}`} />
        <div className={`absolute top-0 left-0 rounded-full border-brand-500/20 border animate-ping ${sizeClasses[size] || sizeClasses.md}`} />
      </div>
      
      {/* Dynamic textual update */}
      <p className="text-slate-300 font-medium text-sm tracking-wide animate-pulse">
        {activeMessage}
      </p>

      {/* Modern micro-animations dot wave */}
      {statusMessages.length > 0 && (
        <div className="flex items-center gap-1.5 mt-3 justify-center">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce"></span>
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;
