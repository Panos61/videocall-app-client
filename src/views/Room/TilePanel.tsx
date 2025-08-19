import { Children, forwardRef } from 'react';

const TilePanel = forwardRef<HTMLDivElement, { children: React.ReactNode }>(
  ({ children }, ref) => {
    return (
      <div className='overflow-hidden size-full bg-black'>
        <div
          ref={ref}
          className='w-full h-full px-12 py-8 flex flex-col gap-8 overflow-y-auto scrollbar-thin scrollbar-track-black scrollbar-thumb-zinc-600'
        >
          {Children.toArray(children)
            .filter(Boolean)
            .map((child, index) => (
              <div key={index} className='w-full aspect-video'>
                {child}
              </div>
            ))}
        </div>
      </div>
    );
  }
);

export default TilePanel;
