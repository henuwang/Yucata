import { useGameStore } from './store/gameStore'
import { Lobby } from './components/Lobby'
import { GameBoard } from './components/GameBoard'

function App() {
  const turnNumber = useGameStore(s => s.turnNumber)
  const logs = useGameStore(s => s.logs)
  const gameStarted = turnNumber > 0 || logs.length > 0

  if (!gameStarted) {
    return <Lobby />
  }

  return <GameBoard />
}

export default App
