"use client";
import MaxWidthWrapper from "./MaxWidthWrapper";
import Link from "next/link";
import { buttonVariants } from "./ui/button";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { signIn, signOut, useSession, getProviders } from "next-auth/react";

const Navbar = () => {
  const { data: session } = useSession();
  const isUserLoggedIn = true;
  const [provider, setprovider] = useState(null);

  useEffect(() => {
    const setupProviders = async () => {
      const response: any = await getProviders();
      setprovider(response);
    };
    setupProviders();
  }, []);

  return (
    <nav className="sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all  ">
      <MaxWidthWrapper>
        <div className="flex h-14 items-center justify-between border-b  border-zinc-200 ">
          <Link href="/" className="flex z-40 font-semibold ">
            <span>QueryQuill</span>
          </Link>

          <div className="hidden items-center space-x-4 sm:flex ">
            <>
              <Link
                href="/pricing"
                className={buttonVariants({
                  variant: "ghost",
                  size: "sm",
                })}
              >
                Pricing
              </Link>

              {session?.user ? (
                <button
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                  })}
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Sign Out
                </button>
              ) : (
                <>
                  {provider &&
                    Object.values(provider).map((provider: any) => (
                      <button
                        type="button"
                        key={provider.name}
                        onClick={() => signIn(provider.id)}
                        className="rounded-full border border-black bg-black py-1.5 px-5 text-white transition-all hover:bg-white hover:text-black text-center text-sm font-inter flex items-center justify-center "
                      >
                        Sign In
                      </button>
                    ))}
                </>
              )}

              <Link
                href="/signup"
                className={buttonVariants({
                  size: "sm",
                })}
              >
                Get Started <ArrowRight className="ml-1.5 h-4 w-4  " />
              </Link>
            </>
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
};

export default Navbar;
