/**
 * Community Content Moderation & Inappropriate Content Detector
 *
 * Protects Manraah peer circles by preventing profane, abusive, harassing,
 * threatening, or sexually explicit content from being posted.
 */

// Normalized lists of inappropriate keywords and phrases
const INAPPROPRIATE_PHRASES = [
  "kill yourself",
  "kill urself",
  "kys",
  "go die",
  "hope you die",
  "hang yourself",
  "end your life",
  "slit your wrist",
  "commit suicide",
  "i will kill you",
  "i will hurt you",
  "i will find you",
  "i will beat you",
  "you should die",
  "nobody loves you",
  "worthless piece of",
  "waste of breath",
  "waste of oxygen",
  "fuck you",
  "fuck off",
  "shut the fuck up",
  "stfu",
  "piece of shit",
  "eat shit",
  "son of a bitch",
  "motherfucker",
  "mother fucker",
];

// Single word profanities, slurs, explicit sexual terms, and insults
const INAPPROPRIATE_WORDS = [
  // Profanity & vulgarity
  "fuck",
  "fucker",
  "fucking",
  "fucked",
  "fck",
  "shit",
  "shitty",
  "bullshit",
  "bitch",
  "bitches",
  "bitching",
  "bastard",
  "asshole",
  "arsehole",
  "cunt",
  "dick",
  "dickhead",
  "cock",
  "pussy",
  "whore",
  "slut",
  "sluts",
  "twat",
  "wanker",
  "prick",
  "jackass",
  "dipshit",
  // Slurs & hate speech
  "nigger",
  "nigga",
  "faggot",
  "fag",
  "retard",
  "retarded",
  // Sexually explicit
  "porn",
  "porno",
  "pornography",
  "blowjob",
  "handjob",
  "gangbang",
  "rape",
  "rapist",
  "molest",
  "molester",
  "nude",
  "nudes",
  "boobs",
  "penis",
  "vagina",
  // Common abusive Hinglish terms
  "madarchod",
  "bhenchod",
  "behenchod",
  "chutiya",
  "chutiye",
  "gandu",
  "harami",
  "kameena",
  "kameeni",
  "bhosdike",
  "bhosdiwale",
  "randi",
  "gaand",
  "lauda",
  "lodu",
];

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    // replace common leetspeak substitutions
    .replace(/@/g, "a")
    .replace(/\$/g, "s")
    .replace(/0/g, "o")
    .replace(/1/g, "i")
    .replace(/!/g, "i")
    .replace(/3/g, "e")
    // collapse repeated characters (e.g. fuuuuuck -> fuck)
    .replace(/(.)\1{2,}/g, "$1$1")
    // replace multiple spaces/tabs
    .replace(/\s+/g, " ");
}

export interface ModerationResult {
  isInappropriate: boolean;
  reason?: string;
  matchedContent?: string;
}

/**
 * Checks a piece of text (or title and content combined) for inappropriate content.
 * Returns isInappropriate=true and a friendly explanation if flagged.
 */
export function checkInappropriateContent(
  text: string,
  fieldLabel = "message"
): ModerationResult {
  if (!text || typeof text !== "string") {
    return { isInappropriate: false };
  }

  const rawCleaned = text.trim();
  const normalized = normalizeText(rawCleaned);

  // 1. Check multi-word inappropriate phrases
  for (const phrase of INAPPROPRIATE_PHRASES) {
    if (normalized.includes(phrase)) {
      return {
        isInappropriate: true,
        reason: `Your ${fieldLabel} contains language or sentiments that violate our community safety standards.`,
        matchedContent: phrase,
      };
    }
  }

  // 2. Check individual inappropriate words with word boundaries
  // Use regex to avoid matching substrings inside harmless words (e.g., "classic", "pass", "assume")
  for (const word of INAPPROPRIATE_WORDS) {
    const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(?:^|[^a-zA-Z0-9])${escapedWord}(?:$|[^a-zA-Z0-9])`, "i");
    
    if (regex.test(normalized) || regex.test(rawCleaned.toLowerCase())) {
      return {
        isInappropriate: true,
        reason: `Your ${fieldLabel} contains words or terms that are not allowed in Manraah peer circles.`,
        matchedContent: word,
      };
    }
  }

  return { isInappropriate: false };
}

/**
 * Evaluates both title and content for a community post.
 */
export function validateCommunityPost(
  title: string,
  content: string
): ModerationResult {
  const titleCheck = checkInappropriateContent(title, "heading/title");
  if (titleCheck.isInappropriate) {
    return titleCheck;
  }

  const contentCheck = checkInappropriateContent(content, "message body");
  if (contentCheck.isInappropriate) {
    return contentCheck;
  }

  return { isInappropriate: false };
}
