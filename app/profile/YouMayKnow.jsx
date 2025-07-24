"use client";

import { useEffect, useState } from "react";
import getConfig from "@/firebase/config";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";

export default function YouMayKnow({ currentUserId }) {
  const { db } = getConfig();
  const [users, setUsers] = useState([]);
  const [currentFollowing, setCurrentFollowing] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get all users except current user
        const q = query(
          collection(db, "users"),
          where("uid", "!=", currentUserId)
        );
        const snap = await getDocs(q);
        const allUsers = snap.docs
          .map((doc) => doc.data())
          .filter((u) => u.uid !== currentUserId); // fallback

        setUsers(allUsers);

        // Get current user's following list
        const currentSnap = await getDoc(doc(db, "users", currentUserId));
        const currentData = currentSnap.data();
        setCurrentFollowing(currentData?.following || []);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    if (currentUserId) {
      fetchData();
    }
  }, [db, currentUserId]);

  const toggleFollow = async (targetUserId) => {
    try {
      const userRef = doc(db, "users", currentUserId);
      const newFollow = currentFollowing.includes(targetUserId)
        ? currentFollowing.filter((id) => id !== targetUserId)
        : [...currentFollowing, targetUserId];

      await updateDoc(userRef, { following: newFollow });
      setCurrentFollowing(newFollow);
    } catch (err) {
      console.error("Error updating following:", err);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">You May Know</h2>
      <div className="space-y-3">
        {users.map((user) => (
          <div
            key={user.uid}
            className="flex items-center justify-between border p-3 rounded-lg"
          >
            <div>
              <p className="font-medium">{user.displayName}</p>
              <p className="text-sm text-gray-500">@{user.username}</p>
            </div>
            <Button
              size="sm"
              onClick={() => toggleFollow(user.uid)}
              variant={
                currentFollowing.includes(user.uid) ? "secondary" : "default"
              }
            >
              {currentFollowing.includes(user.uid) ? "Unfollow" : "Follow"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
