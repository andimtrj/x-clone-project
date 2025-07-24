"use client";
import { DatePicker } from "@/components/datepicker";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import getConfig from "@/firebase/config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { AlertCircleIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    displayName: "",
    age: "",
    dob: null,
  });
  const [error, setError] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validate = async () => {
    const newErrors = {};

    if (!form.displayName) {
      newErrors.displayName = "Full name is required";
    } else if (form.displayName.length < 6) {
      newErrors.displayName = "Full name must be more than 5 characters";
    }

    if (!form.username) {
      newErrors.username = "Username is required";
    } else {
      const { db } = getConfig();
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", form.username));
      const usernameSnapshot = await getDocs(q);

      if (!usernameSnapshot.empty) {
        newErrors.username = "Username is already taken";
      }
    }

    if (!form.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!form.age || parseInt(form.age) < 1) {
      newErrors.age = "Enter a valid age";
    } else if (parseInt(form.age) < 17) {
      newErrors.age = "You must be at least 17 years old";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Confirm your password";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!form.dob) {
      newErrors.dob = "Date of birth is required";
    } else {
      const age = new Date().getFullYear() - form.dob.getFullYear();
      if (age < 17) {
        newErrors.dob = "You must be at least 17 years old";
      }
    }
    setIsLoading(false);
    return newErrors;
  };

  const handleDateChange = (date) => {
    const today = new Date();
    const birthDate = new Date(date);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    setForm((prev) => ({
      ...prev,
      dob: date,
      age: age.toString(),
    }));

    setError((prev) => ({
      ...prev,
      dob: "",
      age: "",
    }));
  };

  const handleRegister = async () => {
    setSubmitted(true); // Mark form as submitted
    setIsLoading(true);
    setError({});
    const validationErrors = await validate();

    if (Object.keys(validationErrors).length > 0) {
      setError(validationErrors);
      setIsLoading(false);
      return;
    }

    const { db, auth } = getConfig();

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        age: form.age,
        displayName: form.displayName,
        dob: form.dob.toISOString().split("T")[0],
        username: form.username,
      });

      router.push("/home");
    } catch (err) {
      setError({ register: err.message || "Registration failed" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <Card className="w-1/4 mb-4">
        <CardHeader>
          <CardTitle className="text-3xl">Create your account</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRegister();
            }}
          >
            <Input
              placeholder="Email"
              type="email"
              name="email"
              className="mb-2"
              onChange={handleChange}
              value={form.email}
            />

            <Input
              placeholder="Username"
              type="text"
              name="username"
              className="mb-2"
              onChange={handleChange}
              value={form.username}
            />

            <div className="flex gap-2">
              <Input
                placeholder="Password"
                type="password"
                name="password"
                className="mb-2"
                onChange={handleChange}
                value={form.password}
              />

              <Input
                placeholder="Confirm Password"
                type="password"
                name="confirmPassword"
                className="mb-2"
                onChange={handleChange}
                value={form.confirmPassword}
              />
            </div>

            <Input
              placeholder="Full name"
              type="text"
              name="displayName"
              className="mb-4"
              onChange={handleChange}
              value={form.displayName}
            />

            <div className="mb-4 flex items-end gap-2">
              <DatePicker value={form.dob} onChange={handleDateChange} />

              <Input
                placeholder="Age"
                type="number"
                name="age"
                disabled
                onChange={handleChange}
                value={form.age}
              />
            </div>

            <Button type="submit" className="w-full mb-4 cursor-pointer">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin h-4 w-4" />
                  Registering
                </div>
              ) : (
                "Register"
              )}
            </Button>

            <p className="w-full text-center">
              Already have an account?{" "}
              <span
                onClick={() => router.push("/signin")}
                className="text-blue-400 underline hover:cursor-pointer"
              >
                Sign in
              </span>
            </p>
          </form>
        </CardContent>
      </Card>
      {submitted && Object.values(error).some((e) => e) && (
        <Alert variant="destructive" className="w-1/4">
          <AlertCircleIcon />
          <AlertTitle>Unable to process your registration.</AlertTitle>
          <AlertDescription>
            <p>Please verify information and try again.</p>
            <ul className="list-inside list-disc text-sm">
              {error.email && <li>{error.email}</li>}
              {error.username && <li>{error.username}</li>}
              {error.password && <li>{error.password}</li>}
              {error.confirmPassword && <li>{error.confirmPassword}</li>}
              {error.displayName && <li>{error.displayName}</li>}
              {error.age && <li>{error.age}</li>}
              {error.dob && <li>{error.dob}</li>}
              {error.register && <li>{error.register}</li>}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
