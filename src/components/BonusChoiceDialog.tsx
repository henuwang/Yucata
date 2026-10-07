import { useGameStore } from '../store/gameStore'
import { RoomPickerInline, StaffPickerInline } from './ActionPanel'

export function BonusChoiceDialog() {
  const queue = useGameStore(s => s.pendingBonusChoices)
  const players = useGameStore(s => s.players)
  const resolveBonus = useGameStore(s => s.resolveBonusChoice)
  const declineBonus = useGameStore(s => s.declineBonusChoice)

  const choice = queue?.[0]
  if (!choice) return null

  const player = players.find(p => p.id === choice.playerId)
  if (!player) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: '#1a1a2e',
        border: '1px solid #4a7db5',
        borderRadius: 16,
        padding: 24,
        maxWidth: 520,
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        <h2 style={{ color: '#e0e0e0', fontSize: 18, margin: '0 0 4px 0', textAlign: 'center', letterSpacing: 2 }}>
          🎁 {choice.kind === 'staff' ? '员工卡收益' : '客房收益'}
        </h2>
        <p style={{ color: '#aaa', fontSize: 13, textAlign: 'center', margin: '0 0 12px 0' }}>
          {player.name}：{choice.description}
        </p>

        {choice.kind === 'staff' ? (
          <StaffPickerInline
            n={choice.discount ?? 0}
            free={choice.freeStaff}
            staffOptions={choice.staffOptions}
            playerId={choice.playerId}
            title={choice.freeStaff ? '👔 免费打出1张员工卡' : '👔 挑选1张员工卡（少付' + (choice.discount ?? 0) + '元）'}
            onSelect={staffId => resolveBonus({ staffId })}
          />
        ) : (
          <RoomPickerInline
            maxRooms={1}
            freeCost={choice.freeRoom}
            maxRow={choice.maxRow}
            playerId={choice.playerId}
            onConfirm={placements => resolveBonus({ placements })}
          />
        )}

        <div style={{ marginTop: 12, textAlign: 'center' }}>
          <button onClick={declineBonus}
            style={{ padding: '6px 16px', borderRadius: 6, border: '1px solid #4a4a6a', background: '#2a2a4a', color: '#e0e0e0', cursor: 'pointer', fontSize: 12 }}>
            放弃该收益
          </button>
        </div>
      </div>
    </div>
  )
}
