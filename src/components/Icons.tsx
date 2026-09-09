import React from 'react';

// Authentic Windows 4-square logo
export const WindowsIcon = ({ className = 'w-3 h-3 shrink-0' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M0 2.222L6.5 1.333v6.222H0V2.222zm7.5-1.467L16 0v7.556H7.5V.755zM0 8.444h6.5v6.223L0 13.778V8.444zm7.5 0H16V16l-8.5-.756V8.444z" />
  </svg>
);

// Apple-style Linux penguin icon
export const LinuxIcon = ({ className = 'w-3 h-3 shrink-0' }: { className?: string }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img
    src="/icons/linux-penguin.png"
    alt=""
    aria-hidden="true"
    className={`${className} object-contain`}
  />
);
