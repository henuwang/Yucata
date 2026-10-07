import type { Die, GameState, Player, GuestCard, RoomTile, Resources, StaffCard, StaffAbility, TurnOrderTile, RoomColor, PoliticsCondition, GroupBonus, EmperorEffect, EmperorTile, BonusChoice, HotelBoardSlot } from '../types/game'
import {
  createResources,
  createPlayerExtraActionState,
  isGroupFullyOccupied,
  isSlotOccupied,
  countOccupiedSlots,
} from '../types/game'
import { guestCards } from '../data/guests'
import { roomTiles } from '../data/rooms'
import { staffCards } from '../data/staff'
import { emperorTiles } from '../data/emperorTiles'
import { politicsCards } from '../data/politics'
import { turnOrderTiles } from '../data/turnOrder'
import { createHotelBoard, GROUP_BONUS_CONFIG } from '../data/hotelBoard'

const DICE_COUNT: Record<number, number> = { 2: 10, 3: 12, 4: 14 }
const MAX_CAFE_SEATS = 3
const MAX_SETUP_ROOMS = 3

function shuffle<T>(array: T[]): T[] {
  const a = [...array]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickOneFromEachGroup<T extends { group: string }>(items: T[]): T[] {
  const groups: Record<string, T[]> = {}
  items.forEach(item => {
    if (!groups[item.group]) groups[item.group] = []
    groups[item.group].push(item)
  })
  return Object.values(groups).map(group => {
    const shuffled = shuffle(group)
    return shuffled[0]
  })
}

function createPlayer(id: string, name: string, color: string): Player {
  return {
    id, name, color,
    resources: createResources({ food: 1, wine: 1, coffee: 1, cake: 1, money: 10 }),
    score: 0,
    emperorTrack: 0,
    guestWaitingArea: [],
    guestServedArea: [],
    builtRooms: [],
    roomSlots: createHotelBoard(),
    staffCards: [],
    draftHand: [],
    passingHand: [],
    isFirstPlayer: false,
    setupRoomCount: 0,
    kitchen: createResources({ food: 1, wine: 1, coffee: 1, cake: 1 }),
    turnOrderTileId: null,
    politicsMarkers: [],
    extraActionState: createPlayerExtraActionState(),
    coveredSlots: 0,
    hasPassedInCycle: false,
    guestInvitedThisTurn: false,
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

  const diceCount = DICE_COUNT[playerCount] ?? 10
  const selectedEmperorTiles = pickOneFromEachGroup(emperorTiles)
  const selectedPoliticsCards = pickOneFromEachGroup(politicsCards)
  const shuffledTurnOrder = shuffle(turnOrderTiles).slice(0, playerCount)
  const allGroupBonuses: GroupBonus[] = Object.entries(GROUP_BONUS_CONFIG).map(([groupId, config]) => ({
    id: `group_${groupId}`,
    groupId: parseInt(groupId),
    roomColor: config.color,
    size: config.size,
    reward: {
      type: config.reward === 'money' ? 'money' : config.reward === 'emperor' ? 'advance_emperor' : 'score',
      amount: config.amount,
      description: config.reward === 'money'
        ? `获得 ${config.amount} 元`
        : config.reward === 'emperor'
          ? `皇帝轨道前进 ${config.amount} 格`
          : `获得 ${config.amount} 分`,
    },
  }))

  return {
    phase: 'setup_staff',
    currentPlayerIndex: 0,
    players,
    dice: Array.from({ length: diceCount }, (_, i) => ({ id: i, value: 0, used: false })),
    areaDice: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
    availableGuests: sg.slice(0, 5),
    availableRooms: sr,
    availableStaff: ss,
    emperorTiles: selectedEmperorTiles,
    politicsCards: selectedPoliticsCards,
    turnOrderTiles: shuffledTurnOrder,
    roundNumber: 1,
    maxPlayers: playerCount,
    winner: null,
    logs: ['游戏开始！', '请每位玩家按顺序抽取6张员工卡'],
    gameStarted: true,
    emperorScoringCount: 0,
    setupPlayerIndex: 0,
    setupPassingDirection: 1,
    setupStaffRound: 0,
    pendingPenalty: null,
    groupBonuses: allGroupBonuses,
    completedGroupBonuses: [],
    trashDiceCount: 0,
    pendingAllocation: null,
    pendingStaffSelection: null,
    pendingBonusChoices: null,
  }
}

// --- Staff Draft Phase ---

export function drawStaffCardsForPlayer(state: GameState): GameState {
  const deck = state.availableStaff
  const cardsPerPlayer = 6
  const totalNeeded = state.maxPlayers * cardsPerPlayer
  const drawn = deck.slice(0, totalNeeded)

  const players = state.players.map((p, i) => ({
    ...p,
    draftHand: drawn.slice(i * cardsPerPlayer, (i + 1) * cardsPerPlayer),
    staffCards: [],
    passingHand: [],
  }))

  return {
    ...state,
    players,
    availableStaff: deck.slice(totalNeeded, totalNeeded + 4),
    setupPlayerIndex: 0,
    setupPassingDirection: 1,
    setupStaffRound: 0,
    logs: [...state.logs, `每位玩家获得${cardsPerPlayer}张员工卡，${state.players[0].name}先选择`],
  }
}

export function pickStaffCardForDraft(state: GameState, cardId: string): GameState {
  const pIdx = state.setupPlayerIndex
  const player = state.players[pIdx]
  if (!player) return state

  const cardIdx = player.draftHand.findIndex(c => c.id === cardId)
  if (cardIdx === -1) return state

  // 1. 当前玩家从 draftHand 中选择1张保留到 staffCards
  const picked = player.draftHand[cardIdx]
  const newDraftHand = player.draftHand.filter((_, i) => i !== cardIdx)
  const newStaffCards = [...player.staffCards, picked]

  const updatedPlayer = { ...player, draftHand: newDraftHand, staffCards: newStaffCards }
  const players = state.players.map((p, i) => i === pIdx ? updatedPlayer : p)

  const nextIdx = (pIdx + 1) % state.maxPlayers

  // 所有玩家都已在本轮选完
  if (nextIdx === 0) {
    // 2. 将每人剩余的 draftHand 传给左手边（顺时针）玩家的 passingHand
    //    玩家 i 接收来自玩家 (i-1) 的剩余牌
    const afterPass = players.map((p, i) => {
      const fromPlayerIdx = (i - 1 + state.maxPlayers) % state.maxPlayers
      return {
        ...p,
        passingHand: players[fromPlayerIdx].draftHand,
        draftHand: [],
      }
    })

    // 3. 将每个人的 passingHand 设为新的 draftHand
    const swappedPlayers = afterPass.map(p => ({
      ...p,
      draftHand: p.passingHand,
      passingHand: [],
    }))

    const newRound = state.setupStaffRound + 1

    // 6轮后所有玩家都有6张员工卡
    if (newRound >= 6) {
      // 在进入 setup_guest 阶段前，先分配顺位板
      const withTilesAssigned = assignTurnOrderTiles({ ...state, players: swappedPlayers })
      // 计算 setup_guest 阶段的起始玩家（顺位板数字最小的玩家）
      const setupOrder = getSetupOrder(withTilesAssigned.players, withTilesAssigned.turnOrderTiles)
      const firstSetupPlayer = setupOrder[0]

      return {
        ...withTilesAssigned,
        phase: 'setup_guest',
        setupPlayerIndex: firstSetupPlayer,
        setupStaffRound: 0,
        logs: [
          ...state.logs,
          `${player.name} 选择了${picked.name}`,
          '所有玩家已选完员工卡，开始邀请客人',
        ],
      }
    }

    return {
      ...state,
      players: swappedPlayers,
      setupPlayerIndex: 0,
      setupStaffRound: newRound,
      logs: [
        ...state.logs,
        `${player.name} 选择了${picked.name}`,
        `第${newRound + 1}轮选牌完成，剩余卡牌传给左手玩家`,
        `第${newRound + 1}轮开始，轮到 ${state.players[0].name} 选择`,
      ],
    }
  }

  // 还有玩家未选，轮到下一个玩家
  return {
    ...state,
    players,
    setupPlayerIndex: nextIdx,
    logs: [...state.logs, `${player.name} 选择了${picked.name}`, `轮到 ${state.players[nextIdx].name} 选择`],
  }
}

// --- Setup Phase ---

export function getSetupOrder(players: Player[], turnOrderTiles: TurnOrderTile[]): number[] {
  // 找到顺位板数字最小的玩家
  let smallestIdx = 0
  let smallestNumber = Infinity

  for (let i = 0; i < players.length; i++) {
    const tile = turnOrderTiles.find(t => t.id === players[i].turnOrderTileId)
    if (tile && tile.number < smallestNumber) {
      smallestNumber = tile.number
      smallestIdx = i
    }
  }

  // 从顺位数字最小的玩家开始，逆时针排列
  const order: number[] = []
  for (let i = 0; i < players.length; i++) {
    order.push((smallestIdx - i + players.length) % players.length)
  }
  return order
}

/** 客人版图取走后从牌库补一位新客人（跳过版图上与所有玩家区域里已有的） */
function refillGuestBoard(players: Player[], boardGuests: GuestCard[]): GuestCard[] {
  const inUse = new Set(boardGuests.map(g => g.id))
  for (const p of players) {
    for (const g of p.guestWaitingArea) inUse.add(g.id)
    for (const g of p.guestServedArea) inUse.add(g.id)
  }
  const next = guestCards.find(g => !inUse.has(g.id))
  return next ? [...boardGuests, next] : boardGuests
}

export function pickSetupGuest(state: GameState, guestId: string): GameState {
  const pIdx = state.setupPlayerIndex
  const player = state.players[pIdx]
  if (!player || player.guestWaitingArea.length >= MAX_CAFE_SEATS) return state

  const guestIdx = state.availableGuests.findIndex(g => g.id === guestId)
  if (guestIdx === -1) return state
  const guest = state.availableGuests[guestIdx]

  const newGuests = [...player.guestWaitingArea, { ...guest, placedResources: {} }]
  const players = state.players.map((p, i) =>
    i === pIdx ? { ...p, guestWaitingArea: newGuests } : p
  )

  const remainingGuests = state.availableGuests.filter((_, i) => i !== guestIdx)
  const finalGuests = refillGuestBoard(players, remainingGuests)

  const setupOrder = getSetupOrder(state.players, state.turnOrderTiles)
  const currentSetupIdx = setupOrder.indexOf(pIdx)

  if (currentSetupIdx >= setupOrder.length - 1) {
    return {
      ...state, players, availableGuests: finalGuests,
      phase: 'setup_room',
      setupPlayerIndex: state.players.findIndex(p => p.isFirstPlayer),
      logs: [...state.logs, `${player.name} 免费邀请了${guest.name}`, `所有玩家已邀请完客人，开始准备房间`],
    }
  }

  const nextSetupPlayer = setupOrder[currentSetupIdx + 1]
  return {
    ...state, players, availableGuests: finalGuests,
    setupPlayerIndex: nextSetupPlayer,
    logs: [...state.logs, `${player.name} 免费邀请了${guest.name}`, `轮到 ${state.players[nextSetupPlayer].name} 邀请客人`],
  }
}

export function canPlaceSetupRoom(state: GameState, slotRow: number, slotCol: number): boolean {
  const player = state.players[state.setupPlayerIndex]
  if (player.setupRoomCount >= MAX_SETUP_ROOMS) return false

  const slotIdx = player.roomSlots.findIndex(s => s.row === slotRow && s.col === slotCol)
  if (slotIdx === -1) return false
  const slot = player.roomSlots[slotIdx]
  if (slot.roomId) return false

  if (player.setupRoomCount === 0) {
    return slot.row === 0 && slot.col === 0
  }

  const hasAdjacent = player.roomSlots.some(s =>
    s.roomId &&
    Math.abs(s.row - slotRow) + Math.abs(s.col - slotCol) === 1
  )
  return hasAdjacent
}

export function getAvailableColorsForSetup(state: GameState): string[] {
  const player = state.players[state.setupPlayerIndex]
  const colors: string[] = []
  if (player.setupRoomCount === 0) return ['red', 'yellow', 'blue']
  const placedColors = new Set(player.roomSlots.filter(s => s.roomId).map(s => s.color))
  placedColors.forEach(c => colors.push(c))
  return colors.length > 0 ? colors : ['red', 'yellow', 'blue']
}

export function placeSetupRoom(state: GameState, roomId: string, slotRow: number, slotCol: number): GameState {
  if (!canPlaceSetupRoom(state, slotRow, slotCol)) return state

  const pIdx = state.setupPlayerIndex
  const player = state.players[pIdx]
  const room = state.availableRooms.find(r => r.id === roomId)
  if (!room) return state

  const slotIdx = player.roomSlots.findIndex(s => s.row === slotRow && s.col === slotCol)
  if (slotIdx === -1) return state
  const slot = player.roomSlots[slotIdx]
  if (slot.color !== room.color) return state

  const cost = slot.cost
  if (player.resources.money < cost) return state

  const newSlots = player.roomSlots.map((s, i) =>
    i === slotIdx ? { ...s, roomId: room.id } : s
  )

  const newRes = { ...player.resources, money: player.resources.money - cost }
  const updatedPlayer = {
    ...player,
    resources: newRes,
    builtRooms: [...player.builtRooms, { ...room, isBuilt: true }],
    roomSlots: newSlots,
    setupRoomCount: player.setupRoomCount + 1,
  }

  const players = state.players.map((p, i) => i === pIdx ? updatedPlayer : p)
  const availableRooms = state.availableRooms.filter(r => r.id !== roomId)

  const nextPlayer = getNextSetupPlayer(players)
  if (nextPlayer === -1) {
    return {
      ...state, players, availableRooms,
      phase: 'dice_roll',
      currentPlayerIndex: state.players.findIndex(p => p.isFirstPlayer),
      setupPlayerIndex: 0,
      logs: [...state.logs, `${player.name} 准备了${room.name}（花费${cost}元）`, '所有玩家准备完成，游戏正式开始！'],
    }
  }

  return {
    ...state, players, availableRooms,
    setupPlayerIndex: nextPlayer,
    logs: [...state.logs, `${player.name} 准备了${room.name}（花费${cost}元）`, `轮到 ${state.players[nextPlayer].name} 准备房间`],
  }
}

function getNextSetupPlayer(players: Player[]): number {
  for (let i = 0; i < players.length; i++) {
    if (players[i].setupRoomCount < MAX_SETUP_ROOMS) return i
  }
  return -1
}

export function autoPlaceSetupRoom(state: GameState, slotRow: number, slotCol: number): GameState {
  if (!canPlaceSetupRoom(state, slotRow, slotCol)) return state

  const player = state.players[state.setupPlayerIndex]
  const slot = player.roomSlots.find(s => s.row === slotRow && s.col === slotCol)
  if (!slot || slot.roomId) return state

  const matchingRoom = state.availableRooms.find(r => r.color === slot.color)
  if (!matchingRoom) return state

  const cost = slot.cost
  if (player.resources.money < cost) return state

  return placeSetupRoom(state, matchingRoom.id, slotRow, slotCol)
}

export function skipSetupRoom(state: GameState): GameState {
  const pIdx = state.setupPlayerIndex
  const player = state.players[pIdx]
  const updatedPlayer = { ...player, setupRoomCount: MAX_SETUP_ROOMS }
  const players = state.players.map((p, i) => i === pIdx ? updatedPlayer : p)

  const nextPlayer = getNextSetupPlayer(players)
  if (nextPlayer === -1) {
    return {
      ...state, players,
      phase: 'dice_roll',
      currentPlayerIndex: state.players.findIndex(p => p.isFirstPlayer),
      setupPlayerIndex: 0,
      logs: [...state.logs, `${state.players[pIdx].name} 跳过准备房间`, '所有玩家准备完成，游戏正式开始！'],
    }
  }

  return { ...state, players, setupPlayerIndex: nextPlayer, logs: [...state.logs, `${state.players[pIdx].name} 跳过准备房间`] }
}

// ========================================================
// 骰子系统 (Dice System) - 任务1
// ========================================================

export function rollAllDice(count: number): Die[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i, value: Math.floor(Math.random() * 6) + 1, kept: false, used: false,
  }))
}

