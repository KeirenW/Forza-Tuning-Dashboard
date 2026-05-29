import { useParams } from 'react-router-dom'

export default function ComparePage() {
  const { carId } = useParams()
  return (
    <div>
      <h1 className="h3">Compare Tunes</h1>
      <p className="text-secondary">Car: {carId}</p>
    </div>
  )
}
