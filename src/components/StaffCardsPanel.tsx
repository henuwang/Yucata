import type { Player, StaffTiming } from '../types/game'

interface StaffCardsPanelProps {
  player: Player
}

const timingInfo: Record<StaffTiming, { label: string; color: string }> = {
  one_time: { label: '一次性', color: '#e67e22' },
  once_per_round: { label: '每轮', color: '#3498db' },
  permanent: { label: '永久', color: '#2ecc71' },
  end_of_game: { label: '终局', color: '#9b59b6' },
}

const timingOrder: StaffTiming[] = ['one_time', 'once_per_round', 'permanent', 'end_of_game']

export function StaffCardsPanel({ player }: StaffCardsPanelProps) {
  const cards = player.staffCards

  if (cards.length === 0) {
    return (
      <div style={{
        background: '#1a1a2e',
        borderRadius: 12,
        padding: 16,
        border: '1px solid #2a2a4a',
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#e0e0e0', fontSize: 15 }}>
          👔 已雇佣员工
        </h3>
        <div style={{ color: '#666', fontSize: 12, textAlign: 'center', padding: 12 }}>
          暂无已雇佣员工
        </div>
      </div>
    )
  }

  const groups: Record<string, typeof cards> = {}
  timingOrder.forEach(t => { groups[t] = [] })
  cards.forEach(c => {
    if (groups[c.timing]) {
      groups[c.timing].push(c)
    }
  })

  return (
    <div style={{
      background: '#1a1a2e',
      borderRadius: 12,
      padding: 16,
      border: '1px solid #2a2a4a',
    }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#e0e0e0', fontSize: 15 }}>
        👔 已雇佣员工 ({cards.length})
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {timingOrder.map(timing => {
          const group = groups[timing]
          if (group.length === 0) return null
          const info = timingInfo[timing]
          return (
            <div key={timing}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginBottom: 6,
                paddingBottom: 4,
                borderBottom: '1px solid #2a2a4a',
              }}>
                <span style={{
                  fontSize: 10,
                  color: info.color,
                  background: `${info.color}22`,
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontWeight: 600,
                }}>
                  {info.label}
                </span>
                <span style={{ fontSize: 11, color: '#555' }}>
                  {group.length} 张
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {group.map(card => (
                  <div key={card.id} style={{
                    background: '#2a2a4a',
                    border: '1px solid #4a4a6a',
                    borderRadius: 6,
                    padding: '6px 10px',
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <span style={{ color: '#e0e0e0', fontWeight: 600, fontSize: 12 }}>
                        {card.name}
                      </span>
                      <span style={{ color: '#f1c40f', fontSize: 11 }}>
                        +{card.victoryPoints}
                      </span>
                    </div>
                    <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>
                      {card.description}
                    </div>
                    <div style={{ fontSize: 10, color: '#f39c12', marginTop: 1 }}>
                      💰{card.cost}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
