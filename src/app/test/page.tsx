"use client";

import React, { useEffect, useState } from "react";

export default function UserStatsViewer() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/test");
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading data...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>User Stats JSON</h2>
      <pre style={{ background: "", padding: "1rem", borderRadius: "5px" }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
