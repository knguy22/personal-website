'use client'

import * as React from "react"
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu"
import { ThemeToggle } from "./theme-toggle"

export function AppNavBar() {
    return (
        <NavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <NavigationMenuLink href="/" className={navigationMenuTriggerStyle()}>
                        Home
                    </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavigationMenuLink href="/novels" className={navigationMenuTriggerStyle()}>
                        My Webnovels List
                    </NavigationMenuLink>
                </NavigationMenuItem>
            </NavigationMenuList>

            <ThemeToggle className="absolute right-10"/>
        </NavigationMenu>
    )
}