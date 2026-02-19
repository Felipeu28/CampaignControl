import React from 'react';

/**
 * Sidebar Navigation Item
 * Extracted from App.tsx
 */
export const SidebarItem: React.FC<{
    icon: string;
    label: string;
    active: boolean;
    onClick: () => void;
    color?: string;
}> = ({ icon, label, active, onClick, color = 'bg-indigo-600' }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${active
                ? `${color} text-white shadow-xl scale-105`
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
    >
        <i className={`fas ${icon} text-lg`}></i>
        <span className="text-[11px]">{label}</span>
    </button>
);
