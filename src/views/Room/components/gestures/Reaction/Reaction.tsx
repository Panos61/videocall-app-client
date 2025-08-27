interface Props {
  id: string;
  emoji: string;
  username: string;
  onAnimationEnd: (id: string) => void;
}

const Reaction = ({ emoji, id, username, onAnimationEnd }: Props) => {
  // Random values for more natural balloon-like movement
  const randomXEnd = Math.random() * 0;
  const randomRotationEnd = Math.random() * 0;
  const randomDuration = 7 + Math.random() * 4; // 7-11 seconds duration
  const randomDelay = Math.random() * 0;

  const handleAnimationEnd = () => {
    onAnimationEnd(id);
  };

  return (
    <div
      className='absolute bottom-20 left-1/2 pointer-events-none'
      onAnimationEnd={handleAnimationEnd}
      style={
        {
          '--random-x-end': `${randomXEnd}px`,
          '--random-rotate-end': `${randomRotationEnd}deg`,
          animation: `floatUp ${randomDuration}s linear ${randomDelay}s forwards`,
          willChange: 'transform, opacity',
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
              transform: translate(-50%, 0) scale(0.6);
              opacity: 0;
            }
            10% {
              transform: translate(-50%, -150px) scale(1);
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            100% {
              transform: translate(calc(-50% + var(--random-x-end)), -700px) rotate(var(--random-rotate-end)) scale(1);
              opacity: 0;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Reaction;
