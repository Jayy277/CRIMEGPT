import os
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags
from django.conf import settings
from django.utils import timezone

def get_html_template(fir_number, event_title, description, next_steps, status, date_str, station_name, officer_name):
  # Premium Government-Grade Crime Intelligence dark themed email template
  portal_url = "http://localhost:3000/citizen/login"
  
  html = f"""
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CrimePilot AI Notification</title>
    <style>
      body {{
        background-color: #0B1220;
        margin: 0;
        padding: 0;
        font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        color: #FFFFFF;
      }}
      .email-container {{
        max-width: 600px;
        margin: 0 auto;
        background-color: #121B2D;
        border: 1px solid rgba(0, 217, 255, 0.2);
        border-radius: 8px;
        overflow: hidden;
        margin-top: 20px;
        margin-bottom: 20px;
        box-shadow: 0 4px 20px rgba(0, 217, 255, 0.1);
      }}
      .header {{
        background-color: #0B1220;
        padding: 24px;
        text-align: center;
        border-bottom: 2px solid #00D9FF;
      }}
      .header h1 {{
        color: #00D9FF;
        margin: 0;
        font-size: 24px;
        letter-spacing: 2px;
        font-weight: 700;
      }}
      .header p {{
        color: #9AA4B2;
        margin: 4px 0 0 0;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 1.5px;
      }}
      .banner {{
        background: linear-gradient(135deg, rgba(0, 217, 255, 0.1) 0%, rgba(0, 0, 0, 0) 100%);
        padding: 20px 24px;
        border-bottom: 1px solid rgba(0, 217, 255, 0.1);
      }}
      .banner-title {{
        color: #FFFFFF;
        font-size: 18px;
        font-weight: 600;
        margin: 0;
      }}
      .banner-subtitle {{
        color: #00D9FF;
        font-size: 13px;
        font-weight: bold;
        margin: 5px 0 0 0;
        text-transform: uppercase;
      }}
      .content {{
        padding: 24px;
      }}
      .description {{
        color: #E2E8F0;
        font-size: 14px;
        line-height: 1.6;
        margin-bottom: 24px;
      }}
      .details-table {{
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 24px;
        background-color: rgba(11, 18, 32, 0.5);
        border-radius: 6px;
        overflow: hidden;
      }}
      .details-table td {{
        padding: 12px 16px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        font-size: 13px;
      }}
      .details-table td.label {{
        color: #9AA4B2;
        font-weight: bold;
        width: 35%;
      }}
      .details-table td.value {{
        color: #FFFFFF;
      }}
      .next-steps-box {{
        background-color: rgba(0, 217, 255, 0.05);
        border-left: 3px solid #00D9FF;
        padding: 16px;
        border-radius: 0 6px 6px 0;
        margin-bottom: 28px;
      }}
      .next-steps-title {{
        color: #00D9FF;
        font-size: 13px;
        font-weight: bold;
        text-transform: uppercase;
        margin-top: 0;
        margin-bottom: 8px;
      }}
      .next-steps-content {{
        color: #E2E8F0;
        font-size: 13px;
        line-height: 1.5;
        margin: 0;
      }}
      .btn-container {{
        text-align: center;
        margin-bottom: 28px;
      }}
      .btn {{
        display: inline-block;
        background-color: #00D9FF;
        color: #0B1220 !important;
        text-decoration: none;
        padding: 12px 28px;
        font-size: 14px;
        font-weight: bold;
        border-radius: 4px;
        transition: background-color 0.3s;
        text-transform: uppercase;
        letter-spacing: 1px;
        box-shadow: 0 4px 12px rgba(0, 217, 255, 0.2);
      }}
      .footer {{
        background-color: #0B1220;
        padding: 20px;
        text-align: center;
        border-top: 1px solid rgba(0, 217, 255, 0.1);
        font-size: 11px;
        color: #9AA4B2;
        line-height: 1.5;
      }}
      .footer p {{
        margin: 4px 0;
      }}
      .footer-disclaimer {{
        color: #64748B;
        font-size: 9px;
        margin-top: 12px !important;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }}
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="header">
        <h1>CRIMEPILOT AI</h1>
        <p>National Crime Intelligence Command Platform</p>
      </div>
      <div class="banner">
        <h2 class="banner-title">{event_title}</h2>
        <p class="banner-subtitle">Case Dossier Alert</p>
      </div>
      <div class="content">
        <p class="description">{description}</p>
        
        <table class="details-table">
          <tr>
            <td class="label">FIR Reference</td>
            <td class="value" style="font-family: monospace; font-weight: bold; color: #00D9FF;">{fir_number}</td>
          </tr>
          <tr>
            <td class="label">Current Status</td>
            <td class="value" style="font-weight: 600;">{status}</td>
          </tr>
          <tr>
            <td class="label">Date & Time</td>
            <td class="value">{date_str}</td>
          </tr>
          <tr>
            <td class="label">Police Station</td>
            <td class="value">{station_name}</td>
          </tr>
          <tr>
            <td class="label">Assigned Officer</td>
            <td class="value">{officer_name}</td>
          </tr>
        </table>
        
        <div class="next-steps-box">
          <h3 class="next-steps-title">Recommended Next Steps</h3>
          <p class="next-steps-content">{next_steps}</p>
        </div>
        
        <div class="btn-container">
          <a href="{portal_url}" class="btn" target="_blank">Access Citizen Portal</a>
        </div>
      </div>
      <div class="footer">
        <p>&copy; 2026 CrimePilot Command Center. All Rights Reserved.</p>
        <p>This is an automated dispatch from an authorized national law enforcement infrastructure.</p>
        <p class="footer-disclaimer">CONFIDENTIALITY NOTICE: This transmission is intended solely for the registered citizen associated with this dossier. Unauthorized interception or reading is strictly prohibited by law.</p>
      </div>
    </div>
  </body>
  </html>
  """
  return html

