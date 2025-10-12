"use client";

import React, { useEffect, useState } from "react";

type UserBreakdown = {
  user_type: string;
  user_count: number;
};

export default function UserCard() {
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [breakdown, setBreakdown] = useState<UserBreakdown[]>([]);

  useEffect(() => {
    fetch("/api/bigquery/users")
      .then((res) => res.json())
      .then((res) => {
        setTotalUsers(res.total_users);
        setBreakdown(res.breakdown);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="max-w-sm mx-auto  shadow-lg rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Users Overview</h2>
      
      <div className="text-center mb-6">
        <p className="text-gray-500">Total Users</p>
        <p className="text-3xl font-semibold">{totalUsers}</p>
      </div>

      <div>
        <h3 className="text-gray-700 font-semibold mb-2">By User Type</h3>
        <ul className="space-y-2">
          {breakdown.map((item) => (
            <li key={item.user_type} className="flex justify-between rounded px-3 py-2">
              <span className="capitalize">{item.user_type || "Unknown"}</span>
              <span className="font-medium">{item.user_count}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
