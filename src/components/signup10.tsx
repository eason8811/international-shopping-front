"use client";

import React from "react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface Signup10Props {
  className?: string;
}

const Signup10 = ({ className }: Signup10Props) => {
  return (
    <section className={cn("bg-background", className)}>
      <div className="container flex min-h-screen flex-col items-center justify-between gap-20 py-16 lg:flex-row lg:px-0 lg:py-0">
        <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-6">
          <div className="flex h-14 w-14 items-center justify-center">
            <img
              className="h-14 w-12"
              alt="Logo"
              src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/block-1.svg"
            />
          </div>

          <h1 className="mb-8 w-full text-center text-3xl font-medium tracking-tighter text-foreground md:text-4xl">
            Create your free account
          </h1>

          <Button
            variant="outline"
            className="flex h-14 w-full max-w-lg items-center justify-center gap-8 rounded-full border-muted-foreground/30"
          >
            <img
              className="h-5 w-5"
              alt="Google logo"
              src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/google-icon.svg"
            />
            <span className="font-medium">Sign up with Google</span>
          </Button>

          <div className="flex w-full max-w-lg items-center gap-6">
            <Separator className="flex-1" />
            <span className="font-medium tracking-tight">or</span>
            <Separator className="flex-1" />
          </div>

          <div className="w-full max-w-lg">
            <Input
              className="h-14 rounded-full border-none bg-muted px-5 py-4 font-medium"
              placeholder="Enter Your Email"
            />
          </div>

          <Button className="h-14 w-full max-w-lg rounded-full bg-foreground text-background hover:bg-foreground/90">
            <span className="font-medium tracking-tight">Continue</span>
          </Button>

          <p className="mb-8 w-full text-center text-sm tracking-tight text-foreground/40">
            <span>By proceeding, you accept the shadcnblocks.com</span>{" "}
            <span className="cursor-pointer underline">Terms</span>
            <span> and </span>
            <span className="cursor-pointer underline">Privacy Policy</span>
          </p>

          <p className="mb-20 w-full text-center text-sm font-medium tracking-tight">
            Already a user?{" "}
            <span className="cursor-pointer underline">Log in</span>
          </p>
        </div>
        <div className="hidden h-screen w-full bg-muted lg:block">
          <img
            src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-dark-7-tall.svg"
            className="size-full object-cover"
            alt=""
          />
        </div>
      </div>
    </section>
  );
};

export { Signup10 };
