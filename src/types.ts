export interface Rule {
  id: string;
  text: string;
}

export interface RuleMatch {
  rule: string;
  explanation: string;
  suggestion?: string; // only for failures
}

export interface AuditReport {
  overallScore: number;
  verdict: "Approved" | "Needs Revision" | "Major Fix Needed";
  summary: string;
  passedRules: RuleMatch[];
  failedRules: RuleMatch[];
  grammarScore: number;
  seoScore: number;
  toneScore: number;
  readabilityScore: number;
  aiDetectionRisk: number;
  strengths: string[];
  suggestions: string[];
  missingSections: string[];
  // Local metrics calculated post-parsing
  wordCount?: number;
  charCount?: number;
  sentCount?: number;
  avgWPS?: number;
  createdAt?: string;
  providerUsed?: string;
}

export type TemplateKey = "ecommerce" | "blog" | "technical" | "seo" | "brand";

export interface Template {
  name: string;
  icon: string;
  rules: string;
}
