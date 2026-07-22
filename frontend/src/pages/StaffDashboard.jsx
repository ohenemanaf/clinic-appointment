import React, { useState, useEffect } from 'react';
import { IconCalendarEvent, IconClock, IconUser, IconStethoscope, IconLogout, IconCheck } from '@tabler/icons-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const StaffDashboard = () => {
    const [appointments, setAppointments] = useState([]);
    const [openSlots, setOpenSlots] = useState([]);
    const [selectedApt, setSelectedApt] = useState(null);
    const [showAddStaff, setShowAddStaff] = useState(false); // Used in Admin, removed from here
    
    // Bulk Availability State
    const [showAddSlot, setShowAddSlot] = useState(false);
    const [bulkData, setBulkData] = useState({
        slotDate: '', shiftStart: '09:00', shiftEnd: '17:00', durationMinutes: '30'
    });
    const [generatedSlots, setGeneratedSlots] = useState([]);

    // Completion Form State
    const [diagnosis, setDiagnosis] = useState('');
    const [prescription, setPrescription] = useState('');
    const [notes, setNotes] = useState('');

    const [profile, setProfile] = useState(null);
    const [showProfile, setShowProfile] = useState(false);

    const { logout, user } = useAuth();
    
    const fetchData = async () => {
        try {
            const [aptRes, slotsRes] = await Promise.all([
                api.post('/appointments/staff-appointments', { userId: user.userId }),
                api.post('/appointments/slots/staff-open', { userId: user.userId })
            ]);
            setAppointments(aptRes.data);
            setOpenSlots(slotsRes.data);
        } catch (error) {
            console.error("Failed to fetch data:", error);
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
        fetchProfile();
        fetchData();
    }, [user.userId]);

    const handleComplete = async (e) => {
        e.preventDefault();
        try {
            await api.post('/records/add', {
                studentId: selectedApt.student_id, // we need student_id from appointment query
                staffId: selectedApt.staff_id,     // and staff_id
                appointmentId: selectedApt.appointment_id,
                diagnosis,
                prescription,
                notes
            });
            alert("Appointment completed and medical record saved!");
            setSelectedApt(null);
            setDiagnosis('');
            setPrescription('');
            setNotes('');
            
            // Refetch
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to save record");
        }
    };

    const handleGenerateSlots = () => {
        if (!bulkData.slotDate || !bulkData.shiftStart || !bulkData.shiftEnd || !bulkData.durationMinutes) {
            alert("Please fill all fields to generate slots.");
            return;
        }

        const start = new Date(`${bulkData.slotDate}T${bulkData.shiftStart}`);
        const end = new Date(`${bulkData.slotDate}T${bulkData.shiftEnd}`);
        const durationMs = parseInt(bulkData.durationMinutes) * 60000;
        
        const slots = [];
        let current = new Date(start);
        
        while (current.getTime() + durationMs <= end.getTime()) {
            const slotStart = current.toTimeString().substring(0, 5) + ':00';
            current = new Date(current.getTime() + durationMs);
            const slotEnd = current.toTimeString().substring(0, 5) + ':00';
            
            slots.push({
                id: Math.random().toString(36).substring(2, 9),
                slotDate: bulkData.slotDate,
                startTime: slotStart,
                endTime: slotEnd,
                selected: true
            });
        }
        
        if (slots.length === 0) {
            alert("Shift duration is too short for the selected slot duration.");
        }
        setGeneratedSlots(slots);
    };

    const handleSaveBulkSlots = async () => {
        const slotsToSave = generatedSlots.filter(s => s.selected).map(s => ({
            slotDate: s.slotDate,
            startTime: s.startTime,
            endTime: s.endTime
        }));

        if (slotsToSave.length === 0) {
            alert("No slots selected to save.");
            return;
        }

        try {
            await api.post('/appointments/slots/bulk-add', {
                userId: user.userId,
                slots: slotsToSave
            });
            alert(`${slotsToSave.length} time slots successfully added!`);
            setShowAddSlot(false);
            setBulkData({ slotDate: '', shiftStart: '09:00', shiftEnd: '17:00', durationMinutes: '30' });
            setGeneratedSlots([]);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to add time slots");
        }
    };

    const handleDeleteSlot = async (slotId) => {
        if (!window.confirm("Are you sure you want to delete this availability slot?")) return;
        
        try {
            await api.delete(`/appointments/slots/${slotId}`);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to delete time slot");
        }
    };

    const handleApprove = async (aptId) => {
        try {
            await api.put(`/appointments/${aptId}/approve`);
            alert("Appointment approved and student notified.");
            // Refetch
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to approve appointment");
        }
    };

    const handleCancel = async (aptId) => {
        if (!window.confirm("Are you sure you want to cancel this appointment and mark yourself as busy?")) return;
        
        try {
            await api.put(`/appointments/${aptId}/cancel-by-staff`);
            alert("Appointment cancelled and student notified.");
            // Refetch
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to cancel appointment");
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto flex flex-col gap-6 md:gap-8">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 border-b border-slate-200 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 md:p-3 bg-blue-100 text-blue-600 rounded-2xl">
                        <IconStethoscope size={24} className="md:w-[28px] md:h-[28px]" stroke={1.5} />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-800">Clinic Staff</h1>
                        <p className="text-xs md:text-sm text-slate-500 font-medium">Provider Portal</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100 w-full sm:w-auto justify-center sm:justify-start">
                    <span className="text-sm font-semibold text-slate-700 hidden sm:inline">Staff Portal</span>
                    <button 
                        onClick={() => setShowProfile(true)}
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

            <div className="flex justify-end">
                <button 
                    onClick={() => setShowAddSlot(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-xl shadow-sm transition-colors"
                >
                    + Manage Availability
                </button>
            </div>

            <main className="grid grid-cols-1 gap-8">
                <section className="bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-slate-100">
                    <h2 className="text-lg md:text-xl font-semibold mb-6 flex items-center gap-2">
                        <IconCalendarEvent className="text-blue-500" />
                        My Upcoming Appointments
                    </h2>
                    
                    {!Array.isArray(appointments) || appointments.length === 0 ? (
                        <p className="text-slate-500">No appointments scheduled.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 text-slate-500 text-sm">
                                        <th className="pb-3 font-semibold">Date & Time</th>
                                        <th className="pb-3 font-semibold">Student Name</th>
                                        <th className="pb-3 font-semibold">Reason</th>
                                        <th className="pb-3 font-semibold">Status</th>
                                        <th className="pb-3 font-semibold">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointments.map((apt) => (
                                        <tr key={apt.appointment_id} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="py-4">
                                                <div className="font-semibold text-slate-800">{new Date(apt.slot_date).toLocaleDateString()}</div>
                                                <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                                    <IconClock size={12} /> {apt.start_time} - {apt.end_time}
                                                </div>
                                            </td>
                                            <td className="py-4">
                                                <div className="font-medium text-slate-800">{apt.student_first_name} {apt.student_last_name}</div>
                                                <div className="text-xs text-slate-500">ID: {apt.student_number}</div>
                                            </td>
                                            <td className="py-4 text-sm text-slate-600">{apt.reason}</td>
                                            <td className="py-4">
                                                <span className={`text-xs px-2 py-1 rounded-md font-semibold ${
                                                    apt.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                    apt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-blue-100 text-blue-700'
                                                }`}>
                                                    {apt.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="py-4">
                                                <div className="flex items-center gap-2">
                                                    {apt.status === 'pending' && (
                                                        <>
                                                            <button 
                                                                onClick={() => handleApprove(apt.appointment_id)}
                                                                className="flex items-center gap-1 text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                                                            >
                                                                <IconCheck size={16} /> Approve
                                                            </button>
                                                            <button 
                                                                onClick={() => handleCancel(apt.appointment_id)}
                                                                className="flex items-center gap-1 text-sm bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
                                                                title="Reject appointment"
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}
                                                    {apt.status === 'confirmed' && (
                                                        <button 
                                                            onClick={() => setSelectedApt(apt)}
                                                            className="flex items-center gap-1 text-sm bg-green-50 text-green-600 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors"
                                                        >
                                                            <IconStethoscope size={16} /> Complete
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                <section className="bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-slate-100">
                    <h2 className="text-lg md:text-xl font-semibold mb-6 flex items-center gap-2">
                        <IconClock className="text-blue-500" />
                        My Open Availability
                    </h2>
                    
                    {!Array.isArray(openSlots) || openSlots.length === 0 ? (
                        <p className="text-slate-500">No open availability slots.</p>
                    ) : (
                        <div className="flex flex-wrap gap-3">
                            {openSlots.map((slot) => (
                                <div key={slot.slot_id} className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 gap-3 hover:border-slate-300 transition-colors">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-slate-800">{new Date(slot.slot_date).toLocaleDateString()}</span>
                                        <span className="text-xs text-slate-500">{slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}</span>
                                    </div>
                                    <div className="h-8 w-px bg-slate-200 mx-1"></div>
                                    <button 
                                        onClick={() => handleDeleteSlot(slot.slot_id)}
                                        className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                        title="Delete Availability"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>

            {/* Completion Modal */}
            {selectedApt && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-xl">
                        <h2 className="text-xl font-semibold mb-2">Complete Appointment</h2>
                        <p className="text-sm text-slate-500 mb-6">Enter medical notes for {selectedApt.student_first_name} {selectedApt.student_last_name}</p>
                        
                        <form onSubmit={handleComplete} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Diagnosis *</label>
                                <input 
                                    required 
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none" 
                                    value={diagnosis} onChange={e => setDiagnosis(e.target.value)} 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Prescription</label>
                                <input 
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none" 
                                    value={prescription} onChange={e => setPrescription(e.target.value)} 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Additional Notes</label>
                                <textarea 
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none h-24 resize-none" 
                                    value={notes} onChange={e => setNotes(e.target.value)} 
                                ></textarea>
                            </div>
                            <div className="flex justify-end gap-3 mt-4">
                                <button type="button" onClick={() => setSelectedApt(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
                                    Save Record
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Bulk Availability Modal */}
            {showAddSlot && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-semibold mb-6 text-slate-800">Generate Availability</h2>
                        
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
                                <input required type="date" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-blue-500"
                                    value={bulkData.slotDate} onChange={e => setBulkData({...bulkData, slotDate: e.target.value})} />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Shift Start *</label>
                                    <input required type="time" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-blue-500"
                                        value={bulkData.shiftStart} onChange={e => setBulkData({...bulkData, shiftStart: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Shift End *</label>
                                    <input required type="time" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-blue-500"
                                        value={bulkData.shiftEnd} onChange={e => setBulkData({...bulkData, shiftEnd: e.target.value})} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Slot Duration (Minutes) *</label>
                                <select 
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-blue-500"
                                    value={bulkData.durationMinutes} onChange={e => setBulkData({...bulkData, durationMinutes: e.target.value})}
                                >
                                    <option value="15">15 Minutes</option>
                                    <option value="20">20 Minutes</option>
                                    <option value="30">30 Minutes</option>
                                    <option value="60">60 Minutes</option>
                                </select>
                            </div>

                            <button 
                                type="button"
                                onClick={handleGenerateSlots}
                                className="w-full py-2 bg-slate-100 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors border border-blue-100"
                            >
                                Preview Slots
                            </button>

                            {generatedSlots.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-sm font-semibold text-slate-700 mb-2">Generated Slots ({generatedSlots.filter(s => s.selected).length})</p>
                                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-slate-50 border border-slate-100 rounded-xl">
                                        {generatedSlots.map(slot => (
                                            <button 
                                                key={slot.id}
                                                onClick={() => setGeneratedSlots(generatedSlots.map(s => s.id === slot.id ? { ...s, selected: !s.selected } : s))}
                                                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${slot.selected ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-white border-slate-200 text-slate-400 line-through'}`}
                                            >
                                                {slot.startTime}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2">Click a slot to toggle it (e.g. to schedule a lunch break).</p>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => { setShowAddSlot(false); setGeneratedSlots([]); }} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-colors">
                                    Cancel
                                </button>
                                <button 
                                    type="button" 
                                    onClick={handleSaveBulkSlots} 
                                    disabled={generatedSlots.filter(s => s.selected).length === 0}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Save Availability
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Profile Modal */}
            {showProfile && profile && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-sm shadow-xl">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                                <IconUser size={32} />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-slate-800">Dr. {profile.last_name}</h2>
                                <p className="text-sm text-slate-500 capitalize">{profile.role}</p>
                            </div>
                        </div>
                        
                        <div className="flex flex-col gap-4 text-sm mb-6">
                            <div className="flex flex-col">
                                <span className="text-slate-400 text-xs font-semibold uppercase">Email</span>
                                <span className="text-slate-800 font-medium">{profile.email}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-slate-400 text-xs font-semibold uppercase">Specialization</span>
                                <span className="text-slate-800 font-medium">{profile.specialization}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-slate-400 text-xs font-semibold uppercase">Room Number</span>
                                <span className="text-slate-800 font-medium">{profile.room_number}</span>
                            </div>
                        </div>

                        <div className="flex justify-end border-t border-slate-100 pt-4">
                            <button type="button" onClick={() => setShowProfile(false)} className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl font-medium transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffDashboard;
