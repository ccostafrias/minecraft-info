import type { ItemName } from "@shared/types";

export const normalizeRecipe = (inShape: ItemName[][] | undefined): ItemName[][] => {
  if (!inShape) return Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => ({name: 'empty', displayName: '', id: undefined})));

  const normalized = Array.from({ length: 3 }, (_, i) =>
    Array.from(
      { length: 3 },
      (_, j) => (inShape[i] && inShape[i][j] ? inShape[i][j] : {name: 'empty', displayName: '', id: undefined})
    )
  );
  return normalized;
};