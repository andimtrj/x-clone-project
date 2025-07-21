"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
import { useAuthState } from "react-firebase-hooks/auth";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { db, auth } = getConfig();
  const [currentUser] = useAuthState(auth);
  const params = useParams();
  const userId = params.id;

  const [userData, setUserData] = useState(null);
  const [userTweets, setUserTweets] = useState([]);
  const [showYouMayKnow, setShowYouMayKnow] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const tweetQuery = query(
          collection(db, "tweets"),
          where("userId", "==", userId)
        );
        const tweetSnap = await getDocs(tweetQuery);
        const tweets = tweetSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUserTweets(tweets);

        const userDoc = await getDoc(doc(db, "users", userId));
        setUserData(userDoc.data());

        // Show "You may know" only if visiting own profile
        if (currentUser?.uid === userId) setShowYouMayKnow(true);
      } catch (err) {
        console.error("Failed to fetch profile data", err);
      }
    };

    fetchProfile();
  }, [db, userId, currentUser?.uid]);

  if (!userData) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-xl mx-auto mt-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{userData.displayName}</h1>
        <p className="text-gray-600">@{userData.username}</p>
        <p className="text-sm text-gray-400">{userData.email}</p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Posts</h2>
        <div className="space-y-4">
          {userTweets.map((tweet) => (
            <div key={tweet.id} className="border p-4 rounded-lg">
              <p>{tweet.content}</p>
              <p className="text-xs text-gray-400 mt-2">
                {tweet.timestamp?.toDate().toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {showYouMayKnow && <YouMayKnow currentUserId={currentUser?.uid} />}
    </div>
  );
}

function YouMayKnow({ currentUserId }) {
  const { db } = getConfig();
  const [users, setUsers] = useState([]);
  const [currentFollowing, setCurrentFollowing] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      // Get all users except the current user
      const q = query(collection(db, "users"), where("uid", "!=", currentUserId));
      const snap = await getDocs(q);
      const allUsers = snap.docs
        .map((doc) => doc.data())
        .filter((u) => u.uid !== currentUserId); // fallback

      setUsers(allUsers);

      // Get current user followings
      const currentSnap = await getDoc(doc(db, "users", currentUserId));
      const currentData = currentSnap.data();
      setCurrentFollowing(currentData.following || []);
    };

    fetchData();
  }, [db, currentUserId]);

  const toggleFollow = async (targetUserId) => {
    const userRef = doc(db, "users", currentUserId);
    const newFollow = currentFollowing.includes(targetUserId)
      ? currentFollowing.filter((id) => id !== targetUserId)
      : [...currentFollowing, targetUserId];

    await updateDoc(userRef, { following: newFollow });
    setCurrentFollowing(newFollow);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mt-8 mb-2">You May Know</h2>
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
              variant={currentFollowing.includes(user.uid) ? "secondary" : "default"}
            >
              {currentFollowing.includes(user.uid) ? "Unfollow" : "Follow"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
