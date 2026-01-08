import type { PotionInstance } from "@shared/types"

export function PotionIcon({ potion, opacity }: { potion: PotionInstance, opacity?: number }) {
  const { name, form, color } = potion;
  const prefix = form === 'splash' ? 'splash_' : form === 'lingering' ? 'lingering_' : '';

  return (
    <>
      <img 
        className='size-9/10 disable-blur object-cover absolute trans-center'
        src={`./brewing/${prefix}potion.png`} 
        alt={`${name} ${form}`}
        style={{
          opacity: `${opacity ?? 100}%`
        }}
      />
      <img 
        className='size-9/10 disable-blur object-cover absolute trans-center'
        src='./brewing/potion_overlay.png' 
        style={{
          opacity: `${opacity ?? 100}%`
        }}
        aria-hidden="true"
      />
      <div
        className="size-9/10 absolute inset-0 mix-blend-multiply opacity-80 disable-blur trans-center"
        style={{ 
          backgroundColor: color ?? 'transparent',
          WebkitMaskImage: "url('./brewing/potion_overlay.png')" ,
          WebkitMaskRepeat: "no-repeat",
          WebkitMaskSize: "contain",
          WebkitMaskPosition: "center",
          maskImage: "url('./brewing/potion_overlay.png')" ,
          maskRepeat: "no-repeat",
          maskSize: "contain",
          maskPosition: "center",
          opacity: `${opacity ?? 100}%`
        }}
        aria-hidden="true"
      />
    </>
  )
}