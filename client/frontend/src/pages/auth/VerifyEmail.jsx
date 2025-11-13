/* ---------------- VerifyEmail.jsx ---------------- */
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axiosClient';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || searchParams.get('t') || '';
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!token) return setLoading(false);
      setLoading(true);
      try {
        const res = await api.post('/api/auth/verify-email', { token });
        if (!mounted) return;
        setSuccess(res?.data?.message || 'Email verified successfully.');
        setTimeout(() => navigate('/login'), 1200);
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setError(err?.response?.data?.message || 'Verification failed or token expired');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [token, navigate]);

  async function resend(email) {
    try {
      await api.post('/api/auth/resend-verify', { email });
      setSuccess('Verification link sent. Check your email.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to resend verification');
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center">
      <div className="app-container mx-auto w-full max-w-md bg-white rounded-lg p-6 card-coffee text-center">
        <h2 className="text-2xl font-semibold mb-3">Email verification</h2>
        {loading ? (
          <div className="text-sm text-gray-600">Verifying...</div>
        ) : (
          <>
            {success && <div className="text-green-600 mb-3">{success}</div>}
            {error && <div className="text-red-600 mb-3">{error}</div>}

            {!success && !error && (
              <div className="text-sm text-gray-600 mb-4">No verification token found in the URL. If you recently registered, check your email for the verification link.</div>
            )}

            <div className="flex gap-3 justify-center">
              <Link to="/login" className="px-4 py-2 rounded border">Back to login</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}