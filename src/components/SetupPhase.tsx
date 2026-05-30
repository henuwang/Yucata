import { useState } from 'react'
import { useGameStore } from '../store/gameStore'

export function SetupStaffPhase() {
  const phase = useGameStore(s => s.phase)
  const setupPlayerIndex = useGameStore(s => s.setupPlayerIndex)
  const players = useGameStore(s => s.players)
  const drawStaffCards = useGameStore(s => s.drawStaffCards)
  const pickStaffCard = useGameStore(s => s.pickStaffCard)

  if (phase !== 'setup_staff') return null

  const currentPlayer = players[setupPlayerIndex]
  const needsDeal = players.every(p => p.draftHand.length === 0)

  if (needsDeal) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.85)',
      }}>
        <div style={{
          background: '#1a1a2e', borderRadius: 16, padding: 32, maxWidth: 400, width: '90%',
          border: '1px solid #4a4a6a', textAlign: 'center',
        }}>
          <h2 style={{ color: '#f1c40f', margin: '0 0 6px 0', fontSize: 20 }}>
            初始设置 - 抽取员工卡
          </h2>
          <p style={{ color: '#888', margin: '0 0 20px 0', fontSize: 13 }}>
            每位玩家将获得6张员工卡，按顺序轮流挑选
          </p>
          <button
            onClick={drawStaffCards}
            style={{
              background: 'linear-gradient(135deg, #4A90D9, #357ABD)',
              color: '#fff', border: 'none', borderRadius: 10, padding: '14px 40px',
              fontSize: 16, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
          >
            发牌
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.85)',
    }}>
      <div style={{
        background: '#1a1a2e', borderRadius: 16, padding: 28, maxWidth: 700, width: '95%',
        border: '1px solid #4a4a6a',
      }}>
        <h2 style={{ color: '#f1c40f', margin: '0 0 4px 0', fontSize: 17 }}>
          初始设置 - 选择员工卡
        </h2>
        <p style={{ color: '#888', margin: '0 0 12px 0', fontSize: 12 }}>
          按顺序每人从手牌中选择1张保留
        </p>

        <div style={{
          background: '#16213e', borderRadius: 10, padding: 12, marginBottom: 14,
          border: '1px solid #2a2a4a',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ color: currentPlayer.color, fontSize: 20 }}>●</span>
            <span style={{ color: '#e0e0e0', fontWeight: 600, fontSize: 15 }}>
              {currentPlayer.name}
            </span>
            <span style={{ color: '#f1c40f', fontSize: 12 }}>
              (已选 {currentPlayer.staffCards.length}/6)
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {players.map(p => (
              <div key={p.id} style={{
                fontSize: 11, color: p.staffCards.length >= 6 ? '#aaa' : '#666',
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <span style={{ color: p.color }}>●</span>
                {p.name}: {p.staffCards.length}/6
                {p.staffCards.length >= 6 && ' ✅'}
              </div>
            ))}
          </div>
        </div>

        {currentPlayer.draftHand.length > 0 && (
          <p style={{ color: '#f1c40f', fontSize: 12, marginBottom: 8, textAlign: 'center' }}>
            请从以下 {currentPlayer.draftHand.length} 张手牌中选择1张
          </p>
        )}

        {currentPlayer.draftHand.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
            {currentPlayer.draftHand.map(card => (
              <button
                key={card.id}
                onClick={() => pickStaffCard(card.id)}
                style={{
                  background: '#16213e', border: '1px solid #2a2a4a', borderRadius: 10, padding: 10,
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                  display: 'flex', flexDirection: 'column', gap: 4,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = currentPlayer.color; e.currentTarget.style.background = '#1a2744' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a4a'; e.currentTarget.style.background = '#16213e' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#e0e0e0', fontWeight: 600, fontSize: 12 }}>{card.name}</span>
                  <span style={{ color: '#888', fontSize: 9 }}>
                    {card.timing === 'one_time' ? '一次性' : card.timing === 'once_per_round' ? '每轮' : card.timing === 'permanent' ? '永久' : '终局'}
                  </span>
                </div>
                <div style={{ fontSize: 10, color: '#888', lineHeight: 1.3 }}>{card.description}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                  <span style={{ color: '#f39c12' }}>💰{card.cost}</span>
                  <span style={{ color: '#2ecc71' }}>+{card.victoryPoints}分</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function SetupGuestPhase() {
  const phase = useGameStore(s => s.phase)
  const setupPlayerIndex = useGameStore(s => s.setupPlayerIndex)
  const players = useGameStore(s => s.players)
  const availableGuests = useGameStore(s => s.availableGuests)
  const logs = useGameStore(s => s.logs)

  if (phase !== 'setup_guest') return null

  const currentPlayer = players[setupPlayerIndex]

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.85)',
    }}>
      <div style={{
        background: '#1a1a2e', borderRadius: 16, padding: 32, maxWidth: 600, width: '90%',
        border: '1px solid #4a4a6a',
      }}>
        <h2 style={{ color: '#f1c40f', margin: '0 0 6px 0', fontSize: 20 }}>
          游戏初始设置 - 邀请客人
        </h2>
        <p style={{ color: '#888', margin: '0 0 16px 0', fontSize: 13 }}>
          逆时针顺序，每位玩家免费邀请一位客人到自己的咖啡厅
        </p>

        <div style={{
          background: '#16213e', borderRadius: 10, padding: 12, marginBottom: 16,
          border: '1px solid #2a2a4a',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ color: currentPlayer.color, fontSize: 20 }}>●</span>
            <span style={{ color: '#e0e0e0', fontWeight: 600 }}>{currentPlayer.name}</span>
            <span style={{ color: '#f1c40f', fontSize: 12 }}>(请选择一位客人)</span>
          </div>

          {players.map(p => (
            <div key={p.id} style={{
              fontSize: 12, color: p.guestWaitingArea.length > 0 ? '#aaa' : '#555',
              margin: '2px 0', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ color: p.color }}>●</span>
              {p.name}: {p.guestWaitingArea.length > 0
                ? `已邀请 ${p.guestWaitingArea[0].name}`
                : '待邀请'}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
          {availableGuests.map(guest => (
            <SetupGuestCard key={guest.id} guest={guest} playerColor={currentPlayer.color} />
          ))}
        </div>

        <div style={{ marginTop: 12, maxHeight: 80, overflowY: 'auto', fontSize: 11, color: '#666' }}>
          {logs.slice(-3).join('\n')}
        </div>
      </div>
    </div>
  )
}

function SetupGuestCard({ guest, playerColor }: { guest: any; playerColor: string }) {
  const pickSetupGuest = useGameStore(s => s.pickSetupGuest)

  return (
    <button
      onClick={() => pickSetupGuest(guest.id)}
      style={{
        background: '#16213e', border: '1px solid #2a2a4a', borderRadius: 10, padding: 12,
        cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
        display: 'flex', flexDirection: 'column', gap: 4,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = playerColor; e.currentTarget.style.background = '#1a2744' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a4a'; e.currentTarget.style.background = '#16213e' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#e0e0e0', fontWeight: 600, fontSize: 13 }}>{guest.name}</span>
        <span style={guestColorStyle(guest.color)}>{guest.color === 'blue' ? '贵族' : guest.color === 'yellow' ? '艺术家' : guest.color === 'red' ? '市民' : '旅客'}</span>
      </div>
      <div style={{ fontSize: 11, color: '#888' }}>
        需求: {guest.requirements.map((r: any) => `${r.type}×${r.amount}`).join(' ')}
      </div>
      <div style={{ fontSize: 11, color: '#2ecc71' }}>
        VP: {guest.victoryPoints} | 费用: {guest.guestCost}
      </div>
      {guest.bonusResource && (
        <div style={{ fontSize: 10, color: '#e67e22' }}>
          奖励: +{guest.bonusAmount} {guest.bonusResource}
        </div>
      )}
    </button>
  )
}

export function SetupRoomPhase() {
  const phase = useGameStore(s => s.phase)
  const setupPlayerIndex = useGameStore(s => s.setupPlayerIndex)
  const players = useGameStore(s => s.players)
  const availableRooms = useGameStore(s => s.availableRooms)
  const logs = useGameStore(s => s.logs)
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)

  if (phase !== 'setup_room') return null

  const currentPlayer = players[setupPlayerIndex]
  const selectedRoom = availableRooms.find(r => r.id === selectedRoomId)

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.85)',
    }}>
      <div style={{
        background: '#1a1a2e', borderRadius: 16, padding: 28, maxWidth: 820, width: '95%',
        maxHeight: '90vh', overflowY: 'auto',
        border: '1px solid #4a4a6a',
      }}>
        <h2 style={{ color: '#f1c40f', margin: '0 0 4px 0', fontSize: 18 }}>
          初始设置 - 准备客房
        </h2>
        <p style={{ color: '#888', margin: '0 0 12px 0', fontSize: 12 }}>
          从最后玩家开始逆时针，从版图左下角放置客房（最多3个），支付版图位置费用
        </p>

        <div style={{
          background: '#16213e', borderRadius: 10, padding: 10, marginBottom: 12,
          border: '1px solid #2a2a4a',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ color: currentPlayer.color, fontSize: 18 }}>●</span>
            <span style={{ color: '#e0e0e0', fontWeight: 600, fontSize: 14 }}>{currentPlayer.name}</span>
            <span style={{ color: '#f1c40f', fontSize: 12 }}>
              已准备 {currentPlayer.setupRoomCount}/3 | 💰{currentPlayer.resources.money}元
            </span>
            {currentPlayer.setupRoomCount < 3 && (
              <button
                onClick={() => useGameStore.getState().skipSetupRoom()}
                style={{
                  marginLeft: 'auto', background: '#e74c3c44', color: '#e74c3c', border: '1px solid #e74c3c',
                  borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: 11,
                }}
              >
                跳过
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {players.map(p => (
              <div key={p.id} style={{
                fontSize: 11, color: '#aaa',
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <span style={{ color: p.color }}>●</span>
                {p.name}: {p.setupRoomCount}房 💰{p.resources.money}元
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: '0 0 200px' }}>
            <h3 style={{ color: '#e0e0e0', fontSize: 13, margin: '0 0 8px 0' }}>
              可选客房
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {availableRooms.map(room => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.id === selectedRoomId ? null : room.id)}
                  style={{
                    background: room.id === selectedRoomId ? '#1a2744' : '#16213e',
                    border: `1px solid ${room.id === selectedRoomId ? '#4a7db5' : '#2a2a4a'}`,
                    borderRadius: 6, padding: '6px 8px', cursor: 'pointer',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = roomColorBorder(room.color) }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = room.id === selectedRoomId ? '#4a7db5' : '#2a2a4a' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: 3,
                      background: roomColorBorder(room.color),
                    }} />
                    <span style={{ color: '#e0e0e0', fontSize: 11, fontWeight: 500 }}>{room.name}</span>
                  </div>
                  <span style={{ color: '#f1c40f', fontSize: 10 }}>
                    {room.cost.money}元
                  </span>
                </button>
              ))}
            </div>
            {selectedRoom && (
              <div style={{
                background: '#1a2744', border: '1px solid #4a7db5', borderRadius: 6,
                padding: 8, marginTop: 8, fontSize: 11,
              }}>
                <div style={{ color: '#e0e0e0' }}>已选: {selectedRoom.name}</div>
                <div style={{ color: '#888' }}>VP: {selectedRoom.victoryPoints}</div>
                <div style={{ color: '#888' }}>容量: {selectedRoom.capacity}人</div>
              </div>
            )}
          </div>

          <div style={{ flex: 1 }}>
            <h3 style={{ color: '#e0e0e0', fontSize: 13, margin: '0 0 8px 0', textAlign: 'center' }}>
              酒店版图
            </h3>
            <HotelBoardGrid selectedRoomId={selectedRoomId} onRoomPlaced={() => setSelectedRoomId(null)} />
          </div>
        </div>

        <div style={{ marginTop: 10, maxHeight: 50, overflowY: 'auto', fontSize: 10, color: '#666' }}>
          {logs.slice(-3).join('\n')}
        </div>
      </div>
    </div>
  )
}

function HotelBoardGrid({ selectedRoomId, onRoomPlaced }: { selectedRoomId: string | null; onRoomPlaced: () => void }) {
  const players = useGameStore(s => s.players)
  const setupPlayerIndex = useGameStore(s => s.setupPlayerIndex)
  const availableRooms = useGameStore(s => s.availableRooms)
  const player = players[setupPlayerIndex]

  const placeSetupRoom = useGameStore(s => s.placeSetupRoom)

  const renderSlot = (slot: any) => {
    const isOccupied = slot.roomId !== null
    const canPlace = !isOccupied && selectedRoomId &&
      availableRooms.some(r => r.id === selectedRoomId && r.color === slot.color) &&
      player.resources.money >= slot.cost

    const isAdjacent = player.roomSlots.some(s =>
      s.roomId &&
      Math.abs(s.row - slot.row) + Math.abs(s.col - slot.col) === 1
    )

    const isValidStart = player.setupRoomCount === 0 && slot.row === 0 && slot.col === 0

    const occupiedRoom = isOccupied ? player.builtRooms.find(r => r.id === slot.roomId) : null

    const isHighlighted = canPlace && (isValidStart || isAdjacent)

    return (
      <button
        key={`${slot.row}-${slot.col}`}
        onClick={() => {
          if (canPlace && (isValidStart || isAdjacent || player.setupRoomCount === 0)) {
            placeSetupRoom(selectedRoomId!, slot.row, slot.col)
            onRoomPlaced()
          }
        }}
        style={{
          width: 70, height: 52,
          background: isOccupied
            ? (occupiedRoom ? slotColor(slot.color) : '#2a2a4a')
            : (isHighlighted ? '#1a3a2a' : '#1a1a2e'),
          border: `2px solid ${
            isOccupied ? roomColorBorder(slot.color)
            : isHighlighted ? '#2ecc71'
            : '#2a2a4a'
          }`,
          borderRadius: 6, cursor: isHighlighted ? 'pointer' : 'default',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, color: isOccupied ? '#fff' : '#666',
          opacity: (!isOccupied && !isHighlighted && selectedRoomId) ? 0.35 : 1,
          transition: 'all 0.2s',
          position: 'relative',
        }}
        onMouseEnter={e => {
          if (isHighlighted) e.currentTarget.style.borderColor = '#f1c40f'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = isOccupied
            ? roomColorBorder(slot.color)
            : isHighlighted ? '#2ecc71' : '#2a2a4a'
        }}
      >
        {isOccupied && occupiedRoom ? (
          <>
            <span style={{ fontWeight: 600, fontSize: 10 }}>{occupiedRoom.name}</span>
            <span style={{ fontSize: 8, opacity: 0.7 }}>🛏️{occupiedRoom.capacity}</span>
          </>
        ) : (
          <>
            <span style={{ fontSize: 10, fontWeight: 600, color: '#f1c40f' }}>{slot.cost}元</span>
            <div style={{
              width: 8, height: 8, borderRadius: 2, marginTop: 2,
              background: slotColor(slot.color),
            }} />
          </>
        )}
      </button>
    )
  }

  const rowLayouts = [3, 2, 1, 0]

  return (
    <div style={{
      background: '#0f0f1a', borderRadius: 12, padding: 12,
      border: '1px solid #2a2a4a',
    }}>
      <div style={{
        fontSize: 9, color: '#555', marginBottom: 6, textAlign: 'center', letterSpacing: 3,
      }}>
        ─── Grand Austria Hotel ───
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
        {rowLayouts.map(row => {
          const slots = player.roomSlots
            .filter(s => s.row === row)
            .sort((a, b) => a.col - b.col)
          return (
            <div key={row} style={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
              {slots.map(renderSlot)}
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 6, fontSize: 9 }}>
        <span style={{ color: '#e74c3c' }}>■ 红色区</span>
        <span style={{ color: '#f1c40f' }}>■ 黄色区</span>
        <span style={{ color: '#4A90D9' }}>■ 蓝色区</span>
        <span style={{ color: '#888' }}>红7 黄6 蓝7</span>
      </div>
      {!selectedRoomId && player.setupRoomCount < 3 && (
        <p style={{ color: '#888', fontSize: 10, textAlign: 'center', margin: '5px 0 0 0' }}>
          左侧选择一个客房 → 再点击版图上的空位放置
        </p>
      )}
      {selectedRoomId && player.setupRoomCount < 3 && (
        <p style={{ color: '#2ecc71', fontSize: 10, textAlign: 'center', margin: '5px 0 0 0' }}>
          点击版图上绿色边框的空位放置（从 <strong>左下角</strong> 开始，必须相邻）
        </p>
      )}
    </div>
  )
}

function guestColorStyle(color: string): React.CSSProperties {
  const map: Record<string, string> = {
    blue: '#4A90D9', yellow: '#f1c40f', red: '#e74c3c', green: '#2ecc71',
  }
  return { color: map[color] || '#888', fontSize: 11, fontWeight: 600 }
}

function slotColor(color: string): string {
  const map: Record<string, string> = {
    red: '#5a2a2a', yellow: '#5a4a1a', blue: '#2a3a5a',
  }
  return map[color] || '#2a2a4a'
}

function roomColorBorder(color: string): string {
  const map: Record<string, string> = {
    red: '#e74c3c', yellow: '#f1c40f', blue: '#4A90D9',
  }
  return map[color] || '#888'
}
