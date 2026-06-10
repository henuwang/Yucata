import { useState } from 'react'
import { useGameStore } from '../store/gameStore'

const AREA_CONFIG: Record<number, { name: string; desc: string; color: string; icon: string }> = {
  1: { name: '食材市场', desc: '取食物或蛋糕', color: '#e74c3c', icon: '🥖' },
  2: { name: '酒水市场', desc: '取红酒或咖啡', color: '#e67e22', icon: '🍷' },
  3: { name: '建造局', desc: '建造一个房间', color: '#f1c40f', icon: '🏗️' },
  4: { name: '皇帝觐见', desc: '皇帝轨道或金钱', color: '#2ecc71', icon: '👑' },
  5: { name: '人力市场', desc: '雇佣员工(折扣)', color: '#3498db', icon: '👔' },
  6: { name: '黑市', desc: '花1元模拟其他区', color: '#9b59b6', icon: '🕶️' },
}

const DIE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']

const GUEST_COLORS: Record<string, { bg: string; border: string; label: string }> = {
  blue: { bg: '#1a2744', border: '#4a7db5', label: '贵族' },
  yellow: { bg: '#3a3520', border: '#d4a843', label: '艺术家/政客' },
  red: { bg: '#3a1a1a', border: '#c0392b', label: '市民' },
  green: { bg: '#1a3a1a', border: '#27ae60', label: '旅客' },
}

