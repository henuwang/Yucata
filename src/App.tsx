import { useState } from 'react'
import { useGameStore } from './store/gameStore'
import { Lobby } from './components/Lobby'
import { GameBoard } from './components/GameBoard'
import { RulesPanel } from './components/RulesPanel'

function App() {
  const gameStarted = useGameStore(s => s.gameStarted)
  const [showRules, setShowRules] = useState(false)

  return (
    <>
      {gameStarted ? <GameBoard /> : <Lobby />}

      <button
        onClick={() => setShowRules(true)}
        title="游戏规则"
        style={{
          position: 'fixed',
          right: 16,
          bottom: 16,
          zIndex: 900,
          background: 'rgba(26,26,46,0.9)',
          border: '1px solid #4a4a6a',
          borderRadius: 24,
          padding: '10px 18px',
          color: '#8ab4d8',
          fontSize: 13,
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        }}
      >
        📖 规则
      </button>

      {showRules && <RulesPanel onClose={() => setShowRules(false)} />}
    </>
  )
}

export default App
