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
  where,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { User, Pencil } from "lucide-react";
import YouMayKnow from "../YouMayKnow";
import EditProfileModal from "../EditProfile";
import { Button } from "@/components/ui/button";
import PostsList from "@/components/PostList";

export default function ProfilePage() {
  const { db, auth } = getConfig();
  const [currentUser] = useAuthState(auth);
  const params = useParams();
  const userId = params.id;

  const [userData, setUserData] = useState(null);
  const [userTweets, setUserTweets] = useState([]);
  const [showYouMayKnow, setShowYouMayKnow] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

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

        if (currentUser?.uid === userId) {
          setShowYouMayKnow(true);
        }
      } catch (err) {
        console.error("Failed to fetch profile data", err);
      }
    };

    fetchProfile();
  }, [db, userId, currentUser?.uid]);

  if (!userData) return <div className="p-6">Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Your Profile</h2>
      <div className="flex items-center gap-4 mb-4">
        <div className="relative">
          {userData.photoUrl ? (
            <img
              src={userData.photoUrl}
              alt="Profile"
              className="h-16 w-16 rounded-full border-2 border-black object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-16 w-16 rounded-full border-2 border-black">
              <User height={40} width={40} />
            </div>
          )}
        </div>

        <div>
          <h3 className="text-xl font-bold">{userData.displayName}</h3>
          <h3 className="text-gray-400">@{userData.username}</h3>
        </div>

        {currentUser?.uid === userId && (
          <Button
            className="ml-auto flex items-center gap-2 cursor-pointer"
            onClick={() => setShowEditModal(true)}
          >
            <Pencil size={16} />
            Edit Profile
          </Button>
        )}
      </div>

      <div className="flex gap-6 max-h-[75vh]">
        {/* Posts section */}
        <div className="flex-1 overflow-y-scroll pr-2">
          <h2 className="text-xl font-semibold mb-2">Posts</h2>
          <div className="space-y-4">
            <PostsList tweets={userTweets} />
          </div>
        </div>

        {/* You May Know section */}
        {showYouMayKnow && (
          <div className="w-1/3 overflow-y-scroll pr-2">
            <YouMayKnow currentUserId={currentUser?.uid} />
          </div>
        )}
      </div>

      {/* Modal */}
      {showEditModal && (
        <EditProfileModal
          userId={userId}
          userData={userData}
          onClose={() => setShowEditModal(false)}
          onUpdate={(updatedData) => setUserData(updatedData)}
        />
      )}
    </div>
  );
}
