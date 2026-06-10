import { useGameStore } from '../store/gameStore'
import type { PoliticsCard, Player } from '../types/game'

const GROUP_STYLES: Record<string, { border: string; bg: string; label: string }> = {
  A: { border: '#e74c3c', bg: '#3a1a1a', label: 'A组 - 房间' },
  B: { border: '#f1c40f', bg: '#3a3520', label: 'B组 - 客人' },
  C: { border: '#4A90D9', bg: '#1a2744', label: 'C组 - 综合' },
}

function getPlayerMarkers(card: PoliticsCard, players: Player[]) {
  return players
    .filter(p => p.politicsMarkers.some(m => m.cardId === card.id))
    .map(p => ({
      playerId: p.id,
      playerName: p.name,
      playerColor: p.color,
    }))
}

export function PoliticsPanel() {
  const politicsCards = useGameStore(s => s.politicsCards)
  const players = useGameStore(s => s.players)
  const currentPlayer = useGameStore(s => s.players[s.currentPlayerIndex])
  const phase = useGameStore(s => s.phase)

  const canPlace = phase === 'action'

  return (
    <div style={{
      background: '#1a1a2e',
      borderRadius: 12,
      padding: 16,
      border: '1px solid #2a2a4a',
    }}>
      <h3 style={{ margin: '0 0 12px 0', color: '#e0e0e0', fontSize: 15 }}>
        政治卡
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {politicsCards.length === 0 && (
          <div style={{ color: '#666', fontSize: 12, textAlign: 'center', padding: 12 }}>
            无可用政治卡
          </div>
        )}
        {politicsCards.map(card => {
          const gs = GROUP_STYLES[card.group] || { border: '#888', bg: '#2a2a2a', label: card.group }
          const markers = getPlayerMarkers(card, players)
          const hasCurrentPlayerMarker = markers.some(m => m.playerId === currentPlayer.id)
          const canPlaceHere = canPlace && !hasCurrentPlayerMarker

          return (
            <div key={card.id} style={{
              background: gs.bg,
              border: `1px solid ${gs.border}`,
              borderRadius: 8,
              padding: 10,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ color: gs.border, fontSize: 9, fontWeight: 600, letterSpacing: 1 }}>
                  {gs.label}
                </span>
                <span style={{ color: '#f1c40f', fontSize: 11, fontWeight: 600 }}>
                  +{card.victoryPoints}分
                </span>
              </div>

              <div style={{ color: '#e0e0e0', fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
                {card.name}
              </div>

              <div style={{ fontSize: 10, color: '#ccc', marginBottom: 2 }}>
                <span style={{ color: '#888' }}>条件: </span>{card.description}
              </div>

              <div style={{ fontSize: 10, color: '#2ecc71', marginBottom: 6 }}>
                <span style={{ color: '#888' }}>奖励: </span>+{card.victoryPoints}分
              </div>

              {/* Markers */}
              <div style={{ display: 'flex', gap: 4, marginBottom: canPlaceHere ? 8 : 0, flexWrap: 'wrap' }}>
                {markers.map(m => (
                  <div key={m.playerId} style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: 4, padding: '2px 6px',
                  }}>
                    <span style={{ color: m.playerColor, fontSize: 12 }}>●</span>
                    <span style={{ color: '#aaa', fontSize: 9 }}>{m.playerName}</span>
                  </div>
                ))}
                {markers.length === 0 && (
                  <span style={{ color: '#555', fontSize: 9 }}>尚无圆片放置</span>
                )}
              </div>

              {canPlaceHere && (
                <PlaceDiscButton cardId={card.id} cardName={card.name} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PlaceDiscButton({ cardId, cardName }: { cardId: string; cardName: string }) {
  const currentIdx = useGameStore(s => s.currentPlayerIndex)

  const handlePlace = () => {
    const store = useGameStore.getState()
    const player = store.players[currentIdx]
    const alreadyPlaced = player.politicsMarkers.some(m => m.cardId === cardId)
    if (alreadyPlaced) return

    const updatedPlayers = store.players.map((p, i) => {
      if (i !== currentIdx) return p
      return {
        ...p,
        politicsMarkers: [
          ...p.politicsMarkers,
          { playerId: p.id, cardId },
        ],
      }
    })

    useGameStore.setState({
      players: updatedPlayers,
      logs: [...store.logs, `${player.name} 在政治卡"${cardName}"上放置了圆片`],
    })
  }

  return (
    <button
      onClick={handlePlace}
      style={{
        padding: '4px 10px',
        borderRadius: 6,
        border: '1px solid #4a7db5',
        background: '#1a2744',
        color: '#e0e0e0',
        cursor: 'pointer',
        fontSize: 11,
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = '#2a3a5a' }}
      onMouseLeave={e => { e.currentTarget.style.background = '#1a2744' }}
    >
      放置圆片
    </button>
  )
}
