import { useGameStore } from '../store/gameStore'

const ROOM_COLORS: Record<string, { bg: string; border: string }> = {
  blue: { bg: '#1a2744', border: '#4a7db5' },
  yellow: { bg: '#3a3520', border: '#d4a843' },
  red: { bg: '#3a1a1a', border: '#c0392b' },
}

export function PlayerHotel() {
  const player = useGameStore(s => s.players[s.currentPlayerIndex])

  return (
    <div style={{
      background: '#1a1a2e', borderRadius: 12, padding: 16,
      border: '1px solid #2a2a4a',
    }}>
      <h3 style={{ margin: '0 0 12px 0', color: '#e0e0e0', fontSize: 15 }}>
        🏨 {player.name} 的酒店
      </h3>

      {player.builtRooms.length === 0 ? (
        <div style={{ color: '#666', fontSize: 12, textAlign: 'center', padding: 20 }}>
          还没有建造任何房间
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {player.builtRooms.map(r => {
            const c = ROOM_COLORS[r.color] ?? ROOM_COLORS.red
            return (
              <div key={r.id} style={{
                background: c.bg, border: `1px solid ${c.border}`, borderRadius: 6,
                padding: '4px 8px', minWidth: 70, textAlign: 'center',
                opacity: r.capacity > 0 ? 1 : 0.5,
              }}>
                <div style={{ color: '#e0e0e0', fontSize: 11, fontWeight: 600 }}>{r.name}</div>
                <div style={{ color: '#f1c40f', fontSize: 10 }}>{r.victoryPoints}分</div>
                <div style={{ color: r.capacity > 0 ? '#2ecc71' : '#e74c3c', fontSize: 9 }}>
                  空房: {r.capacity}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {player.guestServedArea.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>
            已入住的客人 ({player.guestServedArea.length})
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {player.guestServedArea.map((g, i) => (
              <span key={i} style={{
                background: '#2a2a4a', borderRadius: 4, padding: '2px 6px', fontSize: 10, color: '#ccc',
              }}>
                {g.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
