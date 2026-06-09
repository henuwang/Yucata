import { useGameStore } from '../store/gameStore'
import type { ExtraAction } from '../types/game'

const EXTRA_ACTION_INFO: Record<ExtraAction, { label: string; desc: string; icon: string }> = {
  add_die: { label: '+1骰子', desc: '选择一个行动区，视为多1颗骰子', icon: '🎲' },
  move_kitchen: { label: '厨房移动', desc: '从厨房移动最多3个餐饮到客人卡', icon: '🍽️' },
  place_politics: { label: '放置圆片', desc: '在有条件的政治卡上放置圆片', icon: '📌' },
  use_staff_ability: { label: '员工能力', desc: '使用每轮一次的员工能力', icon: '👔' },
  move_guest: { label: '客人入住', desc: '移动订单完成的客人到空房', icon: '🚪' },
}

export function TurnOrderPanel() {
  const players = useGameStore(s => s.players)
  const currentPlayerIndex = useGameStore(s => s.currentPlayerIndex)
  const turnOrderTiles = useGameStore(s => s.turnOrderTiles)
  const phase = useGameStore(s => s.phase)
  const currentPlayer = players[currentPlayerIndex]

  const isActionPhase = phase === 'action'

  return (
    <div style={{
      background: '#1a1a2e',
      borderRadius: 12,
      padding: 16,
      border: '1px solid #2a2a4a',
    }}>
      <h3 style={{ margin: '0 0 12px 0', color: '#e0e0e0', fontSize: 15 }}>
        顺位板
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {turnOrderTiles.map((tile) => {
          const player = players.find(p => p.turnOrderTileId === tile.id)
          const isCurrent = player?.id === currentPlayer.id

          return (
            <div key={tile.id} style={{
              background: isCurrent ? '#1a2744' : '#2a2a4a',
              border: `1px solid ${isCurrent ? '#4a7db5' : '#4a4a6a'}`,
              borderRadius: 8,
              padding: '8px 10px',
              opacity: player ? 1 : 0.5,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: 11,
                    background: isCurrent ? '#4a7db5' : '#4a4a6a',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 'bold', fontSize: 11,
                  }}>
                    {tile.number}
                  </div>
                  <span style={{
                    color: isCurrent ? '#e0e0e0' : '#888',
                    fontSize: 12, fontWeight: isCurrent ? 600 : 400,
                  }}>
                    {tile.nameCn}
                  </span>
                </div>
                {player && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ color: player.color, fontSize: 12 }}>●</span>
                    <span style={{ color: isCurrent ? '#e0e0e0' : '#666', fontSize: 11 }}>
                      {player.name}
                    </span>
                  </div>
                )}
                {!player && (
                  <span style={{ color: '#555', fontSize: 10 }}>未分配</span>
                )}
              </div>

              {/* Extra actions */}
              {tile.extraActions.length > 0 && (
                <div style={{ marginTop: 6 }}>
                  <div style={{ fontSize: 9, color: '#666', marginBottom: 4 }}>额外行动:</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {tile.extraActions.map(action => {
                      const info = EXTRA_ACTION_INFO[action]
                      const canAct = isCurrent && isActionPhase
                      return (
                        <ExtraActionButton
                          key={action}
                          label={`${info?.icon || ''} ${info?.label || action}`}
                          desc={info?.desc || ''}
                          canAct={canAct}
                        />
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ExtraActionButton({
  label, desc, canAct,
}: {
  label: string
  desc: string
  canAct: boolean
}) {
  const handleClick = () => {
    const store = useGameStore.getState()
    const player = store.players[store.currentPlayerIndex]
    const { logs, ...rest } = store
    useGameStore.setState({
      ...rest,
      logs: [...logs, `${player.name} 使用了顺位板额外行动: ${label}`],
    } as any)
  }

  return (
    <button
      onClick={canAct ? handleClick : undefined}
      title={desc}
      style={{
        padding: '3px 8px',
        borderRadius: 4,
        border: `1px solid ${canAct ? '#4a7db5' : '#3a3a3a'}`,
        background: canAct ? '#1a2744' : '#1a1a2e',
        color: canAct ? '#ccc' : '#555',
        cursor: canAct ? 'pointer' : 'not-allowed',
        fontSize: 10,
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => {
        if (canAct) e.currentTarget.style.background = '#2a3a5a'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = canAct ? '#1a2744' : '#1a1a2e'
      }}
    >
      {label}
    </button>
  )
}
