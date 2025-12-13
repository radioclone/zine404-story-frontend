
import { useState, useCallback, useEffect } from 'react';
import { createWalletClient, custom, defineChain, WalletClient } from 'viem';
import CoinbaseWalletSDK from '@coinbase/wallet-sdk';

// --- STORY PROTOCOL ODYSSEY CONFIG ---
export const storyOdyssey = defineChain({
  id: 1516, 
  name: 'Story Odyssey',
  nativeCurrency: {
    decimals: 18,
    name: 'IP',
    symbol: 'IP',
  },
  rpcUrls: {
    default: { http: ['https://odyssey.storyrpc.io'] }, 
    public: { http: ['https://odyssey.storyrpc.io'] },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://odyssey.storyscan.xyz' },
  },
  testnet: true,
});

export interface WalletState {
    address: string | null;
    isConnecting: boolean;
    isSimulated: boolean;
    client: WalletClient | null;
    connect: () => Promise<void>;
    disconnect: () => void;
}

export const useWallet = (): WalletState => {
    const [address, setAddress] = useState<string | null>(null);
    const [client, setClient] = useState<WalletClient | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isSimulated, setIsSimulated] = useState(false);

    // Initialize Coinbase SDK
    const sdk = new CoinbaseWalletSDK({
        appName: 'Electronic Hollywood II',
        appLogoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop',
        darkMode: true
    });

    const connect = useCallback(async () => {
        setIsConnecting(true);
        setIsSimulated(false);
        try {
            // Create a Web3 Provider for Story Odyssey
            const ethereum = sdk.makeWeb3Provider(storyOdyssey.rpcUrls.default.http[0], storyOdyssey.id);

            // Request Accounts (Triggers Popup/Extension)
            const [account] = await ethereum.request({ method: 'eth_requestAccounts' }) as string[];
            
            if (account) {
                setAddress(account);
                
                // Create Viem Client for SDK usage
                const walletClient = createWalletClient({
                    account: account as `0x${string}`,
                    chain: storyOdyssey,
                    transport: custom(ethereum)
                });
                
                setClient(walletClient);
            }
        } catch (error: any) {
            console.error("Wallet connection failed:", error);
            
            // SECURITY FALLBACK: 
            // If running in a sandbox (like StackBlitz/Replit) that blocks cross-origin iframes/popups,
            // fallback to Simulation Mode so the UI can still be tested.
            const msg = error?.message || String(error);
            if (msg.includes('Blocked a frame') || msg.includes('cross-origin')) {
                console.warn("Sandbox environment detected. Enabling Wallet Simulation Mode.");
                setAddress("0x71C...9A21"); // Mock Address
                setIsSimulated(true);
            }
        } finally {
            setIsConnecting(false);
        }
    }, []);

    const disconnect = useCallback(() => {
        try {
            sdk.disconnect();
        } catch (e) { console.warn(e); }
        setAddress(null);
        setClient(null);
        setIsSimulated(false);
    }, []);

    return { address, isConnecting, isSimulated, client, connect, disconnect };
};
