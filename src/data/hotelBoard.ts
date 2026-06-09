import type { HotelBoardSlot, RoomColor } from '../types/game'

/**
 * 酒店版图布局
 * 共20个房间位，4行 × 5列
 *
 * 房间组合定义（共10组，每组2间相邻同色房间）:
 *   组0: (0,0)+(0,1) 红色
 *   组1: (0,2)+(0,3) 红色
 *   组2: (0,4)+(1,4) 红色 (垂直相邻)
 *   组3: (1,0)+(1,1) 黄色
 *   组4: (1,2)+(2,2) 黄色 (垂直相邻)
 *   组5: (2,3)+(2,4) 黄色
 *   组6: (2,0)+(2,1) 蓝色
 *   组7: (3,0)+(3,1) 蓝色
 *   组8: (3,2)+(3,3) 蓝色
 *   组9: (1,3)+(3,4) 混合组 (红色+蓝色, 特殊位置)
 */

interface SlotDef {
  row: number
  col: number
  color: RoomColor
  groupId: number
}

const LAYOUT: SlotDef[] = [
  // Row 3 (第四层/顶层): 5 blue - cost 3
  { row: 3, col: 0, color: 'blue', groupId: 7 },
  { row: 3, col: 1, color: 'blue', groupId: 7 },
  { row: 3, col: 2, color: 'blue', groupId: 8 },
  { row: 3, col: 3, color: 'blue', groupId: 8 },
  { row: 3, col: 4, color: 'blue', groupId: 9 },

  // Row 2 (第三层): 2 blue + 3 yellow - cost 2
  { row: 2, col: 0, color: 'blue', groupId: 6 },
  { row: 2, col: 1, color: 'blue', groupId: 6 },
  { row: 2, col: 2, color: 'yellow', groupId: 4 },
  { row: 2, col: 3, color: 'yellow', groupId: 5 },
  { row: 2, col: 4, color: 'yellow', groupId: 5 },

  // Row 1 (第二层): 3 yellow + 2 red - cost 1
  { row: 1, col: 0, color: 'yellow', groupId: 3 },
  { row: 1, col: 1, color: 'yellow', groupId: 3 },
  { row: 1, col: 2, color: 'yellow', groupId: 4 },
  { row: 1, col: 3, color: 'red', groupId: 9 },
  { row: 1, col: 4, color: 'red', groupId: 2 },

  // Row 0 (第一层/底层): 5 red - cost 0 (免费)
  { row: 0, col: 0, color: 'red', groupId: 0 },
  { row: 0, col: 1, color: 'red', groupId: 0 },
  { row: 0, col: 2, color: 'red', groupId: 1 },
  { row: 0, col: 3, color: 'red', groupId: 1 },
  { row: 0, col: 4, color: 'red', groupId: 2 },
]

const ROW_COST: Record<number, number> = { 0: 0, 1: 1, 2: 2, 3: 3 }

/**
 * 每组奖励配置
 * 颜色决定奖励类型: 红色→金钱, 黄色→皇帝轨道, 蓝色→分数
 * 组大小决定奖励数量
 */
export const GROUP_BONUS_CONFIG: Record<number, { color: RoomColor; size: number; reward: string; amount: number }> = {
  0: { color: 'red', size: 2, reward: 'money', amount: 2 },
  1: { color: 'red', size: 2, reward: 'money', amount: 2 },
  2: { color: 'red', size: 2, reward: 'money', amount: 3 },
  3: { color: 'yellow', size: 2, reward: 'emperor', amount: 1 },
  4: { color: 'yellow', size: 2, reward: 'emperor', amount: 1 },
  5: { color: 'yellow', size: 2, reward: 'emperor', amount: 1 },
  6: { color: 'blue', size: 2, reward: 'score', amount: 3 },
  7: { color: 'blue', size: 2, reward: 'score', amount: 3 },
  8: { color: 'blue', size: 2, reward: 'score', amount: 3 },
  9: { color: 'red', size: 2, reward: 'money', amount: 3 },
}

export function createHotelBoard(): HotelBoardSlot[] {
  return LAYOUT.map(({ row, col, color, groupId }) => ({
    row,
    col,
    cost: ROW_COST[row],
    color,
    groupId,
    roomId: null,
  }))
}

export function getGroupSize(groupId: number): number {
  return LAYOUT.filter(s => s.groupId === groupId).length
}

export function getGroupColor(groupId: number): RoomColor | null {
  const slots = LAYOUT.filter(s => s.groupId === groupId)
  if (slots.length === 0) return null
  // Return the dominant color of the group
  const colorCount: Record<string, number> = {}
  for (const s of slots) {
    colorCount[s.color] = (colorCount[s.color] || 0) + 1
  }
  return Object.entries(colorCount).sort((a, b) => b[1] - a[1])[0][0] as RoomColor
}
