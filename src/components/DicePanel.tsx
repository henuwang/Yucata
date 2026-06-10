import { useGameStore } from '../store/gameStore'

const DIE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']
const DIE_COLORS: Record<number, string> = {
  1: '#e74c3c', 2: '#e67e22', 3: '#f1c40f', 4: '#2ecc71', 5: '#3498db', 6: '#9b59b6',
}

export function DicePanel() {
  const phase = useGameStore(s => s.phase)
  const dice = useGameStore(s => s.dice)
  const players = useGameStore(s => s.players)
  const currentIdx = useGameStore(s => s.currentPlayerIndex)
  const areaDice = useGameStore(s => s.areaDice)
  const trashDiceCount = useGameStore(s => s.trashDiceCount)
  const rollDice = useGameStore(s => s.rollDice)

  const currentPlayer = players[currentIdx]
  const hasRolled = dice.some(d => d.value > 0)

  // Only show in dice_roll or action phase
  if (phase !== 'dice_roll' && phase !== 'action') return null

  if (phase === 'dice_roll') {
    return (
      <div style={{
        background: '#1a1a2e', borderRadius: 12, padding: 20, border: '1px solid #2a2a4a',
        textAlign: 'center',
      }}>
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ margin: 0, color: '#e0e0e0', fontSize: 18, fontWeight: 600 }}>
            🎲 骰子区 ({dice.length}颗)
          </h3>
          <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
            {currentPlayer?.name} 请掷骰
          </div>
        </div>

        {hasRolled ? (
          <div>
            <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
              {dice.map(die => (
                <div key={die.id} style={{
                  width: 40, height: 40, borderRadius: 8,
                  background: '#2a2a4a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 'bold', fontSize: 16,
                  border: '1px solid #4a4a6a',
                }}>
                  {die.value > 0 ? die.value : '?'}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              {[1, 2, 3, 4, 5, 6].map(area => (
                <div key={area} style={{
                  background: '#2a2a4a',
                  border: '1px solid #4a4a6a',
                  borderRadius: 6, padding: '4px 10px',
                  fontSize: 12, color: '#ccc',
                }}>
                  区{area}: <span style={{ color: '#f1c40f', fontWeight: 600 }}>{areaDice[area]}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: '#666' }}>
              骰子已自动分入行动区
            </div>
          </div>
        ) : (
          <div>
            <button onClick={rollDice} style={{
              padding: '12px 36px', borderRadius: 10,
              border: '1px solid #4a7db5',
              background: 'linear-gradient(135deg, #1a2744, #2a3a5a)',
              color: '#e0e0e0', cursor: 'pointer', fontSize: 18,
              fontWeight: 600, transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #2a3a5a, #3a4a6a)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #1a2744, #2a3a5a)' }}
            >
              🎲 掷骰子
            </button>
          </div>
        )}
      </div>
    )
  }

  // In action phase, show dice distribution summary
  if (phase === 'action') {
    return (
      <div style={{
        background: '#1a1a2e', borderRadius: 12, padding: 16, border: '1px solid #2a2a4a',
      }}>
        <div style={{ marginBottom: 10 }}>
          <h3 style={{ margin: 0, color: '#e0e0e0', fontSize: 15, fontWeight: 600, textAlign: 'center' }}>
            🎲 骰子分布
          </h3>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'flex-end' }}>
          {[1, 2, 3, 4, 5, 6].map(area => {
            const count = areaDice[area] ?? 0
            return (
              <div key={area} style={{
                background: count > 0 ? '#2a3a2a' : '#1a1a2e',
                border: `1px solid ${count > 0 ? '#2ecc71' : '#2a2a4a'}`,
                borderRadius: 8, padding: '6px 12px',
                fontSize: 11, color: '#ccc', textAlign: 'center',
                opacity: count > 0 ? 1 : 0.4,
                minWidth: 40,
              }}>
                <div style={{ fontSize: 20, color: DIE_COLORS[area], lineHeight: 1 }}>
                  {DIE_FACES[area - 1]}
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, color: count > 0 ? '#f1c40f' : '#555', marginTop: 2 }}>
                  {count}
                </div>
              </div>
            )
          })}
        </div>
        {trashDiceCount > 0 && (
          <div style={{ fontSize: 11, color: '#888' }}>
            🗑️ 垃圾桶: {trashDiceCount}颗骰子
          </div>
        )}
      </div>
    )
  }

  return null
}
