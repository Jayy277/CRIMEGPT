from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def generate_report_pdf(response, title, subtitle, data, date_range):
  """
  Generates a clean PDF document of cases using ReportLab
  and writes it directly to the response stream.
  """
  # Setup PDF Doc
  doc = SimpleDocTemplate(
    response, 
    pagesize=A4, 
    rightMargin=36, 
    leftMargin=36, 
    topMargin=36, 
    bottomMargin=36
  )
  story = []

  # Set up styles
  styles = getSampleStyleSheet()
  title_style = ParagraphStyle(
    'ReportTitle',
    parent=styles['Heading1'],
    fontName='Helvetica-Bold',
    fontSize=18,
    textColor=colors.HexColor('#0f172a'),
    spaceAfter=4
  )
  meta_style = ParagraphStyle(
    'ReportMeta',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=9,
    textColor=colors.HexColor('#475569'),
    spaceAfter=15
  )
  
  story.append(Paragraph("CrimeGPT — Case Compiler Report", title_style))
  story.append(Paragraph(f"Generated on: {timezone_now_str()} | filter criteria: {title}", meta_style))
  if date_range:
    story.append(Paragraph(f"Report Period: {date_range}", meta_style))
    story.append(Spacer(1, 5))

  # Summary box
  total = len(data)
  solved = len([c for c in data if c.status in ['Solved', 'Closed']])
  pending = total - solved

  summary_data = [
    [f"Total Cases: {total}", f"Solved/Closed: {solved}", f"Pending Cases: {pending}"]
  ]
  summary_table = Table(summary_data, colWidths=[174, 174, 174])
  summary_table.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
    ('TEXTCOLOR', (0,0), (-1,-1), colors.HexColor('#0f172a')),
    ('FONTNAME', (0,0), (-1,-1), 'Helvetica-Bold'),
    ('FONTSIZE', (0,0), (-1,-1), 10),
    ('ALIGN', (0,0), (-1,-1), 'CENTER'),
    ('PADDING', (0,0), (-1,-1), 8),
    ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#e2e8f0')),
  ]))
  
  story.append(summary_table)
  story.append(Spacer(1, 15))

  # Cases Table
  table_data = [['Case ID', 'Date/Time', 'Category', 'Location (Station)', 'Priority', 'Status']]
  for c in data:
    cat = c.crime_category.name if c.crime_category else 'N/A'
    loc = c.location.police_station if c.location else 'N/A'
    date_val = c.date.strftime('%Y-%m-%d') if c.date else 'N/A'
    
    table_data.append([
      c.crime_id or 'N/A',
      f"{date_val} {c.time}",
      cat,
      loc,
      c.priority,
      c.status
    ])

  cases_table = Table(table_data, colWidths=[80, 80, 80, 130, 60, 90])
  cases_table.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0f766e')),
    ('TEXTCOLOR', (0,0), (-1,0), colors.white),
    ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
    ('FONTSIZE', (0,0), (-1,0), 9),
    ('BOTTOMPADDING', (0,0), (-1,0), 6),
    ('TOPPADDING', (0,0), (-1,0), 6),
    ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
    ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
    ('FONTSIZE', (0,1), (-1,-1), 8),
    ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor('#ffffff'), colors.HexColor('#f1f5f9')]),
    ('PADDING', (0,1), (-1,-1), 5),
  ]))
  
  story.append(cases_table)
  doc.build(story)

def timezone_now_str():
  from django.utils import timezone
  return timezone.now().strftime('%Y-%m-%d %H:%M:%S')
