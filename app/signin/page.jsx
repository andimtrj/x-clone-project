'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import React from "react";

export default function SignIn() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <Card className={"w-1/4"}>
        <CardHeader>
          <CardTitle className={"text-3xl"}>Sign in to X</CardTitle>
        </CardHeader>
        <CardContent>
          <Input placeholder="Username" type="text" className={"mb-4"} />
          <Input placeholder="Password" type="password" className={"mb-4"} />
          <Button className={"w-full mb-4"}>Sign In</Button>
          <p className="w-full text-center">
            Don't have an account?{" "}
            <span
              onClick={() => router.push("/register")}
              className="text-blue-400 underline hover:cursor-pointer"
            >
              Register
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
