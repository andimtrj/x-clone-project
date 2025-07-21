'use client'
import { Button } from "@/components/ui/button";
import getConfig from "@/firebase/config";
import { collection, getDocs } from "firebase/firestore";
import Image from "next/image";
import { useRouter } from "next/navigation";


export default async function Home() {
  const router = useRouter()
  const { db } = getConfig();
  const foodsCol = collection(db, "foods");
  const usersCol = collection(db, "users");
  const foodsSnapshot = await getDocs(foodsCol);
  const usersSnapshot = await getDocs(usersCol);

  const users = usersSnapshot.docs.map((doc) => doc.data());

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <h1 className="text-xl font-light">Nothing here!</h1>
      <Button onClick={()=>router.push('/signin')}>Go Sign In!</Button>
    </div>
  );
}
