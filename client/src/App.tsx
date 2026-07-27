import { useState, useEffect } from 'react'
import posthog from 'posthog-js'
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

interface User {
  id: string
  name: string
  favoriteTeam: string
}

function App() {
  const [search, setSearch] = useState('')
  const [playerData, setPlayerData] = useState<Player | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState<number>(2024)
  const [activeUser, setActiveUser] = useState<User | null>(null)
  const [showLogin, setShowLogin] = useState(false)

  useEffect(() => {
    fetch('/api/active-user')
      .then((res) => res.json())
      .then((user) => {
        if (user) {
          setActiveUser(user)
          posthog.identify(user.id, { name: user.name, favorite_team: user.favoriteTeam })
        }
      })
      .catch((err) => console.error('Failed to fetch active user', err))
  }, [])

  async function handleSearch() {
    posthog.capture('player_searched', { season_year: selectedYear })
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
      posthog.capture('player_found', {
        player_position: player.position,
        player_team: player.team?.full_name,
        season_year: selectedYear,
      })

      // Season averages requires a paid balldontlie plan — disabled for now
    } catch (err) {
      setError((err as Error).message)
      setPlayerData(null)
      posthog.capture('player_not_found', { season_year: selectedYear })
      posthog.captureException(err as Error)
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

        {activeUser && (
          <p className="active-user-banner">
            Logged in as <strong>{activeUser.name}</strong> · Favorite team: {activeUser.favoriteTeam}
          </p>
        )}

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
          <YearSelector season={selectedYear} onChange={(year) => {
            setSelectedYear(year)
            posthog.capture('season_year_changed', { season_year: year })
          }} />
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