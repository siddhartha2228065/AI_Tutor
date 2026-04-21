import { useState, useEffect } from 'react';

export interface TutorBriefing {
  title: string;
  desc: string;
  meta: string;
  icon: string;
  bg: string;
}

export interface UpcomingLesson {
  id: string;
  topic: string;
  time: string;
  tutor: string;
  bg: string;
}

export interface SocialChallenge {
  id: string;
  user: string;
  avatar: string;
  score: number;
}

export interface Candidate {
  id: string;
  name: string;
  date: string;
  metrics: {
    clarity: number;
    engagement: number;
    patience: number;
    adaptability: number;
  };
  summary: string;
}

export interface RoadmapWeek {
  week: number;
  focus: string;
  topics: { title: string; desc: string; icon: string }[];
  outcome: string;
}

export interface Roadmap {
  id: string;
  candidateName: string;
  title: string;
  weeks: RoadmapWeek[];
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
  topicsMastery: { name: string; mastery: number; status: string }[];
  upcomingLessons: UpcomingLesson[];
  socialChallenges: SocialChallenge[];
  candidates: Candidate[];
  currentRoadmap: Roadmap | null;
  completedTopics: string[]; // List of topic titles completed
  roadmapStartDate: string | null; // ISO string of when it was generated
  isHydrated: boolean; 
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
  topicsMastery: [
    { name: "Algebra", mastery: 0, status: "Beginner" },
    { name: "Calculus", mastery: 0, status: "Beginner" },
    { name: "Geometry", mastery: 0, status: "Beginner" },
    { name: "Trig", mastery: 0, status: "Beginner" },
    { name: "Statistics", mastery: 0, status: "Beginner" },
    { name: "Logic", mastery: 0, status: "Beginner" },
    { name: "Arithmetic", mastery: 0, status: "Beginner" },
    { name: "Functions", mastery: 0, status: "Beginner" },
  ],
  upcomingLessons: [],
  socialChallenges: [],
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
    { grade: "GRADE 8", title: "Algebra Foundations", progress: 0, bg: "bg-indigo-500", src: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80" },
    { grade: "GRADE 7", title: "Geometry: Angles & Triangles", progress: 0, bg: "bg-teal-500", src: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&q=80" },
    { grade: "GRADE 9", title: "Linear Equations Workshop", progress: 0, bg: "bg-rose-500", src: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800&q=80" },
  ],
  candidates: [],
  currentRoadmap: null,
  completedTopics: [],
  roadmapStartDate: null,
};

export function useTelemetryStore() {
  const [data, setData] = useState<TelemetryData>({ ...DEFAULT_DATA, isHydrated: false });

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('cuemath_telemetry');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure new schema fields are present
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

  // Function to simulate adding a new session
  const addSessionResult = (topic: string, durationSeconds: number, performanceScore: number) => {
    setData((prev) => {
      const newBriefing: TutorBriefing = {
        title: topic,
        desc: performanceScore > 80 ? "Excellent understanding." : "Needs review on basics.",
        meta: `Just now • ${Math.round(durationSeconds / 60)} mins`,
        icon: "play_arrow",
        bg: performanceScore > 80 ? "bg-indigo-500/20 text-indigo-400" : "bg-rose-500/20 text-rose-400"
      };

      const durationHours = Number((durationSeconds / 3600).toFixed(1));
      const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
      const newWeekly = [...prev.weeklyActivity];
      const newHours = newWeekly[todayIdx].hours + durationHours;
      const newHeightPct = Math.min(100, Math.round((newHours / 5) * 100));
      newWeekly[todayIdx] = {
        ...newWeekly[todayIdx],
        hours: newHours,
        height: `h-[${newHeightPct}%]`
      };

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
        tutorBriefings: [newBriefing, ...prev.tutorBriefings].slice(0, 10),
      };

      const { isHydrated, ...toSave } = newData;
      localStorage.setItem('cuemath_telemetry', JSON.stringify(toSave));
      return newData;
    });
  };

  const saveCandidate = (candidateData: Omit<Candidate, 'id'>) => {
    setData((prev) => {
      const newCandidate: Candidate = {
        ...candidateData,
        id: `c-${Date.now()}`
      };

      let newCandidates = [newCandidate, ...prev.candidates];
      if (newCandidates.length > 5) {
        newCandidates = newCandidates.slice(0, 5);
      }

      const newData = { ...prev, candidates: newCandidates };
      const { isHydrated, ...toSave } = newData;
      localStorage.setItem('cuemath_telemetry', JSON.stringify(toSave));
      return newData;
    });
  };

  const setRoadmap = (roadmap: Roadmap) => {
    setData((prev) => {
      const newData = { 
        ...prev, 
        currentRoadmap: roadmap,
        roadmapStartDate: new Date().toISOString(),
        completedTopics: [] // Reset progress for new roadmap
      };
      const { isHydrated, ...toSave } = newData;
      localStorage.setItem('cuemath_telemetry', JSON.stringify(toSave));
      return newData;
    });
  };

  const toggleTopic = (topicTitle: string) => {
    setData((prev) => {
      const isCompleted = prev.completedTopics.includes(topicTitle);
      const newCompleted = isCompleted
        ? prev.completedTopics.filter(t => t !== topicTitle)
        : [...prev.completedTopics, topicTitle];
      
      const newData = { ...prev, completedTopics: newCompleted };
      const { isHydrated, ...toSave } = newData;
      localStorage.setItem('cuemath_telemetry', JSON.stringify(toSave));
      return newData;
    });
  };

  const generateRoadmap = async (candidate: Candidate) => {
    try {
      const response = await fetch('/api/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidate })
      });
      if (!response.ok) throw new Error('Failed to generate roadmap');
      const data = await response.json();
      setRoadmap(data.roadmap);
      return data.roadmap;
    } catch (error) {
      console.error('Error generating roadmap:', error);
      throw error;
    }
  };

  // Seed truly random data
  const seedMockData = () => {
    const randomInRange = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    const randomFloat = (min: number, max: number) => Math.round((Math.random() * (max - min) + min) * 10) / 10;
    
    const topicsArr = ["Algebra", "Calculus", "Geometry", "Trig", "Statistics", "Logic", "Arithmetic", "Functions"];
    const tutors = ["Dr. Sarah", "Prof. Mike", "AI Tutor", "James W.", "Elena R."];
    const bgs = ["bg-indigo-500/20 text-indigo-400", "bg-teal-500/20 text-teal-400", "bg-rose-500/20 text-rose-400", "bg-orange-500/20 text-orange-400"];
    
    const mockState = {
      totalStudyHours: randomFloat(50, 300),
      conceptsMastered: randomInRange(20, 80),
      currentStreak: randomInRange(3, 30),
      globalRank: `Top ${randomInRange(1, 15)}%`,
      masteryScore: randomInRange(60, 98),
      weeklyActivity: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => {
        const hours = randomFloat(0.5, 6);
        return { day, hours, height: `h-[${Math.min(100, Math.round((hours / 6) * 100))}%]` };
      }),
      tutorBriefings: [
        { title: "Linear Equations", desc: '"Solving for variables..."', meta: "2h ago • 14:20 mins", icon: "play_arrow", bg: bgs[0] },
        { title: "Geometry Basics", desc: "Complex trigonometry", meta: "Yesterday • 22 mins", icon: "description", bg: bgs[1] },
        { title: "Fraction Review", desc: '"Unlike denominators..."', meta: "2 days ago • 08:45 mins", icon: "play_arrow", bg: bgs[2] },
      ],
      coursesProgress: [
        { grade: "8", title: "Algebra", progress: randomInRange(40, 95), bg: "bg-indigo-500", src: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800" },
        { grade: "7", title: "Geometry", progress: randomInRange(20, 80), bg: "bg-teal-500", src: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800" },
        { grade: "9", title: "Linear Systems", progress: randomInRange(5, 40), bg: "bg-rose-500", src: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800" },
      ],
      cognitiveProfile: {
        logic: randomInRange(40, 100),
        speed: randomInRange(40, 100),
        accuracy: randomInRange(40, 100),
        persistence: randomInRange(40, 100),
        clarity: randomInRange(40, 100),
      },
      topicsMastery: topicsArr.map(name => {
        const mastery = randomInRange(10, 100);
        const status = mastery > 90 ? "Master" : mastery > 75 ? "Expert" : mastery > 60 ? "Advanced" : mastery > 40 ? "Steady" : "Learning";
        return { name, mastery, status };
      }),
      upcomingLessons: Array.from({ length: 3 }).map((_, i) => ({
        id: `l-${i}`,
        topic: topicsArr[randomInRange(0, topicsArr.length-1)],
        time: `${randomInRange(1, 12)}:00 PM`,
        tutor: tutors[randomInRange(0, tutors.length-1)],
        bg: bgs[randomInRange(0, bgs.length-1)]
      })),
      socialChallenges: Array.from({ length: 4 }).map((_, i) => ({
        id: `s-${i}`,
        user: ["Alex", "Sophia", "Rohan", "Mia"][i],
        avatar: `https://i.pravatar.cc/150?u=${i+20}`,
        score: randomInRange(800, 2000)
      })),
      candidates: [],
      currentRoadmap: null,
      completedTopics: [],
      roadmapStartDate: null
    };
    localStorage.setItem('cuemath_telemetry', JSON.stringify(mockState));
    setData({ ...mockState, isHydrated: true });
  };

  return {
    ...data,
    addSessionResult,
    seedMockData,
    saveCandidate,
    generateRoadmap,
    setRoadmap,
    toggleTopic
  };
}
