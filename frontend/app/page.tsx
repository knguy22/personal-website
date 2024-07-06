import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu"
import Link from "next/link";

export default function Home() {
  return (
    <main className="">
      <div className="text-5xl font-bold flex-col items-center text-center justify-between p-24">
        Hello, World. This is intermittence.
      </div>
    </main>
  );
}
