import { useState, useEffect } from 'react';

export interface TutorBriefing {
  title: string;
  desc: string;
  meta: string;
  icon: string;
  bg: string;
}

export interface TelemetryData {
  totalStudyHours: number;
  conceptsMastered: number;
  currentStreak: number;
  globalRank: string;
  masteryScore: number;
  weeklyActivity: { day: string; hours: number; height: string }[];
  tutorBriefings: TutorBriefing[];
  coursesProgress: { grade: string; title: string; progress: number; bg: string; src: string; }[];
  cognitiveProfile: {
    logic: number;
    speed: number;
    accuracy: number;
    persistence: number;
    clarity: number;
  };
  isHydrated: boolean; // Not saved to storage, just for React
}

const DEFAULT_DATA: Omit<TelemetryData, 'isHydrated'> = {
  totalStudyHours: 0,
  conceptsMastered: 0,
  currentStreak: 0,
  globalRank: "Top 99%",
  masteryScore: 0,
  cognitiveProfile: {
    logic: 20,
    speed: 15,
    accuracy: 30,
    persistence: 10,
    clarity: 25,
  },
  weeklyActivity: [
    { day: "Mon", hours: 0, height: "h-[0%]" },
    { day: "Tue", hours: 0, height: "h-[0%]" },
    { day: "Wed", hours: 0, height: "h-[0%]" },
    { day: "Thu", hours: 0, height: "h-[0%]" },
    { day: "Fri", hours: 0, height: "h-[0%]" },
    { day: "Sat", hours: 0, height: "h-[0%]" },
    { day: "Sun", hours: 0, height: "h-[0%]" },
  ],
  tutorBriefings: [],
  coursesProgress: [
    { grade: "GRADE 8", title: "Algebra Foundations", progress: 0, bg: "bg-primary", src: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80" },
    { grade: "GRADE 7", title: "Geometry: Angles & Triangles", progress: 0, bg: "bg-secondary", src: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&q=80" },
    { grade: "GRADE 9", title: "Linear Equations Workshop", progress: 0, bg: "bg-tertiary", src: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800&q=80" },
  ]
};

export function useTelemetryStore() {
  const [data, setData] = useState<TelemetryData>({ ...DEFAULT_DATA, isHydrated: false });

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('cuemath_telemetry');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure new schema fields (cognitiveProfile) are present for returning users
        const mergedData = { 
          ...DEFAULT_DATA, 
          ...parsed, 
          isHydrated: true 
        };
        setData(mergedData);
      } else {
        // First time user — initialize with default data
        setData({ ...DEFAULT_DATA, isHydrated: true });
        localStorage.setItem('cuemath_telemetry', JSON.stringify(DEFAULT_DATA));
      }
    } catch (e) {
      setData({ ...DEFAULT_DATA, isHydrated: true });
    }
  }, []);

  // Function to simulate adding a new session (used by the AI Tutor when an interview completes)
  const addSessionResult = (topic: string, durationSeconds: number, performanceScore: number) => {
    setData((prev) => {
      // Create new briefing
      const newBriefing: TutorBriefing = {
        title: topic,
        desc: performanceScore > 80 ? "Excellent understanding." : "Needs review on basics.",
        meta: `Just now • ${Math.round(durationSeconds / 60)} mins`,
        icon: "play_arrow",
        bg: performanceScore > 80 ? "bg-secondary-container text-secondary" : "bg-tertiary-container text-tertiary"
      };

      const durationHours = Number((durationSeconds / 3600).toFixed(1));
      
      // Update today's activity
      const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1; // 0=Mon, ... 6=Sun
      const newWeekly = [...prev.weeklyActivity];
      const newHours = newWeekly[todayIdx].hours + durationHours;
      const newHeightPct = Math.min(100, Math.round((newHours / 5) * 100)); // Cap visual at 5 hours = 100%
      newWeekly[todayIdx] = {
        ...newWeekly[todayIdx],
        hours: newHours,
        height: `h-[${newHeightPct}%]`
      };

      // Randomly update a course progress to simulate learning
      const newCourses = [...prev.coursesProgress];
      const randomCourseIdx = Math.floor(Math.random() * newCourses.length);
      newCourses[randomCourseIdx].progress = Math.min(100, newCourses[randomCourseIdx].progress + Math.floor(Math.random() * 20) + 5);

      const newData = {
        ...prev,
        totalStudyHours: Math.round((prev.totalStudyHours + durationHours) * 10) / 10,
        conceptsMastered: performanceScore > 80 ? prev.conceptsMastered + 1 : prev.conceptsMastered,
        masteryScore: Math.round((prev.masteryScore * prev.tutorBriefings.length + performanceScore) / (prev.tutorBriefings.length + 1)) || performanceScore,
        currentStreak: prev.currentStreak === 0 ? 1 : prev.currentStreak, 
        globalRank: "Top " + Math.max(1, 99 - prev.conceptsMastered) + "%",
        weeklyActivity: newWeekly,
        coursesProgress: newCourses,
        tutorBriefings: [newBriefing, ...prev.tutorBriefings].slice(0, 10), // Keep last 10
      };

      // Save to storage
      const { isHydrated, ...toSave } = newData;
      localStorage.setItem('cuemath_telemetry', JSON.stringify(toSave));

      return newData;
    });
  };

  // Give some mock data if empty (just to simulate real app state if the user wants it)
  const seedMockData = () => {
    const mockState = {
      totalStudyHours: 142.5,
      conceptsMastered: 48,
      currentStreak: 12,
      globalRank: "Top 5%",
      masteryScore: 85,
      weeklyActivity: [
        { day: "Mon", hours: 2.5, height: "h-[45%]" },
        { day: "Tue", hours: 3.2, height: "h-[60%]" },
        { day: "Wed", hours: 4.8, height: "h-[90%]" },
        { day: "Thu", hours: 1.5, height: "h-[30%]" },
        { day: "Fri", hours: 5.2, height: "h-[100%]" },
        { day: "Sat", hours: 3.8, height: "h-[70%]" },
        { day: "Sun", hours: 1.0, height: "h-[20%]" },
      ],
      tutorBriefings: [
        { title: "Linear Equations Workshop", desc: '"Solving for variables..."', meta: "2h ago • 14:20 mins", icon: "play_arrow", bg: "bg-secondary-container text-secondary" },
        { title: "Geometry: Angles & Triangles", desc: "Summary of session #42", meta: "Yesterday • 4 pages", icon: "description", bg: "bg-tertiary-container text-on-tertiary-container" },
        { title: "Fraction Mastery Review", desc: '"Adding unlike denominators..."', meta: "2 days ago • 08:45 mins", icon: "play_arrow", bg: "bg-secondary-container text-secondary" },
      ],
      coursesProgress: [
        { grade: "GRADE 8", title: "Algebra Foundations", progress: 72, bg: "bg-primary", src: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80" },
        { grade: "GRADE 7", title: "Geometry: Angles & Triangles", progress: 45, bg: "bg-secondary", src: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&q=80" },
        { grade: "GRADE 9", title: "Linear Equations Workshop", progress: 12, bg: "bg-tertiary", src: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800&q=80" },
      ],
      cognitiveProfile: {
        logic: 85,
        speed: 65,
        accuracy: 92,
        persistence: 78,
        clarity: 88,
      }
    };
    localStorage.setItem('cuemath_telemetry', JSON.stringify(mockState));
    setData({ ...mockState, isHydrated: true });
  };

  return {
    ...data,
    addSessionResult,
    seedMockData
  };
}
