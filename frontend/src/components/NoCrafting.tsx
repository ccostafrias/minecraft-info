import { BsFillGrid3X3GapFill } from 'react-icons/bs';
import { CiNoWaitingSign } from 'react-icons/ci';

export function NoCrafting({ title, subtitle }: { title?: string; subtitle?: string }) {

  return (
    <div className='flex flex-col items-center gap-2 w-full p-4'>
      <div className='relative size-18 grid place-items-center mb-5'>
        {/* <MdBlock className='absolute size-11/10' /> */}
        <CiNoWaitingSign className='absolute size-16/10 text-text-primary/60'  />
        <BsFillGrid3X3GapFill className='text-text-primary/60 size-8/10' />
      </div>
      <h3 className='text-highlight font-bold text-xl text-center'>{title || 'No crafting recipe'}</h3>
      <span className='text-[16px] text-center'>{subtitle || 'This item cannot be crafted.'}</span>
    </div>
  )
}