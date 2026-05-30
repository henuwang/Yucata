import { create } from 'zustand'
import type { GameState, Player } from '../types/game'
import {
  initializeGame,
  rollAllDice,
  rerollUnkeptDice,
  toggleKeepDie,
  inviteGuest,
  serveGuest,
  buildRoom,
  hireStaff,
  getNextPlayer,
  startNextRound,
  canBuildRoom,
  canHireStaff,
  canServeGuest,
  canInviteGuest,
  getActionAreaCounts,
  getTotalUnusedDice,
  performAreaAction1,
  performAreaAction2,
  performAreaAction3,
  performAreaAction4,
  performAreaAction5,
  performAreaAction6,
  performEmperorScoring,
  performFinalScoring,
  pickSetupGuest,
  placeSetupRoom,
  skipSetupRoom,
  drawStaffCardsForPlayer,
} from '../game-logic/engine'

interface GameStore extends GameState {
  startGame: (playerCount: number) => void
  drawStaffCards: () => void
  pickSetupGuest: (guestId: string) => void
  placeSetupRoom: (roomId: string, slotRow: number, slotCol: number) => void
  skipSetupRoom: () => void
  rollDice: () => void
  rerollDice: () => void
  lockDie: (dieId: number) => void
  confirmDice: () => void
  takeAreaAction: (areaValue: number, subAction?: string) => void
  inviteGuestAction: (guestId: string) => void
  serveWaitingGuest: (guestId: string) => void
  constructRoom: (roomId: string) => void
  hireStaffMember: (staffId: string) => void
  endAction: () => void
  getCurrentPlayer: () => Player
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...initializeGame(2),
  gameStarted: false,

  startGame: (playerCount: number) => {
    set(initializeGame(playerCount))
  },

  drawStaffCards: () => {
    const next = drawStaffCardsForPlayer(get())
    set({ ...next })
  },

  pickSetupGuest: (guestId: string) => {
    const next = pickSetupGuest(get(), guestId)
    set({ ...next })
  },

  placeSetupRoom: (roomId: string, slotRow: number, slotCol: number) => {
    const next = placeSetupRoom(get(), roomId, slotRow, slotCol)
    set({ ...next })
  },

  skipSetupRoom: () => {
    const next = skipSetupRoom(get())
    set({ ...next })
  },

  rollDice: () => {
    const state = get()
    const dice = rollAllDice(state.dice.length)
    set({ dice, logs: [...state.logs, `${state.players[state.currentPlayerIndex].name} 掷出了骰子`] })
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
    const state = get()
    const counts = getActionAreaCounts(state.dice)
    const logText = `开始行动区分配: 区1(${counts[1]}) 区2(${counts[2]}) 区3(${counts[3]}) 区4(${counts[4]}) 区5(${counts[5]}) 区6(${counts[6]})`
    set({ phase: 'dice_draft', logs: [...state.logs, logText] })
  },

  takeAreaAction: (areaValue: number, subAction?: string) => {
    const state = get()
    let next: GameState

    switch (areaValue) {
      case 1:
        next = performAreaAction1(state, parseInt(subAction || '0'))
        break
      case 2:
        next = performAreaAction2(state, parseInt(subAction || '0'))
        break
      case 3:
        next = performAreaAction3(state, subAction || '')
        break
      case 4:
        next = performAreaAction4(state, parseInt(subAction || '0'))
        break
      case 5:
        next = performAreaAction5(state, subAction || '')
        break
      case 6: {
        const parts = (subAction || '').split('|')
        next = performAreaAction6(state, parseInt(parts[0] || '0'), parts[1] || '')
        break
      }
      default:
        return
    }

    if (getTotalUnusedDice(next.dice) === 0) {
      set({ ...next, phase: 'action', logs: [...next.logs, '所有骰子已用完，进入行动阶段'] })
    } else {
      set({ ...next })
    }
  },

  inviteGuestAction: (guestId: string) => {
    const state = get()
    const player = state.players[state.currentPlayerIndex]
    const guest = state.availableGuests.find(g => g.id === guestId)
    if (!guest || !canInviteGuest(player, guest)) return
    const next = inviteGuest(state, player.id, guestId)
    set({ ...next })
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
    set({ ...state, players })
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
    set({ ...state, players, availableRooms })
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

    if (!isRoundEnd) {
      set({
        phase: 'action',
        currentPlayerIndex: nextIdx,
        logs: [...state.logs, `${state.players[nextIdx].name} 的行动阶段`],
      })
      return
    }

    if (state.roundNumber >= 7) {
      const withEmperor = performEmperorScoring(state)
      const finalState = performFinalScoring(withEmperor)
      set(finalState as unknown as Partial<GameStore>)
    } else {
      const afterScoring = state.roundNumber === 3 || state.roundNumber === 5
        ? performEmperorScoring(state)
        : state
      set(startNextRound(afterScoring) as unknown as Partial<GameStore>)
    }
  },

  getCurrentPlayer: () => get().players[get().currentPlayerIndex],
}))
