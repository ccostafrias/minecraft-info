import { useState, useEffect, useRef } from 'react';
import { useLoaderData } from 'react-router-dom';
import { SearchBar } from '../components/SearchBar';
import { Item } from '../components/Item';
import type { ItemName } from '@shared/types';
import { defaultItemName } from '@shared/utils';
import { FaClock } from 'react-icons/fa';

export async function loader() {
  try {
    const response = await fetch('/api/potionsIngredients');
    if (!response.ok) {
      throw new Response('Failed to fetch potion ingredients', { status: response.status, statusText: response.statusText });
    }
    const data = await response.json();
    return { potionsIngredients: data };
  } catch (error) {
    throw error;
  } 
}

export default function Stats() {
  const { potionsIngredients } = useLoaderData();
  const [searchTerm, setSearchTerm] = useState('');

  // Holding
  const [holdingItem, setHoldingItem] = useState<ItemName | null>(null)
  const holdingItemRef = useRef<ItemName | null>(null);
  const [dragItem, setDragItem] = useState(defaultItemName());
  const isDraggingItem = useRef(false);

  console.log(potionsIngredients);


  return (
    <main className="potions-main items-center gap-4">
      <header className="potions-header [grid-area:title] border-b-2 pb-4 grid grid-cols-[1fr_auto_1fr] items-center">
        <h1 className='text-3xl font-bold text-center col-start-2'>Potion Brewing</h1>
      </header>
      {/* Brewing */}
      <section className='[grid-area:brewing]'></section>
      {/* Results */}
      <section className='[grid-area:results] bg-surface-strong gap-4 w-full p-4 rounded-2xl border-2 border-surface-muted shadow-black/40 shadow-2xl self-stretch'>
        <h2 className='text-md font-bold mb-4'>Potion Results</h2>
        <ul>
          <PotionItem />
        </ul>
      </section>
      {/* Items */}
      <section className='[grid-area:items] bg-surface-strong gap-4 w-full p-4 rounded-2xl border-2 border-surface-muted shadow-black/40 shadow-2xl'>
        <header className='flex flex-row gap-4 justify-between items-center'>
          <h2 className='text-md font-bold'>Ingredient Selector</h2>
          <SearchBar placeholder='Filter ingredients' searchTerm={searchTerm} setSearchTerm={setSearchTerm} width='120px'/>
        </header>
        <div>
          <ul className='potions-items grid grid-cols-[repeat(auto-fill,minmax(64px,1fr))] gap-2 p-1 max-h-36 overflow-y-auto mt-2'>
            {potionsIngredients.map((item: any, index: number) => {
              return (
                <div key={`item-slot-${index}`} className={`item bg-surface-strong grid place-items-center p-1 rounded-lg border-2 border-surface-muted shadow-md hover:shadow-lg cursor-pointer hover:outline-4 ${holdingItem?.name === item.name ? 'outline-4' : ''}`}>
                  <Item 
                    item={item} 
                    holdingItem={holdingItem}
                    setHoldingItem={setHoldingItem} 
                    dragItem={dragItem} 
                    setDragItem={setDragItem} 
                    showLabel={false}
                    size={12}
                  />
                </div>
              )
            })}
          </ul>
        </div>
      </section>
    </main>
  );
}

function PotionItem() {
  return (
    <div className='grid grid-cols-[auto_1fr_auto] rounded-2xl border-2 bg-surface-base border-surface-muted shadow-md p-4 pl-2 items-stretch gap-4'>
      <div className='size-18 grid place-items-center relative'>
        <img 
          className='size-9/10 disable-blur object-cover absolute trans-center'
          src="./brewing/potion.png" alt="" 
        />
        <img 
          className='size-9/10 disable-blur object-cover absolute trans-center'

          src='./brewing/potion_overlay.png' 
          alt='' 
        />
        <div
          className="size-9/10 absolute inset-0 mix-blend-multiply opacity-80 disable-blur trans-center"
          style={{ 
            backgroundColor: "#8B5CF6" ,
            WebkitMaskImage: "url('./brewing/potion_overlay.png')" ,
            WebkitMaskRepeat: "no-repeat",
            WebkitMaskSize: "contain",
            WebkitMaskPosition: "center",
            maskImage: "url('./brewing/potion_overlay.png')" ,
            maskRepeat: "no-repeat",
            maskSize: "contain",
            maskPosition: "center",
          }}
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold">Potion of Something</h3>
      </div>
      <div className='self-end flex flex-row gap-1 items-center'>
        <FaClock className="inline-block" />
        <span>3:00</span>
      </div>
    </div>
  )
}