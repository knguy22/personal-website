import { cn } from "@/lib/utils"

interface BorderedProps {
  children?: React.ReactNode;
  classname?: string
}

export function Bordered({ children, classname }: BorderedProps) {
  return (
    <div className={cn("flex items-center w-full h-12 overflow-x-auto text-wrap rounded-md border border-input bg-background px-3 text-md ring-offset-background", classname)}>
      {children}
    </div>
  )
}
