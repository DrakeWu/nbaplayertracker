import { useState } from 'react'
import heroImg from './assets/nba.png'
import './App.css'

interface Player {
  id: number
  first_name: string
  last_name: string
  position: string
  team: {
    full_name: string
  }
}

function App() {
  const [search, setSearch] = useState('')
  const [playerData, setPlayerData] = useState<Player | null>(null)
  const [error, setError] = useState<string | null>(null)

async function handleSearch() {
    try {
      const response = await fetch(`/api/players?search=${encodeURIComponent(search)}`)
      console.log('Response status:', response.status) // Log the response status for debugging
      if (!response.ok) {
        throw new Error('Player not found')
      }
      const result = await response.json()
      setPlayerData(result)
      if (result.length === 0) {
        throw new Error('Player not found')
      }
      setPlayerData(result.data[0]) // Assuming the API returns an array of players, we take the first one
      setError(null) // Clear any previous errors
    } catch (err) {
      setError((err as Error).message)
      setPlayerData(null)
    }
  }

  return (
    <>
     <section className="hero">
        <div className="hero-content">
          <h1>NBA Player Tracker</h1>
          <p>Track/Search your favorite NBA players and their stats.</p>
        </div>
        <img src={heroImg} alt="NBA Logo"/>
      </section> 
     
    

    <section className="features">
      <h2>Search for a Player</h2>
      <div className="search-container">
        <input
          type="text"
          placeholder="Enter player name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      {error && <p className="error">{error}</p>}
      {playerData && (
        <div className="player-profile">
          <h3>{playerData.first_name} {playerData.last_name}</h3>
          <p>Position: {playerData.position}</p>
          <p>Team: {playerData.team?.full_name}</p>
        </div>
      )}
    </section>
    </>
  )
}

export default App
