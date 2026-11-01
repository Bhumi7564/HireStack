import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import {
  MessageSquare,
  Plus,
  Mail,
  Phone,
  StickyNote,
  FileCheck,
  CheckCircle,
  Clock,
  Bell,
  Calendar,
} from 'lucide-react';

const CommunicationPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [logs, setLogs] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Log Modal
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logFormData, setLogFormData] = useState({
    candidateId: '',
    type: 'EMAIL',
    subject: '',
    content: '',
  });

  // New Reminder Modal
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderFormData, setReminderFormData] = useState({
    title: '',
    description: '',
    remindAt: '',
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [candRes, remRes] = await Promise.all([
          api.get('/candidates?size=50'),
          api.get('/communication/reminders'),
        ]);

        if (candRes.data.success) {
          const list = candRes.data.data.content || [];
          setCandidates(list);
          if (list.length > 0) {
            setSelectedCandidateId(list[0].id);
          }
        }
        if (remRes.data.success) {
          setReminders(remRes.data.data || []);
        }
      } catch (err) {
        console.error('Failed to load communication initial data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!selectedCandidateId) return;

    const fetchLogs = async () => {
      try {
        const res = await api.get(`/communication/candidate/${selectedCandidateId}`);
        if (res.data.success) {
          setLogs(res.data.data || []);
        }
      } catch (err) {
        console.error('Failed to load candidate logs', err);
      }
    };

    fetchLogs();
  }, [selectedCandidateId]);

  const handleCreateLog = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/communication/logs', {
        ...logFormData,
        candidateId: parseInt(logFormData.candidateId, 10),
      });

      if (res.data.success) {
        setIsLogModalOpen(false);
        setLogFormData({ candidateId: '', type: 'EMAIL', subject: '', content: '' });
        // Refresh logs
        if (parseInt(logFormData.candidateId, 10) === parseInt(selectedCandidateId, 10)) {
          const updated = await api.get(`/communication/candidate/${selectedCandidateId}`);
          setLogs(updated.data.data || []);
        }
      }
    } catch (err) {
      alert('Failed to log communication.');
    }
  };

  const handleCreateReminder = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/communication/reminders', {
        ...reminderFormData,
        remindAt: new Date(reminderFormData.remindAt).toISOString(),
      });

      if (res.data.success) {
        setIsReminderModalOpen(false);
        setReminderFormData({ title: '', description: '', remindAt: '' });
        const remRes = await api.get('/communication/reminders');
        setReminders(remRes.data.data || []);
      }
    } catch (err) {
      alert('Failed to create reminder.');
    }
  };

  const handleToggleReminder = async (id) => {
    try {
      await api.patch(`/communication/reminders/${id}/toggle`);
      const remRes = await api.get('/communication/reminders');
      setReminders(remRes.data.data || []);
    } catch (err) {
      console.error('Failed to toggle reminder', err);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'EMAIL':
        return <Mail className="w-4 h-4 text-blue-600" />;
      case 'PHONE_CALL':
        return <Phone className="w-4 h-4 text-emerald-600" />;
      case 'NOTE':
        return <StickyNote className="w-4 h-4 text-amber-600" />;
      case 'OFFER_LETTER':
        return <FileCheck className="w-4 h-4 text-purple-600" />;
      default:
        return <MessageSquare className="w-4 h-4 text-slate-600" />;
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading candidate communications..." />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Communications & Reminders</h1>
          <p className="text-sm text-slate-500 mt-1">
            Activity logs, candidate contact histories, recruiter notes, and scheduled task reminders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setLogFormData({ ...logFormData, candidateId: selectedCandidateId || '' });
              setIsLogModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Communication</span>
          </button>
          <button
            onClick={() => setIsReminderModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 shadow-sm transition-colors"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Add Reminder</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Communications Timeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Select Candidate:
            </span>
            <select
              value={selectedCandidateId}
              onChange={(e) => setSelectedCandidateId(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName} ({c.email})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-6">
              Activity History for {candidates.find((c) => c.id === parseInt(selectedCandidateId, 10))?.fullName}
            </h3>

            {logs.length === 0 ? (
              <EmptyState
                title="No communication logs found"
                description="No interaction logs recorded for this candidate yet."
                actionText="Log Communication"
                onAction={() => {
                  setLogFormData({ ...logFormData, candidateId: selectedCandidateId });
                  setIsLogModalOpen(true);
                }}
              />
            ) : (
              <div className="border-l-2 border-slate-200 pl-4 space-y-6 ml-2">
                {logs.map((log) => (
                  <div key={log.id} className="relative">
                    <div className="absolute -left-[25px] top-1 w-4 h-4 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-brand-600" />
                    </div>
                    <div className="bg-slate-50/70 p-4 rounded-lg border border-slate-200/60">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(log.type)}
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                            {log.type.replace('_', ' ')}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {new Date(log.loggedAt).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900">{log.subject}</h4>
                      <p className="text-xs text-slate-600 mt-1 whitespace-pre-line">{log.content}</p>
                      <p className="text-[10px] text-slate-400 mt-2 font-medium">Logged by: {log.userName}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Follow-up Reminders */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-brand-600" />
                <span>My Follow-up Reminders</span>
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {reminders.filter((r) => !r.completed).length} pending
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {reminders.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No reminders scheduled.</p>
              ) : (
                reminders.map((rem) => (
                  <div key={rem.id} className="py-3 flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={rem.completed}
                      onChange={() => handleToggleReminder(rem.id)}
                      className="mt-0.5 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs font-semibold ${
                          rem.completed ? 'line-through text-slate-400' : 'text-slate-800'
                        }`}
                      >
                        {rem.title}
                      </p>
                      {rem.description && (
                        <p className="text-[11px] text-slate-500 mt-0.5">{rem.description}</p>
                      )}
                      <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(rem.remindAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Log Modal */}
      <Modal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        title="Record Communication Log"
      >
        <form onSubmit={handleCreateLog} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Candidate *
            </label>
            <select
              required
              value={logFormData.candidateId}
              onChange={(e) => setLogFormData({ ...logFormData, candidateId: e.target.value })}
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Select Candidate</option>
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Communication Type *
            </label>
            <select
              value={logFormData.type}
              onChange={(e) => setLogFormData({ ...logFormData, type: e.target.value })}
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="EMAIL">Email</option>
              <option value="PHONE_CALL">Phone Call</option>
              <option value="NOTE">Recruiter Internal Note</option>
              <option value="OFFER_LETTER">Offer Discussion</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Subject *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Discussed notice period and compensation expectations"
              value={logFormData.subject}
              onChange={(e) => setLogFormData({ ...logFormData, subject: e.target.value })}
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Detailed Notes *
            </label>
            <textarea
              required
              rows="3"
              value={logFormData.content}
              onChange={(e) => setLogFormData({ ...logFormData, content: e.target.value })}
              placeholder="Candidate indicated they have 2 weeks notice..."
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsLogModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-brand-600 text-white rounded-lg text-sm font-semibold hover:bg-brand-700 shadow-sm"
            >
              Save Log
            </button>
          </div>
        </form>
      </Modal>

      {/* Reminder Modal */}
      <Modal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        title="Schedule Follow-up Reminder"
      >
        <form onSubmit={handleCreateReminder} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Reminder Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Follow up on offer letter signature"
              value={reminderFormData.title}
              onChange={(e) => setReminderFormData({ ...reminderFormData, title: e.target.value })}
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Description
            </label>
            <textarea
              rows="2"
              value={reminderFormData.description}
              onChange={(e) => setReminderFormData({ ...reminderFormData, description: e.target.value })}
              placeholder="Additional context or questions to ask..."
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Remind At *
            </label>
            <input
              type="datetime-local"
              required
              value={reminderFormData.remindAt}
              onChange={(e) => setReminderFormData({ ...reminderFormData, remindAt: e.target.value })}
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsReminderModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-brand-600 text-white rounded-lg text-sm font-semibold hover:bg-brand-700 shadow-sm"
            >
              Save Reminder
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CommunicationPage;

