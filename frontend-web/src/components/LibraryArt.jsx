import campusImage from '../assets/student-reading-online.jpeg'

export default function LibraryArt({ className = '' }) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-outline-variant ${className}`}
    >
      <img src={campusImage} alt="Étudiants consultant des ressources numériques sur le campus" className="h-full w-full object-cover" />
    </div>
  )
}
