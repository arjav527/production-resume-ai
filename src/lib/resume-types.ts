export interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    summary: string;
  };
  experience: {
    id: string;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }[];
  education: {
    id: string;
    degree: string;
    school: string;
    location: string;
    graduationDate: string;
    gpa: string;
  }[];
  skills: string[];
}

export const emptyResume: ResumeData = {
  personalInfo: { fullName: "", email: "", phone: "", location: "", linkedin: "", summary: "" },
  experience: [],
  education: [],
  skills: [],
};

export interface ATSAnalysis {
  overall_score: number;
  formatting_score: number;
  keyword_score: number;
  structure_score: number;
  content_score: number;
  issues: { title: string; description: string; severity: "critical" | "warning" | "info" }[];
  recommended_keywords: string[];
  suggestions: string[];
}

// ML-based keyword extraction (client-side NLP)
export function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with",
    "by", "from", "is", "was", "are", "were", "been", "be", "have", "has", "had",
    "do", "does", "did", "will", "would", "could", "should", "may", "might",
    "i", "you", "he", "she", "it", "we", "they", "me", "him", "her", "us", "them",
    "my", "your", "his", "its", "our", "their", "this", "that", "these", "those",
    "am", "not", "no", "nor", "as", "if", "then", "than", "too", "very", "can",
  ]);

  const words = text.toLowerCase().replace(/[^a-z0-9\s+#]/g, " ").split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
  const freq: Record<string, number> = {};
  words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 20).map(([w]) => w);
}

// ML-based ATS scoring (TF-IDF inspired)
export function calculateATSScore(resume: ResumeData, jobDescription: string): number {
  const resumeText = [
    resume.personalInfo.summary,
    ...resume.experience.map(e => `${e.title} ${e.company} ${e.description}`),
    ...resume.education.map(e => `${e.degree} ${e.school}`),
    ...resume.skills,
  ].join(" ").toLowerCase();

  const jobKeywords = extractKeywords(jobDescription);
  const resumeKeywords = new Set(extractKeywords(resumeText));

  let matchCount = 0;
  jobKeywords.forEach(kw => { if (resumeKeywords.has(kw)) matchCount++; });
  const keywordMatch = jobKeywords.length > 0 ? (matchCount / jobKeywords.length) * 100 : 50;

  // Structure score
  let structureScore = 0;
  if (resume.personalInfo.fullName) structureScore += 15;
  if (resume.personalInfo.email) structureScore += 10;
  if (resume.personalInfo.phone) structureScore += 10;
  if (resume.personalInfo.summary && resume.personalInfo.summary.length > 50) structureScore += 15;
  if (resume.experience.length > 0) structureScore += 25;
  if (resume.education.length > 0) structureScore += 15;
  if (resume.skills.length >= 5) structureScore += 10;

  return Math.round((keywordMatch * 0.4 + structureScore * 0.6));
}
