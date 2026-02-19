import React from 'react';
import { Card } from '../../components/ui/Card';
import { useCampaign } from '../../context/CampaignContext';

export const CommandCenter: React.FC = () => {
    const { profile, loadingStates } = useCampaign();

    const voteGoal = profile.metadata.vote_goal;
    const budget = profile.metadata.budget_estimate;
    const daysUntilElection = Math.ceil((new Date(profile.filing_info?.election_date || '').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
                <div>
                    <h2 className="text-4xl font-black text-slate-800 italic uppercase tracking-tighter">
                        Command Center
                    </h2>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] mt-2">
                        Mission Control
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100">
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Election Day Countdown:</span>
                    <span className="text-xl font-black text-indigo-800">{daysUntilElection > 0 ? daysUntilElection : '0'} Days</span>
                </div>
            </div>

            {/* Top Value Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card title="Vote Goal" icon="fa-check-to-slot">
                    <div className="pt-2">
                        <p className="text-3xl font-black text-slate-800 tracking-tight">
                            {voteGoal.target_vote_goal.toLocaleString()}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                            Votes Needed to Win
                        </p>
                        <div className="w-full bg-slate-100 rounded-full h-2 mt-4 overflow-hidden">
                            {/* Placeholder progress */}
                            <div className="bg-emerald-500 h-full w-1/4 rounded-full"></div>
                        </div>
                        <p className="text-[9px] text-right text-slate-400 mt-1 font-mono">Current Proj: 25%</p>
                    </div>
                </Card>

                <Card title="War Chest" icon="fa-sack-dollar">
                    <div className="pt-2">
                        <p className="text-3xl font-black text-slate-800 tracking-tight">
                            ${profile.compliance_tracker?.total_raised.toLocaleString()}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                            Total Raised
                        </p>
                        <div className="w-full bg-slate-100 rounded-full h-2 mt-4 overflow-hidden">
                            <div
                                className="bg-amber-500 h-full rounded-full"
                                style={{ width: `${Math.min(((profile.compliance_tracker?.total_raised || 0) / (budget?.total_projected_needed || 1)) * 100, 100)}%` }}
                            ></div>
                        </div>
                        <p className="text-[9px] text-right text-slate-400 mt-1 font-mono">
                            of ${budget?.total_projected_needed.toLocaleString()} Goal
                        </p>
                    </div>
                </Card>

                <Card title="Opponents" icon="fa-user-ninja">
                    <div className="pt-2">
                        <p className="text-3xl font-black text-slate-800 tracking-tight">
                            {profile.metadata.opponents.length}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                            Active Rivals
                        </p>
                        <div className="flex -space-x-2 mt-4 overflow-hidden py-1">
                            {profile.metadata.opponents.map((opp, i) => (
                                <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-500" title={opp.name}>
                                    {opp.name.charAt(0)}
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

                <Card title="System Status" icon="fa-server">
                    <div className="pt-2">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-sm font-bold text-emerald-600">All Systems Operational</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                            AI Agents Ready
                        </p>
                        <div className="grid grid-cols-4 gap-1 mt-4">
                            {['Probe', 'Intel', 'Visual', 'Audit'].map((s, i) => (
                                <div key={i} className="h-1 bg-emerald-400 rounded-full"></div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity / Feed */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">
                        Campaign Intelligence Feed
                    </h3>
                    {/* Simulated Feed Items */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                            <i className="fas fa-search"></i>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800">New Opposition Report Available</p>
                            <p className="text-xs text-slate-500 mt-1">Deep scan completed on {profile.metadata.opponents[0]?.name || 'Opponent'}. Vulnerabilities identified in voting record.</p>
                            <div className="mt-3 flex gap-2">
                                <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded text-slate-500">Just now</span>
                                <span className="text-[10px] font-bold bg-indigo-50 px-2 py-1 rounded text-indigo-600">Intelligence</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                            <i className="fas fa-file-invoice-dollar"></i>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800">Budget Audit Recommended</p>
                            <p className="text-xs text-slate-500 mt-1">Q2 fundraising goals are 15% behind schedule. Run a War Chest audit to optimize spending.</p>
                            <div className="mt-3 flex gap-2">
                                <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded text-slate-500">2 hours ago</span>
                                <span className="text-[10px] font-bold bg-emerald-50 px-2 py-1 rounded text-emerald-600">Finance</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-6">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">
                        Quick Actions
                    </h3>
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        {[
                            { label: 'Run Daily Briefing', icon: 'fa-sun', color: 'text-amber-500' },
                            { label: 'Update Voter File', icon: 'fa-users', color: 'text-blue-500' },
                            { label: 'Check FEC Compliance', icon: 'fa-scale-balanced', color: 'text-slate-600' },
                            { label: 'Draft Press Release', icon: 'fa-pen-nib', color: 'text-purple-500' }
                        ].map((action, i) => (
                            <button key={i} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 text-left">
                                <div className="flex items-center gap-3">
                                    <i className={`fas ${action.icon} ${action.color} w-5 text-center`}></i>
                                    <span className="text-xs font-bold text-slate-700">{action.label}</span>
                                </div>
                                <i className="fas fa-chevron-right text-[10px] text-slate-300"></i>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