/**
 * 掷骰后自动按点数分入 1-6 行动区
 */
export function autoSortDiceToAreas(dice: Die[]): Record<number, number> {
  const areas: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
  dice.forEach(d => {
    if (d.value >= 1 && d.value <= 6) {
      areas[d.value]++
    }
  })
  return areas
}

export function getActionAreaCounts(dice: Die[]): Record<number, number> {
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
  dice.filter(d => d.value > 0 && !d.used).forEach(d => { counts[d.value]++ })
  return counts
}

export function getTotalUnusedDice(dice: Die[]): number {
  return dice.filter(d => d.value > 0 && !d.used).length
}

export function removeOneDieFromArea(dice: Die[], areaValue: number): Die[] {
  const idx = dice.findIndex(d => d.value === areaValue && !d.used)
  if (idx === -1) return dice
  return dice.map((d, i) => i === idx ? { ...d, used: true } : d)
}

// ========================================================
// 回合行动流程 (Turn & Action Flow) - 任务2
// ========================================================

/**
 * 根据顺位板上可见数字最小的玩家来确定下一个行动的玩家
 * 已遮盖（已行动2次或已跳过）的玩家不算
 */
export function getNextActionPlayer(state: GameState): number {
  let bestIdx = -1
  let bestNumber = Infinity

  for (let i = 0; i < state.players.length; i++) {
    const p = state.players[i]
    if (p.coveredSlots >= 2 || p.hasPassedInCycle) continue

    const tile = state.turnOrderTiles.find(t => t.id === p.turnOrderTileId)
    if (!tile) continue

    if (tile.number < bestNumber) {
      bestNumber = tile.number
      bestIdx = i
    }
  }

  return bestIdx
}

/**
 * 检查所有玩家在当前重掷周期是否都已通过（跳过或已完成2次行动）
 */
export function canAllPlayersPass(state: GameState): boolean {
  return state.players.every(p => p.coveredSlots >= 2 || p.hasPassedInCycle)
}

/**
 * 检查所有玩家是否都已执行完2次行动（本轮结束条件之一）
 */
export function allPlayersDoneTwoActions(state: GameState): boolean {
  return state.players.every(p => p.coveredSlots >= 2)
}

/**
 * 检查行动区是否还有骰子
 */
export function hasDiceInAnyArea(state: GameState): boolean {
  return Object.values(state.areaDice).some(count => count > 0)
}

/**
 * 移除行动区1颗骰子（按 areaDice 系统）
 */
function removeOneFromAreaDice(state: GameState, areaValue: number): GameState {
  if (!state.areaDice[areaValue] || state.areaDice[areaValue] <= 0) return state
  return {
    ...state,
    areaDice: { ...state.areaDice, [areaValue]: state.areaDice[areaValue] - 1 },
  }
}

/**
 * 玩家跳过回合（任务3）
 */
export function skipTurn(state: GameState): GameState {
  const pIdx = state.currentPlayerIndex
  const player = state.players[pIdx]

  if (player.coveredSlots >= 2 || player.hasPassedInCycle) return state

  const updatedPlayer = { ...player, hasPassedInCycle: true }
  const players = state.players.map((p, i) => i === pIdx ? updatedPlayer : p)
  let logs = [...state.logs, `${player.name} 跳过了本次行动回合`]
  let nextState: GameState = { ...state, players, logs }

  // 检查是否需要触发重掷
  if (canAllPlayersPass(nextState) && !allPlayersDoneTwoActions(nextState)) {
    return rerollRemainingDice(nextState)
  }

  // 找下一个行动玩家
  return advanceToNextPlayer(nextState)
}

/**
 * 前进到下一个玩家（处理回合结束条件）
 */
function advanceToNextPlayer(state: GameState): GameState {
  const nextIdx = getNextActionPlayer(state)

  if (nextIdx === -1) {
    // 没有可行动的玩家
    if (canAllPlayersPass(state) && !allPlayersDoneTwoActions(state)) {
      return rerollRemainingDice(state)
    }
    // 所有玩家都已执行2次行动 或 行动区无骰子 → 本轮结束
    return handleRoundEnd(state)
  }

  // 重置新玩家回合的客人邀请状态
  const updatedPlayers = state.players.map((p, i) =>
    i === nextIdx ? { ...p, guestInvitedThisTurn: false } : p
  )

  return {
    ...state,
    players: updatedPlayers,
    currentPlayerIndex: nextIdx,
    logs: [...state.logs, `轮到 ${state.players[nextIdx].name} 行动`],
  }
}

/**
 * 重掷剩余骰子：移除1颗最小点数的骰子到垃圾桶，重掷剩余（任务3）
 */
export function rerollRemainingDice(state: GameState): GameState {
  // 找到最小点数的骰子
  const activeDice = state.dice.filter(d => d.value > 0 && !d.used)
  if (activeDice.length === 0) {
    return handleRoundEnd(state)
  }

  // 找到最小点数
  const minValue = Math.min(...activeDice.map(d => d.value))
  const minDieIndices = state.dice
    .map((d, i) => ({ d, i }))
    .filter(({ d }) => d.value === minValue && !d.used)
    .map(({ i }) => i)

  // 移除1颗最小骰子到垃圾桶
  const trashIdx = minDieIndices[0]
  let trashCount = state.trashDiceCount + 1

  let newDice = state.dice.map((d, i) => {
    if (i === trashIdx) {
      return { ...d, value: 0, used: true }
    }
    return d
  })

  // 重掷剩余未使用的骰子
  newDice = newDice.map(d => {
    if (!d.used) {
      return { ...d, value: Math.floor(Math.random() * 6) + 1 }
    }
    return d
  })

  // 重新分配到各区
  const areaDice = autoSortDiceToAreas(newDice.filter(d => d.value > 0))

  // 重置所有玩家的 cyclePassed 状态
  const players = state.players.map(p => ({
    ...p,
    hasPassedInCycle: false,
  }))

  const logs = [...state.logs, `所有玩家已通过，移除1颗点数${minValue}的骰子到垃圾桶，重掷剩余${newDice.filter(d => d.value > 0).length}颗骰子`]

  const nextState: GameState = {
    ...state,
    dice: newDice,
    areaDice,
    players,
    trashDiceCount: trashCount,
    logs,
  }

  // 找下一个行动玩家
  const nextIdx = getNextActionPlayer(nextState)
  if (nextIdx === -1) {
    return handleRoundEnd(nextState)
  }

  return {
    ...nextState,
    currentPlayerIndex: nextIdx,
    logs: [...nextState.logs, `重掷后轮到 ${nextState.players[nextIdx].name} 行动`],
  }
}

/**
 * 处理本轮结束
 */
/** 皇帝计分的待处理项（惩罚选择 / 收益选择）结算完后才能继续流程 */
export function hasPendingEmperorBusiness(state: GameState): boolean {
  return !!state.pendingPenalty || (state.pendingBonusChoices?.length ?? 0) > 0
}

export function continueAfterPending(state: GameState): GameState {
  if (hasPendingEmperorBusiness(state)) return state
  if (state.roundNumber >= 7) return performFinalScoring(state)
  return startNextRound(state)
}

function handleRoundEnd(state: GameState): GameState {
  if (state.roundNumber >= 7) {
    return continueAfterPending(performEmperorScoring(state))
  }
  const afterScoring = (state.roundNumber === 3 || state.roundNumber === 5)
    ? performEmperorScoring(state)
    : state
  return continueAfterPending(afterScoring)
}

// ========================================================
// 行动区动作 (Action Area Actions) - 任务2、5
// ========================================================

/**
 * 行动区1：食材市场 - 取食物或蛋糕
 * 约束：蛋糕数量 ≤ 面包数量
 */
export function performAreaAction1(state: GameState, takeCake: number): GameState {
  const n = state.areaDice[1] ?? 0
  if (n <= 0) return state

  let cake = Math.min(takeCake, n)
  let food = n - cake

  // 任务5：蛋糕 ≤ 面包约束
  if (cake > food) return state
  if (cake < 0 || food < 0) return state

  const player = state.players[state.currentPlayerIndex]
  const logs = [...state.logs]

  // 永久能力：die_1_2_extra_resource - 餐厅经理 - 额外获得1份面包
  if (hasPermanentAbility(player, 'die_1_2_extra_resource')) {
    food += 1
    logs.push(`${player.name} 触发永久能力【餐厅经理】: 额外获得1份面包`)
  }

  // 不直接加到 player.resources，而是设置 pendingAllocation
  const afterRemove = removeOneFromAreaDice(state, 1)
  const dice = removeOneDieFromArea(state.dice, 1)

  let result: GameState = {
    ...afterRemove, dice,
    pendingAllocation: { food, cake },
    logs: [...logs, `${player.name} 执行行动区1: 获得食物×${food} 蛋糕×${cake}，请分配`],
  }

  // 永久能力：die_1_2_build_room - 装潢师 - 可额外准备1个房间
  if (hasPermanentAbility(player, 'die_1_2_build_room') && state.availableRooms.length > 0) {
    result = queueBonusChoice(result, {
      playerId: player.id, kind: 'room',
      description: '装潢师: 可额外准备1个房间（支付楼层费用）',
    })
  }

  return result
}

/**
 * 行动区2：酒水市场 - 取红酒或咖啡
 * 约束：咖啡数量 ≤ 红酒数量
 */
