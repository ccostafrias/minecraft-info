import { memo } from "react";
import { Link } from "react-router-dom";
import type { MinecraftItem } from "@shared/types";
import { Crafting } from "../components/Crafting";

interface PossibleCraftingProps {
  item: MinecraftItem;
  index: number;
}

export const PossibleCrafting = memo(function PossibleCrafting({ item, index }: PossibleCraftingProps) {
  // console.log('rendering possible crafting for', item.displayName);

  return (
    <div
      className="possible-crafting grid grid-rows-[auto_auto] gap-2"
      key={`possible-crafting-${index}`}
    >
      <Link to={`/item/${item.id}`} className="grid grid-cols-[auto_1fr] items-center gap-2">
        <div className="bg-highlight rounded-lg p-1">
          <img
            src={`./items/${item.name}.png`}
            alt={item.displayName}
            className="block size-6 object-contain select-none pointer-events-none"
          />
        </div>
        <h3 className="text-ellipsis whitespace-nowrap overflow-hidden hover:underline" >{item.displayName}</h3>
      </Link>
      
      <Crafting key={`crafting-${item.id}`} crafting={item.recipes!} />
    </div>
  );
})
