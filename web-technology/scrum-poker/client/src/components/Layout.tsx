import { Link, Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <>
      <header className="app-header">
        <Link to="/" className="app-title">
          Scrum Poker
        </Link>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </>
  )
}
