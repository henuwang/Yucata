import { useGameStore } from '../store/gameStore'

export function WinnerScreen() {
  const winner = useGameStore(s => s.winner)
  const startGame = useGameStore(s => s.startGame)

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f0f1a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#e0e0e0',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <h1 style={{ fontSize: 48, marginBottom: 8, fontWeight: 300, letterSpacing: 2 }}>
        游戏结束！
      </h1>
      {winner && (
        <div style={{
          background: 'linear-gradient(135deg, #1a2744, #2a1a44)',
          borderRadius: 16,
          padding: '32px 48px',
          border: '2px solid #f1c40f',
          textAlign: 'center',
          marginBottom: 24,
        }}>
          <div style={{ fontSize: 64, marginBottom: 8 }}>👑</div>
          <h2 style={{ fontSize: 32, margin: '0 0 8px 0', color: '#f1c40f' }}>
            {winner.name}
          </h2>
          <p style={{ fontSize: 24, color: '#e0e0e0', margin: 0 }}>
            最终得分: {winner.score}分
          </p>
          <div style={{ marginTop: 16, color: '#888', fontSize: 14 }}>
            招待客人: {winner.guestServedArea.length} | 建造房间: {winner.builtRooms.length} | 雇佣员工: {winner.staffCards.length}
          </div>
        </div>
      )}
      <button
        onClick={() => startGame(2)}
        style={{
          padding: '12px 32px',
          borderRadius: 8,
          border: '1px solid #4a4a6a',
          background: '#2a2a4a',
          color: '#e0e0e0',
          cursor: 'pointer',
          fontSize: 16,
        }}
      >
        再来一局
      </button>
    </div>
  )
}
