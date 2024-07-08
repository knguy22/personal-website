import * as React from "react"
import Link from "next/link"
import { 
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu"

import { getServerSession } from "next-auth"
import { authOptions } from "../../app/api/auth/[...nextauth]/options"
import ThemeToggle from "./ThemeToggle"

const about_me_components: { title: string; href: string}[] = [
  {
    title: "About Me",
    href: "/about-me",
  },
  {
    title: "Education",
    href: "/about-me/education",
  },
  {
    title: "Experience",
    href: "/about-me/experience",
  },
  {
    title: "Projects",
    href: "/about-me/projects",
  },
  {
    title: "Hobbies",
    href: "/about-me/hobbies",
  },
]


export default async function NavBar() {
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
          <NavigationMenuTrigger>About Me</NavigationMenuTrigger>
          <NavigationMenuContent className="">
            <ul className="p-3">
              {
                about_me_components.map((item) => (
                  <li>
                    <NavigationMenuLink asChild key={item.title}>
                      <a href={item.href} className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="text-sm font-medium leading-none">
                          {item.title}
                        </div>
                      </a>
                    </NavigationMenuLink>
                  </li>
                ))
              }
            </ul>
          </NavigationMenuContent>
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