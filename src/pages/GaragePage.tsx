import { useState } from 'react'
import { useGarageStore } from '../store/garageStore'
import { useTuneStore } from '../store/tuneStore'
import CarCard from '../components/garage/CarCard'
import CreateCarModal from '../components/garage/CreateCarModal'
import EditCarModal from '../components/garage/EditCarModal'
import ConfirmDeleteModal from '../components/shared/ConfirmDeleteModal'
import type { Car } from '../types/car'

export default function GaragePage() {
  const cars = useGarageStore((s) => s.cars)
  const deleteCar = useGarageStore((s) => s.deleteCar)
  const allTunes = useTuneStore((s) => s.tunes)
  const deleteTunesByCarId = useTuneStore((s) => s.deleteTunesByCarId)

  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Car | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Car | null>(null)

  function handleConfirmDelete() {
    if (!deleteTarget) return
    deleteTunesByCarId(deleteTarget.id)
    deleteCar(deleteTarget.id)
    setDeleteTarget(null)
  }

  return (
    <div>
      {/* Page header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0">Garage</h1>
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => setCreateOpen(true)}
        >
          + Add Car
        </button>
      </div>

      {/* Car grid */}
      {cars.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-secondary mb-3">No cars yet. Add your first car to get started.</p>
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => setCreateOpen(true)}
          >
            + Add Car
          </button>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
          {cars.map((car) => (
            <div key={car.id} className="col">
              <CarCard
                car={car}
                tunes={allTunes.filter((t) => t.carId === car.id)}
                onEdit={(c) => setEditTarget(c)}
                onDelete={(c) => setDeleteTarget(c)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {createOpen && (
        <CreateCarModal onClose={() => setCreateOpen(false)} />
      )}

      {editTarget && (
        <EditCarModal car={editTarget} onClose={() => setEditTarget(null)} />
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          title="Delete Car"
          message={`Delete "${deleteTarget.manufacturer} ${deleteTarget.model}"? This will also remove all associated tunes and cannot be undone.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
