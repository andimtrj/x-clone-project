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

export default function HomePage() {
  const { auth, db } = getConfig();
  const [currentUser, setCurrentUser] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [newTweet, setNewTweet] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCurrentUser({ uid: user.uid, ...userData }); // ✅ Ambil data Firestore, bukan dari `user`
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

      // Tambahkan user sendiri agar tweet sendiri juga muncul di feed
      const allUserIds = [...followedUserIds, userId];

      // Firestore 'in' query dibatasi max 10 elemen
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
    if (!newTweet.trim() || !currentUser) return;

    try {
      const tweetData = {
        content: newTweet.trim(),
        userId: currentUser.uid,
        displayName: currentUser.displayName || "Anon",
        username: currentUser.username || "unknown",
        timestamp: serverTimestamp(),
      };

      await addDoc(collection(db, "tweets"), tweetData);
      setNewTweet("");
      await fetchFeed(currentUser.uid); // refresh feed
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
            placeholder="What's in you mind?"
            value={newTweet}
            onChange={(e) => setNewTweet(e.target.value)}
          />
          <Button onClick={handleTweetSubmit}>Post</Button>
        </div>
      )}

      <div className="space-y-4 max-h-[36vw] overflow-y-scroll pr-2">
        {tweets.length > 0 ? (
          tweets.map((tweet) => <PostCard key={tweet.id} {...tweet} />)
        ) : (
          <p className="text-gray-500">Go follow someone!</p>
        )}
      </div>
    </div>
  );
}

// ✅ PostCard diperluas untuk menampilkan displayName & username
function PostCard({ content, timestamp, displayName, username }) {
  const date = timestamp?.toDate?.() ?? new Date();

  return (
    <div className="border rounded-lg p-4 shadow mb-4 bg-white">
      <div className="flex items-center gap-2 mb-1 text-sm text-gray-600">
        <span className="font-semibold">{displayName || "Anon"}</span>
        <span className="text-gray-400">@{username || "unknown"}</span>
      </div>
      <div className="text-base text-gray-800">{content}</div>
      <div className="text-xs text-gray-400 mt-2">
        🕒 {date.toLocaleString()}
      </div>
    </div>
  );
}
