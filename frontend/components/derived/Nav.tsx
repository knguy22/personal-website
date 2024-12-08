import * as React from "react"
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

const novels_components: { title: string; href: string}[] = [
  {
    title: "My Stats",
    href: "/novels/novels-stats",
  },
  {
    title: "My List",
    href: "/novels/novels-list",
  },
]

export default async function NavBar() {
  const session = await getServerSession(authOptions);
  const authLink = session ? "/api/auth/signout?callbackUrl=/" : "/api/auth/signin";
  const authText = session ? "Sign Out" : "Sign In";

  return (
    <NavigationMenu className='justify-between'>
      <NavigationMenuList className="flex-wrap pl-4">
        <NavigationMenuItem key="home">
          <NavigationMenuLink href="/" className={navigationMenuTriggerStyle()}>
            Home
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem key="Webnovels">
          <NavigationMenuTrigger>Webnovels</NavigationMenuTrigger>
          <NavigationMenuContent className="">
            <ul className="p-3">
              {novels_components.map((item) => (
                <ListItem key={item.title} href={item.href} title={item.title}/>)
              )}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>


      <NavigationMenuList className="flex pr-5">
        <NavigationMenuItem key="theme" className="px-4">
          <ThemeToggle/>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink key='auth' href={authLink} className={navigationMenuTriggerStyle()}>
            {authText}
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ title, ...props }, href) => {
  return (
    <li>
      <NavigationMenuLink asChild key={title}>
        <a 
          ref={href} 
          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
          {...props}
        >
          <div className="text-sm font-medium leading-none">
            {title}
          </div>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"