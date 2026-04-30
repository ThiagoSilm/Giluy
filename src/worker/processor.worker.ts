import { ColdLogicProcessor } from '../lib/processor';
import { FiltrationLevel } from '../types';

self.onmessage = async (e: MessageEvent) => {
  const { text, level } = e.data;

  let result;
  switch (level) {
    case FiltrationLevel.ANTI_EGO:
      result = ColdLogicProcessor.processLevel1(text);
      break;
    case FiltrationLevel.RAW_STATE_PROCESSOR:
      result = await ColdLogicProcessor.processLevel2(text);
      break;
    case FiltrationLevel.ETHER_CHRONOVISOR:
      result = await ColdLogicProcessor.processLevel3(text);
      break;
    default:
      result = ColdLogicProcessor.processLevel1(text);
  }

  // Simulate minimal processing delay for v9.0 compliance if logic is too fast
  const targetLatency = level === FiltrationLevel.ANTI_EGO ? 0 : (level === FiltrationLevel.RAW_STATE_PROCESSOR ? 12 : 50);
  const remaining = targetLatency - result.latency;
  if (remaining > 0) {
    await new Promise(r => setTimeout(r, remaining));
  }

  self.postMessage(result);
};
