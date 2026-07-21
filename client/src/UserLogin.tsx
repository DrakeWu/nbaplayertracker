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
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null)

  const [editName, setEditName] = useState('')
  const [editTeam, setEditTeam] = useState('')

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

      setLoggedInUser(match)
      setEditName(match.name)
      setEditTeam(match.favoriteTeam)
      setError(null)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  async function handleSaveProfile() {
    if (!loggedInUser) return

    try {
      const idPart = loggedInUser.id.split(':').pop()
      const res = await fetch(`/api/users/${idPart}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, favoriteTeam: editTeam }),
      })
      if (!res.ok) throw new Error('Failed to save profile')
      const updated = await res.json()
      onLogin(updated) // pass the final, updated user back up to App
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        {!loggedInUser ? (
          <>
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
            <button type="button" onClick={handleLogin}>Log In</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </>
        ) : (
          <>
            <h2>Edit Profile</h2>
            <p className="active-user-info">
              Logged in as <strong>{loggedInUser.name}</strong> · Favorite team: {loggedInUser.favoriteTeam}
            </p>
            <input
              type="text"
              placeholder="Name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Favorite team"
              value={editTeam}
              onChange={(e) => setEditTeam(e.target.value)}
            />
            {error && <p className="error">{error}</p>}
            <button type="button" onClick={handleSaveProfile}>Save</button>
            <button type="button" onClick={onClose}>Done</button>
          </>
        )}
      </div>
    </div>
  )
}

export default UserLogin