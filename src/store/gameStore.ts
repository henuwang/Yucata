import { create } from 'zustand'
import type { GameState, Player } from '../types/game'
import {
  initializeGame,
  rollAllDice,
  rerollUnkeptDice,
  toggleKeepDie,
  useDieForResources,
  useDieForGuest,
  serveGuest,
  buildRoom,
  hireStaff,
  checkEndGame,
  getNextPlayer,
  startNextRound,
  canBuildRoom,
  canHireStaff,
  canServeGuest,
  getAvailableGuestColors,
} from '../game-logic/engine'

interface GameStore extends GameState {
  startGame: (playerCount: number) => void
  rollDice: () => void
  rerollDice: () => void
  lockDie: (dieId: number) => void
  confirmDice: () => void
  draftResource: (dieId: number) => void
  draftGuest: (dieId: number, guestId: string) => void
  serveWaitingGuest: (guestId: string) => void
  constructRoom: (roomId: string) => void
  hireStaffMember: (staffId: string) => void
  endAction: () => void
  getCurrentPlayer: () => Player
  getDraftableGuests: (dieId: number) => string[]
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...initializeGame(2),
  gameStarted: false,

  startGame: (playerCount: number) => {
    set(initializeGame(playerCount))
  },

  rollDice: () => {
    const dice = rollAllDice()
    set({ dice, logs: [...get().logs, `${get().players[get().currentPlayerIndex].name} 掷出了骰子`] })
  },

  rerollDice: () => {
    const state = get()
    const dice = rerollUnkeptDice(state.dice)
    set({ dice, logs: [...state.logs, `${state.players[state.currentPlayerIndex].name} 重掷了未锁定的骰子`] })
  },

  lockDie: (dieId: number) => {
    const dice = toggleKeepDie(get().dice, dieId)
    set({ dice })
  },

  confirmDice: () => {
    set({ phase: 'dice_draft', logs: [...get().logs, '开始选骰阶段'] })
  },

  draftResource: (dieId: number) => {
    const state = get()
    const next = useDieForResources(state, dieId)
    set(next)
  },

  draftGuest: (dieId: number, guestId: string) => {
    const state = get()
    const next = useDieForGuest(state, dieId, guestId)
    set(next)
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
    const checked = checkEndGame({ ...state, players })
    set({ ...checked, players })
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
    const checked = checkEndGame({ ...state, players, availableRooms })
    set({ ...checked, players, availableRooms })
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
    set({ ...state, players, availableStaff })
  },

  endAction: () => {
    const state = get()
    const nextIdx = getNextPlayer(state)
    const isRoundEnd = nextIdx === state.players.findIndex(p => p.isFirstPlayer)
    if (isRoundEnd) {
      set(startNextRound(state))
    } else {
      set({
        phase: 'action',
        currentPlayerIndex: nextIdx,
        logs: [...state.logs, `${state.players[nextIdx].name} 的行动阶段`],
      })
    }
  },

  getCurrentPlayer: () => get().players[get().currentPlayerIndex],

  getDraftableGuests: (dieId: number) => {
    const state = get()
    const die = state.dice.find(d => d.id === dieId)
    if (!die) return []
    const allowedColors = getAvailableGuestColors(die.value)
    return state.availableGuests
      .filter(g => allowedColors.includes(g.color))
      .map(g => g.id)
  },
}))
