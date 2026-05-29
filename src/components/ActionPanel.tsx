import { useState } from 'react'
import { useGameStore } from '../store/gameStore'

const GUEST_COLORS: Record<string, { bg: string; border: string; label: string }> = {
  blue: { bg: '#1a2744', border: '#4a7db5', label: '贵族' },
  yellow: { bg: '#3a3520', border: '#d4a843', label: '艺术家/政客' },
  red: { bg: '#3a1a1a', border: '#c0392b', label: '市民' },
  green: { bg: '#1a3a1a', border: '#27ae60', label: '旅客' },
}

const ROOM_COLORS: Record<string, { bg: string; border: string }> = {
  blue: { bg: '#1a2744', border: '#4a7db5' },
  yellow: { bg: '#3a3520', border: '#d4a843' },
  red: { bg: '#3a1a1a', border: '#c0392b' },
}

export function ActionPanel() {
  const phase = useGameStore(s => s.phase)
  const player = useGameStore(s => s.players[s.currentPlayerIndex])
  const availableGuests = useGameStore(s => s.availableGuests)
  const availableRooms = useGameStore(s => s.availableRooms)
  const availableStaff = useGameStore(s => s.availableStaff)
  const inviteGuestAction = useGameStore(s => s.inviteGuestAction)
  const serveWaitingGuest = useGameStore(s => s.serveWaitingGuest)
  const constructRoom = useGameStore(s => s.constructRoom)
  const hireStaffMember = useGameStore(s => s.hireStaffMember)
  const endAction = useGameStore(s => s.endAction)

  const [tab, setTab] = useState<'invite' | 'serve' | 'rooms' | 'staff'>('invite')

  if (phase !== 'action') return null

  const canServe = (g: { requirements: { type: keyof typeof player.resources; amount: number }[] }) => {
    if (!player.builtRooms.some(r => r.capacity > 0)) return false
    return g.requirements.every(r => (player.resources[r.type] ?? 0) >= r.amount)
  }

  const canAffordRoom = (room: { cost: Record<string, number | undefined> }) => {
    return Object.entries(room.cost).every(([type, amount]) =>
      (player.resources[type as keyof typeof player.resources] ?? 0) >= (amount ?? 0)
    )
  }

  return (
    <div style={{
      background: '#1a1a2e', borderRadius: 12, border: '1px solid #2a2a4a', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', borderBottom: '1px solid #2a2a4a' }}>
        {([
          { key: 'invite', label: `👤 邀请客人(${availableGuests.length})` },
          { key: 'serve', label: `🍽️ 招待客人(${player.guestWaitingArea.length})` },
          { key: 'rooms', label: `🏗️ 建造(${availableRooms.length})` },
          { key: 'staff', label: `👔 雇佣(${availableStaff.length})` },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex: 1, padding: '8px 6px', fontSize: 11,
            background: tab === t.key ? '#2a2a4a' : 'transparent',
            border: 'none', borderBottom: tab === t.key ? '2px solid #4a7db5' : '2px solid transparent',
            color: tab === t.key ? '#e0e0e0' : '#666',
            cursor: 'pointer', fontWeight: tab === t.key ? 600 : 400,
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding: 12, maxHeight: 300, overflowY: 'auto' }}>
        {tab === 'invite' && (
          <div>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>
              花费金钱邀请客人到等候区
            </div>
            {availableGuests.length === 0 ? (
              <div style={{ color: '#666', fontSize: 12, textAlign: 'center', padding: 16 }}>
                没有可邀请的客人
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {availableGuests.map(g => {
                  const c = GUEST_COLORS[g.color] ?? GUEST_COLORS.blue
                  const affordable = player.resources.money >= g.guestCost
                  return (
                    <div key={g.id} onClick={affordable ? () => inviteGuestAction(g.id) : undefined} style={{
                      background: c.bg, border: `1px solid ${affordable ? c.border : '#3a3a3a'}`,
                      borderRadius: 8, padding: 8, minWidth: 100,
                      cursor: affordable ? 'pointer' : 'not-allowed',
                      opacity: affordable ? 1 : 0.35,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#e0e0e0', fontWeight: 600, fontSize: 12 }}>{g.name}</span>
                        <span style={{ color: '#f1c40f', fontSize: 10 }}>+{g.victoryPoints}</span>
                      </div>
                      <div style={{ fontSize: 10, color: '#888' }}>{c.label}</div>
                      <div style={{ fontSize: 10, color: affordable ? '#f39c12' : '#e74c3c' }}>
                        💰{g.guestCost}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'serve' && (
          <div>
            {player.guestWaitingArea.length === 0 ? (
              <div style={{ color: '#666', fontSize: 12, textAlign: 'center', padding: 16 }}>
                等待区没有客人，先去邀请客人吧
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {player.guestWaitingArea.map(g => {
                  const c = GUEST_COLORS[g.color] ?? GUEST_COLORS.blue
                  const affordable = canServe(g)
                  return (
                    <div key={g.id} onClick={affordable ? () => serveWaitingGuest(g.id) : undefined} style={{
                      background: c.bg, border: `1px solid ${affordable ? c.border : '#3a3a3a'}`,
                      borderRadius: 8, padding: 8, minWidth: 100,
                      cursor: affordable ? 'pointer' : 'not-allowed',
                      opacity: affordable ? 1 : 0.35,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#e0e0e0', fontWeight: 600, fontSize: 12 }}>{g.name}</span>
                        <span style={{ color: '#f1c40f', fontSize: 10 }}>+{g.victoryPoints}</span>
                      </div>
                      <div style={{ fontSize: 10, color: '#888' }}>{c.label}</div>
                      <div style={{ display: 'flex', gap: 2, marginTop: 3 }}>
                        {g.requirements.map((r, i) => (
                          <span key={i} style={{
                            fontSize: 9, background: 'rgba(255,255,255,0.08)', borderRadius: 2,
                            padding: '1px 4px',
                            color: (player.resources[r.type] ?? 0) >= r.amount ? '#2ecc71' : '#e74c3c',
                          }}>
                            {r.type}×{r.amount}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'rooms' && (
          <div>
            {availableRooms.length === 0 ? (
              <div style={{ color: '#666', fontSize: 12, textAlign: 'center', padding: 16 }}>
                所有房间已被建造
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {availableRooms.map(r => {
                  const c = ROOM_COLORS[r.color] ?? ROOM_COLORS.red
                  const affordable = canAffordRoom(r)
                  return (
                    <div key={r.id} onClick={affordable ? () => constructRoom(r.id) : undefined} style={{
                      background: c.bg, border: `1px solid ${affordable ? c.border : '#3a3a3a'}`,
                      borderRadius: 8, padding: 8, minWidth: 80,
                      cursor: affordable ? 'pointer' : 'not-allowed',
                      opacity: affordable ? 1 : 0.35,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#e0e0e0', fontWeight: 600, fontSize: 11 }}>{r.name}</span>
                        <span style={{ color: '#f1c40f', fontSize: 10 }}>+{r.victoryPoints}</span>
                      </div>
                      <div style={{ fontSize: 10, color: '#f39c12' }}>💰{r.cost.money}</div>
                      <div style={{ fontSize: 9, color: '#666' }}>容量:{r.capacity}</div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'staff' && (
          <div>
            {availableStaff.length === 0 ? (
              <div style={{ color: '#666', fontSize: 12, textAlign: 'center', padding: 16 }}>
                没有可雇佣的员工
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {availableStaff.map(s => {
                  const affordable = player.resources.money >= s.cost
                  return (
                    <div key={s.id} onClick={affordable ? () => hireStaffMember(s.id) : undefined} style={{
                      background: '#2a2a4a', border: `1px solid ${affordable ? '#4a4a6a' : '#3a3a3a'}`,
                      borderRadius: 8, padding: 8, minWidth: 100,
                      cursor: affordable ? 'pointer' : 'not-allowed',
                      opacity: affordable ? 1 : 0.35,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#e0e0e0', fontWeight: 600, fontSize: 12 }}>{s.name}</span>
                        <span style={{ color: '#f1c40f', fontSize: 10 }}>+{s.victoryPoints}</span>
                      </div>
                      <div style={{ fontSize: 10, color: '#888', margin: '2px 0' }}>{s.description}</div>
                      <div style={{ fontSize: 10, color: '#f39c12' }}>💰{s.cost}</div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={endAction} style={{
            padding: '8px 24px', borderRadius: 8, border: '1px solid #4a7db5',
            background: '#1a2744', color: '#e0e0e0', cursor: 'pointer', fontSize: 13, fontWeight: 600,
          }}>
            {(() => {
              const s = useGameStore.getState()
              const ni = (s.currentPlayerIndex + 1) % s.maxPlayers
              return ni === s.players.findIndex(p => p.isFirstPlayer)
                ? '✅ 结束本轮'
                : `➡️ 交给 ${s.players[ni].name}`
            })()}
          </button>
        </div>
      </div>
    </div>
  )
}
