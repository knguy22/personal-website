import * as React from "react"
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu"
import { getServerSession } from "next-auth"
import { usePathname } from 'next/navigation';
import { authOptions } from "./api/auth/[...nextauth]/options"
import { ThemeToggle } from "./theme-toggle"

export async function AppNavBar() {
    const session = await getServerSession(authOptions);
    const authLink = session ? "/api/auth/signout?callbackUrl=/" : "/api/auth/signin";
    const authText = session ? "Sign Out" : "Sign In";

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

            <div className="absolute right-10">
                <NavigationMenuList>
                    <NavigationMenuItem className="px-4">
                        <ThemeToggle/>
                    </NavigationMenuItem>

                    <NavigationMenuItem>
                        <NavigationMenuLink href={authLink}>
                            {authText}
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </div>
        </NavigationMenu>
    )
}