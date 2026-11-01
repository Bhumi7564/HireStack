import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  Briefcase,
  ExternalLink,
  Send,
  Eye,
  Edit2,
  Trash2,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Linkedin,
  Star,
} from 'lucide-react';

const BLANK_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  currentCompany: '',
  currentTitle: '',
  experienceYears: '',
  location: '',
  skills: '',
  linkedinUrl: '',
  source: 'CAREER_PORTAL',
  notes: '',
};

const CandidateListPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [source, setSource] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [openJobs, setOpenJobs] = useState([]);
  const [notification, setNotification] = useState({ type: '', message: '' });

  // Add / Edit Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCandidateId, setEditingCandidateId] = useState(null);
  const [formData, setFormData] = useState(BLANK_FORM);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // View Profile Modal State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [viewingCandidate, setViewingCandidate] = useState(null);

  // Delete Confirm Modal
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Apply to Job Modal State
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [applyJobId, setApplyJobId] = useState('');
  const [applyCoverLetter, setApplyCoverLetter] = useState('');
  const [applySubmitting, setApplySubmitting] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState('');

  const { isAdmin, isRecruiter } = useAuth();
  const canManage = isAdmin || isRecruiter;

  const showToast = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 3500);
  };

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const params = { page, size: 10, sortBy: 'createdAt', sortDirection: 'desc' };
      if (search) params.search = search;
      if (source) params.source = source;

      const res = await api.get('/candidates', { params });
      if (res.data.success) {
        setCandidates(res.data.data.content);
        setTotalPages(res.data.data.totalPages);
      }
    } catch (err) {
      console.error('Failed to load candidates', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCandidates(); }, [page, source]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get('/jobs?status=OPEN&size=50');
        if (res.data.success) setOpenJobs(res.data.data.content);
      } catch (err) { console.error('Failed to load open jobs', err); }
    };
    fetchJobs();
  }, []);

  const handleSearchSubmit = (e) => { e.preventDefault(); setPage(0); fetchCandidates(); };

  const openCreateModal = () => {
    setIsEditing(false);
    setEditingCandidateId(null);
    setFormData(BLANK_FORM);
    setFormError('');
    setIsFormModalOpen(true);
  };

  const openEditModal = (c) => {
    setIsEditing(true);
    setEditingCandidateId(c.id);
    setFormError('');
    setFormData({
      firstName: c.firstName || '',
      lastName: c.lastName || '',
      email: c.email || '',
      phone: c.phone || '',
      currentCompany: c.currentCompany || '',
      currentTitle: c.currentTitle || '',
      experienceYears: c.experienceYears != null ? String(c.experienceYears) : '',
      location: c.location || '',
      skills: c.skills || '',
      linkedinUrl: c.linkedinUrl || '',
      source: c.source || 'CAREER_PORTAL',
      notes: c.notes || '',
    });
    setIsFormModalOpen(true);
  };

  const handleSaveCandidate = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        experienceYears: formData.experienceYears ? parseFloat(formData.experienceYears) : 0.0,
      };

      if (isEditing) {
        const res = await api.put(`/candidates/${editingCandidateId}`, payload);
        if (res.data.success) {
          showToast('success', `Candidate "${formData.firstName} ${formData.lastName}" updated successfully.`);
          setIsFormModalOpen(false);
          fetchCandidates();
        }
      } else {
        const res = await api.post('/candidates', payload);
        if (res.data.success) {
          showToast('success', `Candidate "${formData.firstName} ${formData.lastName}" registered successfully.`);
          setIsFormModalOpen(false);
          setFormData(BLANK_FORM);
          fetchCandidates();
        }
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save candidate profile.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCandidate = async () => {
    if (!deleteCandidate) return;
    setDeleting(true);
    try {
      await api.delete(`/candidates/${deleteCandidate.id}`);
      showToast('success', `Candidate "${deleteCandidate.fullName}" removed from the talent pool.`);
      setDeleteCandidate(null);
      fetchCandidates();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to delete candidate.');
    } finally {
      setDeleting(false);
    }
  };

  const handleOpenApplyModal = (c) => {
    setSelectedCandidate(c);
    setApplyJobId(openJobs.length > 0 ? String(openJobs[0].id) : '');
    setApplyCoverLetter('');
    setApplyError('');
    setApplySuccess('');
    setIsApplyModalOpen(true);
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    setApplyError('');
    setApplySubmitting(true);

    try {
      const res = await api.post('/applications', {
        candidateId: selectedCandidate.id,
        jobId: parseInt(applyJobId, 10),
        coverLetter: applyCoverLetter,
      });
      if (res.data.success) {
        setApplySuccess('Application submitted to the recruitment pipeline successfully!');
        setTimeout(() => setIsApplyModalOpen(false), 1200);
      }
    } catch (err) {
      setApplyError(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setApplySubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast */}
      {notification.message && (
        <div className={`p-4 rounded-xl border flex items-center justify-between shadow-sm ${notification.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
          <div className="flex items-center gap-2 text-sm font-medium">
            {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification({ type: '', message: '' })} className="text-xs font-semibold hover:underline">Dismiss</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Candidates Talent Pool</h1>
          <p className="text-sm text-slate-500 mt-1">Registered candidate directory, profiles, experience records, and application intake.</p>
        </div>
        {canManage && (
          <button onClick={openCreateModal} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 shadow-sm transition-colors cursor-pointer">
            <Plus className="w-4 h-4" />
            <span>Register Candidate</span>
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search candidates by name, email, skills, company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
          />
        </form>
        <select
          value={source}
          onChange={(e) => { setSource(e.target.value); setPage(0); }}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All Sources</option>
          <option value="LINKEDIN">LinkedIn</option>
          <option value="REFERRAL">Referral</option>
          <option value="CAREER_PORTAL">Career Portal</option>
          <option value="INDEED">Indeed</option>
          <option value="HEADHUNTER">Headhunter</option>
        </select>
      </div>

      {/* Candidates Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Retrieving candidates..." />
        ) : candidates.length === 0 ? (
          <EmptyState title="No candidates found" description="No candidates match your filter criteria." actionText={canManage ? 'Register Candidate' : null} onAction={openCreateModal} icon={Users} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-xs uppercase font-semibold text-slate-500 tracking-wider">
                <tr>
                  <th className="px-6 py-4">Candidate</th>
                  <th className="px-6 py-4">Current Role & Company</th>
                  <th className="px-6 py-4">Experience</th>
                  <th className="px-6 py-4">Skills</th>
                  <th className="px-6 py-4">Applications</th>
                  <th className="px-6 py-4">Source</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {candidates.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <button onClick={() => { setViewingCandidate(c); setIsProfileModalOpen(true); }} className="font-semibold text-slate-900 hover:text-brand-600 block text-left transition-colors">
                          {c.fullName}
                        </button>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" />{c.email}</span>
                          {c.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" />{c.phone}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-800 block">{c.currentTitle || 'Not Specified'}</span>
                      <span className="text-xs text-slate-500 block">{c.currentCompany ? `@ ${c.currentCompany}` : ''}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{c.experienceYears != null ? `${c.experienceYears} yrs` : 'N/A'}</td>
                    <td className="px-6 py-4 max-w-xs">
                      {c.skills ? (
                        <div className="flex flex-wrap gap-1">
                          {c.skills.split(',').slice(0, 3).map((sk, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-700 text-[11px]">{sk.trim()}</span>
                          ))}
                          {c.skills.split(',').length > 3 && <span className="text-[11px] text-slate-400">+{c.skills.split(',').length - 3}</span>}
                        </div>
                      ) : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                        <Briefcase className="w-3 h-3 text-slate-400" />
                        {c.applicationCount != null ? c.applicationCount : 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">{c.source}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => { setViewingCandidate(c); setIsProfileModalOpen(true); }} title="View Profile" className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        {canManage && (
                          <>
                            <button onClick={() => handleOpenApplyModal(c)} title="Submit to Job" className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors">
                              <Send className="w-4 h-4" />
                            </button>
                            <button onClick={() => openEditModal(c)} title="Edit Candidate" className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteCandidate(c)} title="Delete Candidate" className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Page {page + 1} of {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))} className="px-3 py-1 rounded bg-slate-100 text-xs font-medium text-slate-700 disabled:opacity-40">Previous</button>
              <button disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 rounded bg-slate-100 text-xs font-medium text-slate-700 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* View Profile Modal */}
      <Modal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} title="Candidate Profile" maxWidth="max-w-2xl">
        {viewingCandidate && (
          <div className="space-y-5 text-sm">
            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-lg flex-shrink-0">
                {viewingCandidate.firstName?.[0]}{viewingCandidate.lastName?.[0]}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{viewingCandidate.fullName}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{viewingCandidate.currentTitle || 'No title specified'}{viewingCandidate.currentCompany ? ` @ ${viewingCandidate.currentCompany}` : ''}</p>
                {viewingCandidate.location && (
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-1"><MapPin className="w-3.5 h-3.5" />{viewingCandidate.location}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-slate-400 block font-semibold mb-1 uppercase">Contact</span>
                <p className="flex items-center gap-1.5 text-slate-700"><Mail className="w-3.5 h-3.5 text-slate-400" />{viewingCandidate.email}</p>
                {viewingCandidate.phone && <p className="flex items-center gap-1.5 text-slate-700 mt-1"><Phone className="w-3.5 h-3.5 text-slate-400" />{viewingCandidate.phone}</p>}
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-slate-400 block font-semibold mb-1 uppercase">Experience</span>
                <p className="text-slate-700 font-semibold text-sm">{viewingCandidate.experienceYears != null ? `${viewingCandidate.experienceYears} years` : 'Not specified'}</p>
                <p className="text-slate-400 mt-1">{viewingCandidate.applicationCount != null ? `${viewingCandidate.applicationCount} application(s)` : '0 applications'}</p>
              </div>
            </div>

            {viewingCandidate.skills && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Technical Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {viewingCandidate.skills.split(',').map((sk, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-md text-xs font-medium">{sk.trim()}</span>
                  ))}
                </div>
              </div>
            )}

            {viewingCandidate.linkedinUrl && (
              <div>
                <a href={viewingCandidate.linkedinUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 border border-brand-200 rounded-lg px-3 py-1.5">
                  <Linkedin className="w-4 h-4" /> View LinkedIn Profile <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {viewingCandidate.notes && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Recruiter Notes</h4>
                <p className="text-slate-600 bg-slate-50 p-3.5 rounded-lg border border-slate-200 italic text-xs leading-relaxed">"{viewingCandidate.notes}"</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button type="button" onClick={() => setIsProfileModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700">Close</button>
              {canManage && (
                <>
                  <button type="button" onClick={() => { setIsProfileModalOpen(false); handleOpenApplyModal(viewingCandidate); }} className="px-4 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5" /> Submit to Job
                  </button>
                  <button type="button" onClick={() => { setIsProfileModalOpen(false); openEditModal(viewingCandidate); }} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold">
                    Edit Profile
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Add / Edit Candidate Modal */}
      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={isEditing ? 'Edit Candidate Profile' : 'Register New Candidate'} maxWidth="max-w-3xl">
        {formError && <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">{formError}</div>}
        <form onSubmit={handleSaveCandidate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'First Name *', key: 'firstName', type: 'text', required: true },
              { label: 'Last Name *', key: 'lastName', type: 'text', required: true },
              { label: 'Email *', key: 'email', type: 'email', required: true },
              { label: 'Phone Number', key: 'phone', type: 'text', required: false },
              { label: 'Current Company', key: 'currentCompany', type: 'text', required: false },
              { label: 'Current Title', key: 'currentTitle', type: 'text', required: false },
            ].map(({ label, key, type, required }) => (
              <div key={key}>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">{label}</label>
                <input type={type} required={required} value={formData[key]} onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                  className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
            ))}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">Experience (Years)</label>
              <input type="number" step="0.5" min="0" value={formData.experienceYears}
                onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">Recruitment Source</label>
              <select value={formData.source} onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="CAREER_PORTAL">Career Portal</option>
                <option value="LINKEDIN">LinkedIn</option>
                <option value="REFERRAL">Referral</option>
                <option value="INDEED">Indeed</option>
                <option value="HEADHUNTER">Headhunter</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">Technical Skills (comma-separated)</label>
            <input type="text" placeholder="Java, Spring Boot, React, PostgreSQL, Docker" value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">LinkedIn Profile URL</label>
            <input type="url" placeholder="https://linkedin.com/in/profile" value={formData.linkedinUrl}
              onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">Recruiter Notes</label>
            <textarea rows="2" placeholder="Internal recruiter notes about this candidate..." value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setIsFormModalOpen(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={submitting} className="px-5 py-2 bg-brand-600 text-white rounded-lg text-sm font-semibold hover:bg-brand-700 shadow-sm disabled:opacity-50">
              {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Register Candidate'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={Boolean(deleteCandidate)} onClose={() => setDeleteCandidate(null)} title="Remove Candidate">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to permanently remove <strong className="text-slate-900">"{deleteCandidate?.fullName}"</strong> from the talent pool?
          </p>
          <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
            This will remove the candidate profile. Their application history will be preserved for record keeping.
          </p>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button type="button" disabled={deleting} onClick={() => setDeleteCandidate(null)} className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="button" disabled={deleting} onClick={handleDeleteCandidate} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-sm disabled:opacity-50">
              {deleting ? 'Removing...' : 'Confirm Remove'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Submit Application Modal */}
      <Modal isOpen={isApplyModalOpen} onClose={() => setIsApplyModalOpen(false)} title={`Submit Application: ${selectedCandidate?.fullName}`}>
        {applyError && <div className="mb-4 p-3 rounded-lg bg-rose-50 text-rose-700 text-sm border border-rose-200">{applyError}</div>}
        {applySuccess && <div className="mb-4 p-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-200">{applySuccess}</div>}
        <form onSubmit={handleSubmitApplication} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">Select Open Job Requisition *</label>
            <select required value={applyJobId} onChange={(e) => setApplyJobId(e.target.value)}
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
              {openJobs.map((j) => <option key={j.id} value={j.id}>{j.title} – {j.department} ({j.location})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">Recruiter Notes / Cover Letter</label>
            <textarea rows="3" value={applyCoverLetter} onChange={(e) => setApplyCoverLetter(e.target.value)}
              placeholder="Candidate background alignment notes..."
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"></textarea>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setIsApplyModalOpen(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={applySubmitting || !applyJobId} className="px-5 py-2 bg-brand-600 text-white rounded-lg text-sm font-semibold hover:bg-brand-700 shadow-sm disabled:opacity-50">
              {applySubmitting ? 'Submitting...' : 'Submit to Pipeline'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CandidateListPage;
