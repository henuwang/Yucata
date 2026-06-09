import type { Die, GameState, Player, GuestCard, RoomTile, Resources, StaffCard } from '../types/game'
import { createResources } from '../types/game'
import { guestCards } from '../data/guests'
import { roomTiles } from '../data/rooms'
import { staffCards } from '../data/staff'
import { emperorTiles } from '../data/emperorTiles'
import { createHotelBoard } from '../data/hotelBoard'

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
    isFirstPlayer: false,
    setupRoomCount: 0,
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

  return {
    phase: 'setup_staff',
    currentPlayerIndex: 0,
    players,
    dice: Array.from({ length: diceCount }, (_, i) => ({ id: i, value: 0, kept: false, used: false })),
    availableGuests: sg.slice(0, 5),
    availableRooms: sr,
    availableStaff: ss,
    emperorTiles: selectedEmperorTiles,
    roundNumber: 1,
    maxPlayers: playerCount,
    winner: null,
    logs: ['游戏开始！', '请每位玩家按顺序抽取6张员工卡'],
    gameStarted: true,
    emperorScoringCount: 0,
    setupPlayerIndex: 0,
    pendingPenalty: null,
  }
}

// --- Staff Draft Phase ---

export function drawStaffCardsForPlayer(state: GameState): GameState {
  const deck = state.availableStaff
  const cardsPerPlayer = 6
  const totalNeeded = state.maxPlayers * cardsPerPlayer
  const drawn = deck.slice(0, totalNeeded)
  const remaining = deck.slice(totalNeeded)

  const players = state.players.map((p, i) => ({
    ...p,
    draftHand: drawn.slice(i * cardsPerPlayer, (i + 1) * cardsPerPlayer),
    staffCards: [],
  }))

  return {
    ...state, players, availableStaff: remaining.slice(0, 4),
    setupPlayerIndex: 0,
    logs: [...state.logs, `每位玩家获得6张员工卡，${state.players[0].name}先选择`],
  }
}

export function pickStaffCardForDraft(state: GameState, cardId: string): GameState {
  const pIdx = state.setupPlayerIndex
  const player = state.players[pIdx]
  if (!player) return state

  const cardIdx = player.draftHand.findIndex(c => c.id === cardId)
  if (cardIdx === -1) return state

  const picked = player.draftHand[cardIdx]
  const newDraftHand = player.draftHand.filter((_, i) => i !== cardIdx)
  const newStaffCards = [...player.staffCards, picked]

  const updatedPlayer = { ...player, draftHand: newDraftHand, staffCards: newStaffCards }
  const players = state.players.map((p, i) => i === pIdx ? updatedPlayer : p)

  const allDone = players.every(p => p.staffCards.length >= 6)

  if (allDone) {
    return {
      ...state, players,
      phase: 'setup_guest',
      setupPlayerIndex: (state.maxPlayers - 1),
      logs: [...state.logs, `${player.name} 选择了${picked.name}`, '所有玩家已选完员工卡，开始邀请客人'],
    }
  }

  const nextIdx = (pIdx + 1) % state.maxPlayers
  return {
    ...state, players,
    setupPlayerIndex: nextIdx,
    logs: [...state.logs, `${player.name} 选择了${picked.name}`, `轮到 ${state.players[nextIdx].name} 选择`],
  }
}

// --- Setup Phase ---

function getSetupOrder(playerCount: number, firstPlayer: number): number[] {
  const order: number[] = []
  const lastPlayer = (firstPlayer + playerCount - 1) % playerCount
  for (let i = 0; i < playerCount; i++) {
    order.push((lastPlayer - i + playerCount) % playerCount)
  }
  return order
}

export function pickSetupGuest(state: GameState, guestId: string): GameState {
  const pIdx = state.setupPlayerIndex
  const player = state.players[pIdx]
  if (!player || player.guestWaitingArea.length >= MAX_CAFE_SEATS) return state

  const guestIdx = state.availableGuests.findIndex(g => g.id === guestId)
  if (guestIdx === -1) return state
  const guest = state.availableGuests[guestIdx]

  const newGuests = [...player.guestWaitingArea, guest]
  const players = state.players.map((p, i) =>
    i === pIdx ? { ...p, guestWaitingArea: newGuests } : p
  )

  const remainingGuests = state.availableGuests.filter((_, i) => i !== guestIdx)
  const newGuestFromDeck = guestCards.find(g => !remainingGuests.some(rg => rg.id === g.id) && !state.players.some(p => p.guestWaitingArea.some(gw => gw.id === g.id) || p.guestServedArea.some(gs => gs.id === g.id)))
  const finalGuests = newGuestFromDeck
    ? [...remainingGuests, newGuestFromDeck]
    : remainingGuests

  const setupOrder = getSetupOrder(state.maxPlayers, state.players.findIndex(p => p.isFirstPlayer))
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

export function rollAllDice(count: number): Die[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i, value: Math.floor(Math.random() * 6) + 1, kept: false, used: false,
  }))
}

