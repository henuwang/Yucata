import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { DIE_RESOURCE_MAP } from '../game-logic/engine'

const DIE_COLORS: Record<number, string> = {
  1: '#e74c3c', 2: '#e67e22', 3: '#f1c40f', 4: '#2ecc71', 5: '#3498db', 6: '#9b59b6',
}

const GUEST_COLORS: Record<string, { bg: string; border: string; label: string }> = {
  blue: { bg: '#1a2744', border: '#4a7db5', label: '贵族' },
  yellow: { bg: '#3a3520', border: '#d4a843', label: '艺术家/政客' },
  red: { bg: '#3a1a1a', border: '#c0392b', label: '市民' },
  green: { bg: '#1a3a1a', border: '#27ae60', label: '旅客' },
}

export function DicePanel() {
  const dice = useGameStore(s => s.dice)
  const phase = useGameStore(s => s.phase)
  const players = useGameStore(s => s.players)
  const currentIdx = useGameStore(s => s.currentPlayerIndex)
  const rollDice = useGameStore(s => s.rollDice)
  const rerollDice = useGameStore(s => s.rerollDice)
  const lockDie = useGameStore(s => s.lockDie)
  const confirmDice = useGameStore(s => s.confirmDice)
  const draftResource = useGameStore(s => s.draftResource)
  const draftGuest = useGameStore(s => s.draftGuest)

  const [selectedDie, setSelectedDie] = useState<number | null>(null)
  const [showGuestPicker, setShowGuestPicker] = useState(false)

  const currentPlayer = players[currentIdx]
  const hasRolled = dice.some(d => d.value > 0)
  const unusedDice = dice.filter(d => !d.used)
  const selectedDieData = selectedDie !== null ? dice[selectedDie] : null
  const resOption = selectedDieData ? DIE_RESOURCE_MAP[selectedDieData.value] : null

  const dieGuestColors: Record<number, string[]> = {
    1: ['blue'], 2: ['yellow'], 3: ['red'], 4: ['green'], 5: ['blue'], 6: ['yellow'],
  }

  const handleDieClick = (id: number) => {
    if (phase === 'dice_roll' && hasRolled) {
      lockDie(id)
      return
    }
    if (phase === 'dice_draft') {
      const die = dice[id]
      if (!die.used && die.value > 0) {
        setSelectedDie(id)
        setShowGuestPicker(false)
      }
    }
  }

  const handleTakeResource = () => {
    if (selectedDie === null) return
    draftResource(selectedDie)
    setSelectedDie(null)
    setShowGuestPicker(false)
  }

  const handleTakeGuest = (guestId: string) => {
    if (selectedDie === null) return
    draftGuest(selectedDie, guestId)
    setSelectedDie(null)
    setShowGuestPicker(false)
  }

  const availableGuests = useGameStore(s => s.availableGuests)
  const matchingGuests = selectedDieData
    ? availableGuests.filter(g => (dieGuestColors[selectedDieData.value] ?? []).includes(g.color))
    : []

  const diceCount = dice.length

  return (
    <div style={{
      background: '#1a1a2e',
      borderRadius: 12,
      padding: 20,
      border: '1px solid #2a2a4a',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h3 style={{ margin: 0, color: '#e0e0e0', fontSize: 18, fontWeight: 600 }}>
            🎲 骰子区 ({diceCount}颗)
          </h3>
          <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
            {phase === 'dice_roll' && `${currentPlayer.name} 掷骰阶段`}
            {phase === 'dice_draft' && `选骰中 - ${currentPlayer.name} 选择一颗骰子`}
            {phase === 'action' && `${currentPlayer.name} 行动阶段`}
          </div>
        </div>
        <div style={{ fontSize: 12, color: '#666' }}>
          第{useGameStore.getState().roundNumber}轮
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {dice.map(die => (
          <div
            key={die.id}
            onClick={() => handleDieClick(die.id)}
            style={{
              width: 48,
              height: 48,
              borderRadius: 10,
              background: die.value ? DIE_COLORS[die.value] : '#2a2a4a',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: (phase === 'dice_roll' && hasRolled) || (phase === 'dice_draft' && !die.used) ? 'pointer' : 'not-allowed',
              opacity: die.used ? 0.2 : 1,
              border: selectedDie === die.id ? '3px solid #f1c40f' : die.kept ? '3px solid #fff' : '3px solid transparent',
              transform: selectedDie === die.id ? 'scale(1.1)' : 'scale(1)',
              transition: 'all 0.15s',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: 18,
              boxShadow: selectedDie === die.id ? '0 0 12px rgba(241,196,15,0.5)' : 'none',
            }}
          >
            {die.value > 0 ? die.value : '?'}
          </div>
        ))}
      </div>

      {phase === 'dice_roll' && (
        <div style={{ display: 'flex', gap: 8 }}>
          {!hasRolled && (
            <ActionBtn onClick={rollDice} label="🎲 掷骰子" />
          )}
          {hasRolled && (
            <>
              <ActionBtn onClick={rerollDice} label="🔄 重掷未锁定" />
              <ActionBtn onClick={confirmDice} label="✅ 确认选骰" primary />
            </>
          )}
        </div>
      )}

      {phase === 'dice_draft' && selectedDieData && !showGuestPicker && (
        <div style={{
          background: '#0f0f1a', borderRadius: 8, padding: 12,
          border: '1px solid #3a3a5a', marginTop: 8,
        }}>
          <div style={{ fontSize: 13, color: '#aaa', marginBottom: 8 }}>
            选择骰子 [{selectedDieData.value}] 的用途：
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <ActionBtn onClick={handleTakeResource} label={`📦 取资源: ${resOption ? `${resOption.type}×${resOption.amount}` : ''}`} primary />
            {matchingGuests.length > 0 && (
              <ActionBtn onClick={() => setShowGuestPicker(true)} label={`👤 选客人 (${matchingGuests.length})`} />
            )}
          </div>
        </div>
      )}

      {phase === 'dice_draft' && showGuestPicker && (
        <div style={{
          background: '#0f0f1a', borderRadius: 8, padding: 12,
          border: '1px solid #3a3a5a', marginTop: 8,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: '#aaa' }}>选择一位客人：</span>
            <button onClick={() => setShowGuestPicker(false)}
              style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 12 }}>
              ← 返回
            </button>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {matchingGuests.map(g => {
              const c = GUEST_COLORS[g.color] ?? GUEST_COLORS.blue
              return (
                <div key={g.id} onClick={() => handleTakeGuest(g.id)} style={{
                  background: c.bg, border: `1px solid ${c.border}`, borderRadius: 6,
                  padding: '6px 10px', cursor: 'pointer', minWidth: 90,
                }}>
                  <div style={{ color: '#e0e0e0', fontWeight: 600, fontSize: 13 }}>{g.name}</div>
                  <div style={{ fontSize: 10, color: '#888' }}>{c.label} | {g.victoryPoints}分</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {phase === 'dice_draft' && !selectedDie && (
        <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
          点击一颗未使用的骰子来选择它 ({unusedDice.length}颗可用)
        </div>
      )}
    </div>
  )
}

function ActionBtn({ onClick, label, primary }: { onClick: () => void; label: string; primary?: boolean }) {
  return (
    <button onClick={onClick} style={{
      padding: '8px 16px', borderRadius: 8,
      border: primary ? '1px solid #4a7db5' : '1px solid #4a4a6a',
      background: primary ? '#1a2744' : '#2a2a4a',
      color: '#e0e0e0', cursor: 'pointer', fontSize: 13,
      transition: 'all 0.15s', whiteSpace: 'nowrap',
    }}>
      {label}
    </button>
  )
}