export function performAreaAction2(state: GameState, takeCoffee: number): GameState {
  const n = state.areaDice[2] ?? 0
  if (n <= 0) return state

  let coffee = Math.min(takeCoffee, n)
  let wine = n - coffee

  // 任务5：咖啡 ≤ 红酒约束
  if (coffee > wine) return state
  if (coffee < 0 || wine < 0) return state

  const player = state.players[state.currentPlayerIndex]
  const logs = [...state.logs]

  // 永久能力：die_1_2_extra_resource - 餐厅经理 - 额外获得1份红酒
  if (hasPermanentAbility(player, 'die_1_2_extra_resource')) {
    wine += 1
    logs.push(`${player.name} 触发永久能力【餐厅经理】: 额外获得1份红酒`)
  }

  // 不直接加到 player.resources，而是设置 pendingAllocation
  const afterRemove = removeOneFromAreaDice(state, 2)
  const dice = removeOneDieFromArea(state.dice, 2)

  let result: GameState = {
    ...afterRemove, dice,
    pendingAllocation: { wine, coffee },
    logs: [...logs, `${player.name} 执行行动区2: 获得红酒×${wine} 咖啡×${coffee}，请分配`],
  }

  if (hasPermanentAbility(player, 'die_1_2_build_room') && state.availableRooms.length > 0) {
    result = queueBonusChoice(result, {
      playerId: player.id, kind: 'room',
      description: '装潢师: 可额外准备1个房间（支付楼层费用）',
    })
  }

  return result
}

export interface RoomPlacement {
  roomId: string
  row: number
  col: number
}

interface PlacementResult {
  player: Player
  availableRooms: RoomTile[]
  logs: string[]
}

/**
 * 客房放置的通用结算：颜色匹配、空酒店首间落左下角、之后须与已准备客房相邻、
 * 每间支付所在楼层费用。校验不过返回 null，整个行动作废（不允许部分成功）。
 * 行动区3 与 黑市模拟区3 共用同一套规则。
 */
/**
 * 准备一间客房的实际费用：楼层费用，减去对应颜色的免费员工能力（管家/司机/花店店员）
 */
export function roomPlacementCost(player: Player, room: RoomTile, slot: HotelBoardSlot): number {
  if (room.color === 'blue' && hasPermanentAbility(player, 'free_room_blue')) return 0
  if (room.color === 'red' && hasPermanentAbility(player, 'free_room_red')) return 0
  if (room.color === 'yellow' && hasPermanentAbility(player, 'free_room_yellow')) return 0
  return slot.cost
}

function tryPlaceRooms(
  player: Player,
  availableRooms: RoomTile[],
  placements: RoomPlacement[],
  maxRooms: number,
  opts: { freeCost?: boolean; maxRow?: number } = {},
): PlacementResult | null {
  if (placements.length === 0 || placements.length > maxRooms) return null

  let slots = player.roomSlots
  let builtRooms = player.builtRooms
  let rooms = availableRooms
  let money = player.resources.money
  let gainedScore = 0
  const logs: string[] = []

  for (const placement of placements) {
    const roomIdx = rooms.findIndex(r => r.id === placement.roomId)
    if (roomIdx === -1 || builtRooms.some(r => r.id === placement.roomId)) return null
    const room = rooms[roomIdx]

    const slotIdx = slots.findIndex(s => s.row === placement.row && s.col === placement.col)
    if (slotIdx === -1) return null
    const slot = slots[slotIdx]
    if (slot.roomId !== null || slot.color !== room.color) return null
    if (opts.maxRow !== undefined && slot.row > opts.maxRow) return null

    if (slots.every(s => s.roomId === null)) {
      if (slot.row !== 0 || slot.col !== 0) return null
    } else {
      const hasAdjacent = slots.some(s =>
        s.roomId !== null &&
        Math.abs(s.row - slot.row) + Math.abs(s.col - slot.col) === 1
      )
      if (!hasAdjacent) return null
    }
    const cost = opts.freeCost ? 0 : roomPlacementCost(player, room, slot)
    if (money < cost) return null

    money -= cost
    gainedScore += room.victoryPoints
    slots = slots.map((s, i) => i === slotIdx ? { ...s, roomId: room.id } : s)
    builtRooms = [...builtRooms, { ...room, isBuilt: true }]
    rooms = rooms.filter((_, i) => i !== roomIdx)
    logs.push(`${player.name} 准备客房 ${room.name} 于(${slot.row},${slot.col})，${cost === 0 ? '免费' : `支付楼层费用 ${cost} 元`}`)
  }

  return {
    player: {
      ...player,
      resources: { ...player.resources, money },
      score: player.score + gainedScore,
      builtRooms,
      roomSlots: slots,
    },
    availableRooms: rooms,
    logs,
  }
}

/**
 * 行动区3：建造局 - 强度(区3骰子数)即可准备的房间数，每间费用为所在行的楼层费用
 */
export function performAreaAction3(state: GameState, placements: RoomPlacement[]): GameState {
  const n = state.areaDice[3] ?? 0
  if (n <= 0) return state

  const player = state.players[state.currentPlayerIndex]
  const placed = tryPlaceRooms(player, state.availableRooms, placements, n)
  if (!placed) return state

  // 永久能力：室内设计师(拿取3点骰子+5分)、女管家(拿取3或4点骰子+2分)
  const abilityScore =
    (hasPermanentAbility(player, 'die_3_plus_5vp') ? 5 : 0) +
    (hasPermanentAbility(player, 'die_3_4_plus_2vp') ? 2 : 0)
  const players = state.players.map((p, i) => i === state.currentPlayerIndex
    ? { ...placed.player, score: placed.player.score + abilityScore } : p)

  const afterRemove = removeOneFromAreaDice(state, 3)
  const dice = removeOneDieFromArea(state.dice, 3)

  const result: GameState = {
    ...afterRemove, dice, players, availableRooms: placed.availableRooms,
    logs: [
      ...state.logs, ...placed.logs,
      ...(abilityScore > 0 ? [`${player.name} 员工能力加分: +${abilityScore}`] : []),
      `${player.name} 执行行动区3: 准备 ${placements.length} 间客房`,
    ],
  }

  // 永久能力：die_3_hire_staff - 人事主管 - 拿取3点骰子时可免费雇佣1张员工卡
  if (hasPermanentAbility(player, 'die_3_hire_staff') && state.availableStaff.length > 0) {
    return queueBonusChoice(result, {
      playerId: player.id, kind: 'staff', description: '人事主管: 可免费雇佣1张员工卡',
      staffOptions: state.availableStaff.map(c => c.id), freeStaff: true,
    })
  }

  return result
}
/**
 * 行动区4：皇帝觐见 - 皇帝轨道或金钱
 */
export function performAreaAction4(state: GameState, toEmperor: number): GameState {
  const n = state.areaDice[4] ?? 0
  if (n <= 0) return state

  let emperor = Math.min(toEmperor, n)
  let money = n - emperor
  if (emperor < 0 || money < 0) return state

  const player = state.players[state.currentPlayerIndex]
  const logs = [...state.logs]

  // 永久能力：die_4_emperor_and_money - 擦鞋匠 - 皇帝和金钱各前进1格
  if (hasPermanentAbility(player, 'die_4_emperor_and_money')) {
    emperor += 1
    money += 1
    logs.push(`${player.name} 触发永久能力【擦鞋匠】: 皇帝+1 金钱+1`)
  }

  // 永久能力：die_4_plus_4vp - 洗衣女工 - 额外获得4分
  let extraScore = 0
  if (hasPermanentAbility(player, 'die_4_plus_4vp')) {
    extraScore += 4
    logs.push(`${player.name} 触发永久能力【洗衣女工】: 额外+4分`)
  }

  const newRes = { ...player.resources, money: player.resources.money + money }
  // 永久能力：女管家 - 拿取点数3或4的骰子额外获得2分
  const empAbility = hasPermanentAbility(player, 'die_3_4_plus_2vp') ? 2 : 0
  const players = state.players.map((p, i) =>
    i === state.currentPlayerIndex ? {
      ...p, resources: newRes,
      emperorTrack: p.emperorTrack + emperor,
      score: p.score + extraScore + empAbility,
    } : p
  )

  const afterRemove = removeOneFromAreaDice(state, 4)
  const dice = removeOneDieFromArea(state.dice, 4)

  return {
    ...afterRemove, dice, players,
    logs: [...logs, `${player.name} 执行行动区4: 皇帝+${emperor} 金钱+${money}${empAbility > 0 ? ' 员工能力+2分' : ''}`],
  }
}

interface HireResult {
  player: Player
  availableStaff: StaffCard[]
  staff: StaffCard
  cost: number
  discount: number
}

/**
 * 人力市场通用雇佣：折扣 = 该行动区的骰子数量，费用不足则整个行动作废。
 * 行动区5 与 黑市模拟区5 共用。
 */
function tryHireStaff(
  player: Player,
  availableStaff: StaffCard[],
  staffId: string,
  discount: number,
): HireResult | null {
  const staff = staffCards.find(s => s.id === staffId)
  if (!staff) return null
  if (!availableStaff.some(s => s.id === staffId)) return null

  const cost = Math.max(0, staff.cost - discount)
  if (player.resources.money < cost) return null

  return {
    player: {
      ...player,
      resources: { ...player.resources, money: player.resources.money - cost },
      score: player.score + staff.victoryPoints,
      staffCards: [...player.staffCards, staff],
    },
    availableStaff: availableStaff.filter(s => s.id !== staffId),
    staff,
    cost,
    discount,
  }
}

/**
 * 行动区5：人力市场 - 雇佣员工(折扣)
 */
export function performAreaAction5(state: GameState, staffId: string): GameState {
  const n = state.areaDice[5] ?? 0
  if (n <= 0) return state

  const player = state.players[state.currentPlayerIndex]
  // 永久能力：衣帽间服务员 - 拿取点数5的骰子时额外获得2克朗折扣
  const discount = n + (hasPermanentAbility(player, 'die_5_discount_2') ? 2 : 0)
  const hired = tryHireStaff(player, state.availableStaff, staffId, discount)
  if (!hired) return state

  // 永久能力：酒店侦探 - 拿取点数5的骰子时皇帝轨道前进2格
  const emperorBonus = hasPermanentAbility(player, 'die_5_emperor_2') ? 2 : 0
  const players = state.players.map((p, i) => i === state.currentPlayerIndex
    ? { ...hired.player, emperorTrack: p.emperorTrack + emperorBonus } : p)

  const afterRemove = removeOneFromAreaDice(state, 5)
  const dice = removeOneDieFromArea(state.dice, 5)

  const result: GameState = {
    ...afterRemove, dice, players, availableStaff: hired.availableStaff,
    logs: [...state.logs, `${player.name} 执行行动区5: 雇佣${hired.staff.name}，花费${hired.cost}(折扣${hired.discount})${emperorBonus > 0 ? ' 员工能力皇帝+2' : ''}`],
  }

  if (hired.staff.timing === 'one_time') {
    return applyOneTimeStaffAbility(result, hired.staff)
  }

  return result
}

/**
 * 行动区6：黑市 - 花1元模拟其他区
 * targetArea=3 时用 placements 准备客房（最多区6骰数间），=5 时用 subAction 指定的员工卡雇佣（折扣=区6骰数）
 */
