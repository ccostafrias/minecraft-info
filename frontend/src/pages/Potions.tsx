import { useState, useEffect, useRef, useMemo } from 'react';
import { useLoaderData } from 'react-router-dom';
import { SearchBar } from '../components/SearchBar';
import { Item } from '../components/Item';
import { Slot as PotionSlot } from '../components/Slot';
import { ItemIcon } from '../components/ItemIcon';
import { PotionIcon } from '../components/PotionIcon';

import type { ItemName, PotionEffect, PotionInstance } from '@shared/types';
import { capitalize, convertSeconds, defaultPotionInstance } from '@shared/utils';
import { defaultItemName } from '@shared/utils';
import { FaClock } from 'react-icons/fa';
import { shortify } from '@shared/utils';

export async function loader() {
  try {
    const ingredientsRes = await fetch('/api/potionsIngredients');
    if (!ingredientsRes.ok) {
      throw new Response('Failed to fetch potion ingredients', { status: ingredientsRes.status, statusText: ingredientsRes.statusText });
    }
    const potionsIngredients = await ingredientsRes.json();

    const potionsRes = await fetch('/api/potionsInstances');
    if (!potionsRes.ok) {
      throw new Response('Failed to fetch potions', { status: potionsRes.status, statusText: potionsRes.statusText });
    }

    const potions: PotionInstance[] = await potionsRes.json();
    return { potionsIngredients, potions };
  } catch (error) {
    throw error;
  } 
}

