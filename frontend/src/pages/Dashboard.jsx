import React, { useState, useEffect, useRef } from 'react';
import { IconCalendarEvent, IconClock, IconUser, IconStethoscope, IconLogout, IconSettings, IconBell } from '@tabler/icons-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const playNotificationSound = () => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const audioCtx = new AudioContext();
        
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        oscillator.frequency.exponentialRampToValueAtTime(1046.50, audioCtx.currentTime + 0.1); // C6
        
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (err) {
        console.error("Audio playback failed", err);
    }
};

const Dashboard = () => {
    const [slots, setSlots] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [records, setRecords] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [contactNumber, setContactNumber] = useState('');
    const [profile, setProfile] = useState(null);
    const { logout, user } = useAuth();
    
    const fetchSlots = async () => {
        try {
            const response = await api.get('/appointments/slots');
            setSlots(response.data);
        } catch (error) {
            console.error("Failed to fetch slots:", error);
        }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.post('/auth/profile', { userId: user.userId });
                setProfile(response.data);
            } catch (error) {
                console.error("Failed to fetch profile:", error);
            }
        };

        const fetchRecords = async () => {
            try {
                // In a real app we'd fetch the studentId from the user object properly
                // Since our JWT has userId, we need to fetch records using the student id, 
                // but for simplicity our backend is using studentId. Let's send the userId and let backend handle it, 
                // OR we can update the backend to query by userId instead of studentId.
                // Wait, recordController.js `getStudentRecords` queries by student_id. 
                // Let's modify the backend to lookup by user_id instead, or do it here.
                // Let's just fetch it, and I'll modify the backend route slightly.
                const response = await api.get(`/records/student/${user.userId}`);
                setRecords(response.data);
            } catch (error) {
                console.error("Failed to fetch records:", error);
            }
        };

        const fetchNotifications = async () => {
            try {
                const response = await api.get(`/notifications/${user.userId}`);
                setNotifications(response.data);
            } catch (error) {
                console.error("Failed to fetch notifications:", error);
            }
        };

        const fetchAppointments = async () => {
            try {
                const response = await api.post('/appointments/student-appointments', { userId: user.userId });
                setAppointments(response.data);
            } catch (error) {
                console.error("Failed to fetch appointments:", error);
            }
        };

        fetchProfile();
        fetchSlots();
        if (user?.role === 'student') {
            fetchRecords();
            fetchNotifications();
            fetchAppointments();
            
            // Poll for real-time updates every 10 seconds
            const intervalId = setInterval(() => {
                fetchNotifications();
                fetchAppointments();
            }, 10000);
            
            return () => clearInterval(intervalId);
        }
    }, [user?.role, user?.userId]);

    const handleBookSlot = async (slotId) => {
        const reason = window.prompt("Please enter the reason for your visit:");
        if (!reason) return; // User cancelled

        try {
            await api.post('/appointments/book', {
                studentId: user.userId, 
                slotId,
                reason
            });
            alert("Appointment booked successfully!");
            fetchSlots(); // refresh list
            
            // Also refresh appointments list
            const appResponse = await api.post('/appointments/student-appointments', { userId: user.userId });
            setAppointments(appResponse.data);
        } catch (error) {
            alert(error.response?.data?.message || "Failed to book appointment");
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/students/${user.userId}`, { contactNumber });
            alert("Profile updated successfully!");
            setShowSettings(false);
        } catch (error) {
            alert(error.response?.data?.message || "Failed to update profile");
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;
    const prevUnreadRef = useRef(0);

    useEffect(() => {
        // Play sound if unread count increases, ignoring initial load if it's 0 to prevent noise
        if (unreadCount > prevUnreadRef.current && prevUnreadRef.current !== 0) {
            playNotificationSound();
        }
        prevUnreadRef.current = unreadCount;
    }, [unreadCount]);

    const handleMarkAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n.notification_id === id ? {...n, is_read: true} : n));
        } catch (error) {
            console.error("Failed to mark as read");
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto flex flex-col gap-6 md:gap-8">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 border-b border-slate-200 gap-4 relative">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Student Dashboard</h1>
                    <p className="text-slate-500 mt-1">Book and manage your clinic visits.</p>
                </div>
                
                <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100 w-full sm:w-auto justify-center sm:justify-start">
                    <IconUser size={20} className="text-slate-400" />
                    <span className="text-sm font-semibold text-slate-700">
                        {user?.role === 'staff' ? 'Staff Portal' : 'Student Portal'}
                    </span>
                    
                    <div className="relative">
                        <button 
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors relative"
                            title="Notifications"
                        >
                            <IconBell size={20} className={unreadCount > 0 ? "bell-ring text-blue-500" : ""} />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
                            )}
                        </button>
                        
                        {/* Notifications Dropdown */}
                        {showNotifications && (
                            <div className="absolute top-full mt-2 right-0 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
                                <div className="p-4 border-b border-slate-100">
                                    <h3 className="font-semibold text-slate-800">Notifications</h3>
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="p-6 text-center text-slate-500 text-sm">No notifications</div>
                                    ) : (
                                        notifications.map(n => (
                                            <div 
                                                key={n.notification_id} 
                                                onClick={() => !n.is_read && handleMarkAsRead(n.notification_id)}
                                                className={`p-4 border-b border-slate-50 cursor-pointer transition-colors ${n.is_read ? 'opacity-60' : 'bg-blue-50/50 hover:bg-blue-50'}`}
                                            >
                                                <p className="text-sm text-slate-700">{n.message}</p>
                                                <p className="text-xs text-slate-400 mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={() => setShowSettings(true)}
                        className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                        title="My Profile"
                    >
                        <IconUser size={20} />
                    </button>
                    <button 
                        onClick={logout}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Log out"
                    >
                        <IconLogout size={20} />
                    </button>
                </div>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column - Booking Section */}
                <section className="lg:col-span-2 flex flex-col gap-6">
                    <div className="bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-slate-100">
                        <h2 className="text-lg md:text-xl font-semibold mb-6 flex items-center gap-2">
                            <IconCalendarEvent className="text-blue-500" />
                            Book an Appointment
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {!Array.isArray(slots) || slots.length === 0 ? (
                                <p className="text-slate-500">No available slots at the moment.</p>
                            ) : slots.map((slot) => (
                                <button 
                                    key={slot.slot_id} 
                                    onClick={() => handleBookSlot(slot.slot_id)}
                                    className="p-4 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all group bg-slate-50 hover:bg-white flex justify-between items-center text-left w-full"
                                >
                                    <div>
                                        <p className="font-semibold text-slate-800 mb-1">{new Date(slot.slot_date).toLocaleDateString()}</p>
                                        <div className="flex items-center gap-2 text-sm text-slate-500 group-hover:text-blue-600 transition-colors">
                                            <IconClock size={16} />
                                            <span>{slot.start_time} - {slot.end_time}</span>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col gap-1 items-end">
                                        <span className="text-xs font-semibold px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                                            {slot.staff_first_name} {slot.staff_last_name}
                                        </span>
                                        {slot.room_number && (
                                            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                                                📍 {slot.room_number}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-slate-100 mt-6">
                        <h2 className="text-lg md:text-xl font-semibold mb-6 flex items-center gap-2">
                            <IconClock className="text-blue-500" />
                            My Appointments
                        </h2>
                        
                        <div className="flex flex-col gap-4">
                            {!Array.isArray(appointments) || appointments.length === 0 ? (
                                <p className="text-slate-500">You have no upcoming appointments.</p>
                            ) : appointments.map((apt) => (
                                <div 
                                    key={apt.appointment_id} 
                                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex justify-between items-center text-left w-full"
                                >
                                    <div>
                                        <p className="font-semibold text-slate-800 mb-1">{new Date(apt.slot_date).toLocaleDateString()}</p>
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <IconClock size={16} />
                                            <span>{apt.start_time} - {apt.end_time}</span>
                                        </div>
                                        <p className="text-sm text-slate-600 mt-1">Reason: {apt.reason}</p>
                                    </div>
                                    <div className="text-right flex flex-col gap-2 items-end">
                                        <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg capitalize
                                            ${apt.status === 'completed' ? 'bg-blue-100 text-blue-700' : ''}
                                            ${apt.status === 'pending' ? 'bg-orange-100 text-orange-700' : ''}
                                            ${apt.status === 'confirmed' ? 'bg-green-100 text-green-700' : ''}
                                            ${apt.status === 'cancelled' ? 'bg-red-100 text-red-700' : ''}
                                        `}>
                                            {apt.status}
                                        </span>
                                        {apt.room_number && (
                                            <span className="text-xs font-medium text-slate-600 bg-slate-200 px-2 py-1 rounded-md">
                                                📍 {apt.room_number}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Right Column - Status/Info Section */}
                <aside className="w-full lg:w-80 flex flex-col gap-6">
                    <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden flex-1 min-h-[300px]">
                        <IconStethoscope size={120} className="absolute -bottom-6 -right-6 text-blue-500 opacity-20 rotate-12" />
                        <h2 className="text-xl font-semibold mb-4 relative z-10">Medical History</h2>
                        
                        <div className="relative z-10 flex flex-col gap-4 mt-6">
                            {!Array.isArray(records) || records.length === 0 ? (
                                <div className="text-blue-100 text-sm">
                                    <p className="mb-2">No medical records found.</p>
                                    <p>Your appointment history and doctor's notes will appear here.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                                    {records.map(record => (
                                        <div key={record.record_id} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                                            <p className="text-xs text-blue-200 font-medium mb-1">
                                                {new Date(record.slot_date).toLocaleDateString()} • Dr. {record.staff_last_name}
                                            </p>
                                            <h3 className="font-semibold text-lg mb-2">{record.diagnosis}</h3>
                                            
                                            {record.prescription && (
                                                <div className="mb-2">
                                                    <p className="text-xs text-blue-200 uppercase tracking-wider font-semibold mb-0.5">Prescription</p>
                                                    <p className="text-sm bg-white/10 rounded-lg px-2 py-1 inline-block">{record.prescription}</p>
                                                </div>
                                            )}
                                            
                                            {record.notes && (
                                                <div>
                                                    <p className="text-xs text-blue-200 uppercase tracking-wider font-semibold mb-0.5">Notes</p>
                                                    <p className="text-sm text-blue-50 leading-relaxed">{record.notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </aside>
                
            </main>

            {/* Profile Modal */}
            {showSettings && profile && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-sm shadow-xl">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                                <IconUser size={32} />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-slate-800">{profile.first_name} {profile.last_name}</h2>
                                <p className="text-sm text-slate-500 capitalize">{profile.role}</p>
                            </div>
                        </div>
                        
                        <div className="flex flex-col gap-4 text-sm mb-6">
                            <div className="flex flex-col">
                                <span className="text-slate-400 text-xs font-semibold uppercase">Email</span>
                                <span className="text-slate-800 font-medium">{profile.email}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-slate-400 text-xs font-semibold uppercase">Student Number</span>
                                <span className="text-slate-800 font-medium">{profile.student_number}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-slate-400 text-xs font-semibold uppercase">Date of Birth</span>
                                <span className="text-slate-800 font-medium">{new Date(profile.dob).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div className="flex justify-end border-t border-slate-100 pt-4">
                            <button type="button" onClick={() => setShowSettings(false)} className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl font-medium transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
