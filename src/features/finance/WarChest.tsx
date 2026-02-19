import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { useCampaign } from '../../context/CampaignContext';
import { useGemini } from '../../hooks/useGemini';
import { handleAPIError } from '../../utils/helpers';

export const WarChest: React.FC = () => {
    const {
        profile,
        loadingStates,
        setLoading,
        updateMetadata,
        budgetAuditResult,
        setBudgetAuditResult,
        addChatMessage
    } = useCampaign();

    const { generateText } = useGemini();
    const [activeTab, setActiveTab] = useState<'budget' | 'fundraising'>('budget');

    const budgetData = profile.metadata.budget_estimate;
    const totalRaised = profile.compliance_tracker?.total_raised || 0;
    const voteGoal = profile.metadata.vote_goal.target_vote_goal;

    const runBudgetAudit = async () => {
        setLoading('budgetAudit', true);
        addChatMessage('ai', '💰 Analyzing campaign budget allocation...');

        try {
            const auditPrompt = `Conduct a strategic budget audit for ${profile.candidate_name}'s ${profile.office_sought} campaign.

CURRENT BUDGET:
${Object.entries(budgetData?.categories || {}).map(([cat, amt]) =>
                `- ${cat.replace(/_/g, ' ')}: $${amt.toLocaleString()}`
            ).join('\n')}

Total Budget: $${budgetData?.total_projected_needed.toLocaleString()}
Funds Raised: $${totalRaised.toLocaleString()}
Vote Goal: ${voteGoal.toLocaleString()}
Cost per Vote: $${(budgetData!.total_projected_needed / voteGoal).toFixed(2)}

ANALYSIS REQUIRED:
1. Budget efficiency assessment
2. Over/under-allocated categories
3. Cost-per-vote optimization
4. Fundraising gap strategy
5. Priority reallocations

Provide tactical recommendations. Be specific and actionable.`;

            const audit = await generateText(auditPrompt);

            setBudgetAuditResult(audit);
            addChatMessage('ai', `✅ Budget audit complete. Review recommendations below.`);

        } catch (error) {
            const errorMsg = handleAPIError(error, 'Budget Audit');
            addChatMessage('ai', errorMsg);
        } finally {
            setLoading('budgetAudit', false);
        }
    };

    const handleBudgetChange = (category: string, value: string) => {
        const numValue = parseInt(value.replace(/,/g, ''), 10) || 0;

        if (budgetData) {
            const updatedCategories = {
                ...budgetData.categories,
                [category]: numValue
            };

            const newTotal = Object.values(updatedCategories).reduce((sum, val) => sum + val, 0);

            updateMetadata({
                budget_estimate: {
                    ...budgetData,
                    categories: updatedCategories,
                    total_projected_needed: newTotal
                }
            });
        }
    };

    if (!budgetData) return <div>Loading budget data...</div>;

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
                <div>
                    <h2 className="text-4xl font-black text-slate-800 italic uppercase tracking-tighter">
                        War Chest
                    </h2>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] mt-2">
                        Finance & Fundraising Command
                    </p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('budget')}
                        className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'budget'
                                ? 'bg-white text-emerald-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Budget
                    </button>
                    <button
                        onClick={() => setActiveTab('fundraising')}
                        className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'fundraising'
                                ? 'bg-white text-emerald-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Fundraising
                    </button>
                </div>
            </div>

            {activeTab === 'budget' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card title="Budget Allocation" icon="fa-chart-pie">
                        <div className="space-y-4 pt-4">
                            {Object.entries(budgetData.categories).map(([category, amount]) => (
                                <div key={category} className="group">
                                    <div className="flex justify-between items-end mb-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            {category.replace(/_/g, ' ')}
                                        </label>
                                        <span className="text-xs font-bold text-slate-600">
                                            {((amount / budgetData.total_projected_needed) * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                                        <input
                                            type="text"
                                            value={amount.toLocaleString()}
                                            onChange={(e) => handleBudgetChange(category, e.target.value)}
                                            className="w-full pl-6 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-right font-mono text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                                        />
                                    </div>
                                    {/* Progress Bar */}
                                    <div className="h-1 w-full bg-slate-100 rounded-full mt-2 overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                            style={{ width: `${(amount / budgetData.total_projected_needed) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}

                            <div className="pt-6 border-t border-slate-100 mt-6">
                                <div className="flex justify-between items-center bg-slate-800 text-white p-4 rounded-xl shadow-lg">
                                    <span className="text-sm font-black uppercase tracking-wider">Total Budget</span>
                                    <span className="text-xl font-black font-mono">
                                        ${budgetData.total_projected_needed.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <div className="space-y-6">
                        <Card title="AI Financial Controller" icon="fa-robot">
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
                                <p className="text-xs text-slate-500 leading-relaxed italic">
                                    "I can analyze your budget allocation against historical win data for ${profile.district_id}
                                    and recommend efficiency improvements."
                                </p>
                            </div>

                            <button
                                onClick={runBudgetAudit}
                                disabled={loadingStates.budgetAudit}
                                className="w-full py-4 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2 mb-6"
                            >
                                {loadingStates.budgetAudit ? (
                                    <><i className="fas fa-circle-notch fa-spin"></i> Auditing...</>
                                ) : (
                                    <><i className="fas fa-magnifying-glass-dollar"></i> Run Budget Audit</>
                                )}
                            </button>

                            {budgetAuditResult && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                                        <h4 className="flex items-center gap-2 text-xs font-black text-emerald-800 uppercase tracking-widest mb-4">
                                            <i className="fas fa-check-circle text-emerald-500"></i>
                                            Audit Results
                                        </h4>
                                        <div className="prose prose-sm max-w-none text-slate-600 text-xs">
                                            <div className="whitespace-pre-wrap">{budgetAuditResult}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            ) : (
                <div className="text-center p-20 opacity-50">
                    <i className="fas fa-hand-holding-dollar text-6xl text-slate-300 mb-4"></i>
                    <p className="font-black uppercase tracking-widest text-slate-400">Fundraising Module Compiling...</p>
                </div>
            )}
        </div>
    );
};
