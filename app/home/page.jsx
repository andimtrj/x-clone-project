"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import getConfig from "@/firebase/config";

export default function HomePage() {
  const { auth, db } = getConfig();
  const [currentUser, setCurrentUser] = useState(null);
  const [tweets, setTweets] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await fetchFeed(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);
  const fetchFeed = async (userId) => {
    try {
      // Ambil dokumen user saat ini
      const userDoc = await getDoc(doc(db, "users", userId));
      if (!userDoc.exists()) {
        console.warn("User doc not found");
        setTweets([]);
        return;
      }

      const userData = userDoc.data();
      const followedUserIds = userData.following || [];

      if (followedUserIds.length === 0) {
        setTweets([]);
        return;
      }

      // Firestore hanya mendukung 'in' untuk maksimal 10 elemen
      const chunks = [];
      for (let i = 0; i < followedUserIds.length; i += 10) {
        chunks.push(followedUserIds.slice(i, i + 10));
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

      // Sort berdasarkan waktu terbaru
      allTweets.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds);

      setTweets(allTweets);
    } catch (err) {
      console.error("Error loading feed:", err);
      setTweets([]);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Home Feed</h2>
      {tweets.length > 0 ? (
        tweets.map((tweet) => <PostCard key={tweet.id} {...tweet} />)
      ) : (
        <p className="text-gray-500">
          Belum ada tweet dari pengguna yang kamu ikuti.
        </p>
      )}
    </div>
  );
}

// ✅ PostCard component langsung di bawah sini
function PostCard({ id, userId, content, timestamp }) {
  const date = timestamp?.toDate?.() ?? new Date(); // convert Firestore Timestamp

  return (
    <div className="border rounded-lg p-4 shadow mb-4 bg-white">
      <div className="text-sm text-gray-600 mb-1">👤 User ID: {userId}</div>
      <div className="text-base text-gray-800">{content}</div>
      <div className="text-xs text-gray-400 mt-2">
        🕒 {date.toLocaleString()}
      </div>
    </div>
  );
}
