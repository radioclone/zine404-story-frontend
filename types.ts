import React from 'react';

export type ViewState = 'HOME' | 'TERMS' | 'MEDIA' | 'DRAFT';

export interface SectionConfig {
  id: ViewState;
  label: string;
  subLabel: string;
  component?: React.ReactNode;
}

// Story Protocol / IP Data
// PIL (Programmable IP License) Standard
export interface IPLicenseParams {
    type: 'NON_COMMERCIAL_REMIX' | 'COMMERCIAL_USE' | 'COMMERCIAL_REMIX';
    commercialRevShare: number; // 0-100
    derivativesAllowed: boolean;
    attribution: boolean;
    commercializerChecker?: string; // Address
}

export interface IPAsset {
  id: string | null; // On-Chain ID
  status: 'UNREGISTERED' | 'REGISTERED';
  owner: string;
  hash: string; 
  licenseTerms: IPLicenseParams;
  parents: string[]; // Array of Parent IP IDs for Remixes
  metadataURI?: string;
}

export interface DraftContent {
  title: string;
  body: string;
  author: string;
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