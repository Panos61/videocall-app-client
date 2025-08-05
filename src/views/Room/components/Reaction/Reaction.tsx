import { useEffect, useState } from 'react';

interface ReactionProps {
  emoji: string;
  username: string;
  id: string;
  onAnimationEnd: (id: string) => void;
}

const Reaction = ({ emoji, username, id, onAnimationEnd }: ReactionProps) => {
  const [shouldRemove, setShouldRemove] = useState(false);

  // Random values for more natural balloon-like movement
  const randomX = Math.random() * 200 - 100; // -100 to 100px horizontal drift
  const randomRotation = Math.random() * 20 - 10; // -10 to 10 degrees rotation
  const randomDuration = 3 + Math.random() * 2; // 3-5 seconds duration
  const randomDelay = Math.random() * 0.5; // 0-0.5s delay for staggered effect

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldRemove(true);
      setTimeout(() => onAnimationEnd(id), 300); // Wait for fade out
    }, randomDuration * 1000);

    return () => clearTimeout(timer);
  }, [id, onAnimationEnd, randomDuration]);

  return (
    <div
      className={`absolute bottom-20 left-1/2 transform -translate-x-1/2 pointer-events-none transition-all duration-300 ${
        shouldRemove ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        animation: `floatUp ${randomDuration}s ease-out ${randomDelay}s forwards`,
        '--random-x': `${randomX}px`,
        '--random-rotation': `${randomRotation}deg`,
      } as React.CSSProperties & { [key: string]: string }}
    >
      <div className="flex flex-col items-center">
        <div className="text-4xl mb-1 animate-bounce">{emoji}</div>
        <div className="text-white text-sm font-medium bg-black bg-opacity-50 px-2 py-1 rounded-full whitespace-nowrap">
          {username}
        </div>
      </div>
      
      <style>
        {`
          @keyframes floatUp {
            0% {
              transform: translate(-50%, 0) translateX(0) rotate(0deg) scale(0.8);
              opacity: 0;
            }
            10% {
              opacity: 1;
              transform: translate(-50%, -10px) translateX(5px) rotate(2deg) scale(1);
            }
            25% {
              transform: translate(-50%, -50px) translateX(-8px) rotate(-1deg) scale(1.1);
            }
            50% {
              transform: translate(-50%, -120px) translateX(var(--random-x)) rotate(var(--random-rotation)) scale(1);
            }
            75% {
              transform: translate(-50%, -200px) translateX(calc(var(--random-x) * 1.2)) rotate(calc(var(--random-rotation) * 1.5)) scale(0.9);
            }
            100% {
              transform: translate(-50%, -300px) translateX(calc(var(--random-x) * 1.5)) rotate(calc(var(--random-rotation) * 2)) scale(0.7);
              opacity: 0;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Reaction;