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
    <main className="relative min-h-screen flex">
      <div className="flex-1 space-y-4 px-8 py-6 lg:gap-10 lg:px-0 lg:py-8 xl:grid xl:grid-cols-[1fr_300px]">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-x-2">
            <h1 className="font-semibold text-2xl">Knot</h1>
          </Link>

          <div className="flex items-center">
            <a href="/settings">
              <Settings className="flex-auto" />
            </a>
          </div>
        </div>

        <div>
          <p className="text-xl text-center">
            Hi @{session?.user?.username || "Guest"} 👋🏻
          </p>
        </div>

        <div className="mx-auto w-full min-w-0 max-w-2xl space-y-4">
          <section className="space-y-2">
            <div className="flex w-full max-w-md grid md:flex gap-6">
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
      </div>
    </main>
  );
}
