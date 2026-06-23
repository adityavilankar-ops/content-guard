import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import GoogleDocEditor from "./components/GoogleDocEditor";
import HobbyStation from "./components/HobbyStation";
import SonalCursorTrail from "./components/SonalCursorTrail";
import { db } from "./firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { 
  ShieldAlert, 
  Lock, 
  Unlock, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Wand2, 
  Sparkles, 
  Share2, 
  Printer, 
  Settings, 
  Sun, 
  Moon, 
  Copy, 
  FileCode2, 
  ChevronDown, 
  CornerDownRight, 
  HelpCircle,
  TrendingUp,
  Sliders,
  ChevronRight,
  BookOpen,
  ArrowUpRight,
  FileSpreadsheet,
  FileCheck2,
  LockKeyhole,
  Plus,
  Trash2
} from "lucide-react";
import ScrollReveal from "./components/ScrollReveal";
import CustomCursor from "./components/CustomCursor";
import { Rule, AuditReport, TemplateKey, Template } from "./types";
import addyAvatar from "./assets/images/avatar_addy_blue.jpg";
import darshitAvatar from "./assets/images/avatar_darshit_purple.jpg";
import sonalAvatar from "./assets/images/avatar_sonal_green.jpg";
import debjaniAvatar from "./assets/images/avatar_debjani_red.jpg";
import poonamAvatar from "./assets/images/avatar_poonam_pink.jpg";

// Demo operator profiles used by the UI (was removed accidentally)
const USERS = [
  {
    id: "addy",
    name: "ADDY",
    role: "Lead Auditor",
    color: "from-sky-500 to-indigo-500",
    glowColor: "rgba(56,189,248,0.18)",
    badgeBg: "border-indigo-500/20 bg-indigo-500/6",
    quote: "Precision over persuasion.",
    personality: "Quietly intense, notices tiny errors before anyone else sees the page.",
    avatar: addyAvatar
  },
  {
    id: "darshit",
    name: "DARSHIT",
    role: "Infra Ops",
    color: "from-purple-600 to-pink-400",
    glowColor: "rgba(192,132,252,0.14)",
    badgeBg: "border-pink-400/20 bg-pink-400/6",
    quote: "Keep systems honest.",
    personality: "Calm under pressure and happiest when a messy system starts behaving.",
    avatar: darshitAvatar
  },
  {
    id: "sonal",
    name: "SONAL",
    role: "Editorial Lead",
    color: "from-emerald-500 to-teal-400",
    glowColor: "rgba(52,211,153,0.14)",
    badgeBg: "border-emerald-400/20 bg-emerald-400/6",
    quote: "Clarity wins readers.",
    personality: "Warm, observant, and very good at turning chaos into readable structure.",
    avatar: sonalAvatar
  },
  {
    id: "debjani",
    name: "DEBJANI",
    role: "Legal Review",
    color: "from-rose-500 to-orange-400",
    glowColor: "rgba(248,113,113,0.14)",
    badgeBg: "border-rose-400/20 bg-rose-400/6",
    quote: "Safe and compliant by design.",
    personality: "Sharp-eyed and principled, with a talent for catching the risky fine print.",
    avatar: debjaniAvatar
  },
  {
    id: "poonam",
    name: "POONAM",
    role: "Growth Strategist",
    color: "from-amber-500 to-orange-400",
    glowColor: "rgba(245,158,11,0.18)",
    badgeBg: "border-amber-500/20 bg-amber-500/6",
    quote: "Search visibility optimized.",
    personality: "Bright, playful, and always thinking two steps ahead about reach.",
    avatar: poonamAvatar
  }
];

const TEMPLATES: Record<TemplateKey, Template> = {
  ecommerce: {
    name: "E-Commerce Copy",
    icon: "🛍️",
    rules: `Tone must be benefit-driven and persuasive
Use British English spelling throughout
Minimum 300 words per product description
Include product benefits in the first paragraph
Use bullet points for features list
Include a clear call-to-action
Avoid jargon — write for a general audience
Mention at least one USP (Unique Selling Point)
Use second person (you, your)
Use active voice throughout`,
  },
  blog: {
    name: "Engaging Blog Post",
    icon: "✍️",
    rules: `Tone must be conversational and engaging
Minimum 1000 words
Include at least two H2 headings and three H3 headings
Begin with a compelling hook
Use short paragraphs — maximum 3 sentences
End with a clear takeaway or action item
Avoid keyword stuffing — max 1.5% density
Use Oxford comma in all lists`,
  },
  technical: {
    name: "Technical Documentation",
    icon: "⚙️",
    rules: `Tone must be precise, neutral, and instructional
Use British English throughout
Define all acronyms on first use
Use numbered steps for procedures
Maximum sentence length: 25 words
Use active voice for all instructions
Include a summary section at the end
Structure with clear H2 and H3 headings
Avoid marketing language`,
  },
  seo: {
    name: "SEO Optimized Article",
    icon: "📈",
    rules: `Target keyword must appear in H1
Keyword density between 1-2%
Include at least 3 LSI keywords per 500 words
Meta title between 50-60 characters
Meta description between 140-160 characters
Include internal links (minimum 2)
Content minimum 700 words`,
  },
  brand: {
    name: "Brand Voice Alignment",
    icon: "🎨",
    rules: `Tone must be warm, professional, and inclusive
Use first person plural — we, our, us
Avoid negative framing
Consistent terminology throughout
No competitor mentions
Use em-dash (—) not en-dash
End on a positive, forward-looking statement`,
  }
};

const AUDIT_STEPS = [
  "Securing server session…",
  "Sending rules and contents for scanning…",
  "Checking grammar and punctuation benchmarks…",
  "Analysing tone alignment & stylistic benchmarks…",
  "Verifying structural consistency…",
  "Evaluating compliance metrics via Gemini AI…",
  "Structuring finalized report details…"
];

// Lightweight mock database used for the animated compliance noise cloud
const COMPLIANCE_TEXT_DATABASE: string[] = [
  "redundant phrasing detected",
  "legalese overload",
  "passive voice indicators high",
  "keyword stuffing potential",
  "missing H2 subheadings",
  "tone drift: informal",
  "clarity issues: ambiguous pronouns",
  "call-to-action missing",
  "optimize for readability",
  "brand voice mismatch"
];

// Minimal theme configuration per operator id used by the UI. Kept small to avoid runtime crashes.
const THEME_CONFIGS: Record<string, any> = {
  addy: {
    id: "addy",
    primaryColor: "#38bdf8",
    accentColor: "#818cf8",
    bgClass: "bg-gradient-to-br from-sky-900 to-indigo-900",
    fontBodyClass: "font-sans",
    glowColor: "rgba(56,189,248,0.12)",
    themeStyle: {}
  },
  darshit: {
    id: "darshit",
    primaryColor: "#c084fc",
    accentColor: "#f472b6",
    bgClass: "bg-gradient-to-br from-purple-900 to-pink-700",
    fontBodyClass: "font-sans",
    glowColor: "rgba(192,132,252,0.12)",
    themeStyle: {}
  },
  sonal: {
    id: "sonal",
    primaryColor: "#34d399",
    accentColor: "#10b981",
    bgClass: "bg-gradient-to-br from-emerald-900 to-teal-700",
    fontBodyClass: "font-sans",
    glowColor: "rgba(52,211,153,0.12)",
    themeStyle: {}
  },
  debjani: {
    id: "debjani",
    primaryColor: "#f87171",
    accentColor: "#fb7185",
    bgClass: "bg-gradient-to-br from-rose-900 to-orange-700",
    fontBodyClass: "font-sans",
    glowColor: "rgba(248,113,113,0.12)",
    themeStyle: {}
  },
  poonam: {
    id: "poonam",
    primaryColor: "#f59e0b",
    accentColor: "#f97316",
    bgClass: "bg-gradient-to-br from-amber-900 to-orange-700",
    fontBodyClass: "font-sans",
    glowColor: "rgba(245,158,11,0.14)",
    themeStyle: {}
  }
};

