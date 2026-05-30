import type { HotelBoardSlot } from '../types/game'

const LAYOUT: { row: number; col: number; cost: number; color: 'red' | 'yellow' | 'blue' }[] = [
  { row: 3, col: 0, cost: 6, color: 'blue' },
  { row: 3, col: 1, cost: 7, color: 'blue' },
  { row: 3, col: 2, cost: 7, color: 'blue' },
  { row: 3, col: 3, cost: 8, color: 'blue' },
  { row: 3, col: 4, cost: 8, color: 'blue' },

  { row: 2, col: 0, cost: 4, color: 'blue' },
  { row: 2, col: 1, cost: 4, color: 'blue' },
  { row: 2, col: 2, cost: 5, color: 'yellow' },
  { row: 2, col: 3, cost: 5, color: 'yellow' },
  { row: 2, col: 4, cost: 6, color: 'yellow' },

  { row: 1, col: 0, cost: 1, color: 'yellow' },
  { row: 1, col: 1, cost: 2, color: 'yellow' },
  { row: 1, col: 2, cost: 2, color: 'yellow' },
  { row: 1, col: 3, cost: 3, color: 'red' },
  { row: 1, col: 4, cost: 3, color: 'red' },

  { row: 0, col: 0, cost: 0, color: 'red' },
  { row: 0, col: 1, cost: 0, color: 'red' },
  { row: 0, col: 2, cost: 0, color: 'red' },
  { row: 0, col: 3, cost: 1, color: 'red' },
  { row: 0, col: 4, cost: 1, color: 'red' },
]

export function createHotelBoard(): HotelBoardSlot[] {
  return LAYOUT.map(({ row, col, cost, color }) => ({
    row,
    col,
    cost,
    color,
    groupId: row,
    roomId: null,
  }))
}
