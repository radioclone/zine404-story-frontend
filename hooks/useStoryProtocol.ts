import { useState } from 'react';
import { StoryClient, StoryConfig } from '@story-protocol/core-sdk';
import { WalletState } from './useWallet';
import { Creator, LicenseConfig } from '../types';

export const useStoryProtocol = (wallet: WalletState) => {
    const [isMinting, setIsMinting] = useState(false);

    const registerIp = async (
        title: string,
        registrationType: 'NEW' | 'REMIX' | null,
        contributors: Creator[],
        licenseData: LicenseConfig
    ): Promise<{ success: boolean; ipId?: string; message?: string }> => {
        const { address: walletAddress, client: walletClient, isSimulated } = wallet;

        if (!walletAddress) {
            return { success: false, message: "Wallet not connected" };
        }

        setIsMinting(true);

        // 1. SIMULATION FALLBACK
        if (isSimulated || !walletClient) {
            console.log("SANDBOX DETECTED: Simulating Story Protocol Registration...");
            return new Promise((resolve) => {
                setTimeout(() => {
                    setIsMinting(false);
                    resolve({ 
                        success: true, 
                        ipId: `sim-${Date.now()}`,
                        message: `Success! (Simulation Mode)\n\nRegistered: ${title}\nLicense: ${licenseData.type}`
                    });
                }, 2000);
            });
        }

        // 2. REAL SDK EXECUTION
        try {
            console.log("Initializing Story Protocol Client...");
            const config: StoryConfig = {
                account: walletClient.account,
                transport: walletClient.transport,
                chainId: 'odyssey',
            };
            const client = StoryClient.newClient(config);

            const ipMetadata = {
                title: title,
                description: "Created via StoryOS",
                ipType: registrationType === 'REMIX' ? 'DERIVATIVE' : 'ORIGINAL',
                creators: contributors,
            };

            console.log("Registering with License Terms:", licenseData);

            const response = await client.ipAsset.mintAndRegisterIp({
                spgNftContract: '0xd2a4a4Cb40357773b658BECc66A6c165FD91488c',
                ipMetadata: {
                    ipMetadataURI: 'https://ipfs.io/ipfs/QmPlaceholder...',
                    ipMetadataHash: '0x' + '0'.repeat(64),
                    nftMetadataURI: 'https://ipfs.io/ipfs/QmPlaceholder...',
                    nftMetadataHash: '0x' + '0'.repeat(64),
                },
                txOptions: { waitForTransaction: true }
            });

            console.log(`Story Protocol IP Registered: ${response.ipId}`);
            return { success: true, ipId: response.ipId };

        } catch (error) {
            console.error("Story Protocol Registration Failed:", error);
            return { success: false, message: "Registration Failed. Check console for details." };
        } finally {
            setIsMinting(false);
        }
    };

    return { registerIp, isMinting };
};
