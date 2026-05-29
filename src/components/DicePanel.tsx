import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { getActionAreaCounts } from '../game-logic/engine'

const DIE_COLORS: Record<number, string> = {
  1: '#e74c3c', 2: '#e67e22', 3: '#f1c40f', 4: '#2ecc71', 5: '#3498db', 6: '#9b59b6',
}

const AREA_CONFIG: Record<number, { name: string; desc: string; color: string; icon: string }> = {
  1: { name: '食材市场', desc: '取食物或蛋糕', color: '#e74c3c', icon: '🥖' },
  2: { name: '酒水市场', desc: '取红酒或咖啡', color: '#e67e22', icon: '🍷' },
  3: { name: '建造局', desc: '建造一个房间', color: '#f1c40f', icon: '🏗️' },
  4: { name: '皇帝觐见', desc: '皇帝轨道或金钱', color: '#2ecc71', icon: '👑' },
  5: { name: '人力市场', desc: '雇佣员工(折扣)', color: '#3498db', icon: '👔' },
  6: { name: '黑市', desc: '花1元模拟其他区', color: '#9b59b6', icon: '🕶️' },
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
  const takeAreaAction = useGameStore(s => s.takeAreaAction)

  const [selectedArea, setSelectedArea] = useState<number | null>(null)
  const [showRoomPicker, setShowRoomPicker] = useState(false)
  const [showStaffPicker, setShowStaffPicker] = useState(false)
  const [splitValue, setSplitValue] = useState(0)
  const [wildSubArea, setWildSubArea] = useState(1)
  const [wildSplitValue, setWildSplitValue] = useState(0)

  const currentPlayer = players[currentIdx]
  const hasRolled = dice.some(d => d.value > 0)
  const areaCounts = getActionAreaCounts(dice)
  const unusedDice = dice.filter(d => d.value > 0 && !d.used)
  const n = selectedArea ? areaCounts[selectedArea] : 0
  const cfg = selectedArea ? AREA_CONFIG[selectedArea] : null

  if (phase === 'action') {
    return null
  }

  if (phase === 'dice_roll') {
    return (
      <div style={{
        background: '#1a1a2e', borderRadius: 12, padding: 20, border: '1px solid #2a2a4a',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, color: '#e0e0e0', fontSize: 18, fontWeight: 600 }}>
              🎲 骰子区 ({dice.length}颗)
            </h3>
            <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
              {currentPlayer.name} 掷骰阶段
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
          {dice.map(die => (
            <div
              key={die.id}
              onClick={hasRolled ? () => lockDie(die.id) : undefined}
              style={{
                width: 48, height: 48, borderRadius: 10,
                background: die.value ? DIE_COLORS[die.value] : '#2a2a4a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: hasRolled ? 'pointer' : 'not-allowed',
                opacity: 1,
                border: die.kept ? '3px solid #fff' : '3px solid transparent',
                transition: 'all 0.15s',
                color: '#fff', fontWeight: 'bold', fontSize: 18,
              }}
            >
              {die.value > 0 ? die.value : '?'}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {!hasRolled && (
            <ActionBtn onClick={rollDice} label="🎲 掷骰子" />
          )}
          {hasRolled && (
            <>
              <ActionBtn onClick={rerollDice} label="🔄 重掷未锁定" />
              <ActionBtn onClick={confirmDice} label="✅ 确认分配" primary />
            </>
          )}
        </div>
      </div>
    )
  }

  if (phase === 'dice_draft') {
    return (
      <div style={{
        background: '#1a1a2e', borderRadius: 12, padding: 20, border: '1px solid #2a2a4a',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, color: '#e0e0e0', fontSize: 18, fontWeight: 600 }}>
              🎯 行动区选择
            </h3>
            <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
              {currentPlayer.name} 请选择一个行动区（剩余{unusedDice.length}颗骰子）
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[1, 2, 3, 4, 5, 6].map(area => {
            const c = AREA_CONFIG[area]
            const count = areaCounts[area]
            const canAct = count > 0
            return (
              <div key={area} onClick={canAct ? () => {
                setSelectedArea(area)
                setShowRoomPicker(false)
                setShowStaffPicker(false)
                setSplitValue(0)
                setWildSubArea(1)
                setWildSplitValue(0)
              } : undefined} style={{
                background: canAct ? '#2a2a4a' : '#1a1a2e',
                border: `1px solid ${canAct ? c.color : '#2a2a4a'}`,
                borderRadius: 10, padding: 12,
                cursor: canAct ? 'pointer' : 'not-allowed',
                opacity: canAct ? 1 : 0.3,
                transition: 'all 0.15s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 20 }}>{c.icon}</span>
                  <span style={{
                    background: c.color, color: '#fff', borderRadius: 12,
                    minWidth: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 15, fontWeight: 'bold',
                  }}>{count}</span>
                </div>
                <div style={{ color: '#e0e0e0', fontWeight: 600, fontSize: 13 }}>{c.name}</div>
                <div style={{ color: '#888', fontSize: 11, marginTop: 2 }}>{c.desc}</div>
              </div>
            )
          })}
        </div>

        {selectedArea === 3 && !showRoomPicker && (
          <AreaSplitDialog area={3} n={n} cfg={cfg!} onExecute={() => setShowRoomPicker(true)} onCancel={() => setSelectedArea(null)} />
        )}
        {selectedArea === 3 && showRoomPicker && (
          <RoomPicker onSelect={(roomId) => { takeAreaAction(3, roomId); setSelectedArea(null); setShowRoomPicker(false) }} onBack={() => setShowRoomPicker(false)} />
        )}

        {selectedArea === 5 && !showStaffPicker && (
          <AreaSplitDialog area={5} n={n} cfg={cfg!} onExecute={() => setShowStaffPicker(true)} onCancel={() => setSelectedArea(null)} />
        )}
        {selectedArea === 5 && showStaffPicker && (
          <StaffPicker n={n} onSelect={(staffId) => { takeAreaAction(5, staffId); setSelectedArea(null); setShowStaffPicker(false) }} onBack={() => setShowStaffPicker(false)} />
        )}

        {(selectedArea === 1 || selectedArea === 2 || selectedArea === 4) && (
          <AreaSplitDialog area={selectedArea} n={n} cfg={cfg!}
            splitValue={splitValue} setSplitValue={setSplitValue}
            onExecute={() => { takeAreaAction(selectedArea, String(splitValue)); setSelectedArea(null) }}
            onCancel={() => setSelectedArea(null)} />
        )}

        {selectedArea === 6 && (
          <WildCardDialog n={n}
            wildSubArea={wildSubArea} setWildSubArea={setWildSubArea}
            wildSplitValue={wildSplitValue} setWildSplitValue={setWildSplitValue}
            onExecute={() => {
              const subAction = (wildSubArea === 1 || wildSubArea === 2 || wildSubArea === 4)
                ? `${wildSubArea}|${wildSplitValue}`
                : `${wildSubArea}|`
              takeAreaAction(6, subAction)
              setSelectedArea(null)
            }}
            onCancel={() => setSelectedArea(null)} />
        )}
      </div>
    )
  }

  return null
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

function AreaSplitDialog({ area, n, cfg, splitValue, setSplitValue, onExecute, onCancel }: {
  area: number; n: number; cfg: { name: string; desc: string; color: string; icon: string }
  splitValue?: number; setSplitValue?: (v: number) => void
  onExecute: () => void; onCancel: () => void
}) {
  const [localSplit, setLocalSplit] = useState(0)
  const sv = setSplitValue ? splitValue! : localSplit
  const setSv = setSplitValue ?? setLocalSplit

  return (
    <div style={{
      background: '#0f0f1a', borderRadius: 10, padding: 16,
      border: '1px solid #3a3a5a', marginTop: 12,
    }}>
      <div style={{ fontSize: 14, color: '#e0e0e0', fontWeight: 600, marginBottom: 8 }}>
        {cfg.icon} {cfg.name}
      </div>
      <div style={{ fontSize: 12, color: '#aaa', marginBottom: 12 }}>
        骰子数量: {n}
        {area !== 3 && area !== 5 ? ' | 拖动滑块分配' : ''}
      </div>

      {area === 1 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>
            蛋糕数量 (剩余自动为食物): {sv}
          </div>
          <input type="range" min={0} max={n} value={sv}
            onChange={e => setSv(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: cfg.color }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#666' }}>
            <span>🥖 食物×{n - sv}</span>
            <span>🍰 蛋糕×{sv}</span>
          </div>
        </div>
      )}

      {area === 2 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>
            咖啡数量 (剩余自动为红酒): {sv}
          </div>
          <input type="range" min={0} max={n} value={sv}
            onChange={e => setSv(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: cfg.color }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#666' }}>
            <span>🍷 红酒×{n - sv}</span>
            <span>☕ 咖啡×{sv}</span>
          </div>
        </div>
      )}

      {area === 4 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>
            皇帝轨道步数 (剩余自动为金钱): {sv}
          </div>
          <input type="range" min={0} max={n} value={sv}
            onChange={e => setSv(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: cfg.color }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#666' }}>
            <span>💰 金钱×{n - sv}</span>
            <span>👑 皇帝+{sv}</span>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        {(area === 1 || area === 2 || area === 4) && (
          <ActionBtn onClick={onExecute} label={`✅ 执行 (×${n})`} primary />
        )}
        {(area === 3) && (
          <ActionBtn onClick={onExecute} label="🏗️ 选择房间" primary />
        )}
        {(area === 5) && (
          <ActionBtn onClick={onExecute} label="👔 选择员工" primary />
        )}
        <ActionBtn onClick={onCancel} label="取消" />
      </div>
    </div>
  )
}

function RoomPicker({ onSelect, onBack }: { onSelect: (roomId: string) => void; onBack: () => void }) {
  const rooms = useGameStore.getState().availableRooms
  const player = useGameStore.getState().players[useGameStore.getState().currentPlayerIndex]

  return (
    <div style={{
      background: '#0f0f1a', borderRadius: 10, padding: 16,
      border: '1px solid #3a3a5a', marginTop: 12,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 14, color: '#e0e0e0', fontWeight: 600 }}>🏗️ 选择要建造的房间</span>
        <button onClick={onBack}
          style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 12 }}>
          ← 返回
        </button>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {rooms.length === 0 && (
          <div style={{ color: '#666', fontSize: 12, padding: 12, textAlign: 'center', width: '100%' }}>
            没有可用房间
          </div>
        )}
        {rooms.map(r => {
          const affordable = (player.resources.money ?? 0) >= (r.cost.money ?? 0)
          return (
            <div key={r.id} onClick={affordable ? () => onSelect(r.id) : undefined} style={{
              background: '#2a2a4a', border: `1px solid ${affordable ? '#4a7db5' : '#3a3a3a'}`,
              borderRadius: 8, padding: '6px 10px',
              cursor: affordable ? 'pointer' : 'not-allowed',
              opacity: affordable ? 1 : 0.35, minWidth: 80,
            }}>
              <div style={{ color: '#e0e0e0', fontWeight: 600, fontSize: 11 }}>{r.name}</div>
              <div style={{ color: '#f1c40f', fontSize: 10 }}>+{r.victoryPoints}分</div>
              <div style={{ fontSize: 9, color: '#f39c12' }}>💰{r.cost.money}</div>
              <div style={{ fontSize: 9, color: '#666' }}>房间数:{r.capacity}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StaffPicker({ n, onSelect, onBack }: { n: number; onSelect: (staffId: string) => void; onBack: () => void }) {
  const staff = useGameStore.getState().availableStaff
  const player = useGameStore.getState().players[useGameStore.getState().currentPlayerIndex]
  const discount = n

  return (
    <div style={{
      background: '#0f0f1a', borderRadius: 10, padding: 16,
      border: '1px solid #3a3a5a', marginTop: 12,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 14, color: '#e0e0e0', fontWeight: 600 }}>
          👔 选择员工 (骰子{5}折扣{discount}元)
        </span>
        <button onClick={onBack}
          style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 12 }}>
          ← 返回
        </button>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {staff.length === 0 && (
          <div style={{ color: '#666', fontSize: 12, padding: 12, textAlign: 'center', width: '100%' }}>
            没有可雇佣的员工
          </div>
        )}
        {staff.map(s => {
          const finalCost = Math.max(0, s.cost - discount)
          const affordable = player.resources.money >= finalCost
          return (
            <div key={s.id} onClick={affordable ? () => onSelect(s.id) : undefined} style={{
              background: '#2a2a4a', border: `1px solid ${affordable ? '#4a7db5' : '#3a3a3a'}`,
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
                💰{finalCost} {discount > 0 && <span style={{ color: '#666', textDecoration: 'line-through', marginLeft: 2 }}>({s.cost})</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function WildCardDialog({ n, wildSubArea, setWildSubArea, wildSplitValue, setWildSplitValue, onExecute, onCancel }: {
  n: number; wildSubArea: number; setWildSubArea: (v: number) => void
  wildSplitValue: number; setWildSplitValue: (v: number) => void
  onExecute: () => void; onCancel: () => void
}) {
  return (
    <div style={{
      background: '#0f0f1a', borderRadius: 10, padding: 16,
      border: '1px solid #3a3a5a', marginTop: 12,
    }}>
      <div style={{ fontSize: 14, color: '#e0e0e0', fontWeight: 600, marginBottom: 8 }}>
        🕶️ 黑市 (花1元模拟其他区)
      </div>
      <div style={{ fontSize: 12, color: '#aaa', marginBottom: 8 }}>
        骰子数量: {n} | 花1元选择要模拟的行动区
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {[1, 2, 3, 4, 5].map(a => (
          <div key={a} onClick={() => {
            setWildSubArea(a)
            setWildSplitValue(0)
          }}
            style={{
              padding: '6px 14px', borderRadius: 6,
              background: wildSubArea === a ? '#3a3a5a' : '#2a2a4a',
              border: `1px solid ${wildSubArea === a ? AREA_CONFIG[a].color : '#4a4a6a'}`,
              cursor: 'pointer', color: '#e0e0e0', fontSize: 12, fontWeight: wildSubArea === a ? 600 : 400,
            }}>
            {AREA_CONFIG[a].icon} 区{a}
          </div>
        ))}
      </div>

      {(wildSubArea === 1 || wildSubArea === 2 || wildSubArea === 4) && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>
            {wildSubArea === 1 ? '蛋糕数量' : wildSubArea === 2 ? '咖啡数量' : '皇帝步数'}: {wildSplitValue}
          </div>
          <input type="range" min={0} max={n} value={wildSplitValue}
            onChange={e => setWildSplitValue(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: AREA_CONFIG[wildSubArea].color }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#666' }}>
            <span>{wildSubArea === 1 ? '🥖 食物' : wildSubArea === 2 ? '🍷 红酒' : '💰 金钱'}×{n - wildSplitValue}</span>
            <span>{wildSubArea === 1 ? '🍰 蛋糕' : wildSubArea === 2 ? '☕ 咖啡' : '👑 皇帝'}+{wildSplitValue}</span>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <ActionBtn onClick={onExecute} label={`✅ 花1元执行区${wildSubArea}`} primary />
        <ActionBtn onClick={onCancel} label="取消" />
      </div>
    </div>
  )
}
