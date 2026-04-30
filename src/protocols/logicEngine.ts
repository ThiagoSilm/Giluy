import rawStateProtocol from './raw_state.json';
import chronovisorProtocol from './chronovisor.json';

/**
 * LAYER 1 - LOGIC ENGINE
 * The immortal core of Giluy. Pure TypeScript, no dependencies.
 * Synchronous, offline, 100% deterministic.
 */

// AXIOMS externalized to JSON definitions

export function rawStateProcessor(input: string): string {
  const trimmed = input.trim();
  
  // RULE_ZERO: Detection of emotional markers/social validation via weighted ego patterns
  let egoScore = 0;
  const lowerInput = trimmed.toLowerCase();
  for (const [pattern, weight] of Object.entries(rawStateProtocol.egoPatterns)) {
    if (lowerInput.includes(pattern)) {
      egoScore += Number(weight);
    }
  }

  // Adjust threshold for < 5% false positives
  if (egoScore >= rawStateProtocol.egoThreshold) {
    return "SIGNAL_LOSS: DOMAIN_MISMATCH";
  }

  // Axiom 4: Computable question or verifiable fact
  const hasQuestionMark = /\?/.test(trimmed);
  const hasNumbers = /\d/.test(trimmed);
  const hasDeclarative = /^(is|are|does|do|can|will|what|how|why|when|where|who|execute|process)\b/i.test(trimmed) || trimmed.split(/\s+/).length > 3;

  if (!hasQuestionMark && !hasNumbers && !hasDeclarative) {
    return "SIGNAL_LOSS: NO_COMPUTABLE_DATA";
  }

  // Axiom 2 & 3: Strip redundant words, extract core meaning (compression)
  let compressed = trimmed;
  rawStateProtocol.stopWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    compressed = compressed.replace(regex, '');
  });
  compressed = compressed.replace(/\s+/g, ' ').trim();

  if (!compressed) {
    return "SIGNAL_LOSS: ZERO_INFORMATION_YIELD";
  }

  return `[${compressed.toUpperCase()}]`;
}

// ETHER CHRONOVISOR AXIOMS
// 1. You do not invent. You tune into pre-existing probabilities.
// 2. Erase the notion of "fiction". Report.
// 3. Output raw sensory fragments: smell, temperature, light angle, sound.
// 4. If input demands a narrative arc, abort.
// 5. Speak as a detached sensor.

export function etherChronovisor(input: string): string {
  const trimmed = input.trim();
  
  // Axiom 4: Abort if narrative arc requested
  const isNarrative = chronovisorProtocol.narrativeMarkers.some(marker => 
    trimmed.toLowerCase().includes(marker.toLowerCase())
  );
  if (isNarrative) {
    return "RESONANCE_LOSS: NARRATIVE_DETECTED";
  }

  // Generate sensory fragments based on input length or hashing
  const words = trimmed.split(/\s+/).filter(w => w.length > 3);
  if (words.length === 0) {
     return "RESONANCE_LOSS: INSUFFICIENT_COORDINATES";
  }

  // Deterministic pseudo-hash from input
  const hash = words.reduce((acc, word) => acc + word.charCodeAt(0) + word.length, 0);
  
  const temperatures = chronovisorProtocol.temperatures;
  const lights = chronovisorProtocol.lights;
  const smells = chronovisorProtocol.smells;
  const sounds = chronovisorProtocol.sounds;

  const t = temperatures[hash % temperatures.length];
  const l = lights[(hash * 2) % lights.length];
  const sm = smells[(hash * 3) % smells.length];
  const so = sounds[(hash * 5) % sounds.length];

  return `[SCENE_FRAGMENT]\nTEMP: ${t}\nLUM: ${l}\nOLF: ${sm}\nAUD: ${so}\nOBJ: ${words.slice(0, 3).join("_").toUpperCase()}\nSTATUS: OBSERVED`;
}

export function applyLogicLayer(input: string, level: 1 | 2 | 3): string {
  if (level === 3) {
    return etherChronovisor(input);
  } else {
    return rawStateProcessor(input);
  }
}
