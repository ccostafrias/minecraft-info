import React from 'react'
import { useLoaderData, Link } from 'react-router-dom'
import type { LoaderFunctionArgs } from 'react-router-dom';
import type { MinecraftItem } from '@shared/types';
import { GrFormPrevious } from 'react-icons/gr';
import { Crafting } from '../components/Crafting';


export async function loader({ params }: LoaderFunctionArgs) {
  const { itemId } = params

  try {
    let item: Response;

    if (isNaN(Number(itemId))) {
      item = await fetch(`/api/itemName/${itemId}`);
    } else {
      item = await fetch(`/api/itemId/${itemId}`);
    }
    const itemData = await item.json()

    return { item: itemData }
  } catch (error) {
    console.error('Error loading item data:', error);
    throw error;
  }

}

export default function ItemPage() {
  const { item } = useLoaderData() as { item: MinecraftItem }
  console.log('item data loaded:', item);

  const craftingElements = (item.recipes && item.recipes.length > 0)
    ? ( 
      item.recipes.map((recipe, _) => {
        return (
          <div className='flex'>
            <Crafting crafting={recipe.inShape.flat()} />
          </div>
        )
      })

    ) : <p className="">No possible craftings</p> 

  return (
    <main className="items-main h-full grid items-ce w-9/10 max-w-200 m-auto gap-10">
      {/* Title */}
      <header className="item-header [grid-area:title] border-b-2 pb-4 grid grid-cols-[1fr_auto_1fr] items-center">
        {/* Previne usuário de ir além do primeiro item */}
        {item.id > 0 ? (
          <Link to={`/item/${item.id - 1}`} className='p-2 flex flex-row items-center gap-2' >
            <GrFormPrevious className='text-4xl md:text-xl' />
            <span className='invisible md:visible'>Previous item</span>
          </Link>
        ) : <div></div>}

        <h1 className='text-3xl font-bold text-center'>Item Details</h1>

        {/* Previnir usuário de ir além do último item */}
        {item.id < 1000 ? (
          <Link to={`/item/${item.id + 1}`} className='p-2 flex flex-row items-center gap-2 justify-self-end' >
            <span className='invisible md:visible'>Next item</span>
            <GrFormPrevious className='rotate-180 text-4xl md:text-xl'/>
          </Link>
        ) : <div></div>}
      </header>
      {/* Item */}
      <section className="item-section [grid-area:item] flex flex-col gap-4 items-center justify-center">
        <div className='p-4 rounded-2xl bg-highlight'>
          <img
            src={`./items/${item.name}.png`}
            alt={item.displayName}
            className="block size-32 object-contain select-none pointer-events-none"
          />
        </div>
        <h2 className='text-2xl font-bold text-center'>{item.displayName}</h2>
      </section>
      {/* Details */}
      <section className="details-section [grid-area:details] flex flex-col gap-4 w-full self-center">
        {/* <h2 className="font-bold text-2xl">Item Details</h2> */}
        <ul className='flex flex-col gap-2'>
          <DetailItem label="ID" value={item.id} />
          <DetailItem label="Name" value={item.name} />
          <DetailItem label="Stackable" value={item.stackSize > 1 ? "Yes" : "No"} />
          {item.stackSize > 1 && (
            <DetailItem label="Stack Size" value={item.stackSize} />
          )}
          {/* Add more item details as needed */}
        </ul>
      </section>
      {/* Craftings */}
      <section className="craftings-section [grid-area:craftings] flex flex-col gap-4 border-t-2 pt-4">
        <h2 className="font-bold text-2xl">Crafting {item.displayName}</h2>
        <div className="possible-craftings flex flex-row gap-8 p-4 overflow-x-auto">
          {craftingElements}
        </div>
        {/* Crafting recipes would go here */}
      </section>
    </main>
  )
}

interface DetailItemProps {
  label: string;
  value: string | number;
}

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <li className='p-2 rounded-2xl bg-highlight text-surface-muted'>
      <strong>{label}:</strong> {value}
    </li>
  )
}