"use client";
import AuthGuard from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import getConfig from "@/firebase/config";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { auth } = getConfig();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/signin");
  };

  return (
    <AuthGuard>
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl mb-4">Welcome to Home</h1>
        <Button onClick={handleLogout}>Log Out</Button>
      </div>
    </AuthGuard>
  );
}
