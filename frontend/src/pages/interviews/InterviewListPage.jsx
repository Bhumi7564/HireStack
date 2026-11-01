import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import {
  CalendarDays,
  Plus,
  Video,
  Clock,
  User,
  Star,
  ExternalLink,
  Eye,
  XCircle,
  CheckCircle2,
  RotateCcw,
  AlertCircle,
  ChevronRight,
  Award,
} from 'lucide-react';

const InterviewListPage = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMyInterviews, setViewMyInterviews] = useState(false);
  const [applications, setApplications] = useState([]);
  const [interviewers, setInterviewers] = useState([]);
  const [notification, setNotification] = useState({ type: '', message: '' });

  // Schedule Modal
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    applicationId: '',
    title: '',
    interviewType: 'VIDEO',
    interviewRound: 'TECHNICAL',
    scheduledStartTime: '',
    scheduledEndTime: '',
    meetingLink: '',
    location: '',
    notes: '',
    interviewerUserIds: [],
  });
  const [scheduleError, setScheduleError] = useState('');
  const [scheduling, setScheduling] = useState(false);

  // View Details Modal
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [interviewFeedbacks, setInterviewFeedbacks] = useState([]);
  const [feedbacksLoading, setFeedbacksLoading] = useState(false);

  // Feedback Submit Modal
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackTarget, setFeedbackTarget] = useState(null);
  const [feedbackData, setFeedbackData] = useState({
    overallRating: 5,
    technicalSkillsRating: 4,
    communicationRating: 4,
    problemSolvingRating: 4,
    culturalFitRating: 4,
    recommendation: 'HIRE',
    strengths: '',
    weaknesses: '',
    summaryComments: '',
  });
  const [feedbackError, setFeedbackError] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const { user, isAdmin, isRecruiter, isInterviewer } = useAuth();
  const canSchedule = isAdmin || isRecruiter;

  const showToast = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 3500);
  };

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const endpoint = viewMyInterviews ? '/interviews/my-interviews' : '/interviews';
      const params = !viewMyInterviews ? { status: statusFilter || undefined, size: 50 } : {};
      const res = await api.get(endpoint, { params });
      if (res.data.success) {
        setInterviews(viewMyInterviews ? res.data.data : res.data.data.content || []);
      }
    } catch (err) {
      console.error('Failed to load interviews', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInterviews(); }, [statusFilter, viewMyInterviews]);

  useEffect(() => {
    const fetchPrerequisites = async () => {
      try {
        const [appsRes, interviewersRes] = await Promise.all([
          api.get('/applications?size=50'),
          api.get('/users/interviewers'),
        ]);
        if (appsRes.data.success) setApplications(appsRes.data.data.content || []);
        if (interviewersRes.data.success) setInterviewers(interviewersRes.data.data || []);
      } catch (err) {
        console.error('Failed to load scheduling prerequisites', err);
      }
    };
    fetchPrerequisites();
  }, []);

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setScheduleError('');
    setScheduling(true);

    try {
      const payload = {
        ...scheduleData,
        applicationId: parseInt(scheduleData.applicationId, 10),
        scheduledStartTime: new Date(scheduleData.scheduledStartTime).toISOString(),
        scheduledEndTime: new Date(scheduleData.scheduledEndTime).toISOString(),
        interviewerUserIds: scheduleData.interviewerUserIds.map((id) => parseInt(id, 10)),
      };
      const res = await api.post('/interviews', payload);
      if (res.data.success) {
        showToast('success', 'Interview scheduled successfully.');
        setIsScheduleModalOpen(false);
        setScheduleData({
          applicationId: '', title: '', interviewType: 'VIDEO', interviewRound: 'TECHNICAL',
          scheduledStartTime: '', scheduledEndTime: '', meetingLink: '', location: '', notes: '', interviewerUserIds: [],
        });
        fetchInterviews();
      }
    } catch (err) {
      setScheduleError(err.response?.data?.message || 'Failed to schedule interview due to conflict or validation error.');
    } finally {
      setScheduling(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.patch(`/interviews/${id}/status`, { status: newStatus });
      showToast('success', `Interview status updated to ${newStatus}.`);
      fetchInterviews();
      if (selectedInterview?.id === id) {
        setSelectedInterview((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to update interview status.');
    }
  };

  const handleOpenDetails = async (interview) => {
    setSelectedInterview(interview);
    setIsDetailsModalOpen(true);
    setFeedbacksLoading(true);
    try {
      const res = await api.get(`/feedback/interview/${interview.id}`);
      if (res.data.success) setInterviewFeedbacks(res.data.data);
      else setInterviewFeedbacks([]);
    } catch (err) {
      setInterviewFeedbacks([]);
    } finally {
      setFeedbacksLoading(false);
    }
  };

  const openFeedbackModal = (interview) => {
    setFeedbackTarget(interview);
    setFeedbackError('');
    setFeedbackData({
      overallRating: 5, technicalSkillsRating: 4, communicationRating: 4,
      problemSolvingRating: 4, culturalFitRating: 4, recommendation: 'HIRE',
      strengths: '', weaknesses: '', summaryComments: '',
    });
    setIsFeedbackModalOpen(true);
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setFeedbackError('');
    setSubmittingFeedback(true);
    try {
      const res = await api.post('/feedback', { interviewId: feedbackTarget.id, ...feedbackData });
      if (res.data.success) {
        showToast('success', 'Evaluation feedback submitted successfully.');
        setIsFeedbackModalOpen(false);
        fetchInterviews();
        // Refresh details if open
        if (isDetailsModalOpen && selectedInterview?.id === feedbackTarget.id) {
          handleOpenDetails(feedbackTarget);
        }
      }
    } catch (err) {
      setFeedbackError(err.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const ratingLabel = (n) => ['', 'Unsatisfactory', 'Below Expectations', 'Adequate', 'Strong', 'Exceptional'][n] || n;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast */}
      {notification.message && (
        <div className={`p-4 rounded-xl border flex items-center justify-between shadow-sm ${notification.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
          <div className="flex items-center gap-2 text-sm font-medium">
            {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification({ type: '', message: '' })} className="text-xs font-semibold hover:underline">Dismiss</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Interview Management</h1>
          <p className="text-sm text-slate-500 mt-1">Schedule interview rounds, assign panels, prevent conflicts, and record evaluations.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            <button onClick={() => setViewMyInterviews(false)} className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${!viewMyInterviews ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
              All Interviews
            </button>
            <button onClick={() => setViewMyInterviews(true)} className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${viewMyInterviews ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
              My Assigned
            </button>
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm">
            <option value="">All Statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="RESCHEDULED">Rescheduled</option>
          </select>
          {canSchedule && (
            <button onClick={() => setIsScheduleModalOpen(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 shadow-sm transition-colors cursor-pointer">
              <Plus className="w-4 h-4" /><span>Schedule Interview</span>
            </button>
          )}
        </div>
      </div>

      {/* Interview Cards Grid */}
      {loading ? (
        <LoadingSpinner text="Loading interviews..." />
      ) : interviews.length === 0 ? (
        <EmptyState title="No interviews found" description="No scheduled or past interviews match your current filter." icon={CalendarDays} actionText={canSchedule ? 'Schedule an Interview' : null} onAction={() => setIsScheduleModalOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {interviews.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-all space-y-4">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant={item.interviewRound}>{item.interviewRound}</Badge>
                  <Badge variant={item.status}>{item.status}</Badge>
                </div>
                <h3 className="font-bold text-slate-900 text-base">{item.title}</h3>
                <p className="text-xs text-slate-500 mt-1">Candidate: <strong className="text-slate-800">{item.candidateName}</strong></p>
                <p className="text-xs text-slate-500">Role: <strong className="text-slate-800">{item.jobTitle}</strong></p>

                <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {new Date(item.scheduledStartTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      {' – '}
                      {new Date(item.scheduledEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {item.meetingLink && (
                    <div className="flex items-center gap-2">
                      <Video className="w-3.5 h-3.5 text-slate-400" />
                      <a href={item.meetingLink} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline font-medium truncate flex items-center gap-1">
                        Meeting Link <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                  {item.panelMembers && item.panelMembers.length > 0 && (
                    <div className="flex items-start gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                      <div className="flex flex-wrap gap-1">
                        {item.panelMembers.map((p) => (
                          <span key={p.id} className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 text-[11px]">{p.userName || p.interviewerName}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                <button onClick={() => handleOpenDetails(item)} className="flex items-center justify-center gap-1.5 px-2 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer">
                  <Eye className="w-3.5 h-3.5" /><span>Details</span>
                </button>
                {(isInterviewer || canSchedule) && item.status === 'SCHEDULED' && (
                  <button onClick={() => openFeedbackModal(item)} className="flex items-center justify-center gap-1.5 px-2 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer">
                    <Star className="w-3.5 h-3.5" /><span>Add Feedback</span>
                  </button>
                )}
                {canSchedule && item.status === 'SCHEDULED' && (
                  <>
                    <button onClick={() => handleUpdateStatus(item.id, 'COMPLETED')} className="flex items-center justify-center gap-1 px-2 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer">
                      <CheckCircle2 className="w-3.5 h-3.5" /><span>Complete</span>
                    </button>
                    <button onClick={() => handleUpdateStatus(item.id, 'CANCELLED')} className="flex items-center justify-center gap-1 px-2 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer">
                      <XCircle className="w-3.5 h-3.5" /><span>Cancel</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interview Details Modal */}
      <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} title={selectedInterview?.title || 'Interview Details'} maxWidth="max-w-2xl">
        {selectedInterview && (
          <div className="space-y-5 text-sm">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 font-semibold uppercase block mb-1">Candidate</span>
                <span className="text-slate-900 font-bold">{selectedInterview.candidateName}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 font-semibold uppercase block mb-1">Job Role</span>
                <span className="text-slate-900 font-bold">{selectedInterview.jobTitle}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 font-semibold uppercase block mb-1">Status</span>
                <Badge variant={selectedInterview.status}>{selectedInterview.status}</Badge>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 font-semibold uppercase block mb-1">Round</span>
                <Badge variant={selectedInterview.interviewRound}>{selectedInterview.interviewRound}</Badge>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <span className="text-slate-400 font-semibold uppercase block mb-1">Schedule</span>
              <p className="text-slate-800 font-semibold">
                {new Date(selectedInterview.scheduledStartTime).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}
              </p>
              {selectedInterview.meetingLink && (
                <a href={selectedInterview.meetingLink} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-brand-600 hover:underline font-medium">
                  <Video className="w-3.5 h-3.5" /> Open Meeting Link <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {selectedInterview.panelMembers && selectedInterview.panelMembers.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Interview Panel</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedInterview.panelMembers.map((p) => (
                    <span key={p.id} className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-md text-xs font-medium text-slate-700">
                      {p.userName || p.interviewerName}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                Feedback & Evaluations ({interviewFeedbacks.length})
              </h4>
              {feedbacksLoading ? (
                <LoadingSpinner text="Loading feedback..." />
              ) : interviewFeedbacks.length === 0 ? (
                <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <Award className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">No feedback submitted yet for this interview.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {interviewFeedbacks.map((fb) => (
                    <div key={fb.id} className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">{fb.interviewerName}</span>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 text-xs font-bold text-amber-600">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                            {fb.overallRating}/5 — {ratingLabel(fb.overallRating)}
                          </span>
                          <Badge variant={fb.recommendation?.includes('HIRE') && !fb.recommendation.includes('NOT') ? 'HIRED' : 'REJECTED'}>
                            {fb.recommendation}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                        {[
                          ['Technical', fb.technicalSkillsRating],
                          ['Communication', fb.communicationRating],
                          ['Problem Solving', fb.problemSolvingRating],
                          ['Cultural Fit', fb.culturalFitRating],
                        ].map(([label, val]) => (
                          <div key={label} className="flex justify-between">
                            <span className="text-slate-400">{label}:</span>
                            <span className="font-semibold text-slate-700">{val}/5</span>
                          </div>
                        ))}
                      </div>

                      {fb.strengths && <p className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200"><strong>Strengths:</strong> {fb.strengths}</p>}
                      {fb.weaknesses && <p className="text-xs text-rose-700 bg-rose-50 p-2.5 rounded-lg border border-rose-200"><strong>Areas for Growth:</strong> {fb.weaknesses}</p>}
                      {fb.comments && <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-lg border border-slate-200">"{fb.comments}"</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <div className="flex gap-2">
                {canSchedule && selectedInterview.status === 'SCHEDULED' && (
                  <>
                    <button onClick={() => handleUpdateStatus(selectedInterview.id, 'COMPLETED')} className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center gap-1 cursor-pointer">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mark Completed
                    </button>
                    <button onClick={() => handleUpdateStatus(selectedInterview.id, 'CANCELLED')} className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg flex items-center gap-1 cursor-pointer">
                      <XCircle className="w-3.5 h-3.5" /> Cancel
                    </button>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                {(isInterviewer || canSchedule) && selectedInterview.status === 'SCHEDULED' && (
                  <button onClick={() => { setIsDetailsModalOpen(false); openFeedbackModal(selectedInterview); }} className="px-3 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-lg flex items-center gap-1 cursor-pointer">
                    <Star className="w-3.5 h-3.5" /> Add Feedback
                  </button>
                )}
                <button onClick={() => setIsDetailsModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700">Close</button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Schedule Interview Modal */}
      <Modal isOpen={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)} title="Schedule Interview Round" maxWidth="max-w-2xl">
        {scheduleError && <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">{scheduleError}</div>}
        <form onSubmit={handleScheduleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">Select Candidate Application *</label>
            <select required value={scheduleData.applicationId} onChange={(e) => setScheduleData({ ...scheduleData, applicationId: e.target.value })}
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
              <option value="">Select Application</option>
              {applications.map((app) => (
                <option key={app.id} value={app.id}>{app.candidateName} – {app.jobTitle} ({app.currentStage})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">Interview Title *</label>
            <input type="text" required placeholder="e.g. Technical System Design Round" value={scheduleData.title}
              onChange={(e) => setScheduleData({ ...scheduleData, title: e.target.value })}
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">Interview Type</label>
              <select value={scheduleData.interviewType} onChange={(e) => setScheduleData({ ...scheduleData, interviewType: e.target.value })}
                className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="VIDEO">Video Call</option>
                <option value="PHONE">Phone Screen</option>
                <option value="IN_PERSON">In-Person</option>
                <option value="TECHNICAL_ASSESSMENT">Assessment Review</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">Interview Round</label>
              <select value={scheduleData.interviewRound} onChange={(e) => setScheduleData({ ...scheduleData, interviewRound: e.target.value })}
                className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="FIRST_ROUND">First Round</option>
                <option value="TECHNICAL">Technical Deep Dive</option>
                <option value="MANAGERIAL">Managerial / Culture</option>
                <option value="HR_ROUND">HR Discussion</option>
                <option value="FINAL_ROUND">Final Round</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">Start Time *</label>
              <input type="datetime-local" required value={scheduleData.scheduledStartTime}
                onChange={(e) => setScheduleData({ ...scheduleData, scheduledStartTime: e.target.value })}
                className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">End Time *</label>
              <input type="datetime-local" required value={scheduleData.scheduledEndTime}
                onChange={(e) => setScheduleData({ ...scheduleData, scheduledEndTime: e.target.value })}
                className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">Meeting Video Link</label>
            <input type="url" placeholder="https://meet.google.com/xyz-abc" value={scheduleData.meetingLink}
              onChange={(e) => setScheduleData({ ...scheduleData, meetingLink: e.target.value })}
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Assign Interview Panel *
              <span className="normal-case font-normal text-slate-400 ml-1">(conflict detection enabled)</span>
            </label>
            {interviewers.length === 0 ? (
              <p className="text-xs text-slate-400 italic p-2 bg-slate-50 rounded border border-slate-200">No interviewers available. Add team members from User Management.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-lg">
                {interviewers.map((u) => (
                  <label key={u.id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer p-1.5 hover:bg-white rounded">
                    <input
                      type="checkbox"
                      checked={scheduleData.interviewerUserIds.includes(u.id)}
                      onChange={(e) => {
                        const updated = e.target.checked
                          ? [...scheduleData.interviewerUserIds, u.id]
                          : scheduleData.interviewerUserIds.filter((id) => id !== u.id);
                        setScheduleData({ ...scheduleData, interviewerUserIds: updated });
                      }}
                      className="rounded text-brand-600 focus:ring-brand-500"
                    />
                    <span>{u.firstName} {u.lastName} <span className="text-slate-400">({(u.role || '').replace('ROLE_', '')})</span></span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setIsScheduleModalOpen(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={scheduling || scheduleData.interviewerUserIds.length === 0}
              className="px-5 py-2 bg-brand-600 text-white rounded-lg text-sm font-semibold hover:bg-brand-700 shadow-sm disabled:opacity-50">
              {scheduling ? 'Scheduling...' : 'Schedule Interview'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Submit Feedback Modal */}
      <Modal isOpen={isFeedbackModalOpen} onClose={() => setIsFeedbackModalOpen(false)} title={`Evaluation Feedback: ${feedbackTarget?.title}`} maxWidth="max-w-2xl">
        {feedbackError && <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">{feedbackError}</div>}
        <form onSubmit={handleSubmitFeedback} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1 text-slate-600 border border-slate-200">
            <p>Candidate: <strong className="text-slate-900">{feedbackTarget?.candidateName}</strong></p>
            <p>Position: <strong className="text-slate-900">{feedbackTarget?.jobTitle}</strong></p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              ['Overall Score (1-5) *', 'overallRating'],
              ['Technical Skills (1-5)', 'technicalSkillsRating'],
              ['Communication (1-5)', 'communicationRating'],
              ['Problem Solving (1-5)', 'problemSolvingRating'],
              ['Cultural Fit (1-5)', 'culturalFitRating'],
            ].map(([label, key]) => (
              <div key={key}>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">{label}</label>
                <select value={feedbackData[key]} onChange={(e) => setFeedbackData({ ...feedbackData, [key]: parseInt(e.target.value, 10) })}
                  className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <option value="5">5 – Exceptional</option>
                  <option value="4">4 – Strong</option>
                  <option value="3">3 – Adequate</option>
                  <option value="2">2 – Below Expectations</option>
                  <option value="1">1 – Unsatisfactory</option>
                </select>
              </div>
            ))}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">Hiring Recommendation *</label>
              <select value={feedbackData.recommendation} onChange={(e) => setFeedbackData({ ...feedbackData, recommendation: e.target.value })}
                className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="STRONG_HIRE">Strong Hire</option>
                <option value="HIRE">Hire</option>
                <option value="NEUTRAL">Neutral</option>
                <option value="DO_NOT_HIRE">Do Not Hire</option>
                <option value="STRONG_DO_NOT_HIRE">Strong Do Not Hire</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">Key Strengths</label>
            <textarea rows="2" value={feedbackData.strengths} onChange={(e) => setFeedbackData({ ...feedbackData, strengths: e.target.value })}
              placeholder="Demonstrated competencies, technical depth, teamwork..."
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"></textarea>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">Areas for Growth</label>
            <textarea rows="2" value={feedbackData.weaknesses} onChange={(e) => setFeedbackData({ ...feedbackData, weaknesses: e.target.value })}
              placeholder="Identified gaps, missing experience..."
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"></textarea>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">Executive Summary *</label>
            <textarea required rows="3" value={feedbackData.summaryComments} onChange={(e) => setFeedbackData({ ...feedbackData, summaryComments: e.target.value })}
              placeholder="Comprehensive summary of interview performance..."
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setIsFeedbackModalOpen(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={submittingFeedback} className="px-5 py-2 bg-brand-600 text-white rounded-lg text-sm font-semibold hover:bg-brand-700 shadow-sm disabled:opacity-50">
              {submittingFeedback ? 'Submitting...' : 'Submit Evaluation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InterviewListPage;
