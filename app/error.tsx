"use client";

import Link from "next/link";
import { MoveUpRight } from "lucide-react";

const Error = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h2 className="text-md md:text-xl lg:text-3xl font-medium">
        Something went wrong! {" "}
        <Link
          href="/"
          className="inline-flex items-center underline hover:text-blue-500"
        >
          Back <MoveUpRight className="ml-1 h-4 w-4" />
        </Link>
      </h2>
    </div>
  );
};

export default Error;