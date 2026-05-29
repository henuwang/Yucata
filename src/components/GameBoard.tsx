import { DiceArea } from './DiceArea'
import { GuestArea } from './GuestArea'
import { HotelBoard } from './HotelBoard'
import { StaffArea } from './StaffArea'
import { PlayerPanel } from './PlayerPanel'
import { GameLog } from './GameLog'
import { WinnerScreen } from './WinnerScreen'
import { useGameStore } from '../store/gameStore'

export function GameBoard() {
  const phase = useGameStore(s => s.phase)

  if (phase === 'game_end') {
    return <WinnerScreen />
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f0f1a',
      padding: 20,
      fontFamily: 'system-ui, sans-serif',
    }}>
      <header style={{
        textAlign: 'center',
        marginBottom: 24,
        padding: '16px 0',
        borderBottom: '1px solid #2a2a4a',
      }}>
        <h1 style={{
          color: '#e0e0e0',
          fontSize: 28,
          margin: 0,
          fontWeight: 300,
          letterSpacing: 4,
        }}>
          奥地利大饭店
        </h1>
        <p style={{ color: '#666', margin: '4px 0 0 0', fontSize: 13 }}>
          Grand Austria Hotel
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16, maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <PlayerPanel />
          <GameLog />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <DiceArea />
          <GuestArea />
          <HotelBoard />
          <StaffArea />
        </div>
      </div>
    </div>
  )
}
