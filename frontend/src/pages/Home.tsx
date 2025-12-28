import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaCircleInfo } from "react-icons/fa6";
import { useInView } from "react-intersection-observer";
import { FaTrash } from "react-icons/fa6";

import type { MinecraftItem, ItemsInfo, ItemName } from "@shared/types";
import { SearchBar } from "../components/SearchBar";
import { Item } from "../components/Item";
import { CraftingSlot } from "../components/CraftingSlot";
import { PossibleCrafting } from "../components/PossibleCrafting";
import { defaultCrafting } from "@shared/utils";

export default function Home() {
  const navigate = useNavigate();

  const [crafting, setCrafting] = useState<ItemName[]>(() => {
    const savedCrafting = localStorage.getItem('lastCrafting');
    return savedCrafting ? JSON.parse(savedCrafting) : defaultCrafting();
  })
  const [items, setItems] = useState<ItemsInfo>({ items: [], nextOffset: 0, hasMore: false })
  const [loadingItems, setLoadingItems] = useState<boolean>(true)
  const [possibleCraftings, setPossibleCraftings] = useState<MinecraftItem[] | null>(null)

  // Holding
  const [holdingItem, setHoldingItem] = useState<ItemName | null>(null)
  const holdingItemRef = useRef<ItemName | null>(null);

  // Search
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [possibleSearchTerm, setPossibleSearchTerm] = useState<string>("")

  const { ref: trackingRef } = useInView({
    threshold: 0,
    triggerOnce: false,
    rootMargin: '200px',
    onChange: (inView, entry) => {
      if (inView) {
        console.log('loading more items...', entry?.target)
      } else {
        console.log('not loading more items', entry?.target)
      }
    }
  })

  useEffect(() => {
    const controller = new AbortController()

    const timeout = setTimeout(() => {
      setLoadingItems(true)
      fetch(
        `/api/items?search=${encodeURIComponent(searchTerm)}`, 
        { signal: controller.signal }
      )
        .then(res => res.json())
        .then(data => setItems(data))
        .finally(() => setLoadingItems(false))
        .catch(err => {
          if (err.name !== 'AbortError') {
            console.error(err)
          }
        })
    }, 300)

    return () => {
      console.log('aborting fetch items')
      controller.abort()
      setLoadingItems(false)
      clearTimeout(timeout)
    }
  }, [searchTerm])

  useEffect(() => {
    if (crafting.every(slot => !slot.displayName)) {
      setPossibleCraftings(null)
      localStorage.removeItem('lastCrafting')
      return
    }

    localStorage.setItem('lastCrafting', JSON.stringify(crafting))

    const controller = new AbortController()

    const timeout = setTimeout(() => {
      const formatedCrafting = crafting.map(slot => slot.displayName ? slot.id : 0)
      console.log('formatted crafting:', formatedCrafting)
  
      fetch(
        `/api/possibleRecipes?recipe=${encodeURIComponent(JSON.stringify(formatedCrafting))}`, 
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
  }, [crafting])

  useEffect(() => {
    holdingItemRef.current = holdingItem;
  }, [holdingItem])

  useEffect(() => {
    const onDocumentClick = (e: MouseEvent) => {
      const target = e.target;

      if (target instanceof Element) {
        const clickInside = target.closest('.items-grid, .crafting-grid')
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
        <CraftingSlot index={index} item={item} holdingItemRef={holdingItemRef} setHoldingItem={setHoldingItem} setCrafting={setCrafting} />
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
        <Item item={item} holdingItem={holdingItem} setHoldingItem={setHoldingItem} />
      </div>
    )
  })

  const possibleCraftingsElements = possibleCraftings ? possibleCraftings
    .filter(item => item.displayName.toLowerCase().includes(possibleSearchTerm.toLowerCase()))
    .map((item, index) => (
      <PossibleCrafting key={`possible-crafting-${index}`} item={item} index={index} />
  )) : null

  return (
    <main className="recipes-main h-full grid w-9/10 max-w-200 m-auto gap-10">
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
        <div className="flex flex-row justify-between w-full">
          <h2 className="font-bold text-2xl">Items</h2>
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} placeholder="Search items" />
        </div>
          {loadingItems ? (
            <p className="p-2">Loading items...</p>
          ) : items.items.length > 0 ? (
            <div className="items-grid p-2 grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] auto-rows-min gap-2 self-center h-80 overflow-y-auto overflow-x-hidden w-full">
              {itemsElements}
              {/* Skeleton */}
              <ItemSkeleton count={items.hasMore ? 10 : 0} />
              {/* IntersectionObserver sentinel */}
              <div ref={trackingRef} className="h-1 w-full" aria-hidden />
            </div>
          ) : (
            <p className="p-2">No items found :/</p>
          )}
      </section>
      {/* Possible Craftings */}
      <section className="possible-craftings-section [grid-area:possible-craftings] border-t-2 pt-4">
        <div className="flex flex-row justify-between items-center">
          <h2 className="font-bold text-2xl">Craftings</h2>
          <SearchBar searchTerm={possibleSearchTerm} setSearchTerm={setPossibleSearchTerm} placeholder="Search craftings" />
        </div>
        <div className="possible-craftings flex flex-row gap-8 p-4 overflow-x-auto">
          {possibleCraftingsElements && possibleCraftingsElements.length > 0 ? (
            possibleCraftingsElements
          ) : (
            <p className="p-4">No possible craftings</p>
          )}
        </div>
      </section>
    </main>
  );
}

function ItemSkeleton({ count }: { count: number }) {
  const skeletons = useMemo(() => {
    const arr = Array.from({ length: count }, (_, i) => {
      return (
        <div key={`item-skeleton-${i}`} className="item border-2 border-surface-muted">
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