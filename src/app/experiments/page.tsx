export default function ExperimentsPage() {
    return (
        <div className="min-h-screen bg-[#fafafa] p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-semibold mb-2">Experiments</h1>
                <p className="text-slate-500 mb-8">A/B test your strategies to measure performance improvements.</p>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 mb-6">
                        <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-medium text-slate-900 mb-2">Start an Experiment</h2>
                    <p className="text-slate-500 max-w-md mx-auto mb-8">
                        Compare "Resume A" vs "Resume B", or evaluate your success rate when applying within 24 hours vs 48 hours.
                    </p>
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
                        Create New Test
                    </button>
                </div>
            </div>
        </div>
    );
}
