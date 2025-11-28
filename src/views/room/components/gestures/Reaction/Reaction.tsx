import { useEffect, useState } from 'react';
import classNames from 'classnames';

interface Props {
  id: string;
  emoji: string;
  username: string;
  onAnimationEnd: (id: string) => void;
}

const Reaction = ({ emoji, id, username, onAnimationEnd }: Props) => {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  // Random values for more natural balloon-like movement
  const randomXEnd = Math.random() * 100 - 50; // -50px to 50px horizontal drift
  // Reduced duration since it travels less distance
  const randomDuration = 4 + Math.random() * 2; // 4-6 seconds duration

  const handleAnimationEnd = (event: React.AnimationEvent) => {
    // onAnimationEnd fires for both 'float-in' and 'float-out'
    // We only want to remove the component after the 'float-out' animation
    if (event.animationName === 'float-out') {
      onAnimationEnd(id);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimatingOut(true);
    }, randomDuration * 1000 - 500); // Start fade out 500ms before end

    return () => clearTimeout(timer);
  }, [id, onAnimationEnd, randomDuration]);

  const cls = classNames(
    'absolute bottom-20 left-1/2 pointer-events-none',
    {
      'animate-float-in': !isAnimatingOut,
      'animate-float-out': isAnimatingOut,
    }
  );

  return (
    <div
      className={cls}
      onAnimationEnd={handleAnimationEnd}
      style={
        {
          '--random-x-end': `${randomXEnd}px`,
          '--duration': `${randomDuration}s`,
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
          @keyframes float-in {
            0% {
              transform: translate(-50%, 0) scale(0.6);
              opacity: 0;
            }
            15% {
              transform: translate(-50%, -50px) scale(1);
              opacity: 1;
            }
            100% {
              /* Move to -40vh (middle of screen) */
              transform: translate(calc(-40% + var(--random-x-end)), -40vh) scale(1);
              opacity: 1;
            }
          }
          @keyframes float-out {
            0% {
              /* Start fade out from wherever float-in ended (approx middle) */
              transform: translate(calc(-40% + var(--random-x-end)), -40vh) scale(1);
              opacity: 1;
            }
            100% {
              /* Continue floating up a bit while fading out */
              transform: translate(calc(-40% + var(--random-x-end)), -40vh) scale(1);
              opacity: 0;
            }
          }
          .animate-float-in {
            animation: float-in var(--duration) linear forwards;
          }
          .animate-float-out {
            animation: float-out 0.5s ease-out forwards;
          }
        `}
      </style>
    </div>
  );
};

export default Reaction;
