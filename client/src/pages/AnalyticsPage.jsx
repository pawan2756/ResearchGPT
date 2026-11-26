import React, { useState, useEffect } from 'react';
import { AppShell } from '../components/layout/AppShell.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import { Tag } from '../components/ui/Tag.jsx';
import { Toast } from '../components/ui/Toast.jsx';
import { apiGetAnalyticsSummary } from '../api/analytics.js';
import {
  BarChart2,
  Clock,
  Sparkles,
  Search,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from 'recharts';

export function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);
      try {
        const res = await apiGetAnalyticsSummary();
        setData(res);
      } catch {
        setToastMessage('Failed to load analytics data.');
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  const modePieData = [
    { name: 'Direct Answer', value: data?.directCount || 0, color: 'var(--chart-1)' },
    { name: 'Research Pipeline', value: data?.researchCount || 0, color: 'var(--chart-4)' },
  ];

  const credibilityData = [
    { tier: 'High (>=70)', count: data?.credibilityBreakdown?.high || 0, fill: 'var(--chart-5)' },
    { tier: 'Medium (40-69)', count: data?.credibilityBreakdown?.medium || 0, fill: 'var(--chart-3)' },
    { tier: 'Low (<40)', count: data?.credibilityBreakdown?.low || 0, fill: 'var(--chart-6)' },
  ];

  const timelineData = (data?.recentActivity || [])
    .slice()
    .reverse()
    .map((item, index) => ({
      queryIndex: `#${index + 1}`,
      latencySec: Number(((item.latencyMs || 0) / 1000).toFixed(2)),
      mode: item.mode,
    }));

  return (
    <AppShell>
      <div className="flex-1 flex flex-col max-w-[1000px] w-full mx-auto pb-10">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 mb-6 border-b border-[var(--border)]">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' }}
          >
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-[22px] font-bold tracking-tight" style={{ color: 'var(--text)' }}>
              Analytics & Observability
            </h2>
            <p className="text-[14px]" style={{ color: 'var(--text-muted)' }}>
              Track query volume, latency distribution, source credibility tiers, and verification rates.
            </p>
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
            <Skeleton height="16rem" />
            <Skeleton height="16rem" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                className="p-4 rounded-xl border flex flex-col justify-between"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Total Assistant Responses
                  </span>
                  <Sparkles className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                </div>
                <div className="mt-2">
                  <span className="text-[26px] font-bold" style={{ color: 'var(--text)' }}>
                    {(data?.directCount || 0) + (data?.researchCount || 0)}
                  </span>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    Across {data?.totalChats || 0} active conversations
                  </p>
                </div>
              </div>

              <div
                className="p-4 rounded-xl border flex flex-col justify-between"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Research Trigger Rate
                  </span>
                  <Search className="w-4 h-4" style={{ color: 'var(--chart-4)' }} />
                </div>
                <div className="mt-2">
                  <span className="text-[26px] font-bold" style={{ color: 'var(--chart-4)' }}>
                    {data?.researchRate || 0}%
                  </span>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {data?.researchCount || 0} escalated to web research
                  </p>
                </div>
              </div>

              <div
                className="p-4 rounded-xl border flex flex-col justify-between"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Avg Latency (Direct)
                  </span>
                  <Clock className="w-4 h-4" style={{ color: 'var(--chart-1)' }} />
                </div>
                <div className="mt-2">
                  <span className="text-[26px] font-bold" style={{ color: 'var(--text)' }}>
                    {data?.avgDirectLatencyMs ? (data.avgDirectLatencyMs / 1000).toFixed(1) : 0}s
                  </span>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    Parametric memory retrieval
                  </p>
                </div>
              </div>

              <div
                className="p-4 rounded-xl border flex flex-col justify-between"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Claim Support Rate
                  </span>
                  <ShieldCheck className="w-4 h-4" style={{ color: 'var(--success-text)' }} />
                </div>
                <div className="mt-2">
                  <span className="text-[26px] font-bold" style={{ color: 'var(--success-text)' }}>
                    {data?.verification?.supportRate || 0}%
                  </span>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {data?.verification?.supportedClaims || 0} / {data?.verification?.totalClaims || 0} claims backed by sources
                  </p>
                </div>
              </div>
            </div>

            {/* Visual Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Mode Breakdown */}
              <div
                className="p-5 rounded-xl border flex flex-col"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                  <h3 className="text-[15px] font-semibold" style={{ color: 'var(--text)' }}>
                    Execution Mode Distribution
                  </h3>
                </div>

                <div className="h-60 w-full flex items-center justify-center">
                  {(data?.directCount || 0) + (data?.researchCount || 0) === 0 ? (
                    <p className="text-[13px] italic" style={{ color: 'var(--text-muted)' }}>
                      No messages yet. Ask questions in Chat to view distribution.
                    </p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={modePieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {modePieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Credibility Distribution */}
              <div
                className="p-5 rounded-xl border flex flex-col"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck className="w-4 h-4" style={{ color: 'var(--chart-5)' }} />
                  <h3 className="text-[15px] font-semibold" style={{ color: 'var(--text)' }}>
                    Source Credibility Distribution
                  </h3>
                </div>

                <div className="h-60 w-full flex items-center justify-center">
                  {(data?.credibilityBreakdown?.high || 0) +
                    (data?.credibilityBreakdown?.medium || 0) +
                    (data?.credibilityBreakdown?.low || 0) === 0 ? (
                    <p className="text-[13px] italic" style={{ color: 'var(--text-muted)' }}>
                      No research sources analyzed yet.
                    </p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={credibilityData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="tier" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                        <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" name="Sources" radius={[4, 4, 0, 0]}>
                          {credibilityData.map((entry, index) => (
                            <Cell key={`cred-cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            {/* Latency History Chart */}
            <div
              className="p-5 rounded-xl border flex flex-col"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                  <h3 className="text-[15px] font-semibold" style={{ color: 'var(--text)' }}>
                    Recent Query Latency (Seconds)
                  </h3>
                </div>
                <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                  Avg Research: {data?.avgResearchLatencyMs ? (data.avgResearchLatencyMs / 1000).toFixed(1) : 0}s
                </span>
              </div>

              <div className="h-56 w-full flex items-center justify-center">
                {timelineData.length === 0 ? (
                  <p className="text-[13px] italic" style={{ color: 'var(--text-muted)' }}>
                    No latency data recorded yet.
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timelineData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="queryIndex" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                      <YAxis
                        unit="s"
                        tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                      />
                      <Tooltip formatter={(value) => [`${value}s`, 'Latency']} />
                      <Line
                        type="monotone"
                        dataKey="latencySec"
                        name="Latency"
                        stroke="var(--primary)"
                        strokeWidth={2}
                        dot={{ fill: 'var(--primary)', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Recent Queries Activity Table */}
            <div
              className="rounded-xl border overflow-hidden"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div className="p-4 border-b border-[var(--border)]">
                <h3 className="text-[15px] font-semibold" style={{ color: 'var(--text)' }}>
                  Recent Observability Log
                </h3>
              </div>

              {data?.recentActivity?.length === 0 ? (
                <div className="p-8 text-center text-[13px] italic" style={{ color: 'var(--text-muted)' }}>
                  No execution logs available yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px] text-left">
                    <thead
                      className="border-b"
                      style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                    >
                      <tr>
                        <th className="py-2.5 px-4 font-medium">Timestamp</th>
                        <th className="py-2.5 px-4 font-medium">Mode</th>
                        <th className="py-2.5 px-4 font-medium">Latency</th>
                        <th className="py-2.5 px-4 font-medium">Confidence / Sources</th>
                        <th className="py-2.5 px-4 font-medium">Verification Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {data?.recentActivity?.map((row) => (
                        <tr key={row.id} className="hover:bg-[var(--surface-2)] transition-colors">
                          <td className="py-3 px-4 font-mono text-[12px]" style={{ color: 'var(--text-muted)' }}>
                            {new Date(row.createdAt).toLocaleTimeString()}
                          </td>
                          <td className="py-3 px-4">
                            <Tag variant={row.mode === 'research' ? 'info' : 'default'} size="xs">
                              {row.mode === 'research' ? 'Research' : 'Direct'}
                            </Tag>
                          </td>
                          <td className="py-3 px-4 font-mono text-[12px]" style={{ color: 'var(--text)' }}>
                            {(row.latencyMs / 1000).toFixed(2)}s
                          </td>
                          <td className="py-3 px-4" style={{ color: 'var(--text)' }}>
                            {row.mode === 'research'
                              ? `${row.sourcesCount} sources retrieved`
                              : row.confidence !== null
                              ? `Confidence ${row.confidence}/10`
                              : 'Confidence: N/A'}
                          </td>
                          <td className="py-3 px-4">
                            {row.mode === 'research' ? (
                              <span className="flex items-center gap-1 font-medium" style={{ color: 'var(--success-text)' }}>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {row.supportedClaims} / {row.totalClaims} verified
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>Direct answer</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {toastMessage && (
          <Toast message={toastMessage} type="error" onClose={() => setToastMessage('')} />
        )}
      </div>
    </AppShell>
  );
}
