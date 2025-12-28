import React, { memo, useRef, useState } from "react";
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
}

export const CraftingSlot = memo(function CraftingSlot({
  index,
  item,
  holdingItemRef,
  setHoldingItem,
  setCrafting,
}: CraftingSlotProps) {

  const [dragAnimation, setDragAnimation] = useState(false);
  const animationControls = useAnimationControls();
  const isInside = useRef(false);

  console.log("rendering crafting slot", index);

  const changeCrafting = (newItem: ItemName) => {
    setCrafting((prev) => {
      const newCrafting = [...prev];
      newCrafting[index] = newItem;
      return newCrafting;
    });
  }

  const handleMouseEnter = () => {
    isInside.current = true;
    const holdingItem = holdingItemRef.current;
    if (!holdingItem || item?.id == holdingItem?.id) return;

    setCrafting((prev) => {
      const newCrafting = [...prev];
      newCrafting[index] = holdingItem;
      return newCrafting;
    });
  };

  const handleMouseLeave = () => {
    isInside.current = false;
  };

  const handleDragStart = () => {
    setHoldingItem(item);
    setDragAnimation(true);
  }

  const handleDragEnd = () => {
    if (isInside.current) {
      animationControls.start({
        x: 0,
        y: 0,
      });
      setDragAnimation(false);
      setHoldingItem(null);

      return;
    }

    isInside.current = false;
    setHoldingItem(null);
    setDragAnimation(false);
    changeCrafting(defaultItemName());
  }

  const handleClick = () => {
    console.log('click crafting slot', index);

    const holdingItem = holdingItemRef.current;
    if (!holdingItem || item?.id == holdingItem?.id) return;

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

  return (
    <div
      className="aspect-square size-20 grid place-items-center "
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      // onClick={handleClick}
      onContextMenu={handleRightClick}
      {...handleDoubleTap}
    >
      {item.displayName && (
        <motion.div
          className="aspect-square size-20 grid place-items-center "
          drag
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
            src={`./items/${item.name}.png`}
            alt={item.displayName}
            className="block size-9/10 object-contain select-none pointer-events-none"
          />
        </motion.div>
      )}
    </div>
  );
});
