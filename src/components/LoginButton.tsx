"use client";

import { signIn } from "next-auth/react";
import { Button } from "./ui/button";

const LoginButton = () => {
  return (
    <Button
    className="font-semibold  dark:text-white leading-none"
      variant="ghost"
      onClick={() => {
        signIn("google");
      }}

    > Sign In </Button>
  );
};

export default LoginButton;
