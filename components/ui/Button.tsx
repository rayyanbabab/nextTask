import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-black text-white hover:bg-neutral-800',
        outline: 'border border-gray-300 text-black hover:bg-gray-100',
        ghost: 'bg-transparent hover:bg-gray-100 text-black',
        link: 'bg-transparent text-sky-600 hover:underline p-0 h-auto',
        destructive: 'bg-red-600 text-white hover:bg-red-800'
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        responsive: 'px-3 py-2 text-sm sm:px-4 sm:py-2 sm:text-base',
        icon: 'w-10 h-10 rounded-full flex items-center justify-center',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>

export const Button: React.FC<ButtonProps> = ({
  className,
  variant,
  size,
  ...props
}) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}
