import React from 'react';

interface SidebarItemProps {
    icon: string;
    label: string;
    active: boolean;
    onClick: () => void;
    color?: string;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, onClick, color }) => {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group ${active
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-200 scale-[1.02]'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
        >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${active
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-indigo-600 group-hover:shadow-md'
                }`}>
                <i className={`fas ${icon} text-sm`}></i>
            </div>

            <span className={`text-xs font-bold uppercase tracking-wider ${active ? 'text-white' : 'text-slate-500 group-hover:text-slate-900'
                }`}>
                {label}
            </span>

            {active && (
                <div className={`ml-auto w-1.5 h-1.5 rounded-full ${color?.replace('bg-', 'bg-') || 'bg-white'}`}></div>
            )}
        </button>
    );
};
