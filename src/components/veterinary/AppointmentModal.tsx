import React, { useState } from 'react';
import { X, Calendar, User, AlignLeft, Info, CheckCircle2 } from 'lucide-react';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppointmentModal({ isOpen, onClose }: AppointmentModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    animal: '',
    date: '',
    time: '',
    symptoms: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Close after 2 seconds
      setTimeout(() => {
        setIsSuccess(false);
        setFormData({
          name: '',
          animal: '',
          date: '',
          time: '',
          symptoms: ''
        });
        onClose();
      }, 2000);
    }, 1500);
  };

// Generate time slots from 8:00 AM to 11:30 PM
  const timeOptions = [];
  for (let hour = 8; hour < 24; hour++) {
    for (const min of ['00', '30']) {
      const isPM = hour >= 12;
      const displayHour = hour > 12 ? hour - 12 : hour;
      const formattedHour = displayHour.toString().padStart(2, '0');
      const period = isPM ? 'PM' : 'AM';
      timeOptions.push(`${formattedHour}:${min} ${period}`);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 relative">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h3 className="text-lg font-black text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-rose-500" /> Book Vet Appointment
            </h3>
            <p className="text-xs text-gray-500 mt-1 font-medium">Schedule a consultation with a certified vet.</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-xl font-black text-gray-900 mb-2">Appointment Booked!</h4>
              <p className="text-sm text-gray-500 font-medium max-w-[250px]">
                Your vet consultation is confirmed. The vet will contact you soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 flex items-center">
                    <User className="w-3.5 h-3.5 mr-1" /> Your Name
                  </label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Rajesh Kumar"
                    className="w-full bg-gray-50 border border-gray-200 text-sm text-gray-900 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder-gray-400 font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 flex items-center">
                    <Info className="w-3.5 h-3.5 mr-1" /> Animal Type & Tag
                  </label>
                  <input 
                    type="text" 
                    required
                    value={formData.animal}
                    onChange={(e) => setFormData({...formData, animal: e.target.value})}
                    placeholder="e.g. Gir Cow #IN-904"
                    className="w-full bg-gray-50 border border-gray-200 text-sm text-gray-900 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder-gray-400 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Date</label>
                  <input 
                    type="date" 
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 text-sm text-gray-900 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Time</label>
                  <select
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 text-sm text-gray-900 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-medium cursor-pointer"
                  >
                    <option value="" disabled>Select a time</option>
                    {timeOptions.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center">
                  <AlignLeft className="w-3.5 h-3.5 mr-1" /> Symptoms
                </label>
                <textarea 
                  required
                  rows={3}
                  value={formData.symptoms}
                  onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
                  placeholder="Describe the animal's symptoms or issue..."
                  className="w-full bg-gray-50 border border-gray-200 text-sm text-gray-900 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all resize-none placeholder-gray-400 font-medium"
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center text-sm"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
                      Booking...
                    </span>
                  ) : "Confirm Appointment"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
