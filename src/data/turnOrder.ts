import type { TurnOrderTile } from '../types/game'

/**
 * 回合顺位板块数据 - 共9个
 * 每个板块有唯一的顺位编号和对应的额外行动。
 *
 * 额外行动类型（从规则书提取）:
 * 1. +1 die on the chosen action (only once per turn)
 *    支付1元，可选一个行动区，该行动区视为多1颗骰子
 * 2. move up to 3 dishes and drinks from your kitchen onto your guest cards
 *    从厨房移动最多3个餐饮到客人卡
 * 3. place a wooden disk on a Politics card, if you meet the condition
 *    放置政治圆片到政治卡
 * 4. use a Staff card with a once-per-round effect
 *    使用一张每轮一次的员工卡能力
 * 5. move 1 guest with completed order to a free room
 *    移动一位订单完成的客人到空房间
 *
 * 顺位号越小，表示回合越靠前。但额外行动越少。
 * 顺位号越大，表示回合越靠后。但额外行动越多（补偿机制）。
 */
export const turnOrderTiles: TurnOrderTile[] = [
  {
    id: 'to1',
    number: 1,
    extraActions: ['add_die'],
    nameCn: '第一顺位',
  },
  {
    id: 'to2',
    number: 2,
    extraActions: ['add_die', 'move_kitchen'],
    nameCn: '第二顺位',
  },
  {
    id: 'to3',
    number: 3,
    extraActions: ['add_die', 'move_kitchen', 'place_politics'],
    nameCn: '第三顺位',
  },
  {
    id: 'to4',
    number: 4,
    extraActions: ['add_die', 'move_kitchen', 'place_politics', 'use_staff_ability'],
    nameCn: '第四顺位',
  },
  {
    id: 'to5',
    number: 5,
    extraActions: ['add_die', 'move_kitchen', 'place_politics', 'use_staff_ability', 'move_guest'],
    nameCn: '第五顺位',
  },
  {
    id: 'to6',
    number: 6,
    extraActions: ['add_die', 'move_kitchen', 'place_politics', 'use_staff_ability', 'move_guest'],
    nameCn: '第六顺位',
  },
  {
    id: 'to7',
    number: 7,
    extraActions: ['add_die', 'move_kitchen', 'place_politics', 'use_staff_ability', 'move_guest'],
    nameCn: '第七顺位',
  },
  {
    id: 'to8',
    number: 8,
    extraActions: ['add_die', 'move_kitchen', 'place_politics', 'use_staff_ability', 'move_guest'],
    nameCn: '第八顺位',
  },
  {
    id: 'to9',
    number: 9,
    extraActions: ['add_die', 'move_kitchen', 'place_politics', 'use_staff_ability', 'move_guest'],
    nameCn: '第九顺位',
  },
]
