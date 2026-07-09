from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
import datetime
from core.models import Location, CrimeCategory, Crime, Suspect, Victim, Evidence
from authentication.models import Officer, Analyst

User = get_user_model()

sample_locations = [
  { 'state': 'Maharashtra', 'district': 'Mumbai City', 'city': 'Mumbai', 'police_station': 'Colaba Police Station' },
  { 'state': 'Maharashtra', 'district': 'Mumbai Suburban', 'city': 'Mumbai', 'police_station': 'Andheri Police Station' },
  { 'state': 'Maharashtra', 'district': 'Mumbai Suburban', 'city': 'Mumbai', 'police_station': 'Bandra Police Station' },
  { 'state': 'Delhi', 'district': 'New Delhi', 'city': 'New Delhi', 'police_station': 'Connaught Place Police Station' },
  { 'state': 'Delhi', 'district': 'Central Delhi', 'city': 'New Delhi', 'police_station': 'Karol Bagh Police Station' },
  { 'state': 'Karnataka', 'district': 'Bengaluru Urban', 'city': 'Bengaluru', 'police_station': 'Koramangala Police Station' },
  { 'state': 'Karnataka', 'district': 'Bengaluru Urban', 'city': 'Bengaluru', 'police_station': 'Indiranagar Police Station' },
]

sample_categories = [
  {
    'name': 'Theft',
    'sections': [
      { 'act': 'BNS', 'section': '305', 'description': 'Theft in a dwelling house, etc.' },
      { 'act': 'BNS', 'section': '306', 'description': 'Theft by clerk or servant of property in possession of master' },
      { 'act': 'BNS', 'section': '307', 'description': 'Theft after preparation made for causing death, hurt or restraint' },
    ],
  },
  {
    'name': 'Robbery',
    'sections': [
      { 'act': 'BNS', 'section': '309', 'description': 'Robbery and punishment for robbery' },
      { 'act': 'BNS', 'section': '310', 'description': 'Dacoity and punishment for dacoity' },
      { 'act': 'BNS', 'section': '311', 'description': 'Robbery, or dacoity, with attempt to cause death or grievous hurt' },
    ],
  },
  {
    'name': 'Assault',
    'sections': [
      { 'act': 'BNS', 'section': '115', 'description': 'Voluntarily causing hurt' },
      { 'act': 'BNS', 'section': '117', 'description': 'Voluntarily causing grievous hurt' },
      { 'act': 'BNS', 'section': '121', 'description': 'Assault or criminal force to deter public servant from duty' },
    ],
  },
  {
    'name': 'Cyber Crime',
    'sections': [
      { 'act': 'BNS', 'section': '318', 'description': 'Cheating (Online/Impersonation)' },
      { 'act': 'BNS', 'section': '66D (IT Act)', 'description': 'Punishment for cheating by personation by using computer resource' },
      { 'act': 'BNS', 'section': '66C (IT Act)', 'description': 'Identity theft' },
    ],
  },
  {
    'name': 'Fraud',
    'sections': [
      { 'act': 'BNS', 'section': '316', 'description': 'Criminal breach of trust' },
      { 'act': 'BNS', 'section': '318', 'description': 'Cheating and dishonestly inducing delivery of property' },
      { 'act': 'BNS', 'section': '336', 'description': 'Forgery and punishment for forgery' },
    ],
  },
  {
    'name': 'Missing Person',
    'sections': [
      { 'act': 'BNSS', 'section': '84', 'description': 'Proclamation for person absconding / missing query' },
      { 'act': 'BNS', 'section': '140', 'description': 'Kidnapping or abducting in order to murder' },
    ],
  },
  {
    'name': 'Narcotics',
    'sections': [
      { 'act': 'NDPS Act', 'section': '15', 'description': 'Punishment for contravention in relation to poppy straw' },
      { 'act': 'NDPS Act', 'section': '20', 'description': 'Punishment for contravention in relation to cannabis plant and cannabis' },
      { 'act': 'NDPS Act', 'section': '22', 'description': 'Punishment for contravention in relation to psychotropic substances' },
    ],
  },
  {
    'name': 'Traffic Crime',
    'sections': [
      { 'act': 'BNS', 'section': '281', 'description': 'Rash driving or riding on a public way' },
      { 'act': 'BNS', 'section': '106', 'description': 'Causing death by negligence (Hit and Run cases)' },
      { 'act': 'Motor Vehicles Act', 'section': '185', 'description': 'Driving by a drunken person or under the influence of drugs' },
    ],
  },
]

