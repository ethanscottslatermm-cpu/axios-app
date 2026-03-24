import Sidebar from './Sidebar'

export default function ModuleShell({ children }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex text-white">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
