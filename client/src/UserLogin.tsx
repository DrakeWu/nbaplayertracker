import { useState } from 'react'

interface User {
  id: string
  name: string
  favoriteTeam: string
  favoritePlayers: number[]
}

interface UserLoginProps {
  onLogin: (user: User) => void
  onClose: () => void
}

function UserLogin({ onLogin, onClose }: UserLoginProps) {
  const [username, setUsername] = useState('')
  const [team, setTeam] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleLogin() {
    try {
      const res = await fetch('/api/users')
      const users: User[] = await res.json()

      const match = users.find(
        (u) =>
          u.name.toLowerCase() === username.toLowerCase() &&
          u.favoriteTeam.toLowerCase() === team.toLowerCase()
      )

      if (!match) {
        throw new Error('Incorrect username or favorite team')
      }

      await fetch('/api/active-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: match.id }),
      })

      onLogin(match)
      setError(null)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Log In</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Favorite team"
          value={team}
          onChange={(e) => setTeam(e.target.value)}
        />
        {error && <p className="error">{error}</p>}
        <button onClick={handleLogin}>Log In</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}

export default UserLogin