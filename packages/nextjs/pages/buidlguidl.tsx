import React, { useEffect, useState } from "react";
import type { NextPage } from "next";

const BuidlGuidl: NextPage = () => {
  const [builders, setBuilders] = useState(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://buidlguidl-v3.ew.r.appspot.com/builders")
      .then(res => res.json())
      .then(data => {
        setBuilders(data);
        setLoading(false);
      });
  }, []);

  if (isLoading) return <p>Loading...</p>;
  if (!builders) return <p>No profile data</p>;

  return (
    <div>
      <h1>TODO:Buidl Guidl Integration</h1>
    </div>
  );
};

export default BuidlGuidl;
