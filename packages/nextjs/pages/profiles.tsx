import React, { useEffect, useState } from "react";
import type { NextPage } from "next";

const Profiles: NextPage = () => {
  const [builders, setBuilders] = useState(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    fetch("")
      .then(res => res.json())
      .then(data => {
        setBuilders(data);
        setLoading(false);
      });
  }, []);

  if (isLoading) return <p>Loading...</p>;
  if (!builders) return <p>No profile data</p>;

  return <div className="card w-96 bg-base-100 shadow-xl"></div>;
};

export default Profiles;
