'use client';
import Image from "next/image";

export default function PostList({ tweets = [] }) {

  if (!Array.isArray(tweets) || tweets.length === 0) {
    return <p className="text-gray-500 text-center">No posts yet.</p>;
  }

  return (
    <div className="space-y-4">
      {tweets.map((tweet) => (
        <div
          key={tweet.id}
          className="border p-4 rounded-lg shadow-sm bg-white dark:bg-gray-900"
        >
          {/* Tweet content */}

          {tweet.displayName && (
            <p className="whitespace-pre-wrap font-medium text-lg text-gray-900 dark:text-gray-100">
              {tweet.displayName}
            </p>
          )}

          {tweet.content && (
            <p className="whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-100">
              {tweet.content}
            </p>
          )}

          {/* Optional image */}
          {tweet.photoUrl && (
            <div className="mt-2 rounded overflow-hidden">
              <Image
                src={tweet.photoUrl}
                alt="Post image"
                width={600}
                height={400}
                className="w-full h-auto object-cover rounded"
              />
            </div>
          )}

          {/* Timestamp */}
          {tweet.timestamp?.toDate && (
            <p className="text-xs text-gray-400 mt-2">
              {tweet.timestamp.toDate().toLocaleString()}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
