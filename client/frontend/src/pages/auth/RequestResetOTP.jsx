/*
  Three auth components for frontend:
  - RequestResetOTP  -> src/pages/auth/RequestResetOTP.jsx
  - ResetPassword     -> src/pages/auth/ResetPassword.jsx
  - VerifyEmail       -> src/pages/auth/VerifyEmail.jsx

  These use `api` from ../api/axiosClient and the coffee Tailwind theme.
  Copy each component into the file path shown above.
*/

/* ---------------- RequestResetOTP.jsx ---------------- */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axiosClient';

export default function RequestResetOTP() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email || !/\S+@\S+\.\S+/.test(email)) return setError('Please enter a valid email');
    setLoading(true);
    try {
      const res = await api.post('/api/auth/reset-pass-otp', { email });
      setSuccess(res?.data?.message || 'If that email exists we sent reset instructions.');
      // Optionally redirect the user to reset page; many flows expect email with token
      // navigate('/login');
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to request reset';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center">
      <div className="app-container mx-auto w-full max-w-md bg-white rounded-lg p-6 card-coffee">
        <h2 className="text-2xl font-semibold mb-3">Reset your password</h2>
        <p className="text-sm text-gray-600 mb-4">Enter your account email and we'll send a one-time code or link to reset your password.</p>

        {error && <div className="text-red-600 mb-3">{error}</div>}
        {success && <div className="text-green-600 mb-3">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="w-full px-3 py-2 rounded border" />
          </div>

          <div className="flex justify-between items-center">
            <button type="submit" disabled={loading} className="bg-coffee-mid text-white px-4 py-2 rounded">{loading ? 'Sending...' : 'Send reset code'}</button>
            <Link to="/login" className="text-sm text-gray-600">Back to login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}




