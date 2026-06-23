import React, { useState, useRef } from "react";
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify, 
  List, 
  ListOrdered, 
  Trash2, 
  Copy, 
  Heading1, 
  Heading2, 
  Heading3,
  Undo2,
  Sparkles,
  SearchCode,
  LayoutTemplate
} from "lucide-react";

interface GoogleDocEditorProps {
  value: string;
  onChange: (val: string) => void;
  themeId: string;
  accentColor: string;
  wordCount: number;
  charCount: number;
}

export default function GoogleDocEditor({
  value,
  onChange,
  themeId,
  accentColor,
  wordCount,
  charCount
}: GoogleDocEditorProps) {
  const [fontFamily, setFontFamily] = useState("font-serif");
  const [fontSize, setFontSize] = useState("text-base");
  const [alignment, setAlignment] = useState<"left" | "center" | "right" | "justify">("left");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [lineSpacing, setLineSpacing] = useState("leading-relaxed");
  const [paperTheme, setPaperTheme] = useState<"classic" | "ivory" | "charcoal">("classic");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Converts rich HTML (like Google Docs outputs on copy) into Markdown to retain H1/H2 structure
  const convertHtmlToMarkdown = (html: string): string => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      
      const processNode = (node: Node): string => {
        if (node.nodeType === Node.TEXT_NODE) {
          return node.nodeValue || "";
        }
        if (node.nodeType !== Node.ELEMENT_NODE) {
          return "";
        }
        
        const element = node as HTMLElement;
        const tagName = element.tagName.toLowerCase();
        
        let childrenText = "";
        element.childNodes.forEach((child) => {
          childrenText += processNode(child);
        });
        
        // Skip purely empty tags except line breakers
        if (!childrenText.trim() && !["br", "hr", "p"].includes(tagName)) {
          return "";
        }
        
        switch (tagName) {
          case "h1":
            return `\n# ${childrenText.trim()}\n`;
          case "h2":
            return `\n## ${childrenText.trim()}\n`;
          case "h3":
            return `\n### ${childrenText.trim()}\n`;
          case "h4":
            return `\n#### ${childrenText.trim()}\n`;
          case "h5":
            return `\n##### ${childrenText.trim()}\n`;
          case "h6":
            return `\n###### ${childrenText.trim()}\n`;
          case "p":
            // Check if paragraph is actually a header in disguise (sometimes styling holds font-size & font-weight)
            const fw = element.style.fontWeight || "";
            const fsVal = element.style.fontSize || "";
            if (fw === "bold" || parseInt(fw) >= 700) {
              if (fsVal.includes("24") || fsVal.includes("20")) {
                return `\n# ${childrenText.trim()}\n`;
              } else if (fsVal.includes("18") || fsVal.includes("16")) {
                return `\n## ${childrenText.trim()}\n`;
              }
            }
            return `\n${childrenText.trim()}\n`;
          case "a":
            const href = element.getAttribute("href") || "";
            return `[${childrenText.trim()}](${href})`;
          case "strong":
          case "b":
            return `**${childrenText}**`;
          case "em":
          case "i":
            return `*${childrenText}*`;
          case "u":
            return `_${childrenText}_`;
          case "li":
            return `\n- ${childrenText.trim()}`;
          case "ul":
          case "ol":
            return `\n${childrenText}\n`;
          case "br":
            return "\n";
          case "div":
            return `\n${childrenText}\n`;
          default:
            return childrenText;
        }
      };
      
      let markdown = processNode(doc.body);
      // Clean up excessive empty lines
      markdown = markdown.replace(/\r\n/g, "\n")
                         .replace(/\n{3,}/g, "\n\n")
                         .trim();
      return markdown;
    } catch (err) {
      console.warn("Formatting parser failed. Using standard plain text mode.", err);
      return "";
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const html = e.clipboardData.getData("text/html");
    const plainText = e.clipboardData.getData("text/plain");
    
    // Check if the pasted resource carries structured HTML nodes
    if (html && (html.includes("<h1") || html.includes("<h2") || html.includes("<h3") || html.includes("<p") || html.includes("<li") || html.includes("<span") || html.includes("<b "))) {
      e.preventDefault();
      const markdown = convertHtmlToMarkdown(html);
      
      const textarea = textareaRef.current;
      if (textarea && markdown.trim()) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const newValue = text.substring(0, start) + markdown + text.substring(end);
        onChange(newValue);
        
        // Select & place cursor at end of pasted section
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + markdown.length, start + markdown.length);
        }, 50);
        return;
      }
    }
  };

  // Quick format insertion helpers
  const insertTextTemplate = (format: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    let replacement = "";
    switch (format) {
      case "h1":
        replacement = `\n# ${selected || "Heading 1"}\n`;
        break;
      case "h2":
        replacement = `\n## ${selected || "Heading 2"}\n`;
        break;
      case "h3":
        replacement = `\n### ${selected || "Heading 3"}\n`;
        break;
      case "bold":
        replacement = `**${selected || "bold text"}**`;
        break;
      case "italic":
        replacement = `*${selected || "italic text"}*`;
        break;
      case "bullet":
        replacement = `\n- ${selected || "List item"}\n`;
        break;
      case "number":
        replacement = `\n1. ${selected || "Numbered item"}\n`;
        break;
      case "quote":
        replacement = `\n> ${selected || "Inspirational quotation block"}\n`;
        break;
      default:
        break;
    }

    const newValue = text.substring(0, start) + replacement + text.substring(end);
    onChange(newValue);
    
    // Maintain cursor focus
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + 1, start + replacement.length - 1);
    }, 50);
  };

  const activePaperBg = 
    paperTheme === "ivory" ? "bg-[#FAF6EE] text-[#2C2117] border-amber-900/10 shadow-amber-900/5 placeholder:text-amber-900/20"
    : paperTheme === "charcoal" ? "bg-[#141416] text-[#E4E4E7] border-white/5 shadow-black/40 placeholder:text-white/20"
    : "bg-white text-[#1E1E24] border-slate-200 shadow-slate-200/50 placeholder:text-slate-400";

  return (
    <div className="w-full flex flex-col rounded-2xl border border-slate-200/80 shadow-md overflow-hidden bg-white dark:bg-[#0b0c10] dark:border-white/5">
      
      {/* GOOGLE DOC HEADER & TITLE BAR */}
      <div className="px-5 py-3 border-b border-slate-200/80 bg-slate-50/50 dark:bg-[#0d0f14] dark:border-white/5 flex flex-wrap items-center justify-between gap-3 select-none">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center text-white font-serif text-sm font-semibold shadow-sm">
            ▤
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 font-sans">Active Copywriter Workspace</span>
              <span className="text-[9px] bg-blue-100 text-blue-700 dark:bg-[#2563eb]/20 dark:text-blue-400 px-1.5 py-0.5 rounded font-mono font-medium">
                Google Doc Mode
              </span>
            </div>
            <p className="text-[10px] text-indigo-500 dark:text-indigo-400 font-sans tracking-wide font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              Retains headers (H1, H2, H3), bold text, and lists automatically when pasting from Google Docs.
            </p>
          </div>
        </div>

        {/* Paper Theme togglers */}
        <div className="flex items-center gap-1.5 bg-slate-200/50 dark:bg-zinc-900 px-2 py-1 rounded-lg">
          <span className="text-[9px] uppercase font-semibold font-mono text-slate-500 dark:text-zinc-405 mr-1 text-slate-400">Paper Tone:</span>
          <button 
            type="button"
            onClick={() => setPaperTheme("classic")}
            className={`w-4 h-4 rounded-full bg-white border border-slate-300 cursor-pointer ${paperTheme === "classic" ? "ring-2 ring-blue-500 scale-115" : "opacity-70"}`}
            title="Classic White Paper"
          />
          <button 
            type="button"
            onClick={() => setPaperTheme("ivory")}
            className={`w-4 h-4 rounded-full bg-[#FAF6EE] border border-amber-200 cursor-pointer ${paperTheme === "ivory" ? "ring-2 ring-amber-700 scale-115" : "opacity-70"}`}
            title="Premium Ivory Book Paper"
          />
          <button 
            type="button"
            onClick={() => setPaperTheme("charcoal")}
            className={`w-4 h-4 rounded-full bg-[#1b1b1b] border border-zinc-800 cursor-pointer ${paperTheme === "charcoal" ? "ring-2 ring-indigo-500 scale-115" : "opacity-70"}`}
            title="Charcoal Eco Dark Paper"
          />
        </div>
      </div>

      {/* WORD PROCESSOR RICH FORMATTING TOOLBAR RIBBON */}
      <div className="p-2 border-b border-slate-200/80 bg-white dark:bg-[#07090d] dark:border-white/5 flex flex-wrap items-center gap-1 text-slate-600 dark:text-zinc-400 select-none">
        
        {/* Undo Action */}
        <button 
          type="button"
          onClick={() => onChange("")} 
          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer text-red-500 hover:text-red-650"
          title="Clear Document Canvas"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-slate-200 dark:bg-white/5 mx-1" />

        {/* Font Family Selector Dropdown */}
        <select 
          className="bg-slate-50 dark:bg-[#0c0c0e] hover:bg-slate-100 dark:hover:bg-zinc-900 border border-slate-200 dark:border-white/5 rounded px-2 py-1 text-xs font-sans text-slate-700 dark:text-zinc-300 cursor-pointer focus:outline-none"
          value={fontFamily}
          onChange={(e) => setFontFamily(e.target.value)}
        >
          <option value="font-sans">Inter Sans-Serif</option>
          <option value="font-serif">Times New Roman</option>
          <option value="font-mono">JetBrains Mono</option>
          <option value="font-display font-medium">Space Grotesk (Tech)</option>
        </select>

        {/* Font Size Dropdown */}
        <select 
          className="bg-slate-50 dark:bg-[#0c0c0e] hover:bg-slate-100 dark:hover:bg-zinc-900 border border-slate-200 dark:border-white/5 rounded px-2 py-1 text-xs font-sans text-slate-700 dark:text-zinc-300 cursor-pointer focus:outline-none"
          value={fontSize}
          onChange={(e) => setFontSize(e.target.value)}
          title="Adjust display font size"
        >
          <option value="text-xs">10 pt (Small)</option>
          <option value="text-sm">11 pt (Standard)</option>
          <option value="text-base">12 pt (Comfortable)</option>
          <option value="text-lg">14 pt (Large)</option>
          <option value="text-xl">18 pt (Sub-Header)</option>
          <option value="text-2xl">24 pt (Title Heading)</option>
        </select>

        <div className="w-[1px] h-4 bg-slate-200 dark:bg-white/5 mx-1" />

        {/* Thick / Slanted Text Style Buttons */}
        <button 
          type="button"
          onClick={() => insertTextTemplate("bold")}
          className={`p-1.5 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer ${isBold ? "bg-slate-100 font-bold" : ""}`}
          title="Make selection Bold (Ctrl+B)"
        >
          <Bold className="w-3.5 h-3.5 font-bold" />
        </button>
        <button 
          type="button"
          onClick={() => insertTextTemplate("italic")}
          className={`p-1.5 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer ${isItalic ? "bg-slate-100 italic" : ""}`}
          title="Make selection Italic (Ctrl+I)"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-slate-200 dark:bg-white/5 mx-1" />

        {/* Heading Injection Shortcuts */}
        <button 
          type="button"
          onClick={() => insertTextTemplate("h1")}
          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-colors flex items-center gap-0.5 cursor-pointer text-[#1e1b4b] dark:text-indigo-300"
          title="Insert Heading 1 Title"
        >
          <Heading1 className="w-3.5 h-3.5" />
        </button>
        <button 
          type="button"
          onClick={() => insertTextTemplate("h2")}
          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-colors flex items-center gap-0.5 cursor-pointer text-indigo-700 dark:text-indigo-455"
          title="Insert Heading 2 Subtitle"
        >
          <Heading2 className="w-3.5 h-3.5" />
        </button>
        <button 
          type="button"
          onClick={() => insertTextTemplate("h3")}
          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-colors flex items-center gap-0.5 cursor-pointer text-indigo-500 dark:text-indigo-500"
          title="Insert Heading 3 Section"
        >
          <Heading3 className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-slate-200 dark:bg-white/5 mx-1" />

        {/* Lists & Quotations */}
        <button 
          type="button"
          onClick={() => insertTextTemplate("bullet")}
          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          title="Bullet Point List (-)"
        >
          <List className="w-3.5 h-3.5" />
        </button>
        <button 
          type="button"
          onClick={() => insertTextTemplate("number")}
          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          title="Numbered List (1.)"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-slate-200 dark:bg-white/5 mx-1" />

        {/* Alignment controls */}
        <button 
          type="button"
          onClick={() => setAlignment("left")}
          className={`p-1.5 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer ${alignment === "left" ? "bg-slate-100/80 text-blue-600 dark:bg-white/10" : ""}`}
          title="Align Left"
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>
        <button 
          type="button"
          onClick={() => setAlignment("center")}
          className={`p-1.5 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer ${alignment === "center" ? "bg-slate-100/80 text-blue-600 dark:bg-white/10" : ""}`}
          title="Align Center"
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </button>
        <button 
          type="button"
          onClick={() => setAlignment("right")}
          className={`p-1.5 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer ${alignment === "right" ? "bg-slate-100/80 text-blue-600 dark:bg-white/10" : ""}`}
          title="Align Right"
        >
          <AlignRight className="w-3.5 h-3.5" />
        </button>
        <button 
          type="button"
          onClick={() => setAlignment("justify")}
          className={`p-1.5 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer ${alignment === "justify" ? "bg-slate-100/80 text-blue-600 dark:bg-white/10" : ""}`}
          title="Justify Spacing"
        >
          <AlignJustify className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-slate-200 dark:bg-white/5 mx-1" />

        {/* Line Spacing selector */}
        <select 
          className="bg-slate-50 dark:bg-[#0c0c0e] border border-slate-200 dark:border-white/5 rounded px-1.5 py-0.5 text-[10px] font-sans text-slate-600 dark:text-zinc-300 cursor-pointer focus:outline-none"
          value={lineSpacing}
          onChange={(e) => setLineSpacing(e.target.value)}
          title="Adjust line spacing"
        >
          <option value="leading-normal">Single (1.0)</option>
          <option value="leading-relaxed">Comfortable (1.15)</option>
          <option value="leading-loose">Double (2.0)</option>
        </select>

        {/* Quick Template loader tips */}
        <div className="ml-auto hidden xl:flex items-center gap-1.5 text-[10px] text-slate-400">
          <LayoutTemplate className="w-3 h-3 text-indigo-400" />
          <span>Double-click rules presets above to load criteria templates.</span>
        </div>
      </div>

      {/* PHYSICAL MARGIN RULER GUIDE */}
      <div className="h-6 border-b border-slate-200 bg-slate-50/40 dark:bg-zinc-900/40 dark:border-white/5 relative select-none flex items-center px-12 text-[8px] font-mono text-slate-400">
        {/* Left Indent Marker */}
        <div className="absolute left-[60px] top-1.5 w-[5px] h-[10px] bg-blue-500 rounded-b cursor-pointer flex flex-col items-center">
          <div className="w-2.5 h-1.5 bg-blue-600 rounded-t -mt-1 shadow-sm" />
        </div>
        {/* Ruler grid lines */}
        <div className="w-full flex justify-between h-2 items-end mt-2">
          {Array.from({ length: 40 }).map((_, idx) => {
            const isMajor = idx % 5 === 0;
            return (
              <div 
                key={idx} 
                className={`w-[1px] bg-slate-200 dark:bg-white/10 ${isMajor ? "h-2.5 bg-slate-400 dark:bg-zinc-550" : "h-1"}`}
              >
                {isMajor && idx > 0 && <span className="absolute -mt-3.5 -ml-1 text-[7px]">{idx / 5}</span>}
              </div>
            );
          })}
        </div>
        {/* Right Indent Marker */}
        <div className="absolute right-[60px] top-1.5 w-[5px] h-[10px] bg-blue-500 rounded-b cursor-pointer flex flex-col items-center">
          <div className="w-2.5 h-1.5 bg-blue-600 rounded-t -mt-1 shadow-sm" />
        </div>
      </div>

      {/* MOCK GOOGLE DOCS A4 WHITE PAPER CONTAINER */}
      <div className="p-8 bg-slate-100/90 dark:bg-[#060608] flex justify-center min-h-[460px] relative">
        
        {/* PHYSICAL WHITE SHEET PAGE MOCK */}
        <div className={`w-full max-w-2xl min-h-[400px] border rounded shadow-lg transition-all duration-300 flex flex-col relative overflow-hidden ${activePaperBg}`}>
          
          {/* Subtle side alignment grid */}
          <div className="absolute left-6 top-0 bottom-0 w-[1px] border-r border-red-500/10 pointer-events-none" />
          <div className="absolute right-6 top-0 bottom-0 w-[1px] border-l border-red-500/10 pointer-events-none" />
          
          {/* Decorative watermarked title page line */}
          <div className="p-4 border-b border-dashed border-slate-100 dark:border-white/5 flex justify-between font-mono text-[8px] text-slate-350 dark:text-zinc-500">
            <span>COPYWRITING DRAFT · COMPLIANCE GUARD</span>
            <span>PAGE 1 OF 1</span>
          </div>

          <textarea
            ref={textareaRef}
            className={`w-full h-96 p-10 focus:outline-none resize-none transition-all outline-none border-0 bg-transparent flex-1 select-text ${fontFamily} ${fontSize} ${lineSpacing}`}
            style={{ textAlign: alignment }}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onPaste={handlePaste}
            placeholder="Paste your Google Doc content here! Bold texts, bullet points, numbered lists, and structural headers like Heading 1 (#) and Heading 2 (##) are automatically parsed and seamlessly retained in your workspace."
          />
        </div>
      </div>

      {/* DOCUMENT STATE COUNTERS & BOTTOM METADATA CHIPS */}
      <div className="px-5 py-3 border-t border-slate-200/80 bg-slate-50 dark:bg-[#090b0f] dark:border-white/5 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-500 dark:text-zinc-550 select-none">
        <div className="flex items-center gap-4">
          <span>Words: <strong className="text-slate-800 dark:text-zinc-300 font-semibold">{wordCount.toLocaleString()}</strong></span>
          <span>Chars: <strong className="text-slate-800 dark:text-zinc-300 font-semibold">{charCount.toLocaleString()}</strong></span>
          <span>Draft State: <span className="text-emerald-500 font-semibold select-none">● Connected (Live Sync)</span></span>
        </div>
        <div className="flex items-center gap-2">
          <span>Font Encoding: <strong className="font-semibold text-slate-700 dark:text-zinc-400 uppercase">{fontFamily.replace("font-", "")}</strong></span>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(value);
              alert("Document contents copied to clipboard.");
            }}
            className="text-[10px] text-indigo-500 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-0"
          >
            <Copy className="w-3 h-3" /> Quick Copy
          </button>
        </div>
      </div>
    </div>
  );
}
