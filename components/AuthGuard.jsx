"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import getConfig from "@/firebase/config";
import { Button } from "./ui/button";

export default function AuthGuard({ children }) {
  const { auth } = getConfig();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(null); // null = loading

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthorized(true);
      } else {
        setAuthorized(false);
      }
    });

    return () => unsubscribe();
  }, [auth, router]);

  if (authorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl font-semibold">Checking authentication...</p>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-xl font-semibold">
          Unauthorized access. Please sign in!
        </p>
        <Button onClick={()=>router.push('/signin')}>
          Sign In
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
