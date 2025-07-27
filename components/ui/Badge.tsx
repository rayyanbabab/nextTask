export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-block rounded-full text-xs font-medium ${className}`}>
      {children}
    </span>
  )
}
