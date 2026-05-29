export type GuestColor = 'blue' | 'grey' | 'yellow' | 'red' | 'green'

export type ResourceType = 'food' | 'wine' | 'coffee' | 'cake' | 'money'

export type RoomColor = 'blue' | 'grey' | 'yellow' | 'red' | 'green'

export type StaffAbility = 'extra_resource' | 'discount' | 'extra_vp' | 'dice_reroll' | 'guest_discount'

export type GamePhase = 'dice_roll' | 'dice_draft' | 'action' | 'cleanup' | 'game_end'

export interface Resources {
  food: number
  wine: number
  coffee: number
  cake: number
  money: number
}

export function createResources(initial?: Partial<Resources>): Resources {
  return {
    food: 0,
    wine: 0,
    coffee: 0,
    cake: 0,
    money: 0,
    ...initial,
  }
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
  isSpecial?: boolean
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
  ability: StaffAbility
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
  guestWaitingArea: GuestCard[]
  guestServedArea: GuestCard[]
  builtRooms: RoomTile[]
  staffCards: StaffCard[]
  isFirstPlayer: boolean
}

export interface DiceAction {
  dieId: number
  dieValue: number
  actionType: 'resource' | 'guest' | 'room'
  targetId?: string
}

export interface GameState {
  phase: GamePhase
  currentPlayerIndex: number
  players: Player[]
  dice: Die[]
  availableGuests: GuestCard[]
  availableRooms: RoomTile[]
  availableStaff: StaffCard[]
  turnNumber: number
  roundNumber: number
  maxPlayers: number
  winner: Player | null
  logs: string[]
}

export interface GameAction {
  type: 'roll_dice' | 'keep_dice' | 'take_resource' | 'take_guest' | 'serve_guest' | 'build_room' | 'hire_staff' | 'end_turn'
  payload?: unknown
}