export function rerollUnkeptDice(dice: Die[]): Die[] {
  return dice.map(d => d.kept ? d : { ...d, value: Math.floor(Math.random() * 6) + 1, used: false })
}

export function toggleKeepDie(dice: Die[], dieId: number): Die[] {
  return dice.map(d => d.id === dieId ? { ...d, kept: !d.kept } : d)
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

export function getNextPlayer(state: GameState): number {
  return (state.currentPlayerIndex + 1) % state.maxPlayers
}

export function getNextRoller(state: GameState): number {
  return (state.players.findIndex(p => p.isFirstPlayer) + 1) % state.maxPlayers
}

// --- One-Time Staff Abilities ---

export function applyOneTimeStaffAbility(state: GameState, staff: StaffCard): GameState {
  const pIdx = state.currentPlayerIndex
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
        ...state,
        players: state.players.map((p, i) =>
          i === pIdx
            ? { ...p, resources: { ...p.resources, coffee: p.resources.coffee + 4 } }
            : p
        ),
        logs: [...state.logs, `${player.name} 触发员工能力: 咖啡+4`],
      }

    case 'get_one_of_each':
      return {
        ...state,
        players: state.players.map((p, i) =>
          i === pIdx
            ? {
                ...p,
                resources: {
                  ...p.resources,
                  food: p.resources.food + 1,
                  cake: p.resources.cake + 1,
                  wine: p.resources.wine + 1,
                  coffee: p.resources.coffee + 1,
                },
              }
            : p
        ),
        logs: [...state.logs, `${player.name} 触发员工能力: 各食物+1`],
      }

    case 'get_4_strudel':
      return {
        ...state,
        players: state.players.map((p, i) =>
          i === pIdx
            ? { ...p, resources: { ...p.resources, food: p.resources.food + 4 } }
            : p
        ),
        logs: [...state.logs, `${player.name} 触发员工能力: 面包+4`],
      }

    case 'get_4_cake':
      return {
        ...state,
        players: state.players.map((p, i) =>
          i === pIdx
            ? { ...p, resources: { ...p.resources, cake: p.resources.cake + 4 } }
            : p
        ),
        logs: [...state.logs, `${player.name} 触发员工能力: 蛋糕+4`],
      }

    case 'get_4_wine':
      return {
        ...state,
        players: state.players.map((p, i) =>
          i === pIdx
            ? { ...p, resources: { ...p.resources, wine: p.resources.wine + 4 } }
            : p
        ),
        logs: [...state.logs, `${player.name} 触发员工能力: 红酒+4`],
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

    case 'complete_guest_from_supply':
      console.log('能力 complete_guest_from_supply 尚未实现')
      return {
        ...state,
        logs: [...state.logs, `${player.name} 触发员工能力: 从供应区完成客人(尚未实现)`],
      }

    default:
      return state
  }
}

// --- Action Area Actions ---

export function performAreaAction1(state: GameState, takeCake: number): GameState {
  const counts = getActionAreaCounts(state.dice)
  const n = counts[1]
  if (n <= 0) return state
  const cake = Math.min(takeCake, n)
  const food = n - cake
  if (cake < 0 || food < 0) return state

  const player = state.players[state.currentPlayerIndex]
  const newRes = { ...player.resources, food: player.resources.food + food, cake: player.resources.cake + cake }
  const players = state.players.map((p, i) => i === state.currentPlayerIndex ? { ...p, resources: newRes } : p)
  const dice = removeOneDieFromArea(state.dice, 1)
  const nextIdx = getNextPlayer(state)

  return {
    ...state, dice, players, currentPlayerIndex: nextIdx,
    logs: [...state.logs, `${player.name} 执行行动区1: 获得食物×${food} 蛋糕×${cake}`],
  }
}

