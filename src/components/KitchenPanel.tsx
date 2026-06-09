import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import type { ResourceType } from '../types/game'

const RESOURCE_ICONS: Record<ResourceType, string> = {
  food: '🥖',
  wine: '🍷',
  coffee: '☕',
  cake: '🍰',
  money: '💰',
}

const RESOURCE_LABELS: Record<ResourceType, string> = {
  food: '面包',
  wine: '红酒',
  coffee: '咖啡',
  cake: '蛋糕',
  money: '金钱',
}

const RESOURCE_COLORS: Record<ResourceType, string> = {
  food: '#e67e22',
  wine: '#9b59b6',
  coffee: '#8B4513',
  cake: '#f39c12',
  money: '#f1c40f',
}

export function KitchenPanel() {
  const players = useGameStore(s => s.players)
  const currentIdx = useGameStore(s => s.currentPlayerIndex)
  const phase = useGameStore(s => s.phase)
  const player = players[currentIdx]

  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null)
  const [transferCount, setTransferCount] = useState(0)

  const kitchen = player.kitchen || { food: 0, wine: 0, coffee: 0, cake: 0, money: 0 }
  const waitingGuests = player.guestWaitingArea
  const isActionPhase = phase === 'action'

  const resourceTypes: ResourceType[] = ['food', 'wine', 'coffee', 'cake']
  const totalKitchen = resourceTypes.reduce((sum, r) => sum + (kitchen[r] || 0), 0)

  const selectedGuest = selectedGuestId
    ? waitingGuests.find(g => g.id === selectedGuestId)
    : null

  const handleTransfer = () => {
    if (!selectedGuest || transferCount <= 0) return
    const store = useGameStore.getState()
    const currentPlayer = store.players[store.currentPlayerIndex]

    // Find which resources the guest needs
    const needs = selectedGuest.requirements.flatMap(r =>
      Array(r.amount).fill(r.type) as ResourceType[]
    )

    // Transfer up to transferCount items from kitchen
    let remaining = transferCount
    const newKitchen = { ...currentPlayer.kitchen }

    for (const need of needs) {
      if (remaining <= 0) break
      if ((newKitchen[need] || 0) > 0) {
        newKitchen[need] = (newKitchen[need] || 0) - 1
        remaining--
      }
    }

    const updatedPlayers = store.players.map((p, i) => {
      if (i !== store.currentPlayerIndex) return p
      return { ...p, kitchen: newKitchen }
    })

    useGameStore.setState({
      players: updatedPlayers,
      logs: [...store.logs, `${currentPlayer.name} 从厨房移动${transferCount}个餐饮到${selectedGuest.name}`],
    })

    setSelectedGuestId(null)
    setTransferCount(0)
  }

  return (
    <div style={{
      background: '#1a1a2e',
      borderRadius: 12,
      padding: 16,
      border: '1px solid #2a2a4a',
    }}>
      <h3 style={{ margin: '0 0 12px 0', color: '#e0e0e0', fontSize: 15 }}>
        厨房管理
      </h3>

      {/* Kitchen resources */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>
          库存 (总计: {totalKitchen})
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {resourceTypes.map(r => (
            <div key={r} style={{
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${(kitchen[r] || 0) > 0 ? RESOURCE_COLORS[r] : '#3a3a3a'}`,
              borderRadius: 6,
              padding: '4px 8px',
              display: 'flex', alignItems: 'center', gap: 4,
              opacity: (kitchen[r] || 0) > 0 ? 1 : 0.4,
            }}>
              <span style={{ fontSize: 14 }}>{RESOURCE_ICONS[r]}</span>
              <span style={{ color: '#e0e0e0', fontSize: 12, fontWeight: 600 }}>{kitchen[r] || 0}</span>
              <span style={{ color: '#888', fontSize: 9 }}>{RESOURCE_LABELS[r]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Waiting guests */}
      <div>
        <div style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>
          等待区的客人
        </div>
        {waitingGuests.length === 0 && (
          <div style={{ color: '#555', fontSize: 11, textAlign: 'center', padding: 8 }}>
            等待区暂无客人
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {waitingGuests.map(guest => {
            const isSelected = selectedGuestId === guest.id
            return (
              <div key={guest.id} style={{
                background: isSelected ? '#1a2744' : '#2a2a4a',
                border: `1px solid ${isSelected ? '#4a7db5' : '#4a4a6a'}`,
                borderRadius: 6,
                padding: '8px 10px',
                cursor: isActionPhase ? 'pointer' : 'default',
                transition: 'all 0.15s',
              }}
                onClick={() => {
                  if (!isActionPhase) return
                  setSelectedGuestId(isSelected ? null : guest.id)
                  setTransferCount(0)
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#e0e0e0', fontWeight: 600, fontSize: 12 }}>
                    {guest.name}
                  </span>
                  <span style={{ color: '#f1c40f', fontSize: 10 }}>+{guest.victoryPoints}分</span>
                </div>
                <div style={{ display: 'flex', gap: 3, marginTop: 4 }}>
                  {guest.requirements.map((req, i) => (
                    <span key={i} style={{
                      fontSize: 9,
                      background: 'rgba(255,255,255,0.08)',
                      borderRadius: 3,
                      padding: '1px 5px',
                      color: RESOURCE_COLORS[req.type] || '#888',
                    }}>
                      {RESOURCE_ICONS[req.type]} {req.amount}
                    </span>
                  ))}
                </div>

                {/* Transfer controls for selected guest */}
                {isSelected && isActionPhase && (
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setTransferCount(Math.max(0, transferCount - 1))
                        }}
                        style={{
                          width: 24, height: 24, borderRadius: 4,
                          border: '1px solid #4a4a6a', background: '#2a2a4a',
                          color: '#e0e0e0', cursor: 'pointer', fontSize: 14,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >-</button>
                      <span style={{ color: '#e0e0e0', fontSize: 13, fontWeight: 600, minWidth: 20, textAlign: 'center' }}>
                        {transferCount}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setTransferCount(Math.min(3, transferCount + 1))
                        }}
                        style={{
                          width: 24, height: 24, borderRadius: 4,
                          border: '1px solid #4a4a6a', background: '#2a2a4a',
                          color: '#e0e0e0', cursor: 'pointer', fontSize: 14,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >+</button>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleTransfer()
                      }}
                      disabled={transferCount <= 0}
                      style={{
                        padding: '4px 12px', borderRadius: 6,
                        border: `1px solid ${transferCount > 0 ? '#2ecc71' : '#3a3a3a'}`,
                        background: transferCount > 0 ? '#1a3a2a' : '#1a1a2e',
                        color: transferCount > 0 ? '#2ecc71' : '#555',
                        cursor: transferCount > 0 ? 'pointer' : 'not-allowed',
                        fontSize: 11,
                      }}
                    >
                      移动食物
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
