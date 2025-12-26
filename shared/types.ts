export interface MinecraftItem {
  id: number;
  name: string;
  displayName: string;
  stackSize: number;
  recipe?: Recipe | null;
  recipes?: Recipe[];
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
  inShape: ItemName[][];
}
