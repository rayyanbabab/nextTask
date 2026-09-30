import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export const badgeVariants = cva(
  'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-tight transition-colors',
  {
    variants: {
      variant: {
        default:
          'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950',
        secondary:
          'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
        outline:
          'border border-zinc-200 text-zinc-700 dark:border-zinc-800 dark:text-zinc-300',
        brand:
          'bg-blue-50 text-blue-700 border border-blue-200/60 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-900/60',
        success:
          'bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900/60',
        warning:
          'bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900/60',
        destructive:
          'bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-900/60',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}
