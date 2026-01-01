import React, { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaCircleInfo } from "react-icons/fa6";
import { useInView } from "react-intersection-observer";
import { FaTrash } from "react-icons/fa6";

import type { ItemsInfo, ItemName } from "@shared/types";
import { SearchBar } from "../components/SearchBar";
import { Item } from "../components/Item";
import { CraftingSlot } from "../components/CraftingSlot";
import { PossibleCrafting } from "../components/PossibleCrafting";
import { defaultCrafting, defaultItemName } from "@shared/utils";
import { NoCrafting } from "../components/NoCrafting";

const fetchItems = async (
  search: string,
  offset: number,
  signal?: AbortSignal
) => {
  const res = await fetch(
    `/api/items?search=${encodeURIComponent(search)}&offset=${offset}`,
    { signal }
  )
  return res.json()
}

const formatedCrafting = (crafting: ItemName[]) => crafting.map(slot => slot.displayName ? slot.id : 0)

export default function Home() {
  const navigate = useNavigate();

  const [crafting, setCrafting] = useState<ItemName[]>(() => {
    const savedCrafting = localStorage.getItem('lastCrafting');
    return savedCrafting ? JSON.parse(savedCrafting) : defaultCrafting();
  })
  const [items, setItems] = useState<ItemsInfo>({ items: [], nextOffset: 0, hasMore: false })
  const [possibleCraftings, setPossibleCraftings] = useState<ItemsInfo>({ items: [], nextOffset: 0, hasMore: false })

  // Holding
  const [holdingItem, setHoldingItem] = useState<ItemName | null>(null)
  const holdingItemRef = useRef<ItemName | null>(null);
  const [dragItem, setDragItem] = useState(defaultItemName());
  const isDraggingItem = useRef(false);

  // Search
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [possibleSearchTerm, setPossibleSearchTerm] = useState<string>("")

  // Infinite Scroll Items
  const { ref: itemsTrackingRef } = useInView({
    threshold: 0,
    triggerOnce: false,
    skip: !items.hasMore,
    onChange: async (inView, entry) => {
      if (inView) {
        console.log('loading more items...', entry?.target)

        try {
          const data = await fetchItems(searchTerm, items.nextOffset)
          setItems(prev => {
            return {
              items: [...prev.items, ...data.items],
              nextOffset: data.nextOffset,
              hasMore: data.hasMore
            }
          })
        } catch (error: any) {
          console.error('Failed to fetch more items:', error)
        }
      } else {
        console.log('not loading more items', entry?.target)
      }
    }
  })

  // Infinite Scroll Possible Craftings
  const { ref: craftingTrackingRef } = useInView({
    threshold: 0,
    triggerOnce: false,
    skip: !possibleCraftings.hasMore,
    // skip: true,
    onChange: async (inView, entry) => {
      if (inView) {
        console.log('loading more possible craftings...', entry?.target)

        try {
          const raw = await fetch(
            `/api/possibleRecipes?search=${encodeURIComponent(possibleSearchTerm)}&recipe=${encodeURIComponent(JSON.stringify(formatedCrafting(crafting)))}&offset=${possibleCraftings.nextOffset}`
          )
          const data = await raw.json()

          setPossibleCraftings(prev => {
            return {
              items: [...prev.items, ...data.items],
              nextOffset: data.nextOffset,
              hasMore: data.hasMore
            }
          })
        } catch (error: any) {
          console.error('Failed to fetch more possible craftings:', error)
        }
      } else {
        console.log('not loading more possible craftings', entry?.target)
      }
    }
  })

  // New Items
  useEffect(() => {
    const controller = new AbortController()

    const timeout = setTimeout(async () => {
      try {
        const data = await fetchItems(searchTerm, 0, controller.signal)
        setItems(data)
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Failed to fetch items:', error)
        }
      }

    }, 300)

    return () => {
      controller.abort()
      clearTimeout(timeout)
    }
  }, [searchTerm])

  // New Possible Craftings
  useEffect(() => {
    if (crafting.every(slot => !slot.displayName)) {
      setPossibleCraftings({ items: [], nextOffset: 0, hasMore: false })
      localStorage.removeItem('lastCrafting')
      return
    }

    localStorage.setItem('lastCrafting', JSON.stringify(crafting))

    const controller = new AbortController()

    const timeout = setTimeout(() => { 
      fetch(
        `/api/possibleRecipes?search=${encodeURIComponent(possibleSearchTerm)}&recipe=${encodeURIComponent(JSON.stringify(formatedCrafting(crafting)))}`, 
        { signal: controller.signal }
      )
        .then(res => res.json())
        .then(data => {
          console.log('possible craftings data:', data)
          setPossibleCraftings(data)
        })
        .catch(err => {
          if (err.name !== 'AbortError') {
            console.error(err)
          }
        })

    }, 300)

    return () => {
      console.log('aborting fetch possible craftings')
      controller.abort()
      clearTimeout(timeout)
    }
  }, [crafting, possibleSearchTerm])

  // Holding Ref Update
  useEffect(() => {
    holdingItemRef.current = holdingItem;
  }, [holdingItem])

  useEffect(() => {
    isDraggingItem.current = dragItem.id !== -1;
  }, [dragItem])

  // Click outside to drop holding item
  useEffect(() => {
    const onDocumentClick = (e: MouseEvent) => {
      const target = e.target;

      if (target instanceof Element) {
        const clickInside = target.closest('.items-grid, .crafting-grid');
        if (!clickInside) {
          setHoldingItem(null);
        }
      }
    };

    const onEscapePress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setHoldingItem(null);
      }
    };

    document.addEventListener('keydown', onEscapePress);
    document.addEventListener('click', onDocumentClick);

    return () => {
      document.removeEventListener('keydown', onEscapePress);
      document.removeEventListener('click', onDocumentClick);
    }

  }, [])

  const clearCrafting = () => {
    setCrafting(defaultCrafting());
  }

  const craftingElements = crafting.map((item, index: number) => {
    return (
      <div key={`crafting-slot-${index}`} className="rounded-xl size-20 bg-highlight cursor-pointer hover:outline-4">
        <CraftingSlot 
          index={index} 
          item={item} 
          holdingItemRef={holdingItemRef} 
          setHoldingItem={setHoldingItem} 
          setCrafting={setCrafting} 
          isDraggingRef={isDraggingItem} 
          setDragItem={setDragItem} 
          setSearchTerm={setSearchTerm}
        />
      </div>
    )
  })

  const itemsElements = items.items.map((item, index: number) => {
    return (
      <div key={`item-slot-${index}`} className={`item bg-highlight cursor-pointer hover:outline-4 ${holdingItem?.name === item.name ? 'outline-4' : ''}`}>
        <div 
          role="button"
          className="absolute left-0 top-0 m-1 text-surface-muted hover:text-surface-strong" 
          aria-label={`Details about ${item.displayName}`}
          title='View item details'
          onClick={() => navigate(`/item/${item.id}`)}
        >
          <FaCircleInfo/>
        </div>
        <Item item={item} holdingItem={holdingItem} setHoldingItem={setHoldingItem} dragItem={dragItem} setDragItem={setDragItem} />
      </div>
    )
  })

  const possibleCraftingsElements = possibleCraftings.items
    .map((item, index) => (
      <PossibleCrafting key={`possible-crafting-${index}`} item={item} index={index} />
  ))

  return (
    <main className="recipes-main gap-10">
      {/* Crafting */}
      <section className="crafting-section self-center flex justify-center flex-col gap-4 items-center [grid-area:crafting]">
        <header className="grid grid-cols-[1fr_auto_1fr] items-center w-full">
          <h2 className="font-bold text-2xl col-start-2">Crafting</h2>
          <div 
            className="col-start-3 justify-self-end cursor-pointer hover:scale-110"
            aria-label="clean crafting table"
            title="Clear crafting table"
            onClick={clearCrafting}
          >
            <FaTrash />
          </div>
        </header>
        <div className="crafting-grid grid grid-cols-3 grid-rows-3 gap-2 self-center shrink-0">
          {craftingElements}
        </div>
        {/* <button 
          onClick={clearCrafting}
          className="clear-btn rounded-2xl px-2 py-2 cursor-pointer bg-highlight hover:outline-4 flex gap-1 items-center"
          aria-label="clean crafting table"
          title="Clear crafting table"
        >
          <IoIosClose className="text-surface-muted"/>
          <span className="text-surface-muted">Clear</span>
        </button> */}
      </section>
      {/* Items */}
      <section className="items-section grid grid-rows-[auto_1fr] gap-4 [grid-area:items]">
        {/* <h2 className="font-bold text-2xl">Items</h2> */}
        <div className="flex flex-row justify-between w-full gap-4">
          <h2 className="font-bold text-2xl">Items</h2>
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} placeholder="Search items" />
        </div>
          {items.items.length > 0 ? (
            <div className="items-grid p-2 grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] auto-rows-min gap-2 self-center h-80 overflow-y-auto overflow-x-hidden w-full">
              {itemsElements}
              <ItemSkeleton count={items.hasMore ? 10 : 0} ref={itemsTrackingRef} />
            </div>
          ) : (
            <p className="p-2">No items found :/</p>
          )}
      </section>
      {/* Possible Craftings */}
      <section className="possible-craftings-section [grid-area:possible-craftings] border-t-2 pt-4">
        <div className="flex flex-row justify-between items-center gap-4">
          <h2 className="font-bold text-2xl">Craftings</h2>
          <SearchBar searchTerm={possibleSearchTerm} setSearchTerm={setPossibleSearchTerm} placeholder="Search craftings" />
        </div>
        <div className="possible-craftings flex flex-row gap-8 p-4 overflow-x-auto">
          {possibleCraftings.items.length > 0 ? (
            <>
              {possibleCraftingsElements}
              <CraftingSkeleton count={possibleCraftings.hasMore ? 4 : 0} ref={craftingTrackingRef} />
            </>
          ) : (
            // <p className="p-4">No possible craftings</p>
            <NoCrafting title="No possible craftings" subtitle="Try adjusting your search or crafting table."/>
          )}
        </div>
      </section>
    </main>
  );
}

