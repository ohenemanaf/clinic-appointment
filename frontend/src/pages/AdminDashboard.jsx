import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { 
    IconUsers, 
    IconStethoscope, 
    IconCalendarEvent, 
    IconActivity,
    IconLogout
} from '@tabler/icons-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const AdminDashboard = () => {
    const { logout, user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddStaff, setShowAddStaff] = useState(false);
    
    // Add Staff Form State
    const [newStaff, setNewStaff] = useState({
        firstName: '', lastName: '', email: '', password: '', specialization: '', roomNumber: ''
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/admin/stats');
                setStats(response.data);
            } catch (error) {
                console.error("Failed to fetch admin stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const handleAddStaff = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/staff', newStaff);
            alert("Staff member successfully added!");
            setShowAddStaff(false);
            setNewStaff({ firstName: '', lastName: '', email: '', password: '', specialization: '', roomNumber: '' });
            
            // Refetch stats
            const response = await api.get('/admin/stats');
            setStats(response.data);
        } catch (error) {
            alert(error.response?.data?.message || "Failed to add staff member");
        }
    };

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Loading Dashboard...</div>;

    const chartData = [
        { name: 'Completed', value: stats?.appointments?.completed || 0 },
        { name: 'Pending', value: stats?.appointments?.pending || 0 },
        { name: 'Confirmed', value: stats?.appointments?.confirmed || 0 },
        { name: 'Cancelled', value: stats?.appointments?.cancelled || 0 },
    ].filter(item => item.value > 0);

    return (
        <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto flex flex-col gap-8">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 border-b border-slate-200 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Overview</h1>
                    <p className="text-slate-500 mt-1">System Health and Analytics</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 px-4 py-2 bg-slate-100 rounded-full border border-slate-200">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                            A
                        </div>
                        <span className="text-sm font-semibold text-slate-700">Administrator</span>
                    </div>
                    <button 
                        onClick={logout}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Log out"
                    >
                        <IconLogout />
                    </button>
                </div>
            </header>

            <div className="flex justify-end">
                <button 
                    onClick={() => setShowAddStaff(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-xl shadow-sm transition-colors"
                >
                    + Add New Staff
                </button>
            </div>

            <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Metrics Row */}
                <section className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <IconUsers size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Total Students</p>
                            <p className="text-2xl font-bold text-slate-800">{stats?.students || 0}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                            <IconStethoscope size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Active Staff</p>
                            <p className="text-2xl font-bold text-slate-800">{stats?.staff || 0}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                            <IconCalendarEvent size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Total Appointments</p>
                            <p className="text-2xl font-bold text-slate-800">{stats?.appointments?.total || 0}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                            <IconActivity size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">System Status</p>
                            <p className="text-xl font-bold text-slate-800">Healthy</p>
                        </div>
                    </div>
                </section>

                {/* Chart Section */}
                <section className="lg:col-span-1 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col">
                    <h2 className="text-lg font-semibold text-slate-800 mb-6">Appointments by Status</h2>
                    <div className="flex-1 min-h-[300px]">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400">
                                No data available
                            </div>
                        )}
                    </div>
                </section>

                {/* Recent Activity Table */}
                <section className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-800 mb-6">Recent Activity</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="py-4 px-4 text-sm font-semibold text-slate-500 border-b border-slate-100">Date</th>
                                    <th className="py-4 px-4 text-sm font-semibold text-slate-500 border-b border-slate-100">Student</th>
                                    <th className="py-4 px-4 text-sm font-semibold text-slate-500 border-b border-slate-100">Doctor</th>
                                    <th className="py-4 px-4 text-sm font-semibold text-slate-500 border-b border-slate-100 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {!stats?.recentAppointments || stats.recentAppointments.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="py-8 text-center text-slate-400">No recent activity</td>
                                    </tr>
                                ) : stats.recentAppointments.map(apt => (
                                    <tr key={apt.appointment_id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-4 px-4 text-slate-600 font-medium">
                                            {new Date(apt.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="py-4 px-4 text-slate-800">
                                            {apt.student_first} {apt.student_last}
                                        </td>
                                        <td className="py-4 px-4 text-slate-600">
                                            Dr. {apt.staff_last}
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg capitalize
                                                ${apt.status === 'completed' ? 'bg-blue-50 text-blue-600' : ''}
                                                ${apt.status === 'pending' ? 'bg-orange-50 text-orange-600' : ''}
                                                ${apt.status === 'cancelled' ? 'bg-red-50 text-red-600' : ''}
                                            `}>
                                                {apt.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>

            {/* Add Staff Modal */}
            {showAddStaff && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-xl shadow-xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-semibold mb-6">Add New Staff Member</h2>
                        
                        <form onSubmit={handleAddStaff} className="flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">First Name *</label>
                                    <input required className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-blue-500"
                                        value={newStaff.firstName} onChange={e => setNewStaff({...newStaff, firstName: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Last Name *</label>
                                    <input required className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-blue-500"
                                        value={newStaff.lastName} onChange={e => setNewStaff({...newStaff, lastName: e.target.value})} />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address * (for login)</label>
                                <input required type="email" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-blue-500"
                                    value={newStaff.email} onChange={e => setNewStaff({...newStaff, email: e.target.value})} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Temporary Password *</label>
                                <input required type="password" minLength={6} className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-blue-500"
                                    value={newStaff.password} onChange={e => setNewStaff({...newStaff, password: e.target.value})} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Specialization</label>
                                    <input placeholder="e.g., General Physician" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-blue-500"
                                        value={newStaff.specialization} onChange={e => setNewStaff({...newStaff, specialization: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Room Number</label>
                                    <input placeholder="e.g., 102A" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-blue-500"
                                        value={newStaff.roomNumber} onChange={e => setNewStaff({...newStaff, roomNumber: e.target.value})} />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setShowAddStaff(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
                                    Create Account
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
