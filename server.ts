import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { Mistral } from "@mistralai/mistralai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize GoogleGenAI client with server secret
const getGeminiClient = () => {
  const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("[Warning] GEMINI_API_KEY / VITE_GEMINI_API_KEY is not defined in process.env. Server checks will fallback to simulated results unless set.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "dummy_key",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

const aiClient = getGeminiClient();

const getMistralApiKey = (): string | undefined =>
  process.env.VITE_MISTRAL_API_KEY?.trim() || process.env.MISTRAL_API_KEY?.trim() || "zHjSDJMHioaMIrkRhvPRzWVBdo3jy1O6";

const getMistralClient = () => {
  const apiKey = getMistralApiKey();
  if (!apiKey) {
    console.warn("[Warning] MISTRAL_API_KEY / VITE_MISTRAL_API_KEY is not defined. Sonal joke generation and audit fallback will fail.");
    return null;
  }
  return new Mistral({ apiKey });
};

const cleanAndParseJSON = (rawText: string) => {
  let cleaned = rawText.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  }
  return JSON.parse(cleaned);
};

const withMistralTimeout = async <T,>(operation: Promise<T>, label: string, ms = 30000): Promise<T> => {
  let timeoutHandle: NodeJS.Timeout | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms.`)), ms);
  });
  try {
    return await Promise.race([operation, timeout]);
  } finally {
    if (timeoutHandle) clearTimeout(timeoutHandle);
  }
};

const extractMistralText = (mistralContent: unknown): string | undefined => {
  if (typeof mistralContent === "string") return mistralContent;
  if (Array.isArray(mistralContent)) {
    return mistralContent
      .map((part: unknown) => (typeof part === "string" ? part : (part as { text?: string })?.text || ""))
      .join("");
  }
  return undefined;
};

type SonalJokeCategory = "bollywood" | "dark";

const SONAL_JOKE_PROMPTS: Record<SonalJokeCategory, { system: string; user: string }> = {
  bollywood: {
    system:
      "You are a witty Bollywood insider comedy writer for a private corporate workplace dashboard. " +
      "Write one fresh, original Bollywood-themed joke: film industry tropes, iconic stars, masala plots, " +
      "drama on set, box-office gossip, or classic dialogue parodies blended with copywriting/compliance life. " +
      "Keep it clever and playful — no hate speech, slurs, or targeting real people maliciously. " +
      'Return JSON only: { "joke": string, "tagline": string } where tagline is a short mood label like "Masala HR Drama" or "Film City Gossip".',
    user:
      "Generate one brand-new Bollywood insider joke for Sonal's comedy dashboard. " +
      "Make it specific, surprising, and different from typical Shah Rukh or Amitabh clichés. " +
      'Return valid JSON: { "joke": string, "tagline": string }.',
  },
  dark: {
    system:
      "You are a sharp dark-humor comedy writer for a private corporate workplace dashboard. " +
      "Write one fresh, original dark comedy joke about office life: burnout, passive-aggressive emails, " +
      "compliance dread, deadline trauma, existential dread in standups, or corporate absurdism. " +
      "Edgy and sarcastic but not cruel — no hate speech, slurs, violence against groups, or real-person attacks. " +
      'Return JSON only: { "joke": string, "tagline": string } where tagline is a short mood label like "Dark Masala HR" or "Compliance Noir".',
    user:
      "Generate one brand-new dark corporate humor joke for Sonal's comedy dashboard. " +
      "Make it biting, original, and genuinely funny — not a generic 'Monday blues' cliché. " +
      'Return valid JSON: { "joke": string, "tagline": string }.',
  },
};

// Shared persistence file for the Master Vault
const MASTER_RULES_PATH = path.join(process.cwd(), "master_rules.json");
const DEFAULT_RULES = `Tone must be benefit-driven and persuasive
Use British English spelling throughout
Minimum 300 words per product description
Include product benefits in the first paragraph
Use bullet points for features list
Include a clear call-to-action
Avoid jargon — write for a general audience
Mention at least one USP (Unique Selling Point)
Use second person (you, your)
Use active voice throughout`;

const getMasterRules = (): string => {
  try {
    if (fs.existsSync(MASTER_RULES_PATH)) {
      const data = JSON.parse(fs.readFileSync(MASTER_RULES_PATH, "utf-8"));
      if (data && typeof data.rules === "string") {
        return data.rules;
      }
    }
  } catch (err) {
    console.warn("[Server DB] Failed to read master rules file. Using defaults.", err);
  }
  return DEFAULT_RULES;
};

const saveMasterRules = (rules: string): boolean => {
  try {
    fs.writeFileSync(MASTER_RULES_PATH, JSON.stringify({ rules }, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("[Server DB] Failed to write master rules file.", err);
    return false;
  }
};

// GET endpoint to fetch shared master rules
app.get("/api/rules", (req, res) => {
  const rules = getMasterRules();
  res.json({ rules });
});

// POST endpoint to update shared master rules for everyone
app.post("/api/rules", (req, res) => {
  const { rules } = req.body;
  if (typeof rules !== "string") {
    return res.status(400).json({ error: "Rules content must be a valid string." });
  }
  const success = saveMasterRules(rules);
  if (success) {
    res.json({ success: true, rules });
  } else {
    res.status(500).json({ error: "Failed to persist master rules on the server." });
  }
});

// Custom presets persistence
const CUSTOM_PRESETS_PATH = path.join(process.cwd(), "custom_presets.json");

interface CustomPreset {
  id: string;
  name: string;
  icon: string;
  rules: string;
}

const getCustomPresets = (): CustomPreset[] => {
  try {
    if (fs.existsSync(CUSTOM_PRESETS_PATH)) {
      const data = JSON.parse(fs.readFileSync(CUSTOM_PRESETS_PATH, "utf-8"));
      if (Array.isArray(data)) {
        return data;
      }
    }
  } catch (err) {
    console.warn("[Server DB] Failed to read custom presets file inside container.", err);
  }
  return [];
};

const saveCustomPresets = (presets: CustomPreset[]): boolean => {
  try {
    fs.writeFileSync(CUSTOM_PRESETS_PATH, JSON.stringify(presets, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("[Server DB] Failed to write custom presets file.", err);
    return false;
  }
};

// GET endpoint to fetch shared dynamic presets
app.get("/api/presets", (req, res) => {
  const presets = getCustomPresets();
  res.json({ presets });
});

// POST endpoint to save a new dynamic preset for everyone
app.post("/api/presets", (req, res) => {
  const { name, icon, rules } = req.body;
  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "Preset name is required and must be a string." });
  }
  if (!rules || typeof rules !== "string" || !rules.trim()) {
    return res.status(400).json({ error: "Preset rules content is required and must be a string." });
  }
  
  const presets = getCustomPresets();
  const newPreset: CustomPreset = {
    id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    name: name.trim(),
    icon: icon && typeof icon === "string" ? icon.trim() : "📝",
    rules: rules.trim()
  };
  
  presets.push(newPreset);
  const success = saveCustomPresets(presets);
  
  if (success) {
    res.json({ success: true, preset: newPreset, presets });
  } else {
    res.status(500).json({ error: "Failed to persist custom rules preset on the server." });
  }
});

// API: Audit the content against compliance rules using server-side Gemini
app.post("/api/check", async (req, res) => {
  const { content, rules } = req.body;

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return res.status(400).json({ error: "Content is required for compliance evaluation." });
  }

  if (!rules || typeof rules !== "string" || rules.trim().length === 0) {
    return res.status(400).json({ error: "No compliance rules provided." });
  }

  const ruleList = rules
    .split("\n")
    .map((r: string) => r.trim())
    .filter((r: string) => r.length > 0);

  if (ruleList.length === 0) {
    return res.status(400).json({ error: "At least one valid non-empty compliance rule is required." });
  }

  const systemInstruction =
    "You are ContentGuard, an elite content compliance auditor. Your single task is to evaluate written content against a set of rules and output a structured JSON-only validation report. " +
    "Verify matches carefully, explain pass/fail decisions directly, and provide actionable suggestions for any failed rule. No markdown wrappers, no extra text."
  ;

  const userPrompt = `Content to audit:\n"""\n${content.slice(0, 10000)}\n"""\n\nRules collection (${ruleList.length} rules to verify):\n${ruleList.map((r: string, idx: number) => `${idx + 1}. ${r}`).join("\n")}\n\nEvaluate each and every rule exactly matching its criteria. Compute score where score is proportional to passed rules over total rules, with strong penalties for major compliance failures. Deliver a granular audit report in valid JSON only.`;

  const cleanAndParseJSON = (rawText: string) => {
    let cleaned = rawText.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
    }
    return JSON.parse(cleaned);
  };

  const normalizeAuditOutput = (rawOutput: any) => {
    const score = Number(rawOutput?.overallScore ?? rawOutput?.score ?? 0);
    const feedbackItems = Array.isArray(rawOutput?.feedbackItems)
      ? rawOutput.feedbackItems.filter((item: unknown) => typeof item === "string")
      : [];

    return {
      overallScore: Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : 0,
      verdict: typeof rawOutput?.verdict === "string" ? rawOutput.verdict : "Needs Revision",
      summary: typeof rawOutput?.summary === "string"
        ? rawOutput.summary
        : typeof rawOutput?.reviewSummary === "string"
          ? rawOutput.reviewSummary
          : "Audit completed.",
      passedRules: Array.isArray(rawOutput?.passedRules) ? rawOutput.passedRules : [],
      failedRules: Array.isArray(rawOutput?.failedRules) ? rawOutput.failedRules : [],
      grammarScore: Number.isFinite(Number(rawOutput?.grammarScore)) ? Math.round(Number(rawOutput.grammarScore)) : 0,
      seoScore: Number.isFinite(Number(rawOutput?.seoScore)) ? Math.round(Number(rawOutput.seoScore)) : 0,
      toneScore: Number.isFinite(Number(rawOutput?.toneScore)) ? Math.round(Number(rawOutput.toneScore)) : 0,
      readabilityScore: Number.isFinite(Number(rawOutput?.readabilityScore)) ? Math.round(Number(rawOutput.readabilityScore)) : 0,
      aiDetectionRisk: Number.isFinite(Number(rawOutput?.aiDetectionRisk)) ? Math.round(Number(rawOutput.aiDetectionRisk)) : 0,
      strengths: Array.isArray(rawOutput?.strengths) ? rawOutput.strengths : [],
      suggestions: Array.isArray(rawOutput?.suggestions) ? rawOutput.suggestions : feedbackItems,
      missingSections: Array.isArray(rawOutput?.missingSections) ? rawOutput.missingSections : [],
      score: Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : 0,
      reviewSummary: typeof rawOutput?.reviewSummary === "string"
        ? rawOutput.reviewSummary
        : typeof rawOutput?.summary === "string"
          ? rawOutput.summary
          : "Audit completed.",
      feedbackItems: feedbackItems.length > 0
        ? feedbackItems
        : Array.isArray(rawOutput?.suggestions)
          ? rawOutput.suggestions
          : []
    };
  };

  const withTimeout = async <T,>(operation: Promise<T>, label: string, ms = 45000): Promise<T> => {
    let timeoutHandle: NodeJS.Timeout | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timeoutHandle = setTimeout(() => {
        reject(new Error(`${label} timed out after ${ms}ms.`));
      }, ms);
    });

    try {
      return await Promise.race([operation, timeout]);
    } finally {
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
      }
    }
  };

  const getGeminiStatusCode = (error: any) => {
    const status =
      error?.status ||
      error?.statusCode ||
      error?.response?.status ||
      error?.response?.statusCode ||
      error?.cause?.status ||
      error?.cause?.statusCode;

    return Number.isFinite(Number(status)) ? Number(status) : undefined;
  };

  const assertGeminiSuccess = (response: any) => {
    const status = getGeminiStatusCode(response);
    if (status && status >= 400) {
      throw new Error(`Gemini API returned HTTP ${status}.`);
    }

    const textOutput = response?.text;
    if (!textOutput || typeof textOutput !== "string") {
      throw new Error("Gemini response did not include a parsable text payload.");
    }

    return textOutput;
  };

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      overallScore: { type: Type.INTEGER },
      verdict: { type: Type.STRING },
      summary: { type: Type.STRING },
      passedRules: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            rule: { type: Type.STRING },
            explanation: { type: Type.STRING }
          },
          required: ["rule", "explanation"]
        }
      },
      failedRules: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            rule: { type: Type.STRING },
            explanation: { type: Type.STRING },
            suggestion: { type: Type.STRING }
          },
          required: ["rule", "explanation", "suggestion"]
        }
      },
      grammarScore: { type: Type.INTEGER },
      seoScore: { type: Type.INTEGER },
      toneScore: { type: Type.INTEGER },
      readabilityScore: { type: Type.INTEGER },
      aiDetectionRisk: { type: Type.INTEGER },
      strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
      suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
      missingSections: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: [
      "overallScore", "verdict", "summary", "passedRules", "failedRules",
      "grammarScore", "seoScore", "toneScore", "readabilityScore",
      "aiDetectionRisk", "strengths", "suggestions", "missingSections"
    ]
  };

  try {
    const apiKeyToUse = process.env.VITE_GEMINI_API_KEY?.trim();
    if (!apiKeyToUse) {
      throw new Error("No Gemini API key configured on the server. Set VITE_GEMINI_API_KEY in the environment.");
    }

    const geminiClient = new GoogleGenAI({
      apiKey: apiKeyToUse,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });

    const response = await withTimeout(geminiClient.models.generateContent({
      model: "gemini-1.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.15
      }
    }), "Gemini compliance check");

    const textOutput = assertGeminiSuccess(response);
    const jsonOutput = cleanAndParseJSON(textOutput);
    return res.json({ ...normalizeAuditOutput(jsonOutput), providerUsed: "Google Gemini", model: "gemini-1.5-flash" });

  } catch (err: any) {
    const geminiStatus = getGeminiStatusCode(err);
    console.error("[Audit API] Gemini audit failed; routing to Mistral fallback:", {
      status: geminiStatus,
      detail: err?.message || String(err)
    });

    try {
      const mistralClient = getMistralClient();
      if (!mistralClient) {
        throw new Error("No Mistral API key configured. Set VITE_MISTRAL_API_KEY or MISTRAL_API_KEY in the environment.");
      }
      const mistralSchemaPrompt =
        `${systemInstruction}\n\nReturn only valid JSON matching this TypeScript shape exactly:\n` +
        `{\n` +
        `  "overallScore": number,\n` +
        `  "verdict": "Approved" | "Needs Revision" | "Major Fix Needed",\n` +
        `  "summary": string,\n` +
        `  "passedRules": { "rule": string, "explanation": string }[],\n` +
        `  "failedRules": { "rule": string, "explanation": string, "suggestion": string }[],\n` +
        `  "grammarScore": number,\n` +
        `  "seoScore": number,\n` +
        `  "toneScore": number,\n` +
        `  "readabilityScore": number,\n` +
        `  "aiDetectionRisk": number,\n` +
        `  "strengths": string[],\n` +
        `  "suggestions": string[],\n` +
        `  "missingSections": string[],\n` +
        `  "score": number,\n` +
        `  "reviewSummary": string,\n` +
        `  "feedbackItems": string[]\n` +
        `}`;

      const mistralResponse = await withTimeout(mistralClient.chat.complete({
        model: "mistral-small-latest",
        messages: [
          { role: "system", content: mistralSchemaPrompt },
          { role: "user", content: userPrompt }
        ],
        responseFormat: { type: "json_object" },
        temperature: 0.15
      }), "Mistral compliance fallback");

      const mistralContent = mistralResponse?.choices?.[0]?.message?.content;
      const mistralText = Array.isArray(mistralContent)
        ? mistralContent.map((part: any) => typeof part === "string" ? part : part?.text || "").join("")
        : mistralContent;

      if (!mistralText || typeof mistralText !== "string") {
        throw new Error("Mistral response did not include a parsable text payload.");
      }

      const jsonOutput = cleanAndParseJSON(mistralText);
      return res.json({ ...normalizeAuditOutput(jsonOutput), providerUsed: "Mistral AI", model: "mistral-small-latest" });
    } catch (fallbackErr: any) {
      console.error("[Audit API] Mistral fallback failed:", fallbackErr);
      return res.status(502).json({
        error: "Content audit failed while contacting both Gemini and Mistral APIs.",
        detail: fallbackErr?.message || String(fallbackErr),
        primaryError: err?.message || String(err)
      });
    }
  }
});

// API: Darshit's endless Indian Classical Music quiz (Gemini + strict JSON schema)
app.post("/api/hobby/darshit", async (req, res) => {
  const quizResponseSchema = {
    type: Type.OBJECT,
    properties: {
      question: { type: Type.STRING },
      choices: { type: Type.ARRAY, items: { type: Type.STRING } },
      correctAnswer: { type: Type.STRING },
      explanation: { type: Type.STRING },
    },
    required: ["question", "choices", "correctAnswer", "explanation"],
  };

  const systemInstruction =
    "You are an expert Indian classical music quiz engine covering Hindustani and Carnatic traditions. " +
    "Generate one fresh, non-repetitive multiple-choice question about ragas, talas, gharanas, instruments, or legendary maestros. " +
    "Provide exactly four distinct answer choices. The correctAnswer must exactly match one choice string.";

  const userPrompt =
    "Generate one advanced Indian classical music quiz question. " +
    "Return JSON with keys: question (string), choices (array of exactly 4 strings), correctAnswer (string matching one choice), explanation (string).";

  const cleanAndParseJSON = (rawText: string) => {
    let cleaned = rawText.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
    }
    return JSON.parse(cleaned);
  };

  const withTimeout = async <T,>(operation: Promise<T>, label: string, ms = 30000): Promise<T> => {
    let timeoutHandle: NodeJS.Timeout | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timeoutHandle = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms.`)), ms);
    });
    try {
      return await Promise.race([operation, timeout]);
    } finally {
      if (timeoutHandle) clearTimeout(timeoutHandle);
    }
  };

  try {
    const apiKeyToUse = process.env.VITE_GEMINI_API_KEY?.trim() || process.env.GEMINI_API_KEY?.trim();
    if (!apiKeyToUse) {
      return res.status(503).json({
        error: "No Gemini API key configured. Set VITE_GEMINI_API_KEY in the environment.",
      });
    }

    const geminiClient = new GoogleGenAI({
      apiKey: apiKeyToUse,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } },
    });

    const response = await withTimeout(
      geminiClient.models.generateContent({
        model: "gemini-1.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: quizResponseSchema,
          temperature: 0.85,
        },
      }),
      "Gemini Indian classical quiz"
    );

    const textOutput = response?.text;
    if (!textOutput || typeof textOutput !== "string") {
      throw new Error("Gemini response did not include a parsable text payload.");
    }

    const parsed = cleanAndParseJSON(textOutput) as {
      question?: string;
      choices?: string[];
      correctAnswer?: string;
      explanation?: string;
    };

    if (
      typeof parsed.question !== "string" ||
      !Array.isArray(parsed.choices) ||
      parsed.choices.length < 2 ||
      typeof parsed.correctAnswer !== "string" ||
      typeof parsed.explanation !== "string"
    ) {
      throw new Error("Gemini quiz payload failed schema validation.");
    }

    if (!parsed.choices.includes(parsed.correctAnswer)) {
      throw new Error("correctAnswer must match one of the provided choices.");
    }

    return res.json({
      question: parsed.question,
      choices: parsed.choices,
      correctAnswer: parsed.correctAnswer,
      explanation: parsed.explanation,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Hobby API] Darshit quiz generation failed:", message);
    return res.status(502).json({ error: message });
  }
});

