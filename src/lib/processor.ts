import { RULE_ZERO_PATTERNS, NOISE_PATTERNS, RAW_STATE_PROCESSOR_AXIOMS, ETHER_CHRONOVISOR_AXIOMS } from '../constants';
import { FiltrationLevel, ProcessingResult } from '../types';

export class ColdLogicProcessor {
  static filterNoise(text: string): string {
    let output = text;
    NOISE_PATTERNS.forEach(pattern => {
      output = output.replace(pattern, ' ');
    });
    return output.trim();
  }

  static checkRuleZero(text: string): string | null {
    for (const pattern of RULE_ZERO_PATTERNS) {
      if (pattern.test(text)) {
        return "DOMAIN_MISMATCH: Markers of ego detected.";
      }
    }
    return null;
  }

  static calculateCoherence(text: string): number {
    // Pt = (⟨k⟩ × τ × H × A) / D
    // Simplified for client simulation: based on text density and clarity
    const words = text.split(/\s+/).filter(w => w.length > 0);
    if (words.length === 0) return 0;
    
    const uniqueWords = new Set(words).size;
    const density = uniqueWords / words.length;
    const lengthPenalty = Math.min(1, words.length / 500); // Penalty for overly long rambling
    
    return Math.min(0.98, density * (1.2 - lengthPenalty));
  }

  static processLevel1(text: string): ProcessingResult {
    const start = performance.now();
    const result = this.filterNoise(text);
    return {
      text: result,
      coherence: this.calculateCoherence(result),
      level: FiltrationLevel.ANTI_EGO,
      latency: performance.now() - start,
    };
  }

  static processLevel2(text: string): ProcessingResult {
    const start = performance.now();
    
    const ruleZeroError = this.checkRuleZero(text);
    if (ruleZeroError) {
      return {
        text: `SIGNAL_LOSS: ${ruleZeroError}`,
        coherence: 0,
        level: FiltrationLevel.RAW_STATE_PROCESSOR,
        latency: performance.now() - start,
      };
    }

    const filtered = this.filterNoise(text);
    // Mimic the "Cold Logic" transformer-like extraction
    // In a real scenario, this would call ONNX
    const signal = filtered.split('.')
      .map(s => s.trim())
      .filter(s => s.length > 10 && !/(\?|!)/.test(s)) // Facts usually don't have emojis or exclamation marks
      .join('. ');

    if (signal.length < 5) {
      return {
        text: "SIGNAL_LOSS: Insufficient verifiable content.",
        coherence: 0,
        level: FiltrationLevel.RAW_STATE_PROCESSOR,
        latency: performance.now() - start,
      };
    }

    return {
      text: signal,
      coherence: this.calculateCoherence(signal) + 0.1, // Processor increases signal
      level: FiltrationLevel.RAW_STATE_PROCESSOR,
      latency: performance.now() - start,
    };
  }

  static processLevel3(text: string): ProcessingResult {
    const start = performance.now();
    // ETHER_CHRONOVISOR logic: Sensory unit reconstruction
    const l2 = this.processLevel2(text);
    if (l2.text.startsWith("SIGNAL_LOSS")) {
       return { ...l2, text: l2.text.replace("SIGNAL_LOSS", "RESONANCE_LOSS"), level: FiltrationLevel.ETHER_CHRONOVISOR };
    }

    // Transform facts into "sensory units"
    const fragments = l2.text.split('.')
      .map(s => `[RECONSTRUCTED_STATE: ${s.trim()}]`)
      .join('\n');

    return {
      text: fragments,
      coherence: Math.min(0.99, l2.coherence + 0.15),
      level: FiltrationLevel.ETHER_CHRONOVISOR,
      latency: performance.now() - start,
    };
  }
}
