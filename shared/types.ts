export interface MinecraftItem {
  id: number;
  name: string;
  displayName: string;
  stackSize?: number;
  recipe?: Recipe;
  recipes?: Matrix3x3<ItemName>[];
  enchantCategories?: string[];
  repairWith?: string[];
  maxDurability?: number;
}

export interface ItemsInfo {
  items: MinecraftItem[];
  nextOffset: number;
  hasMore: boolean;
}

export interface ItemName {
  name: string;
  displayName: string;
  id?: number;
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