import { useGameStore } from '../store/gameStore'

const DIE_COLORS: Record<number, string> = {
  1: '#e74c3c',
  2: '#e67e22',
  3: '#f1c40f',
  4: '#2ecc71',
  5: '#3498db',
  6: '#9b59b6',
}

const DIE_LABELS: Record<number, string> = {
  1: '食物',
  2: '红酒',
  3: '咖啡',
  4: '蛋糕',
  5: '2元',
  6: '2元',
}

export function DiceArea() {
  const dice = useGameStore(s => s.dice)
  const phase = useGameStore(s => s.phase)
  const currentPlayer = useGameStore(s => s.players[s.currentPlayerIndex])
  const rollDice = useGameStore(s => s.rollDice)
  const rerollDice = useGameStore(s => s.rerollDice)
  const lockDie = useGameStore(s => s.lockDie)
  const useDieForResource = useGameStore(s => s.useDieForResource)
  const nextPhase = useGameStore(s => s.nextPhase)
  const endTurn = useGameStore(s => s.endTurn)

  const hasRolled = dice.some(d => d.value > 0)
  const unusedDice = dice.filter(d => !d.used)
  const allUsed = dice.every(d => d.used)

  return (
    <div style={{
      background: '#1a1a2e',
      borderRadius: 12,
      padding: 16,
      border: '1px solid #2a2a4a',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0, color: '#e0e0e0', fontSize: 16 }}>
          骰子区 - {currentPlayer.name}的回合
        </h3>
        {phase === 'action' && (
          <button onClick={endTurn} style={buttonStyle}>
            结束回合 →
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {dice.map(die => (
          <div
            key={die.id}
            onClick={() => {
              if (phase === 'dice_roll' && hasRolled) lockDie(die.id)
              if (phase === 'dice_draft' && !die.used && hasRolled) useDieForResource(die.id)
            }}
            style={{
              width: 52,
              height: 52,
              borderRadius: 10,
              background: die.value ? DIE_COLORS[die.value] : '#2a2a4a',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: die.used ? 'not-allowed' : 'pointer',
              opacity: die.used ? 0.3 : 1,
              border: die.kept ? '3px solid #fff' : '3px solid transparent',
              transition: 'all 0.2s',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: 20,
            }}
          >
            {die.value > 0 ? die.value : '?'}
            {die.value > 0 && (
              <span style={{ fontSize: 9, opacity: 0.8 }}>{DIE_LABELS[die.value]}</span>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {!hasRolled && phase === 'dice_roll' && (
          <button onClick={rollDice} style={buttonStyle}>
            掷骰子
          </button>
        )}
        {hasRolled && phase === 'dice_roll' && (
          <>
            <button onClick={rerollDice} style={buttonStyle}>
              重掷未锁定骰子
            </button>
            <button onClick={nextPhase} style={buttonStyle}>
              进入选择阶段
            </button>
          </>
        )}
        {phase === 'dice_draft' && hasRolled && (
          <span style={{ color: '#888', fontSize: 13 }}>
            点击骰子获取资源 | {unusedDice.length}颗骰子可用
          </span>
        )}
        {allUsed && phase !== 'action' && (
          <span style={{ color: '#2ecc71', fontSize: 13 }}>所有骰子已使用</span>
        )}
      </div>
    </div>
  )
}

const buttonStyle: React.CSSProperties = {
  padding: '8px 16px',
  borderRadius: 8,
  border: '1px solid #4a4a6a',
  background: '#2a2a4a',
  color: '#e0e0e0',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 500,
}
