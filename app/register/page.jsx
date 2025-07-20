'use client';
import { DatePicker } from "@/components/datepicker";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <Card className={"w-1/4"}>
        <CardHeader>
          <CardTitle className={"text-3xl"}>Create your account</CardTitle>
        </CardHeader>
        <CardContent>
          <Input placeholder="Email" type="email" className={"mb-4"} />
          <Input placeholder="Username" type="text" className={"mb-4"} />
          {/* <Input placeholder="Full name" type="text" className={"mb-4"} /> */}
          <Input placeholder="Password" type="password" className={"mb-4"} />
          <Input
            placeholder="Confirm Password"
            type="password"
            className={"mb-4"}
          />
          {/* <DatePicker/> */}
          <Button className={'w-full mb-4'}>Register</Button>
          <p className="w-full text-center">Already have an account? <span onClick={() => router.push('/signin')} className="text-blue-400 underline hover:cursor-pointer">Sign in</span></p>
        </CardContent>
      </Card>
    </div>
  );
}
