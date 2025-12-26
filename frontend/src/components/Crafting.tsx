import React from "react";
import type { ItemName } from "@shared/types";
import { useNavigate } from "react-router-dom";

interface CraftingProps {
  crafting: ItemName[];
}

export function Crafting({ crafting }: CraftingProps) {
  const navigate = useNavigate();

  const handleClickItem = (item: ItemName) => {
    console.log('click possible crafting item', item.name);
    navigate(`/item/${item.id || item.name}`);
  }

  const elements = crafting.map((item, idx) => {
    return (
      <div
        key={`recipe-slot-${item.name}-${idx}`}
        className="rounded-[10px] size-12 bg-highlight grid place-items-center cursor-pointer hover:outline-4"
        onClick={() => handleClickItem(item)}
      >
        {item.name !== 'empty' && (
          <img
            src={`./items/${item.name}.png`}
            alt={item.displayName}
            className="block size-9/10 object-contain select-none pointer-events-none"
          />
        )}
      </div>
    )
  })

  return (
    <div className="possible-crafting-grid grid grid-cols-3 grid-rows-3 gap-1 w-max">
      {elements}
    </div>
  )
}