function ItemSkeleton({ count, ref }: { count: number, ref: React.Ref<HTMLDivElement> }) {
  if (count <= 0) return null;

  const skeletons = useMemo(() => {
    const arr = Array.from({ length: count }, (_, i) => {
      const isFirst = i === 0;
      return (
        <div key={`item-skeleton-${i}`} ref={isFirst ? ref : undefined} className="item border-2 border-surface-muted">
          <div className="size-20"/>
          <span className="h-2 w-12 bg-surface-muted rounded-[5px] shimmer"></span>
          <span className="h-2 w-10 m-1 bg-surface-muted rounded-[5px] shimmer"></span>
        </div>
      )
    });

    return arr;
  }, [count]);

  return (
    <>
      {skeletons}
    </>
  )
}

function CraftingSkeleton({ count, ref }: { count: number, ref: React.Ref<HTMLDivElement> }) {
  if (count <= 0) return null;

  const skeletons = useMemo(() => {
    const arr = Array.from({ length: count }, (_, i) => {
      return (
        <div key={`crafting-skeleton-${i}`} ref={i === 0 ? ref : undefined} className="flex flex-col gap-2 items-center" >
          <div className="flex flex-row items-center gap-2 self-start">
              <div className="rounded-lg p-1 size-8 shimmer"></div>
              <span className="h-4 w-20 bg-surface-muted rounded-[5px] shimmer"></span>
          </div>
          <div className="possible-crafting-grid grid grid-cols-3 grid-rows-3 gap-1 w-max">
            {Array.from({ length: 9 }, (_, j) => (
              <>
                <div key={`crafting-skeleton-slot-${i}${j}`} className="block-square shimmer"></div>
              </>
            ))}
          </div>
        </div>
      )
    })

    return arr;
  }, [count]);

  return (
    <>
      {skeletons}
    </>
  )
}