import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu"
import Link from "next/link";
import { AppNavBar } from "./app-nav-bar";

export default function Home() {
  return (
    <main className="">
    <AppNavBar/>
    <div className="text-5xl font-bold flex-col items-center text-center justify-between p-24">
      Hello, World. This is intermittence.
    </div>

    </main>
  );
}
