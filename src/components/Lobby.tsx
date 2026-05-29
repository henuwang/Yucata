import { useGameStore } from '../store/gameStore'

export function Lobby() {
  const startGame = useGameStore(s => s.startGame)

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#e0e0e0',
      fontFamily: 'system-ui, sans-serif',
      padding: 20,
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
        borderRadius: 24,
        padding: '48px 64px',
        border: '1px solid #2a2a4a',
        textAlign: 'center',
        maxWidth: 480,
        width: '100%',
      }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🏨</div>
        <h1 style={{
          fontSize: 38,
          margin: '0 0 4px 0',
          fontWeight: 200,
          letterSpacing: 8,
          color: '#e0e0e0',
        }}>
          奥地利大饭店
        </h1>
        <p style={{ color: '#555', fontSize: 13, marginBottom: 36, letterSpacing: 3 }}>
          GRAND AUSTRIA HOTEL
        </p>

        <div style={{
          background: '#1a2744',
          borderRadius: 12,
          padding: 20,
          marginBottom: 28,
          border: '1px solid #4a7db544',
        }}>
          <p style={{ color: '#aaa', fontSize: 13, lineHeight: 1.8, margin: 0 }}>
            欢迎来到维也纳最负盛名的酒店！
            <br />
            掷骰子获取资源，邀请贵族名流入住，
            <br />
            扩建酒店，雇佣员工，赢得最高声望！
          </p>
        </div>

        <div style={{ fontSize: 14, color: '#888', marginBottom: 16 }}>
          选择玩家人数开始游戏
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          {[2, 3, 4].map(count => (
            <button
              key={count}
              onClick={() => startGame(count)}
              style={{
                padding: '14px 36px',
                borderRadius: 12,
                border: '1px solid #4a4a6a',
                background: '#2a2a4a',
                color: '#e0e0e0',
                cursor: 'pointer',
                fontSize: 18,
                fontWeight: 600,
                transition: 'all 0.2s',
                minWidth: 100,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#3a3a5a'
                e.currentTarget.style.borderColor = '#6a6a8a'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#2a2a4a'
                e.currentTarget.style.borderColor = '#4a4a6a'
                e.currentTarget.style.transform = 'translateY(0)'
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
