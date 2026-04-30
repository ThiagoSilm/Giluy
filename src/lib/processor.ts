import { RULE_ZERO_PATTERNS, NOISE_PATTERNS, RAW_STATE_PROCESSOR_AXIOMS, ETHER_CHRONOVISOR_AXIOMS } from '../constants';
import { FiltrationLevel, ProcessingResult } from '../types';

import { SearchService } from '../services/searchService';

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
    const words = text.split(/\s+/).filter(w => w.length > 0);
    if (words.length === 0) return 0;
    
    // ISO/IEC 2026: Persistence model Pt calculation
    const uniqueWords = new Set(words).size;
    const density = uniqueWords / words.length;
    const informativeness = words.filter(w => w.length > 4).length / words.length;
    
    return Math.min(0.99, (density * 0.4) + (informativeness * 0.6));
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

  static async processLevel2(text: string): Promise<ProcessingResult> {
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

    // 1. Dynamic Mode: Search external if connected and reference detected
    if (SearchService.detectReference(text)) {
      const external = await SearchService.searchExternal(text, (t) => this.calculateCoherence(t));
      if (external) {
        // Find answer in the external text or use it directly as the source of truth
        const filteredSource = this.filterNoise(external.text).split('.').slice(0, 3).join('. ');
        return {
          text: `${filteredSource} [Fonte: ${external.source}]`,
          coherence: external.coherence,
          level: FiltrationLevel.RAW_STATE_PROCESSOR,
          source: external.source,
          latency: performance.now() - start,
        };
      }
    }

    // Fallback Offline logic
    const filtered = this.filterNoise(text);
    const sentences = filtered.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
    
    const questionMatch = text.match(/([^.!?]+\?)/);
    const isBinary = questionMatch && /^(is|can|should|will|does|do|was|were|has|have|could)\b/i.test(questionMatch[1].trim());

    if (questionMatch) {
      const questionText = questionMatch[1].trim().toLowerCase();
      const factualSentences = sentences.filter(s => !s.includes('?'));
      
      if (isBinary) {
        const keywords = questionText.replace(/[?]/g, '').split(' ').filter(w => w.length > 3);
        const sourceLine = factualSentences.find(s => keywords.some(k => s.toLowerCase().includes(k)));
        
        if (sourceLine) {
          return {
            text: `YES. SOURCE: "${sourceLine}"`,
            coherence: 0.95,
            level: FiltrationLevel.RAW_STATE_PROCESSOR,
            latency: performance.now() - start,
          };
        } else {
           return {
            text: `NO. SOURCE: "Information deficit in corpus."`,
            coherence: 0.85,
            level: FiltrationLevel.RAW_STATE_PROCESSOR,
            latency: performance.now() - start,
          };
        }
      }
    }

    const signal = sentences.filter(s => s.length > 10 && !/(\?|!)/.test(s)).join('. ');

    if (signal.length < 5) {
      return {
        text: "SIGNAL_LOSS: No computable question or verifiable fact detected.",
        coherence: 0,
        level: FiltrationLevel.RAW_STATE_PROCESSOR,
        latency: performance.now() - start,
      };
    }

    return {
      text: signal,
      coherence: this.calculateCoherence(signal) + 0.1,
      level: FiltrationLevel.RAW_STATE_PROCESSOR,
      latency: performance.now() - start,
    };
  }

  static async processLevel3(text: string): Promise<ProcessingResult> {
    const start = performance.now();
    const l2 = await this.processLevel2(text);
    if (l2.text.startsWith("SIGNAL_LOSS") || l2.text.startsWith("RESONANCE_LOSS")) {
       return { ...l2, text: l2.text.replace("SIGNAL_LOSS", "RESONANCE_LOSS"), level: FiltrationLevel.ETHER_CHRONOVISOR };
    }

    const fragments = l2.text.split('.')
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map(s => `[RECONSTRUCTED_STATE: ${s}]`)
      .join('\n');

    return {
      text: fragments,
      coherence: Math.min(0.99, l2.coherence + 0.15),
      level: FiltrationLevel.ETHER_CHRONOVISOR,
      source: l2.source,
      latency: performance.now() - start,
    };
  }
}