export function performAreaAction6(state: GameState, targetArea: number, subAction: string, placements?: RoomPlacement[]): GameState {
  const player = state.players[state.currentPlayerIndex]

  // 永久能力：厨房帮手 - 免费拿取点数6的骰子，且模拟的行动区骰数 +1
  const kitchenHand = hasPermanentAbility(player, 'die_6_free_plus_reward')
  const fee = kitchenHand ? 0 : 1
  if (player.resources.money < fee) return state

  const n = kitchenHand ? (state.areaDice[6] ?? 0) + 1 : (state.areaDice[6] ?? 0)
  if (n <= 0) return state

  const newRes = { ...player.resources, money: player.resources.money - fee }
  const feeLabel = kitchenHand ? '免费' : '花1元'
  const playerWithPayment = { ...player, resources: newRes }

  let players: Player[]
  const baseState = { ...state, players: state.players.map((p, i) => i === state.currentPlayerIndex ? playerWithPayment : p) }

  const afterRemove = removeOneFromAreaDice(state, 6)
  const dice = removeOneDieFromArea(state.dice, 6)

  if (targetArea === 1 || targetArea === 2) {
    const takeCount = Math.min(parseInt(subAction) || 0, n)
    const isCoffee = targetArea === 2

    if (isCoffee) {
      const coffee = Math.min(takeCount, n)
      const wine = n - coffee
      // 任务5约束
      if (coffee > wine) return state
      return {
        ...afterRemove, dice,
        players: baseState.players,
        pendingAllocation: { wine, coffee },
        logs: [...state.logs, `${player.name} 执行行动区6(${feeLabel}): 黑市模拟行动区2，请分配资源`],
      }
    } else {
      const cake = Math.min(takeCount, n)
      const food = n - cake
      // 任务5约束
      if (cake > food) return state
      return {
        ...afterRemove, dice,
        players: baseState.players,
        pendingAllocation: { food, cake },
        logs: [...state.logs, `${player.name} 执行行动区6(${feeLabel}): 黑市模拟行动区1，请分配资源`],
      }
    }
  } else if (targetArea === 3) {
    const placed = tryPlaceRooms(playerWithPayment, state.availableRooms, placements ?? [], n)
    if (!placed) return state
    return {
      ...afterRemove, dice,
      players: baseState.players.map((p, i) => i === state.currentPlayerIndex ? placed.player : p),
      availableRooms: placed.availableRooms,
      logs: [...state.logs, ...placed.logs, `${player.name} 执行行动区6(${feeLabel}): 黑市模拟行动区3，准备 ${placements?.length ?? 0} 间客房`],
    }
  } else if (targetArea === 4) {
    const empAdv = parseInt(subAction) || 0
    const moneyGain = n - empAdv
    players = baseState.players.map((p, i) =>
      i === state.currentPlayerIndex
        ? { ...p, emperorTrack: p.emperorTrack + empAdv, resources: { ...p.resources, money: p.resources.money + moneyGain } }
        : p
    )
  } else if (targetArea === 5) {
    const hired = tryHireStaff(playerWithPayment, state.availableStaff, subAction, n)
    if (!hired) return state
    const result: GameState = {
      ...afterRemove, dice,
      players: baseState.players.map((p, i) => i === state.currentPlayerIndex ? hired.player : p),
      availableStaff: hired.availableStaff,
      logs: [...state.logs, `${player.name} 执行行动区6(${feeLabel}): 黑市雇佣${hired.staff.name}，花费${hired.cost}(折扣${hired.discount})`],
    }
    return hired.staff.timing === 'one_time' ? applyOneTimeStaffAbility(result, hired.staff) : result
  } else {
    players = baseState.players
  }

  return {
    ...afterRemove, dice, players,
    logs: [...state.logs, `${player.name} 执行行动区6(${feeLabel}): 模拟行动区${targetArea}`],
  }
}

/**
 * 主要行动入口：执行行动后处理玩家行动计数、遮盖顺位、找下一个玩家
 */
export function performTurnAction(
  state: GameState,
  areaValue: number,
  subAction?: string,
  placements?: RoomPlacement[],
): GameState {
  let afterAction: GameState

  switch (areaValue) {
    case 1:
      afterAction = performAreaAction1(state, parseInt(subAction || '0'))
      break
    case 2:
      afterAction = performAreaAction2(state, parseInt(subAction || '0'))
      break
    case 3:
      afterAction = performAreaAction3(state, placements ?? [])
      break
    case 4:
      afterAction = performAreaAction4(state, parseInt(subAction || '0'))
      break
    case 5:
      afterAction = performAreaAction5(state, subAction || '')
      break
    case 6: {
      const parts = (subAction || '').split('|')
      afterAction = performAreaAction6(state, parseInt(parts[0] || '0'), parts[1] || '', placements)
      break
    }
    default:
      return state
  }

  // 验证行动是否成功（通过检查日志长度或 resource changes）
  if (afterAction.logs.length === state.logs.length) {
    return state // 行动无效
  }

  // 资源流转系统：如果行动区1/2产生了待分配资源，不前进到下一玩家
  // 玩家必须先分配资源（到厨房或客人卡），作为本次行动的一部分
  if (afterAction.pendingAllocation) {
    return afterAction
  }

  const pIdx = state.currentPlayerIndex
  const player = afterAction.players[pIdx]

  // 更新玩家行动计数
  const updatedPlayer = {
    ...player,
    coveredSlots: player.coveredSlots + 1,
  }
  const players = afterAction.players.map((p, i) => i === pIdx ? updatedPlayer : p)

  const withPlayerUpdate = { ...afterAction, players }

  // 检查组奖励
  const withBonuses = checkAndApplyAllGroupBonuses(withPlayerUpdate)

  // 前进到下一个玩家
  return advanceToNextPlayer(withBonuses)
}

// --- 资源分配 (Resource Allocation) ---

/**
 * 将待分配资源（pendingAllocation）分配到厨房或客人卡上
 * 分配完成后，完成本次行动（coveredSlots、组奖励、下一玩家）
 */
export function allocatePendingResources(
  state: GameState,
  target: 'kitchen' | 'guest',
  guestId?: string
): GameState {
  if (!state.pendingAllocation) return state

  const pIdx = state.currentPlayerIndex
  const player = state.players[pIdx]
  let updatedPlayer = { ...player }

  if (target === 'kitchen') {
    // 分配到厨房
    updatedPlayer = {
      ...updatedPlayer,
      kitchen: {
        ...updatedPlayer.kitchen,
        food: updatedPlayer.kitchen.food + (state.pendingAllocation.food ?? 0),
        wine: updatedPlayer.kitchen.wine + (state.pendingAllocation.wine ?? 0),
        coffee: updatedPlayer.kitchen.coffee + (state.pendingAllocation.coffee ?? 0),
        cake: updatedPlayer.kitchen.cake + (state.pendingAllocation.cake ?? 0),
      },
    }
  } else if (target === 'guest' && guestId) {
    // 分配到指定客人卡的 placedResources
    const guestIdx = updatedPlayer.guestWaitingArea.findIndex(g => g.id === guestId)
    if (guestIdx === -1) return state

    const guest = updatedPlayer.guestWaitingArea[guestIdx]
    const guestPlaced = guest.placedResources ?? {}
    const updatedGuest = {
      ...guest,
      placedResources: {
        ...guestPlaced,
        food: (guestPlaced.food ?? 0) + (state.pendingAllocation.food ?? 0),
        wine: (guestPlaced.wine ?? 0) + (state.pendingAllocation.wine ?? 0),
        coffee: (guestPlaced.coffee ?? 0) + (state.pendingAllocation.coffee ?? 0),
        cake: (guestPlaced.cake ?? 0) + (state.pendingAllocation.cake ?? 0),
      },
    }
    updatedPlayer.guestWaitingArea = updatedPlayer.guestWaitingArea.map((g, i) =>
      i === guestIdx ? updatedGuest : g
    )
  } else {
    return state
  }

  const logs = [...state.logs]
  const pending = state.pendingAllocation
  const resourceDesc = [
    pending.food ? `食物×${pending.food}` : '',
    pending.wine ? `红酒×${pending.wine}` : '',
    pending.coffee ? `咖啡×${pending.coffee}` : '',
    pending.cake ? `蛋糕×${pending.cake}` : '',
  ].filter(Boolean).join(' ')

  if (target === 'kitchen') {
    logs.push(`${player.name} 将 ${resourceDesc} 分配到厨房`)
  } else {
    const guestName = updatedPlayer.guestWaitingArea.find(g => g.id === guestId)?.name ?? guestId
    logs.push(`${player.name} 将 ${resourceDesc} 分配到 ${guestName} 的卡上`)
  }

  const players = state.players.map((p, i) => i === pIdx ? updatedPlayer : p)
  const clearedState = { ...state, players, pendingAllocation: null, logs }

  // 完成行动：coveredSlots +1
  const withCovered = {
    ...clearedState,
    players: clearedState.players.map((p, i) =>
      i === pIdx ? { ...p, coveredSlots: p.coveredSlots + 1 } : p
    ),
  }

  // 检查组奖励
  const withBonuses = checkAndApplyAllGroupBonuses(withCovered)

  // 前进到下一个玩家
  return advanceToNextPlayer(withBonuses)
}

// --- One-Time Staff Abilities ---

/** 员工能力/皇帝板块直接发放的餐饮：规则不允许攒在手上，立即放入厨房 */
function grantKitchenItems(state: GameState, playerId: string, items: Partial<Resources>): GameState {
  return {
    ...state,
    players: state.players.map(p => p.id === playerId ? {
      ...p,
      kitchen: {
        ...p.kitchen,
        food: p.kitchen.food + (items.food ?? 0),
        wine: p.kitchen.wine + (items.wine ?? 0),
        coffee: p.kitchen.coffee + (items.coffee ?? 0),
        cake: p.kitchen.cake + (items.cake ?? 0),
      },
    } : p),
  }
}

export function applyOneTimeStaffAbility(state: GameState, staff: StaffCard, ownerId?: string): GameState {
  const ownerIdx = ownerId ? state.players.findIndex(p => p.id === ownerId) : -1
  const pIdx = ownerIdx === -1 ? state.currentPlayerIndex : ownerIdx
  const player = state.players[pIdx]

  switch (staff.ability) {
    case 'emperor_advance_3':
      return {
        ...state,
        players: state.players.map((p, i) =>
          i === pIdx ? { ...p, emperorTrack: p.emperorTrack + 3 } : p
        ),
        logs: [...state.logs, `${player.name} 触发员工能力: 皇帝轨道+3`],
      }

    case 'get_4_coffee':
      return {
        ...grantKitchenItems(state, player.id, { coffee: 4 }),
        logs: [...state.logs, `${player.name} 触发员工能力: 咖啡+4（立即放入厨房）`],
      }

    case 'get_one_of_each':
      return {
        ...grantKitchenItems(state, player.id, { food: 1, cake: 1, wine: 1, coffee: 1 }),
        logs: [...state.logs, `${player.name} 触发员工能力: 各餐饮+1（立即放入厨房）`],
      }

    case 'get_4_strudel':
      return {
        ...grantKitchenItems(state, player.id, { food: 4 }),
        logs: [...state.logs, `${player.name} 触发员工能力: 面包+4（立即放入厨房）`],
      }

    case 'get_4_cake':
      return {
        ...grantKitchenItems(state, player.id, { cake: 4 }),
        logs: [...state.logs, `${player.name} 触发员工能力: 蛋糕+4（立即放入厨房）`],
      }

    case 'get_4_wine':
      return {
        ...grantKitchenItems(state, player.id, { wine: 4 }),
        logs: [...state.logs, `${player.name} 触发员工能力: 红酒+4（立即放入厨房）`],
      }

    case 'turn_2_rooms_occupied': {
      let remaining = 2
      const newBuiltRooms = player.builtRooms.map(r => {
        if (remaining > 0 && r.capacity > 0) {
          remaining--
          return { ...r, capacity: 0 }
        }
        return r
      })
      const turnedCount = 2 - remaining
      return {
        ...state,
        players: state.players.map((p, i) =>
          i === pIdx ? { ...p, builtRooms: newBuiltRooms } : p
        ),
        logs: [...state.logs, `${player.name} 触发员工能力: ${turnedCount}个房间翻为已入住`],
      }
    }

    case 'complete_guest_from_supply': {
      // 从公共供应区（无限）拿取食物直接完成一位客人的订单
      // 找到玩家等待区中第一个有匹配空房间的客人
      const guestToServe = player.guestWaitingArea.find(g => {
        return player.builtRooms.some(r => {
          if (r.capacity <= 0) return false
          if (g.color === 'green') return true
          return r.color === g.color
        })
      })

      if (!guestToServe) {
        return {
          ...state,
          logs: [...state.logs, `${player.name} 触发员工能力: 从供应区完成客人，但没有可服务的客人或可用房间`],
        }
      }

      // 从无穷供应区填满客人需求到 placedResources
      const fullResources: Partial<Resources> = {}
      guestToServe.requirements.forEach(req => {
        fullResources[req.type] = (fullResources[req.type] ?? 0) + req.amount
      })

      // 更新客人卡的 placedResources
      const updatedWaitingArea = player.guestWaitingArea.map(g => {
        if (g.id === guestToServe.id) {
          return { ...g, placedResources: { ...g.placedResources, ...fullResources } }
        }
        return g
      })

      const playerWithFullResources = {
        ...player,
        guestWaitingArea: updatedWaitingArea,
      }

      // 找第一个匹配颜色的可用房间
      const roomEntry = playerWithFullResources.builtRooms.find(r => {
        if (r.capacity <= 0) return false
        if (guestToServe.color === 'green') return true
        return r.color === guestToServe.color
      })

      if (!roomEntry) {
        return {
          ...state,
          logs: [...state.logs, `${player.name} 触发员工能力: 从供应区完成客人，但没有可用房间`],
        }
      }

      // 执行服务（从客人卡上的 placedResources 扣除资源）
      const guestIdx = playerWithFullResources.guestWaitingArea.findIndex(g => g.id === guestToServe.id)
      const updatedGuest = playerWithFullResources.guestWaitingArea[guestIdx]

      const newPlacedResources = { ...updatedGuest.placedResources }
      updatedGuest.requirements.forEach(req => {
        newPlacedResources[req.type] = (newPlacedResources[req.type] ?? 0) - req.amount
      })

      let newScore = playerWithFullResources.score + updatedGuest.victoryPoints
      let newRes = { ...playerWithFullResources.resources }
      if (updatedGuest.bonusResource && updatedGuest.bonusAmount) {
        newRes[updatedGuest.bonusResource] += updatedGuest.bonusAmount
      }

      // 永久能力：客人服务相关触发（与 serveGuestWithRoom 一致）
      // green_guest_plus_2vp - 导游 - 每完成一位绿色客人额外获得2分
      if (updatedGuest.color === 'green' && hasPermanentAbility(playerWithFullResources, 'green_guest_plus_2vp')) {
        newScore += 2
      }
      // yellow_guest_plus_1kr - 按摩师 - 每完成一位黄色客人额外获得1克朗
      if (updatedGuest.color === 'yellow' && hasPermanentAbility(playerWithFullResources, 'yellow_guest_plus_1kr')) {
        newRes = { ...newRes, money: newRes.money + 1 }
      }
      // red_guest_plus_2kr - 马夫 - 每完成一位红色客人额外获得2克朗
      if (updatedGuest.color === 'red' && hasPermanentAbility(playerWithFullResources, 'red_guest_plus_2kr')) {
        newRes = { ...newRes, money: newRes.money + 2 }
      }
      // blue_guest_emperor_1 - 马厩管理员 - 每完成一位蓝色客人，皇帝轨道前进1格
      let newEmperorTrack = playerWithFullResources.emperorTrack
      if (updatedGuest.color === 'blue' && hasPermanentAbility(playerWithFullResources, 'blue_guest_emperor_1')) {
        newEmperorTrack += 1
      }
      // serve_4dish_plus_4vp - 楼层男服务员 - 每完成一位需要4份食物的客人额外获得4分
      const totalDishes = updatedGuest.requirements.reduce((sum, req) => sum + req.amount, 0)
      if (totalDishes >= 4 && hasPermanentAbility(playerWithFullResources, 'serve_4dish_plus_4vp')) {
        newScore += 4
      }
      // guest_to_room_plus_1kr - 房屋管理员 - 每当有客人入住房间时，获得1克朗
      if (hasPermanentAbility(playerWithFullResources, 'guest_to_room_plus_1kr')) {
        newRes = { ...newRes, money: newRes.money + 1 }
      }

      const builtRooms = playerWithFullResources.builtRooms.map(r =>
        r.id === roomEntry.id ? { ...r, capacity: r.capacity - 1 } : r
      )

      const updatedPlayerFinal = {
        ...playerWithFullResources,
        resources: newRes,
        score: newScore,
        emperorTrack: newEmperorTrack ?? playerWithFullResources.emperorTrack,
        guestWaitingArea: playerWithFullResources.guestWaitingArea.filter((_, i) => i !== guestIdx),
        guestServedArea: [...playerWithFullResources.guestServedArea, { ...updatedGuest, placedResources: newPlacedResources }],
        builtRooms,
      }

      return {
        ...state,
        players: state.players.map((p, i) => i === pIdx ? updatedPlayerFinal : p),
        logs: [...state.logs, `${player.name} 触发员工能力: 从供应区完成${updatedGuest.name}(${updatedGuest.color})的服务，获得${updatedGuest.victoryPoints}分`],
      }
    }

    default:
      return state
  }
}

