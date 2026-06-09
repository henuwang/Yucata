import { DicePanel } from './DicePanel'
import { ActionPanel } from './ActionPanel'
import { ActionAreaVisual } from './ActionAreaVisual'
import { PlayerBar } from './PlayerBar'
import { PlayerHotel } from './PlayerHotel'
import { GameLog } from './GameLog'
import { StaffCardsPanel } from './StaffCardsPanel'
import { PoliticsPanel } from './PoliticsPanel'
import { TurnOrderPanel } from './TurnOrderPanel'
import { KitchenPanel } from './KitchenPanel'
import { WinnerScreen } from './WinnerScreen'
import { SetupStaffPhase, SetupGuestPhase, SetupRoomPhase } from './SetupPhase'
import { PenaltyDialog } from './PenaltyDialog'
import { useGameStore } from '../store/gameStore'

export function GameBoard() {
  const phase = useGameStore(s => s.phase)
  const pendingPenalty = useGameStore(s => s.pendingPenalty)

  if (pendingPenalty) {
    return <PenaltyDialog />
  }

  if (phase === 'game_end') {
    return <WinnerScreen />
  }

  if (phase === 'setup_staff') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #0f0f1a 100%)',
      }}>
        <SetupStaffPhase />
      </div>
    )
  }

  if (phase === 'setup_guest') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #0f0f1a 100%)',
      }}>
        <SetupGuestPhase />
      </div>
    )
  }

  if (phase === 'setup_room') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #0f0f1a 100%)',
      }}>
        <SetupRoomPhase />
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #0f0f1a 100%)',
      padding: 16,
      fontFamily: 'system-ui, sans-serif',
    }}>
      <header style={{ textAlign: 'center', marginBottom: 16 }}>
        <h1 style={{ color: '#e0e0e0', fontSize: 22, margin: 0, fontWeight: 300, letterSpacing: 6 }}>
          奥 地 利 大 饭 店
        </h1>
        <p style={{ color: '#555', margin: '2px 0 0 0', fontSize: 11, letterSpacing: 2 }}>
          GRAND AUSTRIA HOTEL
        </p>
      </header>

      <div style={{ marginBottom: 12 }}>
        <PhaseIndicator />
      </div>

      <PlayerBar />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 12, marginTop: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <DicePanel />
          <ActionAreaVisual />
          <ActionPanel />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <PlayerHotel />
            <GameLog />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 'calc(100vh - 180px)', overflowY: 'auto', paddingRight: 4 }}>
          <GuestLobby />
          <EmperorTilesPanel />
          <PoliticsPanel />
          <TurnOrderPanel />
          <KitchenPanel />
          <StaffSummary />
          <StaffCardsPanelWrapper />
        </div>
      </div>
    </div>
  )
}

