export type PromptKind = "fact" | "quiz" | "whisper";

export type EasterEggPrompt = {
  id: string;
  kind: PromptKind;
  text: string;
  weight: number;
  options?: [string, string];
  answer?: 0 | 1;
  feedback?: {
    correct: string;
    wrong: string;
  };
  dismissFeedback?: string;
};

const dismissNotes = [
  "Noted.",
  "Carry on.",
  "Fair enough.",
  "The hunt continues.",
  "Logged for later.",
  "As you were.",
];

export const easterEggPrompts: EasterEggPrompt[] = [
  // Whispers — subtle, never spell out triggers
  {
    id: "whisper-typed",
    kind: "whisper",
    text: "Some secrets are typed, not clicked.",
    weight: 3,
  },
  {
    id: "whisper-muscle",
    kind: "whisper",
    text: "Muscle memory from the 90s might still work on a website.",
    weight: 2,
  },
  {
    id: "whisper-arrows",
    kind: "whisper",
    text: "Arrow keys had a whole career before carousels existed.",
    weight: 2,
  },
  {
    id: "whisper-menu",
    kind: "whisper",
    text: "Not every surprise needs a button. Some need a sequence.",
    weight: 2,
  },
  {
    id: "whisper-san-andreas",
    kind: "whisper",
    text: "San Andreas taught a generation that words could spawn chaos.",
    weight: 2,
  },
  {
    id: "whisper-pink",
    kind: "whisper",
    text: "Somewhere on the internet, the early 2000s never quite logged off.",
    weight: 2,
  },
  {
    id: "whisper-polish",
    kind: "whisper",
    text: "Polished things hide scratches. Websites are no exception.",
    weight: 3,
  },
  {
    id: "whisper-scroll",
    kind: "whisper",
    text: "Smooth scroll behavior is suspicious. Almost too obedient.",
    weight: 2,
  },
  {
    id: "whisper-pause",
    kind: "whisper",
    text: "The best cheat codes never needed a pause menu.",
    weight: 2,
  },

  // Facts — general web, gaming, and internet trivia
  {
    id: "fact-first-site",
    kind: "fact",
    text: "The first website ever made is still online.",
    weight: 4,
    dismissFeedback: "History, preserved.",
  },
  {
    id: "fact-moth",
    kind: "fact",
    text: "The first computer \"bug\" was an actual moth in a relay.",
    weight: 3,
    dismissFeedback: "Debugging lore acquired.",
  },
  {
    id: "fact-captcha",
    kind: "fact",
    text: "CAPTCHA is an acronym. Most people just suffer through it.",
    weight: 3,
    dismissFeedback: "Select all the squares.",
  },
  {
    id: "fact-honey",
    kind: "fact",
    text: "Honey never spoils. CSS animations from 2009 sometimes do.",
    weight: 3,
    dismissFeedback: "Sweet and stable.",
  },
  {
    id: "fact-teapot",
    kind: "fact",
    text: "HTTP 418 \"I'm a teapot\" is a real status code. Seriously.",
    weight: 3,
    dismissFeedback: "Brewing acknowledged.",
  },
  {
    id: "fact-qwerty",
    kind: "fact",
    text: "QWERTY was designed to slow typists down. It worked too well.",
    weight: 2,
    dismissFeedback: "Keys noted.",
  },
  {
    id: "fact-emoji",
    kind: "fact",
    text: "The first emoji set was created in Japan, 1999.",
    weight: 3,
    dismissFeedback: "Emotion logged.",
  },
  {
    id: "fact-blink",
    kind: "fact",
    text: "The <blink> tag was deprecated for very good reasons.",
    weight: 3,
    dismissFeedback: "No blinking here.",
  },
  {
    id: "fact-tab",
    kind: "fact",
    text: "The Tab key was invented before the web. Still undefeated.",
    weight: 2,
    dismissFeedback: "Accessibility win.",
  },
  {
    id: "fact-space",
    kind: "fact",
    text: "There is an entire Wikipedia article about the void left by Spacebar.",
    weight: 2,
    dismissFeedback: "Keyboard culture.",
  },

  // Quizzes — general trivia with feedback
  {
    id: "quiz-html",
    kind: "quiz",
    text: "HTML stands for HyperText Markup Language.",
    options: ["True", "False"],
    answer: 0,
    feedback: {
      correct: "Correct — the backbone of the web.",
      wrong: "It does. HyperText Markup Language.",
    },
    weight: 3,
  },
  {
    id: "quiz-js-java",
    kind: "quiz",
    text: "JavaScript and Java are the same language.",
    options: ["True", "False"],
    answer: 1,
    feedback: {
      correct: "Right — namesake confusion since 1995.",
      wrong: "They are not. Similar name, very different beasts.",
    },
    weight: 3,
  },
  {
    id: "quiz-wifi",
    kind: "quiz",
    text: "Wi-Fi is short for \"Wireless Fidelity.\"",
    options: ["True", "False"],
    answer: 1,
    feedback: {
      correct: "Nope — marketing myth. Wi-Fi means nothing officially.",
      wrong: "Common myth. It is not short for Wireless Fidelity.",
    },
    weight: 2,
  },
  {
    id: "quiz-purple",
    kind: "quiz",
    text: "\"purple\" is a valid CSS color keyword.",
    options: ["True", "False"],
    answer: 0,
    feedback: {
      correct: "It is. Along with tomato, snow, and gainsboro.",
      wrong: "It is valid. CSS color names get weird.",
    },
    weight: 2,
  },
  {
    id: "quiz-teapot",
    kind: "quiz",
    text: "HTTP status code 418 is defined in an RFC.",
    options: ["True", "False"],
    answer: 0,
    feedback: {
      correct: "Yes — I'm a teapot, per RFC 2324.",
      wrong: "It is real. The internet has jokes in the spec.",
    },
    weight: 2,
  },
  {
    id: "quiz-blink",
    kind: "quiz",
    text: "The <blink> element is a modern best practice.",
    options: ["True", "False"],
    answer: 1,
    feedback: {
      correct: "Please no. It was deprecated for everyone's sanity.",
      wrong: "Hard no. Some things should stay in 1997.",
    },
    weight: 3,
  },
];

export function pickEasterEggPrompt(
  prompts: readonly EasterEggPrompt[] = easterEggPrompts,
) {
  const total = prompts.reduce((sum, prompt) => sum + prompt.weight, 0);
  let roll = Math.random() * total;

  for (const prompt of prompts) {
    roll -= prompt.weight;
    if (roll <= 0) return prompt;
  }

  return prompts[0];
}

export function pickDismissFeedback(prompt: EasterEggPrompt) {
  if (prompt.dismissFeedback) return prompt.dismissFeedback;
  return dismissNotes[Math.floor(Math.random() * dismissNotes.length)];
}
