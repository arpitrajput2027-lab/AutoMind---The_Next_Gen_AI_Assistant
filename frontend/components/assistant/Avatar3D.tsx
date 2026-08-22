"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { useAvatarStore } from "@/store/avatarStore";

const AVATAR_URL = "/models/avatar.glb";

export default function Avatar3D() {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(AVATAR_URL);
  const { actions, mixer } = useAnimations(animations, group);

  const avatarState = useAvatarStore((s) => s.avatarState);
  const mouthAmplitude = useAvatarStore((s) => s.mouthAmplitude);

  // Available blend shapes aur animations console mein print karo
  useEffect(() => {
    console.log("=== AVATAR ANIMATIONS ===");
    console.log(animations.map((a) => a.name));

    scene.traverse((node) => {
      const mesh = node as THREE.Mesh;
      if (mesh.morphTargetDictionary) {
        console.log("=== BLEND SHAPES ===");
        console.log(Object.keys(mesh.morphTargetDictionary));
      }
    });
  }, [scene, animations]);

  // Animation play karo — jo bhi available ho
  useEffect(() => {
    if (!actions) return;
    const keys = Object.keys(actions);
    console.log("Actions available:", keys);

    if (keys.length === 0) {
      console.log("Koi animation nahi mili — static avatar rahega");
      return;
    }

    // Pehli available animation play karo
    const firstAction = actions[keys[0]];
    firstAction?.reset().fadeIn(0.5).play();
  }, [actions]);

  // State change hone pe animation change karo
  useEffect(() => {
    if (!actions) return;
    const keys = Object.keys(actions);
    if (keys.length === 0) return;

    // Sab band karo
    Object.values(actions).forEach((a) => a?.fadeOut(0.3));

    // State ke hisaab se animation choose karo
    // Sketchfab avatars mein alag names hote hain
    let action;

    if (avatarState === "speaking" || avatarState === "listening") {
      // Koi bhi animation — jo bhi available ho
      action =
        actions["Talk"] ??
        actions["Speaking"] ??
        actions["Idle"] ??
        actions[keys[0]];
    } else if (avatarState === "thinking") {
      action =
        actions["Think"] ??
        actions["Thinking"] ??
        actions["Idle"] ??
        actions[keys[0]];
    } else {
      // Idle
      action =
        actions["Idle"] ??
        actions["idle"] ??
        actions["Stand"] ??
        actions[keys[0]];
    }

    action?.reset().fadeIn(0.3).play();
  }, [avatarState]);

  // Har frame mein
  useFrame((_, delta) => {
    mixer?.update(delta);

    // Subtle head movement
    if (group.current) {
      group.current.rotation.y =
        Math.sin(Date.now() * 0.0008) * 0.04;
    }

    // Lip sync — blend shapes update karo
    scene.traverse((node) => {
      const mesh = node as THREE.Mesh;
      if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
        const dict = mesh.morphTargetDictionary;

        // Mouth open keys — bahut saare names try karo
        const mouthKeys = [
          "mouthOpen", "jawOpen", "viseme_aa", "viseme_O",
          "Mouth_Open", "mouth_open", "open_mouth",
          "A", "aa", "jawDrop",
        ];

        for (const key of mouthKeys) {
          if (dict[key] !== undefined) {
            const current = mesh.morphTargetInfluences[dict[key]];
            mesh.morphTargetInfluences[dict[key]] =
              THREE.MathUtils.lerp(current, mouthAmplitude, 0.3);
            break;
          }
        }
      }
    });
  });

  return (
  <group ref={group}>
    <primitive
      object={scene}
      scale={5}
      position={[0, -0.5, 0]}
      rotation={[0, Math.PI, 0]}  // ← 180 degree rotate — face saamne aayega
    />
  </group>
);
}

useGLTF.preload(AVATAR_URL);