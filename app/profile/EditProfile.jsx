"use client";

import { useState } from "react";
import getConfig from "@/firebase/config";
import { doc, updateDoc } from "firebase/firestore";
import { updatePassword } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function EditProfileModal({
  userId,
  userData,
  onClose,
  onUpdate,
}) {
  const { db, auth } = getConfig();
  const [displayName, setDisplayName] = useState(userData.displayName || "");
  const [photoUrl, setPhotoUrl] = useState(userData.photoUrl || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSave = async () => {
    try {
      if (password && password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      const updates = {
        displayName,
        photoUrl,
      };

      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, updates);

      if (password) {
        await updatePassword(auth.currentUser, password);
      }

      onUpdate({ ...userData, ...updates });
      onClose();
    } catch (err) {
      setError("Failed to update profile: " + err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-400/80 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Profile</h2>

        <div className="space-y-3">
          <div>
            <label className="block font-medium">Display Name</label>
            <Input
              className="w-full"
              placeholder={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-medium">Username</label>
            <Input
              className="w-full bg-gray-100"
              value={userData.username}
              disabled
            />
          </div>

          <div>
            <label className="block font-medium">New Password</label>
            <Input
              type="password"
              className="w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-medium">Confirm Password</label>
            <Input
              type="password"
              className="w-full"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-medium">Photo URL</label>
            <Input
              className="w-full"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button onClick={onClose} className={'bg-gray-400 cursor-pointer hover:bg-red-400'}>Cancel</Button>
          <Button onClick={handleSave} className={'hover:bg-blue-400 cursor-pointer'}>Save</Button>
        </div>
      </div>
    </div>
  );
}
