import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const nav = useNavigate()
  return (
    <div className="min-h-[60vh] grid place-items-center text-center">
      <div>
        <div className="text-6xl font-extrabold bg-grad bg-clip-text text-transparent">404</div>
        <h1 className="text-xl font-bold mt-3">Page not found</h1>
        <p className="text-muted text-sm mt-1 mb-5">That route doesn't exist in PULSE.</p>
        <button className="btn btn-primary" onClick={() => nav('/')}>Back to Dashboard</button>
      </div>
    </div>
  )
}
