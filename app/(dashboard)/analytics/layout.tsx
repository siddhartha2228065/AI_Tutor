import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Math Analytics",
  description: "Track your math mastery, study streaks, weekly activity, and achievements with detailed analytics.",
};
export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
