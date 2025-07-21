"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
import getConfig from "@/firebase/config";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function SignIn() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
    setErrors({});
  };

  const handleLogin = async () => {
    setSubmitted(true);
    const { auth, db } = getConfig();

    if (!form.username || !form.password) {
      setErrors({ login: "Username and password are required." });
      return;
    }

    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", form.username));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setErrors({ login: "Username not found." });
        return;
      }

      const userData = snapshot.docs[0].data();
      const email = userData.email;

      await signInWithEmailAndPassword(auth, email, form.password);
      router.push("/home");
    } catch (error) {
      setErrors({
        login: error.message || "Login failed. Please try again.",
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <Card className="w-1/4">
        <CardHeader>
          <CardTitle className="text-3xl">Sign in to X</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Username"
            type="text"
            name="username"
            className="mb-2"
            onChange={handleChange}
            value={form.username}
          />
          <Input
            placeholder="Password"
            type="password"
            name="password"
            className="mb-4"
            onChange={handleChange}
            value={form.password}
          />
          <Button className="w-full mb-4" onClick={handleLogin}>
            Sign In
          </Button>
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

      {submitted && errors.login && (
        <Alert variant="destructive" className="w-1/4 mt-4">
          <AlertCircleIcon />
          <AlertTitle>Unable to sign in.</AlertTitle>
          <AlertDescription>
            <p>Please check your credentials and try again.</p>
            <ul className="list-inside list-disc text-sm">
              <li>{errors.login}</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
