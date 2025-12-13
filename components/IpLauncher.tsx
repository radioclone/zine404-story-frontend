
import React, { useState } from 'react';
import VisionButton from './VisionButton';
import WindowFrame from './WindowFrame';
import { useWalletContext } from '../contexts/WalletContext';
import { useStoryProtocol } from '../hooks/useStoryProtocol';
import { useIpFormState } from '../hooks/useIpFormState';
import { suggestLicenseTerms, LicenseSuggestion } from '../services/geminiService';

const STORY_STEPS = [
    { id: 'TYPE', label: 'Registration type', number: 1 },
    { id: 'ASSET', label: 'Asset Details', number: 2 },
    { id: 'CONTRIB', label: 'Contributors', number: 3 },
    { id: 'LICENSE', label: 'Licensing', number: 4 },
    { id: 'REVIEW', label: 'Review & Register', number: 5 },
];

interface IpLauncherProps {
    onClose: () => void;
}

const IpLauncher: React.FC<IpLauncherProps> = ({ onClose }) => {
    // Hooks & Context
    const wallet = useWalletContext();
    const { registerIp, isMinting } = useStoryProtocol(wallet);
    const { address: walletAddress } = wallet;

    // Form State (Managed by Hook)
    const {
        activeStep, setActiveStep,
        registrationType, setRegistrationType,
        title, setTitle,
        description, setDescription,
        contributors, handleAddContributor, handleUpdateContributor, handleRemoveContributor,
        licenseData, setLicenseData,
        totalEquity
    } = useIpFormState(walletAddress);

    // AI Suggestion State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [suggestion, setSuggestion] = useState<LicenseSuggestion | null>(null);

    const handleRegisterIp = async () => {
        const result = await registerIp(title, registrationType, contributors, licenseData);
        if (result.success) {
            alert(result.message || `Success! IP Registered.\nID: ${result.ipId}`);
            onClose();
        } else {
            alert(result.message || "Registration Failed.");
        }
    };

    const handleAiSuggest = async () => {
        setIsAnalyzing(true);
        setSuggestion(null);
        const result = await suggestLicenseTerms(title, description);
        if (result) {
            setSuggestion(result);
        }
        setIsAnalyzing(false);
    };

    const applySuggestion = () => {
        if (!suggestion) return;
        setLicenseData(prev => ({
            ...prev,
            type: suggestion.type,
            commercialRevShare: suggestion.commercialRevShare || prev.commercialRevShare,
            price: suggestion.price || prev.price
        }));
        setSuggestion(null);
    };

    // Helper for address validation
    const isValidAddress = (addr: string) => /^0x[a-fA-F0-9]{40}$/.test(addr);

    return (
        <WindowFrame title="Register IP" onClose={onClose}>
            
            {/* SIDEBAR */}
            <div className="w-80 bg-white/[0.03] border-r border-white/5 flex flex-col p-10 gap-10 relative">
                <div>
                    <div className="w-16 h-16 rounded-[20px] bg-gradient-to-tr from-[#F7931A] to-orange-600 shadow-xl flex items-center justify-center mb-6 ring-1 ring-white/20">
                        <span className="text-3xl font-bold text-white font-mono">IP</span>
                    </div>
                    <h2 className="font-bold text-2xl leading-none text-white tracking-tight font-sans">Register IP</h2>
                    <p className="text-sm text-white/50 mt-3 font-medium leading-relaxed font-mono">Secure your creative assets on the Story Protocol.</p>
                </div>

                <div className="space-y-2">
                    {STORY_STEPS.map((step, idx) => {
                        const isActive = activeStep === step.id;
                        const isDone = STORY_STEPS.findIndex(s => s.id === activeStep) > idx;
                        
                        return (
                            <div 
                                key={step.id} 
                                onClick={() => setActiveStep(step.id)}
                                className={`flex items-center gap-4 py-4 px-4 -mx-4 rounded-xl cursor-pointer transition-all duration-300 ${isActive ? 'bg-white/10 shadow-lg' : 'hover:bg-white/5 opacity-60 hover:opacity-100'}`}
                            >
                                <div className={`
                                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all font-mono
                                    ${isActive ? 'bg-white text-black shadow-md' : isDone ? 'bg-green-400 text-black' : 'bg-white/10 border border-white/20 text-white'}
                                `}>
                                    {isDone ? '✓' : step.number}
                                </div>
                                <span className={`font-semibold text-base ${isActive ? 'text-white' : 'text-white/80'}`}>{step.label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 relative flex flex-col">
                <div className="flex-1 px-24 py-20 overflow-y-auto custom-scrollbar">
                    
                    {/* STEP 1: TYPE */}
                    {activeStep === 'TYPE' && (
                        <div className="space-y-12 animate-scale-in max-w-4xl">
                            <div>
                                <h1 className="text-5xl font-light mb-4 tracking-tight">Registration Type</h1>
                                <p className="text-xl text-white/60 font-light font-mono">
                                    Choose how you want to register your work.
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-8">
                                <VisionButton 
                                    active={registrationType === 'NEW'}
                                    onClick={() => {
                                        setRegistrationType('NEW');
                                        setTimeout(() => setActiveStep('ASSET'), 400); 
                                    }}
                                    icon={<span className="text-4xl">✨</span>}
                                    label="New IP Asset"
                                    subLabel="Original work. Not based on existing on-chain IP."
                                    className="h-80"
                                />

                                <VisionButton 
                                    active={registrationType === 'REMIX'}
                                    onClick={() => {
                                        setRegistrationType('REMIX');
                                        setTimeout(() => setActiveStep('ASSET'), 400);
                                    }}
                                    icon={<span className="text-4xl">⚡</span>}
                                    label="Remix"
                                    subLabel="Derivative work. Based on an existing IP Asset."
                                    className="h-80"
                                />
                            </div>
                        </div>
                    )}
                    
                    {/* STEP 2: UPLOAD / ASSET */}
                    {activeStep === 'ASSET' && (
                        <div className="space-y-10 animate-scale-in max-w-4xl">
                            <div>
                                <h1 className="text-5xl font-light mb-4">
                                    {registrationType === 'REMIX' ? 'Remix Details' : 'Asset Details'}
                                </h1>
                                <p className="text-xl text-white/60 font-light font-mono">
                                    Define the core metadata for your asset.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-white/60 uppercase tracking-widest mb-2 font-mono">Title</label>
                                    <input 
                                        type="text" 
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full h-16 bg-black/20 border border-white/10 rounded-2xl px-6 text-xl text-white focus:outline-none focus:border-white focus:shadow-[0_0_25px_rgba(255,255,255,0.3)] transition-all duration-300 shadow-inner"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-white/60 uppercase tracking-widest mb-2 font-mono">Description / Logline</label>
                                    <textarea 
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full h-32 bg-black/20 border border-white/10 rounded-2xl p-6 text-lg text-white focus:outline-none focus:border-white focus:shadow-[0_0_25px_rgba(255,255,255,0.3)] transition-all duration-300 shadow-inner resize-none custom-scrollbar"
                                        placeholder="A brief description of your story or asset to help define its licensing strategy..."
                                    />
                                </div>
                                
                                {registrationType === 'REMIX' && (
                                    <div>
                                        <label className="block text-sm font-bold text-white/60 uppercase tracking-widest mb-2 font-mono">Parent IP Address</label>
                                        <input 
                                            type="text" 
                                            placeholder="0x..." 
                                            className="w-full h-16 bg-black/20 border border-white/10 rounded-2xl px-6 text-xl text-white font-mono focus:outline-none focus:border-white focus:shadow-[0_0_25px_rgba(255,255,255,0.3)] transition-all duration-300 shadow-inner"
                                        />
                                    </div>
                                )}
                            </div>
                            
                            <div className="h-48 border-2 border-dashed border-white/10 rounded-[40px] flex flex-col items-center justify-center bg-white/[0.02] hover:bg-white/[0.05] transition-all cursor-pointer group hover:border-white/30">
                                    <div className="flex gap-8 mb-6 opacity-40 group-hover:opacity-80 transition-opacity scale-125">
                                        <span className="text-5xl drop-shadow-lg">☁️</span>
                                    </div>
                                    <p className="text-xl text-white/80 font-light">Upload Media File</p>
                                    <p className="text-sm text-white/40 mt-1 font-mono">Supports PDF, PNG, MP3</p>
                            </div>

                            <div className="flex justify-between pt-8">
                                <button onClick={() => setActiveStep('TYPE')} className="text-white/60 hover:text-white px-8 py-4 text-lg font-medium transition-colors font-mono">Back</button>
                                <button 
                                    onClick={() => setActiveStep('CONTRIB')} 
                                    className="px-12 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                                >
                                    Next: Contributors
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: CONTRIBUTORS */}
                    {activeStep === 'CONTRIB' && (
                        <div className="space-y-10 animate-scale-in max-w-4xl">
                            <div>
                                <h1 className="text-5xl font-light mb-4">Ownership & Equity</h1>
                                <p className="text-xl text-white/60 font-light font-mono">
                                    Who owns this IP? The total percentage must equal 100%.
                                </p>
                            </div>

                            <div className="bg-white/[0.03] border border-white/10 rounded-[30px] p-8 backdrop-blur-md">
                                <div className="space-y-4">
                                    {contributors.map((c, idx) => {
                                        const isCurrentUser = walletAddress && c.address.toLowerCase() === walletAddress.toLowerCase();
                                        const isValid = c.address === '' || isValidAddress(c.address);

                                        return (
                                        <div key={idx} className="flex gap-4 items-start">
                                            <div className="flex-1">
                                                <div className="flex justify-between mb-1">
                                                     <label className="text-xs text-white/30 font-mono uppercase tracking-wider block">Wallet Address</label>
                                                     {isCurrentUser && <span className="text-[10px] text-[#F7931A] font-bold tracking-wider bg-[#F7931A]/10 px-2 rounded border border-[#F7931A]/20">YOU</span>}
                                                </div>
                                                <input 
                                                    type="text" 
                                                    value={c.address}
                                                    onChange={(e) => handleUpdateContributor(idx, 'address', e.target.value)}
                                                    placeholder="0x..."
                                                    className={`w-full bg-black/20 border rounded-xl px-4 py-3 font-mono text-white focus:outline-none transition-all duration-300 ${!isValid ? 'border-red-500/50 focus:border-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'border-white/10 focus:border-white focus:shadow-[0_0_25px_rgba(255,255,255,0.3)]'}`}
                                                />
                                                {!isValid && (
                                                    <div className="text-[10px] text-red-400 mt-1 pl-1">Invalid ETH address format</div>
                                                )}
                                            </div>
                                            <div className="w-32">
                                                <label className="text-xs text-white/30 font-mono uppercase tracking-wider mb-1 block">Equity %</label>
                                                <div className="relative">
                                                    <input 
                                                        type="number" 
                                                        value={c.percentage}
                                                        onChange={(e) => handleUpdateContributor(idx, 'percentage', e.target.value)}
                                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 font-mono text-white text-right focus:outline-none focus:border-white focus:shadow-[0_0_25px_rgba(255,255,255,0.3)] transition-all duration-300"
                                                    />
                                                    <span className="absolute right-8 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none">%</span>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleRemoveContributor(idx)} 
                                                className={`mt-7 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${contributors.length > 1 ? 'text-white/20 hover:text-red-400 hover:bg-white/5' : 'text-white/5 cursor-not-allowed'}`}
                                                disabled={contributors.length <= 1}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )})}
                                </div>
                                
                                <div className="mt-8 pt-6 border-t border-white/10">
                                    <div className="flex justify-between items-center mb-2">
                                        <button 
                                            onClick={handleAddContributor}
                                            className="flex items-center gap-2 text-[#F7931A] font-bold text-sm hover:text-[#ffad42] transition-colors group"
                                        >
                                            <span className="w-5 h-5 rounded border border-[#F7931A]/30 flex items-center justify-center group-hover:border-[#F7931A]">+</span>
                                            Add Creator
                                        </button>
                                        <div className={`font-mono text-lg font-bold ${totalEquity !== 100 ? 'text-red-400' : 'text-green-400'}`}>
                                            {totalEquity}% <span className="text-white/30 text-sm font-normal">/ 100%</span>
                                        </div>
                                    </div>
                                    {/* Equity Progress Bar */}
                                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden flex">
                                        {contributors.map((c, i) => (
                                            <div 
                                                key={i}
                                                style={{ width: `${c.percentage}%` }}
                                                className={`h-full border-r border-black/20 last:border-0 transition-all duration-500 ${totalEquity > 100 ? 'bg-red-500' : 'bg-white/40 odd:bg-white/30'}`}
                                            />
                                        ))}
                                    </div>
                                    {totalEquity !== 100 && (
                                        <p className="text-right text-xs text-red-400 mt-2 font-mono">
                                            Total equity must equal exactly 100%.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-between pt-8">
                                <button onClick={() => setActiveStep('ASSET')} className="text-white/60 hover:text-white px-8 py-4 text-lg font-medium transition-colors font-mono">Back</button>
                                <button 
                                    onClick={() => setActiveStep('LICENSE')} 
                                    disabled={totalEquity !== 100}
                                    className="px-12 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:hover:scale-100"
                                >
                                    Next: Licensing
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: LICENSING */}
                    {activeStep === 'LICENSE' && (
                        <div className="space-y-10 animate-scale-in max-w-4xl">
                            <div>
                                <h1 className="text-5xl font-light mb-4">Programmable IP License</h1>
                                <p className="text-xl text-white/60 font-light font-mono">
                                    Define the terms for how others can use and remix your work.
                                </p>
                            </div>

                             {/* AI ADVISOR BLOCK */}
                            <div className="bg-gradient-to-r from-[#F7931A]/10 to-transparent p-6 rounded-2xl border border-[#F7931A]/20 relative overflow-hidden">
                                <div className="relative z-10 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-[#F7931A]/20 flex items-center justify-center text-2xl">⚡</div>
                                        <div>
                                            <h3 className="font-bold text-white text-lg">Not sure which license fits?</h3>
                                            <p className="text-white/60 text-sm">Let Muze analyze your description to suggest the best strategy.</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleAiSuggest}
                                        disabled={isAnalyzing || !description}
                                        className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                                    >
                                        {isAnalyzing ? 'Analyzing...' : 'Ask Muze'}
                                    </button>
                                </div>
                                {suggestion && (
                                    <div className="mt-6 pt-6 border-t border-white/10 animate-scale-in">
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <div className="text-[#F7931A] font-mono text-xs font-bold uppercase tracking-wider mb-2">Recommendation</div>
                                                <p className="text-white/90 text-sm leading-relaxed mb-4">{suggestion.reasoning}</p>
                                                <div className="flex gap-2">
                                                    <span className="bg-white/10 px-2 py-1 rounded text-xs text-white/70 font-mono">
                                                        Type: {suggestion.type}
                                                    </span>
                                                    {suggestion.type === 'COMMERCIAL_USE' && (
                                                        <span className="bg-white/10 px-2 py-1 rounded text-xs text-white/70 font-mono">
                                                            RevShare: {suggestion.commercialRevShare}%
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-end">
                                                <button 
                                                    onClick={applySuggestion}
                                                    className="bg-[#F7931A] text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#ffad42]"
                                                >
                                                    Apply Terms
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <button 
                                    onClick={() => setLicenseData({...licenseData, type: 'NON_COMMERCIAL_REMIX'})}
                                    className={`group relative p-8 rounded-3xl border text-left transition-all ${licenseData.type === 'NON_COMMERCIAL_REMIX' ? 'bg-[#F7931A]/20 border-[#F7931A] shadow-[0_0_30px_rgba(247,147,26,0.2)]' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                                >
                                    <div className="text-3xl mb-4">🎁</div>
                                    <h3 className="text-xl font-bold text-white mb-2">Social Remix</h3>
                                    <p className="text-sm text-white/50 mb-4">Non-Commercial Use. Great for viral growth and community building.</p>
                                    <div className="flex gap-2 text-xs font-mono text-white/40">
                                        <span className="bg-white/10 px-2 py-1 rounded">Attribution</span>
                                        <span className="bg-white/10 px-2 py-1 rounded">Share-Alike</span>
                                    </div>

                                    {/* TOOLTIP */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-72 p-4 bg-[#1c1c1e] border border-white/20 rounded-xl text-xs font-mono leading-relaxed text-white/90 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-[0_20px_40px_rgba(0,0,0,0.6)] z-50 backdrop-blur-xl translate-y-2 group-hover:translate-y-0 duration-300">
                                        <p className="mb-2"><span className="text-[#F7931A] font-bold">IMPLICATION:</span> Freely shareable but strictly non-profit.</p>
                                        <p>Remixers must credit you and release their work under these same terms. Ideal for memes, fan fiction, and community lore.</p>
                                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#1c1c1e] border-b border-r border-white/20 rotate-45"></div>
                                    </div>
                                </button>

                                <button 
                                    onClick={() => setLicenseData({...licenseData, type: 'COMMERCIAL_USE'})}
                                    className={`group relative p-8 rounded-3xl border text-left transition-all ${licenseData.type === 'COMMERCIAL_USE' ? 'bg-[#F7931A]/20 border-[#F7931A] shadow-[0_0_30px_rgba(247,147,26,0.2)]' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                                >
                                    <div className="text-3xl mb-4">💼</div>
                                    <h3 className="text-xl font-bold text-white mb-2">Commercial Franchise</h3>
                                    <p className="text-sm text-white/50 mb-4">Monetize derivatives. Set an upfront fee and revenue share.</p>
                                    <div className="flex gap-2 text-xs font-mono text-white/40">
                                        <span className="bg-white/10 px-2 py-1 rounded">Royalties</span>
                                        <span className="bg-white/10 px-2 py-1 rounded">Commercial</span>
                                    </div>

                                    {/* TOOLTIP */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-72 p-4 bg-[#1c1c1e] border border-white/20 rounded-xl text-xs font-mono leading-relaxed text-white/90 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-[0_20px_40px_rgba(0,0,0,0.6)] z-50 backdrop-blur-xl translate-y-2 group-hover:translate-y-0 duration-300">
                                        <p className="mb-2"><span className="text-[#F7931A] font-bold">IMPLICATION:</span> Programmable Revenue Stream.</p>
                                        <p>Allows others to sell work based on yours. You earn an upfront Mint Fee + a % of their revenue automatically via smart contract.</p>
                                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#1c1c1e] border-b border-r border-white/20 rotate-45"></div>
                                    </div>
                                </button>
                            </div>

                            {licenseData.type === 'COMMERCIAL_USE' && (
                                <div className="bg-white/[0.03] border border-white/10 rounded-[30px] p-8 animate-scale-in">
                                    <div className="grid grid-cols-2 gap-8">
                                        <div>
                                            <label className="block text-sm font-bold text-white/60 uppercase tracking-widest mb-2 font-mono">Minting Fee (IP)</label>
                                            <input 
                                                type="text" 
                                                value={licenseData.price}
                                                onChange={(e) => setLicenseData({...licenseData, price: e.target.value})}
                                                className="w-full h-14 bg-black/20 border border-white/10 rounded-xl px-4 text-white font-mono focus:outline-none focus:border-white focus:shadow-[0_0_25px_rgba(255,255,255,0.3)] transition-all duration-300"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-white/60 uppercase tracking-widest mb-2 font-mono">Revenue Share (%)</label>
                                            <input 
                                                type="number" 
                                                value={licenseData.commercialRevShare}
                                                onChange={(e) => setLicenseData({...licenseData, commercialRevShare: Number(e.target.value)})}
                                                className="w-full h-14 bg-black/20 border border-white/10 rounded-xl px-4 text-white font-mono focus:outline-none focus:border-white focus:shadow-[0_0_25px_rgba(255,255,255,0.3)] transition-all duration-300"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* EXTRA PERMISSIONS: AI + UDL */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
                                    <input 
                                        type="checkbox" 
                                        checked={licenseData.aiTrainingAllowed}
                                        onChange={(e) => setLicenseData({...licenseData, aiTrainingAllowed: e.target.checked})}
                                        className="w-6 h-6 rounded border-white/20 bg-black/50 accent-[#F7931A]"
                                    />
                                    <div>
                                        <div className="font-bold text-white">Allow AI Training</div>
                                        <div className="text-xs text-white/50">Permit AI models to train on this content.</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 bg-[#00FF41]/5 p-4 rounded-xl border border-[#00FF41]/20">
                                    <input 
                                        type="checkbox" 
                                        checked={licenseData.useUdl}
                                        onChange={(e) => setLicenseData({...licenseData, useUdl: e.target.checked})}
                                        className="w-6 h-6 rounded border-white/20 bg-black/50 accent-[#00FF41]"
                                    />
                                    <div>
                                        <div className="font-bold text-[#00FF41]">Universal Data License</div>
                                        <div className="text-xs text-[#00FF41]/50">Enable Arweave/AO UDL compatibility.</div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between pt-8">
                                <button onClick={() => setActiveStep('CONTRIB')} className="text-white/60 hover:text-white px-8 py-4 text-lg font-medium transition-colors font-mono">Back</button>
                                <button 
                                    onClick={() => setActiveStep('REVIEW')} 
                                    className="px-12 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                                >
                                    Next: Review
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 5: REVIEW */}
                    {activeStep === 'REVIEW' && (
                        <div className="space-y-12 animate-scale-in max-w-3xl mx-auto text-center">
                                <div>
                                <h1 className="text-5xl font-light mb-4">Ready to Mint?</h1>
                                <p className="text-xl text-white/60 font-light font-mono">Confirm your details before writing to the blockchain.</p>
                            </div>
                            
                            <div className="p-10 rounded-[40px] bg-white/[0.03] border border-white/10 backdrop-blur-xl space-y-6 text-left shadow-2xl">
                                {[
                                    { l: 'Network', v: 'Story Odyssey Testnet' },
                                    { l: 'Type', v: registrationType === 'REMIX' ? 'Remix' : 'New IP' },
                                    { l: 'Title', v: title },
                                    { l: 'Description', v: description ? description.substring(0, 30) + "..." : "None" },
                                ].map((item, i) => (
                                    <div key={i} className="flex justify-between items-center py-4 border-b border-white/5 font-mono">
                                        <span className="text-white/40 text-lg">{item.l}</span>
                                        <span className="text-xl font-medium text-white">{item.v}</span>
                                    </div>
                                ))}

                                {/* Contributors Breakdown */}
                                <div className="py-4 border-b border-white/5">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-white/40 text-lg font-mono">Creators</span>
                                        <span className="text-sm text-white/40 font-mono">{contributors.length} Total</span>
                                    </div>
                                    <div className="space-y-2">
                                        {contributors.map((c, i) => (
                                            <div key={i} className="flex justify-between items-center bg-white/5 rounded-lg px-4 py-2 text-sm font-mono">
                                                <span className="text-white/80">{c.address.slice(0,6)}...{c.address.slice(-4)}</span>
                                                <span className="text-[#F7931A]">{c.percentage}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {[
                                    { l: 'License', v: licenseData.type === 'COMMERCIAL_USE' ? 'Commercial' : 'Social Remix' },
                                    { l: 'Rev Share', v: `${licenseData.commercialRevShare}%` },
                                    { l: 'UDL', v: licenseData.useUdl ? 'Enabled' : 'Disabled' }
                                ].map((item, i) => (
                                    <div key={i} className="flex justify-between items-center py-4 border-b border-white/5 last:border-0 font-mono">
                                        <span className="text-white/40 text-lg">{item.l}</span>
                                        <span className="text-xl font-medium text-white">{item.v}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-8">
                                <button 
                                    onClick={handleRegisterIp}
                                    disabled={isMinting || !walletAddress}
                                    className={`
                                        w-full py-6 rounded-full font-bold text-xl transition-all shadow-2xl
                                        ${!walletAddress ? 'bg-white/10 text-white/40' : 'bg-white text-black hover:scale-[1.02] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)]'}
                                    `}
                                >
                                    {isMinting ? 'Registering...' : !walletAddress ? 'Connect Wallet Required' : 'Confirm Registration'}
                                </button>
                                <button onClick={() => setActiveStep('LICENSE')} className="mt-8 text-white/40 hover:text-white transition-colors font-mono">Go Back</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </WindowFrame>
    );
};

export default IpLauncher;
