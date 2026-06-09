import { useGameStore } from '../store/gameStore'

export function PenaltyDialog() {
  const pendingPenalty = useGameStore(s => s.pendingPenalty)
  const players = useGameStore(s => s.players)
  const resolvePenalty = useGameStore(s => s.resolvePenalty)

  if (!pendingPenalty) return null

  const player = players.find(p => p.id === pendingPenalty.playerId)
  if (!player) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: '#1a1a2e',
        border: '1px solid #4a7db5',
        borderRadius: 16,
        padding: 32,
        maxWidth: 420,
        width: '90%',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}>
        <h2 style={{
          color: '#e0e0e0',
          fontSize: 20,
          margin: '0 0 8px 0',
          textAlign: 'center',
          letterSpacing: 2,
        }}>
          👑 皇帝惩罚
        </h2>
        <p style={{
          color: '#888',
          fontSize: 13,
          textAlign: 'center',
          margin: '0 0 20px 0',
        }}>
          {player.name}，请选择一种惩罚方式
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {pendingPenalty.penalties.map((penalty, index) => (
            <button
              key={index}
              onClick={() => resolvePenalty(index)}
              style={{
                background: '#2a2a4a',
                border: '1px solid #e74c3c',
                borderRadius: 10,
                padding: '14px 20px',
                cursor: 'pointer',
                color: '#e0e0e0',
                fontSize: 14,
                textAlign: 'left',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#3a3a5a'
                e.currentTarget.style.borderColor = '#ff6b6b'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#2a2a4a'
                e.currentTarget.style.borderColor = '#e74c3c'
              }}
            >
              <div style={{ color: '#e74c3c', fontWeight: 600, marginBottom: 4 }}>
                ⚠️ 惩罚 {index + 1}
              </div>
              <div style={{ color: '#aaa', fontSize: 12 }}>
                {penalty.description}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
