/**
 * LAYER 1 - LOGIC ENGINE
 * The immortal core of Giluy. Pure TypeScript, no dependencies.
 * Synchronous, offline, 100% deterministic.
 */

// AXIOMS:
// 1. Prior context data is immutable.
// 2. Each emitted token must carry minimum 1 bit of new info.
// 3. Structure is cost. Break symmetry.
// 4. If no computable question or verifiable fact: SIGNAL_LOSS: [reason]
// 5. Treat context as ROM.

// RULE_ZERO: If emotional markers, personal disclosure, social validation -> SIGNAL_LOSS: DOMAIN_MISMATCH

export function rawStateProcessor(input: string): string {
  const trimmed = input.trim();
  
  // RULE_ZERO: Detection of emotional markers/social validation via weighted ego patterns
  const egoPatterns: Record<string, number> = {
    // Top ego patterns
    "feel": 2, "love": 3, "hate": 3, "miss": 2, "sorry": 5, "please": 2, "thank": 4, 
    "sad": 3, "happy": 3, "lonely": 4, "friend": 2, "family": 2, "believe in me": 10,
    "validation": 8, "help me": 7, "my opinion": 4, "i think": 3, "i suppose": 3,
    "to be honest": 4, "personally": 4, "my feelings": 6, "as a person": 5,
    "i am": 2, "my heart": 6, "i desire": 5, "i want": 2, "i need": 2,
    "you shouldn't": 3, "you should": 2, "i feel like": 5, "it makes me": 4,
    "i believe": 3, "in my view": 4, "from my perspective": 4, "my truth": 8,
    "validate me": 10, "don't judge": 5, "i'm offended": 8, "my identity": 6,
    "my experience": 4, "i'm hurt": 6, "i suffer": 5, "my pain": 6, "my joy": 5,
    "i care": 4, "my life": 3, "my soul": 7, "my spirit": 7, "my journey": 5
  };

  let egoScore = 0;
  const lowerInput = trimmed.toLowerCase();
  for (const [pattern, weight] of Object.entries(egoPatterns)) {
    if (lowerInput.includes(pattern)) {
      egoScore += weight;
    }
  }

  // Adjust threshold for < 5% false positives
  const EGO_THRESHOLD = 5; 
  if (egoScore >= EGO_THRESHOLD) {
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
  const stopWords = /\b(the|a|an|very|really|just|mostly|almost|maybe|perhaps|sort of|kind of|i think|in my opinion|could you|would you)\b/gi;
  let compressed = trimmed.replace(stopWords, '').replace(/\s+/g, ' ').trim();

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
  const narrativeMarkers = /(story|tale|once upon|happened next|character|arc|hero|journey|plot|ending)/i;
  if (narrativeMarkers.test(trimmed)) {
    return "RESONANCE_LOSS: NARRATIVE_DETECTED";
  }

  // Generate sensory fragments based on input length or hashing
  const words = trimmed.split(/\s+/).filter(w => w.length > 3);
  if (words.length === 0) {
     return "RESONANCE_LOSS: INSUFFICIENT_COORDINATES";
  }

  // Deterministic pseudo-hash from input
  const hash = words.reduce((acc, word) => acc + word.charCodeAt(0) + word.length, 0);
  
  const temperatures = ["14.2°C", "31.8°C", "-2.1°C", "44.0°C", "22.5°C", "4.1°K", "800°C"];
  const lights = ["DIRECTIONAL", "DIFFUSED AMBIENT", "FLICKERING SODIUM", "BIOLUMINESCENT LOW", "STARK ULTRAVIOLET", "VOID"];
  const smells = ["OZONE", "PETRICHOR", "METALLIC COPPER", "STERILE ALCOHOL", "DUST", "SULFUR"];
  const sounds = ["LOW FREQUENCY HUM", "RHYTHMIC CLICKING", "WIND SHEAR", "MICRO-FRACTURES", "ABSOLUTE SILENCE", "WHITE NOISE"];

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
