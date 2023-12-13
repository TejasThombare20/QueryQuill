"use client";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { trpc } from "../_trpc/client";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const page = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const origin = searchParams.get("origin");
  const { toast } = useToast();

  trpc.authCallback.useQuery(undefined, {
    onSuccess: ({ success }) => {
      if (success) {
        router.push(origin ? `/${origin}` : `/dashboard`);
      }
    },
    onError: (err) => {
      if (err.data?.code === "UNAUTHORIZED") {
        toast({
          title: "Error",
          description: "You need to Signin first",
          variant: "destructive",
        });

        setTimeout(() => {
          router.push("/");
        }, 2000);
      }
    },
    retry: false,
    retryDelay: 500,
  });

  return (
    <div className="w-full mt-24 flex justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-900" />
        <h3 className="font-semibold text-xl">Setting up your account...</h3>
        <p>You will redirect automatically...</p>
      </div>
    </div>
  );
};

export default page;
