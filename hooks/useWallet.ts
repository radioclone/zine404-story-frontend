
import { useState, useCallback, useRef } from 'react';
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
    
    // Lazy ref for SDK to prevent init errors on render
    const sdkRef = useRef<CoinbaseWalletSDK | null>(null);

    const getSdk = useCallback(() => {
        if (!sdkRef.current) {
            try {
                sdkRef.current = new CoinbaseWalletSDK({
                    appName: 'StoryOS',
                    appLogoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop',
                    darkMode: true
                });
            } catch (e) {
                console.warn("Coinbase SDK Init Error (Sandbox?):", e);
                return null;
            }
        }
        return sdkRef.current;
    }, []);

    const connect = useCallback(async () => {
        setIsConnecting(true);
        setIsSimulated(false);
        try {
            const sdk = getSdk();
            // If SDK failed to init (e.g. iframe blocked), throw to catch block
            if (!sdk) throw new Error("SDK_INIT_FAILED");

            // Create a Web3 Provider for Story Odyssey
            // This might also throw "Blocked a frame" in some sandboxes
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
            console.warn("Wallet connection failed (Switching to Simulation Mode):", error);
            
            // FALLBACK TO SIMULATION
            // This catches "Blocked a frame", "SDK_INIT_FAILED", "User denied", etc.
            setAddress("0x71C...9A21"); // Mock Address
            setIsSimulated(true);
            
        } finally {
            setIsConnecting(false);
        }
    }, [getSdk]);

    const disconnect = useCallback(() => {
        try {
            const sdk = getSdk();
            if (sdk) sdk.disconnect();
        } catch (e) { console.warn(e); }
        setAddress(null);
        setClient(null);
        setIsSimulated(false);
    }, [getSdk]);

    return { address, isConnecting, isSimulated, client, connect, disconnect };
};
