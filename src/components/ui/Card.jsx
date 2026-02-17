import { cn } from '../../lib/utils'

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-stone-200/80 bg-white text-stone-950 shadow-lg shadow-stone-200/50 dark:border-stone-700/80 dark:bg-stone-900 dark:text-stone-50 dark:shadow-stone-950/50',
        className
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }) {
  return (
    <div
      className={cn('flex flex-col space-y-1 p-5 pb-2', className)}
      {...props}
    />
  )
}

export function CardTitle({ className, ...props }) {
  return (
    <h3
      className={cn('text-xl font-bold tracking-tight text-stone-900 dark:text-stone-50', className)}
      {...props}
    />
  )
}

export function CardContent({ className, ...props }) {
  return (
    <div
      className={cn('px-5 pb-5 pt-1', className)}
      {...props}
    />
  )
}
