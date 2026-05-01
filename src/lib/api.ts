import { useConfigStore } from '../store/useConfigStore';

export const callApi = async (systemInstruction: string, userInput: string) => {
    const config = await useConfigStore.getState().getConfig();
    let key = config?.apiKey || process.env.GEMINI_API_KEY;
    let provider = config?.provider || 'Gemini';
    let model = config?.model || 'gemini-1.5-flash';
    let baseUrl = config?.baseUrl || '';

    if (!key) throw new Error("MISSING_API_KEY");

    if (provider === 'Gemini') {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userInput }] }],
                systemInstruction: { parts: [{ text: systemInstruction }] }
            })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API_ERROR: ${errorData.error?.message || response.statusText}`);
        }
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } else {
        // OpenAI Compatible APIs (ChatGPT, Grok, DeepSeek, Custom)
        if (!baseUrl) {
          switch(provider) {
            case 'ChatGPT': baseUrl = 'https://api.openai.com/v1'; break;
            case 'DeepSeek': baseUrl = 'https://api.deepseek.com/v1'; break;
            case 'Grok': baseUrl = 'https://api.x.ai/v1'; break;
            default: throw new Error(`MISSING_BASE_URL_FOR_${provider}`);
          }
        }
        const url = `${baseUrl}/chat/completions`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${key}`
            },
            body: JSON.stringify({
                model: model,
                messages: [
                  { role: "system", content: systemInstruction },
                  { role: "user", content: userInput }
                ]
            })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API_ERROR: ${errorData.error?.message || response.statusText}`);
        }
        const data = await response.json();
        return data.choices[0].message.content;
    }
};
