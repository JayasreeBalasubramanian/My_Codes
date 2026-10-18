// app.js
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const nodemailer = require('nodemailer');
const Donor = require('./models/Donor');
const Patient = require('./models/Patient');
const app = express();
const serverHost = 'https://polka-bonfire-confirm.ngrok-free.dev';
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Configure sessions for admin security
app.use(session({
  secret: 'rela_hospital_secure_admin_key_2026',
  resave: false,
  saveUninitialized: false
}));

// Configure Nodemailer transporter using environment variables
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/myfirstdatabase';

mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB successfully!'))
  .catch((err) => console.error('Connection error:', err));

// Middleware to protect admin routes
function ensureAdmin(req, res, next) {
  if (req.session && req.session.isAdminAuthenticated) {
    return next();
  }
  res.redirect('/hospital/login');
}

// Home selection page
app.get('/', (req, res) => {
  res.render('index');
});

// Donor sign-up form
app.get('/signup', (req, res) => {
  res.render('signup');
});

// Handle donor sign-up with duplicate check
app.post('/signup', async (req, res) => {
  try {
    const { email, phone } = req.body;
    const existingDonor = await Donor.findOne({ $or: [{ email }, { phone }] });

    if (existingDonor) {
      return res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8"><title>Already Registered - VenaAether</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #fff; }
            .card { border: 2px solid #e74c3c; padding: 40px; border-radius: 12px; text-align: center; max-width: 450px; }
            h1 { color: #e74c3c; margin-bottom: 10px; }
            p { color: #666; margin-bottom: 20px; }
            .btn { background: #e74c3c; color: white; padding: 10px 25px; border-radius: 6px; text-decoration: none; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>⚠️ Already Registered!</h1>
            <p>An account with this email or phone number already exists.</p>
            <a href="/signup" class="btn">Try Again</a>
          </div>
        </body>
        </html>
      `);
    }

    const newDonor = new Donor(req.body);
    await newDonor.save();
    
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head><meta charset="UTF-8"><title>Donor Registered</title>
        <style>
          body { font-family: 'Segoe UI', sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #fff; }
          .card { border: 2px solid #d9534f; padding: 40px; border-radius: 12px; text-align: center; max-width: 500px; }
          h1 { color: #d9534f; margin-bottom: 10px; }
          .details-box { background: #fff5f5; border-left: 5px solid #d9534f; text-align: left; padding: 20px; border-radius: 6px; margin-bottom: 25px; }
          .details-box p { margin: 8px 0; color: #444; }
          .btn { background: #d9534f; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>🩸 Donor Registered Successfully!</h1>
          <div class="details-box">
            <p><strong>Name:</strong> ${newDonor.name}</p>
            <p><strong>Email:</strong> ${newDonor.email}</p>
            <p><strong>Phone:</strong> ${newDonor.phone}</p>
            <p><strong>Blood Group:</strong> ${newDonor.bloodGroup}</p>
            <p><strong>Location:</strong> ${newDonor.location}</p>
          </div>
          <a href="/" class="btn">Back to Home</a>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error registering donor.');
  }
});

// Donor login routes
app.get('/login', (req, res) => {
  res.render('login');
});

// Donor login with automatic check for active emergency patient notifications in target zones
app.post('/login', async (req, res) => {
  try {
    const { phone } = req.body;
    const donor = await Donor.findOne({ phone });

    if (!donor) {
      return res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head><meta charset="UTF-8"><title>Login Failed</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #fff; }
            .card { border: 2px solid #e74c3c; padding: 40px; border-radius: 12px; text-align: center; max-width: 450px; }
            h1 { color: #e74c3c; margin-bottom: 10px; }
            p { color: #666; margin-bottom: 20px; }
            .btn { background: #e74c3c; color: white; padding: 10px 25px; border-radius: 6px; text-decoration: none; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>❌ Mobile Number Not Found</h1>
            <p>No registered donor found with this phone number.</p>
            <a href="/login" class="btn">Try Again</a>
          </div>
        </body>
        </html>
      `);
    }

    const targetLocations = ['Chrompet', 'Tambaram Sanatorium', 'Pallavaram', 'chrompet', 'tambaram sanatorium', 'pallavaram'];
    
    const isLocalZone = targetLocations.some(loc => 
      donor.location && donor.location.toLowerCase().includes(loc.toLowerCase())
    );

    let activeEmergency = null;
    if (isLocalZone) {
      activeEmergency = await Patient.findOne({ 
        bloodGroup: donor.bloodGroup 
      }).sort({ _id: -1 });
    }

    res.render('donor-profile', { donor, activeEmergency });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error during login.');
  }
});

// --- HOSPITAL ADMIN AUTHENTICATION ROUTES ---

app.get('/hospital/login', (req, res) => {
  res.render('hospital-login');
});

app.post('/hospital/login', (req, res) => {
  const { username, adminPassword } = req.body;
  const ADMIN_USER = 'relaadmin';
  const ADMIN_PASS = 'chrompet2026';

  if (username === ADMIN_USER && adminPassword === ADMIN_PASS) {
    req.session.isAdminAuthenticated = true;
    return res.redirect('/hospital/dashboard');
  } else {
    res.render('hospital-login', { error: 'Invalid admin username or password!' });
  }
});

app.get('/hospital/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// --- PROTECTED HOSPITAL ADMIN ROUTES ---

app.get('/hospital/dashboard', ensureAdmin, (req, res) => {
  res.render('hospital-dashboard', { 
    hospitalName: 'Rela Hospital, Chrompet' 
  });
});

app.get('/hospital/donors', ensureAdmin, async (req, res) => {
  try {
    const donors = await Donor.find({}).sort({ _id: -1 });
    res.render('donor-directory', { 
      donors, 
      hospitalName: 'Rela Hospital, Chrompet' 
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading donor directory.');
  }
});

app.get('/hospital/patients', ensureAdmin, async (req, res) => {
  try {
    const patients = await Patient.find({}).sort({ _id: -1 });
    res.render('patient-dashboard', { 
      patients, 
      hospitalName: 'Rela Hospital, Chrompet' 
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading patient records.');
  }
});

// Add patient requirement with Cloudflare serverHost integration for global email links
app.post('/hospital/patients/add', ensureAdmin, async (req, res) => {
  try {
    const patientNameVal = req.body.name || req.body.patientName;
    const { bloodGroup, unitsNeeded, ward } = req.body;
    
    if (!patientNameVal) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head><meta charset="UTF-8"><title>Missing Fields</title></head>
        <body style="font-family:sans-serif; text-align:center; padding-top:50px;">
          <h1 style="color:#e74c3c;">⚠️ Patient Name Missing</h1>
          <p>Please make sure the patient name field is filled out correctly.</p>
          <a href="/hospital/patients">Back</a>
        </body>
        </html>
      `);
    }

    const trimmedName = patientNameVal.trim();

    const existingPatient = await Patient.findOne({ 
      $or: [
        { name: { $regex: new RegExp(`^${trimmedName}$`, 'i') } },
        { patientName: { $regex: new RegExp(`^${trimmedName}$`, 'i') } }
      ]
    });

    if (existingPatient) {
      return res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8"><title>Patient Already Active - VenaAether</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #fff; }
            .card { border: 2px solid #e74c3c; padding: 40px; border-radius: 12px; text-align: center; max-width: 480px; }
            h1 { color: #e74c3c; margin-bottom: 10px; }
            p { color: #666; margin-bottom: 20px; line-height: 1.5; }
            .btn { background: #e74c3c; color: white; padding: 10px 25px; border-radius: 6px; text-decoration: none; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>⚠️ Patient Already Active!</h1>
            <p><strong>${trimmedName}</strong> is already registered in the active patient requests list and cannot be added again until this requirement is fulfilled or removed.</p>
            <a href="/hospital/patients" class="btn">Back to Patient Records</a>
          </div>
        </body>
        </html>
      `);
    }

    const patientData = {
      ...req.body,
      name: trimmedName,
      patientName: trimmedName,
      location: 'Chrompet',
      responses: []
    };

    const newPatient = new Patient(patientData);
    await newPatient.save();

    // --- EXACT MATCH DONOR FINDER & HTML EMAIL DISPATCH ---
    try {
      const cleanBg = bloodGroup ? bloodGroup.trim() : '';
      
      let shortlistedDonors = await Donor.find({
        bloodGroup: cleanBg
      }).limit(20);

      console.log(`Shortlisted ${shortlistedDonors.length} donor(s) matching blood group ${cleanBg}. Dispatching interactive emails...`);

      // Broadcast interactive email alerts using Nodemailer with active Cloudflare URL
      for (const donor of shortlistedDonors) {
        if (donor.email) {
          try {
            const acceptUrl = `${serverHost}/donor/respond?phone=${encodeURIComponent(donor.phone)}&status=Accepted&patient=${newPatient._id}`;
            const denyUrl = `${serverHost}/donor/respond?phone=${encodeURIComponent(donor.phone)}&status=Denied&patient=${newPatient._id}`;

            await transporter.sendMail({
              from: `"VenaAether Blood Bank" <${process.env.EMAIL_USER}>`,
              to: donor.email,
              subject: `URGENT: Blood Emergency at Rela Hospital`,
              html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #ddd; border-radius: 8px;">
                  <h2 style="color: #d9534f; margin-top: 0;">🩸 URGENT: Blood Emergency at Rela Hospital</h2>
                  <p>Hello <strong>${donor.name}</strong>,</p>
                  <p>Patient <strong>${trimmedName}</strong> urgently needs <strong>${unitsNeeded}</strong> unit(s) of <strong>${cleanBg}</strong> blood at Rela Hospital (${ward || 'ICU'}).</p>
                  <p>Please click one of the options below to notify the hospital portal immediately:</p>
                  <div style="margin: 30px 0; text-align: center;">
                    <a href="${acceptUrl}" style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin-right: 15px;">Accept & Donate</a>
                    <a href="${denyUrl}" style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Deny</a>
                  </div>
                  <p style="font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 15px;">Thank you for saving lives with VenaAether - Rela Hospital, Chrompet.</p>
                </div>
              `
            });
            console.log(`Email sent to ${donor.email}`);
          } catch (emailErr) {
            console.log(`Failed to email ${donor.email}: ${emailErr.message}`);
          }
        }
      }
    } catch (matchingErr) {
      console.log('Donor matching or email dispatch error:', matchingErr.message);
    }

    res.redirect('/hospital/patients');
  } catch (err) {
    console.error("Detailed server error in patient add:", err);
    res.status(500).send(`Error adding patient requirement: ${err.message}`);
  }
});

// Donor response route when the donor clicks Accept or Deny on their email button (renders inline confirmation message)
app.get('/donor/respond', async (req, res) => {
  try {
    const { phone, status, patient } = req.query;
    const donor = await Donor.findOne({ phone });
    const patientRecord = await Patient.findById(patient);

    if (patientRecord && donor) {
      if (!patientRecord.responses) {
        patientRecord.responses = [];
      }
      const existingIndex = patientRecord.responses.findIndex(r => r.phone === phone);
      if (existingIndex > -1) {
        patientRecord.responses[existingIndex].status = status;
        patientRecord.responses[existingIndex].timestamp = new Date();
      } else {
        patientRecord.responses.push({
          donorName: donor.name,
          phone: donor.phone,
          bloodGroup: donor.bloodGroup,
          status: status,
          timestamp: new Date()
        });
      }
      await patientRecord.save();
      console.log(`Donor ${donor.name} (${phone}) updated response to: ${status} for patient ${patientRecord.name}`);
    }

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8"><title>Response Recorded - VenaAether</title>
        <style>
          body { font-family: 'Segoe UI', sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f8f9fa; margin: 0; }
          .card { background: white; border: 2px solid #28a745; padding: 40px; border-radius: 12px; text-align: center; max-width: 450px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          h2 { color: #28a745; margin-bottom: 10px; }
          p { color: #555; line-height: 1.5; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>Response Recorded Successfully!</h2>
          <p>Thank you, <strong>${donor ? donor.name : 'Donor'}</strong>. Your response (<strong>${status}</strong>) has been securely sent to Rela Hospital.</p>
          <p style="font-size: 13px; color: #888;">You can now safely close this window.</p>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error processing response.');
  }
});

// Catch-all 404 route using safe regex pattern
app.get(/(.*)/, (req, res) => {
  res.status(404).send('Page not found');
});

// Export app for Vercel serverless deployment, or listen locally if run directly
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
