export const PREMIUM_SCROLL_MESSAGES = [
  "Scrolling requires a premium subscription. Continue anyway?",
  "Are you sure you want to scroll? This action cannot be undone.",
  "Your scroll has been queued. Estimated wait: 4–6 business days.",
  "Did you mean to scroll? Most users prefer the hero section.",
] as const;

export type PremiumScrollMessage = (typeof PREMIUM_SCROLL_MESSAGES)[number];

export const PREMIUM_QR = {
  id: "premium-qr",
  youtubeUrl: "https://www.youtube.com/watch?v=TusY3CwMBwg",
  imageSrc: "/images/youtube-qr.png",
  message: PREMIUM_SCROLL_MESSAGES[0],
  scanLabel: "SCAN ME",
  dismissLabel: "No thanks",
  continueLabel: "Continue anyway?",
} as const;

export function pickPremiumScrollMessage(): PremiumScrollMessage {
  return PREMIUM_SCROLL_MESSAGES[
    Math.floor(Math.random() * PREMIUM_SCROLL_MESSAGES.length)
  ]!;
}
