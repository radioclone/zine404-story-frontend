
import { useState, useEffect } from 'react';
import { Creator, LicenseConfig } from '../types';

export const useIpFormState = (walletAddress: string | null) => {
    const [activeStep, setActiveStep] = useState<string>('TYPE');
    const [registrationType, setRegistrationType] = useState<'NEW' | 'REMIX' | null>(null);
    const [title, setTitle] = useState("Untitled Asset");
    const [description, setDescription] = useState("");
    
    const [contributors, setContributors] = useState<Creator[]>([
        { address: walletAddress || '', percentage: 100 }
    ]);
    
    const [licenseData, setLicenseData] = useState<LicenseConfig>({
        type: 'NON_COMMERCIAL_REMIX',
        price: '0',
        currency: '0x912CE59144191C1204E64559FE8253a0e49E6548', // Mock USDC
        commercialRevShare: 10,
        derivativesAllowed: true,
        attribution: true,
        aiTrainingAllowed: true
    });

    // Auto-update first contributor when wallet connects
    useEffect(() => {
        if (walletAddress && contributors.length === 1 && contributors[0].address === '') {
            setContributors([{ address: walletAddress, percentage: 100 }]);
        }
    }, [walletAddress]);

    const handleAddContributor = () => {
        setContributors([...contributors, { address: '', percentage: 0 }]);
    };

    const handleUpdateContributor = (index: number, field: keyof Creator, value: string | number) => {
        const updated = [...contributors];
        if (field === 'percentage') {
            updated[index].percentage = Number(value);
        } else {
            updated[index].address = String(value);
        }
        setContributors(updated);
    };

    const handleRemoveContributor = (index: number) => {
        if (contributors.length > 1) {
            setContributors(contributors.filter((_, i) => i !== index));
        }
    };

    const totalEquity = contributors.reduce((acc, curr) => acc + curr.percentage, 0);

    return {
        activeStep,
        setActiveStep,
        registrationType,
        setRegistrationType,
        title,
        setTitle,
        description,
        setDescription,
        contributors,
        handleAddContributor,
        handleUpdateContributor,
        handleRemoveContributor,
        licenseData,
        setLicenseData,
        totalEquity
    };
};
