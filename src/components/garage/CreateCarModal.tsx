import { nanoid } from 'nanoid'
import CarFormModal, { type CarFormValues } from './CarFormModal'
import { useGarageStore } from '../../store/garageStore'

interface CreateCarModalProps {
  onClose: () => void
}

export default function CreateCarModal({ onClose }: CreateCarModalProps) {
  const addCar = useGarageStore((s) => s.addCar)

  function handleSubmit(values: CarFormValues) {
    addCar({
      id: nanoid(),
      manufacturer: values.manufacturer,
      model: values.model,
      carClass: values.carClass,
      drivetrain: values.drivetrain,
      notes: values.notes || undefined,
      createdAt: new Date().toISOString(),
    })
    onClose()
  }

  return (
    <CarFormModal
      title="Add Car"
      onSubmit={handleSubmit}
      onCancel={onClose}
    />
  )
}
