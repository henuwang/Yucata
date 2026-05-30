import type { EmperorTile } from '../types/game'

export const emperorTiles: EmperorTile[] = [
  {
    id: 'A1',
    group: 'A',
    reward: { type: 'money', amount: 3, description: '你获得 3 元' },
    penalties: [
      { type: 'money', amount: -3, description: '你失去 3 元' },
      { type: 'score', amount: -5, description: '你失去 5 分' },
    ],
  },
  {
    id: 'A2',
    group: 'A',
    reward: { type: 'food', amount: 2, description: '你获得任意 2 个餐饮' },
    penalties: [
      { type: 'lose_kitchen', description: '你必须把你厨房里所有的餐饮放回一般供应区' },
    ],
  },
  {
    id: 'A3',
    group: 'A',
    reward: { type: 'staff_draw_play', description: '抽 3 张员工卡，你可以挑选一张并打出，少付 3 元' },
    penalties: [
      { type: 'lose_staff', amount: 2, description: '你必须把你手中 2 张员工卡放回牌库底' },
      { type: 'score', amount: -5, description: '你失去 5 分' },
    ],
  },
  {
    id: 'A4',
    group: 'A',
    reward: { type: 'free_room', description: '准备一个你所挑选的客房，不需支付费用' },
    penalties: [
      { type: 'score', amount: -5, description: '你失去 5 分' },
      { type: 'remove_guest', description: '从你酒店版图最上面那排移除一个未入住的客房' },
    ],
  },
  {
    id: 'B1',
    group: 'B',
    reward: { type: 'mixed_food', description: '你获得 1 个馅饼、1 个蛋糕、1 个红酒和 1 个咖啡' },
    penalties: [
      { type: 'lose_kitchen', description: '你必须把你厨房和房客所有的餐饮都放回一般供应区' },
    ],
  },
  {
    id: 'B2',
    group: 'B',
    reward: { type: 'money', amount: 5, description: '你获得 5 元' },
    penalties: [
      { type: 'money', amount: -5, description: '你失去 5 元' },
      { type: 'score', amount: -7, description: '你失去 7 分' },
    ],
  },
  {
    id: 'B3',
    group: 'B',
    reward: { type: 'staff_draw_free', description: '抽 3 张员工卡，你可以免费打出其中一张' },
    penalties: [
      { type: 'lose_staff', amount: 3, description: '你必须把你手中 3 张卡牌放回牌库底' },
      { type: 'score', amount: -7, description: '你失去 7 分' },
    ],
  },
  {
    id: 'B4',
    group: 'B',
    reward: { type: 'free_room_built', description: '把一个任意颜色的客房板块放到第一排或第二排，并立刻翻到已入住状态' },
    penalties: [
      { type: 'score', amount: -7, description: '你失去 7 分' },
      { type: 'remove_built_room', amount: 2, description: '从最高排移除 2 个已入住的客房' },
    ],
  },
  {
    id: 'C1',
    group: 'C',
    reward: { type: 'score', amount: 8, description: '你获得 8 分' },
    penalties: [
      { type: 'score', amount: -8, description: '你失去 8 分' },
    ],
  },
  {
    id: 'C2',
    group: 'C',
    reward: { type: 'free_room_built', description: '把一个任意颜色的客房板块放到任意位置，并立刻翻到已入住状态' },
    penalties: [
      { type: 'remove_built_room', amount: 2, description: '移除 2 个已入住的客房（从最高排开始）' },
    ],
  },
  {
    id: 'C3',
    group: 'C',
    reward: { type: 'score_per_staff', description: '你打出的每张员工卡让你获得 2 分' },
    penalties: [
      { type: 'score_per_staff', amount: -2, description: '你打出的每张员工卡让你失去 2 分' },
    ],
  },
  {
    id: 'C4',
    group: 'C',
    reward: { type: 'free_staff', description: '你可以免费从手中打出一张员工卡' },
    penalties: [
      { type: 'lose_staff', amount: 1, description: '你必须从手中弃掉一张有"游戏结束"效果的员工卡' },
      { type: 'score', amount: -10, description: '你失去 10 分' },
    ],
  },
]
