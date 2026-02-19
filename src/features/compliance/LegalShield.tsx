import React from 'react';
import { Card } from '../../components/ui/Card';
import { useCampaign } from '../../context/CampaignContext';
import { useGemini } from '../../hooks/useGemini';
import { handleAPIError } from '../../utils/helpers';

export const LegalShield: React.FC = () => {
    const {
        profile,
        loadingStates,
        setLoading,
        activeCreativeAsset,
        legalAuditResult,
        setLegalAuditResult,
        addChatMessage
    } = useCampaign();

    const { generateText } = useGemini();

    const runLegalComplianceAudit = async () => {
        if (!activeCreativeAsset) {
            addChatMessage('ai', '⚠️ No content selected for compliance check. Please select an asset from Megaphone first.');
            return;
        }

        setLoading('legalAudit', true);
        addChatMessage('ai', '⚖️ Scanning content for Texas Election Code compliance...');

        try {
            const compliancePrompt = `You are a Texas election law compliance expert. Audit this campaign content for Texas Election Code violations.

CONTENT TO AUDIT:
${activeCreativeAsset.content}

CAMPAIGN INFO:
- Candidate: ${profile.candidate_name}
- Office: ${profile.office_sought}
- Party: ${profile.party}
- Media Type: ${activeCreativeAsset.mediaType}

CHECK FOR:
1. Required disclaimers (Texas Election Code §255.001)
2. Prohibited content (false statements, impersonation)
3. Proper attribution
4. Disclaimer placement requirements
5. Font size requirements (if applicable)

ANALYSIS:
- Compliance Status: PASS/FAIL/WARNING
- Specific Violations: [List]
- Required Disclaimer Text: [Provide exact text]
- Recommendations: [Actionable steps]

Output in clean, structured text.`;

            const result = await generateText(compliancePrompt);

            setLegalAuditResult(result);
            addChatMessage('ai', `✅ Compliance audit complete. Status report generated.`);

        } catch (error) {
            const errorMsg = handleAPIError(error, 'Legal Audit');
            addChatMessage('ai', errorMsg);
        } finally {
            setLoading('legalAudit', false);
        }
    };

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
                <div>
                    <h2 className="text-4xl font-black text-slate-800 italic uppercase tracking-tighter">
                        Legal Shield
                    </h2>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] mt-2">
                        FEC & State Compliance Guard
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card title="Content Compliance" icon="fa-scale-balanced">
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <i className="fas fa-file-contract text-slate-400"></i>
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                                Active Asset for Review
                            </span>
                        </div>
                        {activeCreativeAsset ? (
                            <div>
                                <p className="font-bold text-slate-700 truncate">{activeCreativeAsset.title}</p>
                                <p className="text-xs text-slate-500 uppercase tracking-wider bg-slate-200 inline-block px-2 py-0.5 rounded mt-1">
                                    {activeCreativeAsset.type}
                                </p>
                            </div>
                        ) : (
                            <p className="text-sm font-bold text-slate-400 italic">No asset selected from Megaphone</p>
                        )}
                    </div>

                    <button
                        onClick={runLegalComplianceAudit}
                        disabled={loadingStates.legalAudit || !activeCreativeAsset}
                        className="w-full py-4 bg-slate-800 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2 mb-6"
                    >
                        {loadingStates.legalAudit ? (
                            <><i className="fas fa-circle-notch fa-spin"></i> Analyzing...</>
                        ) : (
                            <><i className="fas fa-gavel"></i> Run Compliance Scan</>
                        )}
                    </button>

                    {legalAuditResult && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                                <h4 className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-widest mb-4">
                                    <i className="fas fa-shield-halved text-amber-500"></i>
                                    Compliance Report
                                </h4>
                                <div className="prose prose-sm max-w-none text-slate-600 text-xs">
                                    <div className="whitespace-pre-wrap">{legalAuditResult}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </Card>

                {/* Deadlines Section (Placeholder for now) */}
                <Card title="Upcoming Deadlines" icon="fa-calendar-check">
                    <div className="space-y-4">
                        {[
                            { date: '2025-07-15', label: 'Semi-Annual Report Due', type: 'FEC' },
                            { date: '2025-09-01', label: 'Quarterly Filing', type: 'State' },
                        ].map((deadline, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-xl hover:border-slate-300 transition-colors">
                                <div className="w-16 text-center">
                                    <div className="text-[10px] font-black uppercase text-slate-400">{deadline.date.split('-')[1]}</div>
                                    <div className="text-xl font-black text-slate-800">{deadline.date.split('-')[2]}</div>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-700 text-sm">{deadline.label}</h4>
                                    <span className="text-[10px] font-black bg-slate-100 px-2 py-0.5 rounded text-slate-500">{deadline.type}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};
