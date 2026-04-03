import Sidebar from './Sidebar'

export default function ModuleShell({ children }) {
  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
