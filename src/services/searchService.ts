import { FiltrationLevel, ProcessingResult } from '../types';

export interface SearchCandidate {
  text: string;
  source: string;
  coherence: number;
}

export class SearchService {
  /**
   * Detects if the text contains a reference that warrants an external search.
   */
  static detectReference(text: string): boolean {
    const patterns = [
      /Art\.\s?\d+/i,                      // Law
      /Lei\s?\d+/i,                      // Legislation
      /\d{4}/,                            // Dates (Year)
      /segundo\s+[A-Z][a-z]+/gi,           // "According to [Name]"
      /conforme\s+[A-Z][a-z]+/gi,          // "As per [Reference]"
      /\bcitação\b/i,                      // "Citation"
      /\bhistorico\b/i,                    // "History"
    ];
    return patterns.some(p => p.test(text));
  }

  /**
   * Performs a parallel search on public APIs (Wikipedia proxy).
   */
  static async searchExternal(query: string, processorCallback: (t: string) => number): Promise<SearchCandidate | null> {
    if (!navigator.onLine) return null;

    try {
      // Extract main keywords for search
      const keywords = query.replace(/[?]/g, '').split(' ')
        .filter(w => w.length > 4)
        .slice(0, 3)
        .join(' ');

      if (!keywords) return null;

      // Wikipedia Search API (CORS friendly)
      const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(keywords)}&format=json&origin=*`;
      const response = await fetch(wikiUrl);
      const data = await response.json();

      const searchResults = data?.query?.search || [];
      if (searchResults.length === 0) return null;

      // 5. Semântica dinâmica: Multiple sources in parallel
      const candidates: SearchCandidate[] = await Promise.all(
        searchResults.slice(0, 3).map(async (res: any) => {
          // Fetch extract for the page
          const extractUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&titles=${encodeURIComponent(res.title)}&format=json&origin=*`;
          const extRes = await fetch(extractUrl);
          const extData = await extRes.json();
          const pageId = Object.keys(extData.query.pages)[0];
          const text = extData.query.pages[pageId].extract || "";
          
          return {
            text,
            source: `wikipedia.org/wiki/${res.title.replace(/ /g, '_')}`,
            coherence: processorCallback(text)
          };
        })
      );

      // Select candidate with highest Pt
      candidates.sort((a, b) => b.coherence - a.coherence);
      return candidates[0];

    } catch (error) {
      console.warn("Search failed, falling back to local processing.", error);
      return null;
    }
  }
}
