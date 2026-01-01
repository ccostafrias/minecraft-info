export interface ItemName {
  name: string;
  displayName: string;
  id: number;
}

interface Tool {
  enchantCategories: string[];
  repairWith: string[];
  maxDurability: number;
}

export interface MinecraftItem extends ItemName, Partial<Tool> {
  category?: string;
  description?: string;
  tags?: string[];
  stackSize?: number;
  recipes?: Matrix3x3<ItemName>[];
}

export interface ItemsInfo {
  items: MinecraftItem[];
  nextOffset: number;
  hasMore: boolean;
}

export interface UniqueTag {
  tag: string;
  count: number;
}

export interface UniqueCategory {
  category: string;
  count: number;
}

export interface Graph {
  [key: string]: ItemName[];
}

export interface GraphNode {
  id: string;
  image: string;
  size?: number;
}

export interface GraphEdge {
  from: string;
  to: string;
}

export interface StatsInterface {
  mostUsedItems: ItemCount[],
  itemsWithMostRecipes: ItemCount[],
  graph: {  nodes: GraphNode[]; edges: GraphEdge[] };
  uniqueTags?: UniqueTag[];
  uniqueCategories?: UniqueCategory[];
}

export interface ItemCount {
  item: ItemName;
  count: number;
}

export interface Recipe {
  result: {
    id: number;
    count: number;
  };
  inShape: Matrix3x3<ItemName>;
}

export interface RecipeMap {
  [key: Id]: MinecraftItem;
}

export type Id = number
export type Row3<T> = [T, T, T]
export type Matrix3x3<T> = [Row3<T>, Row3<T>, Row3<T>]

export interface Meta {
  count: number;
  minId: number;
  maxId: number;
}

export interface Vec2 {
  x: number;
  y: number;
}
export interface MouseStatus extends Vec2 {
  isDown: boolean;
}