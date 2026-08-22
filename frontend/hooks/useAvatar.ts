"use client";

import { useState, useCallback, useRef } from "react";

export type AvatarExpression =
  | "neutral"
  | "happy"
  | "thinking"
  | "excited"
  | "sad"
  | "surprised";

export type AvatarState = {
  expression: AvatarExpression;
  isTalking: boolean;
  isThinking: boolean;
  position: { x: number; y: number };
};

export function useAvatar() {
  const [avatarState, setAvatarState] = useState<AvatarState>({
    expression: "neutral",
    isTalking: false,
    isThinking: false,
    position: { x: 0, y: 0 },
  });

  const talkTimer = useRef<ReturnType<typeof setTimeout>>();

  const setExpression = useCallback((expression: AvatarExpression) => {
    setAvatarState((prev) => ({ ...prev, expression }));
  }, []);

  const startTalking = useCallback((text: string) => {
    // Estimate talk duration from text length (~150 wpm)
    const words = text.split(" ").length;
    const durationMs = Math.max(2000, (words / 150) * 60 * 1000);

    setAvatarState((prev) => ({
      ...prev,
      isTalking: true,
      isThinking: false,
      expression: "happy",
    }));

    clearTimeout(talkTimer.current);
    talkTimer.current = setTimeout(() => {
      setAvatarState((prev) => ({
        ...prev,
        isTalking: false,
        expression: "neutral",
      }));
    }, durationMs);
  }, []);

  const startThinking = useCallback(() => {
    setAvatarState((prev) => ({
      ...prev,
      isThinking: true,
      isTalking: false,
      expression: "thinking",
    }));
  }, []);

  const stopThinking = useCallback(() => {
    setAvatarState((prev) => ({
      ...prev,
      isThinking: false,
    }));
  }, []);

  const setPosition = useCallback((x: number, y: number) => {
    setAvatarState((prev) => ({ ...prev, position: { x, y } }));
  }, []);

  // React to task type
  const reactToTask = useCallback(
    (taskType: string, success: boolean) => {
      if (!success) {
        setExpression("sad");
        return;
      }
      const expressionMap: Record<string, AvatarExpression> = {
        vscode: "excited",
        system: "happy",
        email: "happy",
        whatsapp: "happy",
        powerpoint: "excited",
        youtube: "excited",
        chat: "neutral",
      };
      setExpression(expressionMap[taskType] || "happy");
      setTimeout(() => setExpression("neutral"), 3000);
    },
    [setExpression]
  );

  return {
    avatarState,
    setExpression,
    startTalking,
    startThinking,
    stopThinking,
    setPosition,
    reactToTask,
  };
}
