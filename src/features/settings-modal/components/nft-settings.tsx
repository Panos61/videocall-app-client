import { LockIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';

export const NftSettings = () => {
  return (
    <section className='rounded-2xl border border-purple-200 p-12 bg-gradient-to-br from-purple-50 to-purple-100 shadow-sm mb-4'>
      <div className='flex items-center gap-8 mb-8'>
        <div className='size-36 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md'>
          <LockIcon size={16} />
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

      <div className='space-y-2 mt-3'>
        <label className='text-[11px] font-medium text-purple-900'>
          NFT Collection Address
        </label>
        <Input
          className='w-full border bg-white px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
          placeholder='0x123abc...'
        />
      </div>

      <div className='space-y-2 mt-3'>
        <label className='text-[11px] font-medium text-purple-900'>
          Minimum NFTs Needed
        </label>
        <Input type='number' defaultValue={1} />
      </div>

      <div className='mt-4 flex items-center justify-between'>
        <p className='text-[11px] text-purple-700 max-w-[70%] leading-snug'>
          Only users holding the required NFT will be allowed to log in.
        </p>
        <button className='shrink-0 inline-flex items-center rounded-full bg-purple-600 text-white px-3 py-1.5 text-[10px] font-medium shadow hover:bg-purple-700 active:bg-purple-800 transition'>
          Enable
        </button>
      </div>
    </section>
  );
};