export function performAreaAction2(state: GameState, takeCoffee: number): GameState {
  const counts = getActionAreaCounts(state.dice)
  const n = counts[2]
  if (n <= 0) return state
  const coffee = Math.min(takeCoffee, n)
  const wine = n - coffee
  if (coffee < 0 || wine < 0) return state

  const player = state.players[state.currentPlayerIndex]
  const newRes = { ...player.resources, wine: player.resources.wine + wine, coffee: player.resources.coffee + coffee }
  const players = state.players.map((p, i) => i === state.currentPlayerIndex ? { ...p, resources: newRes } : p)
  const dice = removeOneDieFromArea(state.dice, 2)
  const nextIdx = getNextPlayer(state)

  return {
    ...state, dice, players, currentPlayerIndex: nextIdx,
    logs: [...state.logs, `${player.name} 执行行动区2: 获得红酒×${wine} 咖啡×${coffee}`],
  }
}

export function performAreaAction3(state: GameState, roomId: string, slotRow: number, slotCol: number): GameState {
  const counts = getActionAreaCounts(state.dice)
  if (counts[3] <= 0) return state

  const player = state.players[state.currentPlayerIndex]
  const room = state.availableRooms.find(r => r.id === roomId)
  if (!room || player.builtRooms.some(r => r.id === roomId)) return state

  // Validate against hotel board grid
  const slotIdx = player.roomSlots.findIndex(s => s.row === slotRow && s.col === slotCol)
  if (slotIdx === -1) return state
  const slot = player.roomSlots[slotIdx]
  if (slot.roomId !== null) return state       // slot already occupied
  if (slot.color !== room.color) return state   // color mismatch

  // Must be adjacent to an already occupied slot
  const hasAdjacent = player.roomSlots.some(s =>
    s.roomId &&
    Math.abs(s.row - slotRow) + Math.abs(s.col - slotCol) === 1
  )
  if (!hasAdjacent) return state

  const cost = room.cost.money ?? 0
  if (player.resources.money < cost) return state

  const newSlots = player.roomSlots.map((s, i) =>
    i === slotIdx ? { ...s, roomId: room.id } : s
  )
  const newRes = { ...player.resources, money: player.resources.money - cost }
  const players = state.players.map((p, i) =>
    i === state.currentPlayerIndex ? {
      ...p,
      resources: newRes,
      score: p.score + room.victoryPoints,
      builtRooms: [...p.builtRooms, { ...room, isBuilt: true }],
      roomSlots: newSlots,
    } : p
  )
  const availableRooms = state.availableRooms.filter(r => r.id !== roomId)
  const dice = removeOneDieFromArea(state.dice, 3)
  const nextIdx = getNextPlayer(state)

  return {
    ...state, dice, players, availableRooms, currentPlayerIndex: nextIdx,
    logs: [...state.logs, `${player.name} 执行行动区3: 在(${slotRow},${slotCol})建造${room.name}`],
  }
}

export function performAreaAction4(state: GameState, toEmperor: number): GameState {
  const counts = getActionAreaCounts(state.dice)
  const n = counts[4]
  if (n <= 0) return state
  const emperor = Math.min(toEmperor, n)
  const money = n - emperor
  if (emperor < 0 || money < 0) return state

  const player = state.players[state.currentPlayerIndex]
  const newRes = { ...player.resources, money: player.resources.money + money }
  const players = state.players.map((p, i) =>
    i === state.currentPlayerIndex ? {
      ...p, resources: newRes,
      emperorTrack: p.emperorTrack + emperor,
    } : p
  )
  const dice = removeOneDieFromArea(state.dice, 4)
  const nextIdx = getNextPlayer(state)

  return {
    ...state, dice, players, currentPlayerIndex: nextIdx,
    logs: [...state.logs, `${player.name} 执行行动区4: 皇帝+${emperor} 金钱+${money}`],
  }
}

export function performAreaAction5(state: GameState, staffId: string): GameState {
  const counts = getActionAreaCounts(state.dice)
  const n = counts[5]
  if (n <= 0) return state

  const staff = staffCards.find(s => s.id === staffId)
  const player = state.players[state.currentPlayerIndex]
  if (!staff) return state

  const discount = n
  const finalCost = Math.max(0, staff.cost - discount)
  if (player.resources.money < finalCost) return state

  const newRes = { ...player.resources, money: player.resources.money - finalCost }
  const players = state.players.map((p, i) =>
    i === state.currentPlayerIndex ? {
      ...p, resources: newRes,
      score: p.score + staff.victoryPoints,
      staffCards: [...p.staffCards, staff],
    } : p
  )
  const availableStaff = state.availableStaff.filter(s => s.id !== staffId)
  const dice = removeOneDieFromArea(state.dice, 5)
  const nextIdx = getNextPlayer(state)

  const result: GameState = {
    ...state, dice, players, availableStaff, currentPlayerIndex: nextIdx,
    logs: [...state.logs, `${player.name} 执行行动区5: 雇佣${staff.name}，花费${finalCost}(折扣${discount})`],
  }

  if (staff.timing === 'one_time') {
    return applyOneTimeStaffAbility(result, staff)
  }

  return result
}

