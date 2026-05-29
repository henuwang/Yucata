import { useGameStore } from '../store/gameStore'
import type { GuestCard } from '../types/game'

const COLOR_MAP: Record<string, { bg: string; border: string; label: string }> = {
  blue: { bg: '#1a2744', border: '#4a7db5', label: '贵族' },
  grey: { bg: '#2a2a2a', border: '#888', label: '教士' },
  yellow: { bg: '#3a3520', border: '#d4a843', label: '政客' },
  red: { bg: '#3a1a1a', border: '#c0392b', label: '艺术家' },
  green: { bg: '#1a3a1a', border: '#27ae60', label: '市民' },
}

function GuestCardView({ guest, onClick, disabled }: { guest: GuestCard; onClick?: () => void; disabled?: boolean }) {
  const colors = COLOR_MAP[guest.color] ?? COLOR_MAP.grey
  return (
    <div
      onClick={disabled ? undefined : onClick}
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: 8,
        padding: 10,
        minWidth: 140,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.2s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ color: '#e0e0e0', fontWeight: 600, fontSize: 14 }}>{guest.name}</span>
        <span style={{ color: '#f1c40f', fontSize: 12, fontWeight: 600 }}>{guest.victoryPoints}分</span>
      </div>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {guest.requirements.map((req, i) => (
          <span key={i} style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 4,
            padding: '2px 6px',
            fontSize: 11,
            color: '#ccc',
          }}>
            {req.type}×{req.amount}
          </span>
        ))}
      </div>
      <div style={{ fontSize: 10, color: '#888', marginTop: 4 }}>{colors.label}</div>
    </div>
  )
}

export function GuestArea() {
  const availableGuests = useGameStore(s => s.availableGuests)
  const players = useGameStore(s => s.players)
  const currentPlayerIndex = useGameStore(s => s.currentPlayerIndex)
  const phase = useGameStore(s => s.phase)
  const takeGuest = useGameStore(s => s.takeGuest)
  const serveWaitingGuest = useGameStore(s => s.serveWaitingGuest)

  const currentPlayer = players[currentPlayerIndex]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{
        background: '#1a1a2e',
        borderRadius: 12,
        padding: 16,
        border: '1px solid #2a2a4a',
      }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#e0e0e0', fontSize: 16 }}>大堂 - 可用客人</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {availableGuests.map(guest => (
            <GuestCardView
              key={guest.id}
              guest={guest}
              onClick={() => takeGuest(guest.id)}
              disabled={phase !== 'dice_draft'}
            />
          ))}
        </div>
      </div>

      {currentPlayer.guestWaitingArea.length > 0 && (
        <div style={{
          background: '#1a1a2e',
          borderRadius: 12,
          padding: 16,
          border: '1px solid #2a2a4a',
        }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#e0e0e0', fontSize: 16 }}>等待区 - 待招待的客人</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {currentPlayer.guestWaitingArea.map(guest => (
              <GuestCardView
                key={guest.id}
                guest={guest}
                onClick={() => serveWaitingGuest(guest.id)}
                disabled={phase !== 'action'}
              />
            ))}
          </div>
        </div>
      )}

      {currentPlayer.guestServedArea.length > 0 && (
        <div style={{
          background: '#1a1a2e',
          borderRadius: 12,
          padding: 16,
          border: '1px solid #2a2a4a',
        }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#e0e0e0', fontSize: 16 }}>
            已招待 ({currentPlayer.guestServedArea.length}/7)
          </h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {currentPlayer.guestServedArea.map(guest => (
              <GuestCardView key={guest.id} guest={guest} disabled />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
