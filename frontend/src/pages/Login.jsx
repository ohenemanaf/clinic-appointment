import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconStethoscope } from '@tabler/icons-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to login');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex flex-col items-center mb-8">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl mb-4">
                        <IconStethoscope size={32} stroke={1.5} />
                    </div>
                    <h2 className="text-2xl font-semibold text-slate-800">Welcome Back</h2>
                    <p className="text-sm text-slate-500">Sign in to your clinic account</p>
                </div>

                {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl">{error}</div>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input 
                            type="email" 
                            required
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                        <input 
                            type="password" 
                            required
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="mt-2 w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm">
                        Sign In
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500">
                    Don't have an account? <Link to="/register" className="text-blue-600 font-semibold hover:underline">Register here</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
