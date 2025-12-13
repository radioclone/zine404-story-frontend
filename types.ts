
import React from 'react';

export type RegistrationStep = 'TYPE' | 'DETAILS' | 'CONTRIBUTORS' | 'LICENSING' | 'REVIEW';

export type IconType = 'NODE' | 'APP' | 'TRASH' | 'FILE' | 'FOLDER' | 'MUSIC' | 'SHOPPING' | 'TIMER' | 'BOOK';

export interface IconData {
    id: string;
    label: string;
    x: number;
    y: number;
    type: IconType;
    iconImage?: string; 
    url?: string;
}

export interface Creator {
    address: string;
    percentage: number;
}

export interface LicenseConfig {
    type: 'OPEN_USE' | 'NON_COMMERCIAL_REMIX' | 'COMMERCIAL_USE' | 'COMMERCIAL_REMIX';
    price: string; // Minting Fee
    currency: string; // Token address
    commercialRevShare: number; // 0-100
    derivativesAllowed: boolean;
    attribution: boolean;
    aiTrainingAllowed: boolean; // "Commercial Remix" AI permission
}

export interface IPAsset {
    id: string | null;
    status: 'UNREGISTERED' | 'REGISTERED';
    isRemix: boolean;
    parentId?: string; // For Remixes
    title: string;
    description: string;
    creators: Creator[];
    licenseTerms: LicenseConfig;
}

export interface DraftContent {
    media: {
        file: File | null;
        previewUrl: string | null;
        hash: string | null;
        mimeType: string | null;
    };
    ip: IPAsset;
}

export interface NetworkState {
    isConnected: boolean;
    address: string | null;
    chainId: number | null;
    isCorrectNetwork: boolean;
}

// AI Agent Types
export interface AgentMessage {
    id: string;
    role: 'user' | 'agent' | 'system';
    content: string;
    action?: 'SUGGEST_TERMS' | 'READY_TO_MINT';
    data?: any;
}
