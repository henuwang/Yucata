import { useGameStore } from '../store/gameStore'

export function GameLog() {
  const logs = useGameStore(s => s.logs)

  return (
    <div style={{
      background: '#1a1a2e',
      borderRadius: 12,
      padding: 16,
      border: '1px solid #2a2a4a',
      maxHeight: 200,
      overflowY: 'auto',
    }}>
      <h3 style={{ margin: '0 0 8px 0', color: '#e0e0e0', fontSize: 14 }}>游戏日志</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {logs.slice(-20).map((log, i) => (
          <div key={i} style={{ fontSize: 11, color: '#888', lineHeight: 1.4 }}>
            {log}
          </div>
        ))}
      </div>
    </div>
  )
}
