export function normalizeMatrix(matrix: number[][]): number[][] {
  let top = 0
  let bottom = matrix.length - 1
  let left = 0
  let right = matrix[0].length - 1

  const isRowEmpty = (row: number[]) => row.every(v => v === 0)

  while (top <= bottom && isRowEmpty(matrix[top])) top++
  while (top <= bottom && isRowEmpty(matrix[bottom])) bottom--

  const isColEmpty = (col: number) => {
    for (let i = top; i <= bottom; i++) {
      if (matrix[i][col] !== 0) return false
    }
    return true
  }

  while (left <= right && isColEmpty(left)) left++
  while (left <= right && isColEmpty(right)) right--

  if (top > bottom || left > right) {
    return [[0]]
  }

  const result: number[][] = []
  for (let i = top; i <= bottom; i++) {
    result.push(matrix[i].slice(left, right + 1))
  }

  return result
}


export function matchesAt(
  big: number[][],
  small: number[][],
  startY: number,
  startX: number
): boolean {
  for (let y = 0; y < small.length; y++) {
    for (let x = 0; x < small[0].length; x++) {
      const wanted = small[y][x]
      const current = big[startY + y][startX + x]

      if (wanted !== 0 && wanted !== current) {
        return false
      }
    }
  }
  return true
}

export function containsSubmatrix(
  big: number[][],
  small: number[][]
): boolean {
  const H = big.length
  const W = big[0].length
  const h = small.length
  const w = small[0].length

  if (h > H || w > W) return false

  for (let y = 0; y <= H - h; y++) {
    for (let x = 0; x <= W - w; x++) {
      if (matchesAt(big, small, y, x)) {
        return true
      }
    }
  }

  return false
}

export function toMatrix2D(arr: number[], width: number): number[][] {
  if (arr.length % width !== 0) {
    throw new Error('Array não pode ser convertido para matriz')
  }

  const matrix: number[][] = []

  for (let i = 0; i < arr.length; i += width) {
    matrix.push(arr.slice(i, i + width))
  }

  return matrix
}

export const normalizeRecipe = (inShape: number[][] | undefined) => {
  if (!inShape) return Array.from({ length: 9 }, () => ({name: 'empty', displayName: ''}));

  const normalized = Array.from({ length: 3 }, (_, i) =>
    Array.from(
      { length: 3 },
      (_, j) => (inShape[i] && inShape[i][j] ? inShape[i][j] : {name: 'empty', displayName: ''})
    )
  );
  return normalized;
};