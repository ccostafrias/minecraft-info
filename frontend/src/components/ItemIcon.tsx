import type { ItemName } from "@shared/types"

export function ItemIcon({ item, opacity }: { item: ItemName, opacity?: number }) {
  return (
    <img
      src={`./items/${item.name}.png`}
      alt={item.displayName}
      className="block size-9/10 object-contain select-none pointer-events-none"
      style={{
        opacity: `${opacity ?? 100}%`
      }}
      title={item.displayName}
    />
  )
}