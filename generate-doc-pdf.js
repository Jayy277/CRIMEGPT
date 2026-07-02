const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument({ margin: 50 });
const writeStream = fs.createWriteStream('SYSTEM_DOCUMENTATION.pdf');
doc.pipe(writeStream);

// --- TITLE PAGE ---
doc.fontSize(36).font('Helvetica-Bold').fillColor('#1e3a8a').text('CrimeGPT', { align: 'center' });
doc.moveDown(0.5);
doc.fontSize(16).font('Helvetica').fillColor('#475569').text('Interactive Crime Management & Intelligent Analytics System', { align: 'center' });
doc.moveDown(0.2);
doc.fontSize(12).font('Helvetica-Oblique').fillColor('#94a3b8').text('System Specifications & Complete User Guide', { align: 'center' });
doc.moveDown(5);

doc.fontSize(10).font('Helvetica').fillColor('#94a3b8').text('Generated July 2026 &bull; Secure Documentation', { align: 'center' });

doc.addPage();

// --- SECTION 1 ---
doc.fontSize(18).font('Helvetica-Bold').fillColor('#1e3a8a').text('1. Executive Summary & Architecture');
doc.moveDown(0.8);
doc.fontSize(11).font('Helvetica').fillColor('#1e293b').text(
  'CrimeGPT is a modern web application designed for police departments, crime analysts, and database administrators. The system allows digital registration of First Information Reports (FIRs), dynamic legal section mappings, visual data compilation, and administrative access control.\n\n' +
  'The architecture is split into a RESTful API backend and a Vite-powered React frontend:\n' +
  '• Backend: Node.js, Express, MongoDB (Mongoose schemas), and JWT authentication.\n' +
  '• Frontend: React.js, React Router for secure role-based portals, Axios, and Recharts for tactical charting.'
);
doc.moveDown(2);

// --- SECTION 2 ---
doc.fontSize(18).font('Helvetica-Bold').fillColor('#1e3a8a').text('2. Authentication & Portal Security');
doc.moveDown(0.8);
doc.fontSize(11).font('Helvetica').fillColor('#1e293b').text(
  'Access controls are enforced using JSON Web Tokens (JWT). Upon logging in at /login, the backend signs a payload with the user\'s role claim. The React client intercepts this and redirects users to their designated workspace:\n\n' +
  '• Officer Portal: Redirects to /officer/dashboard. Access scope: Case management, FIR logs, evidence lockers, MO search.\n' +
  '• Analyst Portal: Redirects to /analyst/dashboard. Access scope: Aggregated analytics, trend charting, threat maps, PDF compilation.\n' +
  '• Admin Portal: Redirects to /admin/dashboard. Access scope: System users, officer workload audits, category bindings, audit logs.'
);
doc.moveDown(2);

// --- SECTION 3 ---
doc.fontSize(18).font('Helvetica-Bold').fillColor('#1e3a8a').text('3. Core Features');
doc.moveDown(0.8);
doc.fontSize(12).font('Helvetica-Bold').fillColor('#0f172a').text('Custom Feature A: Dynamic Legal Section Autocomplete');
doc.fontSize(11).font('Helvetica').fillColor('#1e293b').text(
  'During crime logging in the Officer portal, selecting a Crime Type triggers a dynamic fetch request: GET /api/crime-categories/:id/sections. The form parses this to populate legal clauses under the BNS, BNSS, and BSA schedules dynamically, preventing errors.'
);
doc.moveDown(1);

doc.fontSize(12).font('Helvetica-Bold').fillColor('#0f172a').text('Custom Feature B: Pending Status Indicator');
doc.fontSize(11).font('Helvetica').fillColor('#1e293b').text(
  'Cases that require active officer updates or remain in initial statuses (e.g. Reported, Assigned, Under Investigation) render an active indicator: an animated pulsing red dot. This visual cue drives priority awareness on dashboards.'
);
doc.moveDown(1);