export default function Potions() {
  const { potionsIngredients, potions }: { potionsIngredients: ItemName[]; potions: PotionInstance[] } = useLoaderData();
  const [searchTerm, setSearchTerm] = useState('');

  // Holding
  const [holdingItem, setHoldingItem] = useState<ItemName | null>(null)
  const holdingItemRef = useRef<ItemName | null>(null);
  const [dragItem, setDragItem] = useState(defaultItemName());
  const isDraggingItem = useRef(false);

  const [ingredient, setIngredient] = useState<ItemName>(defaultItemName());
  const [potion, setPotion] = useState<PotionInstance>(defaultPotionInstance());
  const [potionResults, setPotionResults] = useState<Required<PotionInstance>[]>([]);

  useEffect(() => {
    holdingItemRef.current = holdingItem;
  }, [holdingItem])

  useEffect(() => {
    isDraggingItem.current = dragItem.id !== defaultItemName().id;
  }, [dragItem])

  useEffect(() => {
    // if (ingredient.name === '' && potion.name === '') {
    //   return
    // }

    const controller = new AbortController()

    const timeout = setTimeout(async () => {

      try {
        const data = await fetch(`/api/potionResults?ingredient=${ingredient.name}&potion=${shortify(potion)}`, {
          signal: controller.signal
        })

        const dataJson = await data.json()
        setPotionResults(dataJson)

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
  }, [ingredient, potion])

  const changeIngredient = (_: any, newItem: ItemName) => {
    setIngredient(newItem);
  }

  const changePotion = (_: any, newItem: PotionInstance) => {
    setPotion(newItem);
  }

  const filtered = (arr: any[]) => {
    return arr.filter((item: ItemName) => {
      if (!searchTerm) return true;

      const low = searchTerm.toLowerCase()
      return item.displayName.toLowerCase().includes(low) || item.name.toLowerCase().includes(low);
    })
  }

  const ingredientsFiltered = useMemo(() => filtered(potionsIngredients), [potionsIngredients, searchTerm]);
  const potionsFiltered = useMemo(() => filtered(potions), [potions, searchTerm]);

  return (
    <main className="potions-main gap-4">
      <header className="potions-header [grid-area:title] border-b-2 pb-4 grid grid-cols-[1fr_auto_1fr] items-center">
        <h1 className='text-3xl font-bold text-center col-start-2'>Potion Brewing</h1>
      </header>
      {/* Brewing */}
      <section className='[grid-area:brewing] self-center grid place-items-center'>
        {/* <h3 className='font-bold mb-2'>Ingredient</h3> */}
        <div className="rounded-xl size-20 bg-highlight cursor-pointer hover:outline-4">
          <PotionSlot
            index={0}
            item={ingredient}
            holdingItemRef={holdingItemRef} 
            setHoldingItem={setHoldingItem} 
            isDraggingRef={isDraggingItem} 
            setDragItem={setDragItem}
            changeSlot={changeIngredient}
            setSearchTerm={setSearchTerm}
          >
            {(renderItem, { isHoldingInside, isSameItemAsHolding }) => (
              <ItemIcon item={renderItem} opacity={isHoldingInside && !isSameItemAsHolding ? 50 : undefined} />
            )}
          </PotionSlot>
        </div>
        <div className='flex flex-row gap-2 mt-4'>
          {Array.from({ length: 3 }).map((_, index: number) => {
            return (
              <div 
                key={`brewing-slot-${index}`} 
                className="rounded-xl relative size-20 bg-highlight cursor-pointer hover:outline-4"
                style={{
                  top: index === 1 ? '36px' : '0px',
                }}
              >
                <PotionSlot
                  index={index}
                  item={potion}
                  holdingItemRef={holdingItemRef} 
                  setHoldingItem={setHoldingItem} 
                  isDraggingRef={isDraggingItem} 
                  setDragItem={setDragItem}
                  changeSlot={changePotion}
                  setSearchTerm={setSearchTerm}
                >
                  {(renderItem: PotionInstance, { isHoldingInside, isSameItemAsHolding }) => (
                    <div className='[grid-area:icon] size-18 grid place-items-center relative'>
                      <PotionIcon potion={renderItem} opacity={isHoldingInside && !isSameItemAsHolding ? 50 : undefined} />
                    </div>
                    // <ItemIcon item={renderItem} opacity={isHoldingInside && !isSameItemAsHolding ? 50 : undefined} />
                  )}
                </PotionSlot>
              </div>
            )
          })}
        </div>
      </section>
      {/* Results */}
      <section className='[grid-area:results] bg-surface-strong w-full p-4 rounded-2xl border-2 border-surface-muted shadow-black/40 shadow-2xl'>
        <div className='grid grid-rows-[auto_1fr] gap-4 h-full'>
          <h2 className='text-md font-bold'>Potion Results</h2>
          <ul className='overflow-y-auto scrollbar flex flex-col gap-4'>
            {potionResults.length === 0 ? (
              <p>No results :/</p>
            ) : (
              <>
                {potionResults.map((potion: Required<PotionInstance>) => {
                  return (
                    <PotionItem potion={potion} />
                  )
                })}
              </>
            )}
          </ul>
        </div>
      </section>
      {/* Items */}
      <section className='[grid-area:items] bg-surface-strong flex flex-col gap-2 w-full p-4 rounded-2xl border-2 border-surface-muted shadow-black/40 shadow-2xl'>
        <header className='flex flex-row gap-4 justify-between items-center border-b-2 border-surface-muted pb-2'>
          <h2 className='text-md font-bold'>Selector</h2>
          <SearchBar placeholder='Filter ingredients' searchTerm={searchTerm} setSearchTerm={setSearchTerm} width='120px'/>
        </header>
        <div className='scrollbar overflow-y-auto flex flex-col gap-4'>
          {ingredientsFiltered.length > 0 && (
            <div className='flex flex-col gap-2'>
              <h3 className=''>Ingredients</h3>
              <ul className='potions-items gap-2 p-1 grid grid-cols-[repeat(auto-fill,minmax(64px,1fr))]'>
                {ingredientsFiltered
                  .map((item: ItemName, index: number) => {
                    return (
                      <div 
                        key={`item-ingredient-slot-${index}`} 
                        className={`item bg-surface-strong grid place-items-center p-1 rounded-lg border-2 border-surface-muted shadow-md hover:shadow-lg cursor-pointer hover:outline-4 ${holdingItem?.id === item.id ? 'outline-4' : ''}`}
                        // onClick={() => changeSlot(index, item)}
                        title={item.displayName}
                      >
                        <Item 
                          item={item} 
                          holdingItem={holdingItem}
                          setHoldingItem={setHoldingItem} 
                          dragItem={dragItem} 
                          setDragItem={setDragItem} 
                          showLabel={false}
                          size={12}
                        >
                          {(item: ItemName) => (
                            <ItemIcon item={item} />
                          )}
                        </Item>
                      </div>
                    )
                  })
                }
              </ul>
            </div>
          )}
          {potionsFiltered.length > 0 && (
            <div className='flex flex-col gap-2'>
              <h3 className=''>Potions</h3>
              <ul className='potions-items gap-2 p-1 grid grid-cols-[repeat(auto-fill,minmax(64px,1fr))]'>
                {potionsFiltered
                  .map((potion: PotionInstance, index: number) => {
                    return (
                      <div 
                        key={`item-potion-slot-${index}`} 
                        className={`item bg-surface-strong grid place-items-center p-1 rounded-lg border-2 border-surface-muted shadow-md hover:shadow-lg cursor-pointer hover:outline-4 ${holdingItem?.id === potion.id ? 'outline-4' : ''}`}
                        // onClick={() => changeSlot(index, item)}
                        title={`${capitalize(potion.form)} ${potion.displayName}`}
                      >
                        <Item 
                          item={potion} 
                          holdingItem={holdingItem}
                          setHoldingItem={setHoldingItem} 
                          dragItem={dragItem} 
                          setDragItem={setDragItem} 
                          showLabel={false}
                          size={12}
                        >
                          {(item: PotionInstance) => (
                            <PotionIcon potion={item} />
                          )}
                        </Item>
                      </div>
                    )
                  })
                }
              </ul>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

interface PotionItemProps {
  potion: Required<PotionInstance>;
}

function PotionItem({ potion }: PotionItemProps) {
  const { displayName, color, variant, effectVariant } = potion;
  const variantItem = variant === 'longer' ? 'redstone' : variant === 'stronger' ? 'glowstone_dust' : null;

  return (
    <li className='potion-card grid items-center rounded-2xl border-2 border-surface-muted shadow-md p-4 pl-2 gap-2'>
      <div className='[grid-area:icon] size-18 grid place-items-center relative'>
        <PotionIcon potion={potion} />
        {variantItem && (
          <img
            className='size-9/20 disable-blur object-cover absolute bottom-0 right-1'
            src={`./items/${variantItem}.png`}
          />
        )}
      </div>
      <h3 className="[grid-area:title] text-lg font-semibold">{displayName}</h3>
      <div className='[grid-area:description] flex flex-col gap-1'>
        <div className='flex flex-row gap-1'>
          {effectVariant.applies.map((effect: PotionEffect, index: number) => (
            <span 
              key={`effect-line-${index}`} 
              style={{
                color: color,
              }} 
              className="text-[15px] font-semibold text-shadow-2xs"
            >
              +{effect.name}
            </span>
          ))}
        </div>
        <p className='text-[13px] indent-1 hyphens-auto'>{effectVariant.description}</p>
      </div>
      {effectVariant.duration > 0 && (
        <div className='[grid-area:time] self-end flex flex-row gap-1 items-center'>
          <FaClock className="inline-block" />
          <span>{convertSeconds(effectVariant.duration)}</span>
        </div>
      )}
    </li>
  )
}