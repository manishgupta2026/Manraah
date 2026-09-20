export interface TherapistTag {
  text: string;
  lightBg: string;
  darkBg: string;
}

export interface UnifiedTherapist {
  id: string;
  name: string;
  role: string;
  rating: string | number;
  reviewCount: string | number;
  experience: string;
  badge?: string;
  badgeClass?: string;
  description: string;
  profileImage: string;
  image: string; // Alias for backward compatibility
  bgTint: string;
  borderClass: string;
  tags: TherapistTag[];
  availability: string;
  hourlyRate?: string;
}

const TINT_PALETTES = [
  {
    bgTint: "bg-[#F0F9F5] dark:bg-[#102F27]",
    borderClass: "border border-[#D6EFE2] dark:border-[#23483E]",
    badgeClass: "bg-[#DCF2E7] text-[#006C56] dark:bg-[#14382F] dark:text-[#88F7D6]",
    defaultBadge: "Top Rated",
  },
  {
    bgTint: "bg-[#F0F6FD] dark:bg-[#102F27]",
    borderClass: "border border-[#D4E5F7] dark:border-[#23483E]",
    badgeClass: "bg-[#E1EDFA] text-[#1A73E8] dark:bg-[#153B54] dark:text-[#A8C7FA]",
    defaultBadge: "Highly Rated",
  },
  {
    bgTint: "bg-[#FAF2F8] dark:bg-[#102F27]",
    borderClass: "border border-[#F2D7EE] dark:border-[#23483E]",
    badgeClass: "bg-[#F5E6F5] text-[#8430CE] dark:bg-[#3D1D4A] dark:text-[#E2B7FA]",
    defaultBadge: "Popular",
  },
  {
    bgTint: "bg-[#FFF9F2] dark:bg-[#102F27]",
    borderClass: "border border-[#FCE6D2] dark:border-[#23483E]",
    badgeClass: "bg-[#FDF0DF] text-[#D97706] dark:bg-[#3E2911] dark:text-[#FCD34D]",
    defaultBadge: "Specialist",
  },
];

const TAG_COLOR_PALETTES = [
  { lightBg: "bg-[#E1F3EA] text-[#0A6349]", darkBg: "dark:bg-[#14382F] dark:text-[#88F7D6] dark:border dark:border-[#23483E]" },
  { lightBg: "bg-[#E5EFFB] text-[#185FA5]", darkBg: "dark:bg-[#14382F] dark:text-[#A8C7FA] dark:border dark:border-[#23483E]" },
  { lightBg: "bg-[#F2E8FA] text-[#712BB8]", darkBg: "dark:bg-[#14382F] dark:text-[#CFC4F7] dark:border dark:border-[#23483E]" },
  { lightBg: "bg-[#FEF3C7] text-[#92400E]", darkBg: "dark:bg-[#14382F] dark:text-[#FCD34D] dark:border dark:border-[#23483E]" },
];

export function normalizeTherapist(raw: any, index: number = 0): UnifiedTherapist {
  const palette = TINT_PALETTES[index % TINT_PALETTES.length];

  // Format tags / specialties
  let tags: TherapistTag[] = [];
  if (Array.isArray(raw.tags) && raw.tags.length > 0) {
    if (typeof raw.tags[0] === "string") {
      tags = raw.tags.map((t: string, i: number) => {
        const color = TAG_COLOR_PALETTES[i % TAG_COLOR_PALETTES.length];
        return { text: t, lightBg: color.lightBg, darkBg: color.darkBg };
      });
    } else {
      tags = raw.tags;
    }
  } else if (Array.isArray(raw.specialties) && raw.specialties.length > 0) {
    tags = raw.specialties.map((s: string, i: number) => {
      const color = TAG_COLOR_PALETTES[i % TAG_COLOR_PALETTES.length];
      return { text: s, lightBg: color.lightBg, darkBg: color.darkBg };
    });
  } else {
    tags = [
      { text: "Mental Wellness", lightBg: TAG_COLOR_PALETTES[0].lightBg, darkBg: TAG_COLOR_PALETTES[0].darkBg },
      { text: "Mindfulness", lightBg: TAG_COLOR_PALETTES[1].lightBg, darkBg: TAG_COLOR_PALETTES[1].darkBg },
    ];
  }

  // Determine experience
  let experience = raw.experience;
  if (!experience) {
    const years = 8 + (index * 2) % 10;
    experience = `${years}+ yrs experience`;
  }

  // Determine availability string
  let availability = "Available this week";
  if (raw.availability) {
    availability = raw.availability;
  } else if (Array.isArray(raw.availableTimes) && raw.availableTimes.length > 0) {
    availability = `Next: ${raw.availableTimes[0]}`;
  }

  // Unique, consistent profile image (never random)
  const resolvedProfileImage =
    raw.profileImage ||
    raw.image ||
    raw.avatar ||
    "/images/therapists/default-professional.jpg";

  return {
    id: raw.id || `therapist-${index + 1}`,
    name: raw.name || "Licensed Specialist",
    role: raw.role || raw.title || "Clinical Psychologist",
    rating: raw.rating ? String(raw.rating) : "4.9",
    reviewCount: raw.reviewCount || raw.review_count || `${90 + (index * 15) % 100}+`,
    experience,
    badge: raw.badge || palette.defaultBadge,
    badgeClass: raw.badgeClass || palette.badgeClass,
    description:
      raw.description ||
      raw.bio ||
      "Dedicated mental health professional providing empathetic, evidence-based care tailored to your journey.",
    profileImage: resolvedProfileImage,
    image: resolvedProfileImage,
    bgTint: raw.bgTint || palette.bgTint,
    borderClass: raw.borderClass || palette.borderClass,
    tags,
    availability,
    hourlyRate: raw.hourlyRate || raw.price,
  };
}

