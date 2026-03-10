import { FaGithub, FaLinkedin } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

interface Login9Props {
  heading?: string;
  logo: {
    url: string;
    src: string;
    alt: string;
    title?: string;
    className?: string;
  };
  googleText?: string;
  githubText?: string;
  linkedInText?: string;
  emailText?: string;
  signupText?: string;
  signupUrl?: string;
  className?: string;
}

const Login9 = ({
  heading = "Log In",
  logo = {
    url: "https://www.shadcnblocks.com",
    src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblocks-logo.svg",
    alt: "shadcnblocks logo",
    title: "shadcnblocks.com",
  },
  googleText = "Continue with Google",
  githubText = "Continue with GitHub",
  linkedInText = "Continue with LinkedIn",
  emailText = "Continue with email",
  signupText = "New to shadcnblocks?",
  signupUrl = "#",
  className,
}: Login9Props) => {
  return (
    <section className={cn("h-screen bg-muted", className)}>
      <div className="flex h-full flex-col items-center justify-center gap-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <a href={logo.url}>
            <img
              src={logo.src}
              alt={logo.alt}
              title={logo.title}
              className="h-8 w-8"
            />
          </a>
        </div>

        <div className="flex w-full max-w-sm flex-col items-start gap-y-6 rounded-md border border-muted border-muted-foreground/20 bg-white p-6">
          <div className="flex flex-col items-start gap-y-2">
            {heading && <h1 className="text-xl font-semibold">{heading}</h1>}
            {/* Signup Link */}
            <div className="text-sm">
              <span className="text-muted-foreground">{signupText} </span>
              <a
                href={signupUrl}
                className="font-medium text-primary hover:underline"
              >
                Sign up
              </a>
            </div>
          </div>

          <div className="flex w-full flex-col items-center gap-4">
            {/* Social Login Buttons */}
            <div className="flex w-full flex-col items-center gap-4">
              <Button variant="outline" className="w-full justify-center">
                <FcGoogle className="size-4" />
                {googleText}
              </Button>

              <Button variant="outline" className="w-full justify-center">
                <FaGithub className="size-4" />
                {githubText}
              </Button>

              <Button variant="outline" className="w-full justify-center">
                <FaLinkedin className="size-4" />
                {linkedInText}
              </Button>
            </div>

            {/* Separator */}
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted-foreground/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">OR</span>
              </div>
            </div>

            {/* Email Button */}
            <Button variant="outline" className="w-full justify-center">
              {emailText}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Login9 };
