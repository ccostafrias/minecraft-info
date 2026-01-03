import React, { memo, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";
import type { ItemName, MinecraftItem } from "@shared/types";
import { defaultItemName } from "@shared/utils";

interface ItemProps {
  item: MinecraftItem;
  holdingItem: ItemName | null;
  setHoldingItem: React.Dispatch<React.SetStateAction<ItemName | null>>;
  dragItem: ItemName;
  setDragItem: React.Dispatch<React.SetStateAction<ItemName>>;
  showLabel?: boolean;
  size?: number;
}

export const Item = memo(function Item({ item, holdingItem, setHoldingItem, dragItem, setDragItem, showLabel = true, size = 20 }: ItemProps) {
  console.log("rendering item", item.name);

  const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });
  const [dragAnimation, setDragAnimation] = useState(false);
  const animationControls = useAnimationControls();
  const elementRef = React.useRef<HTMLDivElement>(null);

  // Disable drag on mobile/coarse pointer devices using window.matchMedia
  const isMobileCoarsePointer = !!window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

  const handleDragStart = () => {
    setHoldingItem(item);

    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      setInitialPosition({ x: rect.left, y: rect.top });
    }

    setDragItem(item);
    setDragAnimation(true);
  };

  const handleDragEnd = () => {
    animationControls
      .start({
        x: 0,
        y: 0,
      })
      .then(() => {
        setDragItem(defaultItemName());
        setDragAnimation(false);
        setHoldingItem(null);
      })
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

  const isDragging = (dragAnimation && dragItem.id === item.id);
  const sizePx = `${size*4}px`

  return (
    <>
      {isDragging && (
        <div style={{ width: sizePx, height: sizePx }} aria-hidden="true"/>
      )}
      <motion.div
        ref={elementRef}
        className='aspect-square grid place-items-center'
        drag={!isMobileCoarsePointer}
        style={
          isDragging
            ? {
                zIndex: 300,
                cursor: "grabbing",
                position: "fixed",
                pointerEvents: "none",
                left: initialPosition.x,
                top: initialPosition.y,
                width: sizePx,
                height: sizePx,
              }
            : {
                width: sizePx,
                height: sizePx,
            }
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
      {showLabel && (
        <span className={`text-center text-surface-muted line-clamp-2 ${holdingItem?.id === item.id ? 'font-bold' : 'font-medium'}`}>
          {item.displayName}
        </span>
      )}
    </>
  );
}, (prevProps, nextProps) => {
  const prevHolding = prevProps.holdingItem?.id === prevProps.item.id;
  const nextHolding = nextProps.holdingItem?.id === nextProps.item.id;
  const prevDrag = prevProps.dragItem?.id === prevProps.item.id;
  const nextDrag = nextProps.dragItem?.id === nextProps.item.id;

  return (
    prevHolding === nextHolding &&
    prevProps.item === nextProps.item &&
    prevDrag === nextDrag
  )
});
