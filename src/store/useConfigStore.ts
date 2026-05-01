// src/store/useConfigStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { encrypt, decrypt } from '../lib/crypto';

interface ApiConfig {
    provider: string;
    apiKey: string;
    baseUrl: string;
    model: string;
}

interface ConfigState {
    encryptedConfig: string | null;
    isConfigured: boolean;
    
    // Needs to interact with crypto, so these are async
    saveConfig: (config: ApiConfig) => Promise<void>;
    getConfig: () => Promise<ApiConfig | null>;
    removeConfig: () => void;
}

const getFingerprint = () => `${navigator.userAgent}-${navigator.language}`;

export const useConfigStore = create<ConfigState>()(
    persist(
        (set, get) => ({
            encryptedConfig: null,
            isConfigured: false,

            saveConfig: async (config: ApiConfig) => {
                const encrypted = await encrypt(JSON.stringify(config), getFingerprint());
                set({ encryptedConfig: encrypted, isConfigured: true });
            },

            getConfig: async () => {
                const { encryptedConfig } = get();
                if (!encryptedConfig) return null;
                try {
                    const decrypted = await decrypt(encryptedConfig, getFingerprint());
                    return JSON.parse(decrypted);
                } catch {
                    return null;
                }
            },

            removeConfig: () => {
                set({ encryptedConfig: null, isConfigured: false });
            }
        }),
        {
            name: 'giluy-config',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ encryptedConfig: state.encryptedConfig, isConfigured: state.isConfigured }),
        }
    )
);
