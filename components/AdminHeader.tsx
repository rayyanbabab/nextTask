export default function AdminHeader() {
  return (
    <header className="h-16 w-full bg-white border-b border-gray-200 flex items-center px-4 md:px-6 fixed top-0 left-0 lg:left-64 right-0 z-10">
      {/* Indent title on mobile to avoid hamburger overlap */}
      <h1 className="pl-12 lg:pl-0 text-lg font-semibold text-gray-800">Welcome, Admin</h1>
    </header>
  )
}
