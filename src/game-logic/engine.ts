import type { Die, GameState, Player, GuestCard, RoomTile, Resources, GuestColor } from '../types/game'
import { createResources } from '../types/game'
import { guestCards } from '../data/guests'
import { roomTiles } from '../data/rooms'
import { staffCards } from '../data/staff'

function shuffle<T>(array: T[]): T[] {
  const a = [...array]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function createPlayer(id: string, name: string, color: string): Player {
  return {
    id, name, color,
    resources: createResources({ money: 3 }),
    score: 0,
    guestWaitingArea: [],
    guestServedArea: [],
    builtRooms: [],
    staffCards: [],
    isFirstPlayer: false,
  }
}

export function initializeGame(playerCount: number): GameState {
  const sg = shuffle(guestCards)
  const sr = shuffle(roomTiles)
  const ss = shuffle(staffCards)

  const names = ['玩家A', '玩家B', '玩家C', '玩家D']
  const colors = ['#4A90D9', '#E74C3C', '#2ECC71', '#F39C12']

  const players: Player[] = []
  for (let i = 0; i < playerCount; i++) {
    players.push(createPlayer(`p${i}`, names[i], colors[i]))
  }
  players[0].isFirstPlayer = true

  return {
    phase: 'dice_roll',
    currentPlayerIndex: 0,
    players,
    dice: Array.from({ length: 7 }, (_, i) => ({ id: i, value: 0, kept: false, used: false })),
    availableGuests: sg.slice(0, 6),
    availableRooms: sr.slice(0, 6),
    availableStaff: ss.slice(0, 4),
    roundNumber: 1,
    maxPlayers: playerCount,
    winner: null,
    logs: ['游戏开始！'],
    gameStarted: true,
  }
}

export function rollAllDice(): Die[] {
  return Array.from({ length: 7 }, (_, i) => ({
    id: i,
    value: Math.floor(Math.random() * 6) + 1,
    kept: false,
    used: false,
  }))
}

export function rerollUnkeptDice(dice: Die[]): Die[] {
  return dice.map(d => d.kept ? d : { ...d, value: Math.floor(Math.random() * 6) + 1, used: false })
}

export function toggleKeepDie(dice: Die[], dieId: number): Die[] {
  return dice.map(d => d.id === dieId ? { ...d, kept: !d.kept } : d)
}

export const DIE_RESOURCE_MAP: Record<number, { type: keyof Resources; amount: number }> = {
  1: { type: 'food', amount: 1 },
  2: { type: 'wine', amount: 1 },
  3: { type: 'coffee', amount: 1 },
  4: { type: 'cake', amount: 1 },
  5: { type: 'money', amount: 2 },
  6: { type: 'money', amount: 2 },
}

export const DIE_GUEST_COLORS: Record<number, GuestColor[]> = {
  1: ['blue', 'grey'],
  2: ['blue', 'grey'],
  3: ['yellow', 'red'],
  4: ['yellow', 'red'],
  5: ['green'],
  6: ['green'],
}

export function getAvailableGuestColors(dieValue: number): GuestColor[] {
  return DIE_GUEST_COLORS[dieValue] ?? []
}

export function useDieForResources(state: GameState, dieId: number): GameState {
  const die = state.dice.find(d => d.id === dieId)
  if (!die || die.used || !die.value) return state

  const player = state.players[state.currentPlayerIndex]
  const res = DIE_RESOURCE_MAP[die.value]
  const newRes = { ...player.resources }
  newRes[res.type] += res.amount

  const players = state.players.map((p, i) =>
    i === state.currentPlayerIndex
      ? { ...p, resources: newRes }
      : p
  )

  const dice = state.dice.map(d => d.id === dieId ? { ...d, used: true } : d)
  const nextIdx = getNextPlayer(state)

  const allUsed = dice.every(d => d.used)
  return {
    ...state,
    dice,
    players,
    currentPlayerIndex: allUsed ? state.currentPlayerIndex : nextIdx,
    phase: allUsed ? 'action' : 'dice_draft',
    logs: [...state.logs, `${player.name} 使用骰子[${die.value}]获得${res.type}×${res.amount}`],
  }
}

export function useDieForGuest(state: GameState, dieId: number, guestId: string): GameState {
  const die = state.dice.find(d => d.id === dieId)
  if (!die || die.used || !die.value) return state

  const guestIdx = state.availableGuests.findIndex(g => g.id === guestId)
  if (guestIdx === -1) return state

  const guest = state.availableGuests[guestIdx]
  const allowedColors = DIE_GUEST_COLORS[die.value]
  if (!allowedColors.includes(guest.color)) return state

  const player = state.players[state.currentPlayerIndex]

  const players = state.players.map((p, i) =>
    i === state.currentPlayerIndex
      ? { ...p, guestWaitingArea: [...p.guestWaitingArea, guest] }
      : p
  )

  const dice = state.dice.map(d => d.id === dieId ? { ...d, used: true } : d)
  const availableGuests = state.availableGuests.filter((_, i) => i !== guestIdx)
  const nextIdx = getNextPlayer(state)

  const allUsed = dice.every(d => d.used)
  return {
    ...state,
    dice,
    players,
    availableGuests,
    currentPlayerIndex: allUsed ? state.currentPlayerIndex : nextIdx,
    phase: allUsed ? 'action' : 'dice_draft',
    logs: [...state.logs, `${player.name} 使用骰子[${die.value}]邀请${guest.name}(${guest.color})`],
  }
}

export function canServeGuest(player: Player, guest: GuestCard): boolean {
  const hasRoom = player.builtRooms.some(r => r.capacity > 0)
  if (!hasRoom) return false
  return guest.requirements.every(req => (player.resources[req.type] ?? 0) >= req.amount)
}

export function serveGuest(player: Player, guestId: string): Player {
  const idx = player.guestWaitingArea.findIndex(g => g.id === guestId)
  if (idx === -1) return player

  const guest = player.guestWaitingArea[idx]
  const newRes = { ...player.resources }
  guest.requirements.forEach(req => { newRes[req.type] -= req.amount })

  let newScore = player.score + guest.victoryPoints
  if (guest.bonusResource && guest.bonusAmount) {
    newRes[guest.bonusResource] += guest.bonusAmount
  }

  const roomIdx = player.builtRooms.findIndex(r => r.capacity > 0)
  const builtRooms = roomIdx !== -1
    ? player.builtRooms.map((r, i) => i === roomIdx ? { ...r, capacity: r.capacity - 1 } : r)
    : player.builtRooms

  return {
    ...player,
    resources: newRes,
    score: newScore,
    guestWaitingArea: player.guestWaitingArea.filter((_, i) => i !== idx),
    guestServedArea: [...player.guestServedArea, guest],
    builtRooms,
  }
}

export function canBuildRoom(player: Player, room: RoomTile): boolean {
  return Object.entries(room.cost).every(([type, amount]) =>
    (player.resources[type as keyof Resources] ?? 0) >= (amount ?? 0)
  )
}

export function buildRoom(player: Player, roomId: string): Player {
  const room = roomTiles.find(r => r.id === roomId)
  if (!room || player.builtRooms.some(r => r.id === roomId)) return player

  const newRes = { ...player.resources }
  Object.entries(room.cost).forEach(([type, amount]) => {
    newRes[type as keyof Resources] -= amount ?? 0
  })

  return {
    ...player,
    resources: newRes,
    score: player.score + room.victoryPoints,
    builtRooms: [...player.builtRooms, { ...room, isBuilt: true }],
  }
}

export function canHireStaff(player: Player, staff: { cost: number }): boolean {
  return player.resources.money >= staff.cost
}

export function hireStaff(player: Player, staffId: string): Player {
  const staff = staffCards.find(s => s.id === staffId)
  if (!staff) return player
  return {
    ...player,
    resources: { ...player.resources, money: player.resources.money - staff.cost },
    score: player.score + staff.victoryPoints,
    staffCards: [...player.staffCards, staff],
  }
}

export function checkEndGame(state: GameState): GameState {
  for (const p of state.players) {
    if (p.guestServedArea.length >= 7) {
      return { ...state, phase: 'game_end', winner: p, logs: [...state.logs, `${p.name} 招待了7位客人，游戏结束！`] }
    }
  }
  const built = state.players.reduce((s, p) => s + p.builtRooms.length, 0)
  if (built >= roomTiles.length) {
    const winner = [...state.players].sort((a, b) => b.score - a.score)[0]
    return { ...state, phase: 'game_end', winner, logs: [...state.logs, `所有房间已建成，${winner.name} 获胜！`] }
  }
  return state
}

export function getNextPlayer(state: GameState): number {
  return (state.currentPlayerIndex + 1) % state.maxPlayers
}

export function getNextRoller(state: GameState): number {
  return (state.players.findIndex(p => p.isFirstPlayer) + 1) % state.maxPlayers
}

export function startNextRound(state: GameState): GameState {
  const nextFirst = getNextRoller(state)
  const players = state.players.map((p, i) => ({ ...p, isFirstPlayer: i === nextFirst }))
  return {
    ...state,
    phase: 'dice_roll',
    currentPlayerIndex: nextFirst,
    players,
    dice: Array.from({ length: 7 }, (_, i) => ({ id: i, value: 0, kept: false, used: false })),
    roundNumber: state.roundNumber + 1,
    logs: [...state.logs, `--- 第${state.roundNumber + 1}轮 ---`],
  }
}
