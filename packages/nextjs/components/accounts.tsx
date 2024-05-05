export default [
  {
    name: "twitter",
    title: "X (Twitter)",
    logo: "/link.svg",
    comingSoon: false,
    step1: "",
    modalImage: "",
    url: "",
  },
  {
    name: "github",
    title: "GitHub",
    logo: "/github.svg",
    comingSoon: false,
    url: "https://github.com",
  },
  {
    name: "google",
    title: "Google",
    logo: "/link.svg",
    comingSoon: false,
    url: "https://google.com",
  },
  {
    name: "discord",
    title: "Discord",
    logo: "/link.svg",
    comingSoon: false,
    url: "https://discord.com",
  },
  {
    name: "buidlguidl",
    title: "BuidlGuidl",
    logo: "/link.svg",
    comingSoon: false,
    isModal: true,
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
        , update your status to include:
      </>
    ),
    step1Contents: `https://updev.me/profile/{up}`, // TODO env?
    step2: "Provide address of EOA for your BuidlGuidl profile:",
    modalImage: "/connect-bg.png",
  },
  {
    name: "website",
    title: "WebSite",
    logo: "/link.svg",
    comingSoon: false,
    isModal: true,
    step1: (
      <>
        Expose updev.json at root of your website with the following contents:
      </>
    ),
    step1Contents: `{ "up": "{up}" }`,
    step2: "Provide domain name of your website:",
    step2Placeholder: "google.com"
  },
  {
    name: "buidlbox",
    title: "buidlbox",
    logo: "/link.svg",
    comingSoon: true,
    step1: "",
    modalImage: "",
    url: " ",
  },
  {
    name: "gitcoin",
    title: "GitCoin Passport",
    logo: "/passport.svg",
    comingSoon: true,
    step1: "",
    modalImage: "",
    url: "",
  },
  // {
  //   name: "linkedin",
  //   title: "LinkedIn",
  //   logo: "/linkedin.svg",
  //   comingSoon: true,
  //   step1: "",
  //   modalImage: "",
  //   url: "",
  // },
]
