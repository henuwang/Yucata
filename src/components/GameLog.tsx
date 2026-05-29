import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/gameStore'

export function GameLog() {
  const logs = useGameStore(s => s.logs)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  return (
    <div style={{
      background: '#1a1a2e',
      borderRadius: 12,
      padding: 12,
      border: '1px solid #2a2a4a',
      maxHeight: 150,
      overflowY: 'auto',
    }}>
      <h3 style={{ margin: '0 0 6px 0', color: '#e0e0e0', fontSize: 13 }}>📋 日志</h3>
      <div style={{ fontSize: 11, color: '#888', lineHeight: 1.6 }}>
        {logs.slice(-30).map((log, i) => (
          <div key={i}>{log}</div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