export function performAreaAction6(state: GameState, targetArea: number, subAction: string): GameState {
  const counts = getActionAreaCounts(state.dice)
  const n = counts[6]
  if (n <= 0) return state

  const player = state.players[state.currentPlayerIndex]
  if (player.resources.money < 1) return state

  const newRes = { ...player.resources, money: player.resources.money - 1 }
  const playerWithPayment = { ...player, resources: newRes }

  let players: Player[]
  const baseState = { ...state, players: state.players.map((p, i) => i === state.currentPlayerIndex ? playerWithPayment : p) }
  const dice = removeOneDieFromArea(state.dice, 6)
  const nextIdx = getNextPlayer(state)

  if (targetArea === 1 || targetArea === 2) {
    const takeCount = Math.min(parseInt(subAction) || 0, n)
    const isCoffee = targetArea === 2

    const currentPlayer = baseState.players[state.currentPlayerIndex]
    if (isCoffee) {
      const coffee = Math.min(takeCount, n)
      const wine = n - coffee
      const updatedRes = { ...currentPlayer.resources, wine: currentPlayer.resources.wine + wine, coffee: currentPlayer.resources.coffee + coffee }
      players = baseState.players.map((p, i) => i === state.currentPlayerIndex ? { ...p, resources: updatedRes } : p)
    } else {
      const cake = Math.min(takeCount, n)
      const food = n - cake
      const updatedRes = { ...currentPlayer.resources, food: currentPlayer.resources.food + food, cake: currentPlayer.resources.cake + cake }
      players = baseState.players.map((p, i) => i === state.currentPlayerIndex ? { ...p, resources: updatedRes } : p)
    }
  } else if (targetArea === 3) {
    const room = state.availableRooms.find(r => r.id === subAction)
    const currentPlayer = baseState.players[state.currentPlayerIndex]
    if (room && !currentPlayer.builtRooms.some(r => r.id === subAction) && currentPlayer.resources.money >= (room.cost.money ?? 0)) {
      const cost = room.cost.money ?? 0
      const newRes = { ...currentPlayer.resources, money: currentPlayer.resources.money - cost }
      players = baseState.players.map((p, i) =>
        i === state.currentPlayerIndex ? {
          ...p, resources: newRes,
          score: p.score + room.victoryPoints,
          builtRooms: [...p.builtRooms, { ...room, isBuilt: true }],
        } : p
      )
      return {
        ...state, dice, players,
        availableRooms: state.availableRooms.filter(r => r.id !== subAction),
        currentPlayerIndex: nextIdx,
        logs: [...state.logs, `${player.name} 执行行动区6(花1元): 黑市建造${room.name}`],
      }
    }
    players = baseState.players
  } else if (targetArea === 4) {
    const empAdv = parseInt(subAction) || 0
    const moneyGain = n - empAdv
    players = baseState.players.map((p, i) =>
      i === state.currentPlayerIndex
        ? { ...p, emperorTrack: p.emperorTrack + empAdv, resources: { ...p.resources, money: p.resources.money + moneyGain } }
        : p
    )
  } else {
    players = baseState.players
  }

  return {
    ...state, dice, players, currentPlayerIndex: nextIdx,
    logs: [...state.logs, `${player.name} 执行行动区6(花1元): 模拟行动区${targetArea}`],
  }
}

// --- Guest Invite (付费邀请，咖啡厅容量3) ---

export function canInviteGuest(player: Player, guest: GuestCard): boolean {
  if (player.guestWaitingArea.length >= MAX_CAFE_SEATS) return false
  return player.resources.money >= guest.guestCost
}

