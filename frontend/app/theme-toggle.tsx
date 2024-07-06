"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

type themes = 'light' | 'dark';

interface ThemeToggleProps {
    className?: string
}

export function ThemeToggle( { className }: ThemeToggleProps ) {

  const { setTheme } = useTheme()

  return (
    <Button 
        className={className}
        variant="outline"
        size="icon" 
        onClick={() => setTheme(() => {
            const local_theme = localStorage.getItem('theme') as themes;
            return local_theme === 'light' ? 'dark' : 'light';
            })
        }
    >
        <Sun className="h-[1.3rem] w-[1.3rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.3rem] w-[1.3rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