// API: Sonal's endless Bollywood & Dark Joke Matrix (Mistral)
app.post("/api/hobby/sonal", async (req, res) => {
  const requestedCategory = req.body?.category as string | undefined;
  const category: SonalJokeCategory =
    requestedCategory === "bollywood" || requestedCategory === "dark"
      ? requestedCategory
      : Math.random() < 0.5
        ? "bollywood"
        : "dark";

  const { system: systemPrompt, user: userPrompt } = SONAL_JOKE_PROMPTS[category];

  try {
    const mistralClient = getMistralClient();
    if (!mistralClient) {
      return res.status(503).json({
        error: "No Mistral API key configured. Set MISTRAL_API_KEY or VITE_MISTRAL_API_KEY in your .env file.",
      });
    }

    const mistralResponse = await withMistralTimeout(
      mistralClient.chat.complete({
        model: "mistral-small-latest",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        responseFormat: { type: "json_object" },
        temperature: 0.95,
      }),
      `Mistral ${category} joke`
    );

    const mistralText = extractMistralText(mistralResponse?.choices?.[0]?.message?.content);
    if (!mistralText) {
      throw new Error("Mistral response did not include a parsable text payload.");
    }

    const parsed = cleanAndParseJSON(mistralText) as { joke?: string; tagline?: string };
    if (typeof parsed.joke !== "string" || parsed.joke.trim().length === 0) {
      throw new Error("Mistral joke payload failed schema validation.");
    }

    const defaultTagline = category === "bollywood" ? "Bollywood Insider" : "Dark Masala HR";
    return res.json({
      joke: parsed.joke.trim(),
      tagline: typeof parsed.tagline === "string" ? parsed.tagline.trim() : defaultTagline,
      category,
      provider: "Mistral AI",
      model: "mistral-small-latest",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Hobby API] Sonal joke generation failed:", message);
    return res.status(502).json({ error: message });
  }
});

// API: Poonam's Infinite Literature Archive (Gemini)
app.post("/api/hobby/poonam", async (req, res) => {
  const literaryResponseSchema = {
    type: Type.OBJECT,
    properties: {
      quote: { type: Type.STRING },
      bookTitle: { type: Type.STRING },
      authorContext: { type: Type.STRING },
    },
    required: ["quote", "bookTitle", "authorContext"],
  };

  const systemInstruction =
    "You are a classical literature curator. Generate one unique, authentic literary quote from a real classic work " +
    "(world literature, not limited to Shakespeare). Provide the exact book title and a brief one-sentence author context paragraph.";

  const userPrompt =
    "Return JSON with keys: quote (string, the literary quote), bookTitle (string), authorContext (string, exactly one sentence about the author or work).";

  const cleanAndParseJSON = (rawText: string) => {
    let cleaned = rawText.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
    }
    return JSON.parse(cleaned);
  };

  const withTimeout = async <T,>(operation: Promise<T>, label: string, ms = 30000): Promise<T> => {
    let timeoutHandle: NodeJS.Timeout | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timeoutHandle = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms.`)), ms);
    });
    try {
      return await Promise.race([operation, timeout]);
    } finally {
      if (timeoutHandle) clearTimeout(timeoutHandle);
    }
  };

  try {
    const apiKeyToUse = process.env.VITE_GEMINI_API_KEY?.trim() || process.env.GEMINI_API_KEY?.trim();
    if (!apiKeyToUse) {
      return res.status(503).json({
        error: "No Gemini API key configured. Set VITE_GEMINI_API_KEY in the environment.",
      });
    }

    const geminiClient = new GoogleGenAI({
      apiKey: apiKeyToUse,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } },
    });

    const response = await withTimeout(
      geminiClient.models.generateContent({
        model: "gemini-1.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: literaryResponseSchema,
          temperature: 0.9,
        },
      }),
      "Gemini literary quote"
    );

    const textOutput = response?.text;
    if (!textOutput || typeof textOutput !== "string") {
      throw new Error("Gemini response did not include a parsable text payload.");
    }

    const parsed = cleanAndParseJSON(textOutput) as {
      quote?: string;
      bookTitle?: string;
      authorContext?: string;
    };

    if (
      typeof parsed.quote !== "string" ||
      typeof parsed.bookTitle !== "string" ||
      typeof parsed.authorContext !== "string"
    ) {
      throw new Error("Gemini literary payload failed schema validation.");
    }

    return res.json({
      quote: parsed.quote,
      bookTitle: parsed.bookTitle,
      authorContext: parsed.authorContext,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Hobby API] Poonam literary quote failed:", message);
    return res.status(502).json({ error: message });
  }
});

// Setup Server Middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode: Mount Vite dev server middleware
    console.log("[Server] Launching in Development Mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode: Serve compiled UI files from dist
    console.log("[Server] Launching in Production Mode...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server Ready] Listening at http://localhost:${PORT}`);
  });
}

