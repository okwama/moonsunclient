import React, { useEffect, useState } from 'react';

interface Document {
  id: number;
  title: string;
  category: string;
  file_url: string;
  description: string;
  uploaded_at: string;
}

const DocumentListPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  // Modal form state
  const [title, setTitle] = useState('');
  const [modalCategory, setModalCategory] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    setLoading(true);
    const res = await fetch('/api/documents');
    const data = await res.json();
    setDocuments(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const filtered = category ? documents.filter(d => d.category === category) : documents;
  const categories = Array.from(new Set(documents.map(d => d.category)));

  // Modal submit handler
  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    if (!title || !modalCategory || !file) {
      setError('Title, category, and file are required.');
      return;
    }
    setModalLoading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', modalCategory);
    formData.append('file', file);
    formData.append('description', description);
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to upload document');
      setSuccess('Document uploaded successfully!');
      setTitle('');
      setModalCategory('');
      setFile(null);
      setDescription('');
      setShowModal(false);
      fetchDocuments();
    } catch (err: any) {
      setError(err.message || 'Failed to upload document');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow mt-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Documents</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          onClick={() => setShowModal(true)}
        >
          + Add Document
        </button>
      </div>
      <div className="flex gap-4 mb-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            className="border rounded px-2 py-1"
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-1 text-left">Title</th>
                <th className="px-2 py-1 text-left">Category</th>
                <th className="px-2 py-1 text-left">Description</th>
                <th className="px-2 py-1 text-left">Uploaded At</th>
                <th className="px-2 py-1 text-left">File</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center text-gray-400 py-2">No documents found.</td></tr>
              )}
              {filtered.map(doc => (
                <tr key={doc.id} className="border-t">
                  <td className="px-2 py-1 font-medium">{doc.title}</td>
                  <td className="px-2 py-1">{doc.category}</td>
                  <td className="px-2 py-1">{doc.description || '-'}</td>
                  <td className="px-2 py-1">{new Date(doc.uploaded_at).toLocaleString()}</td>
                  <td className="px-2 py-1">
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Modal for adding document */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
              onClick={() => setShowModal(false)}
              disabled={modalLoading}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Add Document</h2>
            <form onSubmit={handleModalSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className="border rounded px-3 py-2 w-full"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category<span className="text-red-500">*</span></label>
                <select
                  className="border rounded px-3 py-2 w-full"
                  value={modalCategory}
                  onChange={e => setModalCategory(e.target.value)}
                  required
                >
                  <option value="">Select category</option>
                  <option value="Contract">Contract</option>
                  <option value="Agreement">Agreement</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File<span className="text-red-500">*</span></label>
                <input
                  type="file"
                  className="border rounded px-3 py-2 w-full"
                  onChange={e => setFile(e.target.files?.[0] || null)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="border rounded px-3 py-2 w-full"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex gap-2 items-center">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                  disabled={modalLoading}
                >
                  {modalLoading ? 'Uploading...' : 'Upload'}
                </button>
                <button
                  type="button"
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
                  onClick={() => setShowModal(false)}
                  disabled={modalLoading}
                >
                  Cancel
                </button>
              </div>
              {success && <div className="text-green-600 font-medium mt-2">{success}</div>}
              {error && <div className="text-red-600 font-medium mt-2">{error}</div>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentListPage; 