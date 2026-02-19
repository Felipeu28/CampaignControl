import React from 'react';

/**
 * Reusable Card Component
 * Extracted from App.tsx
 */
export const Card: React.FC<{
    title?: string;
    subtitle?: string;
    icon?: string;
    children: React.ReactNode;
    className?: string;
    action?: React.ReactNode;
    compact?: boolean;
}> = ({ title, subtitle, icon, children, className = '', action, compact = false }) => (
    <div className={`bg-white rounded-[3rem] ${compact ? 'p-8' : 'p-12'} border border-slate-100 shadow-lg ${className}`}>
        {(title || subtitle || icon || action) && (
            <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-6">
                    {icon && (
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-xl shadow-indigo-200">
                            <i className={`fas ${icon}`}></i>
                        </div>
                    )}
                    <div>
                        {title && <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-800 leading-none">{title}</h3>}
                        {subtitle && <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-2">{subtitle}</p>}
                    </div>
                </div>
                {action && <div>{action}</div>}
            </div>
        )}
        {children}
    </div>
);
