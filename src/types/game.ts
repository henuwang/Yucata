export type GuestColor = 'blue' | 'yellow' | 'red' | 'green'

export type ResourceType = 'food' | 'wine' | 'coffee' | 'cake' | 'money'

export type RoomColor = 'blue' | 'yellow' | 'red'

export type StaffTiming = 'one_time' | 'once_per_round' | 'permanent' | 'end_of_game'

export type StaffAbility =
  | 'get_resources'
  | 'emperor_advance_3'
  | 'free_guest'
  | 'free_room_blue'
  | 'free_room_red'
  | 'free_room_yellow'
  | 'die_1_2_build_room'
  | 'serve_4dish_plus_4vp'
  | 'green_guest_plus_2vp'
  | 'die_5_discount_2'
  | 'emperor_bonus_5vp'
  | 'die_3_4_plus_2vp'
  | 'die_5_emperor_2'
  | 'guest_to_room_plus_1kr'
  | 'die_3_plus_5vp'
  | 'die_6_free_plus_reward'
  | 'yellow_guest_plus_1kr'
  | 'free_serve_guest'
  | 'die_3_hire_staff'
  | 'red_guest_plus_2kr'
  | 'die_1_2_extra_resource'
  | 'die_4_emperor_and_money'
  | 'blue_guest_emperor_1'
  | 'no_emperor_penalty'
  | 'die_4_plus_4vp'
  | 'end_vp_per_blue_room'
  | 'end_vp_per_staff'
  | 'end_vp_per_color_set'
  | 'end_vp_per_yellow_room'
  | 'end_vp_per_floor'
  | 'end_vp_per_column'
  | 'end_vp_per_politics'
  | 'end_vp_per_red_room'
  | 'end_vp_per_room'
  | 'end_copy_staff'
  | 'end_double_emperor_vp'
  | 'end_vp_per_group'
  | 'end_vp_per_occupied_room'
  | 'get_4_strudel'
  | 'get_4_cake'
  | 'get_4_wine'
  | 'get_4_coffee'
  | 'get_one_of_each'
  | 'turn_2_rooms_occupied'
  | 'complete_guest_from_supply'
  | 'once_wine'
  | 'once_strudel'
  | 'once_cake'
  | 'once_coffee'

export type GamePhase = 'setup_staff' | 'setup_guest' | 'setup_room' | 'dice_roll' | 'action' | 'game_end'

export interface Resources {
  food: number
  wine: number
  coffee: number
  cake: number
  money: number
}

export function createResources(initial?: Partial<Resources>): Resources {
  return { food: 0, wine: 0, coffee: 0, cake: 0, money: 0, ...initial }
}

export interface Die {
  id: number
  value: number
  used: boolean
}

export interface GuestRequirement {
  type: ResourceType
  amount: number
}

export interface GuestCard {
  id: string
  name: string
  color: GuestColor
  requirements: GuestRequirement[]
  victoryPoints: number
  bonusResource?: ResourceType
  bonusAmount?: number
  guestCost: number
  /** 已放在该客人卡上的资源（用于满足需求） */
  placedResources?: Partial<Resources>
}

export interface HotelBoardSlot {
  row: number
  col: number
  cost: number
  color: RoomColor
  groupId: number
  roomId: string | null
}

export interface RoomTile {
  id: string
  name: string
  color: RoomColor
  cost: Partial<Resources>
  victoryPoints: number
  capacity: number
  isBuilt: boolean
}

export interface StaffCard {
  id: string
  name: string
  nameEn: string
  ability: StaffAbility
  timing: StaffTiming
  description: string
  cost: number
  victoryPoints: number
}

export interface EmperorEffect {
  type: 'money' | 'score' | 'food' | 'mixed_food' | 'staff_draw_play' | 'free_room' | 'free_room_built' | 'staff_draw_free' | 'score_per_staff' | 'free_staff' | 'remove_guest' | 'remove_built_room' | 'lose_staff' | 'lose_kitchen' | 'advance_emperor'
  amount?: number
  description: string
}

export interface EmperorTile {
  id: string
  group: 'A' | 'B' | 'C'
  reward: EmperorEffect
  penalties: EmperorEffect[]
}

