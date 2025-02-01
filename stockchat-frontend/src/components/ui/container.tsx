import * as React from "react"
import { cn } from "@/util/utils"

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function Container({ children, className, ...props }: ContainerProps) {
  return (
    <div 
      className={cn(
        "container mx-auto px-4 py-8",
        "max-w-7xl",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  )
} 