export type LoaderMessage = {
  text: string;
  weight: number;
};

export const loaderMessages: LoaderMessage[] = [
  {
    text: 'This loading screen actually serves no purpose it\'s for the "aesthetics"',
    weight: 10,
  },
  {
    text: "I'm a frontend developer who cares way too much about scroll behavior",
    weight: 3,
  },
  {
    text: "Favorite stack: React, Next.js, GSAP, and too much coffee",
    weight: 2,
  },
  {
    text: "This portfolio is in a constant state of development",
    weight: 2,
  },
  {
    text: "I admire people who express themselves through their craft",
    weight: 1,
  },
  {
    text: "Based in Mumbai, building for the web",
    weight: 1,
  },
];

export function pickLoaderMessage(messages: readonly LoaderMessage[]) {
  const total = messages.reduce((sum, message) => sum + message.weight, 0);
  let roll = Math.random() * total;

  for (const message of messages) {
    roll -= message.weight;
    if (roll <= 0) return message.text;
  }

  return messages[0]?.text ?? "";
}
