import React from 'react';

const Background = () => (
  <div className="fixed inset-0 -z-1 w-full h-full pointer-events-none overflow-hidden">
    {/* Animated SVG Grid */}
    <svg className="absolute inset-0 w-full h-full" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#3b82f6" strokeOpacity="0.08" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
    {/* Animated Blobs (Aurora) */}
    <div className="absolute w-[600px] h-[600px] bg-primary/20 blur-3xl rounded-full left-[-200px] top-[-200px] animate-pulse" />
    <div className="absolute w-[400px] h-[400px] bg-aura/20 blur-2xl rounded-full right-[-100px] bottom-[-100px] animate-pulse" />
    <div className="absolute w-[300px] h-[300px] bg-accent/20 blur-2xl rounded-full left-[50%] top-[60%] animate-pulse" />
  </div>
);

export default Background; 