// --- Politics Card Types ---

export type PoliticsCondition =
  | 'money_20'
  | 'emperor_10'
  | 'staff_6'
  | 'room_12'
  | 'row_2_full'
  | 'col_2_full'
  | 'group_6_full'
  | 'color_all_full'
  | 'color_3_each'
  | 'red_4_yellow_3'
  | 'yellow_4_blue_3'
  | 'blue_4_red_3'

export interface PoliticsCard {
  id: string
  name: string
  group: 'A' | 'B' | 'C'
  condition: PoliticsCondition
  victoryPoints: number
  description: string
}

export interface PoliticsMarker {
  playerId: string
  cardId: string
}

// --- Turn Order Types ---

export type ExtraAction =
  | 'add_die'
  | 'move_kitchen'
  | 'place_politics'
  | 'use_staff_ability'
  | 'move_guest'

export interface TurnOrderTile {
  id: string
  number: number
  extraActions: ExtraAction[]
  nameCn: string
}

export interface PlayerExtraActionState {
  addDieUsedThisTurn: boolean
  staffAbilityUsedThisTurn: boolean
}

// --- Group Bonus Types ---

export interface GroupBonus {
  groupId: number
  roomColor: RoomColor
  size: number
  reward: EmperorEffect
}

// --- Player ---

export interface Player {
  id: string
  name: string
  color: string
  resources: Resources
  score: number
  emperorTrack: number
  guestWaitingArea: GuestCard[]
  guestServedArea: GuestCard[]
  builtRooms: RoomTile[]
  roomSlots: HotelBoardSlot[]
  staffCards: StaffCard[]
  /** 设置阶段轮选用的手牌，还未选完的牌 */
  draftHand: StaffCard[]
  /** 设置阶段从右手玩家传来的牌 */
  passingHand: StaffCard[]
  isFirstPlayer: boolean
  setupRoomCount: number
  kitchen: Resources
  turnOrderTileId: string | null
  politicsMarkers: PoliticsMarker[]
  extraActionState: PlayerExtraActionState
  /** 顺位板上已被遮盖的槽位数（0/1/2），每次行动或跳过时遮盖1个槽位 */
  coveredSlots: number
  /** 当前重掷周期中是否已跳过（跳过不遮盖槽位，仅标记本轮不再行动） */
  hasPassedInCycle: boolean
}

export function createPlayerExtraActionState(): PlayerExtraActionState {
  return { addDieUsedThisTurn: false, staffAbilityUsedThisTurn: false }
}

// --- GameState ---

export interface GameState {
  phase: GamePhase
  currentPlayerIndex: number
  players: Player[]
  dice: Die[]
  /** 每个行动区（1-6）当前的骰子数量 */
  areaDice: Record<number, number>
  availableGuests: GuestCard[]
  availableRooms: RoomTile[]
  availableStaff: StaffCard[]
  emperorTiles: EmperorTile[]
  politicsCards: PoliticsCard[]
  turnOrderTiles: TurnOrderTile[]
  roundNumber: number
  maxPlayers: number
  winner: Player | null
  logs: string[]
  gameStarted: boolean
  emperorScoringCount: number
  setupPlayerIndex: number
  /** 员工卡轮选方向：+1 = 顺时针（左手边） */
  setupPassingDirection: number
  /** 当前轮选轮次（0-5） */
  setupStaffRound: number
  pendingPenalty: { playerId: string; penalties: EmperorEffect[]; remainingPlayerIds: string[] } | null
  groupBonuses: GroupBonus[]
  completedGroupBonuses: string[]
  /** 垃圾桶中的骰子数量 */
  trashDiceCount: number
  /** 待分配的资源（来自行动区1/2/6，玩家需要分配到厨房或客人卡） */
  pendingAllocation: Partial<Resources> | null
  /** 额外行动-员工能力：待选择的员工卡 ID 列表（前端UI显示让用户选1张） */
  pendingStaffSelection: string[] | null
}

export function isGroupFullyOccupied(player: Player, groupId: number): boolean {
  const groupSlots = player.roomSlots.filter(s => s.groupId === groupId)
  return groupSlots.length > 0 && groupSlots.every(s => s.roomId !== null)
}
