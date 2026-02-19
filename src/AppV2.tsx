import React, { useState } from 'react';
import { CampaignProvider } from './context/CampaignContext';
import { MainLayout } from './layouts/MainLayout';
import { CommandCenter } from './features/dashboard/CommandCenter';
import { IntelligenceDashboard } from './features/intelligence/IntelligenceDashboard';
import { Darkroom } from './features/branding/Darkroom';
import { MegaphoneStudio } from './features/creative/MegaphoneStudio';
import { WarChest } from './features/finance/WarChest';
import { LegalShield } from './features/compliance/LegalShield';
import { CampaignDNA } from './features/campaign/CampaignDNA';

const AppContent: React.FC = () => {
    const [activeTab, setActiveTab] = useState('dashboard');

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <CommandCenter />;
            case 'intelligence':
                return <IntelligenceDashboard />;
            case 'darkroom':
                return <Darkroom />;
            case 'megaphone':
                return <MegaphoneStudio />;
            case 'warchest':
                return <WarChest />;
            case 'legal':
                return <LegalShield />;
            case 'dna':
                return <CampaignDNA />;
            default:
                return <CommandCenter />;
        }
    };

    return (
        <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            {renderContent()}
        </MainLayout>
    );
};

const AppV2: React.FC = () => {
    return (
        <CampaignProvider>
            <AppContent />
        </CampaignProvider>
    );
};

export default AppV2;
