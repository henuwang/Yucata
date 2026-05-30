import type { HotelBoardSlot } from '../types/game'

const LAYOUT: { row: number; col: number; color: 'red' | 'yellow' | 'blue' }[] = [
  // Row 3 (第四层/顶层): 5 blue - cost 3
  { row: 3, col: 0, color: 'blue' },
  { row: 3, col: 1, color: 'blue' },
  { row: 3, col: 2, color: 'blue' },
  { row: 3, col: 3, color: 'blue' },
  { row: 3, col: 4, color: 'blue' },

  // Row 2 (第三层): 2 blue + 3 yellow - cost 2
  { row: 2, col: 0, color: 'blue' },
  { row: 2, col: 1, color: 'blue' },
  { row: 2, col: 2, color: 'yellow' },
  { row: 2, col: 3, color: 'yellow' },
  { row: 2, col: 4, color: 'yellow' },

  // Row 1 (第二层): 3 yellow + 2 red - cost 1
  { row: 1, col: 0, color: 'yellow' },
  { row: 1, col: 1, color: 'yellow' },
  { row: 1, col: 2, color: 'yellow' },
  { row: 1, col: 3, color: 'red' },
  { row: 1, col: 4, color: 'red' },

  // Row 0 (第一层/底层): 5 red - cost 0 (免费)
  { row: 0, col: 0, color: 'red' },
  { row: 0, col: 1, color: 'red' },
  { row: 0, col: 2, color: 'red' },
  { row: 0, col: 3, color: 'red' },
  { row: 0, col: 4, color: 'red' },
]

const ROW_COST: Record<number, number> = { 0: 0, 1: 1, 2: 2, 3: 3 }

export function createHotelBoard(): HotelBoardSlot[] {
  return LAYOUT.map(({ row, col, color }) => ({
    row,
    col,
    cost: ROW_COST[row],
    color,
    groupId: row,
    roomId: null,
  }))
}
