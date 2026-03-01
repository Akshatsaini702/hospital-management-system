import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiClock, FiCheck, FiChevronLeft, FiChevronRight, FiAward, FiMapPin } from 'react-icons/fi';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function DoctorBooking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState(1);

  const dates = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push(d);
  }

  const [datePageStart, setDatePageStart] = useState(0);
  const visibleDates = dates.slice(datePageStart, datePageStart + 7);

  useEffect(() => { fetchDoctor(); }, [id]);

  useEffect(() => {
    if (selectedDate && doctor) fetchSlots();
  }, [selectedDate]);

  const fetchDoctor = async () => {
    try {
      const { data } = await API.get('/bookings/doctors-catalog');
      const found = data.find(d => d._id === id);
      if (!found) { toast.error('Doctor not found'); navigate('/browse-doctors'); return; }
      setDoctor(found);
      setSelectedDate(new Date().toISOString().split('T')[0]);
    } catch (error) {
      toast.error('Failed to load doctor');
    } finally { setLoading(false); }
  };

  const fetchSlots = async () => {
    setSlotsLoading(true);
    try {
      const { data } = await API.get(`/bookings/slots?date=${selectedDate}&type=consultation&targetId=${id}`);
      setSlots(data);
    } catch (error) {
      toast.error('Failed to load slots');
    } finally { setSlotsLoading(false); }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date.toISOString().split('T')[0]);
    setSelectedSlot('');
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot) { toast.error('Please select a time slot'); return; }
    setBooking(true);
    try {
      const { data } = await API.post('/bookings', {
        type: 'consultation',
        doctorId: id,
        date: selectedDate,
        timeSlot: selectedSlot,
        patientName, patientPhone, patientEmail, notes,
      });
      toast.success('Booking created! Proceed to payment.');
      navigate(`/payment/${data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Booking failed');
    } finally { setBooking(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="spinner w-8 h-8 border-3 border-blue-600 border-t-transparent mx-auto"></div></div>;
  if (!doctor) return null;

  const isDateSelected = (date) => date.toISOString().split('T')[0] === selectedDate;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => navigate('/browse-doctors')} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-medium">
        <FiArrowLeft size={16} /> Back to Doctors
      </button>

      {/* Doctor info card */}
      <div className="card p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0">
            {doctor.name?.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-800">{doctor.name}</h1>
            <p className="text-blue-600 font-medium">{doctor.specialization}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
              {doctor.department?.name && <span className="flex items-center gap-1"><FiMapPin size={12} /> {doctor.department.name}</span>}
              <span className="flex items-center gap-1"><FiAward size={12} /> {doctor.experience} years exp</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{doctor.qualification}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-2xl font-bold text-emerald-600">₹{doctor.consultationFee}</p>
            <p className="text-xs text-slate-400">Consultation Fee</p>
          </div>
        </div>
      </div>

      {step === 1 && (
        <>
          {/* Date picker */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <FiCalendar className="text-blue-600" /> Select Date
            </h2>
            <div className="flex items-center gap-2">
              <button onClick={() => setDatePageStart(Math.max(0, datePageStart - 7))} disabled={datePageStart === 0} className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30">
                <FiChevronLeft size={18} />
              </button>
              <div className="flex-1 grid grid-cols-7 gap-2">
                {visibleDates.map(date => {
                  const isSelected = isDateSelected(date);
                  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                  const dayNum = date.getDate();
                  const month = date.toLocaleDateString('en-US', { month: 'short' });
                  const isSunday = date.getDay() === 0;

                  // Check if doctor is available on this day
                  const fullDayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                  const isDoctorAvailable = doctor.availability?.days?.includes(fullDayName);
                  const isDisabled = isSunday || !isDoctorAvailable;

                  return (
                    <button
                      key={date.toISOString()} onClick={() => !isDisabled && handleDateSelect(date)} disabled={isDisabled}
                      className={`flex flex-col items-center py-3 px-2 rounded-xl text-sm transition-all duration-200 ${
                        isSelected ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                          : isDisabled ? 'bg-slate-50 text-slate-300 cursor-not-allowed'
                            : 'bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700'
                      }`}
                    >
                      <span className="text-xs font-medium">{dayName}</span>
                      <span className="text-lg font-bold">{dayNum}</span>
                      <span className="text-[10px]">{month}</span>
                    </button>
                  );
                })}
              </div>
              <button onClick={() => setDatePageStart(Math.min(7, datePageStart + 7))} disabled={datePageStart >= 7} className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30">
                <FiChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Time slots */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <FiClock className="text-blue-600" /> Select Time Slot
            </h2>
            {slotsLoading ? (
              <div className="flex justify-center py-8"><div className="spinner w-6 h-6 border-2 border-blue-600 border-t-transparent"></div></div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {slots.map(slot => (
                  <button key={slot.time} onClick={() => slot.available && setSelectedSlot(slot.time)} disabled={!slot.available}
                    className={`py-3 px-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      selectedSlot === slot.time ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                        : slot.available ? 'bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-700 border border-slate-200'
                          : 'bg-red-50 text-red-300 line-through cursor-not-allowed border border-red-100'
                    }`}
                  >
                    {slot.time}
                    {!slot.available && <span className="block text-[10px] mt-0.5 no-underline">Booked</span>}
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-center gap-6 mt-4 text-xs text-slate-500">
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-slate-50 border border-slate-200"></span> Available</span>
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-blue-600"></span> Selected</span>
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-red-50 border border-red-100"></span> Booked</span>
            </div>
          </div>

          {selectedSlot && (
            <button onClick={() => setStep(2)} className="btn btn-primary w-full py-3.5 text-base">
              Continue <FiArrowLeft size={16} className="rotate-180" />
            </button>
          )}
        </>
      )}

      {step === 2 && (
        <div className="card p-6 space-y-5">
          <h2 className="text-lg font-semibold text-slate-800">Confirm Your Consultation</h2>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Doctor</span>
              <span className="font-semibold text-slate-800">{doctor.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Specialization</span>
              <span className="font-semibold text-slate-800">{doctor.specialization}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Date</span>
              <span className="font-semibold text-slate-800">
                {new Date(selectedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Time</span>
              <span className="font-semibold text-slate-800">{selectedSlot}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-emerald-200 pt-2 mt-2">
              <span className="text-slate-600 font-medium">Total Amount</span>
              <span className="font-bold text-emerald-600 text-lg">₹{doctor.consultationFee}</span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-700">Patient Details (optional)</h3>
            <input type="text" placeholder="Full Name" value={patientName} onChange={e => setPatientName(e.target.value)} className="form-input" />
            <div className="grid grid-cols-2 gap-3">
              <input type="tel" placeholder="Phone Number" value={patientPhone} onChange={e => setPatientPhone(e.target.value)} className="form-input" />
              <input type="email" placeholder="Email Address" value={patientEmail} onChange={e => setPatientEmail(e.target.value)} className="form-input" />
            </div>
            <textarea placeholder="Reason for consultation / Notes" value={notes} onChange={e => setNotes(e.target.value)} className="form-textarea" rows={3} />
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn btn-secondary flex-1">Back</button>
            <button onClick={handleConfirmBooking} disabled={booking} className="btn btn-primary flex-1 py-3">
              {booking ? <span className="spinner"></span> : <><FiCheck size={16} /> Confirm Booking</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
