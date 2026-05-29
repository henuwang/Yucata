import { useGameStore } from '../store/gameStore'

export function Lobby() {
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
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
        borderRadius: 20,
        padding: '48px 64px',
        border: '1px solid #2a2a4a',
        textAlign: 'center',
        maxWidth: 500,
      }}>
        <h1 style={{
          fontSize: 36,
          margin: '0 0 8px 0',
          fontWeight: 300,
          letterSpacing: 6,
          color: '#e0e0e0',
        }}>
          奥地利大饭店
        </h1>
        <p style={{ color: '#666', fontSize: 14, marginBottom: 32 }}>
          Grand Austria Hotel
        </p>

        <div style={{
          background: '#1a2744',
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
          border: '1px solid #4a7db5',
        }}>
          <p style={{ color: '#ccc', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
            欢迎来到维也纳最负盛名的酒店！
            <br />
            选择玩家人数开始游戏
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          {[2, 3, 4].map(count => (
            <button
              key={count}
              onClick={() => startGame(count)}
              style={{
                padding: '14px 32px',
                borderRadius: 10,
                border: '1px solid #4a4a6a',
                background: '#2a2a4a',
                color: '#e0e0e0',
                cursor: 'pointer',
                fontSize: 18,
                fontWeight: 600,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#3a3a5a'
                e.currentTarget.style.borderColor = '#6a6a8a'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#2a2a4a'
                e.currentTarget.style.borderColor = '#4a4a6a'
              }}
            >
              {count} 人
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