// --- 永久能力检查辅助函数 ---

function hasPermanentAbility(player: Player, ability: StaffAbility): boolean {
  return player.staffCards.some(s => s.timing === 'permanent' && s.ability === ability)
}

// --- Guest Invite (付费邀请，咖啡厅容量3) ---

export function canInviteGuest(player: Player, guest: GuestCard): boolean {
  if (player.guestWaitingArea.length >= MAX_CAFE_SEATS) return false
  return player.resources.money >= inviteCost(player, guest)
}

/** 永久能力：信差 - 可从版图免费邀请客人 */
function inviteCost(player: Player, guest: GuestCard): number {
  return hasPermanentAbility(player, 'free_guest') ? 0 : guest.guestCost
}

export function inviteGuest(state: GameState, playerId: string, guestId: string): GameState {
  const guestIdx = state.availableGuests.findIndex(g => g.id === guestId)
  if (guestIdx === -1) return state
  const guest = state.availableGuests[guestIdx]

  const inviter = state.players.find(p => p.id === playerId)
  if (!inviter || !canInviteGuest(inviter, guest)) return state

  const players = state.players.map(p => {
    if (p.id !== playerId) return p
    return {
      ...p,
      resources: { ...p.resources, money: p.resources.money - inviteCost(p, guest) },
      guestWaitingArea: [...p.guestWaitingArea, { ...guest, placedResources: {} }],
    }
  })
  const availableGuests = refillGuestBoard(players, state.availableGuests.filter((_, i) => i !== guestIdx))

  return {
    ...state, players, availableGuests,
    logs: [...state.logs, `${state.players.find(p => p.id === playerId)?.name} 花费${inviteCost(inviter, guest)}元邀请${guest.name}(${players.find(p => p.id === playerId)?.guestWaitingArea.length}/${MAX_CAFE_SEATS})`],
  }
}

// ========================================================
// 客人入住颜色匹配 (Guest Room Color Matching) - 任务4
// ========================================================

/**
 * 检查客人是否可以服务（资源是否满足 + 有空房间 + 颜色匹配）
 */
export function canServeGuest(player: Player, guest: GuestCard): boolean {
  const hasRoom = player.builtRooms.some(r => r.capacity > 0)
  if (!hasRoom) return false

  // 检查是否有匹配颜色的空房间
  const matchedRoom = player.builtRooms.find(r => {
    if (r.capacity <= 0) return false
    // 绿客人可住任何颜色房间
    if (guest.color === 'green') return true
    // 其他客人必须匹配颜色
    return r.color === guest.color
  })
  if (!matchedRoom) return false

  // 检查资源（从客人卡上的 placedResources 检查）
  return guest.requirements.every(req => ((guest.placedResources ?? {})[req.type] ?? 0) >= req.amount)
}

/**
 * 获取客人可入住的空房间 slot（用于选择房间）
 */
export function getValidRoomSlotsForGuest(player: Player, guest: GuestCard): { builtIdx: number; slot: { row: number; col: number; color: RoomColor } }[] {
  const results: { builtIdx: number; slot: { row: number; col: number; color: RoomColor } }[] = []

  player.builtRooms.forEach((r, builtIdx) => {
    if (r.capacity <= 0) return

    // 找该房间对应的 slot
    const slot = player.roomSlots.find(s => s.roomId === r.id)
    if (!slot) return

    // 颜色匹配检查
    if (guest.color === 'green' || r.color === guest.color) {
      results.push({ builtIdx, slot })
    }
  })

  return results
}

/**
 * 服务客人并指定入住哪个房间 slot
 */
export function serveGuestWithRoom(player: Player, guestId: string, slotRow: number, slotCol: number): Player {
  const idx = player.guestWaitingArea.findIndex(g => g.id === guestId)
  if (idx === -1) return player

  const guest = player.guestWaitingArea[idx]
  if (!canServeGuest(player, guest)) return player

  // 检查该 slot 是否有效且颜色匹配
  const slot = player.roomSlots.find(s => s.row === slotRow && s.col === slotCol)
  if (!slot || !slot.roomId) return player

  const room = player.builtRooms.find(r => r.id === slot.roomId)
  if (!room || room.capacity <= 0) return player

  // 颜色匹配检查
  if (guest.color !== 'green' && room.color !== guest.color) return player

  // 从客人卡上的 placedResources 扣除资源
  const newPlacedResources = { ...guest.placedResources }
  guest.requirements.forEach(req => {
    newPlacedResources[req.type] = (newPlacedResources[req.type] ?? 0) - req.amount
  })

  // 增加分数和奖励（奖励资源发放到 player.resources）
  let newScore = player.score + guest.victoryPoints
  let newRes = { ...player.resources }
  if (guest.bonusResource && guest.bonusAmount) {
    newRes[guest.bonusResource] += guest.bonusAmount
  }

  // 永久能力：客人服务相关触发
  // green_guest_plus_2vp - 导游 - 每完成一位绿色客人额外获得2分
  if (guest.color === 'green' && hasPermanentAbility(player, 'green_guest_plus_2vp')) {
    newScore += 2
  }
  // yellow_guest_plus_1kr - 按摩师 - 每完成一位黄色客人额外获得1克朗
  if (guest.color === 'yellow' && hasPermanentAbility(player, 'yellow_guest_plus_1kr')) {
    newRes = { ...newRes, money: newRes.money + 1 }
  }
  // red_guest_plus_2kr - 马夫 - 每完成一位红色客人额外获得2克朗
  if (guest.color === 'red' && hasPermanentAbility(player, 'red_guest_plus_2kr')) {
    newRes = { ...newRes, money: newRes.money + 2 }
  }
  // blue_guest_emperor_1 - 马厩管理员 - 每完成一位蓝色客人，皇帝轨道前进1格
  let newEmperorTrack = player.emperorTrack
  if (guest.color === 'blue' && hasPermanentAbility(player, 'blue_guest_emperor_1')) {
    newEmperorTrack += 1
  }
  // serve_4dish_plus_4vp - 楼层男服务员 - 每完成一位需要4份食物的客人额外获得4分
  const totalDishes = guest.requirements.reduce((sum, req) => sum + req.amount, 0)
  if (totalDishes >= 4 && hasPermanentAbility(player, 'serve_4dish_plus_4vp')) {
    newScore += 4
  }
  // guest_to_room_plus_1kr - 房屋管理员 - 每当有客人入住房间时，获得1克朗
  if (hasPermanentAbility(player, 'guest_to_room_plus_1kr')) {
    newRes = { ...newRes, money: newRes.money + 1 }
  }

  // 房间容量减1
  const builtRooms = player.builtRooms.map(r =>
    r.id === slot.roomId ? { ...r, capacity: r.capacity - 1 } : r
  )

  return {
    ...player,
    resources: newRes,
    score: newScore,
    emperorTrack: newEmperorTrack,
    guestWaitingArea: player.guestWaitingArea.filter((_, i) => i !== idx),
    guestServedArea: [...player.guestServedArea, { ...guest, placedResources: newPlacedResources }],
    builtRooms,
  }
}

/**
 * 旧版 serveGuest（无房间选择，自动分配） - 保持兼容但已不推荐
 */
export function serveGuest(player: Player, guestId: string): Player {
  const idx = player.guestWaitingArea.findIndex(g => g.id === guestId)
  if (idx === -1) return player

  const guest = player.guestWaitingArea[idx]
  if (!canServeGuest(player, guest)) return player

  // 找第一个可用的匹配颜色的房间
  const roomEntry = player.builtRooms.find(r => {
    if (r.capacity <= 0) return false
    if (guest.color === 'green') return true
    return r.color === guest.color
  })
  if (!roomEntry) return player

  // 从客人卡上的 placedResources 扣除资源
  const newPlacedResources = { ...guest.placedResources }
  guest.requirements.forEach(req => {
    newPlacedResources[req.type] = (newPlacedResources[req.type] ?? 0) - req.amount
  })

  let newScore = player.score + guest.victoryPoints
  let newRes = { ...player.resources }
  if (guest.bonusResource && guest.bonusAmount) {
    newRes[guest.bonusResource] += guest.bonusAmount
  }

  // 永久能力：客人服务相关触发
  // green_guest_plus_2vp - 导游 - 每完成一位绿色客人额外获得2分
  if (guest.color === 'green' && hasPermanentAbility(player, 'green_guest_plus_2vp')) {
    newScore += 2
  }
  // yellow_guest_plus_1kr - 按摩师 - 每完成一位黄色客人额外获得1克朗
  if (guest.color === 'yellow' && hasPermanentAbility(player, 'yellow_guest_plus_1kr')) {
    newRes = { ...newRes, money: newRes.money + 1 }
  }
  // red_guest_plus_2kr - 马夫 - 每完成一位红色客人额外获得2克朗
  if (guest.color === 'red' && hasPermanentAbility(player, 'red_guest_plus_2kr')) {
    newRes = { ...newRes, money: newRes.money + 2 }
  }
  // blue_guest_emperor_1 - 马厩管理员 - 每完成一位蓝色客人，皇帝轨道前进1格
  let newEmperorTrack = player.emperorTrack
  if (guest.color === 'blue' && hasPermanentAbility(player, 'blue_guest_emperor_1')) {
    newEmperorTrack += 1
  }
  // serve_4dish_plus_4vp - 楼层男服务员 - 每完成一位需要4份食物的客人额外获得4分
  const totalDishes = guest.requirements.reduce((sum, req) => sum + req.amount, 0)
  if (totalDishes >= 4 && hasPermanentAbility(player, 'serve_4dish_plus_4vp')) {
    newScore += 4
  }
  // guest_to_room_plus_1kr - 房屋管理员 - 每当有客人入住房间时，获得1克朗
  if (hasPermanentAbility(player, 'guest_to_room_plus_1kr')) {
    newRes = { ...newRes, money: newRes.money + 1 }
  }

  const builtRooms = player.builtRooms.map(r =>
    r.id === roomEntry.id ? { ...r, capacity: r.capacity - 1 } : r
  )

  return {
    ...player,
    resources: newRes,
    score: newScore,
    emperorTrack: newEmperorTrack,
    guestWaitingArea: player.guestWaitingArea.filter((_, i) => i !== idx),
    guestServedArea: [...player.guestServedArea, { ...guest, placedResources: newPlacedResources }],
    builtRooms,
  }
}

