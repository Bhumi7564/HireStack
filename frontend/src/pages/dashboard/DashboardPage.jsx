import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Briefcase,
  Users,
  FileCheck2,
  CalendarDays,
  Award,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const STAGE_COLORS = {
  APPLIED: '#3b82f6',
  SCREENING: '#f59e0b',
  INTERVIEW: '#8b5cf6',
  OFFER: '#10b981',
  HIRED: '#16a34a',
  REJECTED: '#f43f5e',
};

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [pipelineData, setPipelineData] = useState([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, funnelRes, interviewsRes] = await Promise.all([
          api.get('/analytics/overview'),
          api.get('/analytics/pipeline'),
          api.get('/interviews?status=SCHEDULED&size=4'),
        ]);

        if (statsRes.data.success) {
          setStats(statsRes.data.data);
        }
        if (funnelRes.data.success) {
          setPipelineData(funnelRes.data.data);
        }
        if (interviewsRes.data.success) {
          setUpcomingInterviews(interviewsRes.data.data.content || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading recruitment intelligence..." />;
  }

  const pieData = pipelineData.map((item) => ({
    name: item.stage,
    value: item.count,
    color: STAGE_COLORS[item.stage] || '#64748b',
  }));

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Recruitment Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time hiring velocity, candidate pipeline status, and upcoming interviews.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/jobs"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 shadow-sm transition-colors"
          >
            <Briefcase className="w-4 h-4" />
            <span>Manage Jobs</span>
          </Link>
          <Link
            to="/pipeline"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 shadow-sm transition-colors"
          >
            <span>Kanban Board</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Jobs"
          value={stats?.totalJobs || 0}
          icon={Briefcase}
          color="blue"
        />
        <StatCard
          title="Candidates"
          value={stats?.totalCandidates || 0}
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Applications"
          value={stats?.totalApplications || 0}
          icon={FileCheck2}
          color="amber"
        />
        <StatCard
          title="Interviews"
          value={stats?.activeInterviews || 0}
          icon={CalendarDays}
          color="blue"
        />
        <StatCard
          title="Hired"
          value={stats?.hiredCount || 0}
          icon={Award}
          color="emerald"
        />
        <StatCard
          title="Avg Time to Hire"
          value={`${stats?.averageTimeToHireDays || 0}d`}
          icon={Clock}
          color="rose"
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Funnel Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Application Pipeline Funnel</h3>
              <p className="text-xs text-slate-500">Live candidate volume across hiring stages</p>
            </div>
            <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full">
              <TrendingUp className="w-3.5 h-3.5" /> Live PostgreSQL Sync
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="stage" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(value, name) => [value, 'Candidates']}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {pipelineData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STAGE_COLORS[entry.stage] || '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stage Distribution Donut */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Stage Distribution</h3>
            <p className="text-xs text-slate-500 mb-4">Pipeline allocation breakdown</p>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`donut-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 text-xs">
            {pipelineData.map((item) => (
              <div key={item.stage} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: STAGE_COLORS[item.stage] || '#64748b' }}
                />
                <span className="text-slate-600 truncate">{item.stage}:</span>
                <span className="font-semibold text-slate-900 ml-auto">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Scheduled Interviews */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Upcoming Interviews</h3>
            <p className="text-xs text-slate-500">Scheduled candidate evaluation rounds</p>
          </div>
          <Link
            to="/interviews"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {upcomingInterviews.length === 0 ? (
            <p className="p-6 text-sm text-slate-500 text-center">No upcoming interviews scheduled.</p>
          ) : (
            upcomingInterviews.map((item) => (
              <div
                key={item.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 mt-0.5">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{item.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Candidate:{' '}
                      <span className="font-medium text-slate-700">{item.candidateName}</span> • Role:{' '}
                      <span className="font-medium text-slate-700">{item.jobTitle}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={item.interviewType}>{item.interviewType}</Badge>
                      <Badge variant={item.interviewRound}>{item.interviewRound}</Badge>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col sm:items-end justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-700">
                    {new Date(item.scheduledStartTime).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {item.meetingLink && (
                    <a
                      href={item.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-brand-600 hover:underline font-medium"
                    >
                      Join Meeting Link
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

