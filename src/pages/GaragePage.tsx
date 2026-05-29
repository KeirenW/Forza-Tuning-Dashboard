export default function GaragePage() {
  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0">Garage</h1>
        <button className="btn btn-primary" type="button" disabled>
          + Add Car
        </button>
      </div>
      <p className="text-secondary">No cars yet. Add your first car to get started.</p>
    </div>
  )
}
