import Link from "next/link";
import React from "react";
import CopyToClipboard from "@/app/_components/CopyToClipboard";
import Help from "@/app/_components/Help";
import KitchenName from "@/app/_components/KitchenName";

const page = ({ params }: { params: { slug: string } }) => {
  return (
    <>
      <div className="mx-5 px-5 flex justify-between">
        <CopyToClipboard id={params.slug} />{" "}
        <Help description="Invite code to get your family to collaborate with you" />
      </div>
      <div className="m-5 px-5 flex flex-col items-center text-center">
        <h3 className=" text-xl md:text-3xl text-left text-primary mb-10 font-extrabold ">
          <KitchenName id={params.slug} />
        </h3>
        <svg
          className="avocado"
          xmlns="http://www.w3.org/2000/svg"
          version="1.1"
        >
          <pattern
            id="pattern"
            x="0"
            y="0"
            width="210"
            height="210"
            patternUnits="userSpaceOnUse"
          >
            <text
              className="emoji-pattern"
              x="0"
              y="100"
              width="80"
              font-size="80"
            >
              🥝
            </text>
            <text
              className="emoji-pattern"
              x="100"
              y="200"
              width="80"
              font-size="80"
            >
              🥝
            </text>
          </pattern>
          <rect fill="url(#pattern)" x="0" y="0" width="100%" height="100%" />
        </svg>
        <LinkButton
          href={`/kitchen/${params.slug}/pantry`}
          text="Pantry List"
        />
        <LinkButton
          href={`/kitchen/${params.slug}/recipies`}
          text="Recipie List"
        />
        <LinkButton
          href={`/kitchen/${params.slug}/shoppinglist`}
          text="Wish List"
        />
      </div>
    </>
  );
};

export default page;

const LinkButton = ({ href, text }: { href: string; text: string }) => {
  return (
    <Link
      className="my-5 w-full md:w-80 bg-white border h-20 font-bold text-center flex items-center justify-center border-primary text-primary rounded-md py-3 px-6"
      href={href}
    >
      {text}
    </Link>
  );
};
