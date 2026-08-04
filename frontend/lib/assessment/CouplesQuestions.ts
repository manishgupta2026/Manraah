import { AssessmentQuestion } from "./types";

export const CouplesQuestions: AssessmentQuestion[] = [
  {
    id: 6,
    key: "relationship_harmony",
    text: "How would you describe the general level of harmony and connection in your relationship recently?",
    description: "Tracking couple connection helps evaluate interpersonal support.",
    options: [
      { id: "cpl_q6_opt1", text: "Very connected & harmonious", score: 5 },
      { id: "cpl_q6_opt2", text: "Mostly peaceful", score: 4 },
      { id: "cpl_q6_opt3", text: "Somewhat connected", score: 3 },
      { id: "cpl_q6_opt4", text: "Frequently distant", score: 2 },
      { id: "cpl_q6_opt5", text: "Highly strained", score: 1 },
    ],
  },
  {
    id: 7,
    key: "partner_communication",
    text: "How easily are you able to communicate your feelings and concerns to your partner?",
    description: "Open communication is vital to process mutual stress and avoid friction.",
    options: [
      { id: "cpl_q7_opt1", text: "Very easily & openly", score: 5 },
      { id: "cpl_q7_opt2", text: "Mostly open", score: 4 },
      { id: "cpl_q7_opt3", text: "Sometimes difficult", score: 3 },
      { id: "cpl_q7_opt4", text: "Rarely express feelings", score: 2 },
      { id: "cpl_q7_opt5", text: "Unable to communicate", score: 1 },
    ],
  },
  {
    id: 8,
    key: "conflict_resolution",
    text: "How constructively are you and your partner able to resolve disagreements?",
    description: "Healthy dispute resolution prevents resentment and deepens connection.",
    options: [
      { id: "cpl_q8_opt1", text: "Very constructively", score: 5 },
      { id: "cpl_q8_opt2", text: "Mostly positive", score: 4 },
      { id: "cpl_q8_opt3", text: "Sometimes resolve well", score: 3 },
      { id: "cpl_q8_opt4", text: "Often unresolved", score: 2 },
      { id: "cpl_q8_opt5", text: "Constant arguments", score: 1 },
    ],
  },
  {
    id: 9,
    key: "shared_goals",
    text: "How aligned do you feel with your partner on major life decisions and values?",
    description: "Alignment on key principles builds stability and limits future conflict.",
    options: [
      { id: "cpl_q9_opt1", text: "Perfectly aligned", score: 5 },
      { id: "cpl_q9_opt2", text: "Mostly aligned", score: 4 },
      { id: "cpl_q9_opt3", text: "Somewhat aligned", score: 3 },
      { id: "cpl_q9_opt4", text: "Rarely aligned", score: 2 },
      { id: "cpl_q9_opt5", text: "Not aligned at all", score: 1 },
    ],
  },
  {
    id: 10,
    key: "quality_time",
    text: "How often do you and your partner spend meaningful quality time connecting?",
    description: "Quality time reinforces emotional intimacy and connection.",
    options: [
      { id: "cpl_q10_opt1", text: "Almost always", score: 5 },
      { id: "cpl_q10_opt2", text: "Most days", score: 4 },
      { id: "cpl_q10_opt3", text: "Occasionally", score: 3 },
      { id: "cpl_q10_opt4", text: "Rarely", score: 2 },
      { id: "cpl_q10_opt5", text: "Almost never", score: 1 },
    ],
  },
];
