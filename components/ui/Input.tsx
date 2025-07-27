type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
}

export const Input: React.FC<Props> = ({ label, ...props }) => {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm text-gray-800 font-medium">{label}</label>}
      <input className="text-sm text-gray-800 px-4 py-2 rounded-md border border-gray-300 focus:border-gray-400 placeholder:text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600 transition"
        {...props}
      />
    </div>
  )
}
