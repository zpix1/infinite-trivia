import { Button } from "@/components/ui/button";
import { getQuestion, OllamaMessage, Question } from "@/lib/ai";
import { themeAtom } from "@/lib/atoms";
import { cn } from "@/lib/utils";
import { useAtomValue } from "jotai";
import { Loader2 } from "lucide-react";
import { useState } from "react";

type State = {
  totalQuestions: number;
  questions: {
    question: Question;
    answered?: string;
    correct?: boolean;
  }[];
};

type QuestionSelectionProps = {
  question: Question;
  correct?: boolean;
  answered?: string;
  onSelect: (text: string) => void;
};

function QuestionSelection(props: QuestionSelectionProps) {
  return (
    <>
      <p className="text-gray-700 mb-4 mt-4">{props.question.text}</p>
      <div
        className={cn(
          "grid gap-4 grid-cols-2",
          props.answered !== undefined && "pointer-events-none"
        )}
      >
        {props.question.possibleAnswers.map((e) => (
          <div
            className={cn(
              "text-gray-700 p-3 border text-center text-ver rounded-sm border-gray-500 cursor-pointer ",
              props.answered === e &&
                (e === props.question.correctAnswer
                  ? "bg-green-200"
                  : "bg-red-200"),
              props.answered !== e &&
                props.answered &&
                (e === props.question.correctAnswer
                  ? "bg-green-200"
                  : "hover:bg-blue-50")
            )}
            key={e}
            onClick={() => {
              props.onSelect(e);
            }}
          >
            {e}
          </div>
        ))}
      </div>
      {props.answered && (
        <p className="text-gray-700 mb-4 mt-4">
          {props.correct ? "Correct!" : "False!"} {props.question.explanation}
        </p>
      )}
    </>
  );
}

function getMark(correct: number, total: number): string {
  const float = Math.floor((correct * 5) / total);
  return {
    0: "💀",
    1: "🤨",
    2: "😛",
    3: "🙂",
    4: "😎",
    5: "🤘",
  }[float] as string;
}

export function GameQuestions({ theme }: { theme: string }) {
  const themeData = useAtomValue(themeAtom);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [history, setHistory] = useState<OllamaMessage[] | undefined>(
    undefined
  );

  const [state, setState] = useState<State>(() => ({
    totalQuestions: 5,
    questions: [],
  }));

  async function nextQuestion() {
    setError(undefined);
    setLoading(true);
    try {
      const [question, newHistory] = await getQuestion(theme, history);
      setHistory(newHistory);
      setState({
        ...state,
        questions: [
          ...state.questions,
          {
            question,
            answered: undefined,
            correct: undefined,
          },
        ],
      });
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }

  const notAnswered =
    !state.questions.at(-1)?.answered && state.questions.length > 0;
  const finished =
    !notAnswered && state.questions.length === state.totalQuestions;

  const total = state.totalQuestions;
  const correct = state.questions.reduce((a, e) => a + Number(e.correct), 0);

  return (
    <>
      {state.questions.map((q, i) => (
        <div key={i}>
          <p className="text-gray-700 mb-4 mt-4 font-bold">Question {i + 1}.</p>
          <QuestionSelection
            question={q.question}
            answered={q.answered}
            correct={q.correct}
            onSelect={(text) => {
              const correct = text === q.question.correctAnswer;
              setState((state) => {
                const questions = state.questions.slice();
                questions[i] = {
                  ...questions[i],
                  answered: text,
                  correct,
                };
                return {
                  ...state,
                  questions,
                };
              });
            }}
            key={`${i}`}
          />
        </div>
      ))}
      {!finished && (
        <Button
          className="mt-4"
          onClick={nextQuestion}
          disabled={loading || notAnswered}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {state.questions.length === 0 ? "Go to questions" : "Next Question"}
        </Button>
      )}
      {finished && (
        <>
          <p className="text-gray-700 mb-4 mt-4">Share your result:</p>
          <div className="flex gap-5 shadow-xl p-5 rounded-sm text-black">
            <span className="text-5xl">{getMark(correct, total)}</span>
            <span>
              <span className="font-medium">
                I played {themeData?.name}
                {themeData?.emoji} trivia at{" "}
                <a className="underline text-blue-700">
                  zpix1.github.io/infinite-trivia
                </a>{" "}
              </span>
              <br />
              My result: {correct}/{total} points
            </span>
          </div>
        </>
      )}
      {error && (
        <p className="mt-2 text-red-500 font-medium">
          Error, try again
          <br />
          {error.message}
        </p>
      )}
    </>
  );
}
