import { useLoaderData, Link } from 'react-router-dom'
import type { LoaderFunctionArgs } from 'react-router-dom';
import type { Meta, MinecraftItem } from '@shared/types';
import { GrFormPrevious } from 'react-icons/gr';
import { Crafting } from '../components/Crafting';
import { useEffect } from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export async function loader({ params }: LoaderFunctionArgs) {
  const { itemId } = params

  try {
    const metaKey = 'itemsMeta';
    let meta = sessionStorage.getItem(metaKey);

    if (!meta) {
      const metaResponse = await fetch('/api/itemsMeta');
      if (!metaResponse.ok) {
        meta = JSON.stringify({ minId: 0, maxId: 1300 }); // Default fallback values  
      } else {
        const metaData = await metaResponse.json()
        meta = JSON.stringify(metaData);
      }
      sessionStorage.setItem(metaKey, meta);
    } else {
      meta = JSON.parse(meta);
    }

    const item = await fetch(`/api/item/${itemId}`)
    if (!item.ok) {
      throw new Response(`Failed to fetch item with ID '${itemId}'`, { status: item.status, statusText: item.statusText } );
    }
    const itemData = await item.json()

    return { item: itemData, meta }
  } catch (error) {
    throw error;
  }

}

export default function ItemPage() {
  const { item, meta } = useLoaderData() as { item: MinecraftItem, meta: Meta }

  useDocumentTitle(`${item.displayName} - Minecraft Recipes`);

  useEffect(() => {
    sessionStorage.setItem('lastVisitedItem', item.id.toString());
  }, [item])
  console.log('item data loaded:', item);

  return (
    <main className={`items-main h-full grid items-center w-9/10 max-w-200 m-auto gap-4 p-4 ${item.recipes!.length > 0 ? 'has-recipe' : 'no-recipe'}`}>
      {/* Title */}
      <header className="item-header [grid-area:title] border-b-2 pb-4 grid grid-cols-[1fr_auto_1fr] items-center">
        {/* Previne usuário de ir além do primeiro item */}
        {item.id > meta.minId ? (
          <Link to={`/item/${item.id - 1}`} className='p-2 flex flex-row items-center gap-2' >
            <GrFormPrevious className='text-4xl md:text-xl' />
            <span className='hidden md:inline'>Previous item</span>
          </Link>
        ) : <div></div>}

        <h1 className='text-3xl font-bold text-center'>Item Details</h1>

        {/* Previnir usuário de ir além do último item */}
        {item.id < meta.maxId ? (
          <Link to={`/item/${item.id + 1}`} className='p-2 flex flex-row items-center gap-2 justify-self-end' >
            <span className='hidden md:inline'>Next item</span>
            <GrFormPrevious className='rotate-180 text-4xl md:text-xl'/>
          </Link>
        ) : <div></div>}
      </header>
      {/* Item */}
      <section className="item-section [grid-area:item] flex flex-col gap-4 items-center justify-center">
        <div className='p-4 m-2 rounded-2xl bg-highlight'>
          <img
            src={`./items/${item.name}.png`}
            alt={item.displayName}
            className="block size-32 object-contain select-none pointer-events-none"
          />
        </div>
        <h2 className='text-2xl font-bold text-center whitespace-nowrap text-ellipsis overflow-hidden max-w-full'>{item.displayName}</h2>
      </section>
      {/* Details */}
      <section className="details-section [grid-area:details] gap-4 w-full">
        {/* <h2 className="font-bold text-2xl">Item Details</h2> */}
        <ul className='grid md:grid-cols-2 grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-2'>
          <DetailItem label="ID" value={item.id} />
          <DetailItem label="Name" value={item.name} />
          <DetailItem label="Stackable" value={item.stackSize! > 1 ? "Yes" : "No"} />
          {item.stackSize! > 1 && (
            <DetailItem label="Stack Size" value={item.stackSize!} />
          )}
          {/* Add more item details as needed */}
        </ul>
      </section>
      {/* Craftings */}
      {item.recipes && item.recipes.length > 0 && (
        <section className="craftings-section [grid-area:craftings] flex flex-col items-center gap-4">
          <div className="possible-craftings flex flex-row gap-8 overflow-x-auto p-2">
            <div className='flex'>
              <Crafting key={`crafting-${item.id}`} crafting={item.recipes!} />
            </div>
          </div>
          <h2 className="font-bold text-2xl">Crafting Recipe</h2>
        </section>
      )}
    </main>
  )
}

interface DetailItemProps {
  label: string;
  value: string | number;
}

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <li className='p-2 rounded-2xl bg-highlight text-surface-muted flex flex-col items-center justify-center gap-2 h-20 overflow-hidden'>
      <strong>{label}:</strong>
      <span className='whitespace-nowrap text-ellipsis inline-block max-w-full overflow-hidden h-4.5'>{value}</span>
    </li>
  )
}