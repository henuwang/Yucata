import type { RoomTile } from '../types/game'

export const roomTiles: RoomTile[] = [
  // Blue rooms
  { id: 'rb1', name: '豪华套房', color: 'blue', cost: { money: 6 }, victoryPoints: 5, capacity: 2, isBuilt: false },
  { id: 'rb2', name: '贵族客房', color: 'blue', cost: { money: 5, food: 2 }, victoryPoints: 5, capacity: 2, isBuilt: false },
  { id: 'rb3', name: '皇家套房', color: 'blue', cost: { money: 8 }, victoryPoints: 7, capacity: 3, isBuilt: false },

  // Grey rooms
  { id: 'rg1', name: '标准客房', color: 'grey', cost: { money: 3 }, victoryPoints: 3, capacity: 1, isBuilt: false },
  { id: 'rg2', name: '舒适客房', color: 'grey', cost: { money: 4 }, victoryPoints: 3, capacity: 1, isBuilt: false },
  { id: 'rg3', name: '高级客房', color: 'grey', cost: { money: 5 }, victoryPoints: 4, capacity: 2, isBuilt: false },

  // Yellow rooms
  { id: 'ry1', name: '行政套房', color: 'yellow', cost: { money: 4, wine: 1 }, victoryPoints: 4, capacity: 1, isBuilt: false },
  { id: 'ry2', name: '商务客房', color: 'yellow', cost: { money: 3, coffee: 1 }, victoryPoints: 3, capacity: 1, isBuilt: false },
  { id: 'ry3', name: '外交套房', color: 'yellow', cost: { money: 5, wine: 2 }, victoryPoints: 5, capacity: 2, isBuilt: false },

  // Red rooms
  { id: 'rr1', name: '艺术套房', color: 'red', cost: { money: 3, cake: 1 }, victoryPoints: 3, capacity: 1, isBuilt: false },
  { id: 'rr2', name: '音乐客房', color: 'red', cost: { money: 2, food: 1 }, victoryPoints: 2, capacity: 1, isBuilt: false },
  { id: 'rr3', name: '创作套房', color: 'red', cost: { money: 4, coffee: 2 }, victoryPoints: 4, capacity: 2, isBuilt: false },

  // Green rooms
  { id: 're1', name: '经济客房', color: 'green', cost: { money: 2 }, victoryPoints: 2, capacity: 1, isBuilt: false },
  { id: 're2', name: '家庭套房', color: 'green', cost: { money: 3, food: 1 }, victoryPoints: 3, capacity: 2, isBuilt: false },
  { id: 're3', name: '阳台客房', color: 'green', cost: { money: 4 }, victoryPoints: 3, capacity: 1, isBuilt: false },
]
