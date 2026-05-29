import { useGameStore } from './store/gameStore'
import { Lobby } from './components/Lobby'
import { GameBoard } from './components/GameBoard'

function App() {
  const dice = useGameStore(s => s.dice)
  const logs = useGameStore(s => s.logs)
  const gameStarted = dice.some(d => d.value > 0) || logs.length > 1

  if (!gameStarted) {
    return <Lobby />
  }

  return <GameBoard />
}

export default App
