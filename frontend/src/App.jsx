import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ForgotPassword from './components/Auth/ForgotPassword';
import AccountSecurity from './components/Auth/AccountSecurity';
import Dashboard from './components/Dashboard/Dashboard';
import PatientDashboard from './components/Dashboard/PatientDashboard';
import PatientList from './components/Patients/PatientList';
import PatientForm from './components/Patients/PatientForm';
import DoctorList from './components/Doctors/DoctorList';
import DoctorForm from './components/Doctors/DoctorForm';
import AppointmentList from './components/Appointments/AppointmentList';
import AppointmentForm from './components/Appointments/AppointmentForm';
import DepartmentList from './components/Departments/DepartmentList';
import DepartmentForm from './components/Departments/DepartmentForm';
import ServiceList from './components/Services/ServiceList';
import ServiceForm from './components/Services/ServiceForm';
import PaymentList from './components/Payments/PaymentList';
import PaymentForm from './components/Payments/PaymentForm';
import ServiceCatalog from './components/Booking/ServiceCatalog';
import ServiceBooking from './components/Booking/ServiceBooking';
import DoctorCatalog from './components/Booking/DoctorCatalog';
import DoctorBooking from './components/Booking/DoctorBooking';
import PaymentGateway from './components/Booking/PaymentGateway';
import MyBookings from './components/Booking/MyBookings';
import AllBookings from './components/Booking/AllBookings';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="spinner w-10 h-10 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }
  return user ? children : <Navigate to="/login" />;
};

const RoleDashboard = () => {
  const { user } = useAuth();
  return user?.role === 'patient' ? <PatientDashboard /> : <Dashboard />;
};

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="spinner w-10 h-10 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Loading Mediflix+...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
      <Route path="/forgot-password" element={user ? <Navigate to="/" /> : <ForgotPassword />} />

      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<RoleDashboard />} />
        <Route path="account" element={<AccountSecurity />} />

        {/* Admin / Receptionist routes */}
        <Route path="patients" element={<PatientList />} />
        <Route path="patients/new" element={<PatientForm />} />
        <Route path="patients/edit/:id" element={<PatientForm />} />
        <Route path="doctors" element={<DoctorList />} />
        <Route path="doctors/new" element={<DoctorForm />} />
        <Route path="doctors/edit/:id" element={<DoctorForm />} />
        <Route path="appointments" element={<AppointmentList />} />
        <Route path="appointments/new" element={<AppointmentForm />} />
        <Route path="appointments/edit/:id" element={<AppointmentForm />} />
        <Route path="departments" element={<DepartmentList />} />
        <Route path="departments/new" element={<DepartmentForm />} />
        <Route path="departments/edit/:id" element={<DepartmentForm />} />
        <Route path="services" element={<ServiceList />} />
        <Route path="services/new" element={<ServiceForm />} />
        <Route path="services/edit/:id" element={<ServiceForm />} />
        <Route path="payments" element={<PaymentList />} />
        <Route path="payments/new" element={<PaymentForm />} />
        <Route path="payments/edit/:id" element={<PaymentForm />} />
        <Route path="all-bookings" element={<AllBookings />} />

        {/* Patient / Booking routes (accessible to all logged-in users) */}
        <Route path="browse-services" element={<ServiceCatalog />} />
        <Route path="book-service/:id" element={<ServiceBooking />} />
        <Route path="browse-doctors" element={<DoctorCatalog />} />
        <Route path="book-doctor/:id" element={<DoctorBooking />} />
        <Route path="payment/:bookingId" element={<PaymentGateway />} />
        <Route path="my-bookings" element={<MyBookings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
