import MaxWidthWrapper from "./MaxWidthWrapper";
import Link from "next/link";
import { Button, buttonVariants } from "./ui/button";
import UserAccountNav from "./UserAccountNav";
import { getServerSession } from "next-auth";
import { authoption } from "@/app/api/auth/[...nextauth]/route";
import LoginButton from "./LoginButton";
import Logoutbutton from "./Logoutbutton";
import MobileNav from "./MobileNav";

const Navbar = async () => {
  const session = await getServerSession(authoption);

  const user = session?.user;

  return (
    <nav className="sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all  ">
      <MaxWidthWrapper>
        <div className="flex h-14 items-center justify-between border-b  border-zinc-200  ">
          <Link href="/" className="flex z-40 font-semibold ">
            <span>QueryQuill</span>
          </Link>

          <MobileNav isAuth={!!user} />

          <div className="hidden items-center space-x-4 sm:flex ">
            {!user ? (
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

                <LoginButton />
              </>
            ) : (
              <>
                <Link
                  href={"/dashboard"}
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                  })}
                >
                  Dashboard
                </Link>
                <UserAccountNav
                  name={user?.name ?? "Welcome !"}
                  email={user?.email ?? ""}
                  imageURL={user.image ?? ""}
                />
                <Logoutbutton />
              </>
            )}
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
};

export default Navbar;
