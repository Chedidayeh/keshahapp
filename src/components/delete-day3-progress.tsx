"use client";

import { useState } from "react";

export default function DeleteDay3Progress() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleDelete = async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/test/remove-day3", {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`Successfully deleted day3 progress for ${data.deletedUsers} users`);
      } else {
        setMessage(`Error: ${data.error || "Something went wrong"}`);
      }
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow max-w-md mx-auto mt-10">
      <h2 className="text-lg font-semibold mb-4">Delete Day 3 Progress</h2>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
      >
        {loading ? "Deleting..." : "Delete Day 3 Progress"}
      </button>
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}
