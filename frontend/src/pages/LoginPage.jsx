import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, LogIn, Loader2, AlertCircle } from 'lucide-react';

function LoginPage() {
    const [username, setUsername] = useState('admin');
    const [password, setPassword] = useState('admin123');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await login(username, password);

        setIsLoading(false);
        if (result.success) {
            navigate('/dashboard', { replace: true });
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="login-wrapper">
            {/* Background orbs */}
            <div className="login-bg-orb orb-1" />
            <div className="login-bg-orb orb-2" />
            <div className="login-bg-orb orb-3" />

            <div className="login-card">
                {/* Header */}
                <div className="login-header">
                    <div className="login-icon-box">
                        <ShieldAlert size={30} className="login-icon" />
                    </div>
                    <h1>Secure Access</h1>
                    <p>Sign in to access the real-time vehicle monitoring &amp; auto‑SOS dashboard.</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="login-form" noValidate>
                    {error && (
                        <div className="login-error-alert" role="alert">
                            <AlertCircle size={16} style={{ flexShrink: 0 }} />
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="login-username">Operator ID</label>
                        <input
                            id="login-username"
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="Enter operator ID"
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="login-password">Clearance Code</label>
                        <input
                            id="login-password"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Enter password"
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    <button
                        id="login-submit"
                        type="submit"
                        className="login-btn"
                        disabled={isLoading}
                    >
                        {isLoading
                            ? <><Loader2 size={18} className="spinner" /> Authenticating…</>
                            : <><LogIn size={18} /> Connect to Backend</>
                        }
                    </button>

                    <div className="demo-hint">
                        <strong>Demo Access:</strong> admin / admin123
                    </div>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;
