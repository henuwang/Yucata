import { useGameStore } from '../store/gameStore'
import type { RoomTile } from '../types/game'

const COLOR_MAP: Record<string, { bg: string; border: string }> = {
  blue: { bg: '#1a2744', border: '#4a7db5' },
  grey: { bg: '#2a2a2a', border: '#888' },
  yellow: { bg: '#3a3520', border: '#d4a843' },
  red: { bg: '#3a1a1a', border: '#c0392b' },
  green: { bg: '#1a3a1a', border: '#27ae60' },
}

function RoomCard({ room, onClick, canAfford }: { room: RoomTile; onClick?: () => void; canAfford: boolean }) {
  const colors = COLOR_MAP[room.color] ?? COLOR_MAP.grey
  return (
    <div
      onClick={canAfford ? onClick : undefined}
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: 8,
        padding: 10,
        minWidth: 130,
        cursor: canAfford ? 'pointer' : 'not-allowed',
        opacity: canAfford ? 1 : 0.4,
        transition: 'all 0.2s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ color: '#e0e0e0', fontWeight: 600, fontSize: 13 }}>{room.name}</span>
        <span style={{ color: '#f1c40f', fontSize: 12 }}>{room.victoryPoints}分</span>
      </div>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {Object.entries(room.cost).map(([res, amount]) => (
          <span key={res} style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 4,
            padding: '2px 6px',
            fontSize: 11,
            color: '#ccc',
          }}>
            {res}×{amount}
          </span>
        ))}
      </div>
      <div style={{ fontSize: 10, color: '#888', marginTop: 4 }}>
        容量: {room.capacity}
      </div>
    </div>
  )
}

export function HotelBoard() {
  const availableRooms = useGameStore(s => s.availableRooms)
  const currentPlayer = useGameStore(s => s.players[s.currentPlayerIndex])
  const phase = useGameStore(s => s.phase)
  const constructRoom = useGameStore(s => s.constructRoom)

  return (
    <div style={{
      background: '#1a1a2e',
      borderRadius: 12,
      padding: 16,
      border: '1px solid #2a2a4a',
    }}>
      <h3 style={{ margin: '0 0 12px 0', color: '#e0e0e0', fontSize: 16 }}>酒店 - 可建造房间</h3>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {availableRooms.length === 0 && (
          <span style={{ color: '#888', fontSize: 13 }}>所有房间已建造完毕</span>
        )}
        {availableRooms.map(room => {
          const affordable = currentPlayer.resources.money >= (room.cost.money ?? 0) &&
            (room.cost.food ?? 0) <= currentPlayer.resources.food &&
            (room.cost.wine ?? 0) <= currentPlayer.resources.wine &&
            (room.cost.coffee ?? 0) <= currentPlayer.resources.coffee &&
            (room.cost.cake ?? 0) <= currentPlayer.resources.cake
          return (
            <RoomCard
              key={room.id}
              room={room}
              canAfford={phase === 'action' && affordable}
              onClick={() => constructRoom(room.id)}
            />
          )
        })}
      </div>
    </div>
  )
}
