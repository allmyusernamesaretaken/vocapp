import { cn } from '../../lib/utils'

export function Input({ className, type = 'text', ...props }) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-11 w-full rounded-xl border-2 border-stone-200 bg-white px-4 py-2.5 text-sm ring-offset-white placeholder:text-stone-400 focus-visible:outline-none focus-visible:border-stone-400 focus-visible:ring-2 focus-visible:ring-stone-400/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-700 dark:bg-stone-900 dark:ring-offset-stone-950 dark:placeholder:text-stone-500 dark:focus-visible:border-stone-500 dark:focus-visible:ring-stone-500/30',
        className
      )}
      {...props}
    />
  )
}
