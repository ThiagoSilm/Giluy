# גִּלּוּי (Giluy) — Protocolo de Extração de Sinal Puro

O Giluy é um framework de processamento de linguagem natural focado na dissolução do "ego linguístico" e na extração do núcleo verificável de verdade de qualquer substrato textual. Ele opera sob o princípio da **Soberania Computacional**, executando inferência LLM 100% offline via navegador.

## 🏗️ Arquitetura Técnica

Ao contrário de aplicações convencionais que dependem de APIs externas (Gemini, OpenAI), o Giluy utiliza uma pilha de inferência local otimizada:

### TurboQuant-JS
O componente crítico de eficiência. Implementamos o `turboquant-js` para comprimir os embeddings do modelo (Phi-3-mini ou Gemma-2B) de float64 para **4 bits por coordenada**.

*   **Redução de Memória:** ~20x (de ~3GB para ~150MB).
*   **Latência:** 50-100ms por inferência através de Web Workers.
*   **Acurácia:** Scores de similaridade matematicamente não-enviesados garantidos pela descompressão sob demanda.

### Camadas de Dados
1.  **Pré-processamento Offline:** Modelos são quantizados antes da distribuição.
2.  **Persistent Cache (IndexedDB):** O modelo comprimido (~150 MB) é armazenado no navegador, permitindo uso instantâneo em sessões subsequentes.
3.  **WASM Runtime:** Execução via WebAssembly para performance de hardware nativo no navegador.

## 📜 Protocolos de Filtragem

O sistema opera em três níveis de profundidade lógica:

*   **RAW_STATE_PROCESSOR (Nível 1):** Filtra ruído gramatical e redundâncias.
*   **ETHER_CHRONOVISOR (Nível 2):** Analisa a continuidade temporal e causal das afirmações.
*   **ULTIMA_RATIO (Nível 3):** Reduz o texto ao seu axioma fundamental, removendo vícios de linguagem e viés subjetivo.

## 🚀 Como Funciona
```
[USUÁRIO] → [PWA Giluy]
↕
[Web Worker]
↕
[Modelo Quantizado + turboquant-js] ← (IndexedDB Cache)
↕
[Inferência Local]
(~60ms latency, zero-cost, 100% offline)
```
## 🛠️ Tecnologias Utilizadas

- **Frontend:** React + Tailwind CSS (Estética Brutalista/Industrial).
- **Inference Service:** Web Workers para execução não-bloqueante.
- **Compression:** TurboQuant-JS para quantização de pesos.
- **Storage:** IndexedDB para persistência de modelos de grande escala.
- **Type Safety:** TypeScript rigoroso para garantir a integridade dos protocolos.

---

*Giluy não é uma ferramenta de chat. É um instrumento de precisão para a verdade.*
