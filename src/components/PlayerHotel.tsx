import { useGameStore } from '../store/gameStore'
import { HotelBoardGrid } from './HotelBoardGrid'

export function PlayerHotel() {
  const players = useGameStore(s => s.players)
  const currentPlayerIndex = useGameStore(s => s.currentPlayerIndex)

  const player = players[currentPlayerIndex]

  return (
    <div style={{
      background: '#1a1a2e', borderRadius: 12, padding: 16,
      border: '1px solid #2a2a4a',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
      }}>
        <span style={{ color: player.color, fontSize: 20 }}>●</span>
        <span style={{ color: '#e0e0e0', fontWeight: 600, fontSize: 16 }}>
          {player.name} 的酒店
        </span>
        <span style={{ color: '#888', fontSize: 12 }}>
          💰{player.resources.money}元
        </span>
      </div>

      <HotelBoardGrid player={player} />
    </div>
  )
}
