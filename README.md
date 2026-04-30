# גִּלּוּי (Giluy) — Protocolo de Sinal Puro

**Giluy** é um processador de linguagem offline projetado para a extração do núcleo verificável de verdade em substratos textuais. Utiliza uma arquitetura **Local-First** com compressão de embeddings de alta performance.

## 🚀 Arquitetura TurboQuant-JS

O diferencial crítico do Giluy é a integração do **TurboQuant-JS**, que permite a execução de modelos LLM (como Phi-3-mini ou Gemma-2B) diretamente no navegador com recursos mínimos.

- **Compressão de 2-4 bits:** Redução de ~20x no tamanho do modelo (de ~3 GB para ~150 MB).
- **Zero Latência de API:** A inferência ocorre 100% offline em um Web Worker dedicado.
- **Persistência IndexedDB:** O modelo quantizado é armazenado localmente após o primeiro carregamento, garantindo funcionamento instantâneo em sessões subsequentes.
- **Scores Não-Enviesados:** Descompressão on-demand para cálculos de similaridade matematicamente precisos.

## 🛠 Camadas de Processamento

A aplicação utiliza protocolos de filtragem profunda para purificar o sinal linguístico:

1.  **RAW_STATE_PROCESSOR:** Decomposição do texto em vetores de estado puro.
2.  **ETHER_CHRONOVISOR:** Verificação de continuidade e factualidade histórica.
3.  **Local Inference:** Processamento via TurboQuant (~50-100ms por bloco).

## 📦 Tecnologias

- **Frontend:** React + Tailwind CSS + Framer Motion.
- **Inferência:** TurboQuant-JS + Web Workers.
- **Cache:** IndexedDB + ModelCache Service.
- **Gerenciamento de Estado:** Zustand (com persistência local).

## 📖 Como usar

1.  Acesse a PWA instalável.
2.  Clique em **"Activate local engine"** para baixar e quantizar o modelo (~150MB).
3.  Insira o texto para processamento.
4.  O Giluy extrairá o sinal puro sem enviar nenhum dado para servidores externos.

---

**Nota:** Este software opera sob o princípio da dissolução do ego linguístico. O sinal é a única verdade.
