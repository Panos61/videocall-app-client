const TilePanel = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='overflow-hidden size-full bg-black'>
      <div className='w-full h-[calc(100%-528px)] p-12 flex flex-col gap-8 items-center justify-center'>
        {children}
      </div>
    </div>
  );
};

export default TilePanel;
