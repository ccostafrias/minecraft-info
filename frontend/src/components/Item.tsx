import React, { memo, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";
import type { ItemName, MinecraftItem } from "@shared/types";

interface ItemProps {
  item: MinecraftItem;
  holdingItem: ItemName | null;
  setHoldingItem: React.Dispatch<React.SetStateAction<ItemName | null>>;
}

export const Item = memo(function Item({ item, holdingItem, setHoldingItem }: ItemProps) {
  console.log("rendering item", item.name);

  const animationControls = useAnimationControls();
  const [dragAnimation, setDragAnimation] = useState(false);
  const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });
  const elementRef = React.useRef<HTMLDivElement>(null);

  // Disable drag on mobile/coarse pointer devices using window.matchMedia
  const isMobileCoarsePointer = !!window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

  const handleDragStart = () => {
    setHoldingItem(item);

    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      setInitialPosition({ x: rect.left, y: rect.top });
    }

    setDragAnimation(true);
  };

  const handleDragEnd = () => {
    animationControls.start({
      x: 0,
      y: 0,
    });
    setDragAnimation(false);
    setHoldingItem(null);
  }

  const handleClick = () => {
    console.log('click item', item);
    setHoldingItem(() => {
      if (holdingItem?.id === item.id) {
        return null;
      }
      return item;
    })
  }

  return (
    <>
      <motion.div
        ref={elementRef}
        className='aspect-square size-20 grid place-items-center'
        drag={!isMobileCoarsePointer}
        style={
          dragAnimation
            ? {
                zIndex: 300,
                cursor: "grabbing",
                position: "fixed",
                pointerEvents: "none",
                left: initialPosition.x,
                top: initialPosition.y,
              }
            : {}
        }
        dragMomentum={false}
        dragElastic={0.05}
        animate={animationControls}
        onDragStart={isMobileCoarsePointer ? undefined : handleDragStart}
        onDragEnd={isMobileCoarsePointer ? undefined : handleDragEnd}
        onClick={handleClick}
      >
        <img
          src={`./items/${item.name}.png`}
          alt={item.displayName}
          className="block size-9/10 object-contain select-none pointer-events-none"
        />
      </motion.div>
      <span className={`text-center text-surface-muted line-clamp-2 ${holdingItem?.id === item.id ? 'font-bold' : 'font-medium'}`}>
        {item.displayName}
      </span>
    </>
  );
}, (prevProps, nextProps) => {
  const prevHolding = prevProps.holdingItem?.id === prevProps.item.id;
  const nextHolding = nextProps.holdingItem?.id === nextProps.item.id;

  return (
    prevHolding === nextHolding &&
    prevProps.item === nextProps.item
  )
});
