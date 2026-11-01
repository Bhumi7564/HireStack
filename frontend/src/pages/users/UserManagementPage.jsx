import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  ShieldCheck,
  Mail,
  Plus,
  Edit2,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  Eye,
  EyeOff,
  Users,
} from 'lucide-react';

const BLANK_CREATE_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'ROLE_INTERVIEWER',
  phone: '',
  department: '',
};

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ type: '', message: '' });

  // Create User Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState(BLANK_CREATE_FORM);
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);

  // Edit Role Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editRole, setEditRole] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editError, setEditError] = useState('');
  const [saving, setSaving] = useState(false);

  const { user: currentUser } = useAuth();

  const showToast = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 4000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      if (res.data.success) setUsers(res.data.data);
    } catch (err) {
      console.error('Failed to load company users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggleActive = async (id) => {
    try {
      await api.patch(`/users/${id}/toggle-active`);
      const u = users.find((x) => x.id === id);
      showToast('success', `${u?.firstName} ${u?.lastName} has been ${u?.active ? 'deactivated' : 'activated'}.`);
      fetchUsers();
    } catch (err) {
      showToast('error', 'Failed to update user status.');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateError('');

    if (createForm.password.length < 6) {
      setCreateError('Password must be at least 6 characters.');
      return;
    }

    setCreating(true);
    try {
      const res = await api.post('/users', {
        firstName: createForm.firstName.trim(),
        lastName: createForm.lastName.trim(),
        email: createForm.email.trim().toLowerCase(),
        password: createForm.password,
        role: createForm.role,
        phone: createForm.phone.trim() || null,
      });

      if (res.data.success) {
        showToast('success', `Team member "${createForm.firstName} ${createForm.lastName}" created successfully.`);
        setIsCreateModalOpen(false);
        setCreateForm(BLANK_CREATE_FORM);
        fetchUsers();
      }
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create team member.');
    } finally {
      setCreating(false);
    }
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setEditRole(u.role || 'ROLE_INTERVIEWER');
    setEditDepartment(u.department || '');
    setEditPhone(u.phone || '');
    setEditError('');
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setEditError('');
    setSaving(true);
    try {
      const res = await api.put(`/users/${editingUser.id}`, {
        role: editRole,
        phone: editPhone.trim() || null,
      });
      if (res.data.success) {
        showToast('success', `${editingUser.firstName} ${editingUser.lastName}'s role updated to ${editRole.replace('ROLE_', '')}.`);
        setIsEditModalOpen(false);
        fetchUsers();
      }
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update user.');
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadgeClass = (role) => {
    if (role === 'ROLE_HR_ADMIN') return 'bg-purple-50 text-purple-700 border border-purple-200';
    if (role === 'ROLE_RECRUITER') return 'bg-blue-50 text-blue-700 border border-blue-200';
    return 'bg-slate-100 text-slate-700 border border-slate-200';
  };

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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Management & Permissions</h1>
          <p className="text-sm text-slate-500 mt-1">Manage team members, recruitment roles (HR Admin, Recruiter, Interviewer), and access control.</p>
        </div>
        <button
          onClick={() => { setCreateForm(BLANK_CREATE_FORM); setCreateError(''); setIsCreateModalOpen(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 shadow-sm transition-colors cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Team Member</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Organization Members</h3>
            <p className="text-xs text-slate-500">Users belonging to {currentUser?.companyName || 'HireStack Global'}</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-full text-slate-700 flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> {users.length} Total Users
          </span>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading organization members..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-xs uppercase font-semibold text-slate-500 tracking-wider">
                <tr>
                  <th className="px-6 py-4">Team Member</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {u.firstName?.[0]}{u.lastName?.[0]}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 block">{u.firstName} {u.lastName}</span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />{u.email}
                          </span>
                        </div>
                      </div>
                      {u.id === currentUser?.id && (
                        <span className="ml-12 text-[10px] font-semibold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">You</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getRoleBadgeClass(u.role)}`}>
                        {(u.role || '').replace('ROLE_', '')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{u.department || '—'}</td>
                    <td className="px-6 py-4 text-slate-600">{u.phone || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${u.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {u.active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.id !== currentUser?.id && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(u)}
                            title="Edit Role"
                            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleActive(u.id)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                              u.active
                                ? 'text-rose-600 bg-rose-50 hover:bg-rose-100 border-rose-200'
                                : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                            }`}
                          >
                            {u.active ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Role Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { role: 'HR Admin', desc: 'Full system access, user management, all analytics, job & candidate management.', color: 'bg-purple-50 border-purple-200', textColor: 'text-purple-700', count: users.filter((u) => u.role === 'ROLE_HR_ADMIN').length },
          { role: 'Recruiter', desc: 'Manage jobs, candidates, applications, pipeline stage transitions, and communications.', color: 'bg-blue-50 border-blue-200', textColor: 'text-blue-700', count: users.filter((u) => u.role === 'ROLE_RECRUITER').length },
          { role: 'Interviewer', desc: 'View assigned interviews, submit feedback and evaluation rubrics.', color: 'bg-slate-50 border-slate-200', textColor: 'text-slate-700', count: users.filter((u) => u.role === 'ROLE_INTERVIEWER').length },
        ].map(({ role, desc, color, textColor, count }) => (
          <div key={role} className={`p-4 rounded-xl border ${color}`}>
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-bold uppercase tracking-wider ${textColor}`}>{role}</span>
              <span className={`text-lg font-bold ${textColor}`}>{count}</span>
            </div>
            <p className="text-xs text-slate-600">{desc}</p>
          </div>
        ))}
      </div>

      {/* Create Team Member Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Invite Team Member" maxWidth="max-w-lg">
        {createError && <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">{createError}</div>}
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">First Name *</label>
              <input type="text" required value={createForm.firstName} onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">Last Name *</label>
              <input type="text" required value={createForm.lastName} onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">Email Address *</label>
            <input type="email" required value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">Initial Password *</label>
            <div className="relative mt-1">
              <input type={showCreatePassword ? 'text' : 'password'} required value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                placeholder="Minimum 6 characters"
                className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 pr-9" />
              <button type="button" onClick={() => setShowCreatePassword(!showCreatePassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">
                {showCreatePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">Assigned Role *</label>
            <select value={createForm.role} onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
              <option value="ROLE_INTERVIEWER">Interviewer</option>
              <option value="ROLE_RECRUITER">Recruiter</option>
              <option value="ROLE_HR_ADMIN">HR Admin</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">Department</label>
              <input type="text" placeholder="e.g. Engineering" value={createForm.department}
                onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })}
                className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">Phone</label>
              <input type="text" placeholder="+1 (555) 000-0000" value={createForm.phone}
                onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={creating} className="px-5 py-2 bg-brand-600 text-white rounded-lg text-sm font-semibold hover:bg-brand-700 shadow-sm disabled:opacity-50">
              {creating ? 'Creating...' : 'Create Team Member'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Role Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit: ${editingUser?.firstName} ${editingUser?.lastName}`}>
        {editError && <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">{editError}</div>}
        <form onSubmit={handleUpdateUser} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
            <p><strong>Email:</strong> {editingUser?.email}</p>
            <p className="mt-0.5"><strong>Current Status:</strong> {editingUser?.active ? 'Active' : 'Deactivated'}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">System Role *</label>
            <select value={editRole} onChange={(e) => setEditRole(e.target.value)}
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
              <option value="ROLE_INTERVIEWER">Interviewer</option>
              <option value="ROLE_RECRUITER">Recruiter</option>
              <option value="ROLE_HR_ADMIN">HR Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">Department</label>
            <input type="text" placeholder="e.g. Engineering" value={editDepartment}
              onChange={(e) => setEditDepartment(e.target.value)}
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">Phone</label>
            <input type="text" placeholder="+1 (555) 000-0000" value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 bg-brand-600 text-white rounded-lg text-sm font-semibold hover:bg-brand-700 shadow-sm disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagementPage;
