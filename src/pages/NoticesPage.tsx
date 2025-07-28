import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

interface Notice {
  id: number;
  title: string;
  content: string;
  country?: string;
  country_id?: number;
  status?: number;
}

const NoticesPage: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editNotice, setEditNotice] = useState<Notice | null>(null);
  const [form, setForm] = useState<{ title: string; content: string; country_id?: number }>({ title: '', content: '', country_id: undefined });
  const [submitting, setSubmitting] = useState(false);
  const [countries, setCountries] = useState<{ id: number; name: string }[]>([]);
  const [countryFilter, setCountryFilter] = useState<number | ''>('');
  const [showArchived, setShowArchived] = useState(false);

  const fetchNotices = async (countryId?: number | '', archived = false) => {
    setLoading(true);
    setError(null);
    try {
      let url = '/api/notices';
      const params = [];
      if (countryId) params.push(`country_id=${countryId}`);
      params.push(`status=${archived ? 1 : 0}`);
      if (params.length) url += '?' + params.join('&');
      const res = await axios.get(url);
      setNotices(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notices');
    }
    setLoading(false);
  };

  useEffect(() => { fetchNotices(); }, []);

  useEffect(() => {
    axios.get('/api/notices/countries').then(res => setCountries(res.data));
  }, []);

  useEffect(() => { fetchNotices(countryFilter, showArchived); }, [countryFilter, showArchived]);

  const handleAdd = () => {
    setForm({ title: '', content: '', country_id: undefined });
    setEditNotice(null);
    setModalOpen(true);
  };

  const handleEdit = (notice: Notice) => {
    setForm({ title: notice.title, content: notice.content, country_id: notice.country_id });
    setEditNotice(notice);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this notice?')) return;
    try {
      await axios.delete(`/api/notices/${id}`);
      fetchNotices(countryFilter, showArchived);
    } catch (err: any) {
      setError(err.message || 'Failed to delete notice');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editNotice) {
        await axios.put(`/api/notices/${editNotice.id}`, form);
      } else {
        await axios.post('/api/notices', form);
      }
      setModalOpen(false);
      fetchNotices(countryFilter, showArchived);
    } catch (err: any) {
      setError(err.message || 'Failed to save notice');
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-2 sm:px-4">
      <div className="sticky top-0 z-10 bg-white rounded-lg shadow flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 py-3 mb-6">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center">
          <div className="flex items-center gap-2">
            <label htmlFor="countryFilter" className="text-sm font-medium">Country:</label>
            <select
              id="countryFilter"
              value={countryFilter}
              onChange={e => setCountryFilter(e.target.value ? Number(e.target.value) : '')}
              className="border rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Countries</option>
              {countries.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-1 text-sm font-medium">
            <input type="checkbox" checked={showArchived} onChange={e => setShowArchived(e.target.checked)} />
            Show Archived
          </label>
        </div>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 shadow"
        >
          Add Notice
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center items-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
      ) : error ? (
        <div className="text-red-600 mb-4">{error}</div>
      ) : notices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <svg width="80" height="80" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="12" fill="#f3f4f6"/><path d="M7 9h10M7 13h5" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"/></svg>
          <div className="mt-4 text-lg font-medium">No notices found</div>
          <div className="text-sm">Click "Add Notice" to create your first notice.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {notices.map((notice) => (
            <div key={notice.id} className="bg-white rounded-lg shadow p-5 flex flex-col relative group transition hover:shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold px-2 py-1 rounded-full "
                  style={{ background: notice.status === 0 ? '#dcfce7' : '#f3f4f6', color: notice.status === 0 ? '#16a34a' : '#6b7280' }}>
                  {notice.status === 0 ? 'Active' : 'Archived'}
                </span>
                <div className="flex gap-2 opacity-80 group-hover:opacity-100">
                  <button
                    onClick={() => handleEdit(notice)}
                    title="Edit"
                    className="p-2 rounded hover:bg-blue-50 text-blue-600"
                  >
                    <FiEdit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(notice.id)}
                    title="Delete"
                    className="p-2 rounded hover:bg-red-50 text-red-600"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="mb-1 text-lg font-bold text-gray-900 truncate" title={notice.title}>{notice.title}</div>
              <div className="mb-2 text-gray-700 whitespace-pre-line text-sm" style={{ minHeight: 48 }}>{notice.content}</div>
              <div className="flex items-center gap-2 mt-auto pt-2">
                <span className="text-xs text-gray-500">Country:</span>
                <span className="text-xs font-medium text-gray-700">{notice.country_id ? (countries.find(c => c.id === notice.country_id)?.name || notice.country_id) : <span className="text-gray-400">All</span>}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 transition">
          <div className="bg-white rounded-xl p-8 w-full max-w-lg shadow-2xl relative animate-fadeIn">
            <h2 className="text-2xl font-bold mb-6 text-center">{editNotice ? 'Edit Notice' : 'Add Notice'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                  <textarea
                    required
                    value={form.content}
                    onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 min-h-[100px] focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <select
                    value={form.country_id || ''}
                    onChange={e => setForm(f => ({ ...f, country_id: e.target.value ? Number(e.target.value) : undefined }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Countries</option>
                    {countries.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-8">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : (editNotice ? 'Save' : 'Add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoticesPage; 