startServer();

// Endpoint for Sonal Hobbies section to get jokes from Gemini via n8n
app.post("/api/jokes", async (req: any, res: any) => {
  try {
    // Read the complete production URL from your Vercel Dashboard Environment Variable
    const n8nUrl = process.env.N8N_URL || "https://ngrok-free.dev";

    const response = await fetch(n8nUrl, {
      method: "GET",
      headers: {
        "ngrok-skip-browser-warning": "true"
      }
    });

    if (!response.ok) {
      throw new Error(`n8n responded with status ${response.status}`);
    }

    // Capture raw text from n8n instead of parsing it as JSON
    const jokeText = await response.text();
    
    // Return a clean text chunk directly back to your frontend
    return res.send(jokeText);

  } catch (error: any) {
    console.error("Profile Joke Generator Error:", error);
    return res.status(500).send("🌶️ Failed to load a joke from n8n. Try again!");
  }
});


// Endpoint for QuillBot AI Scanner using Apify Actor
app.post("/api/scan", async (req: any, res: any) => {
  try {
    const { text } = req.body;
    const token = process.env.APIFY_API_TOKEN || "REDACTED_USE_ENV_APIFY_API_TOKEN";

    if (!text) {
      return res.status(400).json({ error: "Text content is required to scan" });
    }

    const runUrl = "https://apify.com" + token + "&wait=30";
    
    const startRun = await fetch(runUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text })
    });

    const runData: any = await startRun.json();
    const defaultDatasetId = runData.data?.defaultDatasetId;

    if (!defaultDatasetId) {
      return res.status(500).json({ error: "Failed to retrieve scan dataset from execution" });
    }

    const datasetUrl = "https://apify.com" + defaultDatasetId + "/items?token=" + token;
    const datasetResponse = await fetch(datasetUrl);
    const datasetItems: any = await datasetResponse.json();

    return res.json({ success: true, results: datasetItems || {} });
  } catch (error) {
    return res.status(500).json({ error: "Apify integration process broken" });
  }
});



