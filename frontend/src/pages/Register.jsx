import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconStethoscope } from '@tabler/icons-react';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'student',
        firstName: '',
        lastName: '',
        dob: '',
        studentNumber: ''
    });
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await register(formData);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to register');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex flex-col items-center mb-8">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl mb-4">
                        <IconStethoscope size={32} stroke={1.5} />
                    </div>
                    <h2 className="text-2xl font-semibold text-slate-800">Create Account</h2>
                    <p className="text-sm text-slate-500">Register as a student patient</p>
                </div>

                {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl">{error}</div>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                            <input name="firstName" required onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                            <input name="lastName" required onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Student Number</label>
                        <input name="studentNumber" required onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                        <input type="date" name="dob" required onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input type="email" name="email" required onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                        <input type="password" name="password" required onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" />
                    </div>

                    <button type="submit" className="mt-2 w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm">
                        Register
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500">
                    Already have an account? <Link to="/login" className="text-blue-600 font-semibold hover:underline">Log in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
