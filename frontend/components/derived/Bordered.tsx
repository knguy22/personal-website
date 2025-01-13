import { cva, VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const borderedVariants = cva(
  "rounded-md border border-input bg-background px-3 text-md ring-offset-background",
  {
    variants: {
      size: {
        default: "h-12",
        sm: "h-10 p-2",
      },
      flex: {
        default: "flex items-center w-full overflow-x-auto text-wrap",
        empty: "",
      },
    },
    defaultVariants: {
      size: "default",
      flex: "default",
    },
  }
)

interface BorderedProps extends VariantProps<typeof borderedVariants> {
  children?: React.ReactNode;
  classname?: string
}

export function Bordered({ children, classname, size, flex}: BorderedProps) {
  return (
    <div className={cn(borderedVariants({size, flex}), classname)}>
      {children}
    </div>
  )
}
