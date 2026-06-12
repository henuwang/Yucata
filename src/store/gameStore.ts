import { create } from 'zustand'
import type { GameState, Player, Resources } from '../types/game'
import {
  initializeGame,
  rollAllDice,
  autoSortDiceToAreas,
  inviteGuest,
  serveGuest,
  serveGuestWithRoom,
  buildRoom,
  hireStaff,
  getNextActionPlayer,
  startNextRound,
  canBuildRoom,
  canHireStaff,
  canServeGuest,
  canInviteGuest,
  performTurnAction,
  skipTurn,
  getActionAreaCounts,
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
  rerollRemainingDice,
  allocatePendingResources,
  getAvailableStaffCardsForExtraAction,
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
  takeAreaAction: (areaValue: number, subAction?: string, slotRow?: number, slotCol?: number) => void
  skipAction: () => void
  removeDieAndReroll: () => void
  inviteGuestAction: (guestId: string) => void
  serveWaitingGuest: (guestId: string, slotRow?: number, slotCol?: number) => void
  constructRoom: (roomId: string) => void
  hireStaffMember: (staffId: string) => void
  resolvePenalty: (penaltyIndex: number) => void
  getCurrentPlayer: () => Player
  // New actions
  placePoliticsMarkerAction: (cardId: string) => void
  performExtraActionAddDie: (areaValue: number) => void
  performExtraActionMoveKitchen: (guestId: string, resources: Partial<Resources>, count: number) => void
  performExtraActionPlacePolitics: (cardId: string) => void
  performExtraActionUseStaffAbility: () => void
  selectStaffCardForExtraAction: (cardId: string) => void
  performExtraActionMoveGuest: () => void
  checkGroupBonuses: () => void
  // 资源分配（资源流转系统）
  allocateResourcesToKitchen: () => void
  allocateResourcesToGuest: (guestId: string) => void
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

  // 任务1：骰子流程重构 - 掷骰后自动分类进入行动区
  rollDice: () => {
    const state = get()
    const dice = rollAllDice(state.dice.length)
    const areaDice = autoSortDiceToAreas(dice)

    // 找到顺位数字最小的玩家作为第一个行动玩家
    const tempState = { ...state, dice, areaDice }
    const firstActionPlayer = getNextActionPlayer(tempState)

    const logs = [
      ...state.logs,
      `${state.players.find(p => {
        const tile = state.turnOrderTiles.find(t => t.id === p.turnOrderTileId)
        return tile?.number === 1
      })?.name || state.players[0].name} 掷出了骰子`,
      `骰子分布: 区1(${areaDice[1]}) 区2(${areaDice[2]}) 区3(${areaDice[3]}) 区4(${areaDice[4]}) 区5(${areaDice[5]}) 区6(${areaDice[6]})`,
    ]

    if (firstActionPlayer >= 0) {
      logs.push(`轮到 ${state.players[firstActionPlayer].name} 行动`)
    }

    set({
      dice,
      areaDice,
      phase: 'action',
      currentPlayerIndex: firstActionPlayer >= 0 ? firstActionPlayer : 0,
      logs,
    })
  },

  // 任务2：使用新的 performTurnAction 处理行动
  takeAreaAction: (areaValue: number, subAction?: string, slotRow?: number, slotCol?: number) => {
    const state = get()
    const next = performTurnAction(state, areaValue, subAction, slotRow, slotCol)
    set({ ...next })
  },

  // 任务3：跳过行动
  skipAction: () => {
    const state = get()
    const next = skipTurn(state)
    set({ ...next })
  },

  // 移除1颗骰子并重掷
  removeDieAndReroll: () => {
    const state = get()
    const next = rerollRemainingDice(state)
    set({ ...next })
  },

  inviteGuestAction: (guestId: string) => {
    const state = get()
    const player = state.players[state.currentPlayerIndex]
    const guest = state.availableGuests.find(g => g.id === guestId)
    if (!guest || !canInviteGuest(player, guest)) return
    const next = inviteGuest(state, player.id, guestId)
    set({ ...next })
  },

  // 任务4：客人服务 - 支持指定房间
  serveWaitingGuest: (guestId: string, slotRow?: number, slotCol?: number) => {
    const state = get()
    const player = state.players[state.currentPlayerIndex]
    const guest = player.guestWaitingArea.find(g => g.id === guestId)
    if (!guest || !canServeGuest(player, guest)) return

    let updatedPlayer: Player
    if (slotRow !== undefined && slotCol !== undefined) {
      // 指定房间入住
      updatedPlayer = serveGuestWithRoom(player, guestId, slotRow, slotCol)
    } else {
      // 自动分配房间
      updatedPlayer = serveGuest(player, guestId)
    }

    if (updatedPlayer === player) return // 服务失败

    const players = state.players.map((p, i) =>
      i === state.currentPlayerIndex ? updatedPlayer : p
    )

    const newState = { ...state, players }

    // 检查组奖励
    const withBonuses = checkAndApplyAllGroupBonuses(newState)

    set({ ...withBonuses })
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
      areaDice: { ...state.areaDice, [areaValue]: (state.areaDice[areaValue] || 0) + 1 },
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

    // 收集所有可用的 once_per_round 员工卡，让用户选择1张
    const availableCards = getAvailableStaffCardsForExtraAction(player)

    if (availableCards.length === 0) {
      set({
        ...state,
        logs: [...state.logs, `${player.name} 尝试使用员工能力但没有可用的员工卡`],
      })
      return
    }

    // 设置为待选择状态，前端UI将让用户选择1张
    set({
      ...state,
      pendingStaffSelection: availableCards.map(c => c.id),
      logs: [...state.logs, `${player.name} 使用额外行动: 请选择1张员工卡触发能力`],
    })
  },

  selectStaffCardForExtraAction: (cardId: string) => {
    const state = get()
    const pIdx = state.currentPlayerIndex
    const player = state.players[pIdx]

    if (!state.pendingStaffSelection) return
    if (!state.pendingStaffSelection.includes(cardId)) return

    const staff = player.staffCards.find(s => s.id === cardId)
    if (!staff) return

    // 确定资源类型并应用到厨房
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
        return
    }

    const updatedPlayer = {
      ...player,
      kitchen: {
        ...player.kitchen,
        [resourceKey]: player.kitchen[resourceKey] + 1,
      },
      extraActionState: {
        ...player.extraActionState,
        staffAbilityUsedThisTurn: true,
      },
    }

    const players = state.players.map((p, i) =>
      i === pIdx ? updatedPlayer : p
    )

    set({
      ...state,
      players,
      pendingStaffSelection: null,
      logs: [...state.logs, `${player.name} 使用员工能力「${staff.name}」: ${resourceKey}+1到厨房`],
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

  // --- 资源分配（资源流转系统） ---

  allocateResourcesToKitchen: () => {
    const state = get()
    if (!state.pendingAllocation) return
    const next = allocatePendingResources(state, 'kitchen')
    set({ ...next })
  },

  allocateResourcesToGuest: (guestId: string) => {
    const state = get()
    if (!state.pendingAllocation) return
    const next = allocatePendingResources(state, 'guest', guestId)
    set({ ...next })
  },
}))
