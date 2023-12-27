"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import LoginButton from "./LoginButton";
import Logoutbutton from "./Logoutbutton";
import { Button } from "./ui/button";
import { signIn, signOut } from "next-auth/react";

const MobileNav = ({ isAuth }: { isAuth: boolean }) => {
  const [isOpen, setOpen] = useState<boolean>(false);

  const toggleOpen = () => setOpen((prev) => !prev);

  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) toggleOpen();
  }, [pathname]);

  const closeOnCurrent = (href: string) => {
    if (pathname === href) {
      toggleOpen();
    }
  };

  return (
    <div className="sm:hidden">
      <Menu
        onClick={toggleOpen}
        className="relative z-50 h-5 w-5 "
      />

      {isOpen ? (
        <div className="fixed animate-in slide-in-from-top-5 fade-in-20 inset-0 z-0 w-full">
          <ul className="absolute bg-white border-b border-zinc-200  shadow-xl grid w-full gap-3 px-10 pt-20 pb-8">
            {!isAuth ? (
              <>
                <li>
                  <div
                    onClick={() => {
                      signIn("google");
                    }}
                    className="flex items-center w-full font-semibold  cursor-pointer"
                  >
                    Sign In
                  </div>
                </li>
                <li className="my-3 h-px w-full bg-gray-300" />
                <li>
                  <Link
                    className="flex items-center w-full font-semibold "
                    href={"/pricing"}
                  >
                    Pricing
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    className="flex items-center w-full font-semibold "
                    href={"/pricing"}
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    className="flex items-center w-full font-semibold "
                    href={"/dashboard"}
                  >
                    Dashboard
                  </Link>
                </li>
                <li className="my-3 h-px w-full bg-gray-300" />
                <li>
                  <Button
                    onClick={() => {
                      signOut();
                    }}
                  >
                    Sign Out
                  </Button>
                </li>
              </>
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

export default MobileNav;
