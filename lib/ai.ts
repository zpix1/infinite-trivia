"use server";

import { z } from "zod";
import { jsonrepair } from "jsonrepair";

const ollamaGenerateResponseScheme = z.object({
  response: z.string(),
});

async function askAi(prompt: string): Promise<string> {
  const responseData = await fetch("http://127.0.0.1:11434/api/generate", {
    method: "POST",
    body: JSON.stringify({
      model: "llama3",
      prompt,
      stream: false,
    }),
  });

  const json = await responseData.json();

  const { response } = ollamaGenerateResponseScheme.parse(json);

  return response;
}

export type OllamaMessage = {
  role: string;
  content: string;
};

const ollamaChatMessageSchema = z.object({
  message: z.object({
    role: z.string(),
    content: z.string(),
  }),
});

async function askAiChat(
  messages: OllamaMessage[]
): Promise<z.infer<typeof ollamaChatMessageSchema>> {
  const responseData = await fetch("http://127.0.0.1:11434/api/chat", {
    method: "POST",
    body: JSON.stringify({
      model: "llama3",
      messages,
      stream: false,
    }),
  });

  const json = await responseData.json();

  const message = ollamaChatMessageSchema.parse(json);

  return message;
}

export type Theme = {
  emoji: string;
  backgroundColor: string;
  name: string;
};

export async function getAiThemeData(theme: string): Promise<Theme> {
  console.log("Get theme for", theme);

  const emojiColor = await askAi(
    `You are a trivia game. Suggest an emoji, a background color in hex notation, and a cool name for given theme: ${theme}. Only output emoji, color, name and nothing else. Example for theme "Car brands": 🚗 #FFC080 "Car trivia"`
  );

  const [emoji, backgroundColor, ...name] = emojiColor.split(" ");

  const res = {
    emoji,
    backgroundColor,
    name: name.join(" "),
  };
  console.log("Theme request", res);

  return res;
}

const questionScheme = z.object({
  text: z.string(),
  possibleAnswers: z.array(z.coerce.string()),
  correctAnswer: z.coerce.string(),
  explanation: z.string(),
});

export type Question = z.infer<typeof questionScheme>;

export async function getQuestion(
  theme: string,
  history?: OllamaMessage[]
): Promise<[Question, OllamaMessage[]]> {
  console.log("Get question for", theme, history?.length);

  if (!history) {
    history = [
      {
        role: "system",
        content: `You are a trivia game. Suggest a multiple choice question for theme: ${theme}.
At first line output question, then numbered list of possible answers, and then correct answer (text), and then explanation. Do not output anything else. 
Make the trivia questions interesting, always make sure there is a correct answer. Never imagine anything, only operate known facts.
Example:
{
  "text": "The domestic dog is a subspecies of …?",
  "possibleAnswers": [
    "Panthera tigris",
    "Canis lupus",
    "Loxodonta africana",
    "Felis silvestrus"
  ],
  "correctAnswer": "Panthera tigris",
  "explanation": "Some explanation"
}`,
      },
    ];
  } else {
    history = history.concat({
      role: "user",
      content:
        "Generate another question, interesting and different from before",
    });
  }

  const result = await askAiChat(history);

  const newHistory = history.concat(result.message);

  console.log(result, newHistory);

  const question = questionScheme.parse(
    JSON.parse(jsonrepair(result.message.content))
  );

  console.log(question);

  return [question, newHistory];
}
