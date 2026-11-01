import React, { useState, useEffect } from 'react';
import { HelpCircle, ExternalLink, X, KeyRound } from 'lucide-react';

const GoogleSignInButton = ({ onSuccess, onError, text = 'Continue with Google', disabled = false }) => {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [customToken, setCustomToken] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const isConfigured = Boolean(
    clientId && 
    clientId.trim() !== '' && 
    clientId !== 'YOUR_GOOGLE_CLIENT_ID' &&
    !clientId.includes('example.com')
  );

  useEffect(() => {
    if (!isConfigured) return;

    const initGsi = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (response) => {
              if (response.credential) {
                onSuccess(response.credential);
              } else {
                onError?.('Google authentication did not return a valid credential.');
              }
            },
          });
        } catch (e) {
          console.warn('Google Identity Services initialization notice:', e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGsi();
    } else {
      const timer = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(timer);
          initGsi();
        }
      }, 500);
      return () => clearInterval(timer);
    }
  }, [clientId, isConfigured, onSuccess, onError]);

  const handleClick = () => {
    if (!isConfigured) {
      setShowConfigModal(true);
      return;
    }

    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Prompt fallback or dismissed
          }
        });
      } catch (err) {
        console.warn('Google prompt failed, opening config info:', err);
        setShowConfigModal(true);
      }
    } else {
      setShowConfigModal(true);
    }
  };

  const handleManualTokenSubmit = async (e) => {
    e.preventDefault();
    if (!customToken.trim()) return;
    setIsVerifying(true);
    try {
      await onSuccess(customToken.trim());
      setShowConfigModal(false);
    } catch (err) {
      onError?.(err.message || 'Token verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className="w-full flex justify-center items-center gap-3 py-2.5 px-4 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 transition-all cursor-pointer"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>{text}</span>
      </button>

      {/* Google Setup Guide / Token Dialog */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 text-left relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowConfigModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Google OAuth 2.0 Setup</h3>
                <p className="text-xs text-slate-500">Google Client ID is not yet configured</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-4">
              To enable seamless one-click Google Sign-In with real Google accounts, configure your Google Cloud OAuth credentials:
            </p>

            <ol className="text-xs text-slate-700 space-y-2 mb-5 list-decimal pl-4 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <li>Open Google Cloud Console &rarr; <strong>APIs &amp; Services</strong> &rarr; <strong>Credentials</strong></li>
              <li>Create an <strong>OAuth 2.0 Client ID</strong> (Application type: <em>Web application</em>)</li>
              <li>Add <code>http://localhost:5173</code> to <strong>Authorized JavaScript origins</strong></li>
              <li>Add <code>http://localhost:5173</code> to <strong>Authorized redirect URIs</strong></li>
              <li>Set <code>VITE_GOOGLE_CLIENT_ID</code> in <code>frontend/.env</code></li>
              <li>Set <code>GOOGLE_CLIENT_ID</code> in <code>backend/.env</code> or <code>application.yml</code></li>
            </ol>

            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-700">
                <KeyRound className="w-4 h-4 text-brand-600" />
                <span>Test with a Google ID Token (Optional):</span>
              </div>
              <form onSubmit={handleManualTokenSubmit} className="space-y-3">
                <textarea
                  rows={2}
                  value={customToken}
                  onChange={(e) => setCustomToken(e.target.value)}
                  placeholder="Paste Google JWT id_token here for backend verification testing..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowConfigModal(false)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Close
                  </button>
                  {customToken.trim() && (
                    <button
                      type="submit"
                      disabled={isVerifying}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg disabled:opacity-50"
                    >
                      {isVerifying ? 'Verifying...' : 'Verify Token & Sign In'}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GoogleSignInButton;

