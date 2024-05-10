import { useState } from "react";
import { GameQuestions } from "./GameQuestions";
import { ThemeForm } from "./ThemeForm";

type GameState = {
  theme?: string;
};

export function Game() {
  const [progress, setProgress] = useState<GameState>(() => ({}));

  return (
    <>
      <p className="text-gray-700 mb-4">
        Let&apos;s set a theme at first. Enter any.
      </p>
      <ThemeForm
        setTheme={async (theme) => {
          setProgress({
            ...progress,
            theme,
          });
        }}
      />
      {progress.theme && <GameQuestions theme={progress.theme} />}
    </>
  );
}
