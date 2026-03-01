const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Department = require('./models/Department');
const Doctor = require('./models/Doctor');
const Patient = require('./models/Patient');
const Appointment = require('./models/Appointment');
const Service = require('./models/Service');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Department.deleteMany({});
    await Doctor.deleteMany({});
    await Patient.deleteMany({});
    await Appointment.deleteMany({});
    await Service.deleteMany({});
    console.log('Cleared existing data.');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@hospital.com',
      password: 'admin123',
      role: 'admin',
      phone: '9876543210',
    });
    console.log('Admin user created: admin@hospital.com / admin123');

    // Create receptionist
    await User.create({
      name: 'Reception Staff',
      email: 'reception@hospital.com',
      password: 'reception123',
      role: 'receptionist',
      phone: '9876543211',
    });
    console.log('Receptionist created: reception@hospital.com / reception123');

    // Create patient user
    await User.create({
      name: 'Rahul Patient',
      email: 'patient@hospital.com',
      password: 'patient123',
      role: 'patient',
      phone: '9876543212',
    });
    console.log('Patient user created: patient@hospital.com / patient123');

    // Create departments
    const departments = await Department.insertMany([
      { name: 'Cardiology', description: 'Heart and cardiovascular system care', icon: '❤️', status: 'Active' },
      { name: 'Neurology', description: 'Brain and nervous system disorders', icon: '🧠', status: 'Active' },
      { name: 'Orthopedics', description: 'Bone, joint, and muscle treatment', icon: '🦴', status: 'Active' },
      { name: 'Pediatrics', description: 'Medical care for infants and children', icon: '👶', status: 'Active' },
      { name: 'Dermatology', description: 'Skin, hair, and nail conditions', icon: '🧴', status: 'Active' },
      { name: 'Ophthalmology', description: 'Eye care and vision disorders', icon: '👁️', status: 'Active' },
      { name: 'ENT', description: 'Ear, nose, and throat treatment', icon: '👂', status: 'Active' },
      { name: 'General Medicine', description: 'Primary healthcare and diagnostics', icon: '🩺', status: 'Active' },
      { name: 'Gynecology', description: 'Women\'s reproductive health', icon: '🏥', status: 'Active' },
      { name: 'Oncology', description: 'Cancer diagnosis and treatment', icon: '🎗️', status: 'Active' },
    ]);
    console.log(`${departments.length} departments created.`);

    // Create doctors
    const doctorsData = [
      { name: 'Dr. Rajesh Kumar', email: 'rajesh@hospital.com', phone: '9876500001', specialization: 'Cardiologist', department: departments[0]._id, qualification: 'MD, DM Cardiology', experience: 15, consultationFee: 1000, status: 'Available' },
      { name: 'Dr. Priya Sharma', email: 'priya@hospital.com', phone: '9876500002', specialization: 'Neurologist', department: departments[1]._id, qualification: 'MD, DM Neurology', experience: 12, consultationFee: 1200, status: 'Available' },
      { name: 'Dr. Amit Patel', email: 'amit@hospital.com', phone: '9876500003', specialization: 'Orthopedic Surgeon', department: departments[2]._id, qualification: 'MS Orthopedics', experience: 10, consultationFee: 800, status: 'Available' },
      { name: 'Dr. Sunita Verma', email: 'sunita@hospital.com', phone: '9876500004', specialization: 'Pediatrician', department: departments[3]._id, qualification: 'MD Pediatrics', experience: 8, consultationFee: 600, status: 'Available' },
      { name: 'Dr. Vikram Singh', email: 'vikram@hospital.com', phone: '9876500005', specialization: 'Dermatologist', department: departments[4]._id, qualification: 'MD Dermatology', experience: 7, consultationFee: 700, status: 'Available' },
      { name: 'Dr. Neha Gupta', email: 'neha@hospital.com', phone: '9876500006', specialization: 'Ophthalmologist', department: departments[5]._id, qualification: 'MS Ophthalmology', experience: 9, consultationFee: 900, status: 'On Leave' },
      { name: 'Dr. Arjun Reddy', email: 'arjun@hospital.com', phone: '9876500007', specialization: 'ENT Specialist', department: departments[6]._id, qualification: 'MS ENT', experience: 11, consultationFee: 750, status: 'Available' },
      { name: 'Dr. Kavita Joshi', email: 'kavita@hospital.com', phone: '9876500008', specialization: 'General Physician', department: departments[7]._id, qualification: 'MD Medicine', experience: 14, consultationFee: 500, status: 'Available' },
      { name: 'Dr. Sanjay Mehta', email: 'sanjay@hospital.com', phone: '9876500009', specialization: 'Cardiologist', department: departments[0]._id, qualification: 'MD, DM Cardiology', experience: 20, consultationFee: 1500, status: 'Available' },
      { name: 'Dr. Anita Desai', email: 'anita@hospital.com', phone: '9876500010', specialization: 'Gynecologist', department: departments[8]._id, qualification: 'MD, DGO', experience: 16, consultationFee: 1100, status: 'Available' },
      { name: 'Dr. Ravi Shankar', email: 'ravi@hospital.com', phone: '9876500011', specialization: 'Oncologist', department: departments[9]._id, qualification: 'MD, DM Oncology', experience: 13, consultationFee: 1300, status: 'Busy' },
      { name: 'Dr. Meera Nair', email: 'meera@hospital.com', phone: '9876500012', specialization: 'Pediatrician', department: departments[3]._id, qualification: 'MD Pediatrics, Fellowship Neonatology', experience: 6, consultationFee: 650, status: 'Available' },
    ];

    const doctors = await Doctor.insertMany(doctorsData);
    console.log(`${doctors.length} doctors created.`);

    // Update department head doctors
    await Department.findByIdAndUpdate(departments[0]._id, { headDoctor: 'Dr. Sanjay Mehta' });
    await Department.findByIdAndUpdate(departments[1]._id, { headDoctor: 'Dr. Priya Sharma' });
    await Department.findByIdAndUpdate(departments[2]._id, { headDoctor: 'Dr. Amit Patel' });
    await Department.findByIdAndUpdate(departments[3]._id, { headDoctor: 'Dr. Sunita Verma' });
    await Department.findByIdAndUpdate(departments[7]._id, { headDoctor: 'Dr. Kavita Joshi' });

    // Create patients
    const patientsData = [
      { name: 'Rahul Sharma', email: 'rahul@email.com', phone: '9898001001', age: 35, gender: 'Male', bloodGroup: 'O+', address: '123 MG Road, Mumbai', status: 'Active', medicalHistory: 'Mild hypertension' },
      { name: 'Priya Patel', email: 'priyap@email.com', phone: '9898001002', age: 28, gender: 'Female', bloodGroup: 'A+', address: '45 Park Street, Delhi', status: 'Active', medicalHistory: 'No significant history' },
      { name: 'Amit Kumar', email: 'amitk@email.com', phone: '9898001003', age: 52, gender: 'Male', bloodGroup: 'B+', address: '67 Church Road, Bangalore', status: 'Active', medicalHistory: 'Type 2 Diabetes, managed' },
      { name: 'Sunita Devi', email: 'sunita@email.com', phone: '9898001004', age: 45, gender: 'Female', bloodGroup: 'AB+', address: '89 Lake View, Chennai', status: 'Active', medicalHistory: 'Asthma since childhood' },
      { name: 'Vikram Rathore', email: 'vikramr@email.com', phone: '9898001005', age: 60, gender: 'Male', bloodGroup: 'O-', address: '12 Civil Lines, Jaipur', status: 'Critical', medicalHistory: 'Cardiac patient, bypass surgery 2020' },
      { name: 'Anjali Singh', email: 'anjali@email.com', phone: '9898001006', age: 8, gender: 'Female', bloodGroup: 'A-', address: '34 Sector 15, Noida', status: 'Active', medicalHistory: 'Allergic to penicillin' },
      { name: 'Mohan Das', email: 'mohan@email.com', phone: '9898001007', age: 70, gender: 'Male', bloodGroup: 'B-', address: '56 Gandhi Nagar, Pune', status: 'Active', medicalHistory: 'Arthritis, knee replacement 2019' },
      { name: 'Deepika Rao', email: 'deepika@email.com', phone: '9898001008', age: 32, gender: 'Female', bloodGroup: 'O+', address: '78 Jubilee Hills, Hyderabad', status: 'Active', medicalHistory: 'Migraine' },
      { name: 'Suresh Menon', email: 'suresh@email.com', phone: '9898001009', age: 48, gender: 'Male', bloodGroup: 'AB-', address: '90 MG Road, Kolkata', status: 'Discharged', medicalHistory: 'Cholesterol, controlled with medication' },
      { name: 'Lakshmi Iyer', email: 'lakshmi@email.com', phone: '9898001010', age: 55, gender: 'Female', bloodGroup: 'A+', address: '101 Anna Nagar, Chennai', status: 'Active', medicalHistory: 'Thyroid disorder' },
      { name: 'Karan Malhotra', email: 'karan@email.com', phone: '9898001011', age: 25, gender: 'Male', bloodGroup: 'O+', address: '23 Connaught Place, Delhi', status: 'Active', medicalHistory: 'Sports injury - ACL tear' },
      { name: 'Ritika Bansal', email: 'ritika@email.com', phone: '9898001012', age: 38, gender: 'Female', bloodGroup: 'B+', address: '45 Bandra, Mumbai', status: 'Active', medicalHistory: 'PCOD' },
      { name: 'Rajendra Prasad', email: 'rajendra@email.com', phone: '9898001013', age: 65, gender: 'Male', bloodGroup: 'A+', address: '67 Vasant Kunj, Delhi', status: 'Critical', medicalHistory: 'Stage 2 lung cancer, undergoing treatment' },
      { name: 'Meena Kumari', email: 'meena@email.com', phone: '9898001014', age: 42, gender: 'Female', bloodGroup: 'O-', address: '89 Koramangala, Bangalore', status: 'Active', medicalHistory: 'No significant history' },
      { name: 'Arun Tiwari', email: 'arun@email.com', phone: '9898001015', age: 50, gender: 'Male', bloodGroup: 'B+', address: '12 Aundh, Pune', status: 'Active', medicalHistory: 'Hypertension, mild liver issues' },
    ];

    const patients = await Patient.insertMany(patientsData);
    console.log(`${patients.length} patients created.`);

    // Create 5 medical services with images
    const servicesData = [
      {
        name: 'Complete Blood Test (CBC)',
        description: 'Comprehensive blood count analysis including WBC, RBC, hemoglobin, platelets, and differential count. Helps detect infections, anemia, and other blood disorders.',
        department: departments[7]._id, // General Medicine
        doctor: doctors[7]._id, // Dr. Kavita (General Physician)
        price: 599,
        duration: 30,
        category: 'Lab Test',
        status: 'Active',
        icon: '🩸',
        image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600&h=400&fit=crop',
      },
      {
        name: 'Blood Pressure Monitoring',
        description: 'Accurate digital BP measurement with detailed analysis. Includes systolic, diastolic readings and pulse rate monitoring. Essential for hypertension screening.',
        department: departments[0]._id, // Cardiology
        doctor: doctors[0]._id, // Dr. Rajesh (Cardiologist)
        price: 199,
        duration: 15,
        category: 'Procedure',
        status: 'Active',
        icon: '💓',
        image: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=600&h=400&fit=crop',
      },
      {
        name: 'Digital X-Ray',
        description: 'High-resolution digital X-ray imaging for chest, bones, and joints. Quick results with minimal radiation exposure. Instant digital report available.',
        department: departments[2]._id, // Orthopedics
        doctor: doctors[2]._id, // Dr. Amit (Orthopedic)
        price: 899,
        duration: 20,
        category: 'Imaging',
        status: 'Active',
        icon: '🦴',
        image: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=600&h=400&fit=crop',
      },
      {
        name: 'ECG / Heart Scan',
        description: '12-lead electrocardiogram for comprehensive heart rhythm analysis. Detects arrhythmias, heart attacks, and other cardiac conditions. Results within 15 minutes.',
        department: departments[0]._id, // Cardiology
        doctor: doctors[8]._id, // Dr. Sanjay (Cardiologist senior)
        price: 749,
        duration: 30,
        category: 'Procedure',
        status: 'Active',
        icon: '❤️',
        image: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=600&h=400&fit=crop',
      },
      {
        name: 'Full Body Health Checkup',
        description: 'Complete health screening package including blood tests, urine analysis, liver & kidney function, thyroid profile, lipid profile, blood sugar, and doctor consultation.',
        department: departments[7]._id, // General Medicine
        doctor: doctors[7]._id, // Dr. Kavita (General Physician)
        price: 2499,
        duration: 120,
        category: 'Lab Test',
        status: 'Active',
        icon: '🩺',
        image: 'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=600&h=400&fit=crop',
      },
    ];

    const services = await Service.insertMany(servicesData);
    console.log(`${services.length} medical services created.`);

    // Create appointments
    const today = new Date();
    const appointmentsData = [];

    const types = ['Consultation', 'Follow-up', 'Emergency', 'Lab Test'];
    const statuses = ['Scheduled', 'Completed', 'Cancelled', 'Completed', 'Completed', 'Scheduled'];

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - Math.floor(Math.random() * 30) + Math.floor(Math.random() * 7));
      const hour = 9 + Math.floor(Math.random() * 8);
      const minute = Math.random() > 0.5 ? '00' : '30';

      appointmentsData.push({
        patient: patients[Math.floor(Math.random() * patients.length)]._id,
        doctor: doctors[Math.floor(Math.random() * doctors.length)]._id,
        date: date,
        time: `${hour.toString().padStart(2, '0')}:${minute}`,
        type: types[Math.floor(Math.random() * types.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        notes: ['Regular checkup', 'Follow-up after surgery', 'Persistent headache', 'Chest pain evaluation', 'Skin rash', 'Annual physical', 'Blood work results', 'Post-op review'][Math.floor(Math.random() * 8)],
        fee: [500, 600, 700, 800, 1000, 1200, 1500][Math.floor(Math.random() * 7)],
      });
    }

    // Add some appointments for today specifically
    for (let i = 0; i < 5; i++) {
      const hour = 9 + i * 2;
      appointmentsData.push({
        patient: patients[i]._id,
        doctor: doctors[i]._id,
        date: today,
        time: `${hour.toString().padStart(2, '0')}:00`,
        type: types[i % types.length],
        status: i < 2 ? 'Completed' : 'Scheduled',
        notes: `Today's appointment #${i + 1}`,
        fee: doctors[i].consultationFee || 500,
      });
    }

    const appointments = await Appointment.insertMany(appointmentsData);
    console.log(`${appointments.length} appointments created.`);

    console.log('\n========================================');
    console.log('  Database seeded successfully!');
    console.log('========================================');
    console.log('\nLogin credentials:');
    console.log('  Admin:        admin@hospital.com / admin123');
    console.log('  Receptionist: reception@hospital.com / reception123');
    console.log('  Patient:      patient@hospital.com / patient123');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
