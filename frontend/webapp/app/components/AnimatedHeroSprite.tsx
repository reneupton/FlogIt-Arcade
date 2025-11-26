"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type Props = {
  basePath: string; // e.g. /necromancer/anim/necromancer_1
  frameCount?: number; // total frames available on disk
  intervalMs?: number; // delay between frames
  alt?: string;
  hero?: boolean;
  idleFrames?: number[];
  blinkFrames?: number[];
  minBlinkDelayMs?: number;
  maxBlinkDelayMs?: number;
};

export default function AnimatedHeroSprite({
  basePath,
  frameCount = 18,
  intervalMs = 150,
  alt = "hero sprite",
  hero = false,
  idleFrames,
  blinkFrames,
  minBlinkDelayMs = 3500,
  maxBlinkDelayMs = 7200,
}: Props) {
  const idleSeq = useMemo(
    () =>
      (idleFrames && idleFrames.length > 0
        ? idleFrames
        : [0, 1, 2, 3, 4, 5, 4, 3, 2, 1]
      ).map((i) => i % frameCount),
    [frameCount, idleFrames]
  );
  const blinkSeq = useMemo(
    () =>
      (blinkFrames && blinkFrames.length > 0 ? blinkFrames : [15, 16, 15]).map(
        (i) => i % frameCount
      ),
    [frameCount, blinkFrames]
  );

  const [sequence, setSequence] = useState<number[]>(idleSeq);
  const [frame, setFrame] = useState(0);
  const [nextBlinkAt, setNextBlinkAt] = useState(() =>
    Date.now() + Math.random() * (maxBlinkDelayMs - minBlinkDelayMs) + minBlinkDelayMs
  );

  const frames = useMemo(
    () =>
      sequence.map(
        (idx) => `${basePath}/${hero ? "hero" : "card"}/frame_${idx}.png`
      ),
    [basePath, hero, sequence]
  );

  useEffect(() => {
    const id = setInterval(() => {
      setFrame((f) => {
        const next = (f + 1) % frames.length;

        if (sequence === idleSeq && next === 0 && Date.now() >= nextBlinkAt) {
          setSequence(blinkSeq);
          setNextBlinkAt(
            Date.now() +
              Math.random() * (maxBlinkDelayMs - minBlinkDelayMs) +
              minBlinkDelayMs
          );
        } else if (sequence === blinkSeq && next === 0) {
          setSequence(idleSeq);
        }
        return next;
      });
    }, intervalMs);
    return () => clearInterval(id);
  }, [
    intervalMs,
    sequence,
    idleSeq,
    blinkSeq,
    nextBlinkAt,
    minBlinkDelayMs,
    maxBlinkDelayMs,
    frames.length,
  ]);

  return (
    <Image
      src={frames[frame]}
      alt={alt}
      fill
      priority
      sizes="(max-width:768px) 100vw, (max-width: 1200px) 50vw, 25vw"
      className="object-contain"
      style={{ imageRendering: "pixelated" }}
    />
  );
}