export function inviteGuest(state: GameState, playerId: string, guestId: string): GameState {
  const guestIdx = state.availableGuests.findIndex(g => g.id === guestId)
  if (guestIdx === -1) return state
  const guest = state.availableGuests[guestIdx]

  const players = state.players.map(p => {
    if (p.id !== playerId || !canInviteGuest(p, guest)) return p
    return {
      ...p,
      resources: { ...p.resources, money: p.resources.money - guest.guestCost },
      guestWaitingArea: [...p.guestWaitingArea, guest],
    }
  })
  const availableGuests = state.availableGuests.filter((_, i) => i !== guestIdx)

  return {
    ...state, players, availableGuests,
    logs: [...state.logs, `${state.players.find(p => p.id === playerId)?.name} 花费${guest.guestCost}元邀请${guest.name}(${players.find(p => p.id === playerId)?.guestWaitingArea.length}/${MAX_CAFE_SEATS})`],
  }
}

// --- Serve Guest ---

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
    ...player, resources: newRes, score: newScore,
    guestWaitingArea: player.guestWaitingArea.filter((_, i) => i !== idx),
    guestServedArea: [...player.guestServedArea, guest],
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
      return { ...player, resources: { ...player.resources, food: player.resources.food + (effect.amount ?? 0) } }
    case 'mixed_food':
      return {
        ...player,
        resources: {
          ...player.resources,
          food: player.resources.food + 1,
          cake: player.resources.cake + 1,
          wine: player.resources.wine + 1,
          coffee: player.resources.coffee + 1,
        },
      }
    case 'score_per_staff':
      return { ...player, score: Math.max(0, player.score + (effect.amount ?? 0) * player.staffCards.length) }
    default:
      return player
  }
}

function getAutoResolvedPenalty(player: Player, penalties: { amount?: number; type: string; description: string }[]): ({ amount?: number; type: string; description: string }) | null {
  for (const penalty of penalties) {
    if (penalty.type === 'money') {
      const needed = Math.abs(penalty.amount ?? 0)
      if (player.resources.money >= needed) return penalty
    }
    if (penalty.type === 'score') {
      return penalty
    }
  }
  return null
}

export function performEmperorScoring(state: GameState): GameState {
  const scoringIndex = state.emperorScoringCount
  if (scoringIndex >= 3) return state

  const regression = EMPEROR_REGRESSION[scoringIndex]
  const newCount = scoringIndex + 1

  let logs: string[] = [...state.logs, `👑 第${newCount}次皇帝计分！ (回退${regression}格)`]
  const pendingPlayerIds: string[] = []
  const players = state.players.map(p => {
    const scoreGain = calculateEmperorScore(p.emperorTrack)
    const newTrack = Math.max(0, p.emperorTrack - regression)
    let updatedPlayer: Player = { ...p, score: p.score + scoreGain, emperorTrack: newTrack }

    const finalPos = p.emperorTrack
    logs.push(`${p.name}: 皇帝轨道${p.emperorTrack}格 → 获得${scoreGain}分 → 回退到${newTrack}格`)

    if (finalPos >= 3) {
      const tile = state.emperorTiles[scoringIndex]
      if (tile) {
        updatedPlayer = applyEmperorEffect(updatedPlayer, tile.reward)
        logs.push(`${p.name} 获得皇帝奖励: ${tile.reward.description}`)
      }
    } else if (finalPos === 0) {
      const tile = state.emperorTiles[scoringIndex]
      if (tile) {
        const autoPenalty = getAutoResolvedPenalty(updatedPlayer, tile.penalties)
        if (autoPenalty) {
          updatedPlayer = applyEmperorEffect(updatedPlayer, autoPenalty)
          logs.push(`${p.name} 受到皇帝惩罚: ${autoPenalty.description}`)
        } else {
          pendingPlayerIds.push(p.id)
        }
      }
    }

    return updatedPlayer
  })

  let pendingPenalty: GameState['pendingPenalty'] = null
  if (pendingPlayerIds.length > 0) {
    const tile = state.emperorTiles[scoringIndex]
    if (tile) {
      pendingPenalty = {
        playerId: pendingPlayerIds[0],
        penalties: tile.penalties,
        remainingPlayerIds: pendingPlayerIds.slice(1),
      }
    }
  }

  return { ...state, players, logs, emperorScoringCount: newCount, pendingPenalty }
}

