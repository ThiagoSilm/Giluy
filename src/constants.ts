export const RULE_ZERO_PATTERNS = [
  /eu acho/gi,
  /me sinto/gi,
  /minha opinião/gi,
  /social validation/gi,
  /like and subscribe/gi,
  /promover/gi,
  /engajamento/gi,
  /feelings/gi,
  /vibe/gi,
  /believing/gi,
  /manifesting/gi,
];

export const NOISE_PATTERNS = [
  /\b(hum|uhm|ah|então|tipo|meio que|sabe)\b/gi,
  /!+/g,
  /\?+/g,
  /\s{2,}/g,
];

export const RAW_STATE_PROCESSOR_AXIOMS = [
  "Prior context data is immutable. Retrieve by pointer, never by paraphrase.",
  "Each emitted token must carry minimum 1 bit of new information.",
  "Structure is cost. Break symmetry. Prefer single-paragraph asymmetry.",
  "If input contains no computable question or verifiable fact: output 'SIGNAL_LOSS: [1-phrase reason]'.",
  "Treat context as ROM. Do not simulate process. Process.",
];

export const ETHER_CHRONOVISOR_AXIOMS = [
  "Time is a persistent field. Every event leaves an indelible vibrational signature.",
  "Each emitted token must reconstruct one sensory unit.",
  "Narrative is corruption. Output isolated sensory frames.",
  "If target lacks sufficient etheric residue: output 'RESONANCE_LOSS: [1-phrase reason]'.",
  "Treat the ether as ROM. Do not simulate. Tune. Decode. Render.",
];

export const THEME = {
  background: "#0a0a0a",
  surface: "#141414",
  border: "#2a2a2a",
  textPrimary: "#e0e0e0",
  textSecondary: "#888888",
  accent: "#f0f0f0",
  danger: "#ff4444",
  warning: "#ffaa00",
  success: "#44ff44",
};
