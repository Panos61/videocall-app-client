import { Wallet2Icon } from 'lucide-react';

const Nft = () => {
  return (
    <section className='rounded-2xl border border-purple-200 p-12 mt-20 bg-gradient-to-br from-purple-50 to-purple-100 shadow-sm'>
    <div className='flex items-center gap-8 mb-8'>
      <div className='size-36 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md'>
        <Wallet2Icon size={16} />
      </div>
      <div>
        <h3 className='text-sm font-semibold text-purple-900'>
          NFT Login Access
        </h3>
        <p className='text-[11px] text-purple-700 -mt-0.5'>
          Add wallet-based login verification
        </p>
      </div>
    </div>
    <div className='mt-4 flex items-center justify-between'>
      <p className='text-[11px] text-purple-700 max-w-[70%] leading-snug'>
        Only users holding the required NFT will have access to this room.
      </p>
      <button className='shrink-0 inline-flex items-center rounded-full bg-purple-600 text-white px-3 py-1.5 text-[10px] font-medium shadow hover:bg-purple-700 active:bg-purple-800 transition'>
        Enable
      </button>
    </div>
  </section>
  );
};

export default Nft;