const accounts = [
  {
    name: "twitter",
    title: "Twitter",
    logo: "/x.svg",
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
    logo: "/google.svg",
    comingSoon: false,
    url: "https://google.com",
  },
  {
    name: "discord",
    title: "Discord",
    logo: "/discord.svg",
    comingSoon: false,
    url: "https://discord.com",
  },
  {
    name: "linkedin",
    title: "LinkedIn",
    logo: "/linkedin.svg",
    comingSoon: false,
    url: "https://linkedin.com",
  },
  {
    name: "buidlguidl",
    title: "BuidlGuidl",
    logo: "/buidlguidl.svg",
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
    step1Contents: `https://updev.vercel.app/profile/{up}`, // TODO env?
    step2: "Provide address of EOA for your BuidlGuidl profile:",
    modalImage: "/connect-bg.png",
  },
  {
    name: "https",
    title: "WebSite",
    logo: "/link.svg",
    comingSoon: false,
    isModal: true,
    step1: <>Expose updev.json at root of your website with the following contents:</>,
    step1Contents: `{ "up": "{up}" }`,
    step2: "Provide domain name of your website:",
    step2Placeholder: "google.com",
  },
  {
    name: "telegram",
    title: "Telegram",
    logo: "/link.svg",
    comingSoon: true,
    url: "https://telegram.org",
  },
  // {
  //   name: "buidlbox",
  //   title: "buidlbox",
  //   logo: "/link.svg",
  //   comingSoon: true,
  //   step1: "",
  //   modalImage: "",
  //   url: " ",
  // },
  // {
  //   name: "gitcoin",
  //   title: "GitCoin Passport",
  //   logo: "/passport.svg",
  //   comingSoon: true,
  //   step1: "",
  //   modalImage: "",
  //   url: "",
  // },
  // {
  //   name: "linkedin",
  //   title: "LinkedIn",
  //   logo: "/linkedin.svg",
  //   comingSoon: true,
  //   step1: "",
  //   modalImage: "",
  //   url: "",
  // },
];

export default accounts;