function PhaseIndicator() {
  const phase = useGameStore(s => s.phase)
  const player = useGameStore(s => s.players[s.currentPlayerIndex])
  const round = useGameStore(s => s.roundNumber)

  const labels: Record<string, { text: string; color: string }> = {
    dice_roll: { text: `🎲 掷骰阶段 - ${player.name}请掷骰`, color: '#3498db' },
    dice_draft: { text: `🎯 行动区选择 - ${player.name}请选择一个行动区`, color: '#f1c40f' },
    action: { text: `⚡ 行动阶段 - ${player.name}请行动`, color: '#2ecc71' },
    game_end: { text: '🏆 游戏结束', color: '#e74c3c' },
  }

  const info = labels[phase] ?? labels.dice_roll
  return (
    <div style={{
      background: '#1a1a2e',
      borderRadius: 10,
      padding: '10px 16px',
      border: `1px solid ${info.color}44`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <span style={{ color: info.color, fontWeight: 600, fontSize: 14 }}>{info.text}</span>
      <span style={{ color: '#666', fontSize: 12 }}>第 {Math.ceil(round)}/7 轮</span>
    </div>
  )
}

function GuestLobby() {
  const guests = useGameStore(s => s.availableGuests)

  const groups: Record<string, typeof guests> = {}
  guests.forEach(g => {
    if (!groups[g.color]) groups[g.color] = []
    groups[g.color].push(g)
  })

  const colorInfo: Record<string, { bg: string; border: string; label: string; die: string }> = {
    blue: { bg: '#1a2744', border: '#4a7db5', label: '贵族', die: '骰子1/5' },
    yellow: { bg: '#3a3520', border: '#d4a843', label: '艺术家/政客', die: '骰子2/6' },
    red: { bg: '#3a1a1a', border: '#c0392b', label: '市民', die: '骰子3' },
    green: { bg: '#1a3a1a', border: '#27ae60', label: '旅客', die: '骰子4' },
  }

  return (
    <div style={{
      background: '#1a1a2e',
      borderRadius: 12,
      padding: 16,
      border: '1px solid #2a2a4a',
    }}>
      <h3 style={{ margin: '0 0 12px 0', color: '#e0e0e0', fontSize: 15 }}>
        🚪 大堂 - 等待的客人
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Object.entries(groups).map(([color, cards]) => {
          const c = colorInfo[color] ?? { bg: '#2a2a2a', border: '#888', label: color, die: '' }
          return (
            <div key={color}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: 4, background: c.border }} />
                <span style={{ fontSize: 11, color: '#888' }}>{c.label} ({c.die})</span>
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {cards.map(g => (
                  <div key={g.id} style={{
                    background: c.bg,
                    border: `1px solid ${c.border}`,
                    borderRadius: 6,
                    padding: '4px 8px',
                    minWidth: 70,
                    flex: 1,
                  }}>
                    <div style={{ color: '#e0e0e0', fontSize: 11, fontWeight: 600 }}>{g.name}</div>
                    <div style={{ color: '#f1c40f', fontSize: 10 }}>+{g.victoryPoints}</div>
                    <div style={{ fontSize: 9, color: '#f39c12' }}>💰{g.guestCost}</div>
                    <div style={{ display: 'flex', gap: 2, marginTop: 1 }}>
                      {g.requirements.map((r, i) => (
                        <span key={i} style={{ fontSize: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 2, padding: '0 3px', color: '#888' }}>
                          {r.type}×{r.amount}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function EmperorTilesPanel() {
  const emperorTiles = useGameStore(s => s.emperorTiles)
  const emperorScoringCount = useGameStore(s => s.emperorScoringCount)
  const players = useGameStore(s => s.players)
  const currentIdx = useGameStore(s => s.currentPlayerIndex)

  return (
    <div style={{
      background: '#1a1a2e',
      borderRadius: 12,
      padding: 16,
      border: '1px solid #2a2a4a',
    }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#e0e0e0', fontSize: 15 }}>
        👑 皇帝板块 (计分: {emperorScoringCount}/3)
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {emperorTiles.map((tile, i) => {
          const scored = i < emperorScoringCount
          return (
            <div key={tile.id} style={{
              background: scored ? '#1a2744' : '#2a2a4a',
              border: `1px solid ${scored ? '#4a7db5' : '#4a4a6a'}`,
              borderRadius: 6,
              padding: '6px 10px',
              opacity: scored ? 1 : 0.5,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#e0e0e0', fontWeight: 600, fontSize: 12 }}>
                  {tile.id} {scored ? '✅' : '⏳'}
                </span>
                <span style={{ color: '#f1c40f', fontSize: 10 }}>第{i * 2 + 3}轮</span>
              </div>
              <div style={{ fontSize: 10, color: '#2ecc71', marginTop: 2 }}>
                🎁 {tile.reward.description}
              </div>
              <div style={{ fontSize: 10, color: '#e74c3c' }}>
                ⚠️ {tile.penalties.length > 1 ? `${tile.penalties[0].description} 或 ${tile.penalties[1].description}` : tile.penalties[0].description}
              </div>
            </div>
          )
        })}
      </div>
      <div style={{ marginTop: 8 }}>
        {players.map((p, i) => (
          <div key={p.id} style={{
            fontSize: 11, color: i === currentIdx ? '#e0e0e0' : '#666',
            margin: '2px 0',
          }}>
            <span style={{ color: p.color }}>●</span> {p.name}: 皇帝轨道 {p.emperorTrack}
          </div>
        ))}
      </div>
    </div>
  )
}

function StaffSummary() {
  const staff = useGameStore(s => s.availableStaff)
  return (
    <div style={{
      background: '#1a1a2e',
      borderRadius: 12,
      padding: 16,
      border: '1px solid #2a2a4a',
    }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#e0e0e0', fontSize: 15 }}>
        👔 员工市场
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {staff.length === 0 && (
          <div style={{ color: '#666', fontSize: 12, textAlign: 'center', padding: 12 }}>
            无可用员工
          </div>
        )}
        {staff.map(s => (
          <div key={s.id} style={{
            background: '#2a2a4a',
            border: '1px solid #4a4a6a',
            borderRadius: 6,
            padding: '6px 10px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#e0e0e0', fontWeight: 600, fontSize: 12 }}>{s.name}</span>
              <span style={{ color: '#f1c40f', fontSize: 11 }}>+{s.victoryPoints}</span>
            </div>
            <div style={{ fontSize: 10, color: '#888' }}>{s.description}</div>
            <div style={{ fontSize: 10, color: '#f39c12' }}>💰{s.cost}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StaffCardsPanelWrapper() {
  const player = useGameStore(s => s.players[s.currentPlayerIndex])
  return <StaffCardsPanel player={player} />
}
