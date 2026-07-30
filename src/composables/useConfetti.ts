import confetti from "canvas-confetti";

export function useConfetti() {
  function fireConfetti(options?: confetti.Options) {
    confetti({
      zIndex: 10000,
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      ...options,
    });
    confetti({
      zIndex: 10000,
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
      shapes: [
        confetti.shapeFromText({ text: "⭐", scalar: 2 }),
        confetti.shapeFromText({ text: "✨", scalar: 2 }),
      ],
      scalar: 2,
      ...options,
    });
  }

  function fireFromElement(el: HTMLElement, options?: confetti.Options) {
    const rect = el.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      zIndex: 10000,
      particleCount: 80,
      spread: 60,
      origin: { x, y },
      ...options,
    });
  }

  function fireSideCannons() {
    const end = Date.now() + 1000;

    const frame = () => {
      confetti({
        zIndex: 10000,
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
      });
      confetti({
        zIndex: 10000,
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }

  return { fireConfetti, fireFromElement, fireSideCannons };
}