// --- Build Room ---

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
    ...player, resources: newRes,
    score: player.score + room.victoryPoints,
    builtRooms: [...player.builtRooms, { ...room, isBuilt: true }],
  }
}

// --- Hire Staff ---

export function canHireStaff(player: Player, staff: { cost: number }): boolean {
  return player.resources.money >= staff.cost
}

export function hireStaff(state: GameState, staffId: string): GameState {
  const staff = staffCards.find(s => s.id === staffId)
  if (!staff) return state

  const players = state.players.map((p, i) =>
    i === state.currentPlayerIndex
      ? {
          ...p,
          resources: { ...p.resources, money: p.resources.money - staff.cost },
          score: p.score + staff.victoryPoints,
          staffCards: [...p.staffCards, staff],
        }
      : p
  )

  const result: GameState = { ...state, players }

  if (staff.timing === 'one_time') {
    return applyOneTimeStaffAbility(result, staff)
  }

  return result
}

// --- Emperor Scoring ---

const EMPEROR_SCORE_MAP: Record<number, number> = {
  0: 0, 1: 0, 2: 0, 3: 1, 4: 2, 5: 3, 6: 4, 7: 5, 8: 7, 9: 9, 10: 11, 11: 13, 12: 15, 13: 17,
}

function calculateEmperorScore(position: number): number {
  return EMPEROR_SCORE_MAP[Math.min(position, 13)] ?? 0
}

const EMPEROR_REGRESSION = [3, 5, 7]

function applyEmperorEffect(player: Player, effect: { amount?: number; type: string }): Player {
  switch (effect.type) {
    case 'money':
      return { ...player, resources: { ...player.resources, money: Math.max(0, player.resources.money + (effect.amount ?? 0)) } }
    case 'score':
      return { ...player, score: Math.max(0, player.score + (effect.amount ?? 0)) }
    case 'food':
      return { ...player, kitchen: { ...player.kitchen, food: player.kitchen.food + (effect.amount ?? 0) } }
    case 'mixed_food':
      return {
        ...player,
        kitchen: {
          ...player.kitchen,
          food: player.kitchen.food + 1,
          cake: player.kitchen.cake + 1,
          wine: player.kitchen.wine + 1,
          coffee: player.kitchen.coffee + 1,
        },
      }
    case 'score_per_staff':
      return { ...player, score: Math.max(0, player.score + (effect.amount ?? 0) * player.staffCards.length) }
    default:
      return player
  }
}

function hasKitchenItems(player: Player): boolean {
  const k = player.kitchen
  return k.food + k.cake + k.wine + k.coffee > 0
}

/** 已放置但还没有客人入住的客房（板块正面朝上） */
function placedUnoccupiedSlots(player: Player) {
  return player.roomSlots.filter(s => s.roomId !== null && !isSlotOccupied(player, s))
}

function occupiedSlots(player: Player) {
  return player.roomSlots.filter(s => isSlotOccupied(player, s))
}

/** 惩罚是否真的能执行（无损失可扣时视为不可执行） */
function isPenaltyApplicable(player: Player, penalty: EmperorEffect): boolean {
  switch (penalty.type) {
    case 'money':
      return player.resources.money >= Math.abs(penalty.amount ?? 0)
    case 'lose_staff':
      return player.staffCards.length >= (penalty.amount ?? 1)
    case 'lose_kitchen':
      // B1 还要清空房客需求区的餐饮，两侧都空才算无法执行
      if (penalty.clearGuestItems && player.resources.food + player.resources.cake +
          player.resources.wine + player.resources.coffee > 0) return true
      return hasKitchenItems(player)
    case 'remove_guest':
      return placedUnoccupiedSlots(player).length > 0
    case 'remove_built_room':
      return occupiedSlots(player).length >= (penalty.amount ?? 1)
    default:
      return true
  }
}

/**
 * 只有一个可执行的惩罚时自动结算（皇帝计分是全场同时进行的，让玩家逐个弹窗会卡住流程）；
 * 有多个可执行惩罚时返回 null，交给 pendingPenalty 让玩家选择；
 * 全都不可执行时返回第一个惩罚（等价于无损失），避免停留在待选择状态。
 */
function getAutoResolvedPenalty(player: Player, penalties: EmperorEffect[]): EmperorEffect | null {
  const applicable = penalties.filter(p => isPenaltyApplicable(player, p))
  if (applicable.length === 1) return applicable[0]
  if (applicable.length > 1) return null
  return penalties[0] ?? null
}

function drawStaffFromDeck(state: GameState, count: number): StaffCard[] {
  const inUse = new Set<string>()
  for (const p of state.players) {
    for (const c of p.staffCards) inUse.add(c.id)
    for (const c of p.draftHand) inUse.add(c.id)
  }
  for (const c of state.availableStaff) inUse.add(c.id)
  return staffCards.filter(c => !inUse.has(c.id)).slice(0, count)
}

function queueBonusChoice(state: GameState, choice: BonusChoice): GameState {
  return {
    ...state,
    pendingBonusChoices: [...(state.pendingBonusChoices ?? []), choice],
    logs: [...state.logs, `${state.players.find(p => p.id === choice.playerId)?.name ?? ''} 需要选择: ${choice.description}`],
  }
}

/** 从版图/玩家手中移除一间客房，房卡回到供应堆 */
function removeRoomAt(state: GameState, playerId: string, slot: HotelBoardSlot, logPrefix: string): GameState {
  const player = state.players.find(p => p.id === playerId)
  if (!player || !slot.roomId) return state
  const built = player.builtRooms.find(r => r.id === slot.roomId)
  const players = state.players.map(p => p.id === playerId ? {
    ...p,
    roomSlots: p.roomSlots.map(s => s.row === slot.row && s.col === slot.col ? { ...s, roomId: null } : s),
    builtRooms: p.builtRooms.filter(r => r.id !== slot.roomId),
  } : p)
  const availableRooms = built
    ? [...state.availableRooms, { ...built, capacity: 1, isBuilt: false }]
    : state.availableRooms
  return {
    ...state, players, availableRooms,
    logs: [...state.logs, `${logPrefix} (${slot.row},${slot.col})`],
  }
}

function applyEmperorPenalty(state: GameState, playerId: string, penalty: EmperorEffect): GameState {
  const player = state.players.find(p => p.id === playerId)
  if (!player) return state
  const name = player.name

  switch (penalty.type) {
    case 'lose_kitchen': {
      const clearItems = (r: Player['resources']) => ({ ...r, food: 0, wine: 0, coffee: 0, cake: 0 })
      return {
        ...state,
        players: state.players.map(p => p.id === playerId ? {
          ...p,
          kitchen: clearItems(p.kitchen),
          resources: penalty.clearGuestItems ? clearItems(p.resources) : p.resources,
        } : p),
        logs: [...state.logs, `${name} 受到皇帝惩罚: ${penalty.description}`],
      }
    }
    case 'lose_staff': {
      const amount = penalty.amount ?? 1
      // 自动弃牌时优先损失价值最低的卡（避免为了弹窗打断计分流程）
      const losing = [...player.staffCards]
        .sort((a, b) => a.victoryPoints - b.victoryPoints)
        .slice(0, amount)
        .map(c => c.id)
      if (losing.length === 0) {
        return { ...state, logs: [...state.logs, `${name} 受到皇帝惩罚: ${penalty.description}（手中无员工卡，无损失）`] }
      }
      return {
        ...state,
        players: state.players.map(p => p.id === playerId
          ? { ...p, staffCards: p.staffCards.filter(c => !losing.includes(c.id)) } : p),
        logs: [...state.logs, `${name} 受到皇帝惩罚: 放回牌库底 ${losing.length} 张员工卡`],
      }
    }
    case 'remove_guest': {
      const target = placedUnoccupiedSlots(player).sort((a, b) => b.row - a.row)[0]
      if (!target) {
        return { ...state, logs: [...state.logs, `${name} 受到皇帝惩罚: ${penalty.description}（没有未入住客房，无损失）`] }
      }
      return removeRoomAt(state, playerId, target, `${name} 受到皇帝惩罚: 移除未入住客房`)
    }
    case 'remove_built_room': {
      const targets = occupiedSlots(player).sort((a, b) => b.row - a.row).slice(0, penalty.amount ?? 1)
      if (targets.length === 0) {
        return { ...state, logs: [...state.logs, `${name} 受到皇帝惩罚: ${penalty.description}（没有已入住客房，无损失）`] }
      }
      return targets.reduce(
        (acc, slot) => removeRoomAt(acc, playerId, slot, `${name} 受到皇帝惩罚: 移除已入住客房`),
        state,
      )
    }
    default:
      return {
        ...state,
        players: state.players.map(p => p.id === playerId ? applyEmperorEffect(p, penalty) : p),
        logs: [...state.logs, `${name} 受到皇帝惩罚: ${penalty.description}`],
      }
  }
}

function applyEmperorReward(state: GameState, playerId: string, tile: EmperorTile): GameState {
  const player = state.players.find(p => p.id === playerId)
  if (!player) return state
  const reward = tile.reward
  const name = player.name
  const rewardLog = [...state.logs, `${name} 获得皇帝奖励: ${reward.description}`]

  let next: GameState
  switch (reward.type) {
    case 'staff_draw_play':
    case 'staff_draw_free':
    case 'free_staff': {
      const options = reward.type === 'free_staff' ? state.availableStaff : drawStaffFromDeck(state, 3)
      if (options.length === 0) {
        return { ...state, logs: [...rewardLog, `${name} 没有可打的员工卡，奖励作废`] }
      }
      next = queueBonusChoice({ ...state, logs: rewardLog }, {
        playerId, kind: 'staff', description: reward.description,
        staffOptions: options.map(c => c.id),
        discount: reward.type === 'staff_draw_play' ? 3 : 0,
        freeStaff: reward.type !== 'staff_draw_play',
      })
      break
    }
    case 'free_room':
    case 'free_room_built':
      next = queueBonusChoice({ ...state, logs: rewardLog }, {
        playerId, kind: 'room', description: reward.description,
        freeRoom: true,
        maxRow: reward.type === 'free_room_built' && tile.id === 'B4' ? 1 : undefined,
        occupyImmediately: reward.type === 'free_room_built',
      })
      break
    case 'advance_emperor':
      next = {
        ...state,
        players: state.players.map(p => p.id === playerId
          ? { ...p, emperorTrack: Math.min(13, p.emperorTrack + (reward.amount ?? 1)) } : p),
        logs: rewardLog,
      }
      break
    default:
      next = {
        ...state,
        players: state.players.map(p => p.id === playerId ? applyEmperorEffect(p, reward) : p),
        logs: rewardLog,
      }
  }

  // 永久能力：园丁 - 每次获得皇帝奖励额外+5分
  if (!hasPermanentAbility(player, 'emperor_bonus_5vp')) return next
  return {
    ...next,
    players: next.players.map(p => p.id === playerId ? { ...p, score: p.score + 5 } : p),
    logs: [...next.logs, `${name} 触发永久能力【园丁】: 皇帝奖励额外+5分`],
  }
}

export function performEmperorScoring(state: GameState): GameState {
  const scoringIndex = state.emperorScoringCount
  if (scoringIndex >= 3) return state

  const regression = EMPEROR_REGRESSION[scoringIndex]
  const tile = state.emperorTiles[scoringIndex]

  let working: GameState = {
    ...state,
    emperorScoringCount: scoringIndex + 1,
    logs: [
      ...state.logs,
      `👑 第${scoringIndex + 1}次皇帝计分！ (回退${regression}格)`,
      ...state.players.map(p => {
        const scoreGain = calculateEmperorScore(p.emperorTrack)
        return `${p.name}: 皇帝轨道${p.emperorTrack}格 → 获得${scoreGain}分 → 回退到${Math.max(0, p.emperorTrack - regression)}格`
      }),
    ],
    players: state.players.map(p => ({
      ...p,
      score: p.score + calculateEmperorScore(p.emperorTrack),
      // 奖励/惩罚取决于回退后的最终位置，而不是回退前
      emperorTrack: Math.max(0, p.emperorTrack - regression),
    })),
  }

  const pendingPlayerIds: string[] = []
  for (const scored of working.players) {
    if (!tile) break
    if (scored.emperorTrack >= 3) {
      working = applyEmperorReward(working, scored.id, tile)
    } else if (scored.emperorTrack === 0) {
      // 永久能力：活动策划经理 - 不受皇帝轨道0格惩罚
      if (hasPermanentAbility(scored, 'no_emperor_penalty')) {
        working = { ...working, logs: [...working.logs, `${scored.name} 触发永久能力【活动策划经理】: 免受0格惩罚`] }
        continue
      }
      const current = working.players.find(p => p.id === scored.id)!
      const auto = getAutoResolvedPenalty(current, tile.penalties)
      if (auto) working = applyEmperorPenalty(working, current.id, auto)
      else pendingPlayerIds.push(current.id)
    }
  }

  const pendingPenalty: GameState['pendingPenalty'] =
    pendingPlayerIds.length > 0 && tile
      ? { playerId: pendingPlayerIds[0], penalties: tile.penalties, remainingPlayerIds: pendingPlayerIds.slice(1) }
      : null

  return { ...working, pendingPenalty }
}

