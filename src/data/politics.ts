import type { PoliticsCard } from '../types/game'

/**
 * 政治卡数据 - 共12张，分A/B/C三组，每组4张
 * 来源: 奥地利大饭店规则书
 *
 * Group A - 个人条件（金钱/皇帝/员工/房间数量）
 * Group B - 房间布局条件（行/列/组/颜色全满）
 * Group C - 颜色混合条件
 */
export const politicsCards: PoliticsCard[] = [
  // ===== Group A =====
  {
    id: 'pA1',
    group: 'A',
    name: '财富积累',
    condition: 'money_20',
    victoryPoints: 4,
    description: '你有 20 元。',
  },
  {
    id: 'pA2',
    group: 'A',
    name: '皇室青睐',
    condition: 'emperor_10',
    victoryPoints: 5,
    description: '你在皇帝计分轨至少到达了第 10 格。',
  },
  {
    id: 'pA3',
    group: 'A',
    name: '人事扩张',
    condition: 'staff_6',
    victoryPoints: 5,
    description: '你已经打出至少 6 张员工卡。',
  },
  {
    id: 'pA4',
    group: 'A',
    name: '大规模建设',
    condition: 'room_12',
    victoryPoints: 4,
    description: '你的酒店版图上至少有 12 个客房板块。',
  },

  // ===== Group B =====
  {
    id: 'pB1',
    group: 'B',
    name: '楼层满员',
    condition: 'row_2_full',
    victoryPoints: 6,
    description: '你的酒店版图至少有 2 行的所有客房都有人入住。',
  },
  {
    id: 'pB2',
    group: 'B',
    name: '列队整齐',
    condition: 'col_2_full',
    victoryPoints: 6,
    description: '你的酒店版图至少有 2 列的所有客房都有人入住。',
  },
  {
    id: 'pB3',
    group: 'B',
    name: '群组满员',
    condition: 'group_6_full',
    victoryPoints: 5,
    description: '你的酒店版图至少有 6 组的所有客房都有人入住。',
  },
  {
    id: 'pB4',
    group: 'B',
    name: '单色满房',
    condition: 'color_all_full',
    victoryPoints: 7,
    description: '你的酒店版图某种颜色的所有客房都有人入住。',
  },

  // ===== Group C =====
  {
    id: 'pC1',
    group: 'C',
    name: '颜色均衡',
    condition: 'color_3_each',
    victoryPoints: 5,
    description: '你每种颜色的客房都至少 3 个房间有人入住。',
  },
  {
    id: 'pC2',
    group: 'C',
    name: '红黄联盟',
    condition: 'red_4_yellow_3',
    victoryPoints: 4,
    description: '你至少有 4 个红色客房及 3 个黄色客房有人入住。',
  },
  {
    id: 'pC3',
    group: 'C',
    name: '黄蓝联盟',
    condition: 'yellow_4_blue_3',
    victoryPoints: 4,
    description: '你至少有 4 个黄色客房及 3 个蓝色客房有人入住。',
  },
  {
    id: 'pC4',
    group: 'C',
    name: '蓝红联盟',
    condition: 'blue_4_red_3',
    victoryPoints: 4,
    description: '你至少有 4 个蓝色客房及 3 个红色客房有人入住。',
  },
]
