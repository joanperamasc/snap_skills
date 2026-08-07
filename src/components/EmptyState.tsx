import { useState, useEffect } from 'react';

type EmptyStateType = 'idle' | 'not-found' | 'empty-saved' | 'empty-created' | 'rate-limit';

interface EmptyStateProps {
  type: EmptyStateType;
  message: string;
  submessage?: string;
}

export function EmptyState({ type, message, submessage }: EmptyStateProps) {
  const [frame, setFrame] = useState(0);
  
  // Animation frames for different states
  const typingFrames = ['(^-^) 旦', '(^o^) 旦', '(>_<) 旦', '(-_-) 旦'];
  const notFoundArt = '¯\\_(ツ)_/¯';
  const emptyFolderArt = '[\\_/]';
  const rateLimitArt = '(╯°□°)╯︵ ┻━┻';

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
    case 'rate-limit':
      asciiArt = rateLimitArt;
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
      {submessage && (
        <div className="text-[11px] text-center px-4 leading-relaxed mt-1 opacity-80">
          {submessage}
        </div>
      )}
    </div>
  );
}
