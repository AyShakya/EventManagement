/* ---------------- ResetPassword.jsx ---------------- */
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../../api/axiosClient';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const tokenFromQuery = searchParams.get('otp') || searchParams.get('token') || '';
  const [otp, setOtp] = useState(tokenFromQuery);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (tokenFromQuery) setOtp(tokenFromQuery);
  }, [tokenFromQuery]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!password || password.length < 6) return setError('Password must be at least 6 characters');
    if (password !== confirm) return setError('Passwords do not match');

    if (!email) return setError('Email is required');
    if (!otp) return setError('OTP/code is required');
    // some backends require email + token + password; others accept token + password
    
    setLoading(true);
    try {
      const payload = { email, otp, newPassword: password };
      const res = await api.post('/api/auth/reset-password', payload);
      setSuccess(res?.data?.message || 'Password reset successful. You can log in now.');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to reset password';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center">
      <div className="app-container mx-auto w-full max-w-md bg-white rounded-lg p-6 card-coffee">
        <h2 className="text-2xl font-semibold mb-3">Set a new password</h2>
        <p className="text-sm text-gray-600 mb-4">Enter a new password. If you have a reset code/token, paste it below. Otherwise enter your email and request a reset first.</p>

        {error && <div className="text-red-600 mb-3">{error}</div>}
        {success && <div className="text-green-600 mb-3">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-3">
          {!token && (
            <div>
              <label className="block text-sm mb-1">Email (for reset link/code)</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full px-3 py-2 rounded border" />
            </div>
          )}

          <div>
            <label className="block text-sm mb-1">Reset OTP / code (if you have it)</label>
            <input value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full px-3 py-2 rounded border" />
          </div>

          <div>
            <label className="block text-sm mb-1">New password</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required className="w-full px-3 py-2 rounded border" />
          </div>

          <div>
            <label className="block text-sm mb-1">Confirm password</label>
            <input value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" required className="w-full px-3 py-2 rounded border" />
          </div>

          <div className="flex justify-between items-center">
            <button type="submit" disabled={loading} className="bg-coffee-mid text-white px-4 py-2 rounded">{loading ? 'Saving...' : 'Set new password'}</button>
            <Link to="/login" className="text-sm text-gray-600">Back to login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}