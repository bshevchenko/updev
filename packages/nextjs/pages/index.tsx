import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";

const Home: NextPage = () => {
  const [luksoAvailable, setLuksoAvailable] = useState(false);

  const [builders, setBuilders] = useState(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    setLuksoAvailable(!!window.lukso);
  }, []);

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

  console.log(builders);

  async function connect() {
    if (window.lukso) {
      try {
        const accounts = await window.lukso.request({ method: "eth_requestAccounts" });
        console.log("accounts", accounts);
      } catch (error) {
        console.error("Error connectinng to LUKSO", error);
      }
    }
  }

  return (
    <>
      <MetaHeader />
      <h1 className="text-5xl text-center my-14">UPdev</h1>
      <div className="flex items-center flex-col flex-grow">
        {luksoAvailable ? (
          <button className="btn btn-accent btn-lg capitalize" onClick={() => connect()}>
            Connect UP Extension
          </button>
        ) : (
          <p className="text-xl">
            You must install Luksos{" "}
            <a
              className="link link-accent"
              href="https://chromewebstore.google.com/detail/universal-profiles/abpickdkkbnbcoepogfhkhennhfhehfn"
              target="_blank"
              rel="noopener noreferrer"
            >
              Universal Profile extension
            </a>{" "}
            before using this dapp
          </p>
        )}
      </div>
    </>
  );
};

export default Home;
