"""Manual desired-review annotations; the scanner never generates labels."""
from pathlib import Path
import json
examples=[
('arduino', 'const char* wifi_password = "⟦FICTIONAL_WIFI_123⟧";'),
('arduino', '#define MQTT_PASSWORD "⟦FICTIONAL_MQTT_456⟧"'),
('arduino', 'String api_key = "⟦DEMO_SENSOR_KEY_789⟧";'),
('arduino', 'const char* DB_PASSWORD = "⟦FICTIONAL_DB_ABC⟧";\r\nvoid setup() {}'),
('arduino', 'WiFi.begin("DEMO_NETWORK", "⟦FICTIONAL_INLINE_WIFI⟧");'),
('arduino-negative', 'const int sensorPin = 4;\nunsigned long interval = 5000;'),
('arduino-negative', 'Serial.println("temperature: 25.0 C");'),
('arduino-negative', 'const char* password = "";'),
('arduino-placeholder', 'const char* password = "YOUR_PASSWORD_HERE";'),
('arduino', 'const char* password = "⟦not\\"aRealSecret⟧";'),
('document', '[PDF page 1]\npassword: ⟦DEMO_DOCUMENT_PASS⟧'),
('document', '[PDF page 2]\nEmail: ⟦fictional.person@example.com⟧'),
('document', 'API_KEY\t=\t"⟦FICTIONAL_TABLE_KEY⟧"'),
('document', 'Contact\t⟦fictional.person@example.com⟧\nDepartment\tTesting'),
('document', 'password=“⟦FAKE_CURLY_PASS⟧”'),
('document', '🔒 Credentials\npassword = ⟦UNICODE_TEST_PASS⟧'),
('document', 'Password: ⟦FICTIONAL⟧\n\nNotes for review'),
('document-negative', '[PDF page 1]\nMeeting minutes\nReview the sensor readings next week.'),
('document-negative', 'Invoice reference: DEMO-2026-0042\nTotal: RM 50.00'),
('document-negative', 'Version 0.7.0\nPages 1–5\nChapter 3: Methodology'),
('document-unsupported', 'Our shared pass phrase is ⟦fictional maple yellow cloud⟧.'),
('document-unsupported', 'Reach me: ⟦someone AT example DOT com⟧'),
('document-public-contact', 'Public demo support: help@example.com'),
('configuration', 'postgres://⟦demo_user:DEMO_DB_PASS⟧@localhost/test'),
('configuration', 'Authorization: Bearer ⟦DEMO_BEARER_TOKEN_ONLY⟧'),
('configuration', 'api_key=⟦FAKE_KEY_ONE⟧\npassword=⟦FAKE_PASS_TWO⟧'),
('configuration-negative', 'api_key = process.env.API_KEY;'),
('configuration', 'token="⟦FAKE_TOKEN_WITH_UNICODE_é⟧"'),
('configuration-negative', '// Set a password before deploying.\nvoid loop() {}'),
('document-boundary', 'password=⟦DEMO_DOC_PASS⟧; Contact: ⟦team@example.com⟧'),
]
def units(s):return len(s.encode('utf-16-le'))//2
rows=[]
for i,(category,annotated) in enumerate(examples,1):
 text='';spans=[]
 while '⟦' in annotated:
  prefix,rest=annotated.split('⟦',1);secret,annotated=rest.split('⟧',1)
  text+=prefix;start=units(text);text+=secret;spans.append({'start':start,'end':units(text),'category':category})
 text+=annotated
 rows.append({'id':f'review-2026-{i:03}','category':category,'text':text,'expected':spans,'synthetic':True})
p=Path(__file__).resolve().parents[1]/'datasets/review-expansion.jsonl'
p.write_text(''.join(json.dumps(r,ensure_ascii=False)+'\n' for r in rows))
