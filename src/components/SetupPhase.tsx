import { useGameStore } from '../store/gameStore'
import { HotelBoardGrid } from './HotelBoardGrid'

const REQ_ICONS: Record<string, string> = {
  food: '🥖', wine: '🍷', coffee: '☕', cake: '🍰', money: '💰',
}
const RES_NAMES_CN: Record<string, string> = {
  food: '馅饼', wine: '红酒', coffee: '咖啡', cake: '蛋糕', money: '金钱',
}

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
        需求: {guest.requirements.map((r: any) => `${REQ_ICONS[r.type] || '?'}×${r.amount}`).join(' ')}
      </div>
      <div style={{ fontSize: 11, color: '#2ecc71' }}>
        VP: {guest.victoryPoints} | 费用: {guest.guestCost}
      </div>
      {guest.bonusResource && (
        <div style={{ fontSize: 10, color: '#e67e22' }}>
          🎁 {REQ_ICONS[guest.bonusResource]}+{guest.bonusAmount} {RES_NAMES_CN[guest.bonusResource]}
        </div>
      )}
    </button>
  )
}

export function SetupRoomPhase() {
  const phase = useGameStore(s => s.phase)
  const setupPlayerIndex = useGameStore(s => s.setupPlayerIndex)
  const players = useGameStore(s => s.players)
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
        background: '#1a1a2e', borderRadius: 16, padding: 24, maxWidth: 560, width: '95%',
        border: '1px solid #4a4a6a',
      }}>
        <h2 style={{ color: '#f1c40f', margin: '0 0 4px 0', fontSize: 17 }}>
          初始设置 - 准备客房
        </h2>
        <p style={{ color: '#888', margin: '0 0 10px 0', fontSize: 12 }}>
          从版图左下角开始放置客房（最多3个），点击空位自动匹配同色房间
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

        <SetupHotelBoardGrid />

        <div style={{ marginTop: 8, maxHeight: 40, overflowY: 'auto', fontSize: 10, color: '#666' }}>
          {logs.slice(-3).join('\n')}
        </div>
      </div>
    </div>
  )
}

function guestColorStyle(color: string) {
  const map: Record<string, string> = {
    blue: '#4A90D9', yellow: '#f1c40f', red: '#e74c3c', green: '#2ecc71',
  }
  return { color: map[color] || '#888', fontSize: 11, fontWeight: 600 }
}

function SetupHotelBoardGrid() {
  const players = useGameStore(s => s.players)
  const setupPlayerIndex = useGameStore(s => s.setupPlayerIndex)
  const player = players[setupPlayerIndex]
  const autoPlaceRoom = useGameStore(s => s.autoPlaceRoom)

  return (
    <HotelBoardGrid
      player={player}
      interactive={player.setupRoomCount < 3}
      canPlaceSlot={(slot) => {
        if (slot.roomId) return false
        if (player.resources.money < slot.cost) return false
        if (player.setupRoomCount === 0) return slot.row === 0 && slot.col === 0
        return player.roomSlots.some(s =>
          s.roomId && Math.abs(s.row - slot.row) + Math.abs(s.col - slot.col) === 1
        )
      }}
      onPlaceRoom={(row, col) => autoPlaceRoom(row, col)}
    />
  )
}