doc.fontSize(12).font('Helvetica-Bold').fillColor('#0f172a').text('Custom Feature C: Modus Operandi Similar Case Scan');
doc.fontSize(11).font('Helvetica').fillColor('#1e293b').text(
  'In the Case details workspace, officers can click the "MO Scanner" module. The frontend calls the backend similarity pipeline, scanning keywords in descriptions and crime categories to return a ranked listing of matching historical cases.'
);

doc.addPage();

// --- SECTION 4 ---
doc.fontSize(18).font('Helvetica-Bold').fillColor('#1e3a8a').text('4. Portal Functions Directory');
doc.moveDown(0.8);

doc.fontSize(13).font('Helvetica-Bold').fillColor('#0f172a').text('4.1 Officer Portal');
doc.fontSize(11).font('Helvetica').fillColor('#1e293b').text(
  '• Dashboard: Displays count widgets (Total Cases, Pending Cases, Solved Cases) and lists the latest 5 case assignments.\n' +
  '• Register Crime: A form allowing officers to log a crime, select categories, pick dynamic acts/clauses (Feature A), set location jurisdictions, and assign priority levels.\n' +
  '• My Cases: Filters active assignments with active indicators (Feature B).\n' +
  '• Crime Details: Includes timeline status tracking (Reported -> Closed), suspect lists (linking suspects with identical names across other cases), witness log statements, and evidence uploads.\n' +
  '• Search: Multi-query filters (date, station, category, status) for listing historical database files.'
);
doc.moveDown(1.5);

doc.fontSize(13).font('Helvetica-Bold').fillColor('#0f172a').text('4.2 Analyst Portal');
doc.fontSize(11).font('Helvetica').fillColor('#1e293b').text(
  '• Dashboard: Aggregated charts showing case volume trends (monthly line graph) and category distribution (bar charts).\n' +
  '• Tactical Heatmap: A matrix layout visualizing active threat levels (Critical, Warning, Low) across various police stations.\n' +
  '• PDF Compiler Reports: Allows analysts to choose date ranges, case statuses, and priority levels, triggering a backend compilation to download a formal PDF summary.'
);
doc.moveDown(1.5);

doc.fontSize(13).font('Helvetica-Bold').fillColor('#0f172a').text('4.3 Admin Portal');
doc.fontSize(11).font('Helvetica').fillColor('#1e293b').text(
  '• Manage Users: Add, update, and toggle active logins for all portal operators. Handles profiles (e.g. officer badge codes, analyst departments).\n' +
  '• Manage Officers Workload: Displays active caseload counts per officer to allow manual adjustment of load distributions.\n' +
  '• Crime Categories: Edit legal categories and configure their respective BNS/BSA section codes.\n' +
  '• System Audit Logs: Access logs of all administrative changes.'
);

doc.addPage();

// --- SECTION 5 ---
doc.fontSize(18).font('Helvetica-Bold').fillColor('#1e3a8a').text('5. Local Execution Guide');
doc.moveDown(0.8);
doc.fontSize(11).font('Helvetica').fillColor('#1e293b').text(
  'To run the complete system locally, follow this terminal checklist:\n\n' +
  'Step 1: Database Setup\n' +
  'Ensure MongoDB is running locally on port 27017. The database name is crimegpt.\n\n' +
  'Step 2: Seed Initial Configurations\n' +
  'Run: npm run seed\n' +
  'This creates initial locations, crime categories, and creates the admin credentials: admin@crimegpt.com / Admin@123.\n\n' +
  'Step 3: Start Backend API (Port 5000)\n' +
  'Run: npm start\n\n' +
  'Step 4: Start React Frontend Client (Port 3000)\n' +
  'Run: npm run dev (inside the frontend directory)\n\n' +
  'Open http://localhost:3000 in your web browser to access the secure portal.'
);

doc.end();

writeStream.on('finish', () => {
  console.log('PDF documentation compiled successfully.');
});
