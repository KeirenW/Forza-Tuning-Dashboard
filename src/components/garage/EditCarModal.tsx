import CarFormModal, { type CarFormValues } from './CarFormModal'
import { useGarageStore } from '../../store/garageStore'
import type { Car } from '../../types/car'

interface EditCarModalProps {
  car: Car
  onClose: () => void
}

export default function EditCarModal({ car, onClose }: EditCarModalProps) {
  const updateCar = useGarageStore((s) => s.updateCar)

  function handleSubmit(values: CarFormValues) {
    updateCar(car.id, {
      manufacturer: values.manufacturer,
      model: values.model,
      carClass: values.carClass,
      drivetrain: values.drivetrain,
      notes: values.notes || undefined,
    })
    onClose()
  }

  return (
    <CarFormModal
      title="Edit Car"
      initialValues={{
        manufacturer: car.manufacturer,
        model: car.model,
        carClass: car.carClass,
        drivetrain: car.drivetrain,
        notes: car.notes ?? '',
      }}
      onSubmit={handleSubmit}
      onCancel={onClose}
    />
  )
}
