import { useGameStore } from '../store/gameStore'

export function StaffArea() {
  const availableStaff = useGameStore(s => s.availableStaff)
  const currentPlayer = useGameStore(s => s.players[s.currentPlayerIndex])
  const phase = useGameStore(s => s.phase)
  const hireStaffMember = useGameStore(s => s.hireStaffMember)

  return (
    <div style={{
      background: '#1a1a2e',
      borderRadius: 12,
      padding: 16,
      border: '1px solid #2a2a4a',
    }}>
      <h3 style={{ margin: '0 0 12px 0', color: '#e0e0e0', fontSize: 16 }}>员工市场</h3>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {availableStaff.map(staff => {
          const canAfford = phase === 'action' && currentPlayer.resources.money >= staff.cost
          return (
            <div
              key={staff.id}
              onClick={canAfford ? () => hireStaffMember(staff.id) : undefined}
              style={{
                background: '#2a2a4a',
                border: '1px solid #4a4a6a',
                borderRadius: 8,
                padding: 10,
                minWidth: 120,
                cursor: canAfford ? 'pointer' : 'not-allowed',
                opacity: canAfford ? 1 : 0.4,
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: '#e0e0e0', fontWeight: 600, fontSize: 13 }}>{staff.name}</span>
                <span style={{ color: '#f1c40f', fontSize: 12 }}>{staff.victoryPoints}分</span>
              </div>
              <div style={{ fontSize: 11, color: '#aaa', marginBottom: 4 }}>{staff.description}</div>
              <div style={{ fontSize: 11, color: '#f39c12' }}>费用: {staff.cost}元</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
