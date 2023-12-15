"use client";

import { Button } from "./ui/button";
import { signOut } from "next-auth/react";

const Logoutbutton = () => {
  return (
    <Button
      onClick={() => {
        signOut();
      }}
      variant="default"
      className="rounded-md font-semibold text-zinc-900"
    >
      Sign Out
    </Button>
  );
};

export default Logoutbutton;
