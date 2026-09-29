import { useAuth } from '../../context/AuthContext'
import StudentDashboard from './StudentDashboard'
import TeacherDashboard from './TeacherDashboard'
import AdminDashboard from './AdminDashboard'

export default function Dashboard() {
  const { user } = useAuth()

  if (user.role === 'teacher') return <TeacherDashboard />
  if (user.role === 'admin') return <AdminDashboard />
  return <StudentDashboard />
}
