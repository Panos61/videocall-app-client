import classNames from 'classnames';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner = ({ size = 'md' }: Props) => {
  const internalCls = classNames(
    'rounded-full border-violet-300 border-t-violet-700 animate-spin',
    {
      'size-16 border-[2px]': size === 'sm',
      'size-28 border-4': size === 'md',
      'size-64 border-4': size === 'lg',
    }
  );

  return (
    <div className='flex items-center justify-center'>
      <div className='flex flex-col items-center animate-pulse'>
        <div className={internalCls} />
      </div>
    </div>
  );
};
