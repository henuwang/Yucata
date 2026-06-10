import { useGameStore } from '../store/gameStore'
import { getActionAreaCounts } from '../game-logic/engine'

const DIE_COLORS: Record<number, string> = {
  1: '#e74c3c', 2: '#e67e22', 3: '#f1c40f', 4: '#2ecc71', 5: '#3498db', 6: '#9b59b6',
}

const AREA_CONFIG: Record<number, { name: string; desc: string; icon: string; actions: string[] }> = {
  1: {
    name: '食材市场', icon: '🥖', desc: '获取食物',
    actions: ['拿取 🥖面包 ×骰点数', '拿取 🍰蛋糕 ×骰点数(蛋糕≤面包)'],
  },
  2: {
    name: '酒水市场', icon: '🍷', desc: '获取酒水',
    actions: ['拿取 🍷红酒 ×骰点数', '拿取 ☕咖啡 ×骰点数(咖啡≤红酒)'],
  },
  3: {
    name: '建造局', icon: '🏗️', desc: '建造/翻新房间',
    actions: ['建造1间客房(按骰点数选位)', '翻新1间客房(改颜色)'],
  },
  4: {
    name: '皇帝觐见', icon: '👑', desc: '皇帝轨道或金钱',
    actions: ['皇帝轨道前进 骰点数-2 格', '拿取 骰点数+1 元'],
  },
  5: {
    name: '人力市场', icon: '👔', desc: '雇佣员工',
    actions: ['拿取1张员工卡(费用=员工卡编号)'],
  },
  6: {
    name: '黑市', icon: '🕶️', desc: '模拟任意行动',
    actions: ['花费1元, 模拟1个骰子(点数1-6)'],
  },
}

export function ActionAreaVisual() {
  const dice = useGameStore(s => s.dice)
  const phase = useGameStore(s => s.phase)
  const areaCounts = getActionAreaCounts(dice)

  // Show during dice_roll (just rolled) and action (picking dice) phases
  if (phase !== 'dice_roll' && phase !== 'action') return null

  return (
    <div style={{
      background: '#1a1a2e',
      borderRadius: 12,
      padding: 14,
      border: '1px solid #2a2a4a',
      marginTop: 12,
    }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#e0e0e0', fontSize: 14, fontWeight: 600 }}>
        🎲 行动区骰子分布
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[1, 2, 3, 4, 5, 6].map(area => {
          const cfg = AREA_CONFIG[area]
          const count = areaCounts[area]
          const isActive = count > 0

          return (
            <div key={area} style={{
              background: isActive ? '#252545' : '#1a1a2e',
              border: `1px solid ${isActive ? DIE_COLORS[area] : '#2a2a4a'}`,
              borderRadius: 10,
              padding: '10px 12px',
              opacity: isActive ? 1 : 0.35,
              transition: 'all 0.15s',
            }}>
              {/* Header: icon + name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 22, lineHeight: 1 }}>{cfg.icon}</span>
                <div>
                  <div style={{ color: DIE_COLORS[area], fontSize: 14, fontWeight: 700 }}>
                    {cfg.name}
                  </div>
                  <div style={{ color: '#888', fontSize: 10 }}>
                    {cfg.desc}
                  </div>
                </div>
              </div>

              {/* Action descriptions */}
              <div style={{ marginBottom: 6 }}>
                {cfg.actions.map((action, i) => (
                  <div key={i} style={{
                    fontSize: 10, color: '#aaa',
                    padding: '1px 0',
                  }}>
                    • {action}
                  </div>
                ))}
              </div>

              {/* Dice count display */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                {count > 0 ? (
                  Array.from({ length: Math.min(count, 5) }, (_, i) => (
                    <div key={i} style={{
                      width: 20, height: 20, borderRadius: 4,
                      background: DIE_COLORS[area],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, color: '#fff', fontWeight: 'bold',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    }}>
                      {area}
                    </div>
                  ))
                ) : (
                  <span style={{ color: '#444', fontSize: 10 }}>无骰子</span>
                )}
                {count > 5 && (
                  <span style={{ color: '#aaa', fontSize: 10, marginLeft: 2 }}>+{count - 5}</span>
                )}
                <span style={{
                  color: '#ccc', fontSize: 11, fontWeight: 600,
                  marginLeft: 'auto',
                  background: 'rgba(255,255,255,0.08)',
                  padding: '1px 8px', borderRadius: 8,
                }}>
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