export function resolvePenalty(state: GameState, penaltyIndex: number): GameState {
  if (!state.pendingPenalty) return state

  const { playerId, penalties, remainingPlayerIds } = state.pendingPenalty
  if (penaltyIndex < 0 || penaltyIndex >= penalties.length) return state

  const penalty = penalties[penaltyIndex]
  const playerName = state.players.find(p => p.id === playerId)?.name ?? ''
  const resolved = applyEmperorPenalty(state, playerId, penalty)
  const logs = [...resolved.logs]
  if (resolved.logs.length === state.logs.length) logs.push(`${playerName} 选择惩罚: ${penalty.description}`)

  let newPendingPenalty: GameState['pendingPenalty'] = null
  if (remainingPlayerIds.length > 0) {
    const tile = state.emperorTiles[state.emperorScoringCount - 1]
    if (tile) {
      newPendingPenalty = {
        playerId: remainingPlayerIds[0],
        penalties: tile.penalties,
        remainingPlayerIds: remainingPlayerIds.slice(1),
      }
    }
  }

  return { ...resolved, logs, pendingPenalty: newPendingPenalty }
}

/**
 * 结算队首的待选收益（皇帝奖励 / 员工永久能力）
 */
export function resolveBonusChoice(
  state: GameState,
  payload: { staffId?: string; placements?: RoomPlacement[] },
): GameState {
  const queue = state.pendingBonusChoices
  if (!queue || queue.length === 0) return state
  const choice = queue[0]
  const player = state.players.find(p => p.id === choice.playerId)
  if (!player) return { ...state, pendingBonusChoices: queue.length > 1 ? queue.slice(1) : null }

  const pop = (next: GameState): GameState => ({
    ...next,
    pendingBonusChoices: next.pendingBonusChoices && next.pendingBonusChoices.length > 1
      ? next.pendingBonusChoices.slice(1)
      : null,
  })

  if (choice.kind === 'staff') {
    const staff = staffCards.find(c => c.id === payload.staffId)
    if (!staff || !choice.staffOptions?.includes(staff.id)) return state
    const cost = choice.freeStaff ? 0 : Math.max(0, staff.cost - (choice.discount ?? 0))
    if (player.resources.money < cost) return state

    const players = state.players.map(p => p.id === choice.playerId ? {
      ...p,
      resources: { ...p.resources, money: p.resources.money - cost },
      staffCards: [...p.staffCards, staff],
      score: p.score + staff.victoryPoints,
    } : p)
    const withoutOption = {
      ...state, players,
      availableStaff: state.availableStaff.filter(c => c.id !== staff.id),
      logs: [...state.logs, `${player.name} ${choice.description}: 打出员工卡 ${staff.name}，花费${cost}元`],
    }
    const popped = pop(withoutOption)
    return staff.timing === 'one_time' ? applyOneTimeStaffAbility(popped, staff, choice.playerId) : popped
  }

  const placed = tryPlaceRooms(player, state.availableRooms, payload.placements ?? [], 1,
    { freeCost: choice.freeRoom, maxRow: choice.maxRow })
  if (!placed) return state

  let builtRooms = placed.player.builtRooms
  if (choice.occupyImmediately && builtRooms.length > 0) {
    builtRooms = builtRooms.map((r, i) => i === builtRooms.length - 1 ? { ...r, capacity: 0 } : r)
  }
  const players = state.players.map(p => p.id === choice.playerId ? { ...placed.player, builtRooms } : p)

  return pop({
    ...state, players,
    availableRooms: placed.availableRooms,
    logs: [...state.logs, ...placed.logs,
      `${player.name} ${choice.description}${choice.occupyImmediately ? '，客房立即入住' : ''}`],
  })
}

export function declineBonusChoice(state: GameState): GameState {
  const queue = state.pendingBonusChoices
  if (!queue || queue.length === 0) return state
  const choice = queue[0]
  const name = state.players.find(p => p.id === choice.playerId)?.name ?? ''
  return {
    ...state,
    pendingBonusChoices: queue.length > 1 ? queue.slice(1) : null,
    logs: [...state.logs, `${name} 放弃收益: ${choice.description}`],
  }
}

// --- End-of-Game Staff Ability ---

function countOccupiedRoomsByColor(player: Player, color: string): number {
  return countOccupiedSlots(player, s => s.color === color)
}

function countFilledRows(player: Player): number {
  const rows = new Map<number, { total: number; filled: number }>()
  for (const slot of player.roomSlots) {
    const entry = rows.get(slot.row) ?? { total: 0, filled: 0 }
    entry.total++
    if (isSlotOccupied(player, slot)) entry.filled++
    rows.set(slot.row, entry)
  }
  let count = 0
  for (const entry of rows.values()) {
    if (entry.total === entry.filled) count++
  }
  return count
}

function countFilledColumns(player: Player): number {
  const cols = new Map<number, { total: number; filled: number }>()
  for (const slot of player.roomSlots) {
    const entry = cols.get(slot.col) ?? { total: 0, filled: 0 }
    entry.total++
    if (isSlotOccupied(player, slot)) entry.filled++
    cols.set(slot.col, entry)
  }
  let count = 0
  for (const entry of cols.values()) {
    if (entry.total === entry.filled) count++
  }
  return count
}

function countFilledGroups(player: Player): number {
  const groups = new Map<number, { total: number; filled: number }>()
  for (const slot of player.roomSlots) {
    const entry = groups.get(slot.groupId) ?? { total: 0, filled: 0 }
    entry.total++
    if (isSlotOccupied(player, slot)) entry.filled++
    groups.set(slot.groupId, entry)
  }
  let count = 0
  for (const entry of groups.values()) {
    if (entry.total === entry.filled) count++
  }
  return count
}

function countOccupiedRooms(player: Player): number {
  return countOccupiedSlots(player)
}

function applyEndGameStaffAbility(player: Player, staff: StaffCard, _allPlayers: Player[]): number {
  switch (staff.ability) {
    case 'end_vp_per_blue_room':
      return countOccupiedRoomsByColor(player, 'blue') * 3
    case 'end_vp_per_staff':
      return player.staffCards.length * 4
    case 'end_vp_per_color_set': {
      const red = countOccupiedRoomsByColor(player, 'red')
      const yellow = countOccupiedRoomsByColor(player, 'yellow')
      const blue = countOccupiedRoomsByColor(player, 'blue')
      return Math.min(red, yellow, blue) * 4
    }
    case 'end_vp_per_yellow_room':
      return countOccupiedRoomsByColor(player, 'yellow') * 3
    case 'end_vp_per_floor':
      return countFilledRows(player) * 5
    case 'end_vp_per_column':
      return countFilledColumns(player) * 5
    case 'end_vp_per_politics':
      return player.politicsMarkers.length * 5
    case 'end_vp_per_red_room':
      return countOccupiedRoomsByColor(player, 'red') * 3
    case 'end_vp_per_room':
      return countOccupiedSlots(player) * 1
    case 'end_copy_staff': {
      // 复制另一位玩家的某张员工卡的终局计分效果
      // 遍历所有其他玩家，找到 end_of_game 类型员工卡中 VP 最高的一张
      let maxVp = 0
      for (const otherPlayer of _allPlayers) {
        if (otherPlayer.id === player.id) continue
        for (const otherStaff of otherPlayer.staffCards) {
          if (otherStaff.timing !== 'end_of_game') continue
          if (otherStaff.ability === 'end_copy_staff') continue // 避免递归
          const vp = applyEndGameStaffAbility(player, otherStaff, _allPlayers)
          maxVp = Math.max(maxVp, vp)
        }
      }
      return maxVp
    }
    case 'end_double_emperor_vp':
      return calculateEmperorScore(player.emperorTrack) * 2
    case 'end_vp_per_group':
      return countFilledGroups(player) * 2
    case 'end_vp_per_occupied_room':
      return countOccupiedRooms(player) * 1
    default:
      return 0
  }
}

// ========================================================
// 终局计分 (Final Scoring) - 任务7
// ========================================================

export function performFinalScoring(state: GameState): GameState {
  const allPlayers = state.players
  const players = state.players.map(p => {
    let finalScore = p.score

    // 规则7：只有「已入住」的客房按所在排给分
    // 第1排（row=0，最下面）= 1分，第2排（row=1）= 2分，第3排（row=2）= 3分，第4排（row=3）= 4分
    const roomScore = p.roomSlots
      .filter(s => isSlotOccupied(p, s))
      .reduce((sum, s) => sum + (s.row + 1), 0)
    finalScore += roomScore

    // 剩余现金：每元=1分
    finalScore += p.resources.money

    // 厨房剩余餐饮：每个=1分
    const kitchenScore = p.kitchen.food + p.kitchen.wine + p.kitchen.coffee + p.kitchen.cake
    finalScore += kitchenScore

    // 咖啡厅等待中的客人：每个扣5分
    const waitingPenalty = p.guestWaitingArea.length * 5
    finalScore -= waitingPenalty

    // 员工卡终局能力
    const endGameStaffScore = p.staffCards
      .filter(s => s.timing === 'end_of_game')
      .reduce((sum, s) => sum + applyEndGameStaffAbility(p, s, allPlayers), 0)
    finalScore += endGameStaffScore

    return { ...p, score: Math.max(0, finalScore) }
  })

  const sorted = [...players].sort((a, b) => {
    const scoreDiff = b.score - a.score
    if (scoreDiff !== 0) return scoreDiff
    // 平局判定：算上厨房、placedResources 和 player.resources 中的剩余资源
    const aKitchen = a.kitchen.food + a.kitchen.wine + a.kitchen.coffee + a.kitchen.cake
    const bKitchen = b.kitchen.food + b.kitchen.wine + b.kitchen.coffee + b.kitchen.cake
    const aPlacedTotal = a.guestWaitingArea.reduce((sum, g) =>
      sum + ((g.placedResources?.food ?? 0) + (g.placedResources?.wine ?? 0) +
            (g.placedResources?.coffee ?? 0) + (g.placedResources?.cake ?? 0)), 0
    )
    const bPlacedTotal = b.guestWaitingArea.reduce((sum, g) =>
      sum + ((g.placedResources?.food ?? 0) + (g.placedResources?.wine ?? 0) +
            (g.placedResources?.coffee ?? 0) + (g.placedResources?.cake ?? 0)), 0
    )
    const aRemaining = a.resources.food + a.resources.wine + a.resources.coffee + a.resources.cake + a.resources.money + aKitchen + aPlacedTotal
    const bRemaining = b.resources.food + b.resources.wine + b.resources.coffee + b.resources.cake + b.resources.money + bKitchen + bPlacedTotal
    return bRemaining - aRemaining
  })

  const winner = sorted[0]
  return {
    ...state, players, phase: 'game_end', winner,
    logs: [...state.logs, '📊 最终计分完成!', `🏆 ${winner.name} 以 ${winner.score} 分获胜！`],
  }
}

// ========================================================
// 每轮结束/顺位传递 (Round Management) - 任务6
// ========================================================

export function startNextRound(state: GameState): GameState {
  // 任务6：将顺位板顺时针传给下一位
  const newTileAssignments: (string | null)[] = state.players.map(() => null)
  for (let i = 0; i < state.players.length; i++) {
    const nextIdx = (i + 1) % state.players.length
    newTileAssignments[nextIdx] = state.players[i].turnOrderTileId
  }

  // 找到拥有最小 number 的 turnOrderTile 的玩家（新起始玩家）
  const updatedPlayers = state.players.map((p, i) => ({
    ...p,
    turnOrderTileId: newTileAssignments[i],
    isFirstPlayer: false,
    coveredSlots: 0,
    hasPassedInCycle: false,
    extraActionState: createPlayerExtraActionState(),
    guestInvitedThisTurn: false,
  }))

  // 找到新的第一顺位玩家
  const firstPlayerIdx = updatedPlayers.findIndex(p => {
    const tile = state.turnOrderTiles.find(t => t.id === p.turnOrderTileId)
    return tile?.number === 1
  })
  if (firstPlayerIdx >= 0) {
    updatedPlayers[firstPlayerIdx] = { ...updatedPlayers[firstPlayerIdx], isFirstPlayer: true }
  }

  return {
    ...state,
    phase: 'dice_roll',
    currentPlayerIndex: firstPlayerIdx >= 0 ? firstPlayerIdx : 0,
    players: updatedPlayers,
    dice: Array.from({ length: state.dice.length }, (_, i) => ({ id: i, value: 0, used: false })),
    areaDice: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
    roundNumber: state.roundNumber + 1,
    trashDiceCount: 0,
    pendingAllocation: null,
    logs: [...state.logs, `--- 第${state.roundNumber + 1}轮 ---`, '所有员工卡已翻回正面，顺位板顺时针传递'],
  }
}

