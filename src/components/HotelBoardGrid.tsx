import type { Player, HotelBoardSlot } from '../types/game'

const SLOT_BG: Record<string, string> = {
  red: '#5a2a2a', yellow: '#5a4a1a', blue: '#2a3a5a',
}

const COLOR_BORDER: Record<string, string> = {
  red: '#e74c3c', yellow: '#f1c40f', blue: '#4A90D9',
}

interface HotelBoardGridProps {
  player: Player
  interactive?: boolean
  canPlaceSlot?: (slot: HotelBoardSlot) => boolean
  onPlaceRoom?: (slotRow: number, slotCol: number) => void
}

export function HotelBoardGrid({ player, interactive, canPlaceSlot, onPlaceRoom }: HotelBoardGridProps) {
  const renderSlot = (slot: HotelBoardSlot) => {
    const isOccupied = slot.roomId !== null
    const canPlace = interactive && canPlaceSlot ? canPlaceSlot(slot) : false
    const occupiedRoom = isOccupied ? player.builtRooms.find(r => r.id === slot.roomId) : null

    return (
      <button
        key={`${slot.row}-${slot.col}`}
        onClick={() => {
          if (canPlace && onPlaceRoom) onPlaceRoom(slot.row, slot.col)
        }}
        style={{
          width: 76, height: 56,
          background: isOccupied
            ? (occupiedRoom ? SLOT_BG[slot.color] || '#2a2a4a' : '#2a2a4a')
            : (canPlace ? '#1a3a2a' : '#1a1a2e'),
          border: `2px solid ${
            isOccupied ? (COLOR_BORDER[slot.color] || '#888')
            : canPlace ? '#2ecc71'
            : '#2a2a4a'
          }`,
          borderRadius: 6, cursor: canPlace ? 'pointer' : 'default',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, color: isOccupied ? '#fff' : '#666',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          if (canPlace) e.currentTarget.style.borderColor = '#f1c40f'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = isOccupied
            ? (COLOR_BORDER[slot.color] || '#888')
            : canPlace ? '#2ecc71' : '#2a2a4a'
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
              background: SLOT_BG[slot.color] || '#2a2a4a',
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
        <span style={{ color: '#e74c3c' }}>■ 红色区(免费)</span>
        <span style={{ color: '#f1c40f' }}>■ 黄色区(1元)</span>
        <span style={{ color: '#4A90D9' }}>■ 蓝色区(2-3元)</span>
      </div>
      <div style={{ marginTop: 4, fontSize: 9, color: '#555', textAlign: 'center' }}>
        已建 {player.builtRooms.length}/20 | 空房 {player.roomSlots.filter(s => s.roomId).reduce((sum, s) => {
          const r = player.builtRooms.find(br => br.id === s.roomId)
          return sum + (r?.capacity ?? 0)
        }, 0)} 个床位
      </div>
    </div>
  )
}
