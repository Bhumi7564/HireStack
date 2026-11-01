import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Badge from '../common/Badge';
import LoadingSpinner from '../common/LoadingSpinner';
import {
  X,
  User,
  Mail,
  Phone,
  Linkedin,
  Briefcase,
  MapPin,
  Calendar,
  FileText,
  Clock,
  MessageSquare,
  Award,
  Download,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  Send,
  Star,
} from 'lucide-react';

const ApplicationDetailsModal = ({ application, isOpen, onClose, onMoveStage }) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Tab data states
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [interviews, setInterviews] = useState([]);
  const [interviewsLoading, setInterviewsLoading] = useState(false);
  const [interviewFeedbacks, setInterviewFeedbacks] = useState({});

  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);

  const [communications, setCommunications] = useState([]);
  const [commsLoading, setCommsLoading] = useState(false);

  // Quick log communication state
  const [commType, setCommType] = useState('NOTE');
  const [commSubject, setCommSubject] = useState('');
  const [commNotes, setCommNotes] = useState('');
  const [loggingComm, setLoggingComm] = useState(false);

  useEffect(() => {
    if (!isOpen || !application) return;

    // Reset tabs
    setActiveTab('overview');

    // Fetch history
    const fetchHistory = async () => {
      setHistoryLoading(true);
      try {
        const res = await api.get(`/applications/${application.id}/history`);
        if (res.data.success) setHistory(res.data.data);
      } catch (e) {
        console.error('History load error', e);
      } finally {
        setHistoryLoading(false);
      }
    };

    // Fetch interviews & feedbacks
    const fetchInterviews = async () => {
      setInterviewsLoading(true);
      try {
        const res = await api.get(`/interviews/application/${application.id}`);
        if (res.data.success) {
          const list = res.data.data;
          setInterviews(list);

          // Fetch feedback for each interview
          const feedbackMap = {};
          await Promise.all(
            list.map(async (inv) => {
              try {
                const fbRes = await api.get(`/feedback/interview/${inv.id}`);
                if (fbRes.data.success) {
                  feedbackMap[inv.id] = fbRes.data.data;
                }
              } catch (e) {
                // Ignore feedback fetch error for unscheduled / no-feedback interviews
              }
            })
          );
          setInterviewFeedbacks(feedbackMap);
        }
      } catch (e) {
        console.error('Interviews load error', e);
      } finally {
        setInterviewsLoading(false);
      }
    };

    // Fetch documents
    const fetchDocuments = async () => {
      if (!application.candidateId) return;
      setDocumentsLoading(true);
      try {
        const res = await api.get(`/documents/candidate/${application.candidateId}`);
        if (res.data.success) setDocuments(res.data.data);
      } catch (e) {
        console.error('Documents load error', e);
      } finally {
        setDocumentsLoading(false);
      }
    };

    // Fetch communications
    const fetchCommunications = async () => {
      setCommsLoading(true);
      try {
        const res = await api.get(`/communication/application/${application.id}`);
        if (res.data.success) setCommunications(res.data.data);
      } catch (e) {
        console.error('Communication logs load error', e);
      } finally {
        setCommsLoading(false);
      }
    };

    fetchHistory();
    fetchInterviews();
    fetchDocuments();
    fetchCommunications();
  }, [isOpen, application]);

  const handleLogCommunication = async (e) => {
    e.preventDefault();
    if (!commSubject.trim() || !commNotes.trim()) return;

    setLoggingComm(true);
    try {
      const res = await api.post('/communication/logs', {
        candidateId: application.candidateId,
        applicationId: application.id,
        communicationType: commType,
        subject: commSubject.trim(),
        content: commNotes.trim(),
      });
      if (res.data.success) {
        setCommunications((prev) => [res.data.data, ...prev]);
        setCommSubject('');
        setCommNotes('');
      }
    } catch (err) {
      console.error('Failed to log communication', err);
    } finally {
      setLoggingComm(false);
    }
  };

  const handleDownloadDoc = async (docId, fileName) => {
    try {
      const response = await api.get(`/documents/${docId}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Download document error', err);
    }
  };

  if (!isOpen || !application) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-end">
      <div className="bg-white w-full max-w-3xl min-h-screen shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">

        {/* Drawer Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900">{application.candidateName}</h2>
              <Badge variant={application.currentStage}>{application.currentStage}</Badge>
            </div>
            <p className="text-sm text-slate-600 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-slate-400" />
              <span>Applying for <strong>{application.jobTitle}</strong> ({application.department})</span>
            </p>
            {application.candidateLocation && (
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{application.candidateLocation}</span>
                {application.candidateCurrentCompany && (
                  <span>&bull; Currently at {application.candidateCurrentCompany} ({application.candidateCurrentTitle || 'Specialist'})</span>
                )}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onMoveStage?.(application)}
              className="px-3 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-lg transition-colors cursor-pointer"
            >
              Advance Stage
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-white gap-6">
          {[
            { id: 'overview', label: 'Candidate & Job Info', icon: User },
            { id: 'history', label: `Audit Trail (${history.length})`, icon: Clock },
            { id: 'interviews', label: `Interviews (${interviews.length})`, icon: Award },
            { id: 'documents', label: `Documents (${documents.length})`, icon: FileText },
            { id: 'comms', label: `Communications (${communications.length})`, icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${isActive
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Container */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                  Contact & Profile Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>{application.candidateEmail || 'Email not provided'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{application.candidatePhone || 'Phone not provided'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Briefcase className="w-4 h-4 text-slate-400" />
                    <span>Experience: {application.candidateExperienceYears != null ? `${application.candidateExperienceYears} years` : 'Not specified'}</span>
                  </div>
                  {application.candidateLinkedinUrl && (
                    <div className="flex items-center gap-2 text-brand-600">
                      <Linkedin className="w-4 h-4" />
                      <a
                        href={application.candidateLinkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline flex items-center gap-1 font-medium"
                      >
                        LinkedIn Profile <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Candidate Skills */}
                {application.candidateSkills && application.candidateSkills.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                      Key Competencies &amp; Skills:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {application.candidateSkills.map((sk, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-md text-xs font-medium"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Candidate Notes */}
                {application.candidateNotes && (
                  <div className="mt-4 pt-3 border-t border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                      Candidate Notes:
                    </span>
                    <p className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200 italic">
                      "{application.candidateNotes}"
                    </p>
                  </div>
                )}
              </div>

              {/* Application / Cover Letter Details */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                  Application Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 mb-3">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Applied Date:</span>
                    <span className="font-medium text-slate-800">
                      {new Date(application.appliedDate).toLocaleDateString([], {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Assigned Recruiter:</span>
                    <span className="font-medium text-slate-800">
                      {application.recruiterName || 'Unassigned'}
                    </span>
                  </div>
                </div>

                {application.coverLetter ? (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                      Cover Letter:
                    </span>
                    <div className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200 whitespace-pre-line leading-relaxed">
                      {application.coverLetter}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No cover letter submitted.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: AUDIT TRAIL / STAGE HISTORY */}
          {activeTab === 'history' && (
            <div>
              {historyLoading ? (
                <LoadingSpinner text="Retrieving audit history..." />
              ) : history.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">No stage history recorded yet.</div>
              ) : (
                <div className="relative border-l-2 border-brand-200 ml-4 pl-6 space-y-6">
                  {history.map((record) => (
                    <div key={record.id} className="relative group">
                      <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-brand-600 border-4 border-white shadow-sm" />
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-900">
                            {record.fromStage ? (
                              <span className="flex items-center gap-1.5">
                                <Badge variant={record.fromStage}>{record.fromStage}</Badge>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                <Badge variant={record.toStage}>{record.toStage}</Badge>
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5">
                                Initial Application: <Badge variant={record.toStage}>{record.toStage}</Badge>
                              </span>
                            )}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(record.changedAt).toLocaleString([], {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-2 italic bg-white p-2.5 rounded-lg border border-slate-100">
                          "{record.changeReason || 'Stage updated'}"
                        </p>
                        <p className="text-[11px] text-slate-400 mt-2">
                          Updated by <strong className="text-slate-600">{record.changedByUserName}</strong>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: INTERVIEWS & FEEDBACK */}
          {activeTab === 'interviews' && (
            <div className="space-y-4">
              {interviewsLoading ? (
                <LoadingSpinner text="Loading interview sessions..." />
              ) : interviews.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-600">No interviews scheduled yet</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Schedule technical, cultural, or executive rounds from the Interviews section.
                  </p>
                </div>
              ) : (
                interviews.map((inv) => {
                  const feedbacks = interviewFeedbacks[inv.id] || [];
                  return (
                    <div key={inv.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">{inv.roundTitle}</h4>
                            <Badge variant={inv.status}>{inv.status}</Badge>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {new Date(inv.scheduledStartTime).toLocaleString([], {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </p>
                        </div>
                        {inv.meetingLink && (
                          <a
                            href={inv.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-md flex items-center gap-1"
                          >
                            Meeting Link <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      {/* Panel Members */}
                      {inv.panelMembers && inv.panelMembers.length > 0 && (
                        <div className="text-xs text-slate-600">
                          <span className="font-semibold text-slate-500 text-[11px] uppercase">Panel: </span>
                          <span>{inv.panelMembers.map((m) => m.interviewerName).join(', ')}</span>
                        </div>
                      )}

                      {/* Feedback List */}
                      <div className="pt-3 border-t border-slate-200">
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">
                          Evaluations &amp; Feedback ({feedbacks.length}):
                        </span>
                        {feedbacks.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">No feedback submitted for this round yet.</p>
                        ) : (
                          <div className="space-y-2">
                            {feedbacks.map((fb) => (
                              <div key={fb.id} className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-800">{fb.interviewerName}</span>
                                  <div className="flex items-center gap-2">
                                    {fb.overallRating && (
                                      <span className="flex items-center gap-1 font-bold text-amber-600">
                                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                                        {fb.overallRating}/5
                                      </span>
                                    )}
                                    {fb.recommendation && (
                                      <Badge variant={fb.recommendation.includes('HIRE') ? 'HIRED' : 'REJECTED'}>
                                        {fb.recommendation}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                {fb.comments && (
                                  <p className="text-slate-600 italic">"{fb.comments}"</p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 4: DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="space-y-3">
              {documentsLoading ? (
                <LoadingSpinner text="Checking candidate documents..." />
              ) : documents.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-600">No documents uploaded</p>
                  <p className="text-xs text-slate-400 mt-1">Candidate resumes and portfolios will appear here.</p>
                </div>
              ) : (
                documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs uppercase">
                        {doc.documentCategory || 'DOC'}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{doc.fileName}</h4>
                        <p className="text-[11px] text-slate-400">
                          Uploaded {new Date(doc.uploadedAt).toLocaleDateString()} &bull; {doc.fileSize != null ? `${(doc.fileSize / 1024).toFixed(1)} KB` : ''}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDownloadDoc(doc.id, doc.fileName)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 5: COMMUNICATIONS */}
          {activeTab === 'comms' && (
            <div className="space-y-4">
              {/* Quick Communication Log Form */}
              <form onSubmit={handleLogCommunication} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Log Candidate Interaction / Note
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={commType}
                    onChange={(e) => setCommType(e.target.value)}
                    className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-slate-700"
                  >
                    <option value="NOTE">Internal Note</option>
                    <option value="EMAIL">Sent Email</option>
                    <option value="PHONE">Phone Call</option>
                    <option value="OFFER_LETTER">Offer Letter</option>
                  </select>
                  <input
                    type="text"
                    required
                    placeholder="Subject / Summary..."
                    value={commSubject}
                    onChange={(e) => setCommSubject(e.target.value)}
                    className="col-span-2 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <textarea
                  rows="2"
                  required
                  placeholder="Details of the interaction..."
                  value={commNotes}
                  onChange={(e) => setCommNotes(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                ></textarea>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loggingComm || !commSubject.trim() || !commNotes.trim()}
                    className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{loggingComm ? 'Saving...' : 'Add Log Entry'}</span>
                  </button>
                </div>
              </form>

              {/* Communication Logs */}
              {commsLoading ? (
                <LoadingSpinner text="Loading communications..." />
              ) : communications.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">No communication logs recorded yet.</div>
              ) : (
                <div className="space-y-2">
                  {communications.map((item) => (
                    <div key={item.id} className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                            {item.communicationType}
                          </span>
                          <span className="font-semibold text-slate-900">{item.subject}</span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {new Date(item.sentAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-600 whitespace-pre-line pl-1">{item.content}</p>
                      <p className="text-[10px] text-slate-400 pl-1 pt-1 border-t border-slate-50">
                        Logged by {item.sentByUserName}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <span className="text-xs text-slate-400">Application ID: #{application.id}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailsModal;

