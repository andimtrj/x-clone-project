"use client";

import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import getConfig from "@/firebase/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PostsList from "@/components/PostList";

export default function HomePage() {
  const { auth, db } = getConfig();
  const [currentUser, setCurrentUser] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [newTweet, setNewTweet] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCurrentUser({ uid: user.uid, ...userData });
          await fetchFeed(user.uid);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchFeed = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (!userDoc.exists()) {
        console.warn("User doc not found");
        setTweets([]);
        return;
      }

      const userData = userDoc.data();
      const followedUserIds = userData.following || [];
      const allUserIds = [...followedUserIds, userId];

      const chunks = [];
      for (let i = 0; i < allUserIds.length; i += 10) {
        chunks.push(allUserIds.slice(i, i + 10));
      }

      let allTweets = [];
      for (const chunk of chunks) {
        const tweetsRef = collection(db, "tweets");
        const tweetsQuery = query(tweetsRef, where("userId", "in", chunk));
        const tweetsSnap = await getDocs(tweetsQuery);

        const tweetsData = tweetsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        allTweets = allTweets.concat(tweetsData);
      }

      allTweets.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds);
      setTweets(allTweets);
    } catch (err) {
      console.error("Error loading feed:", err);
      setTweets([]);
    }
  };

  const handleTweetSubmit = async () => {
    if (!newTweet.trim() && !photoUrl.trim()) return;
    if (!currentUser) return;

    try {
      const tweetData = {
        content: newTweet.trim(),
        photoUrl: photoUrl.trim() || null,
        userId: currentUser.uid,
        displayName: currentUser.displayName || "Anon",
        username: currentUser.username || "unknown",
        timestamp: serverTimestamp(),
      };

      await addDoc(collection(db, "tweets"), tweetData);
      setNewTweet("");
      setPhotoUrl("");
      await fetchFeed(currentUser.uid);
    } catch (err) {
      console.error("Failed to post tweet:", err);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Home Feed</h2>

      {currentUser && (
        <div className="mb-6">
          <textarea
            className="w-full p-2 border rounded mb-2"
            rows={3}
            placeholder="What's in your mind?"
            value={newTweet}
            onChange={(e) => setNewTweet(e.target.value)}
          />
          <Input
            type="text"
            className="w-full p-2 border rounded mb-2"
            placeholder="Photo URL (optional)"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
          />
          <Button onClick={handleTweetSubmit} className="cursor-pointer">
            Post
          </Button>
        </div>
      )}

      <div className="space-y-4 max-h-[36vw] overflow-y-scroll pr-2">
        <PostsList tweets={tweets} />
      </div>
    </div>
  );
}
