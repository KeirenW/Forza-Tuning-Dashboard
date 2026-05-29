import { Link, NavLink } from 'react-router-dom'
import { type ReactNode } from 'react'

interface AppShellProps {
  children: ReactNode
}

export default function AppShell({ children }: AppShellProps) {
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
              <button className="btn btn-outline-secondary btn-sm" type="button" disabled>
                Export
              </button>
              <button className="btn btn-outline-secondary btn-sm" type="button" disabled>
                Import
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container-xl pb-5">{children}</main>
    </>
  )
}
