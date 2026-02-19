import React, { useState } from 'react';
import { SidebarItem } from './SidebarItem';
import { useCampaign } from '../context/CampaignContext';

interface MainLayoutProps {
    children: React.ReactNode;
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, activeTab, setActiveTab }) => {
    const { profile } = useCampaign();

    // Navigation Menu Configuration
    const navItems = [
        { id: 'dashboard', label: 'Command Center', icon: 'fa-layer-group' },
        { id: 'intelligence', label: 'Intelligence', icon: 'fa-brain', color: 'bg-indigo-600' },
        { id: 'darkroom', label: 'The Darkroom', icon: 'fa-camera', color: 'bg-indigo-600' },
        { id: 'megaphone', label: 'Megaphone', icon: 'fa-bullhorn', color: 'bg-indigo-600' },
        { id: 'warchest', label: 'War Chest', icon: 'fa-piggy-bank', color: 'bg-emerald-600' },
        { id: 'legal', label: 'Legal Shield', icon: 'fa-shield-alt', color: 'bg-slate-600' },
        { id: 'dna', label: 'DNA Vault', icon: 'fa-fingerprint', color: 'bg-slate-600' },
    ];

    return (
        <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden">
            {/* SIDEBAR NAVIGATION */}
            <div className="w-80 bg-white border-r border-slate-100 flex flex-col justify-between shrink-0 z-20 shadow-2xl shadow-indigo-100/50">
                <div className="p-8">
                    {/* CAMPAIGN HEADER */}
                    <div className="mb-10">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-lg shadow-lg shadow-indigo-200">
                                <i className="fas fa-flag-usa"></i>
                            </div>
                            <div>
                                <h1 className="font-black text-xl italic tracking-tighter text-slate-900 uppercase">
                                    Victory<span className="text-indigo-600">Ops</span>
                                </h1>
                                <p className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">Campaign OS 2.0</p>
                            </div>
                        </div>

                        {/* CAMPAIGN SELECTOR */}
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold">
                                {profile.party}
                            </div>
                            <div className="overflow-hidden">
                                <p className="font-bold text-xs text-slate-800 truncate">{profile.candidate_name}</p>
                                <p className="text-[10px] font-medium text-slate-400 truncate">{profile.office_sought}</p>
                            </div>
                            <i className="fas fa-chevron-down text-slate-300 ml-auto text-xs"></i>
                        </div>
                    </div>

                    {/* NAVIGATION */}
                    <nav className="space-y-2">
                        {navItems.map(item => (
                            <SidebarItem
                                key={item.id}
                                icon={item.icon}
                                label={item.label}
                                active={activeTab === item.id}
                                onClick={() => setActiveTab(item.id)}
                                color={item.color}
                            />
                        ))}
                    </nav>
                </div>

                {/* BOTTOM ACTIONS */}
                <div className="p-8 bg-slate-50/50 border-t border-slate-100">
                    {/* Placeholder for settings/user profile if needed */}
                    <button className="w-full py-3 px-4 bg-white border border-slate-200 rounded-xl text-slate-500 font-bold text-xs hover:bg-slate-50 transition-colors shadow-sm">
                        <i className="fas fa-cog mr-2"></i> Settings
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 overflow-y-auto relative z-10 p-8">
                <div className="max-w-7xl mx-auto pb-20">
                    {children}
                </div>
            </main>
        </div>
    );
};
