import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignOut() {
  const router = useRouter();

  useEffect(() => {
    async function handleLogout() {
      await signOut({ redirect: false });
      router.push("/sign-in");
    }

    handleLogout();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-md font-semibold">Logging out...</p>
    </div>
  );
}