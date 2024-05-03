// TODO refactor
export default [
  {
    name: "twitter",
    title: "X (Twitter)",
    logo: "/link.svg",
    comingSoon: false,
    description:
      "Connect your X (Twitter) account to verify your proof-of-account-ownership and earn achievements related to your level of activity and connections on crypto twitter.",
    step1: "",
    modalImage: "",
    url: "",
  },
  {
    name: "github",
    title: "GitHub",
    logo: "/github.svg",
    comingSoon: false,
    description:
      "Connect your GitHub account to verify your proof-of-account-ownership and earn achievements related to your code commits and activity.",
    step1: (
      <>
        Edit your{" "}
        <a href="https://github.com" className="underline cursor-pointer text-accent" target="_blank" rel="noreferrer">
          GitHub profile
        </a>{" "}
        to include the following link
      </>
    ),
    step2: "Provide your GitHub username ( case sensitive )",
    modalImage: "/connect-github.png",
    url: "https://github.com",
  },
  {
    name: "buidlguidl",
    title: "BuidlGuidl",
    logo: "/link.svg",
    comingSoon: true,
    description:
      "Connect your buidlguidl account to verify your proof-of-account-ownership and earn achievements related to your scaffold-eth-2 builds, your role and your stream.",
    step1: (
      <>
        On your BuidlGuidl{" "}
        <a
          href="https://app.buidlguidl.com/"
          className="underline cursor-pointer text-accent"
          target="_blank"
          rel="noreferrer"
        >
          portfolio page
        </a>
        , update your status
      </>
    ),
    step2: "Provide address of EOA for your BuidlGuidl profile",
    modalImage: "/connect-bg.png",
    url: "https://app.buidlguidl.com/",
  },
  {
    name: "buidlbox",
    title: "buidlbox",
    logo: "/link.svg",
    comingSoon: true,
    description:
      "Connect your buildbox.io account to verify your proof-of-account-ownership and earn achievements related to hackathons and bounties.",
    step1: "",
    modalImage: "",
    url: " ",
  },
  {
    name: "gitcoin",
    title: "GitCoin Passport",
    logo: "/passport.svg",
    comingSoon: true,
    description:
      "Connect your GitCoin Passport to verify your proof-of-account-ownership and earn achievements related to your number of points.",
    step1: "",
    modalImage: "",
    url: "",
  },
  {
    name: "linkedin",
    title: "LinkedIn",
    logo: "/linkedin.svg",
    comingSoon: true,
    description:
      "Connect your linkedin account to verify your proof-of-account-ownership and earn achievements related to your number of connections and your Web3 employment.",
    step1: "",
    modalImage: "",
    url: "",
  },
]