// ========================================================
// 1. 政治卡系统 (Politics Cards)
// ========================================================

/**
 * 检查玩家是否满足某张政治卡的条件
 */
export function checkPoliticsCondition(player: Player, condition: PoliticsCondition): boolean {
  switch (condition) {
    case 'money_20':
      return player.resources.money >= 20

    case 'emperor_10':
      return player.emperorTrack >= 10

    case 'staff_6':
      return player.staffCards.length >= 6

    case 'room_12':
      return countOccupiedSlots(player) >= 12

    case 'row_2_full':
      return countFilledRows(player) >= 2

    case 'col_2_full':
      return countFilledColumns(player) >= 2

    case 'group_6_full':
      return countFilledGroups(player) >= 6

    case 'color_all_full': {
      const colors: RoomColor[] = ['red', 'yellow', 'blue']
      return colors.some(color => {
        const slots = player.roomSlots.filter(s => s.color === color)
        return slots.length > 0 && slots.every(s => isSlotOccupied(player, s))
      })
    }

    case 'color_3_each': {
      const colors: RoomColor[] = ['red', 'yellow', 'blue']
      return colors.every(color => countOccupiedSlots(player, s => s.color === color) >= 3)
    }

    case 'red_4_yellow_3':
      return countOccupiedSlots(player, s => s.color === 'red') >= 4 &&
        countOccupiedSlots(player, s => s.color === 'yellow') >= 3

    case 'yellow_4_blue_3':
      return countOccupiedSlots(player, s => s.color === 'yellow') >= 4 &&
        countOccupiedSlots(player, s => s.color === 'blue') >= 3

    case 'blue_4_red_3':
      return countOccupiedSlots(player, s => s.color === 'blue') >= 4 &&
        countOccupiedSlots(player, s => s.color === 'red') >= 3

    default:
      return false
  }
}

/**
 * 获取玩家在政治卡上的标记数量
 */
export function getPlayerPoliticsCount(player: Player): number {
  return player.politicsMarkers.length
}

/**
 * 玩家放置圆片到政治卡上
 */
export function placePoliticsMarker(state: GameState, playerId: string, cardId: string): GameState {
  const pIdx = state.players.findIndex(p => p.id === playerId)
  if (pIdx === -1) return state

  const player = state.players[pIdx]
  const card = state.politicsCards.find(c => c.id === cardId)
  if (!card) return state

  // 检查玩家是否已经在这张卡上放置了圆片
  if (player.politicsMarkers.some(m => m.cardId === cardId)) {
    return { ...state, logs: [...state.logs, `${player.name} 已经在该政治卡上放置过圆片`] }
  }

  // 检查玩家是否满足条件
  if (!checkPoliticsCondition(player, card.condition)) {
    return { ...state, logs: [...state.logs, `${player.name} 不满足${card.name}的条件`] }
  }

  const newMarker = { playerId, cardId }
  const updatedPlayer = {
    ...player,
    politicsMarkers: [...player.politicsMarkers, newMarker],
    score: player.score + card.victoryPoints,
  }

  const players = state.players.map((p, i) => i === pIdx ? updatedPlayer : p)

  return {
    ...state, players,
    logs: [...state.logs, `${player.name} 在${card.name}上放置圆片，获得${card.victoryPoints}分`],
  }
}

// ========================================================
// 2. 回合顺位板 (Turn Order Tiles)
// ========================================================

/**
 * 分配顺位板给玩家（按逆时针）
 */
export function assignTurnOrderTiles(state: GameState): GameState {
  const { players, turnOrderTiles } = state
  const sortedTiles = [...turnOrderTiles].sort((a, b) => a.number - b.number)

  // 按逆时针顺序分配（起始玩家拿1号）
  const firstPlayerIdx = players.findIndex(p => p.isFirstPlayer)
  const updatedPlayers = players.map((p, i) => {
    const tileIdx = (i - firstPlayerIdx + players.length) % players.length
    const tile = sortedTiles[tileIdx]
    return { ...p, turnOrderTileId: tile?.id ?? null }
  })

  return {
    ...state, players: updatedPlayers,
    logs: [...state.logs, '已分配回合顺位板'],
  }
}

/**
 * 获取玩家当前的顺位板
 */
export function getPlayerTurnOrderTile(state: GameState, playerId: string): TurnOrderTile | null {
  const player = state.players.find(p => p.id === playerId)
  if (!player?.turnOrderTileId) return null
  return state.turnOrderTiles.find(t => t.id === player.turnOrderTileId) ?? null
}

/**
 * 检查玩家是否可以执行某种额外行动
 */
export function canPerformExtraAction(state: GameState, playerId: string, action: 'add_die' | 'use_staff_ability'): boolean {
  const player = state.players.find(p => p.id === playerId)
  if (!player) return false

  if (action === 'add_die') {
    return !player.extraActionState.addDieUsedThisTurn
  }
  if (action === 'use_staff_ability') {
    return !player.extraActionState.staffAbilityUsedThisTurn
  }
  return true
}

/**
 * 获取当前玩家可用的 once_per_round 员工卡列表（供额外行动选择）
 */
export function getAvailableStaffCardsForExtraAction(player: Player): StaffCard[] {
  return player.staffCards.filter(
    staff => staff.timing === 'once_per_round' &&
      ['once_wine', 'once_strudel', 'once_cake', 'once_coffee'].includes(staff.ability)
  )
}

/**
 * 检查玩家是否拥有某种额外行动能力
 */
export function hasExtraAction(state: GameState, playerId: string, action: string): boolean {
  const tile = getPlayerTurnOrderTile(state, playerId)
  if (!tile) return false
  return tile.extraActions.includes(action as any)
}

// ========================================================
// 3. 厨房管理 (Kitchen Management)
// ========================================================

/**
 * 从厨房移动食物到客人卡片
 * 上限最多移动3个（顺位板能力可触发）
 * 普通支付1元可移动最多3个
 */
export function moveKitchenToGuest(
  state: GameState,
  playerId: string,
  guestId: string,
  resources: Partial<Resources>,
  count: number
): GameState {
  const pIdx = state.players.findIndex(p => p.id === playerId)
  if (pIdx === -1) return state

  const player = state.players[pIdx]
  const guest = player.guestWaitingArea.find(g => g.id === guestId)
  if (!guest) return state

  // 检查移动数量上限
  if (count > 3) return state

  // 检查费用：除非有免费送餐能力(s28 - 首席服务员)，否则从玩家资金支付1克朗
  const hasFreeServe = hasPermanentAbility(player, 'free_serve_guest')
  if (!hasFreeServe) {
    if (player.resources.money < 1) return state
  }

  // 检查厨房是否有足够的资源
  const food = resources.food ?? 0
  const wine = resources.wine ?? 0
  const coffee = resources.coffee ?? 0
  const cake = resources.cake ?? 0

  if (player.kitchen.food < food ||
      player.kitchen.wine < wine ||
      player.kitchen.coffee < coffee ||
      player.kitchen.cake < cake) {
    return state
  }

  // 厨房只减餐饮，1克朗费用来自玩家资金
  const serveCost = hasFreeServe ? 0 : 1
  const newKitchen = {
    food: player.kitchen.food - food,
    wine: player.kitchen.wine - wine,
    coffee: player.kitchen.coffee - coffee,
    cake: player.kitchen.cake - cake,
    money: player.kitchen.money,
  }

  // 将食物放到客人卡片的 placedResources 上（而非 player.resources）
  const guestPlaced = guest.placedResources ?? {}
  const updatedGuest = {
    ...guest,
    placedResources: {
      ...guestPlaced,
      food: (guestPlaced.food ?? 0) + food,
      wine: (guestPlaced.wine ?? 0) + wine,
      coffee: (guestPlaced.coffee ?? 0) + coffee,
      cake: (guestPlaced.cake ?? 0) + cake,
    },
  }

  const updatedPlayer = {
    ...player,
    resources: { ...player.resources, money: player.resources.money - serveCost },
    kitchen: newKitchen,
    guestWaitingArea: player.guestWaitingArea.map(g =>
      g.id === guestId ? updatedGuest : g
    ),
  }

  const players = state.players.map((p, i) => i === pIdx ? updatedPlayer : p)

  return {
    ...state, players,
    logs: [...state.logs, `${player.name} 从厨房移动了 ${count} 个餐饮到${guest.name}的卡片上${!hasFreeServe ? '（花费1克朗）' : '（免费）'}`],
  }
}

/**
 * 检查玩家是否能从厨房给客人提供食物
 */
export function canMoveKitchenToGuest(player: Player, guest: GuestCard): boolean {
  for (const req of guest.requirements) {
    const kitchenAmount = player.kitchen[req.type] ?? 0
    const resourceAmount = player.resources[req.type] ?? 0
    // 检查厨房 + 当前资源是否足够满足需求
    if (kitchenAmount + resourceAmount < req.amount) return false
  }
  return true
}

// ========================================================
// 4. 房间组奖励 (Room Group Bonuses)
// ========================================================

/**
 * 检查某个组是否已完全入住
 */
export function checkGroupFullyOccupied(player: Player, groupId: number): boolean {
  return isGroupFullyOccupied(player, groupId)
}

/**
 * 获取玩家已完成但尚未领取奖励的组
 */
export function getUnclaimedGroupBonuses(player: Player, completedGroupBonuses: string[]): number[] {
  const completedGroups: number[] = []
  const groups = new Set(player.roomSlots.map(s => s.groupId))
  for (const groupId of groups) {
    const bonusId = `group_${groupId}`
    if (!completedGroupBonuses.includes(bonusId) && checkGroupFullyOccupied(player, groupId)) {
      completedGroups.push(groupId)
    }
  }
  return completedGroups
}

/**
 * 应用组奖励
 */
export function applyGroupBonus(state: GameState, groupId: number): GameState {
  const pIdx = state.currentPlayerIndex
  if (pIdx === -1) return state

  const player = state.players[pIdx]
  const config = GROUP_BONUS_CONFIG[groupId]
  if (!config) return state

  const bonusId = `group_${groupId}`
  if (state.completedGroupBonuses.includes(bonusId)) return state

  let updatedPlayer = { ...player }
  let logMsg = ''

  switch (config.reward) {
    case 'money':
      updatedPlayer = {
        ...updatedPlayer,
        resources: { ...updatedPlayer.resources, money: updatedPlayer.resources.money + config.amount },
      }
      logMsg = `${player.name} 完成组${groupId}(${config.color})奖励: 获得 ${config.amount} 元`
      break
    case 'emperor':
      updatedPlayer = {
        ...updatedPlayer,
        emperorTrack: updatedPlayer.emperorTrack + config.amount,
      }
      logMsg = `${player.name} 完成组${groupId}(${config.color})奖励: 皇帝轨道前进 ${config.amount} 格`
      break
    case 'score':
      updatedPlayer = {
        ...updatedPlayer,
        score: updatedPlayer.score + config.amount,
      }
      logMsg = `${player.name} 完成组${groupId}(${config.color})奖励: 获得 ${config.amount} 分`
      break
  }

  const players = state.players.map((p, i) => i === pIdx ? updatedPlayer : p)

  return {
    ...state,
    players,
    completedGroupBonuses: [...state.completedGroupBonuses, bonusId],
    logs: [...state.logs, logMsg],
  }
}

/**
 * 检查并应用所有组的奖励（在客人入住房间时触发）
 */
export function checkAndApplyAllGroupBonuses(state: GameState): GameState {
  const pIdx = state.currentPlayerIndex
  const player = state.players[pIdx]

  const unclaimedGroups = getUnclaimedGroupBonuses(player, state.completedGroupBonuses)
  let currentState = state

  for (const groupId of unclaimedGroups) {
    currentState = applyGroupBonus(currentState, groupId)
  }

  return currentState
}

/**
 * 终局时计算所有已完成的组奖励（总计分用）
 */
export function calculateEndGameGroupScore(player: Player): number {
  const groups = new Map<number, { total: number; filled: number }>()
  for (const slot of player.roomSlots) {
    const entry = groups.get(slot.groupId) ?? { total: 0, filled: 0 }
    entry.total++
    if (slot.roomId) entry.filled++
    groups.set(slot.groupId, entry)
  }
  let fullGroups = 0
  for (const entry of groups.values()) {
    if (entry.total === entry.filled) fullGroups++
  }
  return fullGroups * 2
}