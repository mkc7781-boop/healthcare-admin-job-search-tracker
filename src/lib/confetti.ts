"use client";

export async function fireAppliedConfetti() {
  if (typeof window === "undefined") return;

  try {
    const confetti = (await import("canvas-confetti")).default;
    const colors = ["#0f766e", "#14b8a6", "#5eead4", "#fbbf24", "#ffffff"];

    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.65 },
      colors,
      zIndex: 9999,
    });

    window.setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.65 },
        colors,
        zIndex: 9999,
      });
      confetti({
        particleCount: 60,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.65 },
        colors,
        zIndex: 9999,
      });
    }, 180);
  } catch {
    // Confetti is optional — never block a successful save.
  }
}