export function ActionPanel() {
  const phase = useGameStore(s => s.phase)
  const players = useGameStore(s => s.players)
  const currentIdx = useGameStore(s => s.currentPlayerIndex)
  const areaDice = useGameStore(s => s.areaDice)
  const availableGuests = useGameStore(s => s.availableGuests)
  const availableRooms = useGameStore(s => s.availableRooms)
  const availableStaff = useGameStore(s => s.availableStaff)
  const takeAreaAction = useGameStore(s => s.takeAreaAction)
  const inviteGuestAction = useGameStore(s => s.inviteGuestAction)
  const constructRoom = useGameStore(s => s.constructRoom)
  const hireStaffMember = useGameStore(s => s.hireStaffMember)

  const [tab, setTab] = useState<'action' | 'invite' | 'serve' | 'rooms' | 'staff'>('action')

  if (phase !== 'action') return null

  const player = players[currentIdx]
  if (!player) return null
  const areaCounts = areaDice

  return (
    <div style={{
      background: '#1a1a2e', borderRadius: 12, border: '1px solid #2a2a4a', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', height: '100%',
    }}>
      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid #2a2a4a' }}>
        {[
          { key: 'action', label: '🎲 行动区' },
          { key: 'invite', label: '👥 邀请' },
          { key: 'serve', label: '🍽️ 服务' },
          { key: 'rooms', label: '🏠 房间' },
          { key: 'staff', label: '👔 员工' },
        ].map(t => (
          <div key={t.key} onClick={() => setTab(t.key as any)} style={{
            flex: 1, padding: '8px 4px', textAlign: 'center', cursor: 'pointer',
            fontSize: 11, fontWeight: tab === t.key ? 600 : 400,
            color: tab === t.key ? '#e0e0e0' : '#666',
            borderBottom: tab === t.key ? '2px solid #4a7db5' : '2px solid transparent',
            background: tab === t.key ? '#0f0f1a' : 'transparent',
            transition: 'all 0.15s',
          }}>
            {t.label}
          </div>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
        {tab === 'action' && <ActionAreaTab areaCounts={areaCounts} takeAreaAction={takeAreaAction} />}
        {tab === 'invite' && <InviteGuestTab availableGuests={availableGuests} player={player} inviteGuestAction={inviteGuestAction} />}
        {tab === 'serve' && <ServeGuestTab />}
        {tab === 'rooms' && <RoomsTab availableRooms={availableRooms} player={player} constructRoom={constructRoom} />}
        {tab === 'staff' && <StaffTab availableStaff={availableStaff} player={player} hireStaffMember={hireStaffMember} />}
      </div>
    </div>
  )
}

// ════════════════════════════════════════
// Action Area Tab
// ════════════════════════════════════════

function ActionAreaTab({
  areaCounts, takeAreaAction,
}: {
  areaCounts: Record<number, number>
  takeAreaAction: (area: number, sub?: string, row?: number, col?: number) => void
}) {
  const [selected, setSelected] = useState<number | null>(null)
  const [splitVal, setSplitVal] = useState(0)
  const [inRoomPicker, setInRoomPicker] = useState(false)
  const [inStaffPicker, setInStaffPicker] = useState(false)
  const [wildArea, setWildArea] = useState(1)
  const [wildSplit, setWildSplit] = useState(0)

  const skipAction = useGameStore(s => s.skipAction)
  const cp = useGameStore(s => s.players[s.currentPlayerIndex])

  const remainingDice = Object.values(areaCounts).reduce((s, c) => s + c, 0)

  return (
    <div>
      <div style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>
        {cp.name}: {cp.actionsPerformed}/2 次行动 | 剩余 {remainingDice} 颗骰子
      </div>

      {/* Area Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[1, 2, 3, 4, 5, 6].map(area => {
          const cfg = AREA_CONFIG[area]
          const count = areaCounts[area] ?? 0
          const enabled = count > 0 && cp.actionsPerformed < 2 && !cp.hasPassedInCycle
          return (
            <div key={area}
              onClick={enabled ? () => { setSelected(area); setInRoomPicker(false); setInStaffPicker(false); setSplitVal(0); setWildArea(1); setWildSplit(0) } : undefined}
              style={{
                background: enabled ? '#252545' : '#1a1a2e',
                border: '1px solid ' + (enabled ? cfg.color : '#2a2a4a'),
                borderRadius: 10, padding: '12px 14px', textAlign: 'center',
                cursor: enabled ? 'pointer' : 'not-allowed',
                opacity: enabled ? 1 : 0.3,
                transition: 'all 0.15s',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <span style={{ fontSize: 26 }}>{cfg.icon}</span>
                <span style={{ fontSize: 28, color: cfg.color, lineHeight: 1 }}>
                  {DIE_FACES[area - 1]}
                </span>
              </div>
              <div style={{
                background: cfg.color, color: '#fff', borderRadius: 12,
                display: 'inline-block', padding: '2px 14px', fontSize: 16, fontWeight: 'bold',
                marginTop: 6, minWidth: 24,
              }}>×{count}</div>
              <div style={{ color: '#e0e0e0', fontWeight: 600, fontSize: 12, marginTop: 6 }}>{cfg.name}</div>
              <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>{cfg.desc}</div>
            </div>
          )
        })}
      </div>

      {/* Skip button */}
      {cp.actionsPerformed < 2 && !cp.hasPassedInCycle && (
        <div style={{ marginTop: 8 }}>
          <button onClick={() => { skipAction(); setSelected(null) }}
            style={{
              padding: '6px 16px', borderRadius: 6, width: '100%',
              border: '1px solid #e74c3c44', background: '#3a1a1a',
              color: '#e74c3c', cursor: 'pointer', fontSize: 12,
            }}>
            ⏭️ 跳过本次行动
          </button>
        </div>
      )}

      {/* Area action dialogs */}
      {selected && (selected === 1 || selected === 2 || selected === 4) && (
        <SplitDialog
          area={selected}
          n={areaCounts[selected] ?? 0}
          cfg={AREA_CONFIG[selected]}
          splitVal={splitVal}
          setSplitVal={setSplitVal}
          onConfirm={() => { takeAreaAction(selected, String(splitVal)); setSelected(null) }}
          onCancel={() => setSelected(null)}
        />
      )}

      {selected === 3 && !inRoomPicker && (
        <div style={{ background: '#0f0f1a', borderRadius: 10, padding: 16, border: '1px solid #3a3a5a', marginTop: 12 }}>
          <div style={{ fontSize: 14, color: '#e0e0e0', fontWeight: 600, marginBottom: 8 }}>
            🏗️ 建造局 (骰子骰子数: {areaCounts[3]})
          </div>
          <button onClick={() => setInRoomPicker(true)}
            style={{ padding: '6px 16px', borderRadius: 6, border: '1px solid #4a7db5', background: '#1a2744', color: '#e0e0e0', cursor: 'pointer', fontSize: 12, marginRight: 8 }}>
            🏗️ 选择房间建造
          </button>
          <button onClick={() => setSelected(null)}
            style={{ padding: '6px 16px', borderRadius: 6, border: '1px solid #4a4a6a', background: '#2a2a4a', color: '#e0e0e0', cursor: 'pointer', fontSize: 12 }}>
            取消
          </button>
        </div>
      )}
      {selected === 3 && inRoomPicker && (
        <RoomPickerInline
          onSelect={(roomId, slotRow, slotCol) => { takeAreaAction(3, roomId, slotRow, slotCol); setSelected(null); setInRoomPicker(false) }}
          onBack={() => setInRoomPicker(false)}
        />
      )}

      {selected === 5 && !inStaffPicker && (
        <div style={{ background: '#0f0f1a', borderRadius: 10, padding: 16, border: '1px solid #3a3a5a', marginTop: 12 }}>
          <div style={{ fontSize: 14, color: '#e0e0e0', fontWeight: 600, marginBottom: 8 }}>
            👔 人力市场 (骰子骰子数: {areaCounts[5]})
          </div>
          <div style={{ fontSize: 12, color: '#aaa', marginBottom: 12 }}>
            骰子数量即为折扣
          </div>
          <button onClick={() => setInStaffPicker(true)}
            style={{ padding: '6px 16px', borderRadius: 6, border: '1px solid #4a7db5', background: '#1a2744', color: '#e0e0e0', cursor: 'pointer', fontSize: 12, marginRight: 8 }}>
            👔 选择员工
          </button>
          <button onClick={() => setSelected(null)}
            style={{ padding: '6px 16px', borderRadius: 6, border: '1px solid #4a4a6a', background: '#2a2a4a', color: '#e0e0e0', cursor: 'pointer', fontSize: 12 }}>
            取消
          </button>
        </div>
      )}
      {selected === 5 && inStaffPicker && (
        <StaffPickerInline
          n={areaCounts[5] ?? 0}
          onSelect={(staffId) => { takeAreaAction(5, staffId); setSelected(null); setInStaffPicker(false) }}
          onBack={() => setInStaffPicker(false)}
        />
      )}

      {selected === 6 && (
        <div style={{ background: '#0f0f1a', borderRadius: 10, padding: 16, border: '1px solid #3a3a5a', marginTop: 12 }}>
          <div style={{ fontSize: 14, color: '#e0e0e0', fontWeight: 600, marginBottom: 8 }}>
            🕶️ 黑市 (花1元模拟其他区)
          </div>
          <div style={{ fontSize: 12, color: '#aaa', marginBottom: 8 }}>
            骰子数量: {areaCounts[6] ?? 0}
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
            {[1, 2, 3, 4, 5].map(a => (
              <div key={a} onClick={() => { setWildArea(a); setWildSplit(0) }} style={{
                padding: '6px 14px', borderRadius: 6,
                background: wildArea === a ? '#3a3a5a' : '#2a2a4a',
                border: '1px solid ' + (wildArea === a ? AREA_CONFIG[a].color : '#4a4a6a'),
                cursor: 'pointer', color: '#e0e0e0', fontSize: 12,
                fontWeight: wildArea === a ? 600 : 400,
              }}>
                {AREA_CONFIG[a].icon} 区{a}
              </div>
            ))}
          </div>
          {(wildArea === 1 || wildArea === 2 || wildArea === 4) && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>
                {wildArea === 1 ? '蛋糕数量' : wildArea === 2 ? '咖啡数量' : '皇帝步数'}: {wildSplit}
              </div>
              <input type="range" min={0} max={areaCounts[6] ?? 0} value={wildSplit}
                onChange={e => setWildSplit(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: AREA_CONFIG[wildArea].color }} />
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => {
              const sub = (wildArea === 1 || wildArea === 2 || wildArea === 4)
                ? wildArea + '|' + wildSplit
                : wildArea + '|'
              takeAreaAction(6, sub)
              setSelected(null)
            }}
              style={{ padding: '6px 16px', borderRadius: 6, border: '1px solid #4a7db5', background: '#1a2744', color: '#e0e0e0', cursor: 'pointer', fontSize: 12 }}>
              {'✅ 花1元执行区' + wildArea}
            </button>
            <button onClick={() => setSelected(null)}
              style={{ padding: '6px 16px', borderRadius: 6, border: '1px solid #4a4a6a', background: '#2a2a4a', color: '#e0e0e0', cursor: 'pointer', fontSize: 12 }}>
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ════════════════════════════════════════
// Split Dialog
// ════════════════════════════════════════

function SplitDialog({
  area, n, cfg, splitVal, setSplitVal, onConfirm, onCancel,
}: {
  area: number; n: number; cfg: { name: string; color: string; icon: string }
  splitVal: number; setSplitVal: (v: number) => void
  onConfirm: () => void; onCancel: () => void
}) {
  let label1 = '', label2 = ''
  if (area === 1) { label1 = '🥖 食物x' + (n - splitVal); label2 = '🍰 蛋糕x' + splitVal }
  else if (area === 2) { label1 = '🍷 红酒x' + (n - splitVal); label2 = '☕ 咖啡x' + splitVal }
  else { label1 = '💰 金钱x' + (n - splitVal); label2 = '👑 皇帝+' + splitVal }

  return (
    <div style={{ background: '#0f0f1a', borderRadius: 10, padding: 16, border: '1px solid #3a3a5a', marginTop: 12 }}>
      <div style={{ fontSize: 14, color: '#e0e0e0', fontWeight: 600, marginBottom: 8 }}>
        {cfg.icon} {cfg.name} (骰子x{n})
      </div>
      <div style={{ fontSize: 12, color: '#aaa', marginBottom: 12 }}>拖动滑块分配</div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>
          {area === 1 ? '蛋糕' : area === 2 ? '咖啡' : '皇帝步数'}: {splitVal}
        </div>
        <input type="range" min={0} max={n} value={splitVal}
          onChange={e => setSplitVal(parseInt(e.target.value))}
          style={{ width: '100%', accentColor: cfg.color }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#666' }}>
          <span>{label1}</span>
          <span>{label2}</span>
        </div>
      </div>
      <button onClick={onConfirm}
        style={{ padding: '6px 16px', borderRadius: 6, border: '1px solid #4a7db5', background: '#1a2744', color: '#e0e0e0', cursor: 'pointer', fontSize: 12, marginRight: 8 }}>
        {'✅ 执行 (x' + n + ')'}
      </button>
      <button onClick={onCancel}
        style={{ padding: '6px 16px', borderRadius: 6, border: '1px solid #4a4a6a', background: '#2a2a4a', color: '#e0e0e0', cursor: 'pointer', fontSize: 12 }}>
        取消
      </button>
    </div>
  )
}

// ════════════════════════════════════════
// Invite Guest Tab
// ════════════════════════════════════════

const REQ_ICONS: Record<string, string> = {
  food: '🥖', wine: '🍷', coffee: '☕', cake: '🍰', money: '💰',
}

function InviteGuestTab({ availableGuests, player, inviteGuestAction }: {
  availableGuests: any[]; player: any; inviteGuestAction: (id: string) => void
}) {
  return (
    <div>
      <div style={{ fontSize: 13, color: '#e0e0e0', fontWeight: 600, marginBottom: 8 }}>
        邀请客人 (咖啡厅: {player.guestWaitingArea.length}/3)
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {availableGuests.slice(0, 5).map((g: any) => {
          const canAfford = player.resources.money >= g.guestCost
          const hasRoom = player.guestWaitingArea.length < 3
          const c = GUEST_COLORS[g.color] ?? GUEST_COLORS.blue
          return (
            <div key={g.id} onClick={() => { if (canAfford && hasRoom) inviteGuestAction(g.id) }} style={{
              background: c.bg, border: '1px solid ' + (canAfford && hasRoom ? c.border : '#3a3a3a'),
              borderRadius: 8, padding: 8, minWidth: 110,
              cursor: canAfford && hasRoom ? 'pointer' : 'not-allowed',
              opacity: canAfford && hasRoom ? 1 : 0.4,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#e0e0e0', fontWeight: 600, fontSize: 12 }}>{g.name}</span>
                <span style={{ color: '#f1c40f', fontSize: 10 }}>+{g.victoryPoints}</span>
              </div>
              <div style={{ fontSize: 10, color: '#888' }}>{c.label}</div>
              <div style={{ fontSize: 10, color: '#f39c12' }}>{'💰' + g.guestCost}</div>
              {/* Guest requirements */}
              {g.requirements && g.requirements.length > 0 && (
                <div style={{ display: 'flex', gap: 2, marginTop: 3, flexWrap: 'wrap' }}>
                  {g.requirements.map((r: any, i: number) => (
                    <span key={i} style={{
                      fontSize: 9, background: 'rgba(255,255,255,0.08)',
                      borderRadius: 3, padding: '1px 4px', color: '#aaa',
                    }}>
                      {REQ_ICONS[r.type] || '?'}×{r.amount}
                    </span>
                  ))}
                </div>
              )}
              {/* Bonus reward */}
              {g.bonusResource && g.bonusAmount && (
                <div style={{ fontSize: 9, color: '#2ecc71', marginTop: 2 }}>
                  🎁 {REQ_ICONS[g.bonusResource] || '?'}+{g.bonusAmount}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ════════════════════════════════════════
// Serve Guest Tab with Check-In Dialog (Task 4)
// ════════════════════════════════════════

function ServeGuestTab() {
  const player = useGameStore(s => s.players[s.currentPlayerIndex])
  const [serveGuestId, setServeGuestId] = useState<string | null>(null)

  // Room selection dialog
  if (serveGuestId) {
    return (
      <GuestCheckInDialog
        guestId={serveGuestId}
        onClose={() => setServeGuestId(null)}
        onComplete={() => setServeGuestId(null)}
      />
    )
  }

  if (player.guestWaitingArea.length === 0) {
    return (
      <div style={{ color: '#666', fontSize: 12, textAlign: 'center', padding: 16 }}>
        等待区没有客人，先邀请吧
      </div>
    )
  }

  return (
    <div>
      <div style={{ fontSize: 13, color: '#e0e0e0', fontWeight: 600, marginBottom: 8 }}>
        招待客人 - 选择客人入住
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {player.guestWaitingArea.map((g: any) => {
          const c = GUEST_COLORS[g.color] ?? GUEST_COLORS.blue
          const canServe = (() => {
            if (!player.builtRooms.some((r: any) => r.capacity > 0)) return false
            return g.requirements.every((r: { type: string; amount: number }) => (player.resources[r.type as keyof typeof player.resources] ?? 0) >= r.amount)
          })()
          return (
            <div key={g.id} onClick={canServe ? () => setServeGuestId(g.id) : undefined} style={{
              background: c.bg, border: '1px solid ' + (canServe ? c.border : '#3a3a3a'),
              borderRadius: 8, padding: 8, minWidth: 100,
              cursor: canServe ? 'pointer' : 'not-allowed',
              opacity: canServe ? 1 : 0.35,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#e0e0e0', fontWeight: 600, fontSize: 12 }}>{g.name}</span>
                <span style={{ color: '#f1c40f', fontSize: 10 }}>+{g.victoryPoints}</span>
              </div>
              <div style={{ fontSize: 10, color: '#888' }}>{c.label}</div>
              <div style={{ display: 'flex', gap: 2, marginTop: 3 }}>
                {g.requirements.map((r: { type: string; amount: number }, i: number) => (
                  <span key={i} style={{
                    fontSize: 9, background: 'rgba(255,255,255,0.08)', borderRadius: 2,
                    padding: '1px 4px',
                    color: (player.resources[r.type as keyof typeof player.resources] ?? 0) >= r.amount ? '#2ecc71' : '#e74c3c',
                  }}>
                    {REQ_ICONS[r.type] || '?'}×{r.amount}
                  </span>
                ))}
              </div>
              {canServe && (
                <div style={{ fontSize: 9, color: '#4a7db5', marginTop: 4, textAlign: 'center' }}>
                  点击选择房间
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ════════════════════════════════════════
// Guest Check-In Dialog (Task 4)
// ════════════════════════════════════════

function GuestCheckInDialog({
  guestId, onClose, onComplete,
}: {
  guestId: string; onClose: () => void; onComplete: () => void
}) {
  const player = useGameStore(s => s.players[s.currentPlayerIndex])
  const serveWaitingGuest = useGameStore(s => s.serveWaitingGuest)
  const guest = player.guestWaitingArea.find((g: any) => g.id === guestId)

  if (!guest) {
    return null
  }

  const roomColorInfo: Record<string, { bg: string; border: string; label: string }> = {
    blue: { bg: '#1a2744', border: '#4a7db5', label: '蓝' },
    yellow: { bg: '#3a3520', border: '#d4a843', label: '黄' },
    red: { bg: '#3a1a1a', border: '#c0392b', label: '红' },
  }

  const colorBg: Record<string, string> = {
    blue: '#1a2744', yellow: '#3a3520', red: '#3a1a1a', green: '#1a3a1a',
  }
  const colorBorder: Record<string, string> = {
    blue: '#4a7db5', yellow: '#d4a843', red: '#c0392b', green: '#27ae60',
  }

  // Find valid rooms for this guest
  const validRooms: any[] = []
  player.builtRooms.forEach((r: any) => {
    if (r.capacity <= 0) return
    const slot = player.roomSlots.find((s: any) => s.roomId === r.id)
    if (!slot) return
    if (guest.color !== 'green' && r.color !== guest.color) return
    validRooms.push({ name: r.name, color: r.color, row: slot.row, col: slot.col, roomId: r.id })
  })

  const guestColorLabel = guest.color === 'green' ? '旅客(可住任何颜色)' :
    guest.color === 'blue' ? '贵族(仅限蓝色房间)' :
    guest.color === 'red' ? '市民(仅限红色房间)' :
    guest.color === 'yellow' ? '艺术家(仅限黄色房间)' : ''

  return (
    <div style={{
      background: '#0f0f1a', borderRadius: 12, padding: 16,
      border: '1px solid ' + (colorBorder[guest.color] || '#4a4a6a'),
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h4 style={{ margin: 0, color: '#e0e0e0', fontSize: 14, fontWeight: 600 }}>
          {'🚪 ' + guest.name + ' 入住选房'}
        </h4>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 12 }}>
          X
        </button>
      </div>

      <div style={{
        background: colorBg[guest.color] || '#2a2a2a',
        padding: '8px 12px', borderRadius: 8, marginBottom: 12,
        border: '1px solid ' + (colorBorder[guest.color] || '#4a4a6a'),
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#e0e0e0', fontWeight: 600, fontSize: 13 }}>{guest.name}</span>
          <span style={{ color: '#f1c40f', fontSize: 12 }}>{'+' + guest.victoryPoints + '分'}</span>
        </div>
        <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>{guestColorLabel}</div>
      </div>

      {validRooms.length === 0 ? (
        <div style={{ background: '#3a1a1a', borderRadius: 8, padding: 16, textAlign: 'center', border: '1px solid #e74c3c44' }}>
          <div style={{ color: '#e74c3c', fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
            {'X 无法入住'}
          </div>
          <div style={{ color: '#e0e0e0', fontSize: 11 }}>
            {guest.color === 'green' ? '没有空房间可供入住' :
              '没有空的' + (roomColorInfo[guest.color]?.label || '') + '色房间供 ' + guest.name + ' 入住'}
          </div>
          <button onClick={onClose} style={{
            marginTop: 8, padding: '6px 16px', borderRadius: 6,
            border: '1px solid #4a4a6a', background: '#2a2a4a', color: '#ccc',
            cursor: 'pointer', fontSize: 11,
          }}>关闭</button>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>请选择入住房间:</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {validRooms.map((v: any, idx: number) => {
              const c = roomColorInfo[v.color] || { bg: '#2a2a4a', border: '#888', label: '' }
              return (
                <div key={idx}
                  onClick={() => { serveWaitingGuest(guestId, v.row, v.col); onComplete() }}
                  style={{
                    background: c.bg, border: '2px solid ' + c.border,
                    borderRadius: 10, padding: '10px 14px',
                    cursor: 'pointer', minWidth: 100,
                    transition: 'all 0.15s',
                  }}>
                  <div style={{ color: '#e0e0e0', fontWeight: 600, fontSize: 13 }}>{v.name}</div>
                  <div style={{ fontSize: 10, color: c.border, marginTop: 2 }}>{c.label}色</div>
                  <div style={{ fontSize: 10, color: '#888' }}>位({v.row},{v.col})</div>
                  <div style={{ fontSize: 9, color: '#2ecc71', marginTop: 4, textAlign: 'center' }}>点击入住</div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ════════════════════════════════════════
// Rooms Tab
// ════════════════════════════════════════

function RoomsTab({ availableRooms, player, constructRoom }: {
  availableRooms: any[]; player: any; constructRoom: (id: string) => void
}) {
  return (
    <div>
      <div style={{ fontSize: 13, color: '#e0e0e0', fontWeight: 600, marginBottom: 8 }}>
        建造房间 (金钱: {player.resources.money})
      </div>
      {availableRooms.length === 0 ? (
        <div style={{ color: '#666', fontSize: 12, textAlign: 'center', padding: 16 }}>
          所有房间已被建造
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {availableRooms.map((r: any) => {
            const affordable = (player.resources.money ?? 0) >= (r.cost?.money ?? 0)
            return (
              <div key={r.id} onClick={affordable ? () => constructRoom(r.id) : undefined} style={{
                background: '#2a2a4a', border: '1px solid ' + (affordable ? '#4a7db5' : '#3a3a3a'),
                borderRadius: 8, padding: 8, minWidth: 80,
                cursor: affordable ? 'pointer' : 'not-allowed',
                opacity: affordable ? 1 : 0.35,
              }}>
                <div style={{ color: '#e0e0e0', fontWeight: 600, fontSize: 11 }}>{r.name}</div>
                <div style={{ color: '#f1c40f', fontSize: 10 }}>+{r.victoryPoints}分</div>
                <div style={{ fontSize: 9, color: '#f39c12' }}>{'💰' + (r.cost?.money ?? 0)}</div>
                <div style={{ fontSize: 9, color: '#666' }}>容量:{r.capacity}</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ════════════════════════════════════════
// Staff Tab
// ════════════════════════════════════════

function StaffTab({ availableStaff, player, hireStaffMember }: {
  availableStaff: any[]; player: any; hireStaffMember: (id: string) => void
}) {
  return (
    <div>
      <div style={{ fontSize: 13, color: '#e0e0e0', fontWeight: 600, marginBottom: 8 }}>
        雇佣员工 (金钱: {player.resources.money})
      </div>
      {availableStaff.length === 0 ? (
        <div style={{ color: '#666', fontSize: 12, textAlign: 'center', padding: 16 }}>
          没有可雇佣的员工
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {availableStaff.map((s: any) => {
            const affordable = player.resources.money >= s.cost
            return (
              <div key={s.id} onClick={affordable ? () => hireStaffMember(s.id) : undefined} style={{
                background: '#2a2a4a', border: '1px solid ' + (affordable ? '#4a7db5' : '#3a3a3a'),
                borderRadius: 8, padding: 8, minWidth: 100,
                cursor: affordable ? 'pointer' : 'not-allowed',
                opacity: affordable ? 1 : 0.35,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#e0e0e0', fontWeight: 600, fontSize: 12 }}>{s.name}</span>
                  <span style={{ color: '#f1c40f', fontSize: 10 }}>+{s.victoryPoints}</span>
                </div>
                <div style={{ fontSize: 10, color: '#888' }}>{s.description}</div>
                <div style={{ fontSize: 10, color: '#f39c12' }}>{'💰' + s.cost}</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ════════════════════════════════════════
// Room Picker Inline
// ════════════════════════════════════════

function RoomPickerInline({ onSelect, onBack }: {
  onSelect: (roomId: string, slotRow: number, slotCol: number) => void
  onBack: () => void
}) {
  const rooms = useGameStore(s => s.availableRooms)
  const player = useGameStore(s => s.players[s.currentPlayerIndex])
  const [pickedId, setPickedId] = useState<string | null>(null)

  const pickedRoom = pickedId ? rooms.find((r: any) => r.id === pickedId) : null

  if (pickedRoom && pickedId) {
    return (
      <div style={{ background: '#0f0f1a', borderRadius: 10, padding: 16, border: '1px solid #3a3a5a', marginTop: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 14, color: '#e0e0e0', fontWeight: 600 }}>
            {'🏗️ 放置 ' + pickedRoom.name}
          </span>
          <button onClick={() => setPickedId(null)}
            style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 12 }}>
            {'<- 选择其他'}
          </button>
        </div>
        <div style={{ fontSize: 12, color: '#aaa', marginBottom: 10 }}>
          选择空位放置 (同色相邻)
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, marginBottom: 8,
        }}>
          {player.roomSlots.map((slot: any, i: number) => {
            const canPlace = slot.roomId === null &&
              slot.color === pickedRoom.color &&
              player.roomSlots.some((s: any) => s.roomId && Math.abs(s.row - slot.row) + Math.abs(s.col - slot.col) === 1)
            return (
              <div key={i} onClick={canPlace ? () => onSelect(pickedId, slot.row, slot.col) : undefined} style={{
                width: '100%', aspectRatio: '1', borderRadius: 6,
                background: slot.roomId ? (slot.color === 'blue' ? '#1a2744' : slot.color === 'yellow' ? '#3a3520' : '#3a1a1a') :
                  canPlace ? '#2a3a2a' : '#1a1a2e',
                border: '1px solid ' + (canPlace ? '#2ecc71' : slot.roomId ? '#4a7db5' : '#2a2a4a'),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, color: canPlace ? '#2ecc71' : '#666',
                cursor: canPlace ? 'pointer' : 'default',
                fontWeight: canPlace ? 600 : 400,
              }}>
                {slot.roomId ? '🏠' : canPlace ? '+' : ''}
              </div>
            )
          })}
        </div>
        <button onClick={onBack}
          style={{ marginTop: 4, background: 'none', border: '1px solid #4a4a6a', borderRadius: 6, padding: '6px 16px', color: '#888', cursor: 'pointer', fontSize: 12 }}>
          {'<- 返回'}
        </button>
      </div>
    )
  }

  return (
    <div style={{ background: '#0f0f1a', borderRadius: 10, padding: 16, border: '1px solid #3a3a5a', marginTop: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 14, color: '#e0e0e0', fontWeight: 600 }}>🏗️ 选择房间</span>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 12 }}>
          {'<- 返回'}
        </button>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {rooms.length === 0 && (
          <div style={{ color: '#666', fontSize: 12, padding: 12, textAlign: 'center', width: '100%' }}>
            没有可用房间
          </div>
        )}
        {rooms.slice(0, 8).map((r: any) => {
          const affordable = (player.resources.money ?? 0) >= (r.cost?.money ?? 0)
          return (
            <div key={r.id} onClick={affordable ? () => setPickedId(r.id) : undefined} style={{
              background: pickedId === r.id ? '#1a2744' : '#2a2a4a',
              border: '1px solid ' + (affordable ? '#4a7db5' : '#3a3a3a'),
              borderRadius: 8, padding: '6px 10px',
              cursor: affordable ? 'pointer' : 'not-allowed',
              opacity: affordable ? 1 : 0.35, minWidth: 80,
            }}>
              <div style={{ color: '#e0e0e0', fontWeight: 600, fontSize: 11 }}>{r.name}</div>
              <div style={{ color: '#f1c40f', fontSize: 10 }}>+{r.victoryPoints}分</div>
              <div style={{ fontSize: 9, color: '#f39c12' }}>{'💰' + (r.cost?.money ?? 0)}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ════════════════════════════════════════
// Staff Picker Inline
// ════════════════════════════════════════

function StaffPickerInline({ n, onSelect, onBack }: {
  n: number; onSelect: (staffId: string) => void; onBack: () => void
}) {
  const staff = useGameStore(s => s.availableStaff)
  const player = useGameStore(s => s.players[s.currentPlayerIndex])
  const discount = n

  return (
    <div style={{ background: '#0f0f1a', borderRadius: 10, padding: 16, border: '1px solid #3a3a5a', marginTop: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 14, color: '#e0e0e0', fontWeight: 600 }}>
          {'👔 选择员工 (折扣' + discount + '元)'}
        </span>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 12 }}>
          {'<- 返回'}
        </button>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {staff.length === 0 && (
          <div style={{ color: '#666', fontSize: 12, padding: 12, textAlign: 'center', width: '100%' }}>
            没有可雇佣的员工
          </div>
        )}
        {staff.slice(0, 8).map((s: any) => {
          const finalCost = Math.max(0, s.cost - discount)
          const affordable = player.resources.money >= finalCost
          return (
            <div key={s.id} onClick={affordable ? () => onSelect(s.id) : undefined} style={{
              background: '#2a2a4a', border: '1px solid ' + (affordable ? '#4a7db5' : '#3a3a3a'),
              borderRadius: 8, padding: '6px 10px',
              cursor: affordable ? 'pointer' : 'not-allowed',
              opacity: affordable ? 1 : 0.35, minWidth: 100,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#e0e0e0', fontWeight: 600, fontSize: 12 }}>{s.name}</span>
                <span style={{ color: '#f1c40f', fontSize: 10 }}>+{s.victoryPoints}</span>
              </div>
              <div style={{ fontSize: 10, color: '#888' }}>{s.description}</div>
              <div style={{ fontSize: 10, color: affordable ? '#f39c12' : '#e74c3c' }}>
                {'💰' + finalCost} {discount > 0 && <span style={{ color: '#666', textDecoration: 'line-through', marginLeft: 2 }}>({s.cost})</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
