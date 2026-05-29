import { useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { type ReactNode } from 'react'
import { useGarageStore } from '../../store/garageStore'
import { useTuneStore } from '../../store/tuneStore'
import { useToastStore } from '../../store/toastStore'
import { exportData, importData, type ExportData } from '../../utils/export'
import ConfirmDeleteModal from './ConfirmDeleteModal'
import ToastContainer from './ToastContainer'

interface AppShellProps {
  children: ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  const cars     = useGarageStore((s) => s.cars)
  const setCars  = useGarageStore((s) => s.setCars)
  const tunes    = useTuneStore((s) => s.tunes)
  const setTunes = useTuneStore((s) => s.setTunes)
  const addToast = useToastStore((s) => s.addToast)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingImport, setPendingImport] = useState<ExportData | null>(null)

  function handleExport() {
    exportData(cars, tunes)
    addToast('Exported successfully', 'success')
  }

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    // Reset so same file can be re-imported if needed
    e.target.value = ''

    const reader = new FileReader()
    reader.onload = (evt) => {
      const text = evt.target?.result as string
      const data = importData(text)
      if (!data) {
        addToast('Import failed — invalid or incompatible file', 'danger')
        return
      }
      setPendingImport(data)
    }
    reader.readAsText(file)
  }

  function handleConfirmImport() {
    if (!pendingImport) return
    setCars(pendingImport.cars)
    setTunes(pendingImport.tunes)
    setPendingImport(null)
    addToast('Data imported successfully', 'success')
  }

  return (
    <>
      <nav className="navbar navbar-expand-md bg-body-secondary border-bottom mb-4">
        <div className="container-xl">
          <Link to="/" className="navbar-brand">
            ⏱ FH6 Tune Tracker
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#main-nav"
            aria-controls="main-nav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div className="collapse navbar-collapse" id="main-nav">
            <ul className="navbar-nav me-auto mb-2 mb-md-0">
              <li className="nav-item">
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    'nav-link' + (isActive ? ' active' : '')
                  }
                >
                  Garage
                </NavLink>
              </li>
            </ul>

            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary btn-sm" type="button" onClick={handleExport}>
                Export
              </button>
              <button className="btn btn-outline-secondary btn-sm" type="button" onClick={handleImportClick}>
                Import
              </button>
              {/* Hidden file input for import */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="d-none"
                onChange={handleFileChange}
              />
            </div>
          </div>
        </div>
      </nav>

      <main className="container-xl pb-5">{children}</main>

      {pendingImport && (
        <ConfirmDeleteModal
          title="Replace all data?"
          message={`This will overwrite all current cars and tunes with the imported data (${pendingImport.cars.length} car${pendingImport.cars.length !== 1 ? 's' : ''}, ${pendingImport.tunes.length} tune${pendingImport.tunes.length !== 1 ? 's' : ''}). This cannot be undone.`}
          onConfirm={handleConfirmImport}
          onCancel={() => setPendingImport(null)}
        />
      )}

      <ToastContainer />
    </>
  )
}
