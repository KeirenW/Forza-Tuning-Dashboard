import { useState, useEffect } from 'react'
import type { CarClass, Drivetrain } from '../../types/car'
import { CAR_CLASSES, DRIVETRAINS } from '../../types/car'

export interface CarFormValues {
  manufacturer: string
  model: string
  carClass: CarClass
  drivetrain: Drivetrain
  notes: string
}

const DEFAULT_VALUES: CarFormValues = {
  manufacturer: '',
  model: '',
  carClass: 'A',
  drivetrain: 'RWD',
  notes: '',
}

interface CarFormModalProps {
  title: string
  initialValues?: Partial<CarFormValues>
  onSubmit: (values: CarFormValues) => void
  onCancel: () => void
}

export default function CarFormModal({
  title,
  initialValues,
  onSubmit,
  onCancel,
}: CarFormModalProps) {
  const [values, setValues] = useState<CarFormValues>({
    ...DEFAULT_VALUES,
    ...initialValues,
  })
  const [validated, setValidated] = useState(false)

  // Sync initialValues when modal re-opens with a different car
  useEffect(() => {
    setValues({ ...DEFAULT_VALUES, ...initialValues })
    setValidated(false)
  }, [initialValues])

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!e.currentTarget.checkValidity()) {
      setValidated(true)
      return
    }
    onSubmit(values)
  }

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop fade show" onClick={onCancel} />

      {/* Modal */}
      <div className="modal fade show d-block" tabIndex={-1} role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header border-bottom">
              <h5 className="modal-title">{title}</h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={onCancel}
              />
            </div>

            <form
              noValidate
              className={validated ? 'was-validated' : ''}
              onSubmit={handleSubmit}
            >
              <div className="modal-body d-flex flex-column gap-3">
                {/* Manufacturer */}
                <div>
                  <label htmlFor="cf-manufacturer" className="form-label">
                    Manufacturer <span className="text-danger">*</span>
                  </label>
                  <input
                    id="cf-manufacturer"
                    name="manufacturer"
                    type="text"
                    className="form-control"
                    value={values.manufacturer}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Toyota"
                  />
                  <div className="invalid-feedback">Manufacturer is required.</div>
                </div>

                {/* Model */}
                <div>
                  <label htmlFor="cf-model" className="form-label">
                    Model <span className="text-danger">*</span>
                  </label>
                  <input
                    id="cf-model"
                    name="model"
                    type="text"
                    className="form-control"
                    value={values.model}
                    onChange={handleChange}
                    required
                    placeholder="e.g. GR Yaris"
                  />
                  <div className="invalid-feedback">Model is required.</div>
                </div>

                {/* Class + Drivetrain row */}
                <div className="row g-3">
                  <div className="col-6">
                    <label htmlFor="cf-carClass" className="form-label">
                      Class
                    </label>
                    <select
                      id="cf-carClass"
                      name="carClass"
                      className="form-select"
                      value={values.carClass}
                      onChange={handleChange}
                    >
                      {CAR_CLASSES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-6">
                    <label htmlFor="cf-drivetrain" className="form-label">
                      Drivetrain
                    </label>
                    <select
                      id="cf-drivetrain"
                      name="drivetrain"
                      className="form-select"
                      value={values.drivetrain}
                      onChange={handleChange}
                    >
                      {DRIVETRAINS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label htmlFor="cf-notes" className="form-label">
                    Notes
                  </label>
                  <textarea
                    id="cf-notes"
                    name="notes"
                    className="form-control"
                    rows={3}
                    value={values.notes}
                    onChange={handleChange}
                    placeholder="Optional notes…"
                  />
                </div>
              </div>

              <div className="modal-footer border-top">
                <button type="button" className="btn btn-secondary" onClick={onCancel}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
