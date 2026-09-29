import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RequireAuth({ children, roles, allowPending = false }) {
  const { user, loading } = useAuth()

  if (loading) return null
  if (!user) return <Navigate to="/connexion" replace />

  if (user.account_status === 'rejected') return <Navigate to="/acces-refuse" replace />
  if (!allowPending && user.account_status === 'pending') {
    return <Navigate to="/compte-en-attente" replace />
  }

  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />

  return children
}
