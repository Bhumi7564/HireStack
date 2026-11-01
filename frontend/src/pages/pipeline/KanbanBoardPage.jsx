import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ApplicationDetailsModal from '../../components/pipeline/ApplicationDetailsModal';
import {
  Kanban,
  History,
  AlertCircle,
  MoveRight,
  Filter,
  User,
  Calendar,
  Building,
  CheckCircle2,
  Eye,
  GripVertical,
} from 'lucide-react';

const PIPELINE_COLUMNS = [
  { stage: 'APPLIED', title: 'Applied', color: 'border-t-blue-500' },
  { stage: 'SCREENING', title: 'Screening', color: 'border-t-amber-500' },
  { stage: 'INTERVIEW', title: 'Interview', color: 'border-t-purple-500' },
  { stage: 'OFFER', title: 'Offer', color: 'border-t-emerald-500' },
  { stage: 'HIRED', title: 'Hired', color: 'border-t-green-600' },
  { stage: 'REJECTED', title: 'Rejected', color: 'border-t-rose-500' },
];

const KanbanBoardPage = () => {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorToast, setErrorToast] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Drag and drop state
  const [draggedApp, setDraggedApp] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  // Application Details Drawer State
  const [selectedAppForDetails, setSelectedAppForDetails] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Move Modal State
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [activeApp, setActiveApp] = useState(null);
  const [targetStage, setTargetStage] = useState('');
  const [moveReason, setMoveReason] = useState('');
  const [moving, setMoving] = useState(false);

  // History Modal State
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const { isAdmin, isRecruiter } = useAuth();
  const canModify = isAdmin || isRecruiter;

  const fetchBoardData = async () => {
    setLoading(true);
    try {
      const [appsRes, jobsRes] = await Promise.all([
        api.get('/applications/board', {
          params: selectedJobId ? { jobId: selectedJobId } : {},
        }),
        api.get('/jobs?status=OPEN&size=50'),
      ]);

      if (appsRes.data.success) {
        setApplications(appsRes.data.data);
      }
      if (jobsRes.data.success) {
        setJobs(jobsRes.data.data.content);
      }
    } catch (err) {
      console.error('Failed to load board applications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoardData();
  }, [selectedJobId]);

  const handleOpenMoveModal = (app) => {
    setActiveApp(app);
    setMoveReason('');
    const current = app.currentStage;
    if (current === 'APPLIED') setTargetStage('SCREENING');
    else if (current === 'SCREENING') setTargetStage('INTERVIEW');
    else if (current === 'INTERVIEW') setTargetStage('OFFER');
    else if (current === 'OFFER') setTargetStage('HIRED');
    else setTargetStage('');

    setIsMoveModalOpen(true);
  };

  const executeStageChange = async (appId, newStage, reasonText) => {
    setErrorToast('');
    setSuccessToast('');

    try {
      const res = await api.patch(`/applications/${appId}/stage`, {
        targetStage: newStage,
        reason: reasonText || `Pipeline stage transitioned to ${newStage}`,
      });

      if (res.data.success) {
        setSuccessToast(`Application transitioned to ${newStage} successfully.`);
        fetchBoardData();
        setTimeout(() => setSuccessToast(''), 3000);
        return true;
      }
    } catch (err) {
      setErrorToast(
        err.response?.data?.message || `Invalid stage transition to ${newStage}.`
      );
      return false;
    }
  };

  const handleExecuteMove = async (e) => {
    e.preventDefault();
    if (!activeApp || !targetStage) return;

    setMoving(true);
    const success = await executeStageChange(
      activeApp.id,
      targetStage,
      moveReason || `Advanced from ${activeApp.currentStage} to ${targetStage}`
    );
    setMoving(false);

    if (success) {
      setIsMoveModalOpen(false);
      if (selectedAppForDetails?.id === activeApp.id) {
        setSelectedAppForDetails((prev) => ({ ...prev, currentStage: targetStage }));
      }
    }
  };

  // Drag-and-drop Handlers
  const handleDragStart = (e, app) => {
    setDraggedApp(app);
    e.dataTransfer.setData('text/plain', JSON.stringify({ appId: app.id, fromStage: app.currentStage }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, colStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== colStage) {
      setDragOverColumn(colStage);
    }
  };

  const handleDragLeave = (e, colStage) => {
    if (dragOverColumn === colStage) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (e, colStage) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (!draggedApp) return;
    if (draggedApp.currentStage === colStage) {
      setDraggedApp(null);
      return;
    }

    const appToMove = draggedApp;
    setDraggedApp(null);

    await executeStageChange(
      appToMove.id,
      colStage,
      `Moved from ${appToMove.currentStage} to ${colStage} via Kanban drag & drop`
    );
  };

  const handleCardClick = (app) => {
    setSelectedAppForDetails(app);
    setIsDetailsOpen(true);
  };

  const handleViewHistory = async (e, app) => {
    e.stopPropagation();
    setActiveApp(app);
    setIsHistoryModalOpen(true);
    setHistoryLoading(true);

    try {
      const res = await api.get(`/applications/${app.id}/history`);
      if (res.data.success) {
        setHistoryRecords(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load history', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Notifications */}
      {errorToast && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorToast}</span>
          </div>
          <button onClick={() => setErrorToast('')} className="text-xs font-semibold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast('')} className="text-xs font-semibold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Recruitment Pipeline</h1>
          <p className="text-sm text-slate-500 mt-1">
            Drag and drop candidates across stages or click any card for full application details and audit trail.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Job Requisitions ({applications.length} applications)</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title} – {j.department}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Kanban Board Grid */}
      {loading ? (
        <LoadingSpinner text="Synchronizing pipeline with PostgreSQL..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 min-h-[600px] items-start">
          {PIPELINE_COLUMNS.map((col) => {
            const colApps = applications.filter((a) => a.currentStage === col.stage);
            const isHovered = dragOverColumn === col.stage;

            return (
              <div
                key={col.stage}
                onDragOver={(e) => handleDragOver(e, col.stage)}
                onDragLeave={(e) => handleDragLeave(e, col.stage)}
                onDrop={(e) => handleDrop(e, col.stage)}
                className={`border rounded-xl flex flex-col min-h-[500px] max-h-[750px] border-t-4 ${col.color} transition-all duration-150 ${isHovered ? 'bg-brand-50/70 border-brand-300 ring-2 ring-brand-400/30' : 'bg-slate-100/70 border-slate-200/80'
                  }`}
              >
                {/* Column Header */}
                <div className="p-3.5 border-b border-slate-200/80 flex items-center justify-between bg-white/70 rounded-t-lg">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs uppercase tracking-wider text-slate-800">
                      {col.title}
                    </span>
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center">
                      {colApps.length}
                    </span>
                  </div>
                </div>

                {/* Cards Container */}
                <div className="p-2.5 space-y-2.5 overflow-y-auto flex-1">
                  {colApps.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400 font-medium border-2 border-dashed border-slate-200/60 rounded-lg m-1">
                      Drop candidate here
                    </div>
                  ) : (
                    colApps.map((app) => (
                      <div
                        key={app.id}
                        draggable={canModify}
                        onDragStart={(e) => handleDragStart(e, app)}
                        onClick={() => handleCardClick(app)}
                        className={`bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-2.5 cursor-pointer relative group select-none ${draggedApp?.id === app.id ? 'opacity-40 border-dashed border-brand-400' : ''
                          }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            {canModify && (
                              <GripVertical className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 cursor-grab flex-shrink-0" />
                            )}
                            <span className="font-semibold text-slate-900 text-sm truncate">
                              {app.candidateName}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCardClick(app);
                              }}
                              title="View Full Profile & Application"
                              className="p-1 rounded text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleViewHistory(e, app)}
                              title="View Stage History"
                              className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                              <History className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-brand-700 font-medium line-clamp-1">{app.jobTitle}</p>
                          <p className="text-[11px] text-slate-400">{app.department}</p>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {new Date(app.appliedDate).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                          {app.recruiterName && (
                            <span className="truncate max-w-[100px]">{app.recruiterName.split(' ')[0]}</span>
                          )}
                        </div>

                        {/* Move Stage Action Button */}
                        {canModify && col.stage !== 'HIRED' && col.stage !== 'REJECTED' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenMoveModal(app);
                            }}
                            className="w-full mt-2 py-1.5 px-2 bg-slate-50 hover:bg-brand-50 hover:text-brand-700 border border-slate-200 rounded text-xs font-semibold text-slate-600 flex items-center justify-center gap-1 transition-colors"
                          >
                            <span>Move Stage</span>
                            <MoveRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Application Details Drawer Modal */}
      <ApplicationDetailsModal
        isOpen={isDetailsOpen}
        application={selectedAppForDetails}
        onClose={() => setIsDetailsOpen(false)}
        onMoveStage={(app) => {
          setIsDetailsOpen(false);
          handleOpenMoveModal(app);
        }}
      />

      {/* Move Stage Modal */}
      <Modal
        isOpen={isMoveModalOpen}
        onClose={() => setIsMoveModalOpen(false)}
        title={`Advance Candidate: ${activeApp?.candidateName}`}
      >
        <form onSubmit={handleExecuteMove} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1 text-slate-600 border border-slate-200">
            <p>
              Job Opening: <strong className="text-slate-900">{activeApp?.jobTitle}</strong>
            </p>
            <p>
              Current Stage: <Badge variant={activeApp?.currentStage}>{activeApp?.currentStage}</Badge>
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Select Target Stage *
            </label>
            <select
              required
              value={targetStage}
              onChange={(e) => setTargetStage(e.target.value)}
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Select Next Stage</option>
              {activeApp?.currentStage === 'APPLIED' && (
                <>
                  <option value="SCREENING">Screening (Resume Approved)</option>
                  <option value="REJECTED">Reject Candidate</option>
                </>
              )}
              {activeApp?.currentStage === 'SCREENING' && (
                <>
                  <option value="INTERVIEW">Interview (Schedule Panel)</option>
                  <option value="REJECTED">Reject Candidate</option>
                </>
              )}
              {activeApp?.currentStage === 'INTERVIEW' && (
                <>
                  <option value="OFFER">Offer (Extend Formal Offer)</option>
                  <option value="REJECTED">Reject Candidate</option>
                </>
              )}
              {activeApp?.currentStage === 'OFFER' && (
                <>
                  <option value="HIRED">Hired (Offer Accepted & Signed)</option>
                  <option value="REJECTED">Reject Candidate</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Transition Reason / Feedback Note
            </label>
            <textarea
              rows="3"
              value={moveReason}
              onChange={(e) => setMoveReason(e.target.value)}
              placeholder="Provide reason for this pipeline movement..."
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsMoveModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={moving || !targetStage}
              className="px-5 py-2 bg-brand-600 text-white rounded-lg text-sm font-semibold hover:bg-brand-700 shadow-sm disabled:opacity-50"
            >
              {moving ? 'Saving to Database...' : 'Update Stage'}
            </button>
          </div>
        </form>
      </Modal>

      {/* History Timeline Modal */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title={`Audit Trail: ${activeApp?.candidateName}`}
      >
        {historyLoading ? (
          <LoadingSpinner text="Loading stage audit history..." />
        ) : (
          <div className="space-y-4">
            <div className="border-l-2 border-slate-200 pl-4 ml-2 space-y-6">
              {historyRecords.map((item) => (
                <div key={item.id} className="relative">
                  <div className="absolute -left-[25px] top-1 w-4 h-4 rounded-full bg-brand-600 border-4 border-white shadow-sm" />
                  <div>
                    <div className="flex items-center gap-2">
                      {item.fromStage ? (
                        <span className="text-xs font-semibold text-slate-500">
                          {item.fromStage} → <strong className="text-slate-900">{item.toStage}</strong>
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-slate-900">
                          Applied: {item.toStage}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 italic">
                      "{item.changeReason || 'Stage updated'}"
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      By {item.changedByUserName} on{' '}
                      {new Date(item.changedAt).toLocaleString([], {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default KanbanBoardPage;
