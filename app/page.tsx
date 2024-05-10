"use client";

import { useAtomValue } from "jotai";
import { Game } from "../components/Game";
import { themeAtom } from "../lib/atoms";

const formatBgImage = (emoji: string) =>
  `url(
'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewbox="0 0 91.875 99.96" width="91.875" height="99.96" style="opacity: 1; filter: grayscale(0);"><text x="0em" y="1em" font-size="49" transform="rotate(339 35.625 29.4)">${emoji}</text></svg>')`.replace(
    /\n/g,
    ""
  );

export default function Home() {
  const themeData = useAtomValue(themeAtom);
  return (
    <>
      <div
        style={{
          backgroundColor: themeData?.backgroundColor,
          backgroundImage: themeData?.emoji && formatBgImage(themeData.emoji),
        }}
        className="bg-slate-100 min-h-screen transition-all"
      >
        <div className="flex justify-center p-6">
          <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-2xl">
            <h1 className="text-2xl mb-4 text-center">
              Infinite Trivia{themeData?.name ? `: ${themeData?.name}` : false}
            </h1>
            <Game />
          </div>
        </div>
      </div>
    </>
  );
}
