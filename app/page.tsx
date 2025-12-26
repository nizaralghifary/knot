/* eslint-disable @typescript-eslint/no-unused-vars */

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Atom, Sigma, ChevronRightIcon, Settings } from "lucide-react";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import Link from "next/link";

export default async function Exams() {
  const session = await auth();

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <main className="min-h-screen p-4 md:p-6">
      <div className="flex items-center justify-between mb-8">
        <Link href="/" className="flex items-center gap-x-2">
          <h1 className="font-semibold text-2xl">Knot</h1>
        </Link>

        <div className="flex items-center">
          <a href="/settings" className="p-2">
            <Settings className="h-6 w-6" />
          </a>
        </div>
      </div>

      <div className="text-center mb-10">
        <p className="text-xl lg:text-2xl font-medium">
          Hi @{session?.user?.username || "Guest"} 👋🏻
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <Item variant="outline" asChild>
              <a href="#">
                <ItemMedia variant="icon">
                  <Sigma className="size-5" />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>Math Test</ItemTitle>
                  <ItemDescription>Do the Math Test</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <ChevronRightIcon className="size-4" />
                </ItemActions>
              </a>
            </Item>

            <Item variant="outline" asChild>
              <a href="#">
                <ItemMedia variant="icon">
                  <Atom className="size-5" />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>Physics Test</ItemTitle>
                  <ItemDescription>Do the Physics Test</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <ChevronRightIcon className="size-4" />
                </ItemActions>
              </a>
            </Item>
          </div>
        </section>
      </div>
    </main>
  );
}
