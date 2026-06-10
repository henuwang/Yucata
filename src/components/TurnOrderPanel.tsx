import { useGameStore } from '../store/gameStore'
import { turnOrderTiles } from '../data/turnOrder'

export function TurnOrderPanel() {
  const players = useGameStore(s => s.players)
  const currentIdx = useGameStore(s => s.currentPlayerIndex)
  const isDiceRollPhase = useGameStore(s => s.phase === 'dice_roll')
  const dice = useGameStore(s => s.dice)
  const hasRolled = dice.some(d => d.value > 0)

  const sortedPlayers = [...players].sort((a, b) => {
    const tileA = turnOrderTiles.find(t => t.id === a.turnOrderTileId)
    const tileB = turnOrderTiles.find(t => t.id === b.turnOrderTileId)
    if (!tileA || !tileB) return 0
    return tileA.number - tileB.number
  })

  return (
    <div style={{
      background: '#1a1a2e', borderRadius: 12, padding: 12,
      border: '1px solid #2a2a4a',
    }}>
      <div style={{ fontSize: 12, color: '#888', marginBottom: 8, fontWeight: 600 }}>
        🏅 顺位板 {isDiceRollPhase && !hasRolled && '(等待掷骰)'}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {sortedPlayers.map(p => {
          const tile = turnOrderTiles.find(t => t.id === p.turnOrderTileId)
          if (!tile) return null
          return (
            <TurnOrderTile
              key={p.id}
              player={p}
              tile={tile}
              isActive={p.id === players[currentIdx]?.id}
              isDone={p.actionsPerformed >= 2}
              hasPassed={p.hasPassedInCycle && p.actionsPerformed < 2}
            />
          )
        })}
      </div>
    </div>
  )
}

function TurnOrderTile({
  player, tile, isActive, isDone, hasPassed,
}: {
  player: { id: string; name: string; color: string; actionsPerformed: number; hasPassedInCycle: boolean }
  tile: { number: number; nameCn: string }
  isActive: boolean
  isDone: boolean
  hasPassed: boolean
}) {
  const actionText = isDone
    ? '已完成'
    : hasPassed
      ? '已跳过'
      : `已行动 ${player.actionsPerformed}/2`

  const bgColor = isActive
    ? '#1a2744'
    : isDone
      ? '#1a1a2e'
      : hasPassed
        ? '#2a1a1a'
        : '#0f0f1a'

  const borderColor = isActive
    ? '#4a7db5'
    : isDone
      ? '#2a2a4a'
      : hasPassed
        ? '#5a2a2a'
        : '#2a2a4a'

  return (
    <div style={{
      padding: '8px 12px', borderRadius: 8,
      background: bgColor,
      border: `1px solid ${borderColor}`,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: '#2a2a4a', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 'bold', fontSize: 16, color: '#f1c40f',
          border: '1px solid #4a4a6a',
        }}>
          {tile.number}
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#e0e0e0', fontWeight: 600 }}>
            {player.name}
          </div>
          <div style={{ fontSize: 10, color: '#888' }}>
            {tile.nameCn}
          </div>
        </div>
      </div>
      <div style={{
        fontSize: 10, color: isDone ? '#666' : hasPassed ? '#e74c3c' : '#4a7db5',
        fontWeight: 600,
      }}>
        {actionText}
      </div>
    </div>
  )
}
