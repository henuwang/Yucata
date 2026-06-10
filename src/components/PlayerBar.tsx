import { useGameStore } from '../store/gameStore'

const DIE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']
const DIE_COLORS: Record<number, string> = {
  1: '#e74c3c', 2: '#e67e22', 3: '#f1c40f', 4: '#2ecc71', 5: '#3498db', 6: '#9b59b6',
}

export function PlayerBar() {
  const players = useGameStore(s => s.players)
  const currentIdx = useGameStore(s => s.currentPlayerIndex)
  const areaDice = useGameStore(s => s.areaDice)
  const isDiceActive = useGameStore(s => s.phase === 'action' || s.phase === 'dice_roll')

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {players.map((p, i) => {
        const isActive = i === currentIdx
        return (
          <div key={p.id} style={{
            flex: 1, minWidth: 200,
            background: isActive ? '#1a2744' : '#1a1a2e',
            borderRadius: 10, padding: '10px 14px',
            border: isActive ? `2px solid ${p.color}` : '1px solid #2a2a4a',
            opacity: isActive ? 1 : 0.6,
            transition: 'all 0.3s',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ color: '#e0e0e0', fontWeight: 600, fontSize: 14 }}>
                {p.isFirstPlayer ? '👑 ' : ''}{p.name}
              </span>
              <span style={{ color: '#f1c40f', fontWeight: 700, fontSize: 18 }}>{p.score}</span>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <Res label="🍞" v={p.resources.food} />
              <Res label="🍷" v={p.resources.wine} />
              <Res label="☕" v={p.resources.coffee} />
              <Res label="🍰" v={p.resources.cake} />
              <Res label="💰" v={p.resources.money} />
            </div>
            <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
              <span>👑皇{p.emperorTrack} | 客人{p.guestWaitingArea.length} | 已招待{p.guestServedArea.length} | 房间{p.builtRooms.length} | 员工{p.staffCards.length}</span>
            </div>
            {/* Dice distribution */}
            {isDiceActive && (
              <div style={{ display: 'flex', gap: 4, marginTop: 6, paddingTop: 6, borderTop: '1px solid #2a2a4a' }}>
                {[1, 2, 3, 4, 5, 6].map(val => {
                  const count = areaDice[val] || 0
                  return (
                    <div key={val} style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      opacity: count > 0 ? 1 : 0.3,
                    }}>
                      <span style={{ fontSize: 14, color: DIE_COLORS[val], lineHeight: 1 }}>
                        {DIE_FACES[val - 1]}
                      </span>
                      <span style={{
                        fontSize: 9, fontWeight: 700, color: '#ccc',
                        background: 'rgba(255,255,255,0.06)',
                        borderRadius: 4, padding: '0 4px', minWidth: 12, textAlign: 'center',
                      }}>
                        {count}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function Res({ label, v }: { label: string; v: number }) {
  return <span style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 4, padding: '1px 6px', fontSize: 12, color: '#ccc' }}>{label}{v}</span>
}
