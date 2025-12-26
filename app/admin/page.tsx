import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminPanel() {
    const session = await auth();

    if (!session || session?.user.role !== "admin") {
        redirect("/");
    }

    return (
        <main className="relative min-h-screen flex">
            <div className="flex-1 space-y-4 px-8 py-6 lg:gap-10 lg:px-0 lg:py-8 xl:grid xl:grid-cols-[1fr_300px]">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-x-2">
                        <h1 className="font-semibold text-2xl">Knot for Admin</h1>
                    </Link>
                </div>
            </div>
        </main>
    );
}