def send_case_progression_email(crime, event_type, extra_details=None):
  if not crime.citizen or not crime.citizen.user or not crime.citizen.user.email:
    print(f"Skipping email progression dispatch for Case {crime.crime_id}: No citizen or email attached.")
    return False

  # Determine context details
  fir_number = crime.crime_id
  status = crime.status
  date_str = timezone.now().strftime("%Y-%m-%d %H:%M:%S UTC")
  
  station_name = "N/A"
  if crime.location:
    station_name = f"{crime.location.police_station}, {crime.location.city} ({crime.location.state})"

  officer_name = "Assigned Personnel (Under Review)"
  if crime.officer and crime.officer.user:
    officer_name = f"Inspector {crime.officer.user.name} (Badge: {crime.officer.badge_no})"

  # Set subject, description, title, and next steps based on the event_type
  subject = f"CrimePilot AI Notification — {fir_number}"
  
  if event_type == "FIR Submitted":
    subject = f"FIR {fir_number} Submitted Successfully - CrimePilot AI"
    event_title = "FIR SUBMISSION CONFIRMED"
    description = "Your digital First Information Report (FIR) has been successfully submitted and indexed in the national database. An investigating officer has been assigned to lead the case."
    next_steps = "Please await contact from the assigned officer. You can track this case live in the Citizen Portal."
    
  elif event_type == "Police Station Assigned":
    subject = f"Case {fir_number} Station Jurisdiction Assigned - CrimePilot AI"
    event_title = "JURISDICTION / STATION ASSIGNED"
    description = f"Your case has been officially assigned to the local precinct station: {crime.location.police_station if crime.location else 'N/A'}. The local jurisdiction is now handling the physical investigation and security patrol."
    next_steps = "All subsequent evidence collection or statement filing will be managed by this station."

  elif event_type == "Officer Assigned":
    subject = f"Investigating Officer Assigned to Case {fir_number} - CrimePilot AI"
    event_title = "INVESTIGATING OFFICER ASSIGNED"
    description = f"An investigating officer has been officially assigned to lead the inquiry of your case: {officer_name}."
    next_steps = "The officer will contact you if additional details or statements are required. You may upload evidence files to the portal."

  elif event_type == "Investigation Started":
    subject = f"Investigation Initiated for Case {fir_number} - CrimePilot AI"
    event_title = "ACTIVE INVESTIGATION INITIATED"
    description = "The assigned field agents have officially launched the active investigation phase. Forensic reports, background checks, and details validation are underway."
    next_steps = "No immediate action is required from your end. Real-time timeline logs are viewable via the dashboard."

  elif event_type == "Status Changed":
    subject = f"Case Status Update: {fir_number} - CrimePilot AI"
    event_title = "CASE PROGRESSION REGISTERED"
    description = f"The status of your case has progressed. The active case status is now set to: '{status}'."
    next_steps = "Visit your tracking dashboard for the full investigation notes and details."

  elif event_type == "Evidence Requested":
    subject = f"Urgent: Additional Evidence Requested for Case {fir_number} - CrimePilot AI"
    event_title = "EVIDENCE COLLECTION REQUEST"
    description = "The assigned investigating officer has requested additional supporting documents or media files to strengthen your case record."
    if extra_details:
      description += f" Specific Request: \"{extra_details}\""
    next_steps = "Please log in to the Citizen Portal and upload the requested evidence files under the 'Evidence Vault' section."

  elif event_type == "Evidence Received":
    subject = f"Evidence Logged Successfully for Case {fir_number} - CrimePilot AI"
    event_title = "ADDITIONAL EVIDENCE RECEIVED"
    description = "Your submitted evidence file has been successfully received, encrypted, and registered in the case evidence index vault."
    next_steps = "The investigating officer will review the metadata and verify its validity."

  elif event_type == "Analyst Review Started":
    subject = f"Intelligence Analyst Assigned to Case {fir_number} - CrimePilot AI"
    event_title = "INTELLIGENCE ANALYST REVIEW STARTED"
    description = "A digital crime intelligence analyst has started compiling data-driven reports, hotspot profiling, and threat-pattern matching on your case."
    next_steps = "This review runs in parallel with the officer's field investigation to provide AI-powered insights."

  elif event_type == "Case Solved":
    subject = f"RESOLUTION CONFIRMED: Case {fir_number} Solved - CrimePilot AI"
    event_title = "CASE DECLARED SOLVED"
    description = "We are pleased to inform you that the investigation of your case has been completed. The suspect has been identified/apprehended and the chargesheet compiled."
    next_steps = "A digital report of compilation details is available for download on the tracking page."

  elif event_type == "Case Closed":
    subject = f"ARCHIVE NOTICE: Case {fir_number} Closed - CrimePilot AI"
    event_title = "CASE DECLARED CLOSED"
    description = "Your case has been officially closed and archived in the central platform repository."
    next_steps = "For any queries or reopening requests, please contact the command center."

  else:
    event_title = "CASE DOSSIER UPDATE"
    description = f"Your case dossier has been updated. Event category: {event_type}."
    next_steps = "Please check the Citizen Portal for more details."

  # Generate HTML Content
  html_content = get_html_template(
    fir_number=fir_number,
    event_title=event_title,
    description=description,
    next_steps=next_steps,
    status=status,
    date_str=date_str,
    station_name=station_name,
    officer_name=officer_name
  )
  
  text_content = strip_tags(html_content)

  try:
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'crimepilot111@gmail.com')
    recipient_list = [crime.citizen.user.email]

    msg = EmailMultiAlternatives(subject, text_content, from_email, recipient_list)
    msg.attach_alternative(html_content, "text/html")
    msg.send()
    
    print(f"Successfully sent '{event_type}' email to {crime.citizen.user.email} for case {fir_number}.")
    
    # Auto-log system note on crime case timeline for audit verification
    system_note = f"[System Alert] '{event_type}' notification email successfully dispatched to citizen's registered email inbox."
    
    # Safely append note
    if not isinstance(crime.notes, list):
      crime.notes = []
    
    crime.notes.append({
      'note': system_note,
      'addedBy_id': None,
      'addedBy_name': 'CrimePilot Auto-Dispatch',
      'created_at': timezone.now().isoformat()
    })
    
    crime.save()
    return True
  except Exception as e:
    print(f"Failed to send email notification to {crime.citizen.user.email}: {e}")
    # Write a warning note to timeline
    system_note = f"[System Warning] '{event_type}' notification email dispatch failed (SMTP Error: {str(e)[:80]}). Email contents logged to server console."
    if not isinstance(crime.notes, list):
      crime.notes = []
    crime.notes.append({
      'note': system_note,
      'addedBy_id': None,
      'addedBy_name': 'CrimePilot Auto-Dispatch',
      'created_at': timezone.now().isoformat()
    })
    crime.save()
    # Log the full email to console for developer inspect
    print("\n--- DEVELOPER EMAIL OUTBOX DUMP ---")
    print(f"Subject: {subject}")
    print(f"To: {crime.citizen.user.email}")
    print(f"Plain Text Content:\n{text_content}")
    print("------------------------------------\n")
    return False

