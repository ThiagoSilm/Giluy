// src/components/ConfigScreen.tsx
import React, { useState, useEffect } from 'react';
import { useConfigStore } from '../store/useConfigStore';
import { Eye, EyeOff, Save, Trash2 } from 'lucide-react';

export const ConfigScreen: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { saveConfig, getConfig, removeConfig, isConfigured } = useConfigStore();
    const [provider, setProvider] = useState('Gemini');
    const [apiKey, setApiKey] = useState('');
    const [baseUrl, setBaseUrl] = useState('');
    const [model, setModel] = useState('gemini-1.5-pro');
    const [showKey, setShowKey] = useState(false);

    useEffect(() => {
        const load = async () => {
            const config = await getConfig();
            if (config) {
                setProvider(config.provider);
                setApiKey(config.apiKey);
                setBaseUrl(config.baseUrl);
                setModel(config.model);
            }
        };
        load();
    }, [getConfig]);

    const handleSave = async () => {
        await saveConfig({ provider, apiKey, baseUrl, model });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-[#050505]/95 flex items-center justify-center p-4 z-50">
            <div className="bg-white/[0.02] border border-white/10 p-8 rounded-xl max-w-md w-full flex flex-col gap-6">
                <h2 className="text-xl font-serif italic text-white/90">API Configuration</h2>
                
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/50">Provider</label>
                    <select 
                        value={provider} 
                        onChange={(e) => setProvider(e.target.value)}
                        className="bg-white/[0.05] border border-white/10 p-2 rounded text-white"
                    >
                        <option>Gemini</option>
                        <option>ChatGPT</option>
                        <option>Grok</option>
                        <option>DeepSeek</option>
                        <option>Personalizado</option>
                    </select>
                </div>

                <div className="flex flex-col gap-2 relative">
                    <label className="text-[10px] uppercase tracking-widest text-white/50">API Key</label>
                    <input 
                        type={showKey ? "text" : "password"}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="bg-white/[0.05] border border-white/10 p-2 rounded text-white pr-10"
                    />
                    <button 
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-2 top-8 text-white/50"
                    >
                        {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>

                {provider === 'Personalizado' && (
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/50">Base URL</label>
                    <input 
                      value={baseUrl}
                      onChange={(e) => setBaseUrl(e.target.value)}
                      className="bg-white/[0.05] border border-white/10 p-2 rounded text-white"
                    />
                  </div>
                )}

                <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/50">Model</label>
                    <input 
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className="bg-white/[0.05] border border-white/10 p-2 rounded text-white"
                    />
                </div>

                <div className="flex gap-4">
                  <button onClick={handleSave} className="flex-1 flex gap-2 items-center justify-center p-3 bg-white text-black font-bold rounded hover:bg-white/90">
                    <Save size={16} /> Save
                  </button>
                  {isConfigured && (
                    <button onClick={() => { removeConfig(); onClose(); }} className="p-3 bg-rose-500/20 text-rose-500 rounded hover:bg-rose-500/30">
                        <Trash2 size={16} />
                    </button>
                  )}
                </div>
            </div>
        </div>
    );
};
