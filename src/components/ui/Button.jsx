import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-stone-300 dark:focus-visible:ring-offset-stone-950',
  {
    variants: {
      variant: {
        default: 'bg-stone-900 text-white shadow-md shadow-stone-900/20 hover:bg-stone-800 hover:shadow-stone-900/30 dark:bg-stone-100 dark:text-stone-900 dark:shadow-stone-950/30 dark:hover:bg-stone-200',
        destructive: 'bg-red-600 text-white shadow-sm hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600',
        outline: 'border-2 border-stone-200 bg-white hover:bg-stone-50 hover:border-stone-300 dark:border-stone-700 dark:bg-stone-900 dark:hover:bg-stone-800 dark:hover:border-stone-600',
        secondary: 'bg-stone-200 text-stone-800 hover:bg-stone-300 dark:bg-stone-700 dark:text-stone-200 dark:hover:bg-stone-600',
        ghost: 'hover:bg-stone-200/80 dark:hover:bg-stone-800'
      },
      size: {
        default: 'h-11 px-5 py-2',
        sm: 'h-9 rounded-lg px-3',
        lg: 'h-12 rounded-xl px-8',
        icon: 'h-10 w-10'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

export function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}
