export type GuestColor = 'blue' | 'grey' | 'yellow' | 'red' | 'green'

export type ResourceType = 'food' | 'wine' | 'coffee' | 'cake' | 'money'

export type RoomColor = 'blue' | 'grey' | 'yellow' | 'red' | 'green'

export type StaffAbility = 'extra_resource' | 'discount' | 'extra_vp' | 'dice_reroll' | 'guest_discount'

export type GamePhase = 'dice_roll' | 'dice_draft' | 'action' | 'game_end'

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

export interface GameState {
  phase: GamePhase
  currentPlayerIndex: number
  players: Player[]
  dice: Die[]
  availableGuests: GuestCard[]
  availableRooms: RoomTile[]
  availableStaff: StaffCard[]
  roundNumber: number
  maxPlayers: number
  winner: Player | null
  logs: string[]
  gameStarted: boolean
}
