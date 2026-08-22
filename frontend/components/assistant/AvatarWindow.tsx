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
      <meshStandardMaterial color="#3B82F6" wireframe />
    </mesh>
  );
}

export default function AvatarWindow() {
  const [pos, setPos] = useState({
    x: typeof window !== "undefined" ? window.innerWidth - 300 : 20,
    y: typeof window !== "undefined" ? window.innerHeight - 360 : 20,
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
      ? "#10B981"
      : avatarState === "thinking"
      ? "#F59E0B"
      : avatarState === "speaking"
      ? "#3B82F6"
      : "#4B5563";

  const stateLabel =
    avatarState === "listening"
      ? "● Listening..."
      : avatarState === "thinking"
      ? "● Thinking..."
      : avatarState === "speaking"
      ? "● Speaking"
      : "● Idle";

  return (
    <div
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        width: 320,
        height: 380,
        zIndex: 1000,
      }}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {/* Header */}
      <div
        onMouseDown={onMouseDown}
        style={{
          background: "#111827",
          borderRadius: "12px 12px 0 0",
          padding: "8px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: `1.5px solid ${borderColor}`,
          borderLeft: `1.5px solid ${borderColor}`,
          borderRight: `1.5px solid ${borderColor}`,
          borderBottom: "none",
          cursor: "grab",
          userSelect: "none",
          transition: "border-color 0.3s",
        }}
      >
        <span style={{
          color: "#F9FAFB",
          fontSize: 13,
          fontWeight: 600,
          fontFamily: "sans-serif",
        }}>
          AutoMind
        </span>
        <span style={{
          color: borderColor,
          fontSize: 11,
          fontFamily: "sans-serif",
          transition: "color 0.3s",
        }}>
          {stateLabel}
        </span>
      </div>

      {/* Canvas */}
      <div
        style={{
          width: "100%",
          height: "calc(100% - 36px)",
          borderBottom: `1.5px solid ${borderColor}`,
          borderLeft: `1.5px solid ${borderColor}`,
          borderRight: `1.5px solid ${borderColor}`,
          borderTop: "none",
          borderRadius: "0 0 12px 12px",
          overflow: "hidden",
          background: "#0F172A",
          transition: "border-color 0.3s",
        }}
      >
        <Canvas
           camera={{ position: [0, 1.5, 2.8], fov: 38 }}
          // camera={{ position: [0, 0.1, 1.8], fov: 42 }}
           // NAYI
          //camera={{ position: [0, 1.6, 1.2], fov: 50 }}
          style={{ width: "100%", height: "100%" }}
        >
          <ambientLight intensity={0.7} />
          <directionalLight position={[2, 4, 3]} intensity={1.2} />
          <pointLight position={[-2, 3, 2]} intensity={0.5} color="#93C5FD" />

          <Suspense fallback={<AvatarLoader />}>
            <Avatar3D />
            <Environment preset="city" />
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