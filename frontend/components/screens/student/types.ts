export interface StudyTask {
  id: number;
  subject: string;
  title: string;
  priority: string;
  date: string;
  due_date: string;
  duration: number;
  duration_minutes: number;
  completed: boolean;
}

export interface Exam {
  id: number;
  subject: string;
  name: string;
  exam_name: string;
  date: string;
  exam_date: string;
  time: string;
  exam_time: string;
  priority: string;
  progress: number;
  progress_percentage: number;
  daysLeft: number;
}

export interface OnboardingOption {
  text: string;
  val: string;
}

export interface OnboardingQuestion {
  id: string;
  question: string;
  options: OnboardingOption[];
}

export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    id: "workload",
    question: "How has your academic workload been feeling lately?",
    options: [
      { text: "Very manageable", val: "Very manageable" },
      { text: "Mostly manageable", val: "Mostly manageable" },
      { text: "A little heavy", val: "A little heavy" },
      { text: "Very overwhelming", val: "Very overwhelming" }
    ]
  },
  {
    id: "stress",
    question: "How would you describe your academic stress levels today?",
    options: [
      { text: "Calm & relaxed", val: "Calm & relaxed" },
      { text: "Manageable", val: "Manageable" },
      { text: "Elevated", val: "Elevated" },
      { text: "Overwhelming", val: "Overwhelming" }
    ]
  },
  {
    id: "sleep",
    question: "How many hours of quality sleep are you getting per night?",
    options: [
      { text: "8+ hours", val: "8+ hours" },
      { text: "6 to 8 hours", val: "6 to 8 hours" },
      { text: "4 to 6 hours", val: "4 to 6 hours" },
      { text: "Under 4 hours", val: "Under 4 hours" }
    ]
  },
  {
    id: "focus",
    question: "How easy is it for you to maintain focus during study sessions?",
    options: [
      { text: "Very easy", val: "Very easy" },
      { text: "Mostly easy", val: "Mostly easy" },
      { text: "Easily distracted", val: "Easily distracted" },
      { text: "Extremely difficult", val: "Extremely difficult" }
    ]
  },
  {
    id: "routine",
    question: "How consistent is your study routine?",
    options: [
      { text: "Highly disciplined", val: "Highly disciplined" },
      { text: "Moderately regular", val: "Moderately regular" },
      { text: "Mostly cramming", val: "Mostly cramming" },
      { text: "Very chaotic", val: "Very chaotic" }
    ]
  },
  {
    id: "examPressure",
    question: "How do you feel about your upcoming exams?",
    options: [
      { text: "Confident & prepared", val: "Confident & prepared" },
      { text: "Mildly anxious", val: "Mildly anxious" },
      { text: "Quite stressed", val: "Quite stressed" },
      { text: "Panicked / Unprepared", val: "Panicked / Unprepared" }
    ]
  },
  {
    id: "motivation",
    question: "How is your motivation to complete academic tasks today?",
    options: [
      { text: "High & inspired", val: "High & inspired" },
      { text: "Moderate", val: "Moderate" },
      { text: "Low", val: "Low" },
      { text: "Completely drained", val: "Completely drained" }
    ]
  },
  {
    id: "balance",
    question: "How well are you balancing study time with your social/personal life?",
    options: [
      { text: "Excellent balance", val: "Excellent balance" },
      { text: "Good balance", val: "Good balance" },
      { text: "Study takes over", val: "Study takes over" },
      { text: "No personal time", val: "No personal time" }
    ]
  },
  {
    id: "mood",
    question: "How is your general mood baseline this week?",
    options: [
      { text: "Good / Happy", val: "Good / Happy" },
      { text: "Okay / Neutral", val: "Okay / Neutral" },
      { text: "Stressed / Anxious", val: "Stressed / Anxious" },
      { text: "Down / Sad", val: "Down / Sad" }
    ]
  },
  {
    id: "supportPreference",
    question: "What kind of support is most important for you right now?",
    options: [
      { text: "Stress & anxiety relief", val: "Stress & anxiety relief" },
      { text: "Focus & study planning", val: "Focus & study planning" },
      { text: "Sleep & rest optimization", val: "Sleep & rest optimization" },
      { text: "AI companion conversations", val: "AI companion conversations" }
    ]
  }
];
