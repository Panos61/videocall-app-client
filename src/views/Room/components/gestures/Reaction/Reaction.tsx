import { useEffect, useState } from 'react';
import classNames from 'classnames';

interface Props {
  id: string;
  emoji: string;
  username: string;
  onAnimationEnd: (id: string) => void;
}

const Reaction = ({ emoji, id, username, onAnimationEnd }: Props) => {
  const [shouldRemove, setShouldRemove] = useState(false);

  // Random values for more natural balloon-like movement
  const randomX = Math.random() * 200 - 100; // -100 to 100px horizontal drift
  const randomRotation = Math.random() * 20 - 10; // -10 to 10 degrees rotation
  const randomDuration = 5 + Math.random() * 3; // 5-8 seconds duration
  const randomDelay = Math.random() * 0.3; // 0-0.3s delay

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldRemove(true);
      setTimeout(() => onAnimationEnd(id), 300); // Wait for fade out
    }, randomDuration * 1000);

    return () => clearTimeout(timer);
  }, [id, onAnimationEnd, randomDuration]);

  const cls = classNames(
    'absolute bottom-20 left-1/2 transform -translate-x-1/2 pointer-events-none transition-all duration-300',
    {
      'opacity-0': shouldRemove,
      'opacity-100': !shouldRemove,
    }
  );

  return (
    <div
      className={cls}
      style={
        {
          animation: `floatUp ${randomDuration}s ease-out ${randomDelay}s forwards`,
          '--random-x': `${randomX}px`,
          '--random-rotation': `${randomRotation}deg`,
        } as React.CSSProperties & { [key: string]: string }
      }
    >
      <div className='flex flex-col gap-4 items-center'>
        <div className='text-4xl'>{emoji}</div>
        <div className='text-white text-sm font-medium bg-violet-300/45 bg-opacity-50 px-8 py-4 rounded-full whitespace-nowrap text-center'>
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
            5% {
              opacity: 1;
              transform: translate(-50%, -20px) translateX(calc(var(--random-x) * 0.1)) rotate(calc(var(--random-rotation) * 0.1)) scale(1);
            }
            15% {
              transform: translate(-50%, -70px) translateX(calc(var(--random-x) * 0.25)) rotate(calc(var(--random-rotation) * 0.25)) scale(1.02);
            }
            30% {
              transform: translate(-50%, -150px) translateX(calc(var(--random-x) * 0.45)) rotate(calc(var(--random-rotation) * 0.45)) scale(1);
            }
            45% {
              transform: translate(-50%, -250px) translateX(calc(var(--random-x) * 0.65)) rotate(calc(var(--random-rotation) * 0.65)) scale(0.98);
            }
            60% {
              transform: translate(-50%, -360px) translateX(calc(var(--random-x) * 0.8)) rotate(calc(var(--random-rotation) * 0.8)) scale(0.95);
            }
            75% {
              transform: translate(-50%, -470px) translateX(calc(var(--random-x) * 0.9)) rotate(calc(var(--random-rotation) * 0.9)) scale(0.9);
            }
            85% {
              transform: translate(-50%, -550px) translateX(calc(var(--random-x) * 0.95)) rotate(calc(var(--random-rotation) * 0.95)) scale(0.85);
              opacity: 0.8;
            }
            95% {
              transform: translate(-50%, -620px) translateX(var(--random-x)) rotate(var(--random-rotation)) scale(0.7);
              opacity: 0.4;
            }
            100% {
              transform: translate(-50%, -650px) translateX(var(--random-x)) rotate(var(--random-rotation)) scale(0.6);
              opacity: 0;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Reaction;
