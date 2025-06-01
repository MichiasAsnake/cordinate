import localFont from "next/font/local";

export const regular = localFont({
  src: "../public/fonts/regular.ttf",
  variable: "--font-regular",
  display: "swap",
});

export const medium = localFont({
  src: "../public/fonts/medium.ttf",
  variable: "--font-medium",
  display: "swap",
});
