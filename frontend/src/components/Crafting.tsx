import { useEffect, useState } from "react";
import type { ItemName, Matrix3x3 } from "@shared/types";
import { useNavigate } from "react-router-dom";

interface CraftingProps {
  crafting: Matrix3x3<ItemName>[];
}

export function Crafting({ crafting }: CraftingProps) {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);

  const handleClickItem = (item: ItemName) => {
    if (!item.id) return;

    console.log('click possible crafting item', item.name);
    navigate(`/item/${item.id || item.name}`);
  }
  
  useEffect(() => {
    if (crafting.length <= 1) return;

    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % crafting.length);
    }, 1500)

    return () => clearInterval(interval);
  }, [crafting])

  console.log(crafting, index)
  const actualCrafting = crafting[index].flat()

  const elements = actualCrafting.map((item, idx) => {
    return (
      <div
        key={`recipe-slot-${item.name}-${idx}`}
        className="rounded-[10px] bg-highlight grid place-items-center cursor-pointer hover:outline-4 md:size-16 size-20"
        onClick={() => handleClickItem(item)}
        title={item.displayName}
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