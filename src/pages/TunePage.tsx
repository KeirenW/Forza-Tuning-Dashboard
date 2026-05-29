import { useParams } from 'react-router-dom'

export default function TunePage() {
  const { carId, tuneId } = useParams()
  return (
    <div>
      <h1 className="h3">Tune Editor</h1>
      <p className="text-secondary">Car: {carId} / Tune: {tuneId}</p>
    </div>
  )
}
