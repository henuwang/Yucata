import { useGameStore } from '../store/gameStore'
import { getActionAreaCounts } from '../game-logic/engine'

const DIE_COLORS: Record<number, string> = {
  1: '#e74c3c', 2: '#e67e22', 3: '#f1c40f', 4: '#2ecc71', 5: '#3498db', 6: '#9b59b6',
}

const AREA_CONFIG: Record<number, { name: string; desc: string; icon: string }> = {
  1: { name: '食材市场', desc: '食物或蛋糕', icon: '🥖' },
  2: { name: '酒水市场', desc: '红酒或咖啡', icon: '🍷' },
  3: { name: '建造局', desc: '建造房间', icon: '🏗️' },
  4: { name: '皇帝觐见', desc: '皇帝或金钱', icon: '👑' },
  5: { name: '人力市场', desc: '雇佣员工', icon: '👔' },
  6: { name: '黑市', desc: '花1元模拟', icon: '🕶️' },
}

export function ActionAreaVisual() {
  const dice = useGameStore(s => s.dice)
  const phase = useGameStore(s => s.phase)
  const areaCounts = getActionAreaCounts(dice)

  if (phase !== 'dice_roll') return null

  return (
    <div style={{
      background: '#1a1a2e',
      borderRadius: 12,
      padding: 12,
      border: '1px solid #2a2a4a',
      marginTop: 12,
    }}>
      <h3 style={{ margin: '0 0 8px 0', color: '#e0e0e0', fontSize: 13 }}>
        行动区骰子分布
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
        {[1, 2, 3, 4, 5, 6].map(area => {
          const cfg = AREA_CONFIG[area]
          const count = areaCounts[area]
          const isActive = count > 0 && phase === 'dice_roll'

          return (
            <div key={area} style={{
              background: isActive ? '#2a2a4a' : '#1a1a2e',
              border: `1px solid ${isActive ? DIE_COLORS[area] : '#2a2a4a'}`,
              borderRadius: 8,
              padding: '6px 8px',
              opacity: isActive ? 1 : 0.4,
              transition: 'all 0.15s',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                <span style={{ fontSize: 16 }}>{cfg.icon}</span>
                <span style={{ color: DIE_COLORS[area], fontSize: 10, fontWeight: 600 }}>区{area}</span>
              </div>
              <div style={{ color: '#e0e0e0', fontSize: 11, fontWeight: 600 }}>{cfg.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                {/* Die icons representing count */}
                {Array.from({ length: Math.min(count, 5) }, (_, i) => (
                  <div key={i} style={{
                    width: 14, height: 14, borderRadius: 3,
                    background: DIE_COLORS[area],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 7, color: '#fff', fontWeight: 'bold',
                  }}>
                    {area}
                  </div>
                ))}
                {count > 5 && (
                  <span style={{ color: '#888', fontSize: 9 }}>+{count - 5}</span>
                )}
                {count === 0 && (
                  <span style={{ color: '#555', fontSize: 9 }}>--</span>
                )}
                <span style={{ color: '#888', fontSize: 9, marginLeft: 'auto' }}>
                  ×{count}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
