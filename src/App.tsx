import { useGameStore } from './store/gameStore'
import { Lobby } from './components/Lobby'
import { GameBoard } from './components/GameBoard'

function App() {
  const gameStarted = useGameStore(s => s.gameStarted)

  if (!gameStarted) {
    return <Lobby />
  }

  return <GameBoard />
}

export default App
