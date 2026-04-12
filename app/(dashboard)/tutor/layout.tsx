import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "AI Tutor Screener",
  description: "Conduct AI-powered tutor interviews with voice-based assessment, real-time evaluation metrics, and detailed hiring reports for Cuemath.",
};
export default function TutorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
