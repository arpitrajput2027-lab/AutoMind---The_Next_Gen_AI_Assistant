"use client";

import { useRef, useState, useCallback, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Avatar3D from "./Avatar3D";
import { useAvatarStore } from "@/store/avatarStore";

const AVATAR_W = 280;
const AVATAR_H = 340;
const MARGIN = 16;

function defaultPosition() {
  if (typeof window === "undefined") {
    return { x: MARGIN, y: 400 };
  }
  // Bottom-left of the viewport (above a little margin)
  return {
    x: MARGIN,
    y: Math.max(MARGIN, window.innerHeight - AVATAR_H - MARGIN),
  };
}

function clampPos(x: number, y: number) {
  if (typeof window === "undefined") return { x, y };
  const maxX = Math.max(MARGIN, window.innerWidth - AVATAR_W - MARGIN);
  const maxY = Math.max(MARGIN, window.innerHeight - AVATAR_H - MARGIN);
  return {
    x: Math.min(Math.max(MARGIN, x), maxX),
    y: Math.min(Math.max(MARGIN, y), maxY),
  };
}

function AvatarLoader() {
  return (
    <mesh>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#8b6a3e" wireframe />
    </mesh>
  );
}

export default function AvatarWindow() {
  const [pos, setPos] = useState(defaultPosition);
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const avatarState = useAvatarStore((s) => s.avatarState);

  // Keep bottom-left if window resizes and user hasn't moved far
  useEffect(() => {
    const onResize = () => {
      setPos((prev) => clampPos(prev.x, prev.y));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Global mouse listeners so drag works outside the window
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      setPos(clampPos(e.clientX - offset.current.x, e.clientY - offset.current.y));
    };
    const onUp = () => {
      dragging.current = false;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  }, [pos]);

  const borderColor =
    avatarState === "listening"
      ? "#ef4444"
      : avatarState === "thinking"
      ? "#8b6a3e"
      : avatarState === "speaking"
      ? "#5f7350"
      : "rgba(26,24,20,0.1)";

  const stateLabel =
    avatarState === "listening"
      ? "● Listening..."
      : avatarState === "thinking"
      ? "● Thinking..."
      : avatarState === "speaking"
      ? "● Speaking"
      : "● Idle";

  const stateColor =
    avatarState === "listening"
      ? "text-red-500"
      : avatarState === "thinking"
      ? "text-bronze"
      : avatarState === "speaking"
      ? "text-success"
      : "text-muted";

  return (
    <div
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        width: AVATAR_W,
        height: AVATAR_H,
        zIndex: 1000,
        borderColor,
      }}
      className="shadow-2xl rounded-xl overflow-hidden bg-cream border"
    >
      {/* Drag handle */}
      <div
        onMouseDown={onMouseDown}
        className="px-3 py-2 bg-parchment flex items-center justify-between cursor-grab active:cursor-grabbing select-none border-b border-black/5"
        title="Drag to move"
      >
        <span className="font-serif font-bold text-sm text-ink">
          AutoMind Avatar
        </span>
        <span className={`label-mono text-[10px] transition-colors ${stateColor}`}>
          {stateLabel}
        </span>
      </div>

      <div className="w-full h-[calc(100%-37px)] bg-stone-100 relative">
        <Canvas camera={{ position: [0, 1.5, 2.8], fov: 38 }} className="w-full h-full">
          <ambientLight intensity={0.75} color="#faf8f4" />
          <directionalLight position={[2, 4, 3]} intensity={1.0} color="#ffffff" />
          <pointLight position={[-2, 3, 2]} intensity={0.4} color="#f4f0e8" />

          <Suspense fallback={<AvatarLoader />}>
            <Avatar3D />
          </Suspense>

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 1.8}
          />
        </Canvas>
      </div>
    </div>
  );
}
