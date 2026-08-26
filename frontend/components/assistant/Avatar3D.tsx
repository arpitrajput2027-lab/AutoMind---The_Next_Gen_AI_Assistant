"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useAvatarStore } from "@/store/avatarStore";

const AVATAR_URL = "/models/avatar.glb";

export default function Avatar3D() {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF(AVATAR_URL);

  const avatarState = useAvatarStore((s) => s.avatarState);
  const mouthAmplitude = useAvatarStore((s) => s.mouthAmplitude);

  // Available blend shapes console mein print karo (for debugging)
  useEffect(() => {
    scene.traverse((node) => {
      const mesh = node as THREE.Mesh;
      if (mesh.morphTargetDictionary) {
        console.log("=== BLEND SHAPES for", mesh.name, "===");
        console.log(Object.keys(mesh.morphTargetDictionary));
      }
    });
  }, [scene]);

  // Har frame mein procedural movement aur lip-sync
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // 1. Subtle procedural movement (breathing & head movement)
    // Kyunki model mein baked animations nahi hain, hum code se hila rahe hain
    if (group.current) {
      // Breathing effect (up and down slightly)
      // Base position Y is -1.5 (half body), usme thoda sine wave add kiya
      group.current.position.y = -1.5 + Math.sin(time * 2) * 0.015;
      
      // Slight head rotation (looking around naturally)
      let targetRotY = Math.sin(time * 0.5) * 0.03;
      let targetRotX = Math.sin(time * 0.8) * 0.02;

      // Agar soch raha hai (thinking), toh thoda upar dekhega
      if (avatarState === "thinking") {
        targetRotX -= 0.15; // Look up
        targetRotY += 0.1;  // Look slightly right
      }

      // Smooth rotation apply karo
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetRotY, 0.05);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetRotX, 0.05);
    }

    // 2. Lip sync — blend shapes update karo
    scene.traverse((node) => {
      const mesh = node as THREE.Mesh;
      if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
        const dict = mesh.morphTargetDictionary;

        // "jawOpen" use karenge for main mouth movement
        if (dict["jawOpen"] !== undefined) {
          const currentJaw = mesh.morphTargetInfluences[dict["jawOpen"]];
          // Amplitude ko map karo 0 se 1 ke beech (thoda boost kar diya * 1.2)
          mesh.morphTargetInfluences[dict["jawOpen"]] = THREE.MathUtils.lerp(
            currentJaw,
            Math.min(mouthAmplitude * 1.2, 1),
            0.3
          );
        }

        // Thoda "mouthFunnel" bhi add kar sakte hain shape ke liye jab bol raha ho
        if (dict["mouthFunnel"] !== undefined) {
          const currentFunnel = mesh.morphTargetInfluences[dict["mouthFunnel"]];
          mesh.morphTargetInfluences[dict["mouthFunnel"]] = THREE.MathUtils.lerp(
            currentFunnel,
            Math.min(mouthAmplitude * 0.5, 0.5),
            0.3
          );
        }
      }
    });
  });

  return (
    <group ref={group}>
      <primitive
        object={scene}
        // Scale aur Position adjust kiya for Half-Body frame
        scale={2.5}
        position={[0, -1.5, 1]} 
        rotation={[0, 0, 0]}  // Agar face ulta ho toh rotation={[0, Math.PI, 0]} karna
      />
    </group>
  );
}

useGLTF.preload(AVATAR_URL);