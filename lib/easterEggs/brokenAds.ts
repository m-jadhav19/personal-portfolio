export type AdVariant = "popup" | "banner" | "alert";

export type AdPopup = {
  id: number;
  title: string;
  body: string;
  cta: string;
  accent: string;
  variant: AdVariant;
  x: number;
  y: number;
  rotation: number;
  progress?: number;
  urgent?: boolean;
};

export const AD_TEMPLATES: Omit<
  AdPopup,
  "id" | "x" | "y" | "rotation" | "progress"
>[] = [
  {
    title: "CONGRATULATIONS!",
    body: "You are our 1,000,000th visitor! Claim your FREE iPod Nano NOW!!!",
    cta: "CLAIM PRIZE",
    accent: "#c000c0",
    variant: "popup",
    urgent: true,
  },
  {
    title: "VIRUS DETECTED",
    body: "47 threats found. Mandar Antivirus™ can fix this in 3 easy payments of your dignity.",
    cta: "SCAN NOW",
    accent: "#cc0000",
    variant: "alert",
    urgent: true,
  },
  {
    title: "DOWNLOAD RAM",
    body: "Your browser is running low on RAM. Download 16GB instantly. 100% legit. Trust me bro.",
    cta: "DOWNLOAD",
    accent: "#008000",
    variant: "popup",
  },
  {
    title: "HOT SINGLES IN AREA",
    body: "Frontend developers near you want to pair program. npm install feelings.",
    cta: "MEET THEM",
    accent: "#cc6600",
    variant: "banner",
  },
  {
    title: "YOU WON AN NFT",
    body: "Exclusive resume JPEG minted just for you. Gas fees are a personality trait.",
    cta: "MINT NOW",
    accent: "#6600cc",
    variant: "popup",
  },
  {
    title: "TOOLBAR INSTALL",
    body: "Installing Ask Jeeves toolbar… please do not close this ad-shaped mistake.",
    cta: "INSTALL",
    accent: "#0000cc",
    variant: "banner",
  },
  {
    title: "COOKIES 2.0",
    body: "We now track vibes, aura, and scroll regret. Accept for 12 bonus ads.",
    cta: "ACCEPT ALL",
    accent: "#996600",
    variant: "alert",
  },
  {
    title: "MAKE $5000/DAY",
    body: "Doctors HATE this one weird scroll trick. Inverted scrolling can change your life.",
    cta: "LEARN MORE",
    accent: "#008888",
    variant: "popup",
  },
  {
    title: "WIN FREE MOUSE",
    body: "Your cursor qualifies for a premium warranty. Click 47 times to claim.",
    cta: "CLAIM MOUSE",
    accent: "#ff0099",
    variant: "popup",
    urgent: true,
  },
  {
    title: "SYSTEM ALERT",
    body: "Your scroll wheel firmware is out of date. Update now or keep suffering beautifully.",
    cta: "UPDATE",
    accent: "#3333ff",
    variant: "alert",
  },
];

export const MAX_ADS = 7;

export function createAdPosition(index: number) {
  const cols = 3;
  const col = index % cols;
  const row = Math.floor(index / cols);

  return {
    x: 4 + col * 30 + Math.random() * 8,
    y: 14 + row * 22 + Math.random() * 6,
    rotation: (Math.random() - 0.5) * 8,
  };
}
