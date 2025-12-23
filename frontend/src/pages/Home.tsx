import React, { useEffect, useState } from "react";

interface Item {
  id: number;
  name: string;
}

interface CraftingSlot {
  item: Item | null;
}

export default function Home() {
  const [crafting, setCrafting] = useState<CraftingSlot[]>(Array.from({ length: 9 }, () => ({ item: null })))
  const [items, setItems] = useState<Item[]>([])

  useEffect(() => {
    setItems([
      { id: 1, name: "Wooden Pickaxe" },
      { id: 2, name: "Stone Pickaxe" },
      { id: 3, name: "Iron Pickaxe" },
    ])
  }, [])

  const craftingElements = crafting.map((_, index: number) => {
    return (
      <div key={`crafting-slot-${index}`} className="rounded-xl size-20 bg-amber-50">

      </div>
    )
  })

  const itemsElements = items.map((_, index: number) => {
    return (
      <div key={`item-slot-${index}`} className="rounded-xl size-20 bg-amber-50">
      </div>
    )
  })

  return (
    <main className="h-full flex justify-center self-center flex-row max-w-2xl m-auto">
      <section className="self-center flex justify-center flex-col gap-4 items-center">
        <h2 className="font-bold text-2xl">Crafting</h2>
        <div className="grid grid-cols-3 grid-rows-3 gap-2 self-center">
          {craftingElements}
        </div>
      </section>
      <section className="self-center flex justify-center flex-col gap-4 items-center">
        <div className="grid grid-cols-3 gap-2 self-center ml-8">
          {itemsElements}
        </div>
      </section>
    </main>
  );
}