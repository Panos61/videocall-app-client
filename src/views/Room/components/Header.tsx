const Header = () => {
  return (
    <header className='flex items-center justify-between h-60 px-48 border-b border-zinc-800'>
      <div className='text-lg text-white font-mono'>Toku</div>
      <div className='flex items-center gap-8'>
        <div className='text-xs text-gray-300'>00:00</div>
        <span className='text-gray-300'>-</span>
        <p className='text-xs text-white'>Call in progress</p>
        <div className='size-8 rounded-full bg-green-500 animate-pulse'></div>
      </div>
    </header>
  );
};

export default Header;
