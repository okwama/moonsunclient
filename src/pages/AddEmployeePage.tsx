import React, { useState } from 'react';

const AddEmployeePage: React.FC = () => {
  const [form, setForm] = useState({
    name: '',
    staffNumber: '',
    phoneNumber: '',
    department: '',
    businessEmail: '',
    departmentEmail: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.name) newErrors.name = 'Name is required';
    if (!form.staffNumber) newErrors.staffNumber = 'Staff number is required';
    if (!form.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
    if (!form.department) newErrors.department = 'Department is required';
    if (!form.businessEmail) newErrors.businessEmail = 'Business email is required';
    if (!form.departmentEmail) newErrors.departmentEmail = 'Department email is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setError('');
    if (validate()) {
      try {
        const response = await fetch('/api/staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            photo_url: 'https://randomuser.me/api/portraits/lego/1.jpg', // default
            empl_no: form.staffNumber,
            id_no: form.staffNumber, // using staff number as id_no for now
            role: form.department, // using department as role for now
            phone_number: form.phoneNumber,
            department: form.department,
            business_email: form.businessEmail,
            department_email: form.departmentEmail
          })
        });
        if (!response.ok) throw new Error('Failed to add employee');
        setSuccess(true);
        setForm({
          name: '',
          staffNumber: '',
          phoneNumber: '',
          department: '',
          businessEmail: '',
          departmentEmail: '',
        });
      } catch (err) {
        setError('Failed to add employee.');
      }
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white shadow rounded-lg p-8">
      <h1 className="text-2xl font-bold mb-6">Add New Employee</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring"
          />
          {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Staff Number</label>
          <input
            type="text"
            name="staffNumber"
            value={form.staffNumber}
            onChange={handleChange}
            className="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring"
          />
          {errors.staffNumber && <p className="text-red-600 text-xs mt-1">{errors.staffNumber}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone Number</label>
          <input
            type="text"
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handleChange}
            className="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring"
          />
          {errors.phoneNumber && <p className="text-red-600 text-xs mt-1">{errors.phoneNumber}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Department</label>
          <input
            type="text"
            name="department"
            value={form.department}
            onChange={handleChange}
            className="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring"
          />
          {errors.department && <p className="text-red-600 text-xs mt-1">{errors.department}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Business Email</label>
          <input
            type="email"
            name="businessEmail"
            value={form.businessEmail}
            onChange={handleChange}
            className="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring"
          />
          {errors.businessEmail && <p className="text-red-600 text-xs mt-1">{errors.businessEmail}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Department Email</label>
          <input
            type="email"
            name="departmentEmail"
            value={form.departmentEmail}
            onChange={handleChange}
            className="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring"
          />
          {errors.departmentEmail && <p className="text-red-600 text-xs mt-1">{errors.departmentEmail}</p>}
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Add Employee
        </button>
        {success && <p className="text-green-600 text-center mt-2">Employee added successfully (not yet saved to backend).</p>}
        {error && <p className="text-red-600 text-center mt-2">{error}</p>}
      </form>
    </div>
  );
};

export default AddEmployeePage; 