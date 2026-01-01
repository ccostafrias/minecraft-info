import React, { memo, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";
import type { ItemName } from "@shared/types";
import { defaultItemName } from "@shared/utils";
import { useDoubleTap } from "use-double-tap";

interface CraftingSlotProps {
  index: number;
  item: ItemName;
  holdingItemRef: React.RefObject<ItemName| null>;
  setHoldingItem: React.Dispatch<React.SetStateAction<ItemName | null>>;
  setCrafting: React.Dispatch<React.SetStateAction<ItemName[]>>;
  isDraggingRef: React.RefObject<boolean>;
  setDragItem: React.Dispatch<React.SetStateAction<ItemName>>;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
}

export const CraftingSlot = memo(function CraftingSlot({
  index,
  item,
  holdingItemRef,
  setHoldingItem,
  setCrafting,
  isDraggingRef,
  setDragItem,
  setSearchTerm,
}: CraftingSlotProps) {

  const [dragAnimation, setDragAnimation] = useState(false);
  const [isInside, setIsInside] = useState(false);
  const animationControls = useAnimationControls();

  console.log("rendering crafting slot", index);

  const changeCrafting = (newItem: ItemName) => {
    setCrafting((prev) => {
      const newCrafting = [...prev];
      newCrafting[index] = newItem;
      return newCrafting;
    });
  }

  const handleMouseEnter = () => {
    setIsInside(true);
    const holdingItem = holdingItemRef.current;
    const isDragging = isDraggingRef.current;

    if (!holdingItem || item.id == holdingItem.id) return; // nao ha item selecionado ou ja esta o mesmo item
    if (!isDragging && holdingItem) return; // item selecionado, mas nao esta arrastando

    setCrafting((prev) => {
      const newCrafting = [...prev];
      newCrafting[index] = holdingItem;
      return newCrafting;
    });
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
      changeCrafting(defaultItemName());
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

    changeCrafting(holdingItem);
  }

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('right click crafting slot', index);

    if (!item.displayName) return;

    if (holdingItemRef.current) {
      setHoldingItem(null);
      return;
    }
    changeCrafting(defaultItemName());
  }

  const handleDoubleClick = () => {
    console.log('double click crafting slot', index);

    if (!item.displayName) return;

    changeCrafting(defaultItemName());
  }

  const handleDoubleTap = useDoubleTap(handleDoubleClick, 200, {
    onSingleTap: handleClick,
  })

  const isHoldingInside = isInside && holdingItemRef.current;
  const isSameItemAsHolding = holdingItemRef.current && item.id === holdingItemRef.current.id;

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
          <img
            src={`./items/${isHoldingInside ? holdingItemRef.current!.name : item.name}.png`}
            alt={isHoldingInside ? holdingItemRef.current!.displayName : item.displayName}
            className={`block size-9/10 object-contain select-none pointer-events-none ${isHoldingInside && !isSameItemAsHolding ? "opacity-50" : ""}`}
          />
        </motion.div>
      )}
    </div>
  );
});
