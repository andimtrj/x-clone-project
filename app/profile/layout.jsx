"use client";
import { Button } from "@/components/ui/button";
import getConfig from "@/firebase/config";
import { signOut } from "firebase/auth";
import { Bookmark, Earth, House, User } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import useUser from "@/hooks/useUser"; 
import Image from "next/image";

export default function HomeLayout({ children }) {
  const { auth } = getConfig();
  const router = useRouter();
  const user = useUser(); // ambil data user

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/signin");
  };

  return (
    <div className="flex min-h-screen">
      {/* sidebar */}
      <div className="w-1/6 h-screen flex flex-col justify-between px-5 py-8 border-r border-gray-200">
        <div>
          <h3 className="font-bold mb-5 ml-3 text-2xl">X Clone</h3>
          <div className="flex flex-col gap-1 text-lg">
            <a
              href="/home"
              className="flex gap-3 items-center hover:bg-gray-200 px-3 py-2 rounded-xl"
            >
              <House /> Home
            </a>
            <a
              href="/explore"
              className="flex gap-3 items-center hover:bg-gray-200 px-3 py-2 rounded-xl"
            >
              <Earth /> Explore
            </a>
            <a
              href="/bookmark"
              className="flex gap-3 items-center hover:bg-gray-200 px-3 py-2 rounded-xl"
            >
              <Bookmark /> Bookmark
            </a>
          </div>
        </div>
        <div className="px-3 text-sm">
          {user ? (
            <div className="flex hover:bg-gray-200 rounded-xl cursor-pointer" onClick={() => router.push(`/profile/${user.uid}`)}>
              <Image src={''} alt={'Profile Picture'} width={24} height={24}/>
              <div className="mb-2 flex flex-col gap-1">
                <p className="font-semibold">{user.displayName}</p>
                <p className="text-gray-500">@{user.username}</p>
              </div>
            </div>
          ) : (
            <p>Loading user...</p>
          )}
          <Button onClick={handleLogout} className="cursor-pointer w-full mt-2">
            Sign Out
          </Button>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-auto">{children}</div>
    </div>
  );
}