export function resolvePenalty(state: GameState, penaltyIndex: number): GameState {
  if (!state.pendingPenalty) return state

  const { playerId, penalties, remainingPlayerIds } = state.pendingPenalty
  if (penaltyIndex < 0 || penaltyIndex >= penalties.length) return state

  const penalty = penalties[penaltyIndex]
  const playerIndex = state.players.findIndex(p => p.id === playerId)
  if (playerIndex === -1) return state

  const players = state.players.map((p, i) => {
    if (i === playerIndex) {
      return applyEmperorEffect(p, penalty)
    }
    return p
  })

  let logs = [...state.logs]
  const playerName = state.players[playerIndex].name
  logs.push(`${playerName} 选择惩罚: ${penalty.description}`)

  let newPendingPenalty: GameState['pendingPenalty'] = null
  if (remainingPlayerIds.length > 0) {
    const scoringIndex = state.emperorScoringCount - 1
    const tile = state.emperorTiles[scoringIndex]
    if (tile) {
      newPendingPenalty = {
        playerId: remainingPlayerIds[0],
        penalties: tile.penalties,
        remainingPlayerIds: remainingPlayerIds.slice(1),
      }
    }
  }

  return { ...state, players, logs, pendingPenalty: newPendingPenalty }
}

// --- End-of-Game Staff Ability ---

function countOccupiedRoomsByColor(player: Player, color: string): number {
  return player.roomSlots.filter(s => s.color === color && s.roomId).length
}

function countFilledRows(player: Player): number {
  const rows = new Map<number, { total: number; filled: number }>()
  for (const slot of player.roomSlots) {
    const entry = rows.get(slot.row) ?? { total: 0, filled: 0 }
    entry.total++
    if (slot.roomId) entry.filled++
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
    if (slot.roomId) entry.filled++
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
    if (slot.roomId) entry.filled++
    groups.set(slot.groupId, entry)
  }
  let count = 0
  for (const entry of groups.values()) {
    if (entry.total === entry.filled) count++
  }
  return count
}

function countOccupiedRooms(player: Player): number {
  return player.roomSlots.filter(s => {
    if (!s.roomId) return false
    const builtRoom = player.builtRooms.find(r => r.id === s.roomId)
    return builtRoom && builtRoom.capacity === 0
  }).length
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
      return 0
    case 'end_vp_per_red_room':
      return countOccupiedRoomsByColor(player, 'red') * 3
    case 'end_vp_per_room':
      return player.roomSlots.filter(s => s.roomId).length * 1
    case 'end_copy_staff':
      return 0
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

// --- Final Scoring ---

export function performFinalScoring(state: GameState): GameState {
  const allPlayers = state.players
  const players = state.players.map(p => {
    let finalScore = p.score
    const roomScore = p.builtRooms.reduce((sum, r) => {
      const builtRooms = p.builtRooms.filter(br => br.color === r.color)
      const rowIndex = builtRooms.indexOf(r)
      return sum + (rowIndex >= 0 ? rowIndex + 1 : 0)
    }, 0)
    finalScore += roomScore

    const remainingResources = p.resources.food + p.resources.wine + p.resources.coffee + p.resources.cake + p.resources.money
    finalScore += remainingResources

    const waitingPenalty = p.guestWaitingArea.length * 5
    finalScore -= waitingPenalty

    // End-of-game staff abilities
    const endGameStaffScore = p.staffCards
      .filter(s => s.timing === 'end_of_game')
      .reduce((sum, s) => sum + applyEndGameStaffAbility(p, s, allPlayers), 0)
    finalScore += endGameStaffScore

    return { ...p, score: Math.max(0, finalScore) }
  })

  const sorted = [...players].sort((a, b) => {
    const scoreDiff = b.score - a.score
    if (scoreDiff !== 0) return scoreDiff
    const aRemaining = a.resources.food + a.resources.wine + a.resources.coffee + a.resources.cake + a.resources.money
    const bRemaining = b.resources.food + b.resources.wine + b.resources.coffee + b.resources.cake + b.resources.money
    return bRemaining - aRemaining
  })

  const winner = sorted[0]
  return {
    ...state, players, phase: 'game_end', winner,
    logs: [...state.logs, '📊 最终计分完成!', `🏆 ${winner.name} 以 ${winner.score} 分获胜！`],
  }
}

// --- Round Management ---

export function startNextRound(state: GameState): GameState {
  const nextFirst = getNextRoller(state)
  const players = state.players.map((p, i) => ({ ...p, isFirstPlayer: i === nextFirst }))

  return {
    ...state, phase: 'dice_roll', currentPlayerIndex: nextFirst, players,
    dice: Array.from({ length: state.dice.length }, (_, i) => ({ id: i, value: 0, kept: false, used: false })),
    roundNumber: state.roundNumber + 1,
    logs: [...state.logs, `--- 第${state.roundNumber + 1}轮 ---`],
  }
}
