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
  stackSize?: number;
  recipes?: Matrix3x3<ItemName>[];
}

export interface ItemsInfo {
  items: MinecraftItem[];
  nextOffset: number;
  hasMore: boolean;
}

export interface Recipe<T> {
  result: {
    id: number;
    count: number;
  };
  inShape: Matrix3x3<T>;
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