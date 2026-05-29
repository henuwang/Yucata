import type { Die, GameState, Player, GuestCard, RoomTile, Resources } from '../types/game'
import { createResources } from '../types/game'
import { guestCards } from '../data/guests'
import { roomTiles } from '../data/rooms'
import { staffCards } from '../data/staff'

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function createPlayer(id: string, name: string, color: string): Player {
  return {
    id,
    name,
    color,
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
  const shuffledGuests = shuffle(guestCards)
  const shuffledRooms = shuffle(roomTiles)
  const shuffledStaff = shuffle(staffCards)

  const playerNames = ['玩家A', '玩家B', '玩家C', '玩家D']
  const playerColors = ['#4A90D9', '#E74C3C', '#2ECC71', '#F39C12']

  const players: Player[] = []
  for (let i = 0; i < playerCount; i++) {
    players.push(createPlayer(`p${i}`, playerNames[i], playerColors[i]))
  }
  players[0].isFirstPlayer = true

  const dice: Die[] = Array.from({ length: 7 }, (_, i) => ({
    id: i,
    value: 0,
    kept: false,
    used: false,
  }))

  return {
    phase: 'dice_roll',
    currentPlayerIndex: 0,
    players,
    dice,
    availableGuests: shuffledGuests.slice(0, 6),
    availableRooms: shuffledRooms.slice(0, 6),
    availableStaff: shuffledStaff.slice(0, 4),
    turnNumber: 0,
    roundNumber: 1,
    maxPlayers: playerCount,
    winner: null,
    logs: [],
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
  return dice.map(d => {
    if (d.kept) return d
    return {
      ...d,
      value: Math.floor(Math.random() * 6) + 1,
      used: false,
    }
  })
}

export function toggleKeepDie(dice: Die[], dieId: number): Die[] {
  return dice.map(d =>
    d.id === dieId ? { ...d, kept: !d.kept } : d
  )
}

const DIE_RESOURCE_MAP: Record<number, { type: keyof Resources; amount: number }> = {
  1: { type: 'food', amount: 1 },
  2: { type: 'wine', amount: 1 },
  3: { type: 'coffee', amount: 1 },
  4: { type: 'cake', amount: 1 },
  5: { type: 'money', amount: 2 },
  6: { type: 'money', amount: 2 },
}

export function takeResourceFromDie(player: Player, dieValue: number): Player {
  const resource = DIE_RESOURCE_MAP[dieValue]
  const newResources = { ...player.resources }
  newResources[resource.type] += resource.amount
  return {
    ...player,
    resources: newResources,
  }
}

export function takeGuestFromLobby(
  state: GameState,
  playerId: string,
  guestId: string
): GameState {
  const guestIndex = state.availableGuests.findIndex(g => g.id === guestId)
  if (guestIndex === -1) return state

  const guest = state.availableGuests[guestIndex]
  const players = state.players.map(p => {
    if (p.id !== playerId) return p
    return {
      ...p,
      guestWaitingArea: [...p.guestWaitingArea, guest],
    }
  })

  const availableGuests = state.availableGuests.filter((_, i) => i !== guestIndex)

  return {
    ...state,
    players,
    availableGuests,
  }
}

export function canServeGuest(player: Player, guest: GuestCard): boolean {
  const hasRoom = player.builtRooms.some(r => r.capacity > 0)
  if (!hasRoom) return false

  for (const req of guest.requirements) {
    if ((player.resources[req.type] ?? 0) < req.amount) return false
  }
  return true
}

export function serveGuest(player: Player, guestId: string): Player {
  const guestIndex = player.guestWaitingArea.findIndex(g => g.id === guestId)
  if (guestIndex === -1) return player

  const guest = player.guestWaitingArea[guestIndex]
  const newResources = { ...player.resources }
  for (const req of guest.requirements) {
    newResources[req.type] -= req.amount
  }

  let newScore = player.score + guest.victoryPoints
  if (guest.bonusResource && guest.bonusAmount) {
    newResources[guest.bonusResource] = (newResources[guest.bonusResource] ?? 0) + guest.bonusAmount
  }

  const roomIndex = player.builtRooms.findIndex(r => r.capacity > 0)
  let builtRooms = player.builtRooms
  if (roomIndex !== -1) {
    builtRooms = player.builtRooms.map((r, i) =>
      i === roomIndex ? { ...r, capacity: r.capacity - 1 } : r
    )
  }

  return {
    ...player,
    resources: newResources,
    score: newScore,
    guestWaitingArea: player.guestWaitingArea.filter((_, i) => i !== guestIndex),
    guestServedArea: [...player.guestServedArea, guest],
    builtRooms,
  }
}

export function canBuildRoom(player: Player, room: RoomTile): boolean {
  for (const [resType, amount] of Object.entries(room.cost)) {
    const res = resType as keyof Resources
    if ((player.resources[res] ?? 0) < (amount ?? 0)) return false
  }
  return true
}

export function buildRoom(player: Player, roomId: string): Player {
  const newResources = { ...player.resources }
  const existingRoom = player.builtRooms.find(r => r.id === roomId)
  if (existingRoom) return player

  const room = roomTiles.find(r => r.id === roomId)
  if (!room) return player

  for (const [resType, amount] of Object.entries(room.cost)) {
    const res = resType as keyof Resources
    newResources[res] -= amount ?? 0
  }

  return {
    ...player,
    resources: newResources,
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
  for (const player of state.players) {
    if (player.guestServedArea.length >= 7) {
      return { ...state, phase: 'game_end', winner: player }
    }
  }

  const totalRooms = roomTiles.length
  const builtRooms = state.players.reduce((sum, p) => sum + p.builtRooms.length, 0)
  if (builtRooms >= totalRooms) {
    const winner = [...state.players].sort((a, b) => b.score - a.score)[0]
    return { ...state, phase: 'game_end', winner }
  }

  return state
}

export function getNextPlayer(state: GameState): number {
  return (state.currentPlayerIndex + 1) % state.maxPlayers
}
