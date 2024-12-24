import React from 'react';

interface Props {
  children: React.ReactNode;
  max?: number;
}

export const AvatarStack = ({ children, max = 3 }: Props) => {
  const avatars = React.Children.toArray(children).slice(0, max);
  const extraCount = React.Children.count(children) - max;

  return (
    <div className='flex'>
      {avatars.map((child, index) => (
        <div key={index} className='relative -ml-8 first:ml-0'>
          {child}
        </div>
      ))}
      {extraCount > 0 && (
        <div className='relative -ml-4 flex items-center justify-center size-28 rounded-full text-xs text-white bg-slate-600'>
          +{extraCount}
        </div>
      )}
    </div>
  );
};
