import type { GuestCard } from '../types/game'

export const guestCards: GuestCard[] = [
  // Blue guests (nobles) - high VP, high requirements, expensive to recruit
  { id: 'b1', name: '大公', color: 'blue', requirements: [{ type: 'food', amount: 3 }, { type: 'wine', amount: 2 }], victoryPoints: 6, guestCost: 5 },
  { id: 'b2', name: '公爵夫人', color: 'blue', requirements: [{ type: 'coffee', amount: 2 }, { type: 'cake', amount: 2 }], victoryPoints: 5, guestCost: 4 },
  { id: 'b3', name: '伯爵', color: 'blue', requirements: [{ type: 'food', amount: 2 }, { type: 'wine', amount: 2 }, { type: 'coffee', amount: 1 }], victoryPoints: 6, guestCost: 5 },
  { id: 'b4', name: '侯爵', color: 'blue', requirements: [{ type: 'food', amount: 4 }], victoryPoints: 4, guestCost: 3 },
  { id: 'b5', name: '王子', color: 'blue', requirements: [{ type: 'wine', amount: 3 }, { type: 'cake', amount: 2 }], victoryPoints: 6, guestCost: 5 },

  // Yellow guests (artists/politicians) - medium VP, bonus resources
  { id: 'y1', name: '画家', color: 'yellow', requirements: [{ type: 'coffee', amount: 1 }], victoryPoints: 2, guestCost: 2, bonusResource: 'cake', bonusAmount: 1 },
  { id: 'y2', name: '音乐家', color: 'yellow', requirements: [{ type: 'cake', amount: 1 }], victoryPoints: 2, guestCost: 2, bonusResource: 'wine', bonusAmount: 1 },
  { id: 'y3', name: '诗人', color: 'yellow', requirements: [{ type: 'wine', amount: 1 }], victoryPoints: 2, guestCost: 2, bonusResource: 'food', bonusAmount: 1 },
  { id: 'y4', name: '舞者', color: 'yellow', requirements: [{ type: 'food', amount: 1 }], victoryPoints: 2, guestCost: 2, bonusResource: 'coffee', bonusAmount: 1 },
  { id: 'y5', name: '雕塑家', color: 'yellow', requirements: [{ type: 'food', amount: 1 }, { type: 'wine', amount: 1 }], victoryPoints: 3, guestCost: 3, bonusResource: 'money', bonusAmount: 1 },

  // Red guests (citizens) - low VP, money focus
  { id: 'r1', name: '商人', color: 'red', requirements: [{ type: 'food', amount: 1 }, { type: 'coffee', amount: 1 }], victoryPoints: 3, guestCost: 2, bonusResource: 'money', bonusAmount: 2 },
  { id: 'r2', name: '银行家', color: 'red', requirements: [{ type: 'wine', amount: 1 }, { type: 'cake', amount: 1 }], victoryPoints: 3, guestCost: 2, bonusResource: 'money', bonusAmount: 3 },
  { id: 'r3', name: '律师', color: 'red', requirements: [{ type: 'food', amount: 2 }], victoryPoints: 2, guestCost: 1, bonusResource: 'money', bonusAmount: 2 },
  { id: 'r4', name: '医生', color: 'red', requirements: [{ type: 'coffee', amount: 2 }], victoryPoints: 3, guestCost: 2, bonusResource: 'money', bonusAmount: 1 },
  { id: 'r5', name: '教授', color: 'red', requirements: [{ type: 'cake', amount: 2 }], victoryPoints: 3, guestCost: 2, bonusResource: 'money', bonusAmount: 1 },

  // Green guests (travelers) - can stay in any room
  { id: 'g1', name: '旅行商人', color: 'green', requirements: [{ type: 'food', amount: 1 }, { type: 'wine', amount: 1 }], victoryPoints: 3, guestCost: 2 },
  { id: 'g2', name: '探险家', color: 'green', requirements: [{ type: 'coffee', amount: 1 }, { type: 'cake', amount: 1 }], victoryPoints: 3, guestCost: 2 },
  { id: 'g3', name: '外交官', color: 'green', requirements: [{ type: 'food', amount: 2 }, { type: 'wine', amount: 1 }], victoryPoints: 4, guestCost: 3 },
  { id: 'g4', name: '记者', color: 'green', requirements: [{ type: 'coffee', amount: 2 }], victoryPoints: 2, guestCost: 1 },
  { id: 'g5', name: '学者', color: 'green', requirements: [{ type: 'food', amount: 1 }, { type: 'cake', amount: 1 }], victoryPoints: 3, guestCost: 2 },
]
