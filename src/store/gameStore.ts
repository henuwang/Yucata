import { create } from 'zustand'
import type { GameState, Player } from '../types/game'
import {
  initializeGame,
  rollAllDice,
  rerollUnkeptDice,
  toggleKeepDie,
  takeResourceFromDie,
  takeGuestFromLobby,
  serveGuest,
  buildRoom,
  hireStaff,
  checkEndGame,
  getNextPlayer,
  canBuildRoom,
  canHireStaff,
  canServeGuest,
} from '../game-logic/engine'

interface GameStore extends GameState {
  startGame: (playerCount: number) => void
  rollDice: () => void
  rerollDice: () => void
  lockDie: (dieId: number) => void
  useDieForResource: (dieId: number) => void
  takeGuest: (guestId: string) => void
  serveWaitingGuest: (guestId: string) => void
  constructRoom: (roomId: string) => void
  hireStaffMember: (staffId: string) => void
  endTurn: () => void
  nextPhase: () => void
  getCurrentPlayer: () => Player
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...initializeGame(2),

  startGame: (playerCount: number) => {
    set({ ...initializeGame(playerCount), logs: ['游戏开始！'] })
  },

  rollDice: () => {
    const dice = rollAllDice()
    set({ dice, phase: 'dice_roll', logs: [...get().logs, '掷出了骰子'] })
  },

  rerollDice: () => {
    const dice = rerollUnkeptDice(get().dice)
    set({ dice, logs: [...get().logs, '重掷了骰子'] })
  },

  lockDie: (dieId: number) => {
    const dice = toggleKeepDie(get().dice, dieId)
    set({ dice })
  },

  useDieForResource: (dieId: number) => {
    const state = get()
    const die = state.dice.find(d => d.id === dieId)
    if (!die || die.used) return

    const updatedDice = state.dice.map(d =>
      d.id === dieId ? { ...d, used: true } : d
    )
    const player = state.players[state.currentPlayerIndex]
    const updatedPlayer = takeResourceFromDie(player, die.value)
    const players = state.players.map((p, i) =>
      i === state.currentPlayerIndex ? updatedPlayer : p
    )

    const allUsed = updatedDice.every(d => d.used)
    const newState: Partial<GameStore> = {
      dice: updatedDice,
      players,
      logs: [...state.logs, `${player.name} 使用骰子${die.value}获取资源`],
    }
    if (allUsed) {
      newState.phase = 'action'
    }
    set(newState as GameState)
  },

  takeGuest: (guestId: string) => {
    const state = get()
    const die = state.dice.find(d => !d.used)
    if (!die) return

    const updatedDice = state.dice.map(d =>
      d.id === die.id ? { ...d, used: true } : d
    )
    const newState = takeGuestFromLobby(state, state.players[state.currentPlayerIndex].id, guestId)
    const allUsed = updatedDice.every(d => d.used)
    set({
      ...newState,
      dice: updatedDice,
      phase: allUsed ? 'action' : state.phase,
      logs: [...state.logs, `${state.players[state.currentPlayerIndex].name} 邀请了一位客人`],
    })
  },

  serveWaitingGuest: (guestId: string) => {
    const state = get()
    const player = state.players[state.currentPlayerIndex]
    const guest = player.guestWaitingArea.find(g => g.id === guestId)
    if (!guest || !canServeGuest(player, guest)) return

    const updatedPlayer = serveGuest(player, guestId)
    const players = state.players.map((p, i) =>
      i === state.currentPlayerIndex ? updatedPlayer : p
    )
    const newState = checkEndGame({ ...state, players })

    set({
      ...newState,
      players,
      logs: [...state.logs, `${player.name} 招待了${guest.name}`],
    })
  },

  constructRoom: (roomId: string) => {
    const state = get()
    const room = state.availableRooms.find(r => r.id === roomId)
    const player = state.players[state.currentPlayerIndex]
    if (!room || !canBuildRoom(player, room)) return

    const updatedPlayer = buildRoom(player, roomId)
    const players = state.players.map((p, i) =>
      i === state.currentPlayerIndex ? updatedPlayer : p
    )
    const availableRooms = state.availableRooms.filter(r => r.id !== roomId)
    const newState = checkEndGame({ ...state, players, availableRooms })

    set({
      ...newState,
      players,
      availableRooms,
      logs: [...state.logs, `${player.name} 建造了${room.name}`],
    })
  },

  hireStaffMember: (staffId: string) => {
    const state = get()
    const staff = state.availableStaff.find(s => s.id === staffId)
    const player = state.players[state.currentPlayerIndex]
    if (!staff || !canHireStaff(player, staff)) return

    const updatedPlayer = hireStaff(player, staffId)
    const players = state.players.map((p, i) =>
      i === state.currentPlayerIndex ? updatedPlayer : p
    )
    const availableStaff = state.availableStaff.filter(s => s.id !== staffId)

    set({
      ...state,
      players,
      availableStaff,
      logs: [...state.logs, `${player.name} 雇佣了${staff.name}`],
    })
  },

  endTurn: () => {
    const state = get()
    const nextIndex = getNextPlayer(state)
    const isNewRound = nextIndex === 0
    set({
      phase: 'dice_roll',
      currentPlayerIndex: nextIndex,
      turnNumber: state.turnNumber + 1,
      roundNumber: isNewRound ? state.roundNumber + 1 : state.roundNumber,
      dice: Array.from({ length: 7 }, (_, i) => ({
        id: i,
        value: 0,
        kept: false,
        used: false,
      })),
      logs: [...state.logs, `${state.players[nextIndex].name} 的回合`],
    })
  },

  nextPhase: () => {
    const state = get()
    if (state.phase === 'dice_roll') {
      if (state.dice.some(d => d.value > 0)) {
        set({ phase: 'dice_draft' })
      }
    }
  },

  getCurrentPlayer: () => {
    return get().players[get().currentPlayerIndex]
  },
}))
