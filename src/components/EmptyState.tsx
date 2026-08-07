import { useState, useEffect } from 'react';

type EmptyStateType = 'idle' | 'not-found' | 'empty-saved' | 'empty-created';

interface EmptyStateProps {
  type: EmptyStateType;
  message: string;
}

export function EmptyState({ type, message }: EmptyStateProps) {
  const [frame, setFrame] = useState(0);
  
  // Animation frames for different states
  const typingFrames = ['(^-^) 旦', '(^o^) 旦', '(>_<) 旦', '(-_-) 旦'];
  const notFoundArt = '¯\\_(ツ)_/¯';
  const emptyFolderArt = '[\\_/]';

  useEffect(() => {
    // Only animate if idle (typing cat)
    if (type !== 'idle') return;

    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % typingFrames.length);
    }, 400);

    return () => clearInterval(interval);
  }, [type]);

  let asciiArt = '';
  switch (type) {
    case 'idle':
      asciiArt = typingFrames[frame];
      break;
    case 'not-found':
      asciiArt = notFoundArt;
      break;
    case 'empty-saved':
    case 'empty-created':
      asciiArt = emptyFolderArt;
      break;
  }

  return (
    <div className="flex flex-col items-center justify-center h-40 text-neutral-500 gap-3">
      <div className={`text-2xl font-mono dark:text-neutral-400 ${type === 'idle' ? 'animate-pulse' : ''}`}>
        {asciiArt}
      </div>
      <div className="text-xs font-medium text-center px-6 leading-relaxed">
        {message}
      </div>
    </div>
  );
}
