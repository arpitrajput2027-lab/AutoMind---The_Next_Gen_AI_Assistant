"use client";

import { useRef, useState, useCallback, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import Avatar3D from "./Avatar3D";
import { useAvatarStore } from "@/store/avatarStore";

function AvatarLoader() {
  return (
    <mesh>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#8b6a3e" wireframe />
    </mesh>
  );
}

export default function AvatarWindow() {
  const [pos, setPos] = useState({
    x: typeof window !== "undefined" ? window.innerWidth - 340 : 20,
    y: typeof window !== "undefined" ? window.innerHeight - 400 : 20,
  });

  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const avatarState = useAvatarStore((s) => s.avatarState);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      dragging.current = true;
      offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    },
    [pos]
  );

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return;
    setPos({
      x: e.clientX - offset.current.x,
      y: e.clientY - offset.current.y,
    });
  }, []);

  const onMouseUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const borderColor =
    avatarState === "listening"
      ? "#ef4444" // red
      : avatarState === "thinking"
      ? "#8b6a3e" // bronze
      : avatarState === "speaking"
      ? "#5f7350" // success green
      : "rgba(26,24,20,0.1)"; // subtle ink

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
        width: 320,
        height: 380,
        zIndex: 1000,
        borderColor: borderColor
      }}
      className="shadow-2xl rounded-xl overflow-hidden bg-cream border"
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {/* Header */}
      <div
        onMouseDown={onMouseDown}
        className="px-4 py-2 bg-parchment flex items-center justify-between cursor-grab select-none border-b border-black/5"
      >
        <span className="font-serif font-bold text-sm text-ink">
          AutoMind Avatar
        </span>
        <span className={`label-mono text-[10px] transition-colors ${stateColor}`}>
          {stateLabel}
        </span>
      </div>

      {/* Canvas */}
      <div className="w-full h-[calc(100%-37px)] bg-white relative">
        <Canvas
           camera={{ position: [0, 1.5, 2.8], fov: 38 }}
           className="w-full h-full"
        >
          <ambientLight intensity={0.9} color="#faf8f4" />
          <directionalLight position={[2, 4, 3]} intensity={1.2} color="#ffffff" />
          <pointLight position={[-2, 3, 2]} intensity={0.5} color="#f4f0e8" />

          <Suspense fallback={<AvatarLoader />}>
            <Avatar3D />
            <Environment preset="studio" />
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