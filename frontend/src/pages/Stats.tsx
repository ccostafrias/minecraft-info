import { useMemo } from 'react';
import { Bar, BarChart,  XAxis, YAxis } from 'recharts'
import { useLoaderData } from 'react-router-dom';
import type { ItemName, StatsInterface } from '@shared/types';
import { CraftingGraph } from '../components/CraftingGraph';

export async function loader() {
  try {
    const stats = await fetch('/api/stats');
    if (!stats.ok) {
      throw new Response(`Failed to fetch stats`, { status: stats.status, statusText: stats.statusText } );
    }
    const statsData = await stats.json()
    return { stats: statsData };
  } catch (error) {
    throw error;
  } 
}

export default function Stats() {
  const { stats } = useLoaderData() as { stats: StatsInterface };

  const { mostUsedItems, itemsWithMostRecipes, uniqueTags, uniqueCategories, graph } = stats;

  const seenMostUsedItems = useMemo(() => mostUsedItems.slice(0, 10), [mostUsedItems]);
  const mapMostUsedItems = useMemo(() => {
    const map = new Map<number, ItemName>();

    for (const itemCount of seenMostUsedItems) {
      map.set(itemCount.count, itemCount.item);
    }

    return map
  }, [mostUsedItems]);


  const seenItemsWithMostRecipes = useMemo(() => itemsWithMostRecipes.slice(0, 10), [itemsWithMostRecipes]);
  const seenUniqueTags = useMemo(() => uniqueTags!.slice(0, 10), [uniqueTags]); 

  const renderCustomBarLabel = ({ x, y, width, value }: any) => {
    const valueItem = mapMostUsedItems.get(value);
    if (!valueItem) return null;
    const imgUrl = `./items/${valueItem.name}.png` // ou map[value]
    const size = 24

    return (
      <image
        href={imgUrl}
        x={x + width / 2 - size / 2}
        y={y - size - 4}
        width={size}
        height={size}
      />
    )
  }

  return (
    <main className="stats-main items-center">
      {/* <SimpleBarChart data={seenMostUsedItems} xDataKey="item.id" yDataKey="count" customLabel={renderCustomBarLabel} /> */}
      {/* <SimpleBarChart data={seenItemsWithMostRecipes} xDataKey="item.id" yDataKey="count" /> */}
      {/* <SimpleBarChart data={seenUniqueTags} xDataKey="tag" yDataKey="count" /> */}
      {/* <SimpleBarChart data={uniqueCategories!} xDataKey="category" yDataKey="count" /> */}
      <CraftingGraph
        nodes={graph.nodes}
        edges={graph.edges}
      />
    </main>
  );
}

function SimpleBarChart({data, xDataKey, yDataKey, customLabel }: {data: any[], xDataKey: string, yDataKey: string, customLabel?: any}) {
  return (
      <BarChart
        className='p-10 w-full h-80'
        margin={{"top": 20}}
        responsive
        data={data}
        tabIndex={-1}
      >
        <XAxis
          dataKey={xDataKey}
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          dataKey={yDataKey}
          tickLine={false}
          axisLine={false}
        />
        <Bar 
          radius={[10, 10, 0, 0]}
          dataKey={yDataKey}
          label={customLabel}
          isAnimationActive={false}
          tabIndex={-1}
          fill="var(--color-surface-muted)"
        >
        </Bar>
      </BarChart>
  )
}