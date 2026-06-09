import { create } from 'zustand'
import type { GameState, Player, Resources } from '../types/game'
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
  resolvePenalty,
  pickSetupGuest,
  placeSetupRoom,
  skipSetupRoom,
  drawStaffCardsForPlayer,
  pickStaffCardForDraft,
  autoPlaceSetupRoom,
  placePoliticsMarker,
  hasExtraAction,
  canPerformExtraAction,
  moveKitchenToGuest,
  checkAndApplyAllGroupBonuses,
} from '../game-logic/engine'

interface GameStore extends GameState {
  startGame: (playerCount: number) => void
  drawStaffCards: () => void
  pickStaffCard: (cardId: string) => void
  pickSetupGuest: (guestId: string) => void
  placeSetupRoom: (roomId: string, slotRow: number, slotCol: number) => void
  autoPlaceRoom: (slotRow: number, slotCol: number) => void
  skipSetupRoom: () => void
  rollDice: () => void
  rerollDice: () => void
  lockDie: (dieId: number) => void
  confirmDice: () => void
  takeAreaAction: (areaValue: number, subAction?: string, slotRow?: number, slotCol?: number) => void
  inviteGuestAction: (guestId: string) => void
  serveWaitingGuest: (guestId: string) => void
  constructRoom: (roomId: string) => void
  hireStaffMember: (staffId: string) => void
  endAction: () => void
  resolvePenalty: (penaltyIndex: number) => void
  getCurrentPlayer: () => Player
  // New actions
  placePoliticsMarkerAction: (cardId: string) => void
  performExtraActionAddDie: (areaValue: number) => void
  performExtraActionMoveKitchen: (guestId: string, resources: Partial<Resources>, count: number) => void
  performExtraActionPlacePolitics: (cardId: string) => void
  performExtraActionUseStaffAbility: () => void
  performExtraActionMoveGuest: () => void
  checkGroupBonuses: () => void
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

