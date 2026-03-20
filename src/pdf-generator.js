/**
 * PDF Generator – client-side PDF generation using jsPDF
 * Generates professional templates for all heat pump installation documents
 */
import { jsPDF } from 'jspdf';

// ─── Colours ──────────────────────────────────────────────────────────────────
const BLUE  = [21, 101, 192];
const DARK  = [26, 26, 46];
const GREY  = [100, 100, 110];
const LGREY = [220, 225, 235];
const WHITE = [255, 255, 255];
const GREEN = [46, 125, 50];

// ─── Page constants (A4 mm) ───────────────────────────────────────────────────
const PW  = 210;   // page width
const PH  = 297;   // page height
const ML  = 15;    // margin left
const MR  = 15;    // margin right
const CW  = PW - ML - MR;  // content width

// ─── Base helpers ─────────────────────────────────────────────────────────────

function addHeader(doc, title, subtitle = '') {
  // Blue header bar
  doc.setFillColor(...BLUE);
  doc.rect(0, 0, PW, 32, 'F');
  // Company name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...WHITE);
  doc.text("Heat-Calc", ML, 10);
  // Document title
  doc.setFontSize(16);
  doc.text(title, ML, 21);
  // Subtitle
  if (subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(subtitle, ML, 28);
  }
  // Date top right
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}`, PW - MR, 10, { align: 'right' });
  return 42; // return Y position after header
}

function addFooter(doc, pageNum = 1) {
  doc.setFillColor(...LGREY);
  doc.rect(0, PH - 14, PW, 14, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...GREY);
  doc.text("This document is generated for professional use. Retain for MCS compliance records.", ML, PH - 7);
  doc.text(`Page ${pageNum}`, PW - MR, PH - 7, { align: 'right' });
}

function sectionHeading(doc, text, y) {
  doc.setFillColor(...BLUE);
  doc.rect(ML, y, CW, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...WHITE);
  doc.text(text.toUpperCase(), ML + 3, y + 5);
  return y + 12;
}

function fieldLine(doc, label, y, value = '') {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...DARK);
  doc.text(label + ':', ML, y);
  // underline
  doc.setDrawColor(...LGREY);
  doc.setLineWidth(0.3);
  doc.line(ML + 48, y + 1, ML + CW, y + 1);
  if (value) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GREY);
    doc.text(value, ML + 50, y);
  }
  return y + 8;
}

function wideField(doc, label, y, lines = 1) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...DARK);
  doc.text(label + ':', ML, y);
  y += 3;
  doc.setDrawColor(...LGREY);
  doc.setLineWidth(0.3);
  for (let i = 0; i < lines; i++) {
    doc.line(ML, y + (i * 7), ML + CW, y + (i * 7));
  }
  return y + (lines * 7) + 3;
}

function checkRow(doc, label, y, checked = false) {
  doc.setDrawColor(...DARK);
  doc.setLineWidth(0.4);
  doc.rect(ML, y - 4, 4, 4, 'D');
  if (checked) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...GREEN);
    doc.text('✓', ML + 0.5, y - 0.8);
  }
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...DARK);
  doc.text(label, ML + 7, y - 0.5);
  return y + 7;
}

function signatureBlock(doc, label, y) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...GREY);
  doc.text(label, ML, y);
  y += 3;
  doc.setDrawColor(...DARK);
  doc.setLineWidth(0.3);
  doc.line(ML, y + 10, ML + 75, y + 10);
  doc.line(ML + 85, y + 10, ML + 145, y + 10);
  doc.setFontSize(7);
  doc.text('Signature', ML, y + 14);
  doc.text('Print Name', ML + 85, y + 14);
  doc.line(ML + 155, y + 10, ML + CW, y + 10);
  doc.text('Date', ML + 155, y + 14);
  return y + 22;
}

function divider(doc, y) {
  doc.setDrawColor(...LGREY);
  doc.setLineWidth(0.2);
  doc.line(ML, y, ML + CW, y);
  return y + 5;
}

function note(doc, text, y) {
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(...GREY);
  const lines = doc.splitTextToSize(text, CW);
  doc.text(lines, ML, y);
  return y + (lines.length * 4.5) + 2;
}

// ─── Document Templates ───────────────────────────────────────────────────────

function generateHeatPumpSurvey() {
  const doc = new jsPDF(); let y = addHeader(doc, 'Heat Pump Survey', 'Initial site survey and assessment for heat pump installation');
  y = sectionHeading(doc, 'Property & Customer Details', y);
  y = fieldLine(doc, 'Customer Name', y); y = fieldLine(doc, 'Property Address', y);
  y = fieldLine(doc, 'Postcode', y); y = fieldLine(doc, 'Contact Number', y);
  y = fieldLine(doc, 'Email Address', y); y = fieldLine(doc, 'Survey Date', y);
  y = fieldLine(doc, 'Surveyor Name', y); y += 4;
  y = sectionHeading(doc, 'Property Details', y);
  y = fieldLine(doc, 'Property Type', y); y = fieldLine(doc, 'Year Built', y);
  y = fieldLine(doc, 'Number of Bedrooms', y); y = fieldLine(doc, 'Floor Area (m²)', y);
  y = fieldLine(doc, 'Existing Heating', y); y += 4;
  y = sectionHeading(doc, 'Building Fabric', y);
  y = fieldLine(doc, 'Wall Construction', y); y = fieldLine(doc, 'Wall Insulation', y);
  y = fieldLine(doc, 'Loft Insulation (mm)', y); y = fieldLine(doc, 'Floor Type', y);
  y = fieldLine(doc, 'Glazing Type', y); y = fieldLine(doc, 'EPC Rating', y); y += 4;
  y = sectionHeading(doc, 'Heat Loss Assessment', y);
  y = fieldLine(doc, 'Design Room Temp (°C)', y); y = fieldLine(doc, 'Design Outside Temp (°C)', y);
  y = fieldLine(doc, 'Calculated Heat Loss (kW)', y); y = fieldLine(doc, 'Proposed Heat Pump Output (kW)', y); y += 4;
  y = sectionHeading(doc, 'Emitter Survey', y);
  y = fieldLine(doc, 'Existing Emitter Type', y); y = fieldLine(doc, 'Flow Temperature Required (°C)', y);
  y = fieldLine(doc, 'Emitter Upgrade Required?', y); y = wideField(doc, 'Emitter Upgrade Notes', y, 2); y += 2;
  y = sectionHeading(doc, 'Proposed System', y);
  y = fieldLine(doc, 'Heat Pump Manufacturer', y); y = fieldLine(doc, 'Heat Pump Model', y);
  y = fieldLine(doc, 'Cylinder Manufacturer', y); y = fieldLine(doc, 'Cylinder Model/Size', y); y += 4;
  y = sectionHeading(doc, 'Surveyor Sign-Off', y);
  y = signatureBlock(doc, 'Surveyor', y);
  addFooter(doc); return doc;
}

function generateMCSHandoverChecklist() {
  const doc = new jsPDF(); let y = addHeader(doc, 'MCS Handover Checklist', 'MCS required customer handover documentation');
  y = sectionHeading(doc, 'Installation Details', y);
  y = fieldLine(doc, 'Customer Name', y); y = fieldLine(doc, 'Property Address', y);
  y = fieldLine(doc, 'Installation Date', y); y = fieldLine(doc, 'MCS Certificate Number', y);
  y = fieldLine(doc, 'Installer Company', y); y = fieldLine(doc, 'MCS Installer Number', y); y += 4;
  y = sectionHeading(doc, 'Documents Provided to Customer', y);
  const handoverDocs = [
    'MCS Compliance Certificate', 'System operating instructions (manufacturer)', 'Installer contact details',
    'Heat Pump Handover Document', 'Warranty documentation', 'Service and maintenance schedule',
    'Thermodynamic performance calculation (MCS 031)', 'Building Regulations completion certificate',
    'Electrical Installation Certificate (BS 7671)', 'G99/G98 Connection Agreement (if applicable)'
  ];
  for (const d of handoverDocs) { y = checkRow(doc, d, y); }
  y += 4;
  y = sectionHeading(doc, 'Customer Training Provided', y);
  const training = [
    'System controls and thermostat operation explained', 'How to adjust hot water temperature',
    'How to reset if system fault occurs', 'When to call for service/maintenance',
    'How to read system performance data', 'Weather compensation settings explained'
  ];
  for (const t of training) { y = checkRow(doc, t, y); }
  y += 4;
  y = sectionHeading(doc, 'Sign-Off', y);
  y = note(doc, 'By signing below, the customer confirms they have received all documents listed above and received a full system handover.', y);
  y = signatureBlock(doc, 'Customer Signature', y);
  y = signatureBlock(doc, 'Installer Signature', y);
  addFooter(doc); return doc;
}

function generateLetterOfConsent() {
  const doc = new jsPDF(); let y = addHeader(doc, 'Letter of Consent', 'Customer consent for heat pump installation works');
  y += 4;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...DARK);
  const intro = "I/We, the undersigned, hereby consent to the installation of a heat pump system and associated works at the property address stated below. I understand the scope of works and agree to the terms as outlined in the customer proposal.";
  const lines = doc.splitTextToSize(intro, CW);
  doc.text(lines, ML, y); y += lines.length * 5 + 6;
  y = sectionHeading(doc, 'Property Details', y);
  y = fieldLine(doc, 'Property Owner(s)', y); y = fieldLine(doc, 'Property Address', y);
  y = fieldLine(doc, 'Postcode', y); y = fieldLine(doc, 'Date of Works', y); y += 4;
  y = sectionHeading(doc, 'Scope of Consented Works', y);
  const works = [
    'Supply and installation of air source heat pump unit (external)',
    'Supply and installation of hot water cylinder (internal)',
    'Connection to existing or new emitter circuit', 'Electrical connection and controls installation',
    'Any ancillary pipework and cabling required', 'Making good on completion of works'
  ];
  for (const w of works) { y = checkRow(doc, w, y); }
  y += 4;
  y = sectionHeading(doc, 'I Confirm I Have Been Informed Of', y);
  const informed = [
    'The 14-day cooling off period (Consumer Contracts Regulations 2013)',
    'My right to cancel within 14 days without charge',
    'The Microgeneration Certification Scheme (MCS) standards that apply',
    'Building Regulations notifications required (where applicable)',
    'Any required planning permissions for the installation'
  ];
  for (const i of informed) { y = checkRow(doc, i, y); }
  y += 4;
  y = sectionHeading(doc, 'Customer Consent', y);
  y = signatureBlock(doc, 'Customer', y);
  y = fieldLine(doc, 'Date', y);
  addFooter(doc); return doc;
}

function generateInstallationRecord() {
  const doc = new jsPDF(); let y = addHeader(doc, 'Installation Record', 'Full record of heat pump installation works');
  y = sectionHeading(doc, 'Job Details', y);
  y = fieldLine(doc, 'Job Reference', y); y = fieldLine(doc, 'Customer Name', y);
  y = fieldLine(doc, 'Site Address', y); y = fieldLine(doc, 'Installation Date(s)', y);
  y = fieldLine(doc, 'Lead Engineer', y); y = fieldLine(doc, 'Assistant Engineer', y); y += 4;
  y = sectionHeading(doc, 'Equipment Installed', y);
  y = fieldLine(doc, 'Heat Pump Manufacturer', y); y = fieldLine(doc, 'Heat Pump Model', y);
  y = fieldLine(doc, 'Heat Pump Serial No.', y); y = fieldLine(doc, 'Rated Output (kW)', y);
  y = fieldLine(doc, 'Cylinder Manufacturer', y); y = fieldLine(doc, 'Cylinder Model', y);
  y = fieldLine(doc, 'Cylinder Serial No.', y); y = fieldLine(doc, 'Cylinder Capacity (L)', y);
  y = fieldLine(doc, 'Controls Manufacturer', y); y = fieldLine(doc, 'Controls Model', y); y += 4;
  y = sectionHeading(doc, 'Refrigerant Details', y);
  y = fieldLine(doc, 'Refrigerant Type', y); y = fieldLine(doc, 'GWP', y);
  y = fieldLine(doc, 'Charge Added (kg)', y); y = fieldLine(doc, 'F-Gas Certificate No.', y); y += 4;
  y = sectionHeading(doc, 'System Commissioning Values', y);
  y = fieldLine(doc, 'Flow Temperature Set Point (°C)', y); y = fieldLine(doc, 'Return Temperature (°C)', y);
  y = fieldLine(doc, 'Flow Rate (L/min)', y); y = fieldLine(doc, 'System Pressure (bar)', y);
  y = fieldLine(doc, 'Cylinder Thermostat Set Point (°C)', y); y += 4;
  y = sectionHeading(doc, 'Sign-Off', y);
  y = signatureBlock(doc, 'Lead Engineer', y);
  addFooter(doc); return doc;
}

function generateBS7671() {
  const doc = new jsPDF(); let y = addHeader(doc, 'Electrical Installation Certificate', 'BS 7671 – IET Wiring Regulations 18th Edition');
  y = sectionHeading(doc, 'Contractor Details', y);
  y = fieldLine(doc, 'Company Name', y); y = fieldLine(doc, 'Address', y);
  y = fieldLine(doc, 'Telephone', y); y = fieldLine(doc, 'NICEIC / NAPIT Number', y); y += 4;
  y = sectionHeading(doc, 'Installation Details', y);
  y = fieldLine(doc, 'Client Name', y); y = fieldLine(doc, 'Installation Address', y);
  y = fieldLine(doc, 'Description of Installation', y);
  y = fieldLine(doc, 'Date of Installation', y); y = fieldLine(doc, 'Date of Inspection', y); y += 4;
  y = sectionHeading(doc, 'Supply Characteristics', y);
  y = fieldLine(doc, 'System Type (TN-C-S / TN-S / TT)', y); y = fieldLine(doc, 'Nominal Voltage (V)', y);
  y = fieldLine(doc, 'Frequency (Hz)', y); y = fieldLine(doc, 'Prospective Fault Current (kA)', y); y += 4;
  y = sectionHeading(doc, 'Circuit Details', y);
  y = fieldLine(doc, 'Circuit Description', y); y = fieldLine(doc, 'Circuit Reference', y);
  y = fieldLine(doc, 'Wiring System', y); y = fieldLine(doc, 'Cable Size (mm²)', y);
  y = fieldLine(doc, 'Overcurrent Device Type', y); y = fieldLine(doc, 'Overcurrent Device Rating (A)', y);
  y = fieldLine(doc, 'RCD Type', y); y = fieldLine(doc, 'RCD Rating (mA)', y); y += 4;
  y = sectionHeading(doc, 'Test Results', y);
  y = fieldLine(doc, 'Insulation Resistance (MΩ)', y); y = fieldLine(doc, 'Continuity of Protective Conductors (Ω)', y);
  y = fieldLine(doc, 'Earth Fault Loop Impedance (Ω)', y); y = fieldLine(doc, 'RCD Test Time (ms)', y); y += 4;
  y = sectionHeading(doc, 'Declaration', y);
  y = note(doc, 'I being the person responsible for the design, construction, inspection and testing of the electrical installation, particulars of which are described above, CERTIFY that the said electrical installation has been designed, constructed, inspected and tested in accordance with BS 7671.', y);
  y = signatureBlock(doc, 'Responsible Person', y);
  addFooter(doc); return doc;
}

function generateCoolingOffWaiver() {
  const doc = new jsPDF(); let y = addHeader(doc, 'Cooling Off Period Waiver', 'Consumer Contracts Regulations 2013 – Request to Begin Works');
  y += 4;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...DARK);
  const body = "Under the Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013, you have the right to cancel this contract within 14 days without giving any reason. By signing this waiver, you are requesting that we begin work before the 14-day cancellation period has expired and acknowledge that if you subsequently cancel, you may be required to pay for services already provided.";
  doc.text(doc.splitTextToSize(body, CW), ML, y); y += 28;
  y = sectionHeading(doc, 'Customer Details', y);
  y = fieldLine(doc, 'Customer Full Name', y); y = fieldLine(doc, 'Property Address', y);
  y = fieldLine(doc, 'Contract Reference', y); y = fieldLine(doc, 'Proposed Start Date', y); y += 4;
  y = sectionHeading(doc, 'Customer Declaration', y);
  const decl = [
    'I have been informed of my 14-day right to cancel this contract',
    'I understand that by signing this waiver I am requesting immediate commencement of works',
    'I understand that cancelling after works begin may result in charges for work completed',
    'I confirm I am the property owner or have authority to consent to the works'
  ];
  for (const d of decl) { y = checkRow(doc, d, y); }
  y += 6;
  y = sectionHeading(doc, 'Signature', y);
  y = signatureBlock(doc, 'Customer', y);
  y = fieldLine(doc, 'Date of Waiver', y);
  addFooter(doc); return doc;
}

function generateMCS031() {
  const doc = new jsPDF(); let y = addHeader(doc, 'MCS 031 Performance Calculation', 'Heat Pump System Energy Performance Assessment');
  y = sectionHeading(doc, 'Project Details', y);
  y = fieldLine(doc, 'Customer Name', y); y = fieldLine(doc, 'Property Address', y);
  y = fieldLine(doc, 'MCS Installer Reference', y); y = fieldLine(doc, 'Calculation Date', y); y += 4;
  y = sectionHeading(doc, 'Heat Loss Calculation', y);
  y = fieldLine(doc, 'Design Outside Temperature (°C)', y); y = fieldLine(doc, 'Design Inside Temperature (°C)', y);
  y = fieldLine(doc, 'Total Fabric Heat Loss (W)', y); y = fieldLine(doc, 'Total Ventilation Heat Loss (W)', y);
  y = fieldLine(doc, 'Total Design Heat Loss (W)', y); y = fieldLine(doc, 'Heat Loss per m² (W/m²)', y); y += 4;
  y = sectionHeading(doc, 'System Design', y);
  y = fieldLine(doc, 'Heat Pump Manufacturer & Model', y); y = fieldLine(doc, 'Rated Output at -3°C (kW)', y);
  y = fieldLine(doc, 'Rated COP at -3°C', y); y = fieldLine(doc, 'Design Flow Temperature (°C)', y);
  y = fieldLine(doc, 'SCOP (Seasonal COP)', y); y = fieldLine(doc, 'Emitter Type', y); y += 4;
  y = sectionHeading(doc, 'Annual Energy Calculation', y);
  y = fieldLine(doc, 'Annual Space Heating Demand (kWh)', y); y = fieldLine(doc, 'Annual Hot Water Demand (kWh)', y);
  y = fieldLine(doc, 'Total Annual Heat Demand (kWh)', y); y = fieldLine(doc, 'Estimated Annual Electricity (kWh)', y);
  y = fieldLine(doc, 'Annual Running Cost (£)', y); y = fieldLine(doc, 'CO₂ Emissions (kgCO₂e/yr)', y); y += 4;
  y = sectionHeading(doc, 'RHI / BUS Eligibility', y);
  y = checkRow(doc, 'System meets MCS 007 design requirements'); y = checkRow(doc, 'SCOP ≥ 2.5 (minimum for BUS grant)');
  y = checkRow(doc, 'Property has EPC rating D or above (for BUS)'); y = checkRow(doc, 'Heat loss calculation completed to MCS 003');
  y += 4;
  y = sectionHeading(doc, 'Assessor Sign-Off', y);
  y = signatureBlock(doc, 'Qualified Assessor', y);
  addFooter(doc); return doc;
}

function generateMCSCertificate() {
  const doc = new jsPDF(); let y = addHeader(doc, 'MCS Compliance Certificate', 'Microgeneration Certification Scheme – Installation Certificate');
  y += 6;
  doc.setFillColor(...BLUE); doc.setTextColor(...WHITE); doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
  doc.rect(ML, y, CW, 12, 'F'); doc.text('MICROGENERATION CERTIFICATION SCHEME', PW / 2, y + 8, { align: 'center' });
  y += 18;
  y = sectionHeading(doc, 'Certificate Details', y);
  y = fieldLine(doc, 'Certificate Number', y); y = fieldLine(doc, 'Date of Issue', y);
  y = fieldLine(doc, 'Technology Type', y, 'Air Source Heat Pump (ASHP)');
  y = fieldLine(doc, 'MCS Installer Reference', y); y += 4;
  y = sectionHeading(doc, 'Property & Customer', y);
  y = fieldLine(doc, 'Customer Name', y); y = fieldLine(doc, 'Installation Address', y);
  y = fieldLine(doc, 'Postcode', y); y += 4;
  y = sectionHeading(doc, 'System Installed', y);
  y = fieldLine(doc, 'Heat Pump Manufacturer', y); y = fieldLine(doc, 'Heat Pump Model', y);
  y = fieldLine(doc, 'MCS Product Certificate No.', y); y = fieldLine(doc, 'Rated Output (kW)', y);
  y = fieldLine(doc, 'Rated COP', y); y = fieldLine(doc, 'Date of Commissioning', y); y += 4;
  y = sectionHeading(doc, 'Compliance Confirmation', y);
  const items = [
    'Installed in accordance with MCS 007 heat pump standard',
    'Heat loss calculation completed in accordance with MCS 003',
    'System commissioned and performance verified',
    'All relevant building regulations notified',
    'Customer handover completed'
  ];
  for (const i of items) { y = checkRow(doc, i, y, true); }
  y += 4;
  y = sectionHeading(doc, 'Authorised Signatory', y);
  y = signatureBlock(doc, 'MCS Certified Installer', y);
  addFooter(doc); return doc;
}

function generateCustomerProposal() {
  const doc = new jsPDF(); let y = addHeader(doc, 'Customer Proposal', 'Heat Pump System – System Specification and Pricing');
  y = sectionHeading(doc, 'Proposal Details', y);
  y = fieldLine(doc, 'Proposal Reference', y); y = fieldLine(doc, 'Proposal Date', y);
  y = fieldLine(doc, 'Valid Until', y); y = fieldLine(doc, 'Prepared By', y); y += 4;
  y = sectionHeading(doc, 'Customer Details', y);
  y = fieldLine(doc, 'Customer Name', y); y = fieldLine(doc, 'Address', y);
  y = fieldLine(doc, 'Email', y); y = fieldLine(doc, 'Telephone', y); y += 4;
  y = sectionHeading(doc, 'Proposed System', y);
  y = fieldLine(doc, 'Heat Pump Model', y); y = fieldLine(doc, 'Heat Pump Output (kW)', y);
  y = fieldLine(doc, 'Cylinder Model', y); y = fieldLine(doc, 'Cylinder Capacity (L)', y);
  y = fieldLine(doc, 'Controls / Thermostat', y); y = wideField(doc, 'Additional Works Included', y, 2); y += 2;
  y = sectionHeading(doc, 'Pricing', y);
  y = fieldLine(doc, 'Equipment Supply', y); y = fieldLine(doc, 'Labour & Installation', y);
  y = fieldLine(doc, 'Additional Works', y); y = divider(doc, y);
  y = fieldLine(doc, 'Sub-Total (ex VAT)', y); y = fieldLine(doc, 'VAT (5%)', y);
  y = fieldLine(doc, 'BUS Grant Deduction', y); y = fieldLine(doc, 'TOTAL (inc VAT)', y); y += 4;
  y = sectionHeading(doc, 'Customer Acceptance', y);
  y = note(doc, 'By signing below, the customer accepts this proposal and authorises works to proceed subject to survey confirmation.', y);
  y = signatureBlock(doc, 'Customer', y);
  addFooter(doc); return doc;
}

function generateTechnicalReport() {
  const doc = new jsPDF(); let y = addHeader(doc, 'Technical Report', 'Heat Pump System – Technical Design Report');
  y = sectionHeading(doc, 'Project Overview', y);
  y = fieldLine(doc, 'Project Reference', y); y = fieldLine(doc, 'Customer Name', y);
  y = fieldLine(doc, 'Site Address', y); y = fieldLine(doc, 'Report Date', y);
  y = fieldLine(doc, 'Report Author', y); y += 4;
  y = sectionHeading(doc, 'Building Fabric Assessment', y);
  y = fieldLine(doc, 'Property Type', y); y = fieldLine(doc, 'Floor Area (m²)', y);
  y = fieldLine(doc, 'Wall U-Value (W/m²K)', y); y = fieldLine(doc, 'Roof U-Value (W/m²K)', y);
  y = fieldLine(doc, 'Floor U-Value (W/m²K)', y); y = fieldLine(doc, 'Window U-Value (W/m²K)', y); y += 4;
  y = sectionHeading(doc, 'Heat Loss Summary', y);
  y = fieldLine(doc, 'Design Outside Temperature (°C)', y); y = fieldLine(doc, 'Design Inside Temperature (°C)', y);
  y = fieldLine(doc, 'Total Heat Loss (kW)', y); y = wideField(doc, 'Room-by-Room Breakdown', y, 4); y += 2;
  y = sectionHeading(doc, 'System Selection Justification', y);
  y = wideField(doc, 'Reason for Selected Heat Pump Model', y, 2); y += 2;
  y = wideField(doc, 'Emitter Suitability Assessment', y, 2); y += 2;
  y = sectionHeading(doc, 'Recommendations', y);
  y = wideField(doc, 'Fabric Improvements Recommended', y, 2); y += 2;
  y = wideField(doc, 'Emitter Upgrades Recommended', y, 2); y += 4;
  y = sectionHeading(doc, 'Author Sign-Off', y);
  y = signatureBlock(doc, 'Report Author', y);
  addFooter(doc); return doc;
}

function generateHandoverDocument() {
  const doc = new jsPDF(); let y = addHeader(doc, 'Heat Pump Handover Document', 'Customer system guide and handover record');
  y = sectionHeading(doc, 'Your System Details', y);
  y = fieldLine(doc, 'Heat Pump Model', y); y = fieldLine(doc, 'Installation Date', y);
  y = fieldLine(doc, 'Installer Company', y); y = fieldLine(doc, 'Installer Contact', y);
  y = fieldLine(doc, 'Service Due Date', y); y += 4;
  y = sectionHeading(doc, 'Operating Instructions – Summary', y);
  const ops = [
    'Set your room thermostat to your desired temperature (recommended 18–21°C)',
    'Use weather compensation – the system adjusts automatically in cold weather',
    'Run the system continuously for best efficiency – avoid on/off cycling',
    'Hot water set to 60°C for legionella compliance (weekly pasteurisation cycle)',
    'Do not turn the system off completely during cold weather',
    'Monitor your smart meter to track energy consumption'
  ];
  for (const o of ops) { y = checkRow(doc, o, y, true); }
  y += 4;
  y = sectionHeading(doc, 'Maintenance Schedule', y);
  y = fieldLine(doc, 'Annual Service (by Installer)', y); y = fieldLine(doc, 'Filter Check (Monthly)', y);
  y = fieldLine(doc, 'System Pressure Check (Monthly)', y); y = fieldLine(doc, 'Warranty Period', y); y += 4;
  y = sectionHeading(doc, 'Fault Guidance', y);
  y = wideField(doc, 'If system shows fault code – action to take', y, 2); y += 2;
  y = fieldLine(doc, 'Emergency Contact Number', y); y += 4;
  y = sectionHeading(doc, 'Handover Confirmation', y);
  y = note(doc, 'I confirm I have received a full system handover, operating instructions and all relevant documentation.', y);
  y = signatureBlock(doc, 'Customer', y);
  addFooter(doc); return doc;
}

function generateCommissioningChecklist() {
  const doc = new jsPDF(); let y = addHeader(doc, 'Heat Pump Commissioning Checklist', 'On-site commissioning verification');
  y = sectionHeading(doc, 'Installation Details', y);
  y = fieldLine(doc, 'Job Reference', y); y = fieldLine(doc, 'Customer Address', y);
  y = fieldLine(doc, 'Date of Commissioning', y); y = fieldLine(doc, 'Commissioning Engineer', y); y += 4;
  y = sectionHeading(doc, 'Pre-Commissioning Checks', y);
  const pre = ['All pipework pressure tested and found satisfactory', 'System flushed and cleaned (MagnaCleanse or similar)',
    'Inhibitor added at correct dosage', 'All electrical connections checked and secure',
    'Refrigerant circuit intact – no signs of leakage', 'Outdoor unit positioned correctly with correct clearances'];
  for (const p of pre) { y = checkRow(doc, p, y); }
  y += 4;
  y = sectionHeading(doc, 'Commissioning Values', y);
  y = fieldLine(doc, 'Flow Temperature (°C)', y); y = fieldLine(doc, 'Return Temperature (°C)', y);
  y = fieldLine(doc, 'Flow Rate (L/min)', y); y = fieldLine(doc, 'System Pressure (bar)', y);
  y = fieldLine(doc, 'COP Measured', y); y = fieldLine(doc, 'Cylinder Temperature Reached (°C)', y); y += 4;
  y = sectionHeading(doc, 'Post-Commissioning Checks', y);
  const post = ['Controls programmed and weather compensation set', 'Hot water pasteurisation cycle verified',
    'All zone valves operating correctly', 'Expansion vessel pressure checked',
    'Customer handover completed', 'All documentation provided to customer',
    'MCS notification submitted'];
  for (const p of post) { y = checkRow(doc, p, y); }
  y += 4;
  y = sectionHeading(doc, 'Engineer Sign-Off', y);
  y = signatureBlock(doc, 'Commissioning Engineer', y);
  addFooter(doc); return doc;
}

function generateServiceRecord() {
  const doc = new jsPDF(); let y = addHeader(doc, 'Heat Pump Service Record', 'Annual service and maintenance log');
  y = sectionHeading(doc, 'System Details', y);
  y = fieldLine(doc, 'Customer Name', y); y = fieldLine(doc, 'Address', y);
  y = fieldLine(doc, 'Heat Pump Manufacturer & Model', y); y = fieldLine(doc, 'Serial Number', y); y += 4;
  for (let visit = 1; visit <= 3; visit++) {
    y = sectionHeading(doc, `Service Visit ${visit}`, y);
    y = fieldLine(doc, 'Date', y); y = fieldLine(doc, 'Engineer Name', y);
    y = fieldLine(doc, 'Mileage/Hours Reading', y);
    const checks = ['Filters cleaned / replaced', 'Refrigerant pressure checked', 'Electrical connections checked',
      'Flow & return temperatures recorded', 'System pressure checked and topped up if required',
      'Controls operation verified', 'Inhibitor concentration tested'];
    for (const c of checks) { y = checkRow(doc, c, y); }
    y = wideField(doc, 'Notes / Remedial Actions', y, 2);
    y = signatureBlock(doc, 'Service Engineer', y);
    if (visit < 3) y = divider(doc, y);
  }
  addFooter(doc); return doc;
}

function generateENAConnectDirect() {
  const doc = new jsPDF(); let y = addHeader(doc, 'ENA Connect Direct Application', 'G99 / G98 DNO Connection Application');
  y = sectionHeading(doc, 'Applicant Details', y);
  y = fieldLine(doc, 'Company Name', y); y = fieldLine(doc, 'Contact Name', y);
  y = fieldLine(doc, 'Email', y); y = fieldLine(doc, 'Telephone', y);
  y = fieldLine(doc, 'MCS Number', y); y += 4;
  y = sectionHeading(doc, 'Installation Address', y);
  y = fieldLine(doc, 'Address', y); y = fieldLine(doc, 'Postcode', y);
  y = fieldLine(doc, 'MPAN Number', y); y = fieldLine(doc, 'DNO', y); y += 4;
  y = sectionHeading(doc, 'Equipment Details', y);
  y = fieldLine(doc, 'Technology Type', y, 'Air Source Heat Pump'); y = fieldLine(doc, 'Manufacturer & Model', y);
  y = fieldLine(doc, 'Total Rated kW', y); y = fieldLine(doc, 'Connection Voltage', y, '230V / Single Phase');
  y = fieldLine(doc, 'G98 or G99 Application', y); y = fieldLine(doc, 'Proposed Connection Date', y); y += 4;
  y = sectionHeading(doc, 'G98 Self-Certification (≤3.68kW per phase)', y);
  const g98 = ['Equipment on DNO accepted product list', 'Install complies with G98 technical requirements',
    'Protection settings match G98 Appendix A', 'Commissioning test completed'];
  for (const g of g98) { y = checkRow(doc, g, y); }
  y += 4;
  y = sectionHeading(doc, 'Declaration', y);
  y = note(doc, 'I declare that the installation described above complies with the requirements of Engineering Recommendation G98/G99 and the appropriate technical requirements.', y);
  y = signatureBlock(doc, 'Authorised Signatory', y);
  addFooter(doc); return doc;
}

function generateDNOCommissioningForm() {
  const doc = new jsPDF(); let y = addHeader(doc, 'DNO Commissioning Form', 'Distribution Network Operator – Commissioning Notification');
  y = sectionHeading(doc, 'Installer Details', y);
  y = fieldLine(doc, 'Company Name', y); y = fieldLine(doc, 'Contact Name', y);
  y = fieldLine(doc, 'Address', y); y = fieldLine(doc, 'Email', y);
  y = fieldLine(doc, 'Telephone', y); y = fieldLine(doc, 'MCS Number', y); y += 4;
  y = sectionHeading(doc, 'Site Details', y);
  y = fieldLine(doc, 'Site Address', y); y = fieldLine(doc, 'Postcode', y);
  y = fieldLine(doc, 'MPAN', y); y = fieldLine(doc, 'DNO Name', y); y += 4;
  y = sectionHeading(doc, 'Equipment Details', y);
  y = fieldLine(doc, 'Equipment Type', y, 'Air Source Heat Pump');
  y = fieldLine(doc, 'Manufacturer', y); y = fieldLine(doc, 'Model Number', y);
  y = fieldLine(doc, 'Rated Output (kW)', y); y = fieldLine(doc, 'Supply Voltage', y);
  y = fieldLine(doc, 'Number of Phases', y); y = fieldLine(doc, 'Max Import Current (A)', y); y += 4;
  y = sectionHeading(doc, 'Application Type', y);
  y = checkRow(doc, 'G98 Self-Certification (≤3.68 kW per phase)', y);
  y = checkRow(doc, 'G99 Full Application (>3.68 kW per phase)', y);
  y = checkRow(doc, 'Load Connection Only (no generation)', y); y += 4;
  y = sectionHeading(doc, 'Commissioning Confirmation', y);
  const conf = ['Equipment installed and commissioned to manufacturer specification',
    'Protection settings configured in accordance with G98/G99', 'All required testing completed',
    'Documentation available for DNO inspection'];
  for (const c of conf) { y = checkRow(doc, c, y); }
  y += 4;
  y = sectionHeading(doc, 'Authorised Signature', y);
  y = signatureBlock(doc, 'Commissioning Engineer', y);
  addFooter(doc); return doc;
}

// ─── Generator Map ────────────────────────────────────────────────────────────
const GENERATORS = {
  'hp-survey':          { fn: generateHeatPumpSurvey,       filename: 'Heat-Pump-Survey.pdf'                },
  'mcs-handover':       { fn: generateMCSHandoverChecklist,  filename: 'MCS-Handover-Checklist.pdf'          },
  'letter-consent':     { fn: generateLetterOfConsent,       filename: 'Letter-of-Consent.pdf'               },
  'installation-record':{ fn: generateInstallationRecord,    filename: 'Installation-Record.pdf'             },
  'bs7671':             { fn: generateBS7671,                filename: 'BS7671-Electrical-Certificate.pdf'   },
  'cooling-waiver':     { fn: generateCoolingOffWaiver,      filename: 'Cooling-Off-Waiver.pdf'              },
  'mcs-031':            { fn: generateMCS031,                filename: 'MCS-031-Performance-Calculation.pdf' },
  'mcs-cert':           { fn: generateMCSCertificate,        filename: 'MCS-Compliance-Certificate.pdf'      },
  'proposal':           { fn: generateCustomerProposal,      filename: 'Customer-Proposal.pdf'               },
  'tech-report':        { fn: generateTechnicalReport,       filename: 'Technical-Report.pdf'                },
  'handover':           { fn: generateHandoverDocument,      filename: 'Heat-Pump-Handover-Document.pdf'     },
  'commissioning':      { fn: generateCommissioningChecklist,filename: 'Heat-Pump-Commissioning-Checklist.pdf'},
  'service-record':     { fn: generateServiceRecord,         filename: 'Heat-Pump-Service-Record.pdf'        },
  'ena-connect':        { fn: generateENAConnectDirect,      filename: 'ENA-Connect-Direct-Application.pdf'  },
  'dno-form':           { fn: generateDNOCommissioningForm,  filename: 'DNO-Commissioning-Form.pdf'          },
};

/**
 * Generate and download a PDF by document ID.
 * @param {string} docId  - matches key in GENERATORS
 */
export function downloadDocument(docId) {
  const entry = GENERATORS[docId];
  if (!entry) { console.error('No template for', docId); return; }
  const doc = entry.fn();
  doc.save(entry.filename);
}

/**
 * Open a PDF in a new browser tab (for preview).
 */
export function previewDocument(docId) {
  const entry = GENERATORS[docId];
  if (!entry) return;
  const doc = entry.fn();
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}

export { GENERATORS };
