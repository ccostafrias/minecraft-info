import React, { memo, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";
import type { ItemName } from "@shared/types";
import { defaultItemName } from "@shared/utils";
import { useDoubleTap } from "use-double-tap";

interface SlotProps {
  index: number;
  item: ItemName;
  holdingItemRef: React.RefObject<ItemName| null>;
  setHoldingItem: React.Dispatch<React.SetStateAction<ItemName | null>>;
  changeSlot: (index: number, newItem: any) => void;
  isDraggingRef: React.RefObject<boolean>;
  setDragItem: React.Dispatch<React.SetStateAction<ItemName>>;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  children: (item: any, state: { isHoldingInside: boolean; isSameItemAsHolding: boolean }) => React.ReactNode;
}

export const Slot = memo(function Slot({
  index,
  item,
  holdingItemRef,
  setHoldingItem,
  changeSlot,
  isDraggingRef,
  setDragItem,
  setSearchTerm,
  children
}: SlotProps) {

  const [dragAnimation, setDragAnimation] = useState(false);
  const [isInside, setIsInside] = useState(false);
  const animationControls = useAnimationControls();

  console.log(`rendering Slot ${index} with item ${item.displayName}`);

  const handleMouseEnter = () => {
    setIsInside(true);
    const holdingItem = holdingItemRef.current;
    const isDragging = isDraggingRef.current;

    if (!holdingItem || item.id == holdingItem.id) return; // nao ha item selecionado ou ja esta o mesmo item
    if (!isDragging && holdingItem) return; // item selecionado, mas nao esta arrastando

    changeSlot(index, holdingItem);
  };

  const handleMouseLeave = () => {
    setIsInside(false);
  };

  const handleDragStart = () => {
    setHoldingItem(item);
    setDragAnimation(true);
    setDragItem(item);
  }

  const handleDragEnd = () => {
    if (isInside) {
      animationControls.start({
        x: 0,
        y: 0,
      });

    } else {
      setIsInside(false);
      changeSlot(index, defaultItemName());
    }

    setDragAnimation(false);
    setDragItem(defaultItemName());
    setHoldingItem(null);
  }

  const handleClick = () => {
    const holdingItem = holdingItemRef.current;
    if (item.id == holdingItem?.id) return; // ja esta o mesmo item

    if (!holdingItem) {
      if (item.id !== -1) {
        setSearchTerm(item.displayName.toLocaleLowerCase())
      }
      
      return; 
    }

    changeSlot(index, holdingItem);
  }

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('right click crafting slot', index);

    if (!item.displayName) return;

    if (holdingItemRef.current) {
      setHoldingItem(null);
      return;
    }
    changeSlot(index, defaultItemName());
  }

  const handleDoubleClick = () => {
    console.log('double click crafting slot', index);

    if (!item.displayName) return;

    changeSlot(index, defaultItemName());
  }

  const handleDoubleTap = useDoubleTap(handleDoubleClick, 200, {
    onSingleTap: handleClick,
  })

  const isHoldingInside = isInside && holdingItemRef.current !== null;
  const isSameItemAsHolding = holdingItemRef.current !== null && item.id === holdingItemRef.current.id;

  return (
    <div
      className="aspect-square size-20 grid place-items-center "
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      // onClick={handleClick}
      onContextMenu={handleRightClick}
      {...handleDoubleTap}
    >
      {(item.displayName || isHoldingInside) && (
        <motion.div
          className="aspect-square size-20 grid place-items-center"
          drag={item.displayName ? true : false}
          style={
            dragAnimation
              ? {
                  zIndex: 300,
                  cursor: "grabbing",
                  position: "absolute",
                  pointerEvents: "none",
                }
              : {}
          }
          dragMomentum={false}
          dragElastic={0.05}
          animate={animationControls}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {children(isHoldingInside && !isSameItemAsHolding ? holdingItemRef.current! : item, { isHoldingInside, isSameItemAsHolding })}
        </motion.div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  const prevHolding = prevProps.holdingItemRef.current?.id === prevProps.item.id;
  const nextHolding = nextProps.holdingItemRef.current?.id === nextProps.item.id;

  return (
    prevHolding === nextHolding &&
    prevProps.item === nextProps.item
  )
});