  pickStaffCard: (cardId: string) => {
    const next = pickStaffCardForDraft(get(), cardId)
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

  autoPlaceRoom: (slotRow: number, slotCol: number) => {
    const next = autoPlaceSetupRoom(get(), slotRow, slotCol)
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

  takeAreaAction: (areaValue: number, subAction?: string, slotRow?: number, slotCol?: number) => {
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
        next = performAreaAction3(state, subAction || '', slotRow ?? -1, slotCol ?? -1)
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

    const newState = hireStaff(state, staffId)
    const availableStaff = newState.availableStaff.filter(s => s.id !== staffId)
    set({ ...newState, availableStaff })
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
      if (withEmperor.pendingPenalty) {
        set(withEmperor as unknown as Partial<GameStore>)
        return
      }
      const finalState = performFinalScoring(withEmperor)
      set(finalState as unknown as Partial<GameStore>)
    } else {
      const afterScoring = state.roundNumber === 3 || state.roundNumber === 5
        ? performEmperorScoring(state)
        : state
      if ((afterScoring as GameState).pendingPenalty) {
        set(afterScoring as unknown as Partial<GameStore>)
        return
      }
      set(startNextRound(afterScoring) as unknown as Partial<GameStore>)
    }
  },

  resolvePenalty: (penaltyIndex: number) => {
    const state = get()
    const next = resolvePenalty(state, penaltyIndex)
    if (!next.pendingPenalty) {
      // All penalties resolved, continue flow
      if (next.roundNumber >= 7) {
        const finalState = performFinalScoring(next)
        set(finalState as unknown as Partial<GameStore>)
      } else {
        set(startNextRound(next) as unknown as Partial<GameStore>)
      }
    } else {
      set(next as unknown as Partial<GameStore>)
    }
  },

  getCurrentPlayer: () => get().players[get().currentPlayerIndex],

  // --- Politics Card Actions ---

  placePoliticsMarkerAction: (cardId: string) => {
    const state = get()
    const playerId = state.players[state.currentPlayerIndex].id
    const next = placePoliticsMarker(state, playerId, cardId)
    set({ ...next })
  },

  // --- Extra Actions (Turn Order Tile) ---

  performExtraActionAddDie: (areaValue: number) => {
    const state = get()
    const playerId = state.players[state.currentPlayerIndex].id
    const player = state.players[state.currentPlayerIndex]

    if (!hasExtraAction(state, playerId, 'add_die')) return
    if (!canPerformExtraAction(state, playerId, 'add_die')) return
    if (player.resources.money < 1) return

    const updatedPlayer = {
      ...player,
      resources: { ...player.resources, money: player.resources.money - 1 },
      extraActionState: { ...player.extraActionState, addDieUsedThisTurn: true },
    }

    const updatedActionAreaCounts = { ...getActionAreaCounts(state.dice) }
    updatedActionAreaCounts[areaValue] = (updatedActionAreaCounts[areaValue] || 0) + 1

    const players = state.players.map((p, i) =>
      i === state.currentPlayerIndex ? updatedPlayer : p
    )

    set({
      ...state,
      players,
      logs: [...state.logs, `${player.name} 支付1元使用额外行动: 行动区${areaValue}+1骰子`],
    })
  },

  performExtraActionMoveKitchen: (guestId: string, resources: Partial<Resources>, count: number) => {
    const state = get()
    const playerId = state.players[state.currentPlayerIndex].id

    if (!hasExtraAction(state, playerId, 'move_kitchen')) return

    const next = moveKitchenToGuest(state, playerId, guestId, resources, count)
    set({ ...next })
  },

  performExtraActionPlacePolitics: (cardId: string) => {
    const state = get()
    const playerId = state.players[state.currentPlayerIndex].id

    if (!hasExtraAction(state, playerId, 'place_politics')) return

    const next = placePoliticsMarker(state, playerId, cardId)
    set({ ...next })
  },

  performExtraActionUseStaffAbility: () => {
    const state = get()
    const playerId = state.players[state.currentPlayerIndex].id
    const player = state.players[state.currentPlayerIndex]

    if (!hasExtraAction(state, playerId, 'use_staff_ability')) return

    // 触发所有 once_per_round 员工能力（将资源加到厨房）
    let currentLogs = [...state.logs]
    let updatedPlayer = { ...player }

    for (const staff of player.staffCards) {
      if (staff.timing === 'once_per_round') {
        let resourceKey: keyof Resources = 'food'
        switch (staff.ability) {
          case 'once_wine':
            resourceKey = 'wine'
            break
          case 'once_strudel':
            resourceKey = 'food'
            break
          case 'once_cake':
            resourceKey = 'cake'
            break
          case 'once_coffee':
            resourceKey = 'coffee'
            break
          default:
            continue
        }
        updatedPlayer = {
          ...updatedPlayer,
          kitchen: {
            ...updatedPlayer.kitchen,
            [resourceKey]: updatedPlayer.kitchen[resourceKey] + 1,
          },
        }
        currentLogs.push(`${player.name} 使用员工能力: ${resourceKey}+1`)
      }
    }

    const players = state.players.map((p, i) =>
      i === state.currentPlayerIndex ? updatedPlayer : p
    )

    set({
      ...state,
      players,
      logs: [...currentLogs, `${player.name} 使用每轮员工能力`],
    })
  },

  performExtraActionMoveGuest: () => {
    const state = get()
    const playerId = state.players[state.currentPlayerIndex].id

    if (!hasExtraAction(state, playerId, 'move_guest')) return

    // 从等待区找第一个满足条件（资源已满足）的客人
    const player = state.players[state.currentPlayerIndex]
    const servedGuest = player.guestWaitingArea.find(g => canServeGuest(player, g))
    if (!servedGuest) return

    const updatedPlayer = serveGuest(player, servedGuest.id)
    const players = state.players.map((p, i) =>
      i === state.currentPlayerIndex ? updatedPlayer : p
    )
    const newState = { ...state, players }

    // 检查组奖励
    const withBonuses = checkAndApplyAllGroupBonuses(newState)

    set({ ...withBonuses })
  },

  checkGroupBonuses: () => {
    const state = get()
    const next = checkAndApplyAllGroupBonuses(state)
    set({ ...next })
  },
}))
