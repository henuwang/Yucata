import { useState } from 'react'
import { useGameStore } from '../store/gameStore'

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
        <span style={guestColorStyle(guest.color)}>{guest.colorName}</span>
      </div>
      <div style={{ fontSize: 11, color: '#888' }}>
        需求: {formatResources(guest.requirements)}
      </div>
      <div style={{ fontSize: 11, color: '#2ecc71' }}>
        VP: {guest.victoryPoints} | 费用: {guest.cost}
      </div>
      <div style={{ fontSize: 10, color: '#e67e22' }}>
        奖励: {guest.reward.type === 'room_discount' ? '客房折扣' : guest.reward.type === 'money' ? `${guest.reward.amount}元` : guest.reward.description}
      </div>
    </button>
  )
}

export function SetupRoomPhase() {
  const phase = useGameStore(s => s.phase)
  const setupPlayerIndex = useGameStore(s => s.setupPlayerIndex)
  const players = useGameStore(s => s.players)
  const availableRooms = useGameStore(s => s.availableRooms)
  const logs = useGameStore(s => s.logs)

  if (phase !== 'setup_room') return null

  const currentPlayer = players[setupPlayerIndex]

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.85)',
    }}>
      <div style={{
        background: '#1a1a2e', borderRadius: 16, padding: 32, maxWidth: 800, width: '95%',
        maxHeight: '90vh', overflowY: 'auto',
        border: '1px solid #4a4a6a',
      }}>
        <h2 style={{ color: '#f1c40f', margin: '0 0 6px 0', fontSize: 20 }}>
          游戏初始设置 - 准备客房
        </h2>
        <p style={{ color: '#888', margin: '0 0 16px 0', fontSize: 13 }}>
          逆时针顺序，从酒店版图左下角开始放置客房（最多3个），需支付版图位置上的费用
        </p>

        <div style={{
          background: '#16213e', borderRadius: 10, padding: 12, marginBottom: 16,
          border: '1px solid #2a2a4a',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ color: currentPlayer.color, fontSize: 20 }}>●</span>
            <span style={{ color: '#e0e0e0', fontWeight: 600 }}>{currentPlayer.name}</span>
            <span style={{ color: '#f1c40f', fontSize: 12 }}>
              (已准备 {currentPlayer.setupRoomCount}/3 个房间 | 金钱: {currentPlayer.resources.money}元)
            </span>
            {currentPlayer.setupRoomCount < 3 && (
              <button
                onClick={() => useGameStore.getState().skipSetupRoom()}
                style={{
                  marginLeft: 'auto', background: '#e74c3c', color: '#fff', border: 'none',
                  borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: 12,
                }}
              >
                跳过
              </button>
            )}
          </div>

          {players.map(p => (
            <div key={p.id} style={{
              fontSize: 12, color: '#aaa', margin: '2px 0',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ color: p.color }}>●</span>
              {p.name}: 已准备 {p.setupRoomCount} 个 | 金钱: {p.resources.money}元
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <h3 style={{ color: '#e0e0e0', fontSize: 14, margin: '0 0 8px 0' }}>
              可选客房 (颜色需匹配版图位置)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {availableRooms.map(room => (
                <div key={room.id} style={{
                  background: '#16213e', border: '1px solid #2a2a4a',
                  borderRadius: 8, padding: '6px 10px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <span style={roomColorBadge(room.color)}>{room.name}</span>
                    <span style={{ color: '#888', fontSize: 11, marginLeft: 6 }}>
                      费用: {room.cost.money}元 VP: {room.victoryPoints}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 style={{ color: '#e0e0e0', fontSize: 14, margin: '0 0 8px 0' }}>
              酒店版图
            </h3>
            <HotelBoardGrid />
          </div>
        </div>

        <div style={{ marginTop: 12, maxHeight: 60, overflowY: 'auto', fontSize: 11, color: '#666' }}>
          {logs.slice(-3).join('\n')}
        </div>
      </div>
    </div>
  )
}

function HotelBoardGrid() {
  const players = useGameStore(s => s.players)
  const setupPlayerIndex = useGameStore(s => s.setupPlayerIndex)
  const availableRooms = useGameStore(s => s.availableRooms)
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  const player = players[setupPlayerIndex]

  const placeSetupRoom = useGameStore(s => s.placeSetupRoom)

  const renderSlot = (slot: any) => {
    const isOccupied = slot.roomId !== null
    const canPlace = !isOccupied && selectedRoomId &&
      availableRooms.some(r => r.id === selectedRoomId && r.color === slot.color) &&
      player.resources.money >= slot.cost

    const isAdjacent = !isOccupied && player.roomSlots.some(s =>
      s.roomId &&
      Math.abs(s.row - slot.row) + Math.abs(s.col - slot.col) === 1
    )

    const isValidStart = player.setupRoomCount === 0 && slot.row === 0 && slot.col === 0

    const disabled = isOccupied || !selectedRoomId ||
      (!isValidStart && !isAdjacent && player.setupRoomCount > 0)

    const occupiedRoom = isOccupied ? player.builtRooms.find(r => r.id === slot.roomId) : null

    return (
      <button
        key={`${slot.row}-${slot.col}`}
        onClick={() => {
          if (!disabled && canPlace && selectedRoomId) {
            placeSetupRoom(selectedRoomId, slot.row, slot.col)
            setSelectedRoomId(null)
          }
        }}
        disabled={disabled}
        style={{
          width: '100%', aspectRatio: '1.5',
          background: isOccupied
            ? (occupiedRoom ? slotColor(slot.color) : '#2a2a4a')
            : (canPlace ? '#1a2744' : '#16213e'),
          border: `1px solid ${canPlace ? '#4a7db5' : isOccupied ? '#4a4a6a' : '#2a2a4a'}`,
          borderRadius: 8, cursor: disabled ? 'default' : 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, color: isOccupied ? '#fff' : '#666',
          opacity: disabled && !isOccupied ? 0.4 : 1,
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          if (!disabled) e.currentTarget.style.borderColor = '#f1c40f'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = canPlace ? '#4a7db5' : isOccupied ? '#4a4a6a' : '#2a2a4a'
        }}
      >
        {isOccupied && occupiedRoom ? (
          <>
            <span style={{ fontWeight: 600, fontSize: 11 }}>{occupiedRoom.name}</span>
            <span style={{ fontSize: 9, opacity: 0.7 }}>入住: 0/{occupiedRoom.capacity}</span>
          </>
        ) : (
          <>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#f1c40f' }}>{slot.cost}元</span>
            <span style={slotColorBadge(slot.color)}>
              {slot.color === 'red' ? '红' : slot.color === 'yellow' ? '黄' : '蓝'}
            </span>
          </>
        )}
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
        {player.roomSlots.filter(s => s.row === 3).sort((a, b) => a.col - b.col).map(renderSlot)}
      </div>
      <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
        {player.roomSlots.filter(s => s.row === 2).sort((a, b) => a.col - b.col).map(renderSlot)}
      </div>
      <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
        {player.roomSlots.filter(s => s.row === 1).sort((a, b) => a.col - b.col).map(renderSlot)}
      </div>
      <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
        {player.roomSlots.filter(s => s.row === 0).sort((a, b) => a.col - b.col).map(renderSlot)}
      </div>
      <p style={{ color: '#666', fontSize: 10, margin: '4px 0 0 0' }}>
        点击上方可选客房 → 再点击版图位置放置
      </p>
    </div>
  )
}

function formatResources(res: Record<string, number>): string {
  const items: string[] = []
  if (res.food) items.push(`${res.food}馅饼`)
  if (res.wine) items.push(`${res.wine}红酒`)
  if (res.coffee) items.push(`${res.coffee}咖啡`)
  if (res.cake) items.push(`${res.cake}蛋糕`)
  if (res.money) items.push(`${res.money}元`)
  return items.join(' ') || '无'
}

function guestColorStyle(color: string): React.CSSProperties {
  const map: Record<string, string> = {
    blue: '#4A90D9', yellow: '#f1c40f', red: '#e74c3c', green: '#2ecc71',
  }
  return { color: map[color] || '#888', fontSize: 11, fontWeight: 600 }
}

function roomColorBadge(color: string): React.CSSProperties {
  const map: Record<string, string> = {
    red: '#e74c3c', yellow: '#f1c40f', blue: '#4A90D9',
  }
  return { color: map[color] || '#888', fontSize: 12, fontWeight: 600 }
}

function slotColor(color: string): string {
  const map: Record<string, string> = {
    red: '#5a2a2a', yellow: '#5a4a1a', blue: '#2a3a5a',
  }
  return map[color] || '#2a2a4a'
}

function slotColorBadge(color: string): React.CSSProperties {
  const map: Record<string, string> = {
    red: '#e74c3c', yellow: '#f1c40f', blue: '#4A90D9',
  }
  return { color: map[color] || '#888', fontSize: 9, fontWeight: 600 }
}
