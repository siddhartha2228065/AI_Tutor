import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "AI Creative Studio",
  description: "Generate interactive math curricula, visual stories, and AI-powered SVG illustrations with Cuemath's Creative Studio.",
};
export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