export const FALLBACK_THERAPISTS: UnifiedTherapist[] = [
  {
    id: "dr-sarah-jenkins",
    name: "Dr. Sarah Jenkins",
    role: "Clinical Psychologist",
    rating: "4.95",
    reviewCount: "128+",
    experience: "12+ yrs experience",
    badge: "Top Rated",
    badgeClass: "bg-[#DCF2E7] text-[#006C56] dark:bg-[#14382F] dark:text-[#88F7D6]",
    description:
      "Specializes in anxiety, stress management, and emotional well-being. Helping you build a calmer, more confident you through evidence-based cognitive therapy.",
    profileImage: "/images/therapists/sarah-jenkins.jpg",
    image: "/images/therapists/sarah-jenkins.jpg",
    bgTint: "bg-[#F0F9F5] dark:bg-[#102F27]",
    borderClass: "border border-[#D6EFE2] dark:border-[#23483E]",
    tags: [
      { text: "Anxiety & Stress", lightBg: "bg-[#E1F3EA] text-[#0A6349]", darkBg: "dark:bg-[#14382F] dark:text-[#88F7D6] dark:border dark:border-[#23483E]" },
      { text: "Self-Esteem", lightBg: "bg-[#E5EFFB] text-[#185FA5]", darkBg: "dark:bg-[#14382F] dark:text-[#A8C7FA] dark:border dark:border-[#23483E]" },
      { text: "Emotional Well-being", lightBg: "bg-[#F2E8FA] text-[#712BB8]", darkBg: "dark:bg-[#14382F] dark:text-[#CFC4F7] dark:border dark:border-[#23483E]" },
    ],
    availability: "Available this week",
    hourlyRate: "₹1,800 / session",
  },
  {
    id: "dr-arjun-mehta",
    name: "Dr. Arjun Mehta",
    role: "Career Counselor",
    rating: "4.88",
    reviewCount: "94+",
    experience: "10+ yrs experience",
    badge: "Highly Rated",
    badgeClass: "bg-[#E1EDFA] text-[#1A73E8] dark:bg-[#153B54] dark:text-[#A8C7FA]",
    description:
      "Helps you navigate career transitions, workplace challenges, boundary setting, and achieve sustainable work-life balance.",
    profileImage: "/images/therapists/arjun-mehta.jpg",
    image: "/images/therapists/arjun-mehta.jpg",
    bgTint: "bg-[#F0F6FD] dark:bg-[#102F27]",
    borderClass: "border border-[#D4E5F7] dark:border-[#23483E]",
    tags: [
      { text: "Work-Life Balance", lightBg: "bg-[#E1F3EA] text-[#0A6349]", darkBg: "dark:bg-[#14382F] dark:text-[#88F7D6] dark:border dark:border-[#23483E]" },
      { text: "Career Growth", lightBg: "bg-[#E5EFFB] text-[#185FA5]", darkBg: "dark:bg-[#14382F] dark:text-[#A8C7FA] dark:border dark:border-[#23483E]" },
      { text: "Goal Setting", lightBg: "bg-[#F2E8FA] text-[#712BB8]", darkBg: "dark:bg-[#14382F] dark:text-[#CFC4F7] dark:border dark:border-[#23483E]" },
    ],
    availability: "Available this week",
    hourlyRate: "₹1,600 / session",
  },
  {
    id: "dr-neha-kapoor",
    name: "Dr. Neha Kapoor",
    role: "Relationship Therapist",
    rating: "4.92",
    reviewCount: "140+",
    experience: "14+ yrs experience",
    badge: "Popular",
    badgeClass: "bg-[#F5E6F5] text-[#8430CE] dark:bg-[#3D1D4A] dark:text-[#E2B7FA]",
    description:
      "Supports individuals and couples in building healthier, happier relationships, empathetic communication, and deep emotional trust.",
    profileImage: "/images/therapists/neha-kapoor.jpg",
    image: "/images/therapists/neha-kapoor.jpg",
    bgTint: "bg-[#FAF2F8] dark:bg-[#102F27]",
    borderClass: "border border-[#F2D7EE] dark:border-[#23483E]",
    tags: [
      { text: "Relationships", lightBg: "bg-[#E1F3EA] text-[#0A6349]", darkBg: "dark:bg-[#14382F] dark:text-[#88F7D6] dark:border dark:border-[#23483E]" },
      { text: "Communication", lightBg: "bg-[#E5EFFB] text-[#185FA5]", darkBg: "dark:bg-[#14382F] dark:text-[#A8C7FA] dark:border dark:border-[#23483E]" },
      { text: "Family Well-being", lightBg: "bg-[#F2E8FA] text-[#712BB8]", darkBg: "dark:bg-[#14382F] dark:text-[#CFC4F7] dark:border dark:border-[#23483E]" },
    ],
    availability: "Available this week",
    hourlyRate: "₹2,000 / session",
  },
  {
    id: "dr-vikram-patel",
    name: "Dr. Vikram Patel",
    role: "Wellness Coach",
    rating: "4.87",
    reviewCount: "112+",
    experience: "15+ yrs experience",
    badge: "Top Rated",
    badgeClass: "bg-[#DCF2E7] text-[#006C56] dark:bg-[#14382F] dark:text-[#88F7D6]",
    description:
      "Assists working professionals, founders, and leaders in conquering chronic stress, fatigue, and imposter feelings through somatic wellness coaching.",
    profileImage: "/images/therapists/vikram-patel.jpg",
    image: "/images/therapists/vikram-patel.jpg",
    bgTint: "bg-[#F0F9F5] dark:bg-[#102F27]",
    borderClass: "border border-[#D6EFE2] dark:border-[#23483E]",
    tags: [
      { text: "Burnout Care", lightBg: "bg-[#E1F3EA] text-[#0A6349]", darkBg: "dark:bg-[#14382F] dark:text-[#88F7D6] dark:border dark:border-[#23483E]" },
      { text: "Leadership", lightBg: "bg-[#E5EFFB] text-[#185FA5]", darkBg: "dark:bg-[#14382F] dark:text-[#A8C7FA] dark:border dark:border-[#23483E]" },
      { text: "High Performance", lightBg: "bg-[#F2E8FA] text-[#712BB8]", darkBg: "dark:bg-[#14382F] dark:text-[#CFC4F7] dark:border dark:border-[#23483E]" },
    ],
    availability: "Available this week",
    hourlyRate: "₹2,200 / session",
  },
  {
    id: "dr-ananya-sen",
    name: "Dr. Ananya Sen",
    role: "Mindfulness & Youth Specialist",
    rating: "4.96",
    reviewCount: "85+",
    experience: "8+ yrs experience",
    badge: "Specialist",
    badgeClass: "bg-[#FDF0DF] text-[#D97706] dark:bg-[#3E2911] dark:text-[#FCD34D]",
    description:
      "Guides students and young adults with academic pressure, exam anxiety, mindfulness meditation, and focus optimization routines.",
    profileImage: "/images/therapists/ananya-sen.jpg",
    image: "/images/therapists/ananya-sen.jpg",
    bgTint: "bg-[#FFF9F2] dark:bg-[#102F27]",
    borderClass: "border border-[#FCE6D2] dark:border-[#23483E]",
    tags: [
      { text: "Student Wellness", lightBg: "bg-[#E1F3EA] text-[#0A6349]", darkBg: "dark:bg-[#14382F] dark:text-[#88F7D6] dark:border dark:border-[#23483E]" },
      { text: "Exam Stress", lightBg: "bg-[#E5EFFB] text-[#185FA5]", darkBg: "dark:bg-[#14382F] dark:text-[#A8C7FA] dark:border dark:border-[#23483E]" },
      { text: "Mindfulness", lightBg: "bg-[#F2E8FA] text-[#712BB8]", darkBg: "dark:bg-[#14382F] dark:text-[#CFC4F7] dark:border dark:border-[#23483E]" },
    ],
    availability: "Available tomorrow",
    hourlyRate: "₹1,500 / session",
  },
];
