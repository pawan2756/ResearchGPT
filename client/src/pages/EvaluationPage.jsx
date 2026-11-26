import React, { useState, useEffect } from 'react';
import { AppShell } from '../components/layout/AppShell.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Tag } from '../components/ui/Tag.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import { Toast } from '../components/ui/Toast.jsx';
import { apiGetEvalQuestions, apiRunEval, apiGetEvalResults } from '../api/eval.js';
import {
  CheckSquare,
  Play,
  RotateCw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  Info,
  X,
  Target,
} from 'lucide-react';

export function EvaluationPage() {
  const [questions, setQuestions] = useState([]);
  const [evalData, setEvalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');
  const [loadError, setLoadError] = useState('');

  const [activeCategory, setActiveCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedResult, setSelectedResult] = useState(null);

  const showToast = (msg, type = 'info') => {
    setToastMessage(msg);
    setToastType(type);
  };

  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      try {
        const [qRes, rRes] = await Promise.all([
          apiGetEvalQuestions(),
          apiGetEvalResults(),
        ]);
        if (qRes?.questions) setQuestions(qRes.questions);
        if (rRes?.hasRuns) setEvalData(rRes);
        setLoadError('');
      } catch (err) {
        const message = err.message || 'Failed to load benchmark data.';
        setLoadError(message);
        showToast(message, 'error');
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  const handleRunBenchmark = async (sampleSize = 40) => {
    setRunning(true);
    showToast(`Running benchmark evaluation (${sampleSize} questions)... Please wait.`, 'info');
    try {
      const res = await apiRunEval(sampleSize);
      setEvalData(res);
      showToast(`Benchmark completed! Accuracy: ${res.accuracy}%`, 'success');
    } catch (err) {
      showToast(err.message || 'Benchmark run failed.', 'error');
    } finally {
      setRunning(false);
    }
  };

  // Merge questions with results if run exists
  const displayItems = questions.map((q) => {
    const result = evalData?.results?.find(
      (r) => r.questionId === q.id || r.questionId === q._id || r.question === q.question
    );
    return {
      ...q,
      result,
    };
  });

  const filteredItems = displayItems.filter((item) => {
    if (activeCategory !== 'all' && item.category !== activeCategory) return false;
    if (statusFilter === 'passed' && item.result?.mark !== 'passed') return false;
    if (statusFilter === 'failed' && item.result?.mark !== 'failed') return false;
    if (statusFilter === 'unevaluated' && item.result) return false;
    return true;
  });

  return (
    <AppShell>
      <div className="flex-1 flex flex-col max-w-[1000px] w-full mx-auto pb-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' }}
            >
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-[22px] font-bold tracking-tight" style={{ color: 'var(--text)' }}>
                Evaluation Benchmark
              </h2>
              <p className="text-[14px]" style={{ color: 'var(--text-muted)' }}>
                40-question hand-evaluated benchmark: Direct answer vs Research trigger accuracy.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={running}
              onClick={() => handleRunBenchmark(10)}
              className="gap-1.5"
              title="Run 10 questions quick smoke test"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Quick Test (10)</span>
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={running}
              onClick={() => handleRunBenchmark(40)}
              className="gap-1.5"
              title="Run full 40 questions benchmark"
            >
              <RotateCw className={`w-3.5 h-3.5 ${running ? 'animate-spin' : ''}`} />
              <span>{running ? 'Evaluating...' : 'Run Full Benchmark (40)'}</span>
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Skeleton height="6rem" />
              <Skeleton height="6rem" />
              <Skeleton height="6rem" />
              <Skeleton height="6rem" />
            </div>
            <Skeleton height="14rem" />
            <Skeleton height="16rem" />
          </div>
        ) : (
          <div className="space-y-6">
            {loadError && (
              <div
                role="alert"
                className="p-4 rounded-xl border text-[14px]"
                style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)', borderColor: 'var(--danger-text)' }}
              >
                <strong>Evaluation data could not load.</strong> {loadError} Restart the current backend so it exposes the evaluation routes, then refresh this page.
              </div>
            )}
            {/* Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                className="p-4 rounded-xl border flex flex-col justify-between"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <span className="text-[12px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Overall Accuracy
                </span>
                <div className="mt-2">
                  <span
                    className="text-[26px] font-bold"
                    style={{
                      color:
                        evalData?.accuracy >= 80
                          ? 'var(--success-text)'
                          : evalData
                          ? 'var(--text)'
                          : 'var(--text-muted)',
                    }}
                  >
                    {evalData ? `${evalData.accuracy}%` : 'N/A'}
                  </span>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {evalData ? `${evalData.passed} of ${evalData.total} passed` : 'Not evaluated yet'}
                  </p>
                </div>
              </div>

              <div
                className="p-4 rounded-xl border flex flex-col justify-between"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <span className="text-[12px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Research Precision
                </span>
                <div className="mt-2">
                  <span className="text-[26px] font-bold" style={{ color: 'var(--chart-4)' }}>
                    {evalData ? `${evalData.precision}%` : 'N/A'}
                  </span>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    Triggered research specificity
                  </p>
                </div>
              </div>

              <div
                className="p-4 rounded-xl border flex flex-col justify-between"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <span className="text-[12px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Research Recall
                </span>
                <div className="mt-2">
                  <span className="text-[26px] font-bold" style={{ color: 'var(--chart-1)' }}>
                    {evalData ? `${evalData.recall}%` : 'N/A'}
                  </span>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    Temporal & volatile questions caught
                  </p>
                </div>
              </div>

              <div
                className="p-4 rounded-xl border flex flex-col justify-between"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <span className="text-[12px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Benchmark Dataset
                </span>
                <div className="mt-2">
                  <span className="text-[26px] font-bold" style={{ color: 'var(--text)' }}>
                    {questions.length} Questions
                  </span>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    5 categories (Factual, Temporal, etc.)
                  </p>
                </div>
              </div>
            </div>

            {/* Confusion Matrix Section */}
            {evalData?.confusionMatrix && (
              <div
                className="p-5 rounded-xl border"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                  <h3 className="text-[15px] font-semibold" style={{ color: 'var(--text)' }}>
                    Trigger Confusion Matrix
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3 max-w-[500px] text-[13px]">
                  <div
                    className="p-3.5 rounded-lg border flex flex-col"
                    style={{ backgroundColor: 'var(--success-bg)', borderColor: 'var(--border)' }}
                  >
                    <span className="text-[11px] font-semibold uppercase" style={{ color: 'var(--success-text)' }}>
                      True Research (TP)
                    </span>
                    <span className="text-[22px] font-bold" style={{ color: 'var(--success-text)' }}>
                      {evalData.confusionMatrix.tp}
                    </span>
                    <span className="text-[11px] opacity-80" style={{ color: 'var(--success-text)' }}>
                      Correctly triggered research
                    </span>
                  </div>

                  <div
                    className="p-3.5 rounded-lg border flex flex-col"
                    style={{
                      backgroundColor:
                        evalData.confusionMatrix.fp > 0 ? 'var(--warning-bg)' : 'var(--surface-2)',
                      borderColor: 'var(--border)',
                    }}
                  >
                    <span className="text-[11px] font-semibold uppercase" style={{ color: 'var(--warning-text)' }}>
                      False Research (FP)
                    </span>
                    <span className="text-[22px] font-bold" style={{ color: 'var(--warning-text)' }}>
                      {evalData.confusionMatrix.fp}
                    </span>
                    <span className="text-[11px] opacity-80" style={{ color: 'var(--warning-text)' }}>
                      Direct question prompted research
                    </span>
                  </div>

                  <div
                    className="p-3.5 rounded-lg border flex flex-col"
                    style={{
                      backgroundColor:
                        evalData.confusionMatrix.fn > 0 ? 'var(--danger-bg)' : 'var(--surface-2)',
                      borderColor: 'var(--border)',
                    }}
                  >
                    <span className="text-[11px] font-semibold uppercase" style={{ color: 'var(--danger-text)' }}>
                      False Direct (FN)
                    </span>
                    <span className="text-[22px] font-bold" style={{ color: 'var(--danger-text)' }}>
                      {evalData.confusionMatrix.fn}
                    </span>
                    <span className="text-[11px] opacity-80" style={{ color: 'var(--danger-text)' }}>
                      Missed temporal research need
                    </span>
                  </div>

                  <div
                    className="p-3.5 rounded-lg border flex flex-col"
                    style={{ backgroundColor: 'var(--success-bg)', borderColor: 'var(--border)' }}
                  >
                    <span className="text-[11px] font-semibold uppercase" style={{ color: 'var(--success-text)' }}>
                      True Direct (TN)
                    </span>
                    <span className="text-[22px] font-bold" style={{ color: 'var(--success-text)' }}>
                      {evalData.confusionMatrix.tn}
                    </span>
                    <span className="text-[11px] opacity-80" style={{ color: 'var(--success-text)' }}>
                      Correctly answered directly
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Questions & Results Table with Filter Tabs */}
            <div
              className="rounded-xl border overflow-hidden"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              {/* Filter controls */}
              <div
                className="p-4 border-b flex flex-wrap items-center justify-between gap-3"
                style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}
              >
                {/* Category filters */}
                <div className="flex flex-wrap gap-1">
                  {['all', 'factual', 'technical', 'temporal', 'pricing', 'entity'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      className={`px-2.5 py-1 rounded-md text-[12px] font-medium capitalize transition-colors ${
                        activeCategory === cat
                          ? 'bg-[var(--primary)] text-[var(--text-on-primary)] font-semibold'
                          : 'text-[var(--text-muted)] hover:bg-[var(--surface)]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Status filter */}
                <div className="flex items-center gap-1.5 text-[12px]">
                  <Filter className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-md border px-2 py-1 bg-[var(--surface)] text-[var(--text)] border-[var(--border)]"
                  >
                    <option value="all">All Statuses</option>
                    <option value="passed">Passed Only</option>
                    <option value="failed">Failed Only</option>
                    <option value="unevaluated">Unevaluated</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-[13px] text-left">
                  <thead
                    className="border-b"
                    style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                  >
                    <tr>
                      <th className="py-2.5 px-4 font-medium">Question</th>
                      <th className="py-2.5 px-4 font-medium">Category</th>
                      <th className="py-2.5 px-4 font-medium">Expected</th>
                      <th className="py-2.5 px-4 font-medium">Actual Mode</th>
                      <th className="py-2.5 px-4 font-medium">Verdict</th>
                      <th className="py-2.5 px-4 font-medium text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {filteredItems.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-[var(--surface-2)] transition-colors">
                        <td className="py-3 px-4 max-w-[320px]">
                          <p className="font-medium truncate" style={{ color: 'var(--text)' }} title={item.question}>
                            {item.question}
                          </p>
                          <p className="text-[11px] truncate opacity-70" style={{ color: 'var(--text-muted)' }}>
                            Truth: {item.groundTruth}
                          </p>
                        </td>

                        <td className="py-3 px-4">
                          <Tag variant="default" size="xs">
                            {item.category}
                          </Tag>
                        </td>

                        <td className="py-3 px-4 font-mono text-[12px]" style={{ color: 'var(--text)' }}>
                          {item.expectedMode === 'research' ? 'Research' : 'Direct'}
                        </td>

                        <td className="py-3 px-4 font-mono text-[12px]">
                          {item.result ? (
                            <Tag variant={item.result.actualMode === 'research' ? 'info' : 'default'} size="xs">
                              {item.result.actualMode === 'research' ? 'Research' : 'Direct'}
                            </Tag>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>-</span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          {item.result ? (
                            <span
                              className="inline-flex items-center gap-1 font-semibold text-[12px]"
                              style={{
                                color:
                                  item.result.mark === 'passed'
                                    ? 'var(--success-text)'
                                    : 'var(--danger-text)',
                              }}
                            >
                              {item.result.mark === 'passed' ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Passed</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Failed</span>
                                </>
                              )}
                            </span>
                          ) : (
                            <span className="text-[12px] italic" style={{ color: 'var(--text-muted)' }}>
                              Unevaluated
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedResult(item)}
                            className="p-1 rounded hover:bg-[var(--surface)] text-[var(--primary)] transition-colors"
                            title="Inspect Question & Answers"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Question Details Inspector Modal */}
        {selectedResult && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div
              className="rounded-xl border max-w-lg w-full p-5 space-y-4 shadow-xl"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                  <h3 className="font-semibold text-[16px]" style={{ color: 'var(--text)' }}>
                    Evaluation Item Inspector
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedResult(null)}
                  className="p-1 rounded hover:bg-[var(--surface-2)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>
                  Question
                </label>
                <p className="text-[14px] font-medium" style={{ color: 'var(--text)' }}>
                  {selectedResult.question}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[13px]">
                <div className="p-2.5 rounded-lg border" style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}>
                  <span className="text-[11px] block" style={{ color: 'var(--text-muted)' }}>Category</span>
                  <span className="font-semibold capitalize" style={{ color: 'var(--text)' }}>{selectedResult.category}</span>
                </div>
                <div className="p-2.5 rounded-lg border" style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}>
                  <span className="text-[11px] block" style={{ color: 'var(--text-muted)' }}>Expected Mode</span>
                  <span className="font-semibold capitalize" style={{ color: 'var(--text)' }}>{selectedResult.expectedMode}</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>
                  Ground Truth / Stable Fact
                </label>
                <div className="p-2.5 rounded-lg border text-[13px]" style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                  {selectedResult.groundTruth}
                </div>
              </div>

              {selectedResult.result && (
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>
                    Direct Answer Received
                  </label>
                  <div className="p-2.5 rounded-lg border text-[13px] leading-relaxed" style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                    {selectedResult.result.directAnswer || 'N/A'}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[12px]" style={{ color: 'var(--text-muted)' }}>
                    <span>Confidence: {selectedResult.result.directConfidence ?? 'N/A'} / 10</span>
                    <span>Research Score: {selectedResult.result.researchScore}</span>
                    <span>Latency: {(selectedResult.result.latencyMs / 1000).toFixed(2)}s</span>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button type="button" variant="primary" size="sm" onClick={() => setSelectedResult(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {toastMessage && (
          <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />
        )}
      </div>
    </AppShell>
  );
}
