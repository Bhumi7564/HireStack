import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Users,
  Award,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

const AnalyticsPage = () => {
  const [pipeline, setPipeline] = useState([]);
  const [recruiters, setRecruiters] = useState([]);
  const [timeToHire, setTimeToHire] = useState([]);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [pipeRes, recRes, tthRes, srcRes] = await Promise.all([
          api.get('/analytics/pipeline'),
          api.get('/analytics/recruiters'),
          api.get('/analytics/time-to-hire'),
          api.get('/analytics/source-effectiveness'),
        ]);

        if (pipeRes.data.success) setPipeline(pipeRes.data.data);
        if (recRes.data.success) setRecruiters(recRes.data.data);
        if (tthRes.data.success) setTimeToHire(tthRes.data.data);
        if (srcRes.data.success) setSources(srcRes.data.data);
      } catch (err) {
        console.error('Failed to load recruitment analytics', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Compiling recruitment intelligence..." />;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Recruitment Intelligence & Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">
          Data-driven hiring metrics: funnel conversion velocity, recruiter productivity, and channel ROI.
        </p>
      </div>

      {/* Top Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel Conversion Velocity */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Pipeline Funnel Volume</h3>
              <p className="text-xs text-slate-500">Candidate count by stage</p>
            </div>
            <span className="flex items-center gap-1 text-xs text-brand-600 font-semibold bg-brand-50 px-2.5 py-1 rounded-full">
              <Layers className="w-3.5 h-3.5" /> Funnel Dropoff
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="stage" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val) => [`${val} Candidates`, 'Count']}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Time to Hire by Position */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Time-to-Hire Velocity (Days)</h3>
              <p className="text-xs text-slate-500">Average days required to fill requisition</p>
            </div>
            <span className="flex items-center gap-1 text-xs text-purple-600 font-semibold bg-purple-50 px-2.5 py-1 rounded-full">
              <Clock className="w-3.5 h-3.5" /> Requisition SLA
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeToHire}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="jobTitle" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val) => [`${val} Days`, 'Avg Time']}
                />
                <Bar dataKey="averageDaysToHire" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recruiter Performance Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Recruiter Workload & Performance</h3>
            <p className="text-xs text-slate-500">Active jobs, candidate throughput, and hiring conversion</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-xs uppercase font-semibold text-slate-500 tracking-wider">
              <tr>
                <th className="px-6 py-4">Recruiter Name</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4 text-center">Active Jobs</th>
                <th className="px-6 py-4 text-center">Managed Applications</th>
                <th className="px-6 py-4 text-center">Interviews Conducted</th>
                <th className="px-6 py-4 text-center">Hired Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recruiters.map((r) => (
                <tr key={r.recruiterId} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900">{r.recruiterName}</td>
                  <td className="px-6 py-4 text-slate-600">{r.department}</td>
                  <td className="px-6 py-4 text-center font-medium text-slate-800">{r.activeJobs}</td>
                  <td className="px-6 py-4 text-center font-medium text-slate-800">{r.totalApplications}</td>
                  <td className="px-6 py-4 text-center font-medium text-slate-800">{r.interviewsConducted}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full text-xs">
                      <Award className="w-3.5 h-3.5" />
                      {r.hiredCount}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Candidate Sourcing Channel Effectiveness */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6">
        <h3 className="text-base font-semibold text-slate-900 mb-1">Source Channel ROI & Conversion</h3>
        <p className="text-xs text-slate-500 mb-6">Applicant volume and hire rate by acquisition source</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {sources.map((src) => (
            <div
              key={src.source}
              className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/50 flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  {src.source}
                </span>
                <span className="text-2xl font-extrabold text-slate-900 block">{src.candidateCount}</span>
                <span className="text-xs text-slate-500 block mt-0.5">Total Candidates</span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Hires: {src.hiredCount}</span>
                <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {src.conversionRatePercentage}% conv
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;

