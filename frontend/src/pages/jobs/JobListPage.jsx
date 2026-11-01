import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  MapPin,
  Building,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit2,
  Trash2,
  DollarSign,
  Users,
  Clock,
} from 'lucide-react';

const JobListPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [recruiters, setRecruiters] = useState([]);
  const [notification, setNotification] = useState({ type: '', message: '' });

  // Create & Edit Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    employmentType: 'FULL_TIME',
    experienceLevel: 'MID_LEVEL',
    description: '',
    requirements: '',
    responsibilities: '',
    salaryRangeMin: '',
    salaryRangeMax: '',
    recruiterId: '',
    openingsCount: 1,
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // View Details Modal State
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [viewingJob, setViewingJob] = useState(null);

  // Delete Confirm State
  const [deleteCandidateJob, setDeleteCandidateJob] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { isAdmin, isRecruiter } = useAuth();
  const canManage = isAdmin || isRecruiter;

  const showToast = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 3500);
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size: 10,
        sortBy: 'createdAt',
        sortDirection: 'desc',
      };
      if (search) params.search = search;
      if (department) params.department = department;
      if (status) params.status = status;

      const res = await api.get('/jobs', { params });
      if (res.data.success) {
        setJobs(res.data.data.content);
        setTotalPages(res.data.data.totalPages);
      }
    } catch (err) {
      console.error('Failed to load jobs', err);
      showToast('error', 'Failed to retrieve job listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page, department, status]);

  useEffect(() => {
    const fetchRecruiters = async () => {
      try {
        const res = await api.get('/recruiters');
        if (res.data.success) {
          setRecruiters(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load recruiters', err);
      }
    };
    fetchRecruiters();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchJobs();
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setSelectedJobId(null);
    setFormError('');
    setFormData({
      title: '',
      department: '',
      location: '',
      employmentType: 'FULL_TIME',
      experienceLevel: 'MID_LEVEL',
      description: '',
      requirements: '',
      responsibilities: '',
      salaryRangeMin: '',
      salaryRangeMax: '',
      recruiterId: '',
      openingsCount: 1,
    });
    setIsFormModalOpen(true);
  };

  const openEditModal = (job) => {
    setIsEditing(true);
    setSelectedJobId(job.id);
    setFormError('');
    setFormData({
      title: job.title || '',
      department: job.department || '',
      location: job.location || '',
      employmentType: job.employmentType || 'FULL_TIME',
      experienceLevel: job.experienceLevel || 'MID_LEVEL',
      description: job.description || '',
      requirements: job.requirements || '',
      responsibilities: job.responsibilities || '',
      salaryRangeMin: job.salaryRangeMin != null ? job.salaryRangeMin : '',
      salaryRangeMax: job.salaryRangeMax != null ? job.salaryRangeMax : '',
      recruiterId: job.recruiterId ? String(job.recruiterId) : '',
      openingsCount: job.openingsCount || 1,
    });
    setIsFormModalOpen(true);
  };

  const openDetailsModal = (job) => {
    setViewingJob(job);
    setIsDetailsModalOpen(true);
  };

  const handleSaveJob = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        openingsCount: parseInt(formData.openingsCount, 10),
        salaryRangeMin: formData.salaryRangeMin ? parseFloat(formData.salaryRangeMin) : null,
        salaryRangeMax: formData.salaryRangeMax ? parseFloat(formData.salaryRangeMax) : null,
        recruiterId: formData.recruiterId ? parseInt(formData.recruiterId, 10) : null,
      };

      if (isEditing) {
        const res = await api.put(`/jobs/${selectedJobId}`, payload);
        if (res.data.success) {
          showToast('success', `Job "${formData.title}" updated successfully.`);
          setIsFormModalOpen(false);
          fetchJobs();
        }
      } else {
        const res = await api.post('/jobs', payload);
        if (res.data.success) {
          showToast('success', `Job opening "${formData.title}" created successfully.`);
          setIsFormModalOpen(false);
          fetchJobs();
        }
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save job opening.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseJob = async (id, title) => {
    if (window.confirm(`Are you sure you want to close "${title}"?`)) {
      try {
        await api.patch(`/jobs/${id}/close`);
        showToast('success', `Job "${title}" marked as CLOSED.`);
        fetchJobs();
      } catch (err) {
        showToast('error', 'Failed to close job.');
      }
    }
  };

  const handleDeleteJob = async () => {
    if (!deleteCandidateJob) return;
    setDeleting(true);
    try {
      await api.delete(`/jobs/${deleteCandidateJob.id}`);
      showToast('success', `Job "${deleteCandidateJob.title}" removed successfully.`);
      setDeleteCandidateJob(null);
      fetchJobs();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to delete job.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {notification.message && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between shadow-sm animate-fade-in ${notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification({ type: '', message: '' })}
            className="text-xs font-semibold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Job Openings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage requisition postings, candidate pipelines, descriptions, and hiring assignments.
          </p>
        </div>
        {canManage && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Job Opening</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by title, department, or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
          />
        </form>

        <div className="flex items-center gap-3">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(0);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="CLOSED">Closed</option>
            <option value="PAUSED">Paused</option>
            <option value="DRAFT">Draft</option>
          </select>

          <select
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value);
              setPage(0);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="Product Design">Product Design</option>
            <option value="Human Resources">Human Resources</option>
          </select>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Retrieving job openings..." />
        ) : jobs.length === 0 ? (
          <EmptyState
            title="No job openings found"
            description="No jobs match your search parameters. Try clearing the filter or post a new job."
            actionText={canManage ? 'Post New Job' : null}
            onAction={openCreateModal}
            icon={Briefcase}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-xs uppercase font-semibold text-slate-500 tracking-wider">
                <tr>
                  <th className="px-6 py-4">Job Title & Details</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Applicants</th>
                  <th className="px-6 py-4">Recruiter</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <button
                          onClick={() => openDetailsModal(job)}
                          className="font-semibold text-slate-900 hover:text-brand-600 text-left block transition-colors"
                        >
                          {job.title}
                        </button>
                        <span className="text-xs text-slate-500 mt-0.5 block">
                          {job.employmentType} &bull; {job.experienceLevel} &bull; {job.openingsCount} opening(s)
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">{job.department}</td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>{job.location}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {job.applicationCount != null ? job.applicationCount : 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {job.recruiterName || <span className="text-slate-400 italic">Unassigned</span>}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={job.status}>{job.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openDetailsModal(job)}
                          title="View Details"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canManage && (
                          <>
                            <button
                              onClick={() => openEditModal(job)}
                              title="Edit Job"
                              className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {job.status === 'OPEN' && (
                              <button
                                onClick={() => handleCloseJob(job.id, job.title)}
                                title="Close Job"
                                className="px-2 py-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded border border-amber-200 transition-colors"
                              >
                                Close
                              </button>
                            )}
                            <button
                              onClick={() => setDeleteCandidateJob(job)}
                              title="Delete Job"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            >
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

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Page {page + 1} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="px-3 py-1 rounded bg-slate-100 text-xs font-medium text-slate-700 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 rounded bg-slate-100 text-xs font-medium text-slate-700 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Job Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title={viewingJob?.title || 'Job Opening Details'}
        maxWidth="max-w-2xl"
      >
        {viewingJob && (
          <div className="space-y-5 text-sm">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">
                  {viewingJob.department}
                </span>
                <span className="text-base font-bold text-slate-900">{viewingJob.title}</span>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{viewingJob.location}</span>
                  <span>&bull;</span>
                  <span>{viewingJob.employmentType}</span>
                </p>
              </div>
              <div className="text-right">
                <Badge variant={viewingJob.status}>{viewingJob.status}</Badge>
                <span className="text-xs text-slate-500 block mt-1">
                  {viewingJob.openingsCount} position(s) &bull; {viewingJob.applicationCount || 0} applicants
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block font-semibold mb-1">SALARY RANGE</span>
                <span className="text-slate-800 font-bold text-sm">
                  {viewingJob.salaryRangeMin != null && viewingJob.salaryRangeMax != null
                    ? `$${viewingJob.salaryRangeMin.toLocaleString()} – $${viewingJob.salaryRangeMax.toLocaleString()}`
                    : 'Not disclosed'}
                </span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block font-semibold mb-1">ASSIGNED RECRUITER</span>
                <span className="text-slate-800 font-bold text-sm">
                  {viewingJob.recruiterName || 'Unassigned'}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Description</h4>
              <p className="text-slate-700 bg-slate-50 p-3.5 rounded-lg border border-slate-200 whitespace-pre-line leading-relaxed">
                {viewingJob.description || 'No description provided.'}
              </p>
            </div>

            {viewingJob.requirements && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Requirements</h4>
                <p className="text-slate-700 bg-slate-50 p-3.5 rounded-lg border border-slate-200 whitespace-pre-line leading-relaxed">
                  {viewingJob.requirements}
                </p>
              </div>
            )}

            {viewingJob.responsibilities && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Responsibilities</h4>
                <p className="text-slate-700 bg-slate-50 p-3.5 rounded-lg border border-slate-200 whitespace-pre-line leading-relaxed">
                  {viewingJob.responsibilities}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700"
              >
                Close
              </button>
              {canManage && (
                <button
                  type="button"
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    openEditModal(viewingJob);
                  }}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold"
                >
                  Edit Job
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Create / Edit Job Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={isEditing ? 'Edit Job Opening' : 'Create New Job Opening'}
        maxWidth="max-w-3xl"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {formError}
          </div>
        )}
        <form onSubmit={handleSaveJob} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Job Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Senior Full-Stack Engineer"
                className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Department *
              </label>
              <input
                type="text"
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g. Engineering"
                className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Location *
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. San Francisco, CA / Remote"
                className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Assign Recruiter
              </label>
              <select
                value={formData.recruiterId}
                onChange={(e) => setFormData({ ...formData, recruiterId: e.target.value })}
                className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Select Recruiter</option>
                {recruiters.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.fullName} ({r.department})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Openings Count
              </label>
              <input
                type="number"
                min="1"
                value={formData.openingsCount}
                onChange={(e) => setFormData({ ...formData, openingsCount: e.target.value })}
                className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Min Salary ($)
                </label>
                <input
                  type="number"
                  value={formData.salaryRangeMin}
                  onChange={(e) => setFormData({ ...formData, salaryRangeMin: e.target.value })}
                  placeholder="100000"
                  className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Max Salary ($)
                </label>
                <input
                  type="number"
                  value={formData.salaryRangeMax}
                  onChange={(e) => setFormData({ ...formData, salaryRangeMax: e.target.value })}
                  placeholder="140000"
                  className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Job Description *
            </label>
            <textarea
              required
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of the role and scope..."
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Requirements
            </label>
            <textarea
              rows="2"
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              placeholder="Skills, qualifications, and experience required..."
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsFormModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-brand-600 text-white rounded-lg text-sm font-semibold hover:bg-brand-700 shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Saving...' : isEditing ? 'Update Job' : 'Create Job'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteCandidateJob)}
        onClose={() => setDeleteCandidateJob(null)}
        title="Delete Job Opening"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to permanently delete the job opening{' '}
            <strong className="text-slate-900 font-semibold">"{deleteCandidateJob?.title}"</strong>?
          </p>
          <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
            This will remove this job opening and its associated pipeline associations.
          </p>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              disabled={deleting}
              onClick={() => setDeleteCandidateJob(null)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={handleDeleteJob}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-sm disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default JobListPage;