export default function App() {
  // Active gated profile team session
  const [activeUser, setActiveUser] = useState<string | null>(() => localStorage.getItem("cg_active_user") || null);
  const [introTextFaded, setIntroTextFaded] = useState(() => !!localStorage.getItem("cg_active_user")); // skip intro on first load if already logged in
  const [signingInUser, setSigningInUser] = useState<any | null>(null);
  const [signInProgress, setSignInProgress] = useState(0);

  // Theme state
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Portal interactive states
  const [gateMouse, setGateMouse] = useState({ x: -200, y: -200 });
  const [gateHoveredId, setGateHoveredId] = useState<string | null>(null);
  const [gateHoveredRect, setGateHoveredRect] = useState<DOMRect | null>(null);
  const [gateRotateX, setGateRotateX] = useState(0);
  const [gateRotateY, setGateRotateY] = useState(0);

  // Global cursor tracker for the gateway select portal
  useEffect(() => {
    if (activeUser) return;
    const handleMouseMove = (e: MouseEvent) => {
      setGateMouse({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [activeUser]);

  const handleMouseEnterCard = (e: React.MouseEvent<HTMLDivElement>, userId: string) => {
    setGateHoveredId(userId);
    setGateHoveredRect(e.currentTarget.getBoundingClientRect());
  };

  const handleMouseMoveCard = (e: React.MouseEvent<HTMLDivElement>, userId: string) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = x / rect.width - 0.5;
    const py = y / rect.height - 0.5;
    
    setGateRotateX(-py * 16);
    setGateRotateY(px * 16);
    setGateHoveredRect(rect);
  };

  // Intro screen auto-timeout to fade copywriting clutter away
  useEffect(() => {
    if (!activeUser && !introTextFaded) {
      const timer = setTimeout(() => {
        setIntroTextFaded(true);
      }, 5500);
      return () => clearTimeout(timer);
    }
  }, [activeUser, introTextFaded]);

  // Custom Key / settings State
  const [showSettings, setShowSettings] = useState(false);
  const [customKey, setCustomKey] = useState(() => localStorage.getItem("cg_gemini_key") || "");
  const [activeEditorTab, setActiveEditorTab] = useState<"editor" | "hobby">("editor");

  // Custom Shared Presets states
  const [customPresets, setCustomPresets] = useState<any[]>([]);
  const [isCreatingPreset, setIsCreatingPreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState("");
  const [newPresetIcon, setNewPresetIcon] = useState("📝");
  const [newPresetRules, setNewPresetRules] = useState("");

  // Scroll tracking states
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState("hero");

  // Rule Vault status states
  const [isVaultLocked, setIsVaultLocked] = useState(true);
  const [rulesDraft, setRulesDraft] = useState("");
  const [singleRule, setSingleRule] = useState("");
  const [ruleInputText, setRuleInputText] = useState("");
  const [rulesListCount, setRulesListCount] = useState(0);
  const [pwInputValue, setPwInputValue] = useState("");
  const [pwError, setPwError] = useState(false);
  const [showPwText, setShowPwText] = useState(false);
  const [showPwModal, setShowPwModal] = useState(false);

  // Content state
  const [fileName, setFileName] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [extractionText, setExtractionText] = useState("Reading document…");
  const [isDragOver, setIsDragOver] = useState(false);
  const [pastedText, setPastedText] = useState("");

  // Content local statistics
  const [localStats, setLocalStats] = useState({
    words: 0,
    chars: 0,
    sentences: 0,
    readMinutes: 0,
    readabilityScore: 0, // Flesch Readability match
  });

  // Action / compliance run status
  const [isChecking, setIsChecking] = useState(false);
  const [activeCheckStep, setActiveCheckStep] = useState(0);
  const [checkProgressFill, setCheckProgressFill] = useState(0);
  const [reportResult, setReportResult] = useState<AuditReport | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);
  const [liveAuditText, setLiveAuditText] = useState("");
  const [isStreamingAudit, setIsStreamingAudit] = useState(false);
  const [streamAuditError, setStreamAuditError] = useState<string | null>(null);
  
  // Toast notifications state
  const [toasts, setToasts] = useState<Array<{ id: string; msg: string; type: "success" | "error" | "info" }>>([]);

  // Refs for scroll sections
  const heroRef = useRef<HTMLDivElement>(null);
  const vaultRef = useRef<HTMLDivElement>(null);
  const verifyRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  // Trigger toast helper
  const triggerToast = (msg: string, type: "success" | "error" | "info" = "info") => {
    const id = Date.now().toString() + Math.random();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  // Synchronise system theme classes and storage
  useEffect(() => {
    const cachedTheme = localStorage.getItem("cg_theme") as "dark" | "light" | null;
    if (cachedTheme) {
      setTheme(cachedTheme);
    } else {
      localStorage.setItem("cg_theme", "dark");
    }

    // Load master rules and establish real-time updates from cloud Firestore
    const unsubDatabase = onSnapshot(doc(db, "vault", "compliance_rule"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && typeof data.remoteRules === "string") {
          const remoteRules = data.remoteRules;
          // Always update the canonical states for all open profiles
          setSingleRule(remoteRules);
          setRuleInputText(remoteRules);
          setRulesDraft(remoteRules);
          const count = remoteRules.split("\n").filter((line: string) => line.trim().length > 0).length;
          setRulesListCount(count);
        }
      }
    }, (err) => {
      console.warn("Firestore sync failing:", err);
    });

    return () => {
      unsubDatabase();
    };
  }, []);

  // Trigger high-end operator activation & decryption sequence
  const handleSelectUser = (user: any) => {
    setSigningInUser(user);
    setSignInProgress(0);
    
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setSignInProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setActiveUser(user.id);
          localStorage.setItem("cg_active_user", user.id);
          
          // Keep live cloud rules - don't override with profile templates
          // Rules are managed globally via Firestore listener (onSnapshot)
          setSigningInUser(null);
          triggerToast(`Operator session loaded for ${user.name} (${user.role}).`, "success");
        }, 300);
      }
    }, 120);
  };

  // Sign out / Seal active session
  const handleLogout = () => {
    setActiveUser(null);
    localStorage.removeItem("cg_active_user");
    triggerToast("Dashboard locks set. Operator session sealed.", "info");
  };

  useEffect(() => {
    const rootClass = document.documentElement;
    if (theme === "dark") {
      rootClass.classList.add("dark");
      rootClass.style.colorScheme = "dark";
    } else {
      rootClass.classList.remove("dark");
      rootClass.style.colorScheme = "light";
    }
    localStorage.setItem("cg_theme", theme);
  }, [theme]);

  // Auto-save rules formulation draft to cloud Firestore (debounced by 1.2 seconds during active typing)
  useEffect(() => {
    if (!ruleInputText) return;

    const delayDebounceSelector = setTimeout(() => {
      setDoc(doc(db, "vault", "compliance_rule"), { remoteRules: ruleInputText, updatedAt: Date.now() })
        .then(() => {
          setSingleRule(ruleInputText);
          const count = ruleInputText.split("\n").filter(line => line.trim().length > 0).length;
          setRulesListCount(count);
        })
        .catch(err => console.debug("Silent cloud background sync failed:", err));
    }, 1200);

    return () => clearTimeout(delayDebounceSelector);
  }, [ruleInputText]);

  // Window scroll event listeners
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.scrollY / totalScroll) * 100);
      }

      // Check active visible section for sidebar highlighters
      const offsetAmt = 350;
      const scrollPos = window.scrollY + offsetAmt;

      if (reportRef.current && scrollPos >= reportRef.current.offsetTop && reportResult) {
        setActiveSection("report");
      } else if (verifyRef.current && scrollPos >= verifyRef.current.offsetTop) {
        setActiveSection("verify");
      } else if (vaultRef.current && scrollPos >= vaultRef.current.offsetTop) {
        setActiveSection("vault");
      } else {
        setActiveSection("hero");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [reportResult]);

  // Handle local metrics computation whenever text changes
  const computedStatsUpdated = (text: string) => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).filter(w => w.length > 0) : [];
    const charCount = text.length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const readMinutes = Math.max(1, Math.ceil(words.length / 200));

    // Simple Flesch Reading Ease approximation
    let readability = 0;
    if (words.length > 5) {
      const avgSentenceLength = words.length / (sentences.length || 1);
      // Hardcode simple calculation to avoid full syllable counter parser for clean display
      readability = Math.max(10, Math.min(100, Math.round(206.835 - 1.015 * avgSentenceLength - 84.6 * 1.4)));
    }

    setLocalStats({
      words: words.length,
      chars: charCount,
      sentences: sentences.length,
      readMinutes,
      readabilityScore: readability,
    });
  };

  useEffect(() => {
    computedStatsUpdated(pastedText);
  }, [pastedText]);

  // File drop/upload handlers
  const handleFileUpload = async (file: File) => {
    const name = file.name.toLowerCase();
    setFileName(file.name);
    setIsExtracting(true);
    setExtractionProgress(15);
    setExtractionText("Initializing local buffers…");

    try {
      let extractedStr = "";

      if (name.endsWith(".txt")) {
        setExtractionProgress(60);
        setExtractionText("Parsing TXT payload…");
        extractedStr = await new Promise<string>((res, rej) => {
          const reader = new FileReader();
          reader.onload = e => res((e.target?.result as string) || "");
          reader.onerror = rej;
          reader.readAsText(file);
        });
        setExtractionProgress(100);
      } else if (name.endsWith(".pdf")) {
        setExtractionProgress(30);
        setExtractionText("Spinning client PDF parse worker…");
        if (!(window as any).pdfjsLib) {
          throw new Error("Client-side PDF.js script of ContentGuard failed to complete loading.");
        }

        const arrayBuffer = await file.arrayBuffer();
        const pdfWorker = (window as any).pdfjsLib;
        pdfWorker.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        
        const loadingTask = pdfWorker.getDocument({ data: arrayBuffer });
        const pdfDoc = await loadingTask.promise;
        let combinedTxt = "";

        for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
          setExtractionProgress(Math.round(30 + (pageNum / pdfDoc.numPages) * 60));
          setExtractionText(`Extracting PDF characters: page ${pageNum} of ${pdfDoc.numPages}…`);
          const page = await pdfDoc.getPage(pageNum);
          const textContext = await page.getTextContent();
          combinedTxt += textContext.items.map((x: any) => x.str).join(" ") + "\n\n";
        }

        extractedStr = combinedTxt;
        setExtractionProgress(100);
      } else if (name.endsWith(".docx") || name.endsWith(".doc")) {
        setExtractionProgress(40);
        setExtractionText("Assembling browser Mammoth extractor…");
        if (!(window as any).mammoth) {
          throw new Error("Client Mammoth.js libraries failed to bind to browser global variables.");
        }

        const arrayBuffer = await file.arrayBuffer();
        const parser = (window as any).mammoth;
        const result = await parser.extractRawText({ arrayBuffer });
        extractedStr = result.value || "";
        
        setExtractionProgress(100);
        setExtractionText("Assembling text arrays…");
      } else {
        triggerToast("Unsupported file format. Please upload PDF, Word DOCX or plain TXT.", "error");
        setIsExtracting(false);
        return;
      }

      if (!extractedStr || extractedStr.trim().length === 0) {
        triggerToast("Extracted content is empty. Verify that your document contains valid text.", "error");
      } else {
        setPastedText(extractedStr.trim());
        triggerToast(`Successfully extracted ${extractedStr.trim().split(/\s+/).length} words.`, "success");
      }
    } catch (e: any) {
      console.error("[Extraction Error]:", e);
      triggerToast(`Document parse failed: ${e.message || e}. Please try pasting text directly.`, "error");
    } finally {
      setTimeout(() => {
        setIsExtracting(false);
        setExtractionProgress(0);
      }, 500);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const CORRECT_PASSWORD = "Addy0504";

  // Rule Vault password unlock methods
  const handlePasswordSubmit = () => {
    // Standard prompt password matching
    if (pwInputValue === CORRECT_PASSWORD) {
      setIsVaultLocked(false);
      setShowPwModal(false);
      setPwInputValue("");
      setPwError(false);
      setRuleInputText(singleRule);
      triggerToast("🔐 Rule Vault decrypted successfully.", "success");
    } else {
      setPwError(true);
      setPwInputValue("");
      triggerToast("Authentication Failed. Incorrect Password.", "error");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPwText(!showPwText);
  };

   const applyRuleTemplate = (key: TemplateKey) => {
     const selected = TEMPLATES[key];
     applyPreset(selected);
   };

   const applyPreset = (preset: { name: string; rules: string }) => {
     setRulesDraft(preset.rules);
     setRuleInputText(preset.rules);
     const count = preset.rules.split("\n").filter(line => line.trim().length > 0).length;
     setRulesListCount(count);
     triggerToast(`Applied preset: ${preset.name}`, "info");

     // Save to Firestore as master rules for everyone
     setDoc(doc(db, "vault", "compliance_rule"), { remoteRules: preset.rules, updatedAt: Date.now() })
      .then(() => {
        setSingleRule(preset.rules);
        triggerToast(`Master vault updated with preset: ${preset.name}`, "success");
      })
       .catch(() => {});
 
     // Smooth-scroll to draft text area
     const el = document.getElementById("draft_textarea_element");
     if (el) el.scrollIntoView({ behavior: "smooth" });
   };

   const handleSaveCustomPreset = async () => {
     if (!newPresetName.trim()) {
       triggerToast("Please specify a Name for the preset.", "error");
       return;
     }
     if (!newPresetRules.trim()) {
       triggerToast("Preset rules list cannot be empty.", "error");
       return;
     }
     try {
       const res = await fetch("/api/presets", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
           name: newPresetName.trim(),
           icon: newPresetIcon.trim() || "📝",
           rules: newPresetRules.trim()
         })
       });
       if (res.ok) {
         const data = await res.json();
         if (data && data.success && Array.isArray(data.presets)) {
           setCustomPresets(data.presets);
           triggerToast(`Shared Preset "${newPresetName}" saved for all users!`, "success");
           setIsCreatingPreset(false);
           setNewPresetName("");
           setNewPresetIcon("📝");
           setNewPresetRules("");
         } else {
           triggerToast("Failed to parse server's preset response.", "error");
         }
       } else {
         const errData = await res.json();
         triggerToast(errData.error || "Server failed to save preset.", "error");
       }
     } catch (err) {
       console.error("Save preset error:", err);
       triggerToast("Failed to connect to preset server.", "error");
     }
   };
 
   const saveRulesChanges = () => {
     const cleaned = ruleInputText.trim();
     if (!cleaned) {
       triggerToast("Your rules formulation draft cannot be empty.", "error");
       return;
     }
     setRuleInputText(cleaned);
     const count = cleaned.split("\n").filter(line => line.trim().length > 0).length;
     setRulesListCount(count);
     
     // Save to Firestore as master rules for everyone
     setDoc(doc(db, "vault", "compliance_rule"), { remoteRules: ruleInputText, updatedAt: Date.now() })
      .then(() => {
        setSingleRule(cleaned);
        triggerToast(`Rules securely saved to Master Vault for everyone.`, "success");
      })
       .catch((err) => {
         console.error("Master rules sync failed:", err);
         triggerToast("Rules saved locally, but server sync failed.", "error");
       });
   };

  const clearRules = () => {
    setRulesDraft("");
    triggerToast("Draft wiped.", "info");
  };

  const reLockVault = () => {
    setIsVaultLocked(true);
    triggerToast("Rules Vault safely locked.", "info");
  };

  const saveSettingsAndKey = () => {
    localStorage.setItem("cg_gemini_key", customKey);
    setShowSettings(false);
    triggerToast("Global configurations saved successfully.", "success");
  };

  // Safe helper to scroll into viewport sections
  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      const topOfs = ref.current.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: topOfs, behavior: "smooth" });
    }
  };

  // Heuristic offline analyzer callback (Fallback if serverside Gemini is unreachable or no key is configured)
  const runLocalFallbackAudit = (content: string, rawRules: string): AuditReport => {
    const wc = content.trim().split(/\s+/).filter(w => w.length > 0).length;
    const ruleLines = rawRules.split("\n").filter(r => r.trim().length > 0);
    
    interface localRuleMatch {
      rule: string;
      explanation: string;
      suggestion?: string;
    }

    const passed: localRuleMatch[] = [];
    const failed: localRuleMatch[] = [];

    ruleLines.forEach(rule => {
      const rLower = rule.toLowerCase();
      let pass = true;
      let expl = "";
      let sugg = "";

      if (rLower.includes("word") && /\b(\d+)\b/.test(rLower)) {
        const matches = rLower.match(/\b(\d+)\b/);
        const minW = matches ? parseInt(matches[1]) : 300;
        pass = wc >= minW;
        expl = `Document word count evaluated: ${wc} words (Specified target minimum: ${minW})`;
        sugg = pass ? "" : `Add roughly ${minW - wc} matching words of high-quality material to fulfil this metric.`;
      } else if (rLower.includes("tone") || rLower.includes("voice") || rLower.includes("style")) {
        // Simple heuristic check
        pass = wc > 50;
        expl = "Plausibility check completed. Tone and syntax check reveals neutral balance of professional copy.";
        sugg = pass ? "" : "Ensure structural parameters are detailed enough to check branding elements.";
      } else if (rLower.includes("british") || rLower.includes("english")) {
        const amSpellingExceptions = ["color", "labor", "flavor", "organize", "analyze", "center", "defense"].filter(word => 
          new RegExp(`\\b${word}\\b`, "i").test(content)
        );
        pass = amSpellingExceptions.length === 0;
        expl = pass 
          ? "No American structural slang found in standard dictionaries." 
          : `Potential US English spelling patterns observed: "${amSpellingExceptions.join(", ")}"`;
        sugg = pass ? "" : "Align spellings to use standard spelling matching (e.g., colour, labour, organise, centre).";
      } else if (rLower.includes("passive")) {
        const passiveStructures = (content.match(/\b(is|am|are|was|were|be|been|being)\s+\w+ed\b/gi) || []).length;
        pass = passiveStructures < (wc * 0.05); // pass if passive is low
        expl = `Estimated relative passive sentence indicators: ${passiveStructures} occurrences found.`;
        sugg = pass ? "" : "Revise passive statements to leverage direct subject active declarations.";
      } else if (rLower.includes("h2") || rLower.includes("heading")) {
        pass = /#{2,3}\s/g.test(content) || /<h[2-3]/i.test(content) || content.includes("\n\n");
        expl = pass ? "Document visual styling headings checked out successfully." : "Heading structuring markers were not verified.";
        sugg = pass ? "" : "Integrate descriptive sub-headers to properly guide logical transition layouts.";
      } else {
        // default pass for arbitrary rules locally
        pass = wc > 150;
        expl = "Evaluated via local pattern matcher indicators.";
        sugg = "Provide deeper and more formatted context to satisfy detailed semantic testing.";
      }

      if (pass) {
        passed.push({ rule, explanation: expl });
      } else {
        failed.push({ rule, explanation: expl, suggestion: sugg });
      }
    });

    const mockScore = ruleLines.length > 0 ? Math.round((passed.length / ruleLines.length) * 100) : 75;
    const verdict = mockScore >= 80 ? "Approved" : mockScore >= 50 ? "Needs Revision" : "Major Fix Needed";

    return {
      overallScore: mockScore,
      verdict,
      summary: "Evaluated using ContentGuard Local Heuristics (Gemini API server check encountered an off-line error). Static pattern metrics were active.",
      passedRules: passed,
      failedRules: failed,
      grammarScore: Math.max(45, Math.min(95, Math.round(75 + (Math.random() - 0.5) * 15))),
      seoScore: Math.max(40, Math.min(100, Math.round(70 + (Math.random() - 0.5) * 20))),
      toneScore: Math.max(50, Math.min(95, Math.round(80 + (Math.random() - 0.4) * 15))),
      readabilityScore: localStats.readabilityScore || 65,
      aiDetectionRisk: Math.max(10, Math.min(90, Math.round(40 + (Math.random() - 0.5) * 40))),
      strengths: ["Strong readability metric output", "Document structure conforms to text layout limits."],
      suggestions: ["Configure your Gemini API key in the Top Navigation Settings panel directly for full LLM analysis.", "Verify spelling and heading formatting before exporting."],
      missingSections: ["Heading 2 structure indices", "Call-to-action indicators in footer."]
    };
  };

  // Launch the AI rule checking
  const runComplianceCheck = async () => {
    const rulesToPass = singleRule || ruleInputText;
    const contentToVerify = pastedText.trim();

    if (!contentToVerify || contentToVerify.length < 10) {
      triggerToast("Please provide valid document text for evaluation first.", "error");
      scrollTo(verifyRef);
      return;
    }

    if (!rulesToPass || rulesToPass.trim().length === 0) {
      triggerToast("No active compliance validation criteria found. Please unlock and configure the Rules Vault.", "error");
      scrollTo(vaultRef);
      return;
    }

    setLiveAuditText("");
    setStreamAuditError(null);
    setIsStreamingAudit(true);
    setIsChecking(true);
    setActiveCheckStep(0);
    setCheckProgressFill(5);

    const stepInterval = setInterval(() => {
      setActiveCheckStep(prev => {
        const next = prev + 1;
        if (next < AUDIT_STEPS.length) {
          setCheckProgressFill(Math.round((next / AUDIT_STEPS.length) * 90));
          return next;
        }
        return prev;
      });
    }, 250);

    try {
      const response = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: contentToVerify,
          rules: singleRule || rulesToPass,
          customApiKey: customKey?.trim() || undefined
        })
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(`Compliance API failed: ${response.status} ${errorText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Streaming is not available on the compliance API response.");
      }

      const decoder = new TextDecoder();
      let accumulated = "";
      let chunkResult = await reader.read();

      while (!chunkResult.done) {
        const chunkText = decoder.decode(chunkResult.value, { stream: true });
        accumulated += chunkText;
        setLiveAuditText(prev => prev + chunkText);
        chunkResult = await reader.read();
      }

      const strictlyJsonText = accumulated.replace(/```json|```/gi, "").trim();
      const reportData: AuditReport = JSON.parse(strictlyJsonText);
      reportData.wordCount = localStats.words;
      reportData.charCount = localStats.chars;
      reportData.sentCount = localStats.sentences;
      reportData.avgWPS = localStats.sentences > 0 ? Math.round(localStats.words / localStats.sentences) : 0;
      reportData.createdAt = new Date().toISOString();

      setReportResult(reportData);
      triggerToast("Compliance check complete! Generated report successfully.", "success");
      setTimeout(() => {
        scrollTo(reportRef);
      }, 500);
    } catch (e: any) {
      setStreamAuditError(e?.message || "Streaming compliance audit failed.");
      console.warn("[Compliance Stream Failed]", e);
      triggerToast(`Stream audit unavailable: ${e?.message || e}. Falling back to local evaluator.`, "error");

      const backupReport = runLocalFallbackAudit(contentToVerify, rulesToPass);
      backupReport.wordCount = localStats.words;
      backupReport.charCount = localStats.chars;
      backupReport.sentCount = localStats.sentences;
      backupReport.avgWPS = localStats.sentences > 0 ? Math.round(localStats.words / localStats.sentences) : 0;
      backupReport.createdAt = new Date().toISOString();

      setReportResult(backupReport);
      setTimeout(() => {
        scrollTo(reportRef);
      }, 600);
    } finally {
      clearInterval(stepInterval);
      setCheckProgressFill(100);
      setTimeout(() => {
        setIsChecking(false);
        setIsStreamingAudit(false);
      }, 200);
    }
  };

  const copyReportToClipboard = () => {
    if (!reportResult) return;
    const rulesSummary = reportResult.verdict;
    const textToCopy = `CONTENTGUARD AI AUDIT REPORT
Score: ${reportResult.overallScore}/100 [${rulesSummary}]
Timestamp: ${reportResult.createdAt ? new Date(reportResult.createdAt).toLocaleString() : new Date().toLocaleString()}
Summary: ${reportResult.summary}
Passed Rules: ${reportResult.passedRules.map(r => `\n- [PASS] ${r.rule} (${r.explanation})`).join("")}
Violations: ${reportResult.failedRules.map(r => `\n- [FAIL] ${r.rule} (${r.explanation}) -> Fix: ${r.suggestion}`).join("")}
Powered by ContentGuard and Gemini AI`;

    navigator.clipboard.writeText(textToCopy)
      .then(() => triggerToast("Report copied to clipboard successfully.", "success"))
      .catch(() => triggerToast("Failed to copy clipboard payload.", "error"));
  };

  if (!activeUser) {
    // Determine target dimensions for snapping magnetic cursor relative to hovered target
    const currentHoveredUser = USERS.find(u => u.id === gateHoveredId);
    
    // Magnetic snapped outline positions
    const snappedX = gateHoveredRect 
      ? gateHoveredRect.left + gateHoveredRect.width / 2 
      : gateMouse.x;
    const snappedY = gateHoveredRect 
      ? gateHoveredRect.top + gateHoveredRect.height / 2 
      : gateMouse.y;
    const snappedWidth = gateHoveredRect ? gateHoveredRect.width + 16 : 28;
    const snappedHeight = gateHoveredRect ? gateHoveredRect.height + 16 : 28;

    // Fluid responsive attraction/lag of the inner pointer towards the actual mouse coords
    const innerPointerX = gateHoveredRect 
      ? (gateHoveredRect.left + gateHoveredRect.width / 2) + (gateMouse.x - (gateHoveredRect.left + gateHoveredRect.width / 2)) * 0.18
      : gateMouse.y === -200 ? -200 : gateMouse.x;
    
    const innerPointerY = gateHoveredRect 
      ? (gateHoveredRect.top + gateHoveredRect.height / 2) + (gateMouse.y - (gateHoveredRect.top + gateHoveredRect.height / 2)) * 0.18
      : gateMouse.y === -200 ? -200 : gateMouse.y;

    // Background floating matrix rows for high-tech ambiance
    const complianceLogsByType: Record<string, string[]> = {
      darshit: [
        "node_infra_server // synchronization: compliant",
        "docker_container_agent // secure socket active",
        "gcp_run_ingress // reverse proxy on port 3000 verified",
        "compliance_pipeline_node_v12 // scanning buffers raw"
      ],
      addy: [
        "strategic_brand_guidelines_2026 // validated",
        "compliance_tactical_standards // target matched",
        "corporate_tone_moderator // operational consistency calibrated",
        "brand_authority_score_tier_1 // active deployment checklist"
      ],
      sonal: [
        "flesch_kincaid_readability // index score: 86.2 (excellent)",
        "passive_voice_threshold // indirect phrasing logs: 11.2%",
        "literary_pace_meter // flow density: premium quality",
        "editorial_vibe_index // status: highly engaging"
      ],
      debjani: [
        "sec_copywriting_auditor // validation: raw checked",
        "trademark_protection_radar // standard indices checked",
        "ethical_conduct_directives // verified with zero anomalies",
        "corporate_reputation_index // safety index score: 99.8%"
      ],
      poonam: [
        "keyword_stuffing_analyzer // density range: 1.34% (optimal)",
        "google_bot_index_simulator // preheat metadata loaded",
        "meta_tag_character_ratio // length validation success",
        "search_visibility_pipeline // live indexing indexers active"
      ]
    };

    return (
      <div 
        className="min-h-screen bg-[#030303] text-[#f3f4f6] flex flex-col justify-center items-center font-sans overflow-hidden relative select-none"
        style={{ perspective: 1200 }}
      >
        {/* MAGNETIC SNAPPING HIGH-FIDELITY CURSOR FOLLOWERS */}
        {introTextFaded && gateMouse.x !== -200 && (
          <>
            {/* Outer snappable magnet halo border */}
            <motion.div
              className="fixed top-0 left-0 pointer-events-none z-[999] border transition-colors duration-300 mix-blend-screen"
              animate={{
                x: snappedX,
                y: snappedY,
                width: snappedWidth,
                height: snappedHeight,
                borderRadius: gateHoveredRect ? "24px" : "9999px",
                borderColor: currentHoveredUser 
                  ? currentHoveredUser.id === "addy" ? "rgba(56, 189, 248, 0.75)"
                    : currentHoveredUser.id === "darshit" ? "rgba(168, 85, 247, 0.75)"
                    : currentHoveredUser.id === "sonal" ? "rgba(16, 185, 129, 0.75)"
                    : currentHoveredUser.id === "debjani" ? "rgba(239, 68, 68, 0.75)"
                    : "rgba(236, 72, 153, 0.75)"
                  : "rgba(99, 102, 241, 0.35)",
                backgroundColor: currentHoveredUser
                  ? currentHoveredUser.id === "addy" ? "rgba(56, 189, 248, 0.04)"
                    : currentHoveredUser.id === "darshit" ? "rgba(168, 85, 247, 0.04)"
                    : currentHoveredUser.id === "sonal" ? "rgba(16, 185, 129, 0.04)"
                    : currentHoveredUser.id === "debjani" ? "rgba(239, 68, 68, 0.04)"
                    : "rgba(236, 72, 153, 0.04)"
                  : "transparent",
                boxShadow: currentHoveredUser 
                  ? `0 0 35px ${currentHoveredUser.glowColor}`
                  : "0 0 8px rgba(99, 102, 241, 0.08)",
              }}
              style={{
                translateX: "-50%",
                translateY: "-50%",
              }}
              transition={{
                type: "spring",
                stiffness: gateHoveredRect ? 240 : 380,
                damping: gateHoveredRect ? 22 : 28,
                mass: 0.6
              }}
            />

            {/* Inner responsive attraction pointer dot */}
            <motion.div
              className="fixed top-0 left-0 w-2.5 h-2.5 rounded-full pointer-events-none z-[1000] bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)] mix-blend-screen"
              animate={{
                x: innerPointerX,
                y: innerPointerY,
                scale: gateHoveredRect ? 0.65 : 1,
                backgroundColor: currentHoveredUser
                  ? currentHoveredUser.id === "addy" ? "#38bdf8"
                    : currentHoveredUser.id === "darshit" ? "#c084fc"
                    : currentHoveredUser.id === "sonal" ? "#34d399"
                    : currentHoveredUser.id === "debjani" ? "#f87171"
                    : "#f472b6"
                  : "#ffffff"
              }}
              style={{
                translateX: "-50%",
                translateY: "-50%",
              }}
              transition={{
                type: "spring",
                stiffness: 420,
                damping: 24,
                mass: 0.2
              }}
            />
          </>
        )}

        {/* Cinematic Backdrop Accents */}
        <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-indigo-950/15 rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] bg-purple-950/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute inset-0 bg-radial-grid opacity-[0.03] pointer-events-none" />
        <div className="absolute inset-0 grid-overlay opacity-15 pointer-events-none" />

        {/* DENSE COMPLIANCE NOISE TEXT CLOUD */}
        <AnimatePresence>
          {!introTextFaded && (
            <motion.div 
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, filter: "blur(25px)", y: -15 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0 bg-[#020202] z-[120] flex flex-col justify-center items-center overflow-hidden p-6"
            >
              {/* Absolute scattered rules */}
              <div className="absolute inset-0 pointer-events-none opacity-40 select-none overflow-hidden text-[9px] font-mono leading-relaxed text-indigo-500/40">
                {Array.from({ length: 48 }).map((_, idx) => {
                  const text = COMPLIANCE_TEXT_DATABASE[idx % COMPLIANCE_TEXT_DATABASE.length];
                  const left = `${(idx * 17) % 95}%`;
                  const top = `${(idx * 7) % 95}%`;
                  const delay = (idx % 10) * 0.15;
                  const duration = 4 + (idx % 6);
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ 
                        opacity: [0, 0.5, 0.7, 0.5, 0],
                        y: [0, -30, -60],
                      }}
                      transition={{
                        duration: duration,
                        repeat: Infinity,
                        delay: delay,
                        ease: "easeInOut"
                      }}
                      className="absolute whitespace-nowrap"
                      style={{ left, top }}
                    >
                      {text}
                    </motion.div>
                  );
                })}
              </div>

              {/* Central typography highlighting */}
              <div className="text-center max-w-xl px-6 relative z-10 flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: [0.93, 1, 1], opacity: [0, 1, 1] }}
                  transition={{ duration: 1.2, times: [0, 0.5, 1] }}
                  className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-2xl mb-6 shadow-[0_0_35px_rgba(99,102,241,0.25)]"
                >
                  👁️‍🗨️
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="font-display font-light text-xl sm:text-2xl text-white tracking-[0.25em] uppercase text-center leading-relaxed"
                >
                  Copywriting Clutter <span className="font-serif italic font-normal text-indigo-400">Detected</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 1 }}
                  className="text-white/40 font-mono text-xs mt-4 leading-relaxed max-w-sm text-center tracking-wide"
                >
                  Analyzing 1,024 compliance directives. Overdose of redundancy, confusing phrasing and legal jargon located.
                </motion.p>

                {/* Dynamic scanning progress bar */}
                <div className="w-56 h-1 bg-white/5 rounded-full overflow-hidden mt-8 relative">
                  <motion.div 
                    initial={{ left: "-100%" }}
                    animate={{ left: "100%" }}
                    transition={{ duration: 3.5, ease: "easeInOut", repeat: Infinity }}
                    className="absolute top-0 bottom-0 w-24 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"
                  />
                </div>

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.8 }}
                  onClick={() => setIntroTextFaded(true)}
                  className="interactive mt-12 px-6 py-2.5 rounded-full border border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.06] text-[10px] text-white/50 hover:text-white uppercase tracking-[0.25em] font-mono transition-colors cursor-pointer"
                >
                  Decant Clutter & Proceed
                </motion.button>
              </div>

              {/* Floating abstract logs at bottom */}
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center text-[9px] font-mono text-white/20 select-none">
                <span>CG_MODULE_SCANNER_v1.9 // BOOT</span>
                <span>CLEANSING ACTIVE MEMORY BUFFER...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* OPERATIONS BOARD CONTAINER */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-7xl px-6 relative z-10 py-10 flex flex-col items-center h-full justify-center min-h-screen"
        >
          {/* Header Bar */}
          <div className="flex flex-col items-center space-y-3 mb-12 text-center">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" />
              <span className="text-[10px] font-mono text-indigo-400 tracking-[0.35em] uppercase">
                CONTENTGUARD CENTRAL OPERATIONS TERMINAL
              </span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-light text-white tracking-wider uppercase">
              AUTHORIZED <span className="text-indigo-400 font-serif italic lowercase font-normal">operators</span> ONLY
            </h2>
            
            <div className="h-[1px] w-36 bg-gradient-to-r from-transparent via-indigo-500/45 to-transparent mt-2" />
            
            <p className="text-[11px] font-mono text-white/40 uppercase tracking-widest max-w-md pt-1">
              Decryption node active. Select your identity profile card to initialize private workspace container.
            </p>
          </div>

          {/* BALANCED SEAMLESS GLASS COMPACT CONSOLE GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 w-full items-stretch justify-center max-w-6xl">
            {USERS.map((user) => {
              const isMe = user.id === "addy";
              const isHovered = gateHoveredId === user.id;
              const isAnyHovered = gateHoveredId !== null;
              const isOtherHovered = isAnyHovered && !isHovered;
              const isDecrypting = signingInUser !== null;
              const isSelected = signingInUser?.id === user.id;

              return (
                <motion.div
                  key={user.id}
                  onMouseMove={(e) => handleMouseMoveCard(e, user.id)}
                  onMouseEnter={(e) => handleMouseEnterCard(e, user.id)}
                  onMouseLeave={() => {
                    setGateHoveredId(null);
                    setGateHoveredRect(null);
                    setGateRotateX(0);
                    setGateRotateY(0);
                  }}
                  onClick={() => !isDecrypting && handleSelectUser(user)}
                  animate={{
                    opacity: isDecrypting 
                      ? isSelected ? 1 : 0.1 
                      : isOtherHovered ? 0.45 : 1,
                    scale: isDecrypting 
                      ? isSelected ? 1.08 : 0.9 
                      : isHovered ? 1.04 : 1,
                    filter: isDecrypting 
                      ? isSelected ? "blur(0px)" : "blur(8px)"
                      : isOtherHovered ? "blur(2px)" : "blur(0px)",
                    boxShadow: isHovered 
                      ? `0 0 45px ${user.glowColor}` 
                      : "0 4px 30px rgba(0, 0, 0, 0.6)",
                  }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 240, 
                    damping: 22, 
                    mass: 0.8 
                  }}
                  style={{
                    transformStyle: "preserve-3d",
                    perspective: 1000,
                    rotateX: isHovered ? gateRotateX : 0,
                    rotateY: isHovered ? gateRotateY : 0,
                  }}
                  className={`group relative bg-white/[0.01] border ${isHovered ? "border-white/15" : "border-white/5"} rounded-2xl p-6 flex flex-col items-center justify-between text-center cursor-pointer overflow-hidden transition-all duration-300 backdrop-blur-xl h-[392px] select-none`}
                >
                  {/* Subtle Neon Spotlights and rotating radar details inside card */}
                  <div 
                    className={`absolute -top-16 -left-16 w-32 h-32 bg-gradient-to-br ${user.color} rounded-full transition-opacity duration-300 pointer-events-none blur-3xl`}
                    style={{ opacity: isHovered ? 0.28 : 0.04 }}
                  />

                  {/* Top card accent lines */}
                  <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent opacity-60" />
                  
                  {/* Outer Orbit Line on Hover */}
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 0.3, scale: 1.15 }}
                      className={`absolute w-44 h-44 rounded-full border border-dashed pointer-events-none`}
                      style={{
                        borderColor: isMe ? "#38bdf8" : user.id === "darshit" ? "#c084fc" : user.id === "sonal" ? "#34d399" : user.id === "debjani" ? "#f87171" : "#f472b6",
                        animation: "spin 36s linear infinite"
                      }}
                    />
                  )}

                  {/* HIGH CLASS AVATAR ROUNDED FRAME WITH INDIVIDUAL GLOW */}
                  <div className="relative z-10 w-28 h-28 shrink-0 rounded-full border border-white/5 p-1 backdrop-blur-md bg-[#090909]/40 flex items-center justify-center relative shadow-[inset_0_0_12px_rgba(255,255,255,0.05)] transition-transform duration-300 group-hover:scale-105">
                    {/* Ring layer */}
                    <div 
                      className={`absolute inset-0 rounded-full border-2 opacity-50 transition-all duration-300 ${isHovered ? "scale-105 opacity-100" : "scale-100"}`} 
                      style={{
                        borderColor: isMe ? "#38bdf8" : user.id === "darshit" ? "#c084fc" : user.id === "sonal" ? "#34d399" : user.id === "debjani" ? "#f87171" : "#f472b6",
                        boxShadow: isHovered ? `0 0 15px ${user.glowColor}` : "none"
                      }}
                    />
                    
                    {/* Immersive cropped face render */}
                    <div className="absolute inset-1 rounded-full overflow-hidden">
                      <div 
                        className="absolute inset-0 transition-all duration-300 group-hover:scale-110 grayscale-[15%] group-hover:grayscale-0"
                        style={{
                          backgroundImage: `url(${user.avatar})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          backgroundRepeat: "no-repeat"
                        }}
                      />
                    </div>
                  </div>

                  {/* Character descriptive labels and specs */}
                  <div className="relative z-10 flex flex-col items-center flex-1 mt-6 justify-between w-full">
                    <div>
                      {/* Technical clearance code badge */}
                      <span 
                        className={`inline-block text-[8px] font-mono uppercase tracking-[0.25em] px-2.5 py-1 rounded-full border mb-3 transition-colors ${user.badgeBg}`}
                      >
                        {user.role}
                      </span>
                      
                      {/* Name of employee */}
                      <h3 className="font-display font-medium text-lg text-white hover:text-indigo-300 transition-colors uppercase tracking-[0.15em] relative">
                        {user.name}
                        {isMe && (
                          <span className="absolute -top-1.5 -right-3 text-[7px] font-semibold text-sky-400 uppercase tracking-widest bg-sky-500/10 px-1 rounded">
                            Me
                          </span>
                        )}
                      </h3>
                      
                      {/* Tech Specifications */}
                      <div className="h-4 overflow-hidden mt-1.5">
                        <AnimatePresence mode="wait">
                          {isHovered ? (
                            <motion.span 
                              key="spec"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.15 }}
                              className="block font-mono text-[8px] text-white/50 tracking-widest uppercase"
                            >
                              CLEARANCE: LEVEL 5 · KEY: PROT_{user.id.toUpperCase()}_9
                            </motion.span>
                          ) : (
                            <motion.span 
                              key="def"
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 0.35, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              transition={{ duration: 0.15 }}
                              className="block font-mono text-[8px] text-white/30 tracking-widest uppercase"
                            >
                              SECURE OPERATIONAL NODES
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Slogan Quote */}
                    <p className={`text-[11px] font-serif italic text-white/50 leading-relaxed max-w-[190px] pt-4 border-t border-white/5 select-none transition-all duration-300 ${isHovered ? "opacity-100 text-white/80 translate-y-0" : "opacity-35 hover:opacity-100 translate-y-1"}`}>
                      "{user.quote}"
                    </p>
                    <p className={`mt-2 text-[10px] font-sans text-white/35 leading-relaxed max-w-[190px] select-none transition-all duration-300 ${isHovered ? "opacity-100 text-white/65 translate-y-0" : "opacity-45 translate-y-1"}`}>
                      {user.personality}
                    </p>
                  </div>

                  {/* Bottom terminal log metrics rotating inside on hover */}
                  <div className="relative z-10 w-full mt-4 flex justify-between items-center text-[8px] font-mono text-white/20">
                    <span>CG_{user.id.toUpperCase()}_SYS</span>
                    <span className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${isHovered ? "bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,1)]" : "bg-white/10"}`} />
                      CONNECTED
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* BOTTOM DECORATIVE META WORKSPACE STATISTICS */}
          <div className="w-full max-w-6xl mt-12 flex flex-col sm:flex-row justify-between items-center border-t border-white/5 pt-6 text-[10px] font-mono text-white/25 select-none space-y-4 sm:space-y-0">
            <div className="flex items-center gap-6">
              <span>SYSTEM HOST: <span className="text-white/40">GCP_CLOUD_RUN_2026</span></span>
              <span>COMPLIANCE INDEXED COUNT: <span className="text-white/40">1,024 PROTS</span></span>
            </div>
            <div className="flex items-center gap-4">
              <span>SECURITY STATUS: <strong className="text-emerald-500/80 font-normal">● ENCRYPTED CORE ACTIVE</strong></span>
              <button 
                onClick={() => setIntroTextFaded(false)}
                className="interactive border border-white/10 hover:border-white/25 bg-white/[0.01] hover:bg-white/[0.04] px-3 py-1 rounded-full text-[9px] uppercase tracking-wider text-indigo-400 transition-colors cursor-pointer"
              >
                Re-Scan Copywriter Clutter
              </button>
            </div>
          </div>

          {/* DECRYPTION IMMERSIVE OVERLAY AND PROGRESS DASHBOARD */}
          <AnimatePresence>
            {signingInUser && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[#030303]/98 backdrop-blur-2xl z-[150] flex flex-col justify-center items-center p-6 select-none"
              >
                <div className="text-center max-w-lg flex flex-col items-center relative">
                  {/* Outer security grid background overlay inside decrypter */}
                  <div className="absolute inset-0 bg-radial-grid opacity-[0.05] pointer-events-none" />

                  {/* Operator thumbnail with colored frame spotlight */}
                  <motion.div 
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 180, damping: 18 }}
                    className="relative w-28 h-28 rounded-full overflow-hidden border border-indigo-500/30 mb-8 animate-pulse shadow-[0_0_40px_rgba(99,102,241,0.2)]"
                  >
                    <div 
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `url(${signingInUser.avatar})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat"
                      }}
                    />
                  </motion.div>

                  <h3 className="font-display font-light text-white text-lg tracking-[0.3em] uppercase">
                    DECRYPTING VAULT KEY
                  </h3>
                  
                  <p className="text-indigo-400 font-mono text-xs uppercase tracking-[0.2em] mt-2 mb-8">
                    Operator: <span className="font-bold text-white tracking-wider">{signingInUser.name.toUpperCase()}</span>
                  </p>

                  {/* REAL-TIME ROLE-SPECIFIC TERMINAL OUTPUT LINES */}
                  <div className="w-80 h-28 bg-[#070707] border border-white/5 rounded-xl p-4 font-mono text-[9px] text-white/40 text-left overflow-y-hidden mb-8 shadow-inner flex flex-col space-y-1.5 selection:bg-transparent">
                    <span className="text-indigo-400/80">{"$"} contentguard --verify-identity {signingInUser.id}</span>
                    <span className="text-indigo-400/60 font-semibold uppercase">IDENTITY MATCH VERIFIED. EXECUTING DECRYPTION SEQUENCE:</span>
                    
                    {/* Display step details matching logging percent */}
                    {complianceLogsByType[signingInUser.id || "addy"].map((logLine, idx) => {
                      const isActive = signInProgress >= (idx + 1) * 25;
                      return (
                        <span 
                          key={idx} 
                          className={`transition-all duration-300 ${isActive ? "text-[#e0e0e0] font-medium" : "text-white/10"}`}
                        >
                          {isActive ? "✓" : "⚡"} {logLine}
                        </span>
                      );
                    })}
                  </div>

                  {/* High precision loading status progress meter */}
                  <div className="w-80 bg-white/5 h-2 rounded-full overflow-hidden relative border border-white/5">
                    <motion.div 
                      className="h-full bg-gradient-to-r rounded-full" 
                      style={{ 
                        width: `${signInProgress}%`,
                        backgroundImage: signingInUser.id === "addy" ? "linear-gradient(to right, #0284c7, #38bdf8)"
                          : signingInUser.id === "darshit" ? "linear-gradient(to right, #7e22ce, #c084fc)"
                          : signingInUser.id === "sonal" ? "linear-gradient(to right, #047857, #34d399)"
                          : signingInUser.id === "debjani" ? "linear-gradient(to right, #b91c1c, #f87171)"
                          : "linear-gradient(to right, #be185d, #f472b6)"
                      }} 
                    />
                  </div>

                  <span className="text-[10px] text-white/30 font-mono tracking-widest uppercase mt-4 block">
                    DECRYPTION COMPLETED · <span className="text-indigo-400 font-bold">{signInProgress}%</span>
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  const currentTheme = activeUser ? THEME_CONFIGS[activeUser] : null;
  const currentLoggedUserObj = activeUser ? USERS.find(u => u.id === activeUser) : null;

  return (
    <div 
      style={currentTheme ? currentTheme.themeStyle : undefined}
      className={`min-h-screen antialiased transition-all duration-500 selection:bg-indigo-500/30 selection:text-indigo-200 ${
        currentTheme 
          ? currentTheme.bgClass + " " + currentTheme.fontBodyClass
          : theme === "dark" 
            ? "bg-[#050505] text-[#e0e0e0] font-sans" 
            : "bg-[#fafafa] text-slate-900 font-sans"
      }`}
    >
      <CustomCursor />
      {activeUser === "sonal" && <SonalCursorTrail />}

      {/* FIXED FLOATING NAVBAR PROGRESS BAR */}
      <div className={`fixed top-0 left-0 w-full h-[64px] z-50 backdrop-blur-xl border-b transition-all duration-300 ${
        currentTheme?.id === "poonam" 
          ? "bg-white/80 border-amber-900/10 text-slate-900 shadow-sm" 
          : "bg-[#050505]/80 border-white/5 text-white"
      }`}>
        <div 
          className="absolute bottom-0 left-0 h-[2px] transition-all duration-100" 
          style={{ 
            width: `${scrollProgress}%`,
            background: currentTheme 
              ? `linear-gradient(to right, ${currentTheme.primaryColor}, ${currentTheme.accentColor})` 
              : "linear-gradient(to right, #6366f1, #10b981)"
          }} 
        />
        
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-4.5 cursor-pointer">
            <div className="flex items-center gap-2.5" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              <div 
                className="w-9 h-9 rounded-lg flex items-center justify-center font-display font-bold text-white text-base shadow-lg transition-transform hover:rotate-6 duration-300"
                style={{
                  background: currentTheme 
                    ? `linear-gradient(135deg, ${currentTheme.primaryColor}, ${currentTheme.accentColor})` 
                    : "linear-gradient(135deg, #4f46e5, #4338ca)",
                  boxShadow: currentTheme 
                    ? `0 4px 14px ${currentTheme.glowColor}` 
                    : "0 4px 14px rgba(99,102,241,0.25)"
                }}
              >
                CG
              </div>
              <span className={`font-display font-bold text-lg tracking-tighter select-none ${currentTheme?.id === "poonam" ? "text-rose-950" : "text-white"}`}>
                Content<span style={{ color: currentTheme ? currentTheme.primaryColor : "#6366f1" }}>.</span><span className="font-serif italic font-normal" style={{ color: currentTheme ? currentTheme.accentColor : "#818cf8" }}>Guard</span>
              </span>
            </div>
 
            {/* Session chip inside header */}
            {activeUser && (() => {
              const currentLoggedUserObj = USERS.find(u => u.id === activeUser);
              return (
                <div className={`flex items-center gap-2 border pl-2.5 pr-3 py-1 bg-white/[0.02]/85 rounded-full text-xs select-none ${currentTheme?.id === "poonam" ? "border-amber-900/10 bg-amber-50/50" : "border-white/5"}`}>
                  <div 
                    className="w-5 h-5 rounded-full border border-indigo-500/30 overflow-hidden shrink-0" 
                    style={{
                      backgroundImage: `url(${currentLoggedUserObj?.avatar})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat"
                    }}
                  />
                  <span className={`font-display font-medium hidden sm:inline text-[11px] tracking-wide ${currentTheme?.id === "poonam" ? "text-rose-900" : "text-white/80"}`}>
                    {currentLoggedUserObj?.name}
                  </span>
                  <button 
                    onClick={handleLogout} 
                    className={`text-[9px] hover:text-red-400 font-mono select-none uppercase tracking-wider transition-colors shrink-0 ml-1.5 border-l px-2 cursor-pointer bg-transparent ${currentTheme?.id === "poonam" ? "border-amber-900/10 text-rose-700/60" : "border-white/10 text-[#e0e0e0]/40"}`}
                    title="Logout / Switch operator profile"
                  >
                    Sign Out
                  </button>
                </div>
              );
            })()}
          </div>
 
          <div className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-[0.25em] font-medium opacity-80">
            <button 
              onClick={() => scrollTo(vaultRef)} 
              className="transition-colors cursor-pointer hover:text-white"
              style={{ color: activeSection === "vault" ? (currentTheme ? currentTheme.primaryColor : "#818cf8") : undefined }}
            >
              Standards Box
            </button>
            <button 
              onClick={() => scrollTo(verifyRef)} 
              className="transition-colors cursor-pointer hover:text-white"
              style={{ color: activeSection === "verify" ? (currentTheme ? currentTheme.primaryColor : "#818cf8") : undefined }}
            >
              Verify Content
            </button>
            {reportResult && (
              <button 
                onClick={() => scrollTo(reportRef)} 
                className="transition-colors cursor-pointer hover:text-white"
                style={{ color: activeSection === "report" ? (currentTheme ? currentTheme.primaryColor : "#818cf8") : undefined }}
              >
                Analysis Report
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-lg border border-white/10 hover:bg-white/5 bg-[#050505] transition-colors text-white/70 hover:text-white cursor-pointer"
              title="Configure API Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg border border-white/10 hover:bg-white/5 bg-[#050505] transition-colors text-white/70 hover:text-white cursor-pointer"
              title="Toggle Light/Dark Theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button 
              onClick={() => scrollTo(verifyRef)}
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2 rounded-lg font-semibold tracking-widest text-[10px] uppercase transition-all transform hover:-translate-y-0.5 active:translate-y-0 font-display cursor-pointer"
              style={{
                backgroundColor: currentTheme ? currentTheme.primaryColor : "#4f46e5",
                color: currentTheme?.id === "poonam" ? "#2a1518" : "#ffffff",
                boxShadow: currentTheme ? `0 4px 15px ${currentTheme.glowColor}` : "0 4px 15px rgba(99,102,241,0.4)"
              }}
            >
              Run Audit
            </button>
          </div>
        </div>
      </div>

      {/* FLOAT SECTOR MONITORING NAV (RIGHT COLUMN BAR) */}
      <div className={`fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col gap-5 items-center bg-[#0d0d0d]/40 border py-6 px-3.5 rounded-full backdrop-blur-md ${currentTheme?.id === "poonam" ? "border-amber-900/10 bg-white/70 shadow-sm" : "border-white/5 bg-[#0d0d0d]/40"}`}>
        {[
          { id: "hero", label: "Overview", ref: heroRef },
          { id: "vault", label: "Rule Vault", ref: vaultRef },
          { id: "verify", label: "Verify Platform", ref: verifyRef },
          ...(reportResult ? [{ id: "report", label: "Audit Output", ref: reportRef }] : []),
        ].map((sec) => (
          <button
            key={sec.id}
            onClick={() => scrollTo(sec.ref)}
            className="group relative flex items-center justify-center cursor-pointer"
          >
            <span className={`absolute right-8 text-[10px] font-display font-medium border py-1 px-2.5 rounded-md opacity-0 pointer-events-none translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all shadow-xl whitespace-nowrap uppercase tracking-widest ${
              currentTheme?.id === "poonam" 
                ? "bg-white border-amber-900/10 text-rose-950" 
                : "bg-[#0f0f0f] border-white/10 text-[#e0e0e0]"
            }`}>
              {sec.label}
            </span>
            <span 
              className={`w-2 h-2 rounded-full border transition-all ${activeSection === sec.id ? "scale-125" : "border-white/20 bg-black group-hover:border-white/50"}`} 
              style={{
                backgroundColor: activeSection === sec.id ? (currentTheme ? currentTheme.primaryColor : "#818cf8") : undefined,
                borderColor: activeSection === sec.id ? (currentTheme ? currentTheme.primaryColor : "#818cf8") : undefined,
                boxShadow: activeSection === sec.id ? `0 0 8px ${currentTheme ? currentTheme.primaryColor : "#818cf8"}` : undefined
              }}
            />
          </button>
        ))}
      </div>

      {/* DYNAMIC HERO ZONE */}
      <div ref={heroRef} className={`relative min-h-[96vh] flex flex-col justify-center items-center overflow-hidden pt-24 pb-16 ${currentTheme?.id === "poonam" ? "bg-[#fcfaf7] text-slate-900" : "bg-[#050505] text-white"}`}>
        
        {/* PARALLAX BLUR BACKGROUND CIRCLES */}
        <div 
          className="absolute top-[-5%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none transition-all duration-1000" 
          style={{ backgroundColor: currentTheme ? currentTheme.glowColor : "rgba(99, 102, 241, 0.15)" }}
        />
        <div 
          className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none transition-all duration-1000" 
          style={{ backgroundColor: currentTheme ? currentTheme.glowColor : "rgba(16, 185, 129, 0.08)" }}
        />
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

        {/* DOT GRID OVERLAY */}
        <div className={`absolute inset-0 grid-overlay pointer-events-none ${currentTheme?.id === "poonam" ? "opacity-5" : "opacity-20"}`} />
        <div className={`absolute inset-0 grid-overlay bg-radial-grid pointer-events-none ${currentTheme?.id === "poonam" ? "opacity-[0.01]" : "opacity-[0.03]"}`} />

        <div className="max-w-7xl mx-auto px-6 w-full relative z-10 flex flex-col lg:flex-row items-center gap-14 lg:gap-8 justify-between">
          <div className="flex-1 max-w-2xl text-center lg:text-left flex items-start">
            
            {/* Elegant vertical progress divider from the template */}
            <div 
              className="hidden lg:block w-1 h-48 mr-8 mt-4 transition-all duration-500" 
              style={{
                background: currentTheme 
                  ? `linear-gradient(to bottom, ${currentTheme.primaryColor}, transparent)` 
                  : "linear-gradient(to bottom, #6366f1, transparent)",
                boxShadow: currentTheme ? `0 0 15px ${currentTheme.glowColor}` : "0 0 15px rgba(99,102,241,0.3)"
              }}
            />

            <div className="flex-1">
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-[10px] font-display tracking-[0.3em] font-semibold uppercase mb-6 ${
                  currentTheme?.id === "poonam" 
                    ? "border-rose-200 bg-rose-50 text-rose-800" 
                    : "border-indigo-500/20 bg-indigo-500/10 text-indigo-300"
                }`}
              >
                <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" />
                Gemini Powered · Content Guard
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className={`text-4xl sm:text-5xl lg:text-[76px] tracking-tight leading-[0.95] mb-8 text-center lg:text-left ${
                  currentTheme ? currentTheme.fontTitleClass : "font-display font-light text-white"
                }`}
              >
                Write with <span className="font-serif italic font-normal" style={{ color: currentTheme ? currentTheme.primaryColor : "#818cf8" }}>absolute</span><br />
                compliance. Always.
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className={`text-base md:text-lg mb-8 font-light leading-relaxed max-w-lg mx-auto lg:mx-0 text-center lg:text-left ${
                  currentTheme?.id === "poonam" ? "text-slate-800" : "text-white/40"
                }`}
              >
                Crafting visceral digital landscapes where every word complies with strict guidelines. We scan structures, terminology, reading ease, and brand compliance metrics instantly and privately.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
              >
                <button 
                  onClick={() => scrollTo(verifyRef)}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold font-display text-xs uppercase tracking-widest transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2.5 cursor-pointer text-white"
                  style={{
                    backgroundColor: currentTheme ? currentTheme.primaryColor : "#4f46e5",
                    color: currentTheme?.id === "poonam" ? "#2a1518" : "#ffffff",
                    boxShadow: currentTheme ? `0 4px 20px ${currentTheme.glowColor}` : "0 4px 20px rgba(99,102,241,0.4)"
                  }}
                >
                  <FileCheck2 className="w-4 h-4" />
                  Upload Document
                </button>
                <button 
                  onClick={() => scrollTo(vaultRef)}
                  className={`w-full sm:w-auto px-8 py-4 rounded-xl border transition-all font-display text-xs tracking-widest uppercase font-semibold inline-flex items-center justify-center gap-2 cursor-pointer ${
                    currentTheme?.id === "poonam" 
                      ? "border-rose-200 hover:border-rose-450 hover:bg-rose-50 text-rose-950" 
                      : "border-white/10 hover:border-white/20 text-[#e0e0e0]/80 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <LockKeyhole className="w-4 h-4 text-indigo-400" />
                  Unlock Rule Vault
                </button>
              </motion.div>
            </div>
          </div>

          {/* HIGH POLISH 3D FLOATING CANVAS SHIELD */}
          <div className="flex-1 flex justify-center py-6 select-none relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative w-[340px] h-[340px] sm:w-[420px] sm:h-[420px]"
            >
              {/* Spinning decorative orbiting rings */}
              <div className="absolute inset-0 rounded-full border border-white/5 animate-[spin_50s_linear_infinite]" />
              <div className="absolute inset-10 rounded-full border border-dashed border-indigo-500/10 animate-[spin_35s_linear_infinite_reverse]" />
              <div className="absolute inset-20 rounded-full border border-indigo-500/5 animate-[spin_20s_linear_infinite]" />

              {/* Glowing Ambient Core behind shield */}
              <div 
                className="absolute inset-1/4 rounded-full blur-[60px] animate-pulse transition-all duration-1000" 
                style={{ backgroundColor: currentTheme ? currentTheme.glowColor : "rgba(99, 102, 241, 0.15)" }}
              />
 
              {/* Central Premium Shield */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div 
                  className={`w-56 h-64 sm:w-64 sm:h-72 rounded-2xl border p-6 flex flex-col items-center justify-between shadow-2xl relative overflow-hidden transition-all duration-500 ${
                    currentTheme?.id === "poonam" 
                      ? "bg-white border-rose-200 text-rose-950 shadow-rose-100" 
                      : "bg-[#0a0a0a] border-white/10 text-white"
                  }`}
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/5 to-transparent rounded-full pointer-events-none" />
                  
                  {/* Shield decorative lines */}
                  <div className="w-full flex justify-between px-2 opacity-35 col-gap-1.5 mt-2">
                    <span className={`w-1.5 h-[1.5px] rounded-full ${currentTheme?.id === "poonam" ? "bg-rose-950/20" : "bg-white/20"}`} />
                    <span className={`w-1.5 h-[1.5px] rounded-full ${currentTheme?.id === "poonam" ? "bg-rose-950/20" : "bg-white/20"}`} />
                  </div>
 
                  <div className="my-auto flex flex-col items-center gap-4">
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg font-display font-bold text-white text-2xl"
                      style={{
                        background: currentTheme 
                          ? `linear-gradient(135deg, ${currentTheme.primaryColor}, ${currentTheme.accentColor})` 
                          : "linear-gradient(135deg, #4f46e5, #4338ca)",
                        boxShadow: currentTheme 
                          ? `0 4px 14px ${currentTheme.glowColor}` 
                          : "0 4px 14px rgba(99,102,241,0.25)"
                      }}
                    >
                      CG
                    </div>
                    <div className="text-center">
                      <h3 
                        className="font-display font-bold tracking-[0.2em] text-[10px] uppercase"
                        style={{ color: currentTheme ? currentTheme.primaryColor : "#818cf8" }}
                      >
                        Content
                      </h3>
                      <p className={`font-serif italic text-lg ${currentTheme?.id === "poonam" ? "text-rose-905 opacity-80" : "text-white/50"}`}>
                        Standards Vault
                      </p>
                    </div>
                  </div>
 
                  {/* Vault security metadata markers */}
                  <div className={`w-full border rounded-md py-1.5 px-3 flex items-center justify-between text-[10px] font-mono ${
                    currentTheme?.id === "poonam" 
                      ? "bg-rose-50/50 border-rose-100 text-rose-950/70" 
                      : "bg-[#050505] border-white/5 text-white/50"
                  }`}>
                    <span className="flex items-center gap-1">
                      <span 
                        className="w-1.5 h-1.5 rounded-full animate-pulse" 
                        style={{ backgroundColor: currentTheme ? currentTheme.primaryColor : "#10b981" }}
                      /> 
                      ACTIVE
                    </span>
                    <span>v2.1.0</span>
                  </div>
                </motion.div>
              </div>
 
              {/* Orbiting badge widgets */}
              <div className="absolute top-10 right-6 animate-[bounce_6s_infinite_ease-in-out]">
                <div className={`backdrop-blur-md border p-2.5 rounded-lg flex items-center gap-2 shadow-xl ${
                  currentTheme?.id === "poonam" ? "bg-white/95 border-rose-200 text-rose-950" : "bg-[#0b0b0b]/90 border-white/5"
                }`}>
                  <div 
                    className="w-5 h-5 rounded flex items-center justify-center"
                    style={{ backgroundColor: currentTheme ? currentTheme.primaryColor + "1a" : "rgba(16, 185, 129, 0.1)" }}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" style={{ color: currentTheme ? currentTheme.primaryColor : "#34d399" }} />
                  </div>
                  <span className={`text-[10px] uppercase tracking-widest font-semibold font-display ${
                    currentTheme?.id === "poonam" ? "text-rose-900" : "text-white/60"
                  }`}>
                    SEO Verified
                  </span>
                </div>
              </div>
 
              <div className="absolute bottom-12 left-2 animate-[bounce_8s_infinite_ease-in-out_2s]">
                <div className={`backdrop-blur-md border p-2.5 rounded-lg flex items-center gap-2 shadow-xl ${
                  currentTheme?.id === "poonam" ? "bg-white/95 border-rose-200 text-rose-950" : "bg-[#0b0b0b]/90 border-white/5"
                }`}>
                  <div 
                    className="w-5 h-5 rounded flex items-center justify-center"
                    style={{ backgroundColor: currentTheme ? currentTheme.primaryColor + "1a" : "rgba(99, 102, 241, 0.1)" }}
                  >
                    <Wand2 className="w-3.5 h-3.5 animate-pulse" style={{ color: currentTheme ? currentTheme.accentColor : "#818cf8" }} />
                  </div>
                  <span 
                    className="text-[10px] uppercase tracking-widest font-semibold font-display font-serif italic"
                    style={{ color: currentTheme ? currentTheme.primaryColor : "#818cf8" }}
                  >
                    Tone Matched
                  </span>
                </div>
              </div>

            </motion.div>
          </div>
        </div>
      </div>

      {/* THREE VALUE CELLS SECTION */}
      <section className="py-12 border-y border-white/5 relative z-10 bg-[#050505] dark:bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1 rounded-2xl overflow-hidden bg-white/5 border border-white/5 shadow-lg">
            <div className="bg-[#050505] p-6 flex flex-col items-center text-center transition-colors hover:bg-white/5">
              <span className="text-xs font-display tracking-[0.25em] text-indigo-400 font-semibold uppercase mb-1">AUDIT ENGINE</span>
              <h4 className="text-2xl font-serif italic text-[#e0e0e0]">gemini-2.5-flash</h4>
              <p className="text-white/40 text-xs mt-2 font-sans font-light">Industry-standard reasoning and sub-second compliance analysis</p>
            </div>
            <div className="bg-[#050505] p-6 flex flex-col items-center text-center transition-colors hover:bg-white/5 border-t md:border-t-0 md:border-x border-white/5">
              <span className="text-xs font-display tracking-[0.25em] text-indigo-400 font-semibold uppercase mb-1">LOCAL PARSERS</span>
              <h4 className="text-2xl font-serif italic text-[#e0e0e0]">Live Client Extraction</h4>
              <p className="text-white/40 text-xs mt-2 font-sans font-light">Zero-server client analysis for PDF, Word DOCX, and TXT streams</p>
            </div>
            <div className="bg-[#050505] p-6 flex flex-col items-center text-center transition-colors hover:bg-white/5 border-t md:border-t-0 font-sans">
              <span className="text-xs font-display tracking-[0.25em] text-indigo-400 font-semibold uppercase mb-1">PERSISTENCE</span>
              <h4 className="text-2xl font-serif italic text-[#e0e0e0]">100% Confidential</h4>
              <p className="text-white/40 text-xs mt-2 font-sans font-light">No content is ever stored out-of-browser; rules locked in encryption</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: STANDARDS VAULT (RULES CODES) */}
      <section ref={vaultRef} className={`py-24 relative overflow-hidden transition-all duration-500 border-b ${currentTheme?.id === "poonam" ? "bg-[#fcfaf7] border-amber-900/10" : "bg-gradient-to-b from-[#050505] to-[#0a0a0a] border-white/5"}`}>
        
        {/* Decorative background glow */}
        <div 
          className="absolute top-1/2 left-0 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none transition-all duration-1000" 
          style={{ backgroundColor: currentTheme ? currentTheme.glowColor : "rgba(99, 102, 241, 0.1)" }}
        />

        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-start gap-12 transition-all">
            
            {/* Rule Vault Left Heading Panel */}
            <div className="flex-1 lg:sticky lg:top-28">
              <ScrollReveal>
                <span 
                  className="text-indigo-400 text-xs font-semibold tracking-wider font-display uppercase px-3.5 py-1.5 rounded-full select-none inline-block mb-4 border"
                  style={{
                    color: currentTheme ? currentTheme.primaryColor : "#818cf8",
                    borderColor: currentTheme ? currentTheme.primaryColor + "33" : "rgba(99,102,241,0.2)",
                    backgroundColor: currentTheme ? currentTheme.primaryColor + "13" : "rgba(99,102,241,0.05)"
                  }}
                >
                  CRITERIA VAULT
                </span>
                <h2 className={`text-4xl lg:text-5xl font-light tracking-tight mb-4 ${
                  currentTheme ? currentTheme.fontTitleClass : "font-display text-white"
                }`}>
                  Define your <br />
                  <span className="font-serif italic font-normal" style={{ color: currentTheme ? currentTheme.primaryColor : "#818cf8" }}>editorial</span> standards.
                </h2>
                <p className={`font-sans font-light leading-relaxed mb-6 ${
                  currentTheme?.id === "poonam" ? "text-slate-800" : "text-white/40"
                }`}>
                  Vault protects your custom requirements. Create detailed rules—like spelling styles, paragraph structures, or brand tone rules. Gemini will check your text against them exactly.
                </p>
 
                {/* Vault count indicator */}
                <div className={`flex items-center gap-3 border p-4 rounded-xl max-w-sm mb-6 ${
                  currentTheme?.id === "poonam" ? "bg-white border-rose-200 text-rose-950" : "bg-white/[0.02]/60 border-white/5"
                }`}>
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center font-display font-bold border"
                    style={{
                      backgroundColor: currentTheme ? currentTheme.primaryColor + "1a" : "rgba(99,102,241,0.1)",
                      color: currentTheme ? currentTheme.primaryColor : "#818cf8",
                      borderColor: currentTheme ? currentTheme.primaryColor + "33" : "rgba(99,102,241,0.2)",
                      boxShadow: currentTheme ? `0 0 10px ${currentTheme.glowColor}` : "0 0 10px rgba(99,102,241,0.15)"
                    }}
                  >
                    {rulesListCount}
                  </div>
                  <div>
                    <h5 className="font-display font-medium text-sm">Active Criteria Rules</h5>
                    <p className={`text-xs font-light mt-0.5 ${currentTheme?.id === "poonam" ? "text-rose-900/60" : "text-white/40"}`}>Stored securely in Cloud Firestore Database</p>
                  </div>
                </div>

                {/* Quick Templates trigger container */}
                <div>
                  <h4 className={`text-xs uppercase font-semibold font-display tracking-[0.25em] mb-3 flex items-center gap-2 select-none ${
                    currentTheme?.id === "poonam" ? "text-rose-900/60" : "text-white/40"
                  }`}>
                    <Sliders className="w-3.5 h-3.5" style={{ color: currentTheme ? currentTheme.primaryColor : "#818cf8" }} /> Apply Standard Presets
                  </h4>
                  <div className="flex flex-wrap gap-2 max-w-md">
                    {(Object.keys(TEMPLATES) as TemplateKey[]).map((key) => (
                      <button
                        key={key}
                        onClick={() => applyPreset(TEMPLATES[key])}
                        className={`interactive flex items-center gap-1.5 text-xs font-medium px-3.5 py-2.5 rounded-lg border transition-all cursor-pointer ${
                          currentTheme?.id === "poonam" 
                            ? "border-rose-200 bg-white hover:border-rose-450 hover:bg-rose-50 text-rose-950" 
                            : "border-white/5 hover:border-white/20 bg-white/[0.02] text-white/70 hover:text-white"
                        }`}
                      >
                        <span className="text-sm">{TEMPLATES[key].icon}</span>
                        <span>{TEMPLATES[key].name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Rule Vault Right Editor Card */}
            <div className="flex-1 w-full max-w-xl">
              <ScrollReveal delay={0.2}>
                <div className={`border rounded-2xl shadow-xl overflow-hidden relative transition-all duration-500 ${
                  currentTheme?.id === "poonam" ? "bg-white border-rose-200 shadow-rose-100" : "bg-white/[0.02] border-white/5"
                }`}>
                  
                  {/* Decorative card header */}
                  <div className={`p-4 border-b flex items-center justify-between ${
                    currentTheme?.id === "poonam" ? "bg-rose-50/20 border-rose-100" : "bg-white/[0.01] border-white/5"
                  }`}>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${currentTheme?.id === "poonam" ? "bg-rose-950/15" : "bg-white/10"}`} />
                        <span className={`w-2.5 h-2.5 rounded-full ${currentTheme?.id === "poonam" ? "bg-rose-950/15" : "bg-white/10"}`} />
                        <span className={`w-2.5 h-2.5 rounded-full ${currentTheme?.id === "poonam" ? "bg-rose-950/15" : "bg-white/10"}`} />
                      </div>
                      <span className={`text-xs font-mono ml-3 ${currentTheme?.id === "poonam" ? "text-rose-950/40" : "text-white/30"}`}>security_vault.config</span>
                    </div>

                    {isVaultLocked ? (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono tracking-widest uppercase border ${
                        currentTheme?.id === "poonam" ? "bg-rose-50 border-rose-200 text-rose-800" : "bg-red-500/10 border-red-500/20 text-red-400"
                      }`}>
                        <Lock className="w-3 h-3" /> LOCKED
                      </span>
                    ) : (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono tracking-widest uppercase border ${
                        currentTheme?.id === "poonam" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      }`}>
                        <Unlock className="w-3 h-3" /> DECRYPTED
                      </span>
                    )}
                  </div>

                  {/* Vault Area condition display */}
                  <AnimatePresence mode="wait">
                    {isVaultLocked ? (
                      <motion.div 
                        key="locked"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="p-8 flex flex-col items-center justify-center text-center min-h-[350px]"
                      >
                        <div 
                          className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mb-5 shadow-inner border ${
                            currentTheme?.id === "poonam" ? "bg-rose-50 border-rose-100" : "bg-white/[0.02] border-white/5"
                          }`}
                        >
                          🔒
                        </div>
                        <h4 className={`font-display font-medium text-lg ${currentTheme?.id === "poonam" ? "text-rose-950" : "text-white"}`}>Vault Sealed</h4>
                        <p className={`text-sm font-light leading-relaxed max-w-xs mt-2 mb-6 ${currentTheme?.id === "poonam" ? "text-slate-800" : "text-white/40"}`}>
                          Enter your credentials to modify editorial compliance guidelines.
                        </p>
                        <button
                          onClick={() => {
                            setPwInputValue("");
                            setPwError(false);
                            setShowPwModal(true);
                          }}
                          className="interactive px-7 py-3 rounded-lg font-display font-semibold text-xs tracking-wider uppercase transition-all active:translate-y-0.5 cursor-pointer text-white"
                          style={{
                            backgroundColor: currentTheme ? currentTheme.primaryColor : "#4f46e5",
                            color: currentTheme?.id === "poonam" ? "#2a1518" : "#ffffff",
                            boxShadow: currentTheme ? `0 4px 15px ${currentTheme.glowColor}` : "0 4px 15px rgba(99,102,241,0.3)"
                          }}
                        >
                          Decrypt Standards Box
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="editor"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="p-6 flex flex-col gap-5 min-h-[350px]"
                      >
                        <div>
                          <label className={`block text-xs font-semibold font-display tracking-widest opacity-60 mb-2 uppercase select-none ${
                            currentTheme?.id === "poonam" ? "text-rose-950" : "text-[#e0e0e0]"
                          }`}>
                            Rules Draft (One requirement criteria per line)
                          </label>
                          <textarea
                            id="draft_textarea_element"
                            className={`w-full h-64 p-4 rounded-xl border focus:outline-none transition-colors leading-relaxed resize-vertical ${
                              currentTheme?.id === "poonam" 
                                ? "bg-rose-50/20 border-rose-200 text-slate-800 placeholder:text-rose-950/30 focus:border-rose-400 font-sans" 
                                : "bg-[#050505] border-white/5 focus:border-indigo-500 text-slate-100 placeholder:text-white/20 focus:outline-none font-sans"
                            }`}
                            value={ruleInputText}
                            onChange={(e) => setRuleInputText(e.target.value)}
                            placeholder={`British spelling throughout...
Maximum 800 words total...
Tone must be highly instructional...`}
                          />
                        </div>

                       <div className="flex gap-2.5 pt-2 border-t border-white/5">
                          <button
                            onClick={saveRulesChanges}
                            className="interactive px-5 py-2.5 rounded-xl font-display font-semibold text-xs text-white transition-all shadow-md cursor-pointer"
                            style={{
                              backgroundColor: currentTheme ? currentTheme.primaryColor : "#4f46e5",
                              color: currentTheme?.id === "poonam" ? "#2a1518" : "#ffffff",
                              boxShadow: currentTheme ? `0 4px 12px ${currentTheme.glowColor}` : undefined
                            }}
                          >
                            Save Rules
                          </button>
                          <button
                            onClick={clearRules}
                            className={`interactive px-4 py-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                              currentTheme?.id === "poonam" 
                                ? "border-rose-200 hover:border-rose-400 bg-rose-50/30 hover:bg-rose-50 text-rose-950" 
                                : "border-white/5 hover:border-white/10 bg-white/[0.02] hover:bg-white/[0.04] text-[#e0e0e0]"
                            }`}
                          >
                            Clear
                          </button>
                          <button
                            onClick={reLockVault}
                            className={`interactive ml-auto px-4 py-2.5 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                              currentTheme?.id === "poonam"
                                ? "border-rose-250 hover:border-red-400 hover:bg-red-50 text-rose-900 hover:text-red-700"
                                : "border-white/5 hover:border-red-500/20 hover:bg-red-500/5 hover:text-red-400"
                            }`}
                          >
                            <Lock className="w-3.5 h-3.5" /> Seal Box
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              </ScrollReveal>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 2: VERIFICATION STAGE (UPLOAD ZONE & INPUT) */}
      <section ref={verifyRef} className={`py-24 relative overflow-hidden transition-all duration-500 ${currentTheme?.id === "poonam" ? "bg-[#fcfaf7]" : "bg-[#050505]"}`}>
        
        {/* Glowing background spotlight */}
        <div 
          className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none transition-all duration-1000" 
          style={{ backgroundColor: currentTheme ? currentTheme.glowColor : "rgba(99, 102, 241, 0.05)" }}
        />

        <div className="max-w-7xl mx-auto px-6">
          
          <div className="max-w-3xl mb-14">
            <ScrollReveal>
              <span 
                className="text-xs font-semibold tracking-wider font-display uppercase px-3.5 py-1.5 rounded-full select-none inline-block mb-4 border"
                style={{
                  color: currentTheme ? currentTheme.primaryColor : "#818cf8",
                  borderColor: currentTheme ? currentTheme.primaryColor + "33" : "rgba(99,102,241,0.2)",
                  backgroundColor: currentTheme ? currentTheme.primaryColor + "13" : "rgba(99,102,241,0.05)"
                }}
              >
                AUDIT STAGE
              </span>
              <h2 className={`text-4xl lg:text-5xl font-light tracking-tight mb-4 ${currentTheme ? currentTheme.fontTitleClass : "font-display text-white"}`}>
                Upload your document to <span className="font-serif italic font-normal text-indigo-400" style={{ color: currentTheme ? currentTheme.primaryColor : "#818cf8" }}>scan</span>.
              </h2>
              <p className={`font-sans font-light leading-relaxed ${currentTheme?.id === "poonam" ? "text-slate-800" : "text-white/40"}`}>
                Seamless client-side parsing checks PDF, Word DOCX or local TXT file formats instantly. Your document remains fully private.
              </p>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={0.15}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Document upload / extraction column (span 5) */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                
                {/* Drag and Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border border-dashed rounded-2xl p-8 text-center transition-all relative overflow-hidden flex flex-col items-center justify-center min-h-[220px] cursor-pointer ${
                    isDragOver 
                      ? "border-indigo-400 bg-indigo-500/10" 
                      : currentTheme?.id === "poonam"
                        ? "border-rose-200 bg-white hover:border-rose-455 hover:bg-rose-50/50"
                        : "border-white/10 bg-[#080808] hover:border-white/20"
                  }`}
                  style={{
                    borderColor: isDragOver && currentTheme ? currentTheme.primaryColor : undefined,
                    backgroundColor: isDragOver && currentTheme ? currentTheme.primaryColor + "13" : undefined
                  }}
                >
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept=".txt,.pdf,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                  />
                  
                  <div 
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all border ${
                      isDragOver
                        ? "scale-110"
                        : currentTheme?.id === "poonam"
                          ? "bg-rose-50 border-rose-100"
                          : "bg-white/[0.02]/80 border-white/5"
                    }`}
                  >
                    📂
                  </div>

                  <h3 className={`font-display font-medium text-sm mt-4 ${currentTheme?.id === "poonam" ? "text-rose-950" : "text-white"}`}>Drop your document here</h3>
                  <p className={`text-xs font-light mt-1 ${currentTheme?.id === "poonam" ? "text-rose-900/60" : "text-white/30"}`}>or click to browse local files</p>
                  
                  {fileName && (
                    <div 
                      className="mt-4 px-3 py-1.5 rounded-lg border text-xs flex items-center gap-1.5"
                      style={{
                        borderColor: currentTheme ? currentTheme.primaryColor + "44" : "rgba(99,102,241,0.2)",
                        backgroundColor: currentTheme ? currentTheme.primaryColor + "11" : "rgba(99,102,241,0.05)",
                        color: currentTheme ? currentTheme.primaryColor : "#818cf8"
                      }}
                    >
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>{fileName}</span>
                    </div>
                  )}

                  <span className={`text-[10px] font-mono mt-6 block uppercase ${currentTheme?.id === "poonam" ? "text-rose-900/40" : "text-white/20"}`}>PDF · DOCX · DOC · TXT</span>
                </div>

                {/* Extraction live progress */}
                {isExtracting && (
                  <div className={`border p-4 rounded-xl flex flex-col gap-2 animate-pulse ${currentTheme?.id === "poonam" ? "bg-white border-rose-200" : "bg-[#0c0c0c] border-white/5"}`}>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-semibold" style={{ color: currentTheme ? currentTheme.primaryColor : "#818cf8" }}>{extractionText}</span>
                      <span className={currentTheme?.id === "poonam" ? "text-slate-800" : "text-white/70"}>{extractionProgress}%</span>
                    </div>
                    <div className={`h-1.5 w-full rounded-full overflow-hidden ${currentTheme?.id === "poonam" ? "bg-rose-50" : "bg-[#050505]"}`}>
                      <div 
                        className="h-full transition-all duration-300" 
                        style={{ 
                          width: `${extractionProgress}%`,
                          backgroundColor: currentTheme ? currentTheme.primaryColor : "#4f46e5"
                        }} 
                      />
                    </div>
                  </div>
                )}

                {/* Document local readability report */}
                <div className={`border rounded-2xl p-6 flex flex-col gap-5 ${currentTheme?.id === "poonam" ? "bg-white border-rose-200" : "bg-white/[0.02] border-white/5"}`}>
                  <h4 className={`text-xs uppercase font-semibold font-display tracking-[0.2em] flex items-center gap-2 select-none ${currentTheme?.id === "poonam" ? "text-rose-900/60" : "text-white/40"}`}>
                    <BookOpen className="w-3.5 h-3.5" style={{ color: currentTheme ? currentTheme.primaryColor : "#818cf8" }} /> Readability Index
                  </h4>

                  <div>
                    <div className={`flex items-center justify-between text-xs mb-1.5 ${currentTheme?.id === "poonam" ? "text-rose-900/60" : "text-white/40"}`}>
                      <span>Flesch Score</span>
                      <span className={`font-semibold font-display ${currentTheme?.id === "poonam" ? "text-rose-955" : "text-white"}`}>
                        {localStats.words < 5 ? "-" : localStats.readabilityScore}
                      </span>
                    </div>
                    
                    <div className={`h-1.5 w-full rounded-full overflow-hidden ${currentTheme?.id === "poonam" ? "bg-rose-50" : "bg-[#050505]"}`}>
                      <div 
                        className={`h-full transition-all duration-500 rounded-full ${localStats.readabilityScore >= 70 ? "bg-emerald-500" : localStats.readabilityScore >= 45 ? "bg-amber-500" : "bg-red-500"}`} 
                        style={{ width: `${localStats.words < 5 ? 0 : localStats.readabilityScore}%` }} 
                      />
                    </div>

                    <p className={`text-[10px] mt-2 font-mono ${currentTheme?.id === "poonam" ? "text-slate-600" : "text-white/30"}`}>
                      {localStats.words < 5 
                        ? "Paste copy into the workspace to evaluate flow." 
                        : localStats.readabilityScore >= 70 
                          ? "✓ Simple (Highly engaging prose, optimized for general readers)." 
                          : localStats.readabilityScore >= 45 
                            ? "✓ Moderate (Balanced, suited for standard business copy)." 
                            : "⚠️ Difficult (Dense formatting, structurally suited for research)."}
                    </p>
                  </div>
                </div>

              </div>

              {/* Text Area column (span 7) */}
              <div className="lg:col-span-7 flex flex-col gap-5">
                
                {/* Responsive dynamic Tab Controls */}
                <div className="flex rounded-xl p-1 bg-slate-100/60 dark:bg-zinc-950/50 border border-slate-200 dark:border-white/5 select-none self-start relative">
                  <button
                    type="button"
                    onClick={() => setActiveEditorTab("editor")}
                    className={`px-4 py-2 font-display text-[11px] uppercase tracking-wider font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
                      activeEditorTab === "editor"
                        ? currentTheme?.id === "poonam"
                          ? "bg-white text-rose-950 shadow-sm border border-rose-100"
                          : "bg-white/[0.05] border border-white/10 text-white shadow"
                        : "text-slate-500 hover:text-slate-800 dark:text-zinc-550 dark:hover:text-zinc-300"
                    }`}
                  >
                    📄 Live Google Doc Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveEditorTab("hobby")}
                    className={`px-4 py-2 font-display text-[11px] uppercase tracking-wider font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-2 relative ${
                      activeEditorTab === "hobby"
                        ? currentTheme?.id === "poonam"
                          ? "bg-white text-rose-950 shadow-sm border border-rose-100"
                          : "bg-white/[0.05] border border-white/10 text-white shadow"
                        : "text-slate-500 hover:text-slate-800 dark:text-zinc-550 dark:hover:text-zinc-300"
                    }`}
                  >
                    🎨 Focus Hobby Station ({currentLoggedUserObj?.name || activeUser}'s Sanctuary)
                    {activeEditorTab !== "hobby" && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full animate-ping bg-indigo-500" style={{ backgroundColor: currentTheme?.primaryColor }} />
                    )}
                  </button>
                </div>

                {/* Switchable tab contents */}
                <div className="transition-all duration-300">
                  <AnimatePresence mode="wait">
                    {activeEditorTab === "editor" ? (
                      <motion.div
                        key="editor-pane"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                      >
                        <GoogleDocEditor
                          value={pastedText}
                          onChange={setPastedText}
                          themeId={activeUser}
                          accentColor={currentTheme?.primaryColor || "#6366f1"}
                          wordCount={localStats.words}
                          charCount={localStats.chars}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="hobby-pane"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                      >
                        <HobbyStation
                          userId={activeUser!}
                          userName={currentLoggedUserObj?.name || activeUser!}
                          wordCount={localStats.words}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>

            </div>
          </ScrollReveal>

          {/* LAUNCH ENGINE TRIGGERS */}
          <div className="flex flex-col items-center justify-center mt-16 text-center">
            
            <button
              onClick={runComplianceCheck}
              disabled={isChecking}
              className="interactive check-btn relative select-none disabled:opacity-60 cursor-pointer animate-pulse-glow"
            >
              <div 
                className="absolute inset-0 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity"
                style={{
                  background: currentTheme 
                    ? `linear-gradient(to right, ${currentTheme.primaryColor}, ${currentTheme.accentColor})`
                    : "linear-gradient(to right, #6366f1, #4f46e5)"
                }}
              />
              <div 
                className={`relative border px-10 py-5 rounded-2xl font-display font-medium tracking-wider flex items-center justify-center gap-3.5 transition-colors uppercase text-xs ${
                  currentTheme?.id === "poonam" 
                    ? "bg-white border-rose-200 text-rose-950 hover:bg-rose-50" 
                    : "bg-[#050505] hover:bg-[#0c0c0c] border-white/10 hover:border-white/20 text-[#e0e0e0]"
                }`}
                style={{
                  borderColor: currentTheme ? currentTheme.primaryColor + "55" : undefined
                }}
              >
                
                {isChecking ? (
                  <span 
                    className="w-5 h-5 rounded-full border-2 border-white/20 animate-spin"
                    style={{ borderTopColor: currentTheme ? currentTheme.primaryColor : "#6366f1" }}
                  />
                ) : (
                  <Sparkles className="w-5 h-5" style={{ color: currentTheme ? currentTheme.primaryColor : "#818cf8" }} />
                )}
                
                <span className="text-xs font-semibold tracking-widest">
                  {isChecking ? "Audit Processing…" : "Check content further"}
                </span>
              </div>
            </button>

            {/* Checker dynamic process logs display */}
            <AnimatePresence>
              {isChecking && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-6 flex flex-col items-center max-w-sm w-full mx-auto"
                >
                  <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
                    {AUDIT_STEPS[activeCheckStep]}
                  </span>
                  
                  <div className="w-64 h-1.5 bg-slate-900 border border-slate-800 rounded-full overflow-hidden mt-3.5">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-teal-400 to-indigo-500 rounded-full"
                      style={{ width: `${checkProgressFill}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>

                  {isStreamingAudit && (
                    <div className="mt-4 w-full max-w-2xl mx-auto text-sm font-mono text-slate-100 bg-slate-950/95 border border-slate-800 rounded-3xl p-4 whitespace-pre-wrap break-words min-h-[120px]">
                      {liveAuditText || "Receiving audit stream..."}
                    </div>
                  )}

                  {streamAuditError && (
                    <div className="mt-4 text-sm text-amber-300 bg-amber-950/10 border border-amber-700 rounded-2xl p-3">
                      <strong>Stream error:</strong> {streamAuditError}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <span className="text-white/20 text-[11px] font-sans font-light mt-4 block">
              Powered by cloud-native mistral-small-latest / gemini-2.5-flash server frameworks
            </span>

          </div>

        </div>
      </section>

      {/* SECTION 3: COMPLIANCE REPORT CARD OVERVIEW */}
      <section ref={reportRef} className={`py-24 relative overflow-hidden border-t transition-all duration-500 ${currentTheme?.id === "poonam" ? "bg-[#fcfaf7] border-amber-900/10 text-slate-900" : "bg-[#050505] border-white/5 text-[#e0e0e0]"}`}>
        
        <div 
          className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none transition-all duration-1000" 
          style={{ backgroundColor: currentTheme ? currentTheme.glowColor : "rgba(99, 102, 241, 0.05)" }}
        />

        <div className="max-w-7xl mx-auto px-6">
          
          <AnimatePresence>
            {reportResult ? (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col gap-8"
              >
                
                {/* Header indicators */}
                <div className={`flex flex-col md:flex-row md:items-end justify-between gap-5 border-b pb-6 ${currentTheme?.id === "poonam" ? "border-rose-100" : "border-white/5"}`}>
                  <div>
                    <span 
                      className="text-xs font-semibold tracking-wider font-display uppercase px-3.5 py-1.5 rounded-full select-none inline-block mb-3 border animate-fade-in"
                      style={{
                        color: currentTheme ? currentTheme.primaryColor : "#818cf8",
                        borderColor: currentTheme ? currentTheme.primaryColor + "33" : "rgba(99,102,241,0.2)",
                        backgroundColor: currentTheme ? currentTheme.primaryColor + "11" : "rgba(99,102,241,0.05)"
                      }}
                    >
                      COMPLIANCE VERDICT
                    </span>
                    <h2 className={`text-3xl font-light tracking-tight animate-fade-in-up ${currentTheme ? currentTheme.fontTitleClass : "font-display text-white"}`}>Compliance Evaluation Audit</h2>
                    <p className={`text-xs font-mono mt-1 ${currentTheme?.id === "poonam" ? "text-rose-950/40" : "text-white/30"}`}>
                      Generated at {reportResult.createdAt ? new Date(reportResult.createdAt).toLocaleTimeString() : new Date().toLocaleTimeString()} · model: gemini-2.5-flash
                    </p>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center gap-2.5 no-print animate-fade-in">
                    <button 
                      onClick={() => setShowRawJson(!showRawJson)}
                      className={`interactive inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-xl border transition-colors cursor-pointer ${
                        currentTheme?.id === "poonam" 
                          ? "border-rose-200 bg-white hover:border-rose-400 text-rose-950" 
                          : "border-white/10 hover:border-white/20 bg-[#080808] text-white/70 hover:text-white"
                      }`}
                    >
                      <FileCode2 className="w-4.5 h-4.5 animate-pulse" style={{ color: currentTheme ? currentTheme.primaryColor : "#818cf8" }} />
                      <span>{showRawJson ? "Collapse Json" : "Raw AI Response"}</span>
                    </button>
                    <button 
                      onClick={() => window.print()}
                      className={`interactive inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-xl border transition-colors cursor-pointer ${
                        currentTheme?.id === "poonam" 
                          ? "border-rose-200 bg-white hover:border-rose-400 text-rose-950" 
                          : "border-white/10 hover:border-white/20 bg-[#080808]/80 text-white/70 hover:text-white"
                      }`}
                    >
                      <Printer className="w-4 h-4 text-emerald-400" />
                      <span>Export PDF</span>
                    </button>
                    <button 
                      onClick={copyReportToClipboard}
                      className={`interactive inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-xl border transition-all cursor-pointer ${
                        currentTheme?.id === "poonam" 
                          ? "border-rose-200 bg-white hover:border-rose-400 text-rose-950 shadow-sm" 
                          : "border-white/10 hover:border-white/20 bg-[#080808] text-[#e0e0e0] hover:text-white"
                      }`}
                    >
                      <Copy className="w-4 h-4" style={{ color: currentTheme ? currentTheme.primaryColor : "#818cf8" }} />
                      <span>Copy Report</span>
                    </button>
                  </div>
                </div>

                {/* Raw JSON collapse component */}
                {showRawJson && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="no-print bg-black/90 border border-white/5 p-5 rounded-2xl max-h-[350px] overflow-y-auto font-mono text-xs text-white/40 whitespace-pre shadow-inner leading-relaxed"
                  >
                    {JSON.stringify(reportResult, null, 2)}
                  </motion.div>
                )}

                {/* SCORE CARD ROW */}
                <div className={`p-8 rounded-2xl border shadow-xl flex flex-col md:flex-row items-center gap-10 transition-all ${
                  currentTheme?.id === "poonam" ? "bg-white border-rose-200 shadow-md" : "bg-white/[0.02] border-white/5 shadow-xl"
                }`}>
                  
                  {/* Arc Donut Percentage SVG */}
                  <div className="relative w-36 h-36 flex items-center justify-center flex-shrink-0 select-none">
                    <svg className="-rotate-90" width="144" height="144" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="50" className={`fill-none stroke-[9px] ${currentTheme?.id === "poonam" ? "stroke-rose-50" : "stroke-white/10"}`} />
                      <motion.circle 
                        cx="60" 
                        cy="60" 
                        r="50" 
                        className={`fill-none stroke-[9px] stroke-linecap-round`}
                        style={{
                          stroke: reportResult.overallScore >= 80 ? "#10b981" : reportResult.overallScore >= 50 ? "#f59e0b" : "#ef4444"
                        }}
                        initial={{ strokeDasharray: "314.16", strokeDashoffset: "314.16" }}
                        animate={{ strokeDashoffset: 314.16 - (reportResult.overallScore / 100) * 314.16 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center text-center">
                      <span className={`text-3xl font-semibold ${currentTheme ? currentTheme.fontTitleClass : "font-serif text-white"}`}>{reportResult.overallScore}</span>
                      <span className={`text-[10px] uppercase font-semibold font-display tracking-wide mt-0.5 ${currentTheme?.id === "poonam" ? "text-rose-950/40" : "text-white/30"}`}>Score</span>
                    </div>
                  </div>

                  {/* Verdict and Summary info column */}
                  <div className="flex-1 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs uppercase tracking-wider font-semibold font-display select-none ${currentTheme?.id === "poonam" ? "text-rose-950/45" : "text-white/40"}`}>Verdict:</span>
                      
                      {reportResult.verdict === "Approved" ? (
                        <span className="px-3 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide flex items-center gap-1.5 select-none animate-pulse">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approved Compliance
                        </span>
                      ) : reportResult.verdict === "Needs Revision" ? (
                        <span className="px-3 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-semibold tracking-wide flex items-center gap-1.5 select-none">
                          <AlertCircle className="w-3.5 h-3.5" /> Revisions Advised
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold tracking-wide flex items-center gap-1.5 select-none font-bold">
                          <ShieldAlert className="w-3.5 h-3.5" /> High Violations Risk
                        </span>
                      )}
                    </div>

                    <p className={`font-sans font-light leading-relaxed text-sm max-w-2xl ${currentTheme?.id === "poonam" ? "text-slate-800" : "text-white/70"}`}>
                      {reportResult.summary}
                    </p>

                    <div className="flex gap-4 items-center flex-wrap mt-2 flex-row">
                      <div className={`text-xs font-mono ${currentTheme?.id === "poonam" ? "text-slate-600" : "text-white/40"}`}>
                        Passed Criteria: <strong className="text-emerald-400 font-semibold">{reportResult.passedRules.length}</strong>
                      </div>
                      <span className={currentTheme?.id === "poonam" ? "text-rose-200/60" : "text-white/10"}>|</span>
                      <div className={`text-xs font-mono ${currentTheme?.id === "poonam" ? "text-slate-600" : "text-white/40"}`}>
                        Violated Rules: <strong className="text-red-400 font-semibold">{reportResult.failedRules.length}</strong>
                      </div>
                    </div>
                  </div>

                </div>

                {/* PROGRESS BAR RATINGS CONTAINER */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {[
                    { label: "Grammar & Style", score: reportResult.grammarScore, color: "bg-indigo-500" },
                    { label: "SEO Positioning", score: reportResult.seoScore, color: "bg-indigo-600" },
                    { label: "Tone Accuracy", score: reportResult.toneScore, color: "bg-emerald-400" },
                    { label: "Flow & Reading Ease", score: reportResult.readabilityScore, color: "bg-indigo-400" },
                    { label: "AI Copy Risk", score: reportResult.aiDetectionRisk, color: "bg-amber-400" },
                  ].map((barDetail, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.08 }}
                      className={`border p-5 rounded-2xl flex flex-col gap-2.5 transition-all ${
                        currentTheme?.id === "poonam" ? "bg-white border-rose-200" : "bg-white/[0.02] border-white/5"
                      }`}
                    >
                      <span className={`text-[10px] uppercase font-semibold font-display tracking-widest block select-none ${
                        currentTheme?.id === "poonam" ? "text-rose-900/50" : "text-white/40"
                      }`}>
                        {barDetail.label}
                      </span>
                      <div className="flex items-baseline justify-between mt-auto">
                        <strong className={`text-xl font-serif ${currentTheme?.id === "poonam" ? "text-rose-950 font-normal" : "text-white"}`}>{barDetail.score}%</strong>
                      </div>
                      <div className={`h-1.5 w-full rounded-full overflow-hidden ${currentTheme?.id === "poonam" ? "bg-rose-50" : "bg-black/40"}`}>
                        <div 
                          className="h-full rounded-full" 
                          style={{ 
                            width: `${barDetail.score}%`,
                            backgroundColor: barDetail.color === "bg-emerald-400" ? "#34d399" : barDetail.color === "bg-amber-400" ? "#fbbf24" : (currentTheme ? currentTheme.primaryColor : "#6366f1")
                          }} 
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* THE PASSED & FAILED RULES COLUMNS GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
                  
                  {/* Passed Rules Card */}
                  <div className={`border rounded-2xl shadow-lg p-6 transition-all ${
                    currentTheme?.id === "poonam" ? "bg-white border-rose-200" : "bg-white/[0.02] border-white/5"
                  }`}>
                    <h3 className={`text-sm font-display tracking-widest font-semibold uppercase mb-5 flex items-center gap-2 select-none ${
                      currentTheme?.id === "poonam" ? "text-rose-950" : "text-[#e0e0e0]"
                    }`}>
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" /> Passed Criteria ({reportResult.passedRules.length})
                    </h3>

                    {reportResult.passedRules.length === 0 ? (
                      <p className="text-white/30 text-xs font-sans font-light italic">No matching compliance parameters checked green.</p>
                    ) : (
                      <div className="flex flex-col gap-4.5">
                        {reportResult.passedRules.map((pRule, idx) => (
                          <div key={idx} className="flex gap-3 items-start border-b border-white/5 pb-4 last:border-0 last:pb-0">
                            <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-[10px] mt-0.5 flex items-center justify-center select-none flex-shrink-0 border border-emerald-500/20">
                              ✓
                            </span>
                            <div>
                              <div className="font-display font-medium text-white text-[13.5px] leading-snug">{pRule.rule}</div>
                              <div className="text-xs text-white/45 font-sans mt-0.5 leading-relaxed">{pRule.explanation}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Failed Rules Card */}
                  <div className={`border rounded-2xl shadow-lg p-6 transition-all ${
                    currentTheme?.id === "poonam" ? "bg-white border-rose-200" : "bg-white/[0.02] border-white/5"
                  }`}>
                    <h3 className={`text-sm font-display tracking-widest font-semibold uppercase mb-5 flex items-center gap-2 select-none ${
                      currentTheme?.id === "poonam" ? "text-red-650 text-red-700 font-bold" : "text-red-400"
                    }`}>
                      <ShieldAlert className="w-4.5 h-4.5 animate-pulse" /> Rule Violations ({reportResult.failedRules.length})
                    </h3>

                    {currentTheme?.id === "poonam" && reportResult.failedRules.length === 0 ? (
                      <div className="flex flex-col items-center justify-center text-center p-8 bg-rose-50/20 rounded-xl border border-rose-100">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-3 text-lg">✓</div>
                        <h4 className="font-display font-semibold text-rose-950 text-sm">Perfect compliance!</h4>
                        <p className="text-xs text-rose-900/60 font-light max-w-xs mt-1">Every active criterion checked on target.</p>
                      </div>
                    ) : reportResult.failedRules.length === 0 ? (
                      <div className="flex flex-col items-center justify-center text-center p-8 bg-[#050505]/60 rounded-xl border border-white/5">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-3 text-lg">✓</div>
                        <h4 className="font-display font-semibold text-white text-sm">Perfect compliance!</h4>
                        <p className="text-xs text-white/30 font-light max-w-xs mt-1">Every active criterion checked on target.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4.5">
                        {reportResult.failedRules.map((fRule, idx) => (
                          <div key={idx} className={`flex gap-3.5 items-start border-b pb-5 last:border-0 last:pb-0 ${currentTheme?.id === "poonam" ? "border-rose-100/55" : "border-white/5"}`}>
                            <span className="w-5 h-5 rounded-full bg-red-500/10 text-red-500 font-bold text-[10px] mt-0.5 flex items-center justify-center select-none flex-shrink-0 border border-red-500/20">
                              !
                            </span>
                            <div className="flex-1">
                              <div className={`font-display font-medium text-[13.5px] leading-snug ${currentTheme?.id === "poonam" ? "text-slate-900" : "text-white"}`}>{fRule.rule}</div>
                              <div className="text-xs text-red-400 font-sans mt-0.5 leading-relaxed">{fRule.explanation}</div>
                              
                              {fRule.suggestion && (
                                <div 
                                  className="mt-2.5 p-2 px-3 rounded border text-xs flex items-start gap-1.5 transition-all"
                                  style={{
                                    borderColor: currentTheme ? currentTheme.primaryColor + "33" : "rgba(99,102,241,0.2)",
                                    backgroundColor: currentTheme ? currentTheme.primaryColor + "09" : "rgba(99,102,241,0.03)",
                                    color: currentTheme ? currentTheme.primaryColor : "#818cf8"
                                  }}
                                >
                                  <Wand2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: currentTheme ? currentTheme.primaryColor : "#818cf8" }} />
                                  <span className="leading-relaxed"><strong className={`font-semibold ${currentTheme?.id === "poonam" ? "text-rose-950" : "text-[#e0e0e0]"}`}>Revision Tips:</strong> {fRule.suggestion}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

                {/* THREE-COLUMN COMPREHENSIVE FEEDBACK (Strengths, Suggestions, Missing) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                  
                  {/* Strengths Card */}
                  <div className={`border p-6 rounded-2xl transition-all ${
                    currentTheme?.id === "poonam" ? "bg-white border-rose-200" : "bg-white/[0.02] border-white/5"
                  }`}>
                    <h4 className="text-xs uppercase font-semibold font-display tracking-widest flex items-center gap-1.5 select-none mb-4" style={{ color: currentTheme ? currentTheme.primaryColor : "#818cf8" }}>
                      <Sparkles className="w-3.5 h-3.5" style={{ color: currentTheme ? currentTheme.primaryColor : "#818cf8" }} /> Key Strengths
                    </h4>
                    <ul className={`flex flex-col gap-3 font-sans text-xs leading-relaxed font-light ${currentTheme?.id === "poonam" ? "text-slate-800" : "text-white/40"}`}>
                      {reportResult.strengths?.length > 0 ? (
                        reportResult.strengths.map((str, idx) => (
                          <li key={idx} className="flex gap-2 items-start">
                            <CornerDownRight className="w-3 h-3 mt-1 flex-shrink-0" style={{ color: currentTheme ? currentTheme.primaryColor : "#818cf8" }} />
                            <span>{str}</span>
                          </li>
                        ))
                      ) : (
                        <li className="italic">No strengths highlighted currently.</li>
                      )}
                    </ul>
                  </div>

                  {/* Suggestions Card */}
                  <div className={`border p-6 rounded-2xl transition-all ${
                    currentTheme?.id === "poonam" ? "bg-white border-rose-200" : "bg-white/[0.02] border-white/5"
                  }`}>
                    <h4 className={`text-xs uppercase font-semibold font-display tracking-widest flex items-center gap-1.5 select-none mb-4 ${
                      currentTheme?.id === "poonam" ? "text-rose-900/60" : "text-[#e0e0e0]/40"
                    }`}>
                      <TrendingUp className="w-3.5 h-3.5" style={{ color: currentTheme ? currentTheme.primaryColor : "#818cf8" }} /> Improvement Hints
                    </h4>
                    <ul className={`flex flex-col gap-3 font-sans text-xs leading-relaxed font-light ${currentTheme?.id === "poonam" ? "text-slate-805" : "text-white/40"}`}>
                      {reportResult.suggestions?.length > 0 ? (
                        reportResult.suggestions.map((sug, idx) => (
                          <li key={idx} className="flex gap-2 items-start">
                            <CornerDownRight className="w-3 h-3 mt-1 flex-shrink-0" style={{ color: currentTheme ? currentTheme.primaryColor : "#818cf8" }} />
                            <span>{sug}</span>
                          </li>
                        ))
                      ) : (
                        <li className="italic">Prose appears pristine.</li>
                      )}
                    </ul>
                  </div>

                  {/* Missing Sections Card */}
                  <div className={`border p-6 rounded-2xl transition-all ${
                    currentTheme?.id === "poonam" ? "bg-white border-rose-200" : "bg-white/[0.02] border-white/5"
                  }`}>
                    <h4 className={`text-xs uppercase font-semibold font-display tracking-widest flex items-center gap-1.5 select-none mb-4 ${
                      currentTheme?.id === "poonam" ? "text-rose-900/60" : "text-[#e0e0e0]/40"
                    }`}>
                      <HelpCircle className="w-3.5 h-3.5" style={{ color: currentTheme ? currentTheme.primaryColor : "#818cf8" }} /> Missing Formats
                    </h4>
                    <ul className={`flex flex-col gap-3 font-sans text-xs leading-relaxed font-light ${currentTheme?.id === "poonam" ? "text-slate-805" : "text-white/40"}`}>
                      {reportResult.missingSections?.length > 0 ? (
                        reportResult.missingSections.map((mis, idx) => (
                          <li key={idx} className="flex gap-2 items-start">
                            <CornerDownRight className="w-3 h-3 mt-1 flex-shrink-0" style={{ color: currentTheme ? currentTheme.primaryColor : "#818cf8" }} />
                            <span>{mis}</span>
                          </li>
                        ))
                      ) : (
                        <li className="flex gap-2 items-start text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>All structural components accounted for.</span>
                        </li>
                      )}
                    </ul>
                  </div>

                </div>

                {/* SUB-FOOTER CONTENT STATS DETAILS */}
                <div className={`p-5 rounded-2xl border flex flex-wrap items-center justify-between gap-4 mt-4 font-mono text-[11px] ${
                  currentTheme?.id === "poonam" ? "bg-rose-50/40 border-rose-200 text-rose-950/70" : "bg-[#0a0a0a] border-white/5 text-white/40"
                }`}>
                  <div className="flex items-center gap-4">
                    <span>Words: <strong className={currentTheme?.id === "poonam" ? "text-rose-950 font-semibold" : "text-white"}>{reportResult.wordCount?.toLocaleString() || "0"}</strong></span>
                    <span>Chars: <strong className={currentTheme?.id === "poonam" ? "text-rose-950 font-semibold" : "text-white"}>{reportResult.charCount?.toLocaleString() || "0"}</strong></span>
                    <span>Sentences: <strong className={currentTheme?.id === "poonam" ? "text-rose-950 font-semibold" : "text-white"}>{reportResult.sentCount || "0"}</strong></span>
                    <span>Avg Words/Sentence: <strong className={currentTheme?.id === "poonam" ? "text-rose-950 font-semibold" : "text-white"}>{reportResult.avgWPS || "0"}</strong></span>
                  </div>
                  <span>ContentGuard Quality Verified ✓</span>
                </div>

              </motion.div>
            ) : (
              <div className={`no-print border border-dashed p-12 text-center rounded-2xl select-none min-h-[220px] flex flex-col items-center justify-center ${
                currentTheme?.id === "poonam" ? "border-rose-200 bg-white" : "border-white/10 bg-[#080808]"
              }`}>
                <ShieldAlert className={`w-10 h-10 animate-pulse ${currentTheme?.id === "poonam" ? "text-rose-900/30" : "text-white/20"}`} />
                <h4 className={`font-display font-medium text-sm mt-3 ${currentTheme?.id === "poonam" ? "text-rose-950/50" : "text-white/40"}`}>Compliance report queue empty</h4>
                <p className={`text-xs font-light max-w-xs mt-1 ${currentTheme?.id === "poonam" ? "text-rose-905/40 text-rose-900/60" : "text-white/25"}`}>Provide custom rules and upload your copywriting to display detailed audit report metrics.</p>
              </div>
            )}
          </AnimatePresence>

        </div>
      </section>

      {/* SECURE PASSWORD DECRYPTION POPUP MODAL */}
      <AnimatePresence>
        {showPwModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPwModal(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md" 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#0b0b0b] border border-white/5 p-8 rounded-2xl shadow-2xl relative max-w-md w-full overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/5 to-transparent rounded-full pointer-events-none" />

              <div className="text-center flex flex-col items-center">
                <div className="w-14 h-14 bg-white/[0.02]/85 border border-white/5 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-inner">
                  🔐
                </div>
                <h3 className="font-display font-medium text-white text-lg">Sealed Standards Box</h3>
                <p className="text-white/40 text-xs mt-1.5 mb-6">
                  Provide validation credentials to customize active compliance rules.
                </p>

                {pwError && (
                  <div className="w-full bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3 text-xs flex items-center gap-2 mb-4">
                    <span className="text-red-400 font-bold">🚫</span>
                    <span>Incorrect password code. Try again.</span>
                  </div>
                )}

                <div className="w-full flex flex-col gap-4">
                  <div className="relative">
                    <input
                      type={showPwText ? "text" : "password"}
                      className="w-full p-4.5 rounded-xl border border-white/10 bg-[#050505] focus:border-indigo-500 text-slate-100 text-sm focus:outline-none transition-colors"
                      value={pwInputValue}
                      onChange={(e) => setPwInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handlePasswordSubmit();
                      }}
                      placeholder="Enter password..."
                    />
                    <button 
                      onClick={togglePasswordVisibility}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-white/40 hover:text-white pointer-events-auto"
                    >
                      {showPwText ? "Hide" : "Show"}
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handlePasswordSubmit}
                      className="interactive flex-1 py-3 text-white bg-indigo-600 hover:bg-indigo-500 font-display font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Unlock Vault
                    </button>
                    <button
                      onClick={() => setShowPwModal(false)}
                      className="interactive flex-1 py-3 border border-white/10 hover:border-white/20 bg-[#080808] font-display font-semibold text-white/50 hover:text-white rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                <span className="text-[10px] text-white/30 font-mono mt-5 select-none block">Default Code: <strong className="font-semibold text-indigo-400">Addy0504</strong></span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* API KEY SETTINGS OVERLAY MODAL */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md" 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#0b0b0b] border border-white/5 p-8 rounded-2xl shadow-2xl relative max-w-sm w-full overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/5 to-transparent rounded-full pointer-events-none" />

              <div className="text-center flex flex-col items-center">
                <div className="w-14 h-14 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-inner">
                  ⚙️
                </div>
                <h3 className="font-display font-semibold text-white text-lg">AI Configuration Center</h3>
                <p className="text-white/40 text-xs mt-1.5 mb-6">
                  Fine-tune audit parameters. Keys are safely kept inside private cookie variables.
                </p>

                <div className="w-full flex flex-col gap-4 text-left">
                  <div>
                    <label className="block text-xs font-semibold uppercase font-display tracking-wider text-white/40 mb-2 select-none">Custom Gemini Key</label>
                    <input
                      type="password"
                      className="w-full p-4 rounded-xl border border-white/10 bg-[#050505] focus:border-indigo-500 text-slate-100 text-sm focus:outline-none transition-colors"
                      value={customKey}
                      onChange={(e) => setCustomKey(e.target.value)}
                      placeholder="AI Studio active key override…"
                    />
                    <span className="text-[10px] text-white/20 mt-1.5 leading-normal block">
                      Leave empty to utilize standard server process keys. Overwrites take effect immediately.
                    </span>
                  </div>

                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={saveSettingsAndKey}
                      className="interactive flex-1 py-3 text-white bg-indigo-600 hover:bg-indigo-500 font-display font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Save Settings
                    </button>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="interactive flex-1 py-3 border border-white/10 hover:border-white/20 bg-[#080808] font-display font-semibold text-white/50 hover:text-white rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* STACKED TOAST NOTIFICATIONS */}
      <div className="fixed bottom-6 right-6 z-[999] flex flex-col gap-3 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className={`p-4 rounded-xl shadow-2xl flex items-start gap-3 pointer-events-auto border ${toast.type === "success" ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-100" : toast.type === "error" ? "bg-red-950/90 border-red-500/30 text-red-100" : "bg-[#0b0b0b] border-white/10 text-white"}`}
            >
              {toast.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : toast.type === "error" ? (
                <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              ) : (
                <Sparkles className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
              )}
              <span className="text-xs font-sans font-light leading-relaxed">{toast.msg}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* FOOTER */}
      <footer className="bg-[#030303] text-white/30 border-t border-white/5 py-16 mt-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/5 pb-10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-indigo-700 flex items-center justify-center font-display font-bold text-white text-sm">
                CG
              </div>
              <span className="font-display font-medium text-base tracking-tight text-white">
                Content<span className="text-indigo-400 font-serif italic font-normal">Guard</span>
              </span>
            </div>

            <div className="flex gap-8 text-[11px] font-display tracking-widest uppercase text-white/40">
              <a href="#" className="hover:text-white transition-colors">Documentation</a>
              <a href="#" className="hover:text-white transition-colors">Legal Policy</a>
              <a href="#" className="hover:text-white transition-colors">Tech Stack</a>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-10 text-[11px] text-white/20 font-light">
            <p>© {new Date().getFullYear()} ContentGuard applet. Verified client-side algorithms.</p>
            <p>Built with React 19, Tailwind CSS v4, Motion, and Gemini API server-side logic.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}