class Command(BaseCommand):
  help = 'Seeds database with default locations, categories, users, 7 sample crimes, suspects, victims, and evidence'

  def handle(self, *args, **kwargs):
    self.stdout.write('Connecting to database for seeding...')
    
    # 1. Clear database in correct SQL order
    self.stdout.write('Clearing all tables in dependency order...')
    from logs.models import AuditLog
    from core.models import Notification
    
    Suspect.objects.all().delete()
    Victim.objects.all().delete()
    Evidence.objects.all().delete()
    Notification.objects.all().delete()
    AuditLog.objects.all().delete()
    Crime.objects.all().delete()
    
    Officer.objects.all().delete()
    Analyst.objects.all().delete()
    User.objects.filter(is_superuser=False).delete()
    
    self.stdout.write('Clearing old locations...')
    Location.objects.all().delete()
    self.stdout.write('Clearing old crime categories...')
    CrimeCategory.objects.all().delete()

    # 2. Seed 7 Locations
    self.stdout.write('Seeding locations...')
    db_locations = []
    for loc in sample_locations:
      obj = Location.objects.create(**loc)
      db_locations.append(obj)
    self.stdout.write(f'Successfully seeded {len(db_locations)} locations.')

    # 3. Seed Crime Categories
    self.stdout.write('Seeding crime categories...')
    db_categories = {}
    for cat in sample_categories:
      obj = CrimeCategory.objects.create(**cat)
      db_categories[cat['name']] = obj
    self.stdout.write(f'Successfully seeded {len(db_categories)} crime categories.')

    # 4. Seed Default Admin with personalized credentials
    self.stdout.write('Seeding default Admin user...')
    admin_email = 'admin@command.crimepilot.com'
    User.objects.filter(email__iexact=admin_email).delete()
    admin_user = User.objects.create_superuser(
      email=admin_email,
      name='System Administrator',
      password='admin@1234',
      role='admin'
    )

    # 5. Seed 7 Staff Users (5 Officers, 2 Analysts) with personalized credentials
    self.stdout.write('Seeding Officers and Analysts...')
    
    officers = []
    officer_data = [
      ('john@field.crimepilot.com', 'Officer John Smith', 'john@1234', 'BADGE-1001', db_locations[0], '9876543210'),
      ('sarah@field.crimepilot.com', 'Officer Sarah Connor', 'sarah@1234', 'BADGE-1002', db_locations[1], '9876543211'),
      ('david@field.crimepilot.com', 'Officer David Miller', 'david@1234', 'BADGE-1003', db_locations[3], '9876543212'),
      ('emily@field.crimepilot.com', 'Officer Emily Watson', 'emily@1234', 'BADGE-1004', db_locations[5], '9876543213'),
      ('james@field.crimepilot.com', 'Officer James Bond', 'james@1234', 'BADGE-0007', db_locations[6], '9870070070')
    ]
    for email, name, password, badge, loc, contact in officer_data:
      user_obj = User.objects.create_user(email=email, name=name, password=password, role='officer')
      officer_obj = Officer.objects.create(user=user_obj, badge_no=badge, station=loc, contact=contact)
      officers.append(officer_obj)

    # Seed 2 Analysts
    analyst_data = [
      ('carl@intel.crimepilot.com', 'Analyst Carl Sagan', 'carl@1234', 'Cyber Intelligence Unit'),
      ('neha@intel.crimepilot.com', 'Analyst Neha Verma', 'neha@1234', 'Forensic Data Division')
    ]
    for email, name, password, dept in analyst_data:
      user_obj = User.objects.create_user(email=email, name=name, password=password, role='analyst')
      Analyst.objects.create(user=user_obj, department=dept)


    self.stdout.write('Successfully seeded 7 staff profiles.')

    # 6. Seed 7 Crime Cases
    self.stdout.write('Seeding 7 sample Crime cases...')
    
    # Case 1: Burglar reported at jewellery shop (Colaba - Officer 1)
    c1 = Crime.objects.create(
      crime_category=db_categories['Theft'],
      date=datetime.date(2026, 6, 10),
      time='02:30',
      location=db_locations[0],
      description='Midnight burglary reported at local jewellery showroom. Vault locks were cut. Gold and diamond items missing.',
      officer=officers[0],
      priority='High',
      status='Under Investigation',
      sections=[db_categories['Theft'].sections[0]],
      notes=[{'note': 'Forensics called on-site.', 'addedBy_id': officers[0].user.id, 'addedBy_name': officers[0].user.name, 'created_at': (timezone.now() - datetime.timedelta(days=10)).isoformat()}]
    )

    # Case 2: Phishing attack reported by a bank (Andheri - Officer 2)
    c2 = Crime.objects.create(
      crime_category=db_categories['Cyber Crime'],
      date=datetime.date(2026, 6, 14),
      time='11:45',
      location=db_locations[1],
      description='Corporate phishing attack. Fraud emails sent to bank executives. Credentials compromised. Fund transfer intercepted.',
      officer=officers[1],
      priority='Medium',
      status='Reported',
      sections=[db_categories['Cyber Crime'].sections[0]],
      notes=[{'note': 'Initial complaint received from bank security.', 'addedBy_id': officers[1].user.id, 'addedBy_name': officers[1].user.name, 'created_at': (timezone.now() - datetime.timedelta(days=8)).isoformat()}]
    )

    # Case 3: Violent assault outside pub (Colaba - Officer 1)
    c3 = Crime.objects.create(
      crime_category=db_categories['Assault'],
      date=datetime.date(2026, 6, 18),
      time='23:15',
      location=db_locations[0],
      description='Physical assault reported outside commercial pub. Suspect fled the scene. Victim suffered head bruises.',
      officer=officers[0],
      priority='Critical',
      status='Solved',
      sections=[db_categories['Assault'].sections[0]],
      notes=[{'note': 'Pub guards statements recorded.', 'addedBy_id': officers[0].user.id, 'addedBy_name': officers[0].user.name, 'created_at': (timezone.now() - datetime.timedelta(days=6)).isoformat()}]
    )

    # Case 4: Hit and run traffic case (Connaught Place - Officer 3)
    c4 = Crime.objects.create(
      crime_category=db_categories['Traffic Crime'],
      date=datetime.date(2026, 6, 22),
      time='08:10',
      location=db_locations[3],
      description='Speeding vehicle struck pedestrian crossing the junction. Vehicle fled. License plate partially captured by CCTV.',
      officer=officers[2],
      priority='Medium',
      status='Assigned',
      sections=[db_categories['Traffic Crime'].sections[1]],
      notes=[{'note': 'CCTV footage fetched from junction cameras.', 'addedBy_id': officers[2].user.id, 'addedBy_name': officers[2].user.name, 'created_at': (timezone.now() - datetime.timedelta(days=4)).isoformat()}]
    )

    # Case 5: Narcotic drug bust (Koramangala - Officer 4)
    c5 = Crime.objects.create(
      crime_category=db_categories['Narcotics'],
      date=datetime.date(2026, 6, 24),
      time='19:40',
      location=db_locations[5],
      description='Intercepted delivery of synthetic drugs based on intelligence tip. Suspect caught red-handed with illicit narcotics.',
      officer=officers[3],
      priority='High',
      status='Evidence Collected',
      sections=[db_categories['Narcotics'].sections[2]],
      notes=[{'note': 'Narcotics weighed and catalogued.', 'addedBy_id': officers[3].user.id, 'addedBy_name': officers[3].user.name, 'created_at': (timezone.now() - datetime.timedelta(days=2)).isoformat()}]
    )

    # Case 6: Missing person query (Indiranagar - Officer 5)
    c6 = Crime.objects.create(
      crime_category=db_categories['Missing Person'],
      date=datetime.date(2026, 6, 26),
      time='15:20',
      location=db_locations[6],
      description='A teenage boy reported missing after he failed to return from high school. Phone last pinged near park.',
      officer=officers[4],
      priority='High',
      status='Under Investigation',
      sections=[db_categories['Missing Person'].sections[1]],
      notes=[{'note': 'Missing person alerts broadcasted.', 'addedBy_id': officers[4].user.id, 'addedBy_name': officers[4].user.name, 'created_at': (timezone.now() - datetime.timedelta(days=1)).isoformat()}]
    )

    # Case 7: Corporate check fraud (Andheri - Officer 2)
    c7 = Crime.objects.create(
      crime_category=db_categories['Fraud'],
      date=datetime.date(2026, 6, 28),
      time='14:15',
      location=db_locations[1],
      description='Suspect presented forged banker checks to withdraw massive funds from account. Intercepted by branch cashier.',
      officer=officers[1],
      priority='Low',
      status='Closed',
      sections=[db_categories['Fraud'].sections[2]],
      notes=[{'note': 'Check sent to forensic verification.', 'addedBy_id': officers[1].user.id, 'addedBy_name': officers[1].user.name, 'created_at': timezone.now().isoformat()}]
    )

    self.stdout.write('Successfully seeded 7 Crime cases.')

    # 7. Seed 7 Suspects
    self.stdout.write('Seeding 7 Suspect profiles...')
    
    s_names = ['John Burglar', 'Alice Hacker', 'Bob Bruiser', 'Dash Driver', 'Sam Smuggler', 'Carl Absent', 'Frank Faker']
    s_ages = [32, 24, 38, 29, 34, 18, 41]
    s_addresses = [
      '45 Hideout Alley, Docklands, Mumbai',
      'Hostel 3, Technical Campus, Andheri',
      '99 Row Houses, Colaba, Mumbai',
      '12 Transit Colony, Karol Bagh, Delhi',
      '88 Cargo Lane, Bengaluru',
      'N/A - Missing Inquiry',
      '202 Business Towers, Bandra, Mumbai'
    ]
    s_statuses = ['Suspect', 'Detained', 'Arrested', 'Suspect', 'Arrested', 'Suspect', 'Arrested']
    crimes = [c1, c2, c3, c4, c5, c6, c7]

    for i in range(7):
      Suspect.objects.create(
        name=s_names[i],
        age=s_ages[i],
        gender='Male' if i != 1 else 'Female',
        address=s_addresses[i],
        status=s_statuses[i],
        linked_crime=crimes[i]
      )

    self.stdout.write('Successfully seeded 7 Suspect profiles.')

    # 8. Seed 7 Victims
    self.stdout.write('Seeding 7 Victim profiles...')
    
    v_names = ['Suresh Mehta', 'Ramesh Kumar', 'David Miller', 'Clara Smith', 'Public Interest compl.', 'Karan Johar (Father)', 'City Bank Security']
    v_contacts = ['9812345670', '9812345671', '9812345672', '9812345673', 'N/A', '9812345675', '9812345676']
    v_statements = [
      'I opened the jewellery shop at 9 AM and saw the vault broken.',
      'I received fake banker email asking to verify administrative passwords.',
      'The suspect bumped into me, shouted, and hit me with a wooden stick.',
      'I was crossing the zebra line when a speeding black sedan hit my leg.',
      'Anonymous tip about massive drug exchange at transit point.',
      'My son went to school in morning, and failed to return by evening.',
      'Cashier detected forged check leaf signature during teller check.'
    ]
    v_ref = ['Vault padlock locks', 'Email headers logs', 'Doctor clinic slip', 'Junction video footage', 'Seizure report packet', 'Highschool registers', 'Check leaf copy']

    for i in range(7):
      Victim.objects.create(
        name=v_names[i],
        contact=v_contacts[i],
        statement=v_statements[i],
        evidence_reference=v_ref[i],
        linked_crime=crimes[i]
      )

    self.stdout.write('Successfully seeded 7 Victim profiles.')

    # 9. Seed 7 Evidence records
    self.stdout.write('Seeding 7 Evidence records...')
    
    e_types = ['Tool Marks', 'Digital Log', 'Video Footage', 'Video Recording', 'Narcotics sample', 'GPS Pings', 'Check Leaf']
    e_desc = [
      'Cutter tool markings left on metal vault padlock.',
      'Captured email headers showing fake DNS impersonating bank domain.',
      'High-definition pub security camera clip showing the assault.',
      'CCTV recording of hit-and-run vehicle capturing license plate.',
      'Illicit synthetic narcotics packet seized during search operation.',
      'Saved cell tower pings showing mobile phone proximity track.',
      'Forged check paper with false signatures and fake seal stamps.'
    ]
    e_paths = [
      '/uploads/tool_marks_padlock.png',
      '/uploads/email_headers_phishing.pdf',
      '/uploads/pub_cctv_assault.mp4',
      '/uploads/traffic_cctv_hitrun.mp4',
      '/uploads/seized_narcotics.jpg',
      '/uploads/gps_cell_tower_pings.pdf',
      '/uploads/forged_check_leaf.jpg'
    ]

    for i in range(7):
      Evidence.objects.create(
        type=e_types[i],
        description=e_desc[i],
        collection_date=datetime.date(2026, 6, 10 + i * 2),
        assigned_officer=officers[i % 5],
        linked_crime=crimes[i],
        file_path=e_paths[i]
      )

    self.stdout.write('Successfully seeded 7 Evidence records.')
    self.stdout.write(self.style.SUCCESS('Database Seeding Complete!'))
