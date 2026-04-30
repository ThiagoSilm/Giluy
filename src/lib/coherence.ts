import { CoherenceSignal } from '../types';

/**
 * Calculates a pseudo-coherence metric P(t) for a given text.
 * This is a heuristic based on information density, structural entropy, 
 * and removal of linguistic "noise".
 */
export function calculateCoherence(text: string): CoherenceSignal {
  if (!text.trim()) {
    return { pt: 0, connectivity: 0, transmission: 0, coherence: 0, amplitude: 0, dissipation: 0 };
  }

  const words = text.split(/\s+/).filter(w => w.length > 0);
  const uniqueWords = new Set(words);
  const charLength = text.length;

  // Heuristics
  // 1. Density: unique information per unit of volume
  const density = words.length > 0 ? uniqueWords.size / words.length : 0;
  
  // 2. Connectivity: average word length normalized (cap 12 chars = 100%)
  const rawAvgWordLength = words.length > 0 ? words.reduce((acc, w) => acc + w.length, 0) / words.length : 0;
  const connectivity = Math.min(100, (rawAvgWordLength / 12) * 100);
  
  // 3. Noise/Entropy: word repetition and filler patterns
  const repetitionFactor = words.length > 0 ? (words.length - uniqueWords.size) / words.length : 0;
  
  // 4. Transmission score: how much "signal" is surviving the format
  const transmission = Math.min(100, (density * 100) + (rawAvgWordLength * 2));

  // Amplitude: "Emotional" resonance or text intensity (normalized)
  const amplitude = Math.min(100, (charLength / 1000) * 100);

  // Dissipation: Loss of clarity due to repetition
  const dissipation = repetitionFactor * 100;

  // The final P(t) - Pure Signal Probability/Intensity
  const pt = Math.max(0, Math.min(100, (transmission * 0.5 + connectivity * 0.2 + (100 - dissipation) * 0.3)));

  return {
    pt: Number(pt.toFixed(2)),
    connectivity: Number(connectivity.toFixed(2)),
    transmission: Number(transmission.toFixed(2)),
    coherence: Number((pt / 100).toFixed(4)),
    amplitude: Number(amplitude.toFixed(2)),
    dissipation: Number(dissipation.toFixed(2))
  };
}
