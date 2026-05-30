import type { HotelBoardSlot } from '../types/game'

export function createHotelBoard(): HotelBoardSlot[] {
  const costs = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7],
    [8],
  ]

  const colorForRow = (row: number): 'red' | 'yellow' | 'blue' => {
    if (row === 0 || row === 1) return 'red'
    if (row === 2) return 'yellow'
    return 'blue'
  }

  const slots: HotelBoardSlot[] = []
  costs.forEach((rowCosts, row) => {
    rowCosts.forEach((cost, col) => {
      slots.push({
        row,
        col,
        cost,
        color: colorForRow(row),
        groupId: row,
        roomId: null,
      })
    })
  })
  return slots
}
