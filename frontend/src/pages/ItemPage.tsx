import { useEffect } from 'react';
import { useLoaderData, Link } from 'react-router-dom'
import type { LoaderFunctionArgs } from 'react-router-dom';
import type { Meta, MinecraftItem } from '@shared/types';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Crafting } from '../components/Crafting';
import { NoCrafting } from '../components/NoCrafting';

import { TbArrowBigRightFilled } from "react-icons/tb";
import { GrFormPrevious } from 'react-icons/gr';

export async function loader({ params }: LoaderFunctionArgs) {
  const { itemId } = params

  try {
    const metaKey = 'itemsMeta';
    const meta = sessionStorage.getItem(metaKey);
    let metaResult

    if (!meta) {
      const metaResponse = await fetch('/api/itemsMeta');

      if (!metaResponse.ok) {
        metaResult = { minId: 0, maxId: 1300 } 
      } else {
        metaResult = await metaResponse.json()
      }

      sessionStorage.setItem(metaKey, JSON.stringify(metaResult));
    } else {
      metaResult = JSON.parse(meta);
    }

    const item = await fetch(`/api/item/${itemId}`)
    if (!item.ok) {
      throw new Response(`Failed to fetch item with ID "${itemId}"`, { status: item.status, statusText: item.statusText } );
    }
    const itemData = await item.json()

    const uniqueTags = await fetch('/api/tags');
    const tagsData = await uniqueTags.json();

    return { item: itemData, meta: metaResult, tags: tagsData };
  } catch (error) {
    throw error;
  }

}

export default function ItemPage() {
  const { item, meta, tags } = useLoaderData() as { item: MinecraftItem, meta: Meta, tags: string[] };

  console.log("meta: ", meta);

  useDocumentTitle(`${item.displayName} - Minecraft Recipes`);

  useEffect(() => {
    sessionStorage.setItem('lastVisitedItem', item.id.toString());
  }, [item])

  console.log('unique tags: ', tags);

  const tagElements = item.tags!.sort().map((tag) => {
    return (
      <span key={tag} className='inline-block text-[16px] capitalize cursor-default p-2 rounded-md bg-highlight text-surface-muted shadow-black shadow-2xl'>{tag}</span>
    )
  })

  return (
    <main className={`items-main items-center gap-4 ${item.recipes!.length > 0 ? 'has-recipe' : 'no-recipe'}`}>
      {/* Title */}
      <header className="item-header [grid-area:title] border-b-2 pb-4 grid grid-cols-[1fr_auto_1fr] items-center">
        {/* Previne usuário de ir além do primeiro item */}
        {item.id > meta.minId && (
          <Link to={`/item/${item.id - 1}`} className='p-2 flex flex-row items-center gap-2 hover:opacity-75' >
            <GrFormPrevious className='text-4xl md:text-xl' />
            <span className='hidden md:inline'>Previous item</span>
          </Link>
        )}

        <h1 className='text-3xl font-bold text-center col-start-2'>Item Details</h1>

        {/* Previnir usuário de ir além do último item */}
        {item.id < meta.maxId && (
          <Link to={`/item/${item.id + 1}`} className='p-2 flex flex-row items-center gap-2 justify-self-end hover:opacity-75' >
            <span className='hidden md:inline'>Next item</span>
            <GrFormPrevious className='rotate-180 text-4xl md:text-xl'/>
          </Link>
        )}
      </header>
      {/* Item */}
      <section className="item-section [grid-area:item] flex flex-col items-center justify-center py-4">
        <div className='p-4 rounded-2xl bg-highlight shadow-black/40 shadow-2xl'>
          <img
            src={`./items/${item.name}.png`}
            alt={item.displayName}
            className="block size-32 object-contain select-none pointer-events-none"
          />
        </div>
      </section>
      {/* Description */}
      <section className="[grid-area:description] flex flex-col gap-4">
          <header className='flex flex-row flex-wrap gap-x-4 items-center border-b-2 border-surface-muted pb-2'>
            <h2 className="inline-block font-bold text-2xl mb-2 text-highlight">{item.displayName}</h2>
            <span className='p-2 rounded-md border-2 border-surface-muted uppercase text-[10px] cursor-default'>{item.category}</span>
          </header>
        <div className='md:h-25 h-15 flex flex-col justify-between'>
          <p>{item.description!}</p>
        </div>
      </section>
      {/* Tags */}
      <section className="[grid-area:tags] flex flex-col gap-4 py-4 md:h-50 h-fit">
        <h2 className="font-bold text-xl">Tags:</h2>
        <div className='flex flex-row gap-2 flex-wrap'>
          {item.tags!.length > 0 && tagElements}
        </div>
      </section>
      {/* Details */}
      <section className="details-section [grid-area:details] gap-4 w-full shadow-black/40 shadow-2xl">
        {/* <h2 className="font-bold text-2xl">Item Details</h2> */}
        <ul className='rounded-2xl bg-surface-strong p-4 border-2 border-surface-muted'>
          <DetailItem label="Item Properties" />
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
        <section className="craftings-section [grid-area:craftings] flex flex-col items-center gap-4 relative md:mt-0 mt-8">
          <h2 className="font-bold text-2xl absolute -top-5 bg-surface-base px-1">Crafting Recipe</h2>
          <div className="possible-craftings flex flex-row items-center justify-center gap-2 pt-6 p-4 border-2 border-surface-muted rounded-2xl w-full">
            {item.recipes && item.recipes.length > 0 ? (
              <>
                <div className='flex'>
                  <Crafting key={`crafting-${item.id}`} crafting={item.recipes!} />
                </div>
                <TbArrowBigRightFilled className='text-4xl md:text-2xl'/>
                <div className="block-square">
                  <img
                    src={`./items/${item.name}.png`}
                    alt={item.displayName}
                    className="block size-9/10 object-contain select-none pointer-events-none"
                    />
                </div>
              </>
            ) : (
              <NoCrafting />
            )}
          </div>
        </section>
    </main>
  )
}

interface DetailItemProps {
  label: string;
  value?: string | number;
}

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <li className='flex flex-row justify-between gap-8 items-center p-2 border-b-2 border-surface-muted last:border-0'>
      <strong className='text-highlight'>{label}{value ? ":" : ""}</strong>
      <span className='whitespace-nowrap text-ellipsis inline-block max-w-full overflow-hidden h-4.5'>{value}</span>
    </li>
  )
}