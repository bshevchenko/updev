import React, { useEffect, useState } from "react";
import type { NextPage } from "next";

const UpdevsOnly: NextPage = () => {
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

  return (
    <div className="card w-96 bg-base-100 shadow-xl">
      <figure>
        <img src="" alt="Shoes" />
      </figure>
      <div className="card-body">
        <h2 className="card-title">Shoes!</h2>
        <p>If a dog chews shoes whose shoes does he choose?</p>
        <div className="card-actions justify-end">
          <button className="btn btn-primary">View Profile</button>
        </div>
      </div>
    </div>
  );
};

export default UpdevsOnly;
