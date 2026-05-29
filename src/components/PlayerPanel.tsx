import { useGameStore } from '../store/gameStore'

export function PlayerPanel() {
  const players = useGameStore(s => s.players)
  const currentPlayerIndex = useGameStore(s => s.currentPlayerIndex)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {players.map((player, index) => {
        const isActive = index === currentPlayerIndex
        return (
          <div
            key={player.id}
            style={{
              background: isActive ? '#1a2744' : '#1a1a2e',
              borderRadius: 12,
              padding: 14,
              border: isActive ? `2px solid ${player.color}` : '1px solid #2a2a4a',
              transition: 'all 0.3s',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  background: player.color,
                }} />
                <span style={{ color: '#e0e0e0', fontWeight: 600 }}>
                  {player.name}
                  {player.isFirstPlayer && ' 👑'}
                </span>
              </div>
              <span style={{ color: '#f1c40f', fontWeight: 600, fontSize: 18 }}>
                {player.score}分
              </span>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
              <ResourceBadge label="🍞" value={player.resources.food} />
              <ResourceBadge label="🍷" value={player.resources.wine} />
              <ResourceBadge label="☕" value={player.resources.coffee} />
              <ResourceBadge label="🍰" value={player.resources.cake} />
              <ResourceBadge label="💰" value={player.resources.money} />
            </div>

            <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#888' }}>
              <span>客人: {player.guestWaitingArea.length}</span>
              <span>已招待: {player.guestServedArea.length}</span>
              <span>房间: {player.builtRooms.length}</span>
              <span>员工: {player.staffCards.length}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ResourceBadge({ label, value }: { label: string; value: number }) {
  return (
    <span style={{
      background: 'rgba(255,255,255,0.08)',
      borderRadius: 6,
      padding: '3px 8px',
      fontSize: 13,
      color: '#e0e0e0',
    }}>
      {label} {value}
    </span>
  )
}
