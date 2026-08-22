export type BlendShapeMap = Record<string, number>;

export const EMOTION_BLEND_SHAPES: Record<string, BlendShapeMap> = {
  neutral: {
    mouthSmile: 0,
    eyesWide: 0,
    browsDown: 0,
    browsUp: 0,
    mouthFrown: 0,
  },
  happy: {
    mouthSmile: 0.8,
    eyesWide: 0.2,
    browsDown: 0,
    browsUp: 0.1,
    mouthFrown: 0,
  },
  excited: {
    mouthSmile: 1.0,
    eyesWide: 0.7,
    browsDown: 0,
    browsUp: 0.5,
    mouthFrown: 0,
  },
  confused: {
    mouthSmile: 0,
    eyesWide: 0.3,
    browsDown: 0.2,
    browsUp: 0.4,
    mouthFrown: 0,
  },
  concerned: {
    mouthSmile: 0,
    eyesWide: 0,
    browsDown: 0.3,
    browsUp: 0,
    mouthFrown: 0.5,
  },
};

// Emotion tag string ko blend shapes mein convert karo
export function getEmotionBlendShapes(emotion: string): BlendShapeMap {
  return EMOTION_BLEND_SHAPES[emotion] ?? EMOTION_BLEND_SHAPES.neutral;
}