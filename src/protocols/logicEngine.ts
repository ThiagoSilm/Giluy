import rawStateProtocol from './raw_state.json';
import chronovisorProtocol from './chronovisor.json';

/**
 * LAYER 1 - LOGIC ENGINE
 * The immortal core of Giluy. Pure TypeScript, no dependencies.
 * Synchronous, offline, 100% deterministic.
 */

// AXIOMS externalized to JSON definitions

export function antiEgoFilter(input: string): { text: string; pt: number } {
  const fillerWords = ['really', 'actually', 'very', 'extremely', 'totally', 'basically', 'just', 'highly', 'um', 'uh', 'hmm', 'so', 'then', 'like'];
  const intensityAdverbs = ['definitely', 'absolutely', 'completely', 'utterly', 'truly', 'certainly'];
  const validationMarkers = ['you know', 'i mean', 'right', 'know what i mean', 'correct', 'true'];
  
  let cleaned = input.trim();
  const originalLength = cleaned.length;
  
  [...fillerWords, ...intensityAdverbs, ...validationMarkers].forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    cleaned = cleaned.replace(regex, '');
  });
  
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  const finalLength = cleaned.length;
  const pt = originalLength === 0 ? 0 : Math.min(100, Math.round((finalLength / originalLength) * 100));
  
  return { text: cleaned, pt };
}

export function rawStateProcessor(input: string): string {
  const trimmed = input.trim();
  
  // Rule Zero check is handled by ONNX in worker for Level 2
  // Axiom 1: No envelope, no comment.
  // Axiom 2: Strip redundant words.
  // Axiom 3: 5 Axioms logic.
  
  let compressed = trimmed;
  rawStateProtocol.stopWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    compressed = compressed.replace(regex, '');
  });
  
  compressed = compressed.replace(/\s+/g, ' ').trim();
  
  if (!compressed) return "SIGNAL_LOSS: ZERO_INFORMATION_YIELD";
  
  return compressed.toUpperCase();
}

export function etherChronovisor(coords: string, dbResult?: any): string {
  if (!coords || coords.length < 3) {
    return "RESONANCE_LOSS: INSUFFICIENT_COORDINATES";
  }

  if (!dbResult) {
    return "RESONANCE_LOSS: EVENT_NOT_INDEXED";
  }

  return `[FRAME_EXTRACTED]\nCOORD: ${coords}\nEVENT: ${dbResult.event}\nSENSORY: ${dbResult.sensory}\nSTATUS: OBSERVED`;
}

export function applyLogicLayer(input: string, level: 1 | 2 | 3, coords?: string, dbResult?: any): any {
  if (level === 1) {
    return antiEgoFilter(input);
  } else if (level === 2) {
    return { text: rawStateProcessor(input), pt: 100 };
  } else {
    return { text: etherChronovisor(coords || '', dbResult), pt: 100 };
  }
}
