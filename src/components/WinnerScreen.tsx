import { useGameStore } from '../store/gameStore'

export function WinnerScreen() {
  const players = useGameStore(s => s.players)
  const startGame = useGameStore(s => s.startGame)
  const roundNumber = useGameStore(s => s.roundNumber)

  const sorted = [...players].sort((a, b) => b.score - a.score)

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f1a, #1a1a2e)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#e0e0e0',
      fontFamily: 'system-ui, sans-serif',
      padding: 20,
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a2744, #2a1a44)',
        borderRadius: 20, padding: '40px 56px',
        border: '2px solid #f1c40f',
        textAlign: 'center',
        maxWidth: 500, width: '100%',
      }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🏆</div>
        <h1 style={{ fontSize: 32, margin: '0 0 4px 0', fontWeight: 300, letterSpacing: 4, color: '#f1c40f' }}>
          游戏结束
        </h1>
        <p style={{ color: '#888', fontSize: 12, margin: '0 0 24px 0' }}>
          经过 {roundNumber} 轮的角逐
        </p>

        <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 20, marginBottom: 24 }}>
          {sorted.map((p, i) => (
            <div key={p.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 0', borderBottom: i < sorted.length - 1 ? '1px solid #2a2a4a' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 24, height: 24, borderRadius: 12,
                  background: i === 0 ? '#f1c40f' : '#2a2a4a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: i === 0 ? '#000' : '#888',
                }}>
                  {i + 1}
                </span>
                <span style={{ color: '#e0e0e0', fontWeight: i === 0 ? 700 : 400 }}>
                  {p.name} {p.isFirstPlayer && '👑'}
                </span>
              </div>
              <span style={{ color: i === 0 ? '#f1c40f' : '#888', fontWeight: 700, fontSize: i === 0 ? 20 : 16 }}>
                {p.score}分
              </span>
            </div>
          ))}
          <div style={{ marginTop: 12, fontSize: 11, color: '#666', textAlign: 'left' }}>
            {sorted.map(p => (
              <div key={`detail-${p.id}`} style={{ marginTop: 2 }}>
                {p.name}: 👑皇{p.emperorTrack} | 客房{p.builtRooms.length} | 员工{p.staffCards.length} | 客人{p.guestServedArea.length} | 💰{p.resources.money}
              </div>
            ))}
          </div>
        </div>

        <button onClick={() => startGame(2)} style={{
          padding: '12px 32px', borderRadius: 8, border: '1px solid #4a7db5',
          background: '#1a2744', color: '#e0e0e0', cursor: 'pointer', fontSize: 15, fontWeight: 600,
        }}>
          🔄 再来一局
        </button>
      </div>
    </div>
  )
}
