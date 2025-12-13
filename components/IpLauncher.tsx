
import React, { useState } from 'react';
import VisionButton from './VisionButton';
import WindowFrame from './WindowFrame';
import { useWalletContext } from '../contexts/WalletContext';
import { useStoryProtocol } from '../hooks/useStoryProtocol';
import { useIpFormState } from '../hooks/useIpFormState';
import { suggestLicenseTerms, LicenseSuggestion } from '../services/geminiService';

const STORY_STEPS = [
    { id: 'TYPE', label: 'Type', mobileLabel: 'Type', number: 1 },
    { id: 'ASSET', label: 'Asset Details', mobileLabel: 'Details', number: 2 },
    { id: 'CONTRIB', label: 'Contributors', mobileLabel: 'Team', number: 3 },
    { id: 'LICENSE', label: 'Licensing', mobileLabel: 'Terms', number: 4 },
    { id: 'REVIEW', label: 'Review', mobileLabel: 'Mint', number: 5 },
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

    // Shared Styles for "Enhanced Focus" Inputs
    const inputClasses = "w-full bg-white/[0.02] text-white/60 border border-white/[0.05] rounded-xl px-4 md:px-6 py-3 md:py-4 font-mono text-base md:text-lg focus:outline-none focus:bg-white/[0.06] focus:text-white focus:border-white/20 focus:shadow-[0_0_30px_rgba(255,255,255,0.05)] transition-all duration-300 placeholder-white/20";
    
    return (
        <WindowFrame title="Register IP" onClose={onClose}>
            <div className="flex flex-col md:flex-row w-full h-full relative">
                
                {/* SIDEBAR (Desktop: Left Col, Mobile: Top Scroll) */}
                <div className="w-full md:w-80 bg-white/[0.03] border-b md:border-b-0 md:border-r border-white/5 flex flex-col md:p-10 p-4 gap-4 md:gap-10 relative z-20">
                    <div className="hidden md:block">
                        <div className="w-16 h-16 rounded-[20px] bg-gradient-to-tr from-[#F7931A] to-orange-600 shadow-xl flex items-center justify-center mb-6 ring-1 ring-white/20">
                            <span className="text-3xl font-bold text-white font-mono">IP</span>
                        </div>
                        <h2 className="font-bold text-2xl leading-none text-white tracking-tight font-sans">Register IP</h2>
                        <p className="text-sm text-white/50 mt-3 font-medium leading-relaxed font-mono">Secure your creative assets on the Story Protocol.</p>
                    </div>

                    <div className="flex md:flex-col overflow-x-auto md:overflow-visible no-scrollbar gap-2 md:gap-2 md:space-y-2 snap-x">
                        {STORY_STEPS.map((step, idx) => {
                            const isActive = activeStep === step.id;
                            const isDone = STORY_STEPS.findIndex(s => s.id === activeStep) > idx;
                            
                            return (
                                <div 
                                    key={step.id} 
                                    onClick={() => setActiveStep(step.id)}
                                    className={`
                                        flex items-center gap-3 md:gap-4 py-2 px-3 md:py-4 md:px-4 md:-mx-4 rounded-xl cursor-pointer transition-all duration-300 snap-start flex-shrink-0
                                        ${isActive ? 'bg-white/10 shadow-lg' : 'hover:bg-white/5 opacity-60 hover:opacity-100'}
                                    `}
                                >
                                    <div className={`
                                        w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold transition-all font-mono
                                        ${isActive ? 'bg-white text-black shadow-md' : isDone ? 'bg-green-400 text-black' : 'bg-white/10 border border-white/20 text-white'}
                                    `}>
                                        {isDone ? '✓' : step.number}
                                    </div>
                                    <span className={`font-semibold text-sm md:text-base whitespace-nowrap ${isActive ? 'text-white' : 'text-white/80'}`}>
                                        <span className="md:hidden">{step.mobileLabel}</span>
                                        <span className="hidden md:inline">{step.label}</span>
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* MAIN CONTENT */}
                <div className="flex-1 relative flex flex-col overflow-hidden">
                    <div className="flex-1 px-4 md:px-24 py-8 md:py-20 overflow-y-auto custom-scrollbar">
                        
                        {/* STEP 1: TYPE */}
                        {activeStep === 'TYPE' && (
                            <div className="space-y-8 md:space-y-12 animate-scale-in max-w-4xl pb-10">
                                <div>
                                    <h1 className="text-3xl md:text-5xl font-light mb-2 md:mb-4 tracking-tight">Registration Type</h1>
                                    <p className="text-base md:text-xl text-white/60 font-light font-mono">
                                        Choose how you want to register your work.
                                    </p>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                                    <VisionButton 
                                        active={registrationType === 'NEW'}
                                        onClick={() => {
                                            setRegistrationType('NEW');
                                            setTimeout(() => setActiveStep('ASSET'), 400); 
                                        }}
                                        icon={<span className="text-4xl">✨</span>}
                                        label="New IP Asset"
                                        subLabel="Original work. Not based on existing on-chain IP."
                                        className="h-auto md:h-80 min-h-[160px]"
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
                                        className="h-auto md:h-80 min-h-[160px]"
                                    />
                                </div>
                            </div>
                        )}
                        
                        {/* STEP 2: UPLOAD / ASSET */}
                        {activeStep === 'ASSET' && (
                            <div className="space-y-6 md:space-y-10 animate-scale-in max-w-4xl pb-10">
                                <div>
                                    <h1 className="text-3xl md:text-5xl font-light mb-2 md:mb-4">
                                        {registrationType === 'REMIX' ? 'Remix Details' : 'Asset Details'}
                                    </h1>
                                    <p className="text-base md:text-xl text-white/60 font-light font-mono">
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
                                            className={inputClasses}
                                            placeholder="The Neon Samurai"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-white/60 uppercase tracking-widest mb-2 font-mono">Description</label>
                                        <textarea 
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className={`${inputClasses} h-32 md:h-40 resize-none`}
                                            placeholder="A brief description of your story..."
                                        />
                                    </div>
                                    
                                    {registrationType === 'REMIX' && (
                                        <div>
                                            <label className="block text-sm font-bold text-white/60 uppercase tracking-widest mb-2 font-mono">Parent IP Address</label>
                                            <input 
                                                type="text" 
                                                placeholder="0x..." 
                                                className={inputClasses}
                                            />
                                        </div>
                                    )}
                                </div>
                                
                                <div className="h-32 md:h-48 border-2 border-dashed border-white/10 rounded-[20px] md:rounded-[40px] flex flex-col items-center justify-center bg-white/[0.02] hover:bg-white/[0.05] transition-all cursor-pointer group hover:border-white/30">
                                        <div className="flex gap-8 mb-2 md:mb-6 opacity-40 group-hover:opacity-80 transition-opacity scale-90 md:scale-125">
                                            <span className="text-3xl md:text-5xl drop-shadow-lg">☁️</span>
                                        </div>
                                        <p className="text-base md:text-xl text-white/80 font-light">Upload Media File</p>
                                </div>

                                <div className="flex flex-col-reverse md:flex-row justify-between pt-4 md:pt-8 gap-4">
                                    <button onClick={() => setActiveStep('TYPE')} className="text-white/60 hover:text-white px-8 py-4 text-base md:text-lg font-medium transition-colors font-mono">Back</button>
                                    <button 
                                        onClick={() => setActiveStep('CONTRIB')} 
                                        className="w-full md:w-auto px-12 py-4 bg-white text-black rounded-full font-bold text-base md:text-lg hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                                    >
                                        Next: Contributors
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: CONTRIBUTORS */}
                        {activeStep === 'CONTRIB' && (
                            <div className="space-y-6 md:space-y-10 animate-scale-in max-w-4xl pb-10">
                                <div>
                                    <h1 className="text-3xl md:text-5xl font-light mb-2 md:mb-4">Ownership</h1>
                                    <p className="text-base md:text-xl text-white/60 font-light font-mono">
                                        Who owns this IP?
                                    </p>
                                </div>

                                <div className="bg-white/[0.03] border border-white/10 rounded-[30px] p-6 md:p-8 backdrop-blur-md">
                                    <div className="space-y-4">
                                        {contributors.map((c, idx) => {
                                            const isCurrentUser = walletAddress && c.address.toLowerCase() === walletAddress.toLowerCase();
                                            const isValid = c.address === '' || isValidAddress(c.address);

                                            return (
                                            <div key={idx} className="flex flex-col md:flex-row gap-4 items-start border-b border-white/5 pb-4 md:border-0 md:pb-0 last:border-0">
                                                <div className="flex-1 w-full">
                                                    <div className="flex justify-between mb-1">
                                                         <label className="text-xs text-white/30 font-mono uppercase tracking-wider block">Address</label>
                                                         {isCurrentUser && <span className="text-[10px] text-[#F7931A] font-bold tracking-wider bg-[#F7931A]/10 px-2 rounded border border-[#F7931A]/20">YOU</span>}
                                                    </div>
                                                    <input 
                                                        type="text" 
                                                        value={c.address}
                                                        onChange={(e) => handleUpdateContributor(idx, 'address', e.target.value)}
                                                        placeholder="0x..."
                                                        className={`${inputClasses} py-2 md:py-3 ${!isValid ? 'border-red-500/50 focus:border-red-500' : ''}`}
                                                    />
                                                </div>
                                                <div className="flex gap-4 w-full md:w-auto items-end">
                                                    <div className="flex-1 md:w-32">
                                                        <label className="text-xs text-white/30 font-mono uppercase tracking-wider mb-1 block">Equity %</label>
                                                        <div className="relative">
                                                            <input 
                                                                type="number" 
                                                                value={c.percentage}
                                                                onChange={(e) => handleUpdateContributor(idx, 'percentage', e.target.value)}
                                                                className={`${inputClasses} py-2 md:py-3 text-right`}
                                                            />
                                                            <span className="absolute right-8 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none">%</span>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleRemoveContributor(idx)} 
                                                        className={`h-12 w-12 rounded-xl border border-white/10 flex items-center justify-center transition-colors ${contributors.length > 1 ? 'text-white/20 hover:text-red-400 hover:bg-white/5' : 'text-white/5 cursor-not-allowed'}`}
                                                        disabled={contributors.length <= 1}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
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
                                                Add
                                            </button>
                                            <div className={`font-mono text-lg font-bold ${totalEquity !== 100 ? 'text-red-400' : 'text-green-400'}`}>
                                                {totalEquity}%
                                            </div>
                                        </div>
                                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden flex">
                                            {contributors.map((c, i) => (
                                                <div 
                                                    key={i}
                                                    style={{ width: `${c.percentage}%` }}
                                                    className={`h-full border-r border-black/20 last:border-0 transition-all duration-500 ${totalEquity > 100 ? 'bg-red-500' : 'bg-white/40 odd:bg-white/30'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col-reverse md:flex-row justify-between pt-4 md:pt-8 gap-4">
                                    <button onClick={() => setActiveStep('ASSET')} className="text-white/60 hover:text-white px-8 py-4 text-base md:text-lg font-medium transition-colors font-mono">Back</button>
                                    <button 
                                        onClick={() => setActiveStep('LICENSE')} 
                                        disabled={totalEquity !== 100}
                                        className="w-full md:w-auto px-12 py-4 bg-white text-black rounded-full font-bold text-base md:text-lg hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:hover:scale-100"
                                    >
                                        Next: Licensing
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 4: LICENSING */}
                        {activeStep === 'LICENSE' && (
                            <div className="space-y-6 md:space-y-10 animate-scale-in max-w-4xl pb-10">
                                <div>
                                    <h1 className="text-3xl md:text-5xl font-light mb-2 md:mb-4">License Terms</h1>
                                    <p className="text-base md:text-xl text-white/60 font-light font-mono">
                                        Define how others can use your work.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                    <button 
                                        onClick={() => setLicenseData({...licenseData, type: 'NON_COMMERCIAL_REMIX'})}
                                        className={`group relative p-6 md:p-8 rounded-3xl border text-left transition-all ${licenseData.type === 'NON_COMMERCIAL_REMIX' ? 'bg-[#F7931A]/20 border-[#F7931A] shadow-[0_0_30px_rgba(247,147,26,0.2)]' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                                    >
                                        <div className="text-3xl mb-4">🎁</div>
                                        <h3 className="text-xl font-bold text-white mb-2">Social Remix</h3>
                                        <p className="text-sm text-white/50 mb-4">Non-Commercial Use. Great for viral growth and community building.</p>
                                        
                                        {/* Tooltip */}
                                        <div className="absolute top-full mt-4 left-0 w-full p-4 bg-black/90 border border-white/20 rounded-xl text-xs text-white/70 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                                            <p className="font-mono">
                                                <strong className="text-white block mb-1">IMPLICATIONS:</strong>
                                                Free remixing allowed. Attribution required. Viral-friendly License (CC-BY-NC-SA style).
                                            </p>
                                        </div>
                                    </button>

                                    <button 
                                        onClick={() => setLicenseData({...licenseData, type: 'COMMERCIAL_USE'})}
                                        className={`group relative p-6 md:p-8 rounded-3xl border text-left transition-all ${licenseData.type === 'COMMERCIAL_USE' ? 'bg-[#F7931A]/20 border-[#F7931A] shadow-[0_0_30px_rgba(247,147,26,0.2)]' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                                    >
                                        <div className="text-3xl mb-4">💼</div>
                                        <h3 className="text-xl font-bold text-white mb-2">Commercial</h3>
                                        <p className="text-sm text-white/50 mb-4">Monetize derivatives. Set an upfront fee and revenue share.</p>

                                        {/* Tooltip */}
                                        <div className="absolute top-full mt-4 left-0 w-full p-4 bg-black/90 border border-white/20 rounded-xl text-xs text-white/70 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                                            <p className="font-mono">
                                                <strong className="text-white block mb-1">IMPLICATIONS:</strong>
                                                Requires payment to remix. Revenue flows automatically to your wallet. Enforces royalties on-chain.
                                            </p>
                                        </div>
                                    </button>
                                </div>

                                {licenseData.type === 'COMMERCIAL_USE' && (
                                    <div className="bg-white/[0.03] border border-white/10 rounded-[30px] p-6 md:p-8 animate-scale-in">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                            <div>
                                                <label className="block text-sm font-bold text-white/60 uppercase tracking-widest mb-2 font-mono">Minting Fee (IP)</label>
                                                <input 
                                                    type="text" 
                                                    value={licenseData.price}
                                                    onChange={(e) => setLicenseData({...licenseData, price: e.target.value})}
                                                    className={inputClasses}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-white/60 uppercase tracking-widest mb-2 font-mono">Revenue Share (%)</label>
                                                <input 
                                                    type="number" 
                                                    value={licenseData.commercialRevShare}
                                                    onChange={(e) => setLicenseData({...licenseData, commercialRevShare: Number(e.target.value)})}
                                                    className={inputClasses}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col-reverse md:flex-row justify-between pt-4 md:pt-8 gap-4">
                                    <button onClick={() => setActiveStep('CONTRIB')} className="text-white/60 hover:text-white px-8 py-4 text-base md:text-lg font-medium transition-colors font-mono">Back</button>
                                    <button 
                                        onClick={() => setActiveStep('REVIEW')} 
                                        className="w-full md:w-auto px-12 py-4 bg-white text-black rounded-full font-bold text-base md:text-lg hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                                    >
                                        Next: Review
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 5: REVIEW */}
                        {activeStep === 'REVIEW' && (
                            <div className="space-y-8 md:space-y-12 animate-scale-in max-w-3xl mx-auto text-center pb-10">
                                <div>
                                    <h1 className="text-3xl md:text-5xl font-light mb-2 md:mb-4">Ready to Mint?</h1>
                                    <p className="text-base md:text-xl text-white/60 font-light font-mono">Confirm details before writing to blockchain.</p>
                                </div>
                                
                                <div className="p-6 md:p-10 rounded-[30px] md:rounded-[40px] bg-white/[0.03] border border-white/10 backdrop-blur-xl space-y-4 md:space-y-6 text-left shadow-2xl">
                                    {[
                                        { l: 'Network', v: 'Story Odyssey' },
                                        { l: 'Type', v: registrationType === 'REMIX' ? 'Remix' : 'New IP' },
                                        { l: 'Title', v: title },
                                    ].map((item, i) => (
                                        <div key={i} className="flex justify-between items-center py-3 md:py-4 border-b border-white/5 font-mono">
                                            <span className="text-white/40 text-sm md:text-lg">{item.l}</span>
                                            <span className="text-base md:text-xl font-medium text-white text-right">{item.v}</span>
                                        </div>
                                    ))}
                                    
                                     {/* Simple License Summary */}
                                     <div className="flex justify-between items-center py-3 md:py-4 border-b border-white/5 font-mono">
                                        <span className="text-white/40 text-sm md:text-lg">License</span>
                                        <span className="text-base md:text-xl font-medium text-white text-right">
                                            {licenseData.type === 'COMMERCIAL_USE' ? 'Commercial' : 'Social'}
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-4 md:pt-8 flex flex-col gap-4">
                                    <button 
                                        onClick={handleRegisterIp}
                                        disabled={isMinting || !walletAddress}
                                        className={`
                                            w-full py-5 md:py-6 rounded-full font-bold text-lg md:text-xl transition-all shadow-2xl
                                            ${!walletAddress ? 'bg-white/10 text-white/40' : 'bg-white text-black hover:scale-[1.02] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)]'}
                                        `}
                                    >
                                        {isMinting ? 'Registering...' : !walletAddress ? 'Connect Wallet Required' : 'Confirm Registration'}
                                    </button>
                                    <button onClick={() => setActiveStep('LICENSE')} className="text-white/40 hover:text-white transition-colors font-mono text-sm">Go Back</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </WindowFrame>
    );
};

export default IpLauncher;
