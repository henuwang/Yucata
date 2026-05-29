import type { GuestCard } from '../types/game'

export const guestCards: GuestCard[] = [
  // Blue guests (nobles) - high VP, high requirements
  { id: 'b1', name: '大公', color: 'blue', requirements: [{ type: 'food', amount: 3 }, { type: 'wine', amount: 2 }], victoryPoints: 6 },
  { id: 'b2', name: '公爵夫人', color: 'blue', requirements: [{ type: 'coffee', amount: 2 }, { type: 'cake', amount: 2 }], victoryPoints: 5 },
  { id: 'b3', name: '伯爵', color: 'blue', requirements: [{ type: 'food', amount: 2 }, { type: 'wine', amount: 2 }, { type: 'coffee', amount: 1 }], victoryPoints: 6 },
  { id: 'b4', name: '侯爵', color: 'blue', requirements: [{ type: 'food', amount: 4 }], victoryPoints: 4 },
  { id: 'b5', name: '王子', color: 'blue', requirements: [{ type: 'wine', amount: 3 }, { type: 'cake', amount: 2 }], victoryPoints: 6 },

  // Grey guests (clergy) - medium VP, varied requirements
  { id: 'g1', name: '主教', color: 'grey', requirements: [{ type: 'wine', amount: 2 }, { type: 'food', amount: 1 }], victoryPoints: 4 },
  { id: 'g2', name: '枢机主教', color: 'grey', requirements: [{ type: 'coffee', amount: 2 }, { type: 'cake', amount: 1 }], victoryPoints: 4 },
  { id: 'g3', name: '修道院长', color: 'grey', requirements: [{ type: 'food', amount: 2 }], victoryPoints: 3 },
  { id: 'g4', name: '神父', color: 'grey', requirements: [{ type: 'wine', amount: 1 }, { type: 'coffee', amount: 1 }], victoryPoints: 3 },
  { id: 'g5', name: '修女', color: 'grey', requirements: [{ type: 'cake', amount: 2 }], victoryPoints: 3 },

  // Yellow guests (politicians) - medium VP, money bonuses
  { id: 'y1', name: '议员', color: 'yellow', requirements: [{ type: 'food', amount: 2 }, { type: 'coffee', amount: 1 }], victoryPoints: 4, bonusResource: 'money', bonusAmount: 2 },
  { id: 'y2', name: '市长', color: 'yellow', requirements: [{ type: 'wine', amount: 2 }, { type: 'cake', amount: 1 }], victoryPoints: 4, bonusResource: 'money', bonusAmount: 3 },
  { id: 'y3', name: '部长', color: 'yellow', requirements: [{ type: 'food', amount: 1 }, { type: 'wine', amount: 1 }, { type: 'coffee', amount: 1 }], victoryPoints: 5, bonusResource: 'money', bonusAmount: 2 },
  { id: 'y4', name: '大使', color: 'yellow', requirements: [{ type: 'coffee', amount: 2 }], victoryPoints: 3, bonusResource: 'money', bonusAmount: 3 },
  { id: 'y5', name: '总督', color: 'yellow', requirements: [{ type: 'food', amount: 3 }, { type: 'cake', amount: 1 }], victoryPoints: 5, bonusResource: 'money', bonusAmount: 2 },

  // Red guests (artists) - low VP, easy to serve
  { id: 'r1', name: '画家', color: 'red', requirements: [{ type: 'coffee', amount: 1 }], victoryPoints: 2, bonusResource: 'cake', bonusAmount: 1 },
  { id: 'r2', name: '音乐家', color: 'red', requirements: [{ type: 'cake', amount: 1 }], victoryPoints: 2, bonusResource: 'wine', bonusAmount: 1 },
  { id: 'r3', name: '诗人', color: 'red', requirements: [{ type: 'wine', amount: 1 }], victoryPoints: 2, bonusResource: 'food', bonusAmount: 1 },
  { id: 'r4', name: '舞者', color: 'red', requirements: [{ type: 'food', amount: 1 }], victoryPoints: 2, bonusResource: 'coffee', bonusAmount: 1 },
  { id: 'r5', name: '雕塑家', color: 'red', requirements: [{ type: 'food', amount: 1 }, { type: 'wine', amount: 1 }], victoryPoints: 3, bonusResource: 'money', bonusAmount: 1 },

  // Green guests (bourgeois) - low VP, money focused
  { id: 'e1', name: '商人', color: 'green', requirements: [{ type: 'food', amount: 1 }, { type: 'coffee', amount: 1 }], victoryPoints: 3, bonusResource: 'money', bonusAmount: 1 },
  { id: 'e2', name: '银行家', color: 'green', requirements: [{ type: 'wine', amount: 1 }, { type: 'cake', amount: 1 }], victoryPoints: 3, bonusResource: 'money', bonusAmount: 2 },
  { id: 'e3', name: '律师', color: 'green', requirements: [{ type: 'food', amount: 2 }], victoryPoints: 2, bonusResource: 'money', bonusAmount: 2 },
  { id: 'e4', name: '医生', color: 'green', requirements: [{ type: 'coffee', amount: 2 }], victoryPoints: 3, bonusResource: 'money', bonusAmount: 1 },
  { id: 'e5', name: '教授', color: 'green', requirements: [{ type: 'cake', amount: 2 }], victoryPoints: 3, bonusResource: 'money', bonusAmount: 1 },
]
