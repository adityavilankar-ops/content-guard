import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

export default function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isInputting, setIsInputting] = useState(false);

  // High performance motion values
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Springs for smooth fluid lagging "orbit/echo" effect
  const springConfig = { damping: 30, stiffness: 350, mass: 0.5 };
  const outerX = useSpring(cursorX, springConfig);
  const outerY = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Only mount and run on cursor-capable devices (like desktops)
    const hasHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!hasHover) return;

    setIsVisible(true);
    document.body.classList.add("custom-cursor-active");

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Check if target is interactive
      const isInteractive = 
        target.closest("a") || 
        target.closest("button") || 
        target.closest('[role="button"]') || 
        target.closest(".interactive") ||
        target.classList.contains("interactive");

      // Check if target is an input field
      const isInputField =
        target.closest("input") ||
        target.closest("textarea") ||
        target.closest("select") ||
        target.isContentEditable;

      setIsHovered(!!isInteractive);
      setIsInputting(!!isInputField);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      document.body.classList.remove("custom-cursor-active");
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [cursorX, cursorY]);

  if (!isVisible) return null;

  return (
    <>
      {/* Outer Glow Ring */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[9999] border-2 border-white bg-white/20 mix-blend-difference"
        style={{
          x: outerX,
          y: outerY,
          translateX: "-50%",
          translateY: "-50%",
          boxShadow: isHovered 
            ? "0 0 16px rgba(255, 255, 255, 0.8)" 
            : "0 0 4px rgba(255, 255, 255, 0.3)",
        }}
        animate={{
          scale: isInputting ? 0.6 : isClicking ? 0.8 : isHovered ? 1.5 : 1,
          borderColor: "#ffffff",
        }}
        transition={{ type: "tween", duration: 0.15 }}
      />

      {/* Inner Pinpoint Core */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 rounded-full pointer-events-none z-[9999] bg-white mix-blend-difference"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
          backgroundColor: "#ffffff",
        }}
        animate={{
          scale: isInputting ? 0.5 : isClicking ? 1.3 : isHovered ? 0.5 : 1,
        }}
        transition={{ type: "tween", duration: 0.1 }}
      />
    </>
  );
}
