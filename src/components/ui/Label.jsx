import * as LabelPrimitive from '@radix-ui/react-label'
import { cn } from '../../lib/utils'

export function Label({ className, ...props }) {
  return (
    <LabelPrimitive.Root
      className={cn(
        'text-sm font-semibold leading-none text-stone-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-stone-300',
        className
      )}
      {...props}
    />
  )
}
