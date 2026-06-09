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

export type GamePhase = 'setup_staff' | 'setup_guest' | 'setup_room' | 'dice_roll' | 'dice_draft' | 'action' | 'game_end'

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
  kept: boolean
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
  draftHand: StaffCard[]
  isFirstPlayer: boolean
  setupRoomCount: number
}

export interface EmperorEffect {
  type: 'money' | 'score' | 'food' | 'mixed_food' | 'staff_draw_play' | 'free_room' | 'free_room_built' | 'staff_draw_free' | 'score_per_staff' | 'free_staff' | 'remove_guest' | 'remove_built_room' | 'lose_staff' | 'lose_kitchen'
  amount?: number
  description: string
}

export interface EmperorTile {
  id: string
  group: 'A' | 'B' | 'C'
  reward: EmperorEffect
  penalties: EmperorEffect[]
}

export interface GameState {
  phase: GamePhase
  currentPlayerIndex: number
  players: Player[]
  dice: Die[]
  availableGuests: GuestCard[]
  availableRooms: RoomTile[]
  availableStaff: StaffCard[]
  emperorTiles: EmperorTile[]
  roundNumber: number
  maxPlayers: number
  winner: Player | null
  logs: string[]
  gameStarted: boolean
  emperorScoringCount: number
  setupPlayerIndex: number
  pendingPenalty: { playerId: string; penalties: EmperorEffect[]; remainingPlayerIds: string[] } | null
}
