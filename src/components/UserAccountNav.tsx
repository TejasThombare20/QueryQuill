import { getUserSubscriptionPlan } from "@/lib/stripe";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import Image from "next/image";
import { Icons } from "./Icons";
import Link from "next/link";
import { Gem } from "lucide-react";

interface UserAccountNavProps {
  email: string | undefined;
  name: string | undefined;
  imageURL?: string | undefined;
}

const UserAccountNav = async ({
  email,
  imageURL,
  name,
}: UserAccountNavProps) => {
  const subscriptionPlan = await getUserSubscriptionPlan();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="overflow-visible">
        <Button className="rounded-full h-8 w-8 aspect-square bg-slate-400">
          <Avatar className="relative w-8 h-8">
            {imageURL ? (
              <div className="relative aspect-square h-full w-full">
                <Image
                  fill
                  alt="user profile image"
                  referrerPolicy="no-referrer"
                  src={imageURL}
                />
              </div>
            ) : (
              <AvatarFallback className="sr-only">
                {name}
                <Icons.user className="h-4 w-4 text-zinc-900" />
              </AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="bg-white " align="end">
        <div className="flex items-center justify-start gap-2 p-2 ">
          <div className="flex flex-col space-y-0.5 leading-none ">
            {name && <p className="font-medium text-sm text-black">{name}</p>}
            {email && (
              <p className="truncate w-[200px] text-xs text-zinc-700">
                {" "}
                {email}
              </p>
            )}
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href={"/dashboard"}>Dashboard</Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          {subscriptionPlan.isSubscribed ? (
            <Link href={"/dashboard/billing"}>Manage Subscription</Link>
          ) : (
            <Link href={"/pricing"}>
              Upgrade
              <Gem className="text-blue-600 h-4 w-4 ml-1.5" />
            </Link>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAccountNav;
