
import React from 'react';
import VisionButton from './VisionButton';
import WindowFrame from './WindowFrame';
import { useWalletContext } from '../contexts/WalletContext';
import { useStoryProtocol } from '../hooks/useStoryProtocol';
import { useIpFormState } from '../hooks/useIpFormState';

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
        contributors, handleAddContributor, handleUpdateContributor, handleRemoveContributor,
        licenseData, setLicenseData,
        totalEquity
    } = useIpFormState(walletAddress);

    const handleRegisterIp = async () => {
        const result = await registerIp(title, registrationType, contributors, licenseData);
        if (result.success) {
            alert(result.message || `Success! IP Registered.\nID: ${result.ipId}`);
            onClose();
        } else {
            alert(result.message || "Registration Failed.");
        }
    };

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
                                        className="w-full h-16 bg-black/20 border border-white/10 rounded-2xl px-6 text-xl text-white focus:outline-none focus:ring-2 focus:ring-[#F7931A]/50 transition-all shadow-inner"
                                    />
                                </div>
                                
                                {registrationType === 'REMIX' && (
                                    <div>
                                        <label className="block text-sm font-bold text-white/60 uppercase tracking-widest mb-2 font-mono">Parent IP Address</label>
                                        <input 
                                            type="text" 
                                            placeholder="0x..." 
                                            className="w-full h-16 bg-black/20 border border-white/10 rounded-2xl px-6 text-xl text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#F7931A]/50 transition-all shadow-inner"
                                        />
                                    </div>
                                )}
                            </div>
                            
                            <div className="h-64 border-2 border-dashed border-white/10 rounded-[40px] flex flex-col items-center justify-center bg-white/[0.02] hover:bg-white/[0.05] transition-all cursor-pointer group hover:border-white/30">
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
                                    {contributors.map((c, idx) => (
                                        <div key={idx} className="flex gap-4 items-center">
                                            <div className="flex-1">
                                                <label className="text-xs text-white/30 font-mono uppercase tracking-wider mb-1 block">Wallet Address</label>
                                                <input 
                                                    type="text" 
                                                    value={c.address}
                                                    onChange={(e) => handleUpdateContributor(idx, 'address', e.target.value)}
                                                    placeholder="0x..."
                                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 font-mono text-white focus:outline-none focus:border-[#F7931A]"
                                                />
                                            </div>
                                            <div className="w-32">
                                                <label className="text-xs text-white/30 font-mono uppercase tracking-wider mb-1 block">Equity %</label>
                                                <input 
                                                    type="number" 
                                                    value={c.percentage}
                                                    onChange={(e) => handleUpdateContributor(idx, 'percentage', e.target.value)}
                                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 font-mono text-white text-right focus:outline-none focus:border-[#F7931A]"
                                                />
                                            </div>
                                            {contributors.length > 1 && (
                                                <button onClick={() => handleRemoveContributor(idx)} className="mt-5 text-red-400 hover:text-red-300 px-2">✕</button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="mt-6 flex justify-between items-center border-t border-white/10 pt-6">
                                    <button 
                                        onClick={handleAddContributor}
                                        className="flex items-center gap-2 text-[#F7931A] font-bold hover:text-[#ffad42] transition-colors"
                                    >
                                        + Add Creator
                                    </button>
                                    <div className={`font-mono text-xl ${totalEquity !== 100 ? 'text-red-400' : 'text-green-400'}`}>
                                        Total: {totalEquity}%
                                    </div>
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

                            <div className="grid grid-cols-2 gap-6">
                                <button 
                                    onClick={() => setLicenseData({...licenseData, type: 'NON_COMMERCIAL_REMIX'})}
                                    className={`p-8 rounded-3xl border text-left transition-all ${licenseData.type === 'NON_COMMERCIAL_REMIX' ? 'bg-[#F7931A]/20 border-[#F7931A] shadow-[0_0_30px_rgba(247,147,26,0.2)]' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                                >
                                    <div className="text-3xl mb-4">🎁</div>
                                    <h3 className="text-xl font-bold text-white mb-2">Social Remix</h3>
                                    <p className="text-sm text-white/50 mb-4">Non-Commercial Use. Great for viral growth and community building.</p>
                                    <div className="flex gap-2 text-xs font-mono text-white/40">
                                        <span className="bg-white/10 px-2 py-1 rounded">Attribution</span>
                                        <span className="bg-white/10 px-2 py-1 rounded">Share-Alike</span>
                                    </div>
                                </button>

                                <button 
                                    onClick={() => setLicenseData({...licenseData, type: 'COMMERCIAL_USE'})}
                                    className={`p-8 rounded-3xl border text-left transition-all ${licenseData.type === 'COMMERCIAL_USE' ? 'bg-[#F7931A]/20 border-[#F7931A] shadow-[0_0_30px_rgba(247,147,26,0.2)]' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                                >
                                    <div className="text-3xl mb-4">💼</div>
                                    <h3 className="text-xl font-bold text-white mb-2">Commercial Franchise</h3>
                                    <p className="text-sm text-white/50 mb-4">Monetize derivatives. Set an upfront fee and revenue share.</p>
                                    <div className="flex gap-2 text-xs font-mono text-white/40">
                                        <span className="bg-white/10 px-2 py-1 rounded">Royalties</span>
                                        <span className="bg-white/10 px-2 py-1 rounded">Commercial</span>
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
                                                className="w-full h-14 bg-black/20 border border-white/10 rounded-xl px-4 text-white font-mono focus:border-[#F7931A] outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-white/60 uppercase tracking-widest mb-2 font-mono">Revenue Share (%)</label>
                                            <input 
                                                type="number" 
                                                value={licenseData.commercialRevShare}
                                                onChange={(e) => setLicenseData({...licenseData, commercialRevShare: Number(e.target.value)})}
                                                className="w-full h-14 bg-black/20 border border-white/10 rounded-xl px-4 text-white font-mono focus:border-[#F7931A] outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

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
                                    { l: 'Creators', v: `${contributors.length} Addresses` },
                                    { l: 'License', v: licenseData.type === 'COMMERCIAL_USE' ? 'Commercial' : 'Social Remix' },
                                    { l: 'Rev Share', v: `${licenseData.commercialRevShare}%` },
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
