import { useParams } from 'react-router-dom'

export default function CarPage() {
  const { carId } = useParams()
  return (
    <div>
      <h1 className="h3">Car</h1>
      <p className="text-secondary">Car ID: {carId}</p>
    </div>
  )
}
