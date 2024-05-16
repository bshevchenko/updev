import React, { useCallback, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { RainbowKitCustomConnectButton } from "~~/components";
import { useOutsideClick } from "~~/hooks/scaffold-eth";

interface HeaderMenuLink {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Home",
    href: "/",
  },
  // {
  //   label: "Discover Profiles",
  //   href: "/profiles",
  // },
  // {
  //   label: "Debug Contracts",
  //   href: "/debug",
  // },
];

export const HeaderMenuLinks = () => {
  const router = useRouter();

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = router.pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              className={`${isActive ? "bg-secondary shadow-md" : ""
                } hover:bg-secondary hover:shadow-md focus:!bg-secondary active:!text-neutral py-1.5 px-3 text-sm rounded-full gap-2 grid grid-flow-col`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

export const Header = () => {
  const account = useAccount();
  const { pathname } = useRouter();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const burgerMenuRef = useRef<HTMLDivElement>(null);
  useOutsideClick(
    burgerMenuRef,
    useCallback(() => setIsDrawerOpen(false), []),
  );

  // Only render the header if the wallet is connected
  if (!account.isConnected && pathname === "/") {
    return null;
  }

  return (
    <div className="sticky lg:static top-0 navbar min-h-0 flex-shrink-0 justify-between z-20 px-0 sm:px-2 bg-base-300 border-b border-[#2D3748]">
      <div className="navbar-start w-auto lg:w-1/2">
        <div className="lg:hidden dropdown" ref={burgerMenuRef}>
          <label
            tabIndex={0}
            className={`ml-1 btn btn-ghost ${isDrawerOpen ? "hover:bg-secondary" : "hover:bg-transparent"}`}
            onClick={() => {
              setIsDrawerOpen(prevIsOpenState => !prevIsOpenState);
            }}
          >
            <Bars3Icon className="h-1/2" />
          </label>
          {isDrawerOpen && (
            <ul
              tabIndex={0}
              className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-300 rounded-box w-52"
              onClick={() => {
                setIsDrawerOpen(false);
              }}
            >
              <HeaderMenuLinks />
            </ul>
          )}
        </div>
        <Link href="/" passHref className="lg:flex items-center gap-2 lg:ml-4 lg:mr-6 shrink-0">
          <div className="flex relative w-36 h-12">
            <Image alt="logo" className="cursor-pointer" fill src="/logo.svg" priority />
          </div>
          <div className="hidden sm:block badge-outline badge-accent rounded-sm px-1 py-0 border-[2px] text-[12px] font-bold">
            BETA V2.0
          </div>
        </Link>
        {/* <ul className="hidden lg:flex lg:flex-nowrap menu menu-horizontal px-1 gap-2">
          <Link href="/profiles" className="items-center text-lg">
            Discover Profiles
          </Link>
        </ul> */}
      </div>
      <div className="navbar-end flex-grow mr-4">
        <RainbowKitCustomConnectButton />
      </div>
    </div>
  );
};
