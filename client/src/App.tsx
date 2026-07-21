import { useState } from 'react'
import heroImg from './assets/nba.png'
import YearSelector from './YearSelector'
import UserLogin from './UserLogin'
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

interface PlayerStats {
  id: number
  pts: number
  reb: number
  ast: number
  stl: number
  blk: number
  fg_pct: number
  min: string
}

interface User {
  id: string
  name: string
  favoriteTeam: string
  favoritePlayers: number[]
}

function App() {
  const [search, setSearch] = useState('')
  const [playerData, setPlayerData] = useState<Player | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<PlayerStats | null>(null)
  const [selectedYear, setSelectedYear] = useState<number>(2024)
  const [activeUser, setActiveUser] = useState<User | null>(null)
  const [showLogin, setShowLogin] = useState(false)

  async function handleSearch() {
    try {
      const response = await fetch(`/api/players?search=${encodeURIComponent(search)}`)
      if (!response.ok) {
        throw new Error('Player not found')
      }
      const result = await response.json()
      if (result.data.length === 0) {
        throw new Error('Player not found')
      }
      const player = result.data[0]
      setPlayerData(player)
      setError(null)

      const statsResponse = await fetch(`/api/season-averages/${player.id}/${selectedYear}`)
      const statsResult = await statsResponse.json()
      setStats(statsResult.data[0] ?? null)
    } catch (err) {
      setError((err as Error).message)
      setPlayerData(null)
      setStats(null)
    }
  }

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <h1>NBA Player Tracker</h1>
          <p>Track/Search your favorite NBA players and their stats.</p>
        </div>
        <img src={heroImg} alt="NBA Logo" />
      </section>

      <section className="features">
        <button onClick={() => setShowLogin(true)}>
          {activeUser ? `👤 ${activeUser.name}` : "Log In"}
        </button>

        {showLogin && (
          <UserLogin
            onLogin={(user) => {
              setActiveUser(user)
              setShowLogin(false)
            }}
            onClose={() => setShowLogin(false)}
          />
        )}

        <h2>Search for a Player</h2>
        <div className="search-container">
          <input
            type="text"
            placeholder="Enter player name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <YearSelector season={selectedYear} onChange={setSelectedYear} />
          <button onClick={handleSearch}>Search</button>
        </div>
        {error && <p className="error">{error}</p>}
        {playerData && (
          <div className="player-profile">
            <h3>{playerData.first_name} {playerData.last_name}</h3>
            <p>Position: {playerData.position}</p>
            <p>Team: {playerData.team?.full_name}</p>

            {stats ? (
              <div className="player-stats">
                <p>PPG: {stats.pts}</p>
                <p>RPG: {stats.reb}</p>
                <p>APG: {stats.ast}</p>
                <p>FG%: {(stats.fg_pct * 100)}%</p>
              </div>
            ) : (
              <p>No stats available for {selectedYear}.</p>
            )}
          </div>
        )}
        {activeUser && (
  <EditProfile user={activeUser} onUpdate={setActiveUser} />
)}
      </section>
    </>
  )
}

export default App