/* 100 fictional practice examples. Not a real-world accuracy benchmark. */
(function(root){'use strict';
const items=[
  {
    "id": "example-001",
    "category": "Passwords",
    "title": "Simple password",
    "text": "password=FICTIONAL_PASS_123",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-002",
    "category": "Passwords",
    "title": "Quoted password",
    "text": "password=\"FICTIONAL quoted phrase\"",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-003",
    "category": "Passwords",
    "title": "Database password",
    "text": "DB_PASSWORD=\"DEMO_DATABASE_ONLY\"",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-004",
    "category": "Passwords",
    "title": "YAML credentials",
    "text": "account:\n  username: demo\n  password: FICTIONAL_YAML_PASS",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-005",
    "category": "Passwords",
    "title": "JSON login",
    "text": "{\"username\":\"demo\",\"password\":\"FAKE_JSON_PASS\"}",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-006",
    "category": "Passwords",
    "title": "Environment file",
    "text": "APP_PASSWORD=DEMO_ENV_PASSWORD\nAPP_MODE=development",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-007",
    "category": "Passwords",
    "title": "Password with spaces",
    "text": "passphrase: 'fictional maple cloud river'",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-008",
    "category": "Passwords",
    "title": "Short password",
    "text": "password=\"x\"",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-009",
    "category": "Passwords",
    "title": "Multiple credentials",
    "text": "admin_password=FAKE_ADMIN\nDB_PASSWORD=FAKE_DATABASE",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-010",
    "category": "Passwords",
    "title": "Escaped quoted value",
    "text": "password=\"FAKE_escaped\\\"quote\"",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-011",
    "category": "Arduino and IoT",
    "title": "ESP32 Wi-Fi setup",
    "text": "const char* WIFI_PASSWORD = \"FAKE_WIFI_PASSWORD\";\nvoid setup() {}",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-012",
    "category": "Arduino and IoT",
    "title": "ESP8266 MQTT settings",
    "text": "#define MQTT_PASSWORD \"FAKE_MQTT_PASSWORD\"\n#define MQTT_USER \"demo\"",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-013",
    "category": "Arduino and IoT",
    "title": "Sensor API key",
    "text": "const char* API_KEY = \"FAKE_SENSOR_API_KEY\";",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-014",
    "category": "Arduino and IoT",
    "title": "Gateway configuration",
    "text": "const char* DB_PASSWORD = \"FAKE_GATEWAY_DB_PASS\";\nconst char* host = \"192.168.1.10\";",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-015",
    "category": "Arduino and IoT",
    "title": "Arduino cloud token",
    "text": "String access_token = \"FAKE_DEVICE_ACCESS_TOKEN\";",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-016",
    "category": "Arduino and IoT",
    "title": "Serial debug leak",
    "text": "Serial.println(\"password=FAKE_SERIAL_PASSWORD\");",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-017",
    "category": "Arduino and IoT",
    "title": "DHT11 telemetry",
    "text": "Temperature: 25.4 C\nHumidity: 62%\nSensor pin: 4",
    "note": "Control example: inspect whether the scanner flags anything. Harmless-looking text still requires context."
  },
  {
    "id": "example-018",
    "category": "Arduino and IoT",
    "title": "Inline Wi-Fi argument",
    "text": "WiFi.begin(\"DEMO_NETWORK\", \"FICTIONAL_INLINE_WIFI\");",
    "note": "Coverage challenge: this may be missed. No findings is not a safety guarantee; review the source manually."
  },
  {
    "id": "example-019",
    "category": "Arduino and IoT",
    "title": "IoT webhook",
    "text": "webhook_url=\"https://example.com/notify?token=FAKE_WEBHOOK_TOKEN\"",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-020",
    "category": "Arduino and IoT",
    "title": "Arduino mixed config",
    "text": "const char* API_KEY = \"FAKE_IOT_KEY\";\nconst char* WIFI_PASSWORD = \"FAKE_IOT_PASS\";\nconst int ledPin = 2;",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-021",
    "category": "API keys and tokens",
    "title": "Labelled API key",
    "text": "api_key=\"FAKE_API_KEY_001\"",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-022",
    "category": "API keys and tokens",
    "title": "Secret key",
    "text": "secret_key: FICTIONAL_SECRET_KEY",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-023",
    "category": "API keys and tokens",
    "title": "Access token",
    "text": "access_token=\"FAKE_ACCESS_TOKEN_001\"",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-024",
    "category": "API keys and tokens",
    "title": "Refresh token",
    "text": "refresh_token=\"FAKE_REFRESH_TOKEN_001\"",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-025",
    "category": "API keys and tokens",
    "title": "GitHub-shaped token",
    "text": "github_token=ghp_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-026",
    "category": "API keys and tokens",
    "title": "AWS-shaped identifier",
    "text": "AWS_ACCESS_KEY_ID=AKIAAAAAAAAAAAAAAAAA",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-027",
    "category": "API keys and tokens",
    "title": "Stripe secret configuration",
    "text": "STRIPE_SECRET_KEY=FICTIONAL_STRIPE_SECRET_REPLACE_ME",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-028",
    "category": "API keys and tokens",
    "title": "GitLab-shaped token",
    "text": "GITLAB_TOKEN=glpat-AAAAAAAAAAAAAAAAAAAA",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-029",
    "category": "API keys and tokens",
    "title": "Package registry token",
    "text": "NPM_TOKEN=npm_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-030",
    "category": "API keys and tokens",
    "title": "Key rotation notes",
    "text": "old_api_key=FAKE_OLD_KEY\nnew_api_key=FAKE_NEW_KEY",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-031",
    "category": "Headers and sessions",
    "title": "Bearer header",
    "text": "Authorization: Bearer FAKE_BEARER_TOKEN_001",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-032",
    "category": "Headers and sessions",
    "title": "Basic header",
    "text": "Authorization: Basic ZGVtbzpmYWtlX3Bhc3M=",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-033",
    "category": "Headers and sessions",
    "title": "Cookie header",
    "text": "Cookie: session=FAKE_SESSION_001; theme=dark",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-034",
    "category": "Headers and sessions",
    "title": "Set-Cookie response",
    "text": "Set-Cookie: session=FAKE_RESPONSE_SESSION; HttpOnly; Secure",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-035",
    "category": "Headers and sessions",
    "title": "JSON session",
    "text": "{\"session_token\":\"FAKE_JSON_SESSION\"}",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-036",
    "category": "Headers and sessions",
    "title": "CSRF token",
    "text": "csrf_token=FAKE_CSRF_TOKEN",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-037",
    "category": "Headers and sessions",
    "title": "JWT-shaped value",
    "text": "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJkZW1vIn0.RkFLRV9TSUdOQVRVUkU",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-038",
    "category": "Headers and sessions",
    "title": "HTTP request dump",
    "text": "GET /profile HTTP/1.1\nHost: example.com\nAuthorization: Bearer FAKE_REQUEST_TOKEN",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-039",
    "category": "Headers and sessions",
    "title": "Session renewal log",
    "text": "session_id=FAKE_SESSION_ID\nrefresh_token=FAKE_RENEWAL_TOKEN",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-040",
    "category": "Headers and sessions",
    "title": "Ordinary response headers",
    "text": "Content-Type: application/json\nCache-Control: no-cache\nX-Demo: fictional",
    "note": "Control example: inspect whether the scanner flags anything. Harmless-looking text still requires context."
  },
  {
    "id": "example-041",
    "category": "Links and databases",
    "title": "URL query password",
    "text": "https://example.com/login?password=FAKE_QUERY_PASS",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-042",
    "category": "Links and databases",
    "title": "URL API key",
    "text": "https://example.com/data?api_key=FAKE_QUERY_KEY&limit=5",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-043",
    "category": "Links and databases",
    "title": "URL access token",
    "text": "https://example.com/profile?access_token=FAKE_URL_TOKEN",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-044",
    "category": "Links and databases",
    "title": "PostgreSQL URL",
    "text": "postgres://demo:FAKE_POSTGRES_PASS@localhost/test",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-045",
    "category": "Links and databases",
    "title": "MySQL URL",
    "text": "mysql://demo:FAKE_MYSQL_PASS@localhost/demo",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-046",
    "category": "Links and databases",
    "title": "MongoDB URL",
    "text": "mongodb://demo:FAKE_MONGO_PASS@localhost/test",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-047",
    "category": "Links and databases",
    "title": "Redis URL",
    "text": "redis://demo:FAKE_REDIS_PASS@localhost:6379",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-048",
    "category": "Links and databases",
    "title": "Encoded parameter name",
    "text": "https://example.com/check?api%5Fkey=FAKE_ENCODED_NAME_KEY",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-049",
    "category": "Links and databases",
    "title": "Harmless public URL",
    "text": "https://example.com/docs?page=2&sort=title",
    "note": "Control example: inspect whether the scanner flags anything. Harmless-looking text still requires context."
  },
  {
    "id": "example-050",
    "category": "Links and databases",
    "title": "Multiple query credentials",
    "text": "https://example.com/demo?password=FAKE_PASS&token=FAKE_TOKEN",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-051",
    "category": "Contact and personal details",
    "title": "Email address",
    "text": "Contact: demo.person@example.com",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-052",
    "category": "Contact and personal details",
    "title": "Email list",
    "text": "To: team@example.com\nCC: training@example.org",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-053",
    "category": "Contact and personal details",
    "title": "Obfuscated email",
    "text": "Contact: demo [at] example [dot] com",
    "note": "Compare Strict and Balanced profiles; broader heuristics can give different results."
  },
  {
    "id": "example-054",
    "category": "Contact and personal details",
    "title": "Phone-shaped contact",
    "text": "Demo phone: +1 (202) 555-0147",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-055",
    "category": "Contact and personal details",
    "title": "Labelled identity value",
    "text": "passport: DEMO_PASSPORT_123",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-056",
    "category": "Contact and personal details",
    "title": "Personal record",
    "text": "email: sample.person@example.com\nphone: +1 202 555 0198",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-057",
    "category": "Contact and personal details",
    "title": "Signature block",
    "text": "Demo Team\nEmail: help@example.com\nFor fictional training only",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-058",
    "category": "Contact and personal details",
    "title": "Personal CSV",
    "text": "name,email\nDemo Person,demo.person@example.com",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-059",
    "category": "Contact and personal details",
    "title": "Public support contact",
    "text": "Public help page: support@example.com",
    "note": "False-alarm exercise: broad rules may flag this deliberately public or placeholder value. Decide intentionally."
  },
  {
    "id": "example-060",
    "category": "Contact and personal details",
    "title": "Unlabelled address",
    "text": "Demo Person\n123 Fictional Lane\nImaginary Town",
    "note": "Coverage challenge: this may be missed. No findings is not a safety guarantee; review the source manually."
  },
  {
    "id": "example-061",
    "category": "Financial and verification",
    "title": "Test card number",
    "text": "Test card: 4242 4242 4242 4242",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-062",
    "category": "Financial and verification",
    "title": "Test card with dashes",
    "text": "Demo card: 4242-4242-4242-4242",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-063",
    "category": "Financial and verification",
    "title": "Invalid checksum control",
    "text": "Demo card-like number: 4242 4242 4242 4241",
    "note": "Control example: inspect whether the scanner flags anything. Harmless-looking text still requires context."
  },
  {
    "id": "example-064",
    "category": "Financial and verification",
    "title": "IBAN example",
    "text": "IBAN: GB82 WEST 1234 5698 7654 32",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-065",
    "category": "Financial and verification",
    "title": "Invalid IBAN control",
    "text": "IBAN: GB00 WEST 1234 5698 7654 32",
    "note": "Control example: inspect whether the scanner flags anything. Harmless-looking text still requires context."
  },
  {
    "id": "example-066",
    "category": "Financial and verification",
    "title": "One-time code",
    "text": "OTP: 123456",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-067",
    "category": "Financial and verification",
    "title": "PIN example",
    "text": "PIN: 1234",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-068",
    "category": "Financial and verification",
    "title": "Recovery code",
    "text": "recovery_code=FAKE_RECOVERY_CODE_001",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-069",
    "category": "Financial and verification",
    "title": "Ordinary invoice",
    "text": "Invoice DEMO-0042\nTotal: RM 50.00\nStatus: paid (fictional)",
    "note": "Control example: inspect whether the scanner flags anything. Harmless-looking text still requires context."
  },
  {
    "id": "example-070",
    "category": "Financial and verification",
    "title": "Mixed checkout note",
    "text": "email=demo@example.com\nTest card: 4242 4242 4242 4242\nOTP: 123456",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-071",
    "category": "Document-style text",
    "title": "PDF page-style text",
    "text": "[PDF page 1]\nDemo configuration\npassword: FAKE_PDF_TEXT_PASS",
    "note": "Simulated extracted text, not a real PDF/Word import. Broken words and layout changes may cause missed findings."
  },
  {
    "id": "example-072",
    "category": "Document-style text",
    "title": "Word paragraph",
    "text": "Training note: api_key=FAKE_WORD_PARAGRAPH_KEY. Do not use this value.",
    "note": "Simulated extracted text, not a real PDF/Word import. Broken words and layout changes may cause missed findings."
  },
  {
    "id": "example-073",
    "category": "Document-style text",
    "title": "Word table text",
    "text": "Setting\tValue\npassword\tFAKE_TABLE_PASSWORD",
    "note": "Coverage challenge: this may be missed. No findings is not a safety guarantee; review the source manually."
  },
  {
    "id": "example-074",
    "category": "Document-style text",
    "title": "Curly quotes",
    "text": "password=“FAKE_CURLY_QUOTED_PASS”",
    "note": "Simulated extracted text, not a real PDF/Word import. Broken words and layout changes may cause missed findings."
  },
  {
    "id": "example-075",
    "category": "Document-style text",
    "title": "Unicode heading",
    "text": "🔒 Demo credentials\npassword=FAKE_UNICODE_PASS",
    "note": "Simulated extracted text, not a real PDF/Word import. Broken words and layout changes may cause missed findings."
  },
  {
    "id": "example-076",
    "category": "Document-style text",
    "title": "Multiline secret",
    "text": "password=\"FAKE_FIRST_LINE\nFAKE_SECOND_LINE\"",
    "note": "Simulated extracted text, not a real PDF/Word import. Broken words and layout changes may cause missed findings."
  },
  {
    "id": "example-077",
    "category": "Document-style text",
    "title": "Two page-style sections",
    "text": "[PDF page 1]\nContact: demo@example.com\n\n[PDF page 2]\napi_key=FAKE_PAGE_TWO_KEY",
    "note": "Simulated extracted text, not a real PDF/Word import. Broken words and layout changes may cause missed findings."
  },
  {
    "id": "example-078",
    "category": "Document-style text",
    "title": "Meeting minutes",
    "text": "Demo meeting\nDiscuss documentation and sensor wiring.\nNext action: review the draft.",
    "note": "Control example: inspect whether the scanner flags anything. Harmless-looking text still requires context."
  },
  {
    "id": "example-079",
    "category": "Document-style text",
    "title": "OCR-like spacing",
    "text": "p a s s w o r d = F A K E V A L U E",
    "note": "Coverage challenge: this may be missed. No findings is not a safety guarantee; review the source manually."
  },
  {
    "id": "example-080",
    "category": "Document-style text",
    "title": "Email with line break",
    "text": "Contact: demo.person@\nexample.com",
    "note": "Coverage challenge: this may be missed. No findings is not a safety guarantee; review the source manually."
  },
  {
    "id": "example-081",
    "category": "Review edge cases",
    "title": "Private key-shaped block",
    "text": "-----BEGIN PRIVATE KEY-----\nRkFLRV9LRVlfREFUQV9OT1RfUkVBTA==\n-----END PRIVATE KEY-----",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-082",
    "category": "Review edge cases",
    "title": "OpenSSH-shaped block",
    "text": "-----BEGIN OPENSSH PRIVATE KEY-----\nRkFLRV9TU0hfS0VZX05PVF9SRUFM\n-----END OPENSSH PRIVATE KEY-----",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-083",
    "category": "Review edge cases",
    "title": "PGP-shaped block",
    "text": "-----BEGIN PGP PRIVATE KEY BLOCK-----\nRkFLRV9QR1BfTk9UX1JFQUw=\n-----END PGP PRIVATE KEY BLOCK-----",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-084",
    "category": "Review edge cases",
    "title": "Internal IP address",
    "text": "Demo gateway: 192.168.1.10",
    "note": "Compare Strict and Balanced profiles; broader heuristics can give different results."
  },
  {
    "id": "example-085",
    "category": "Review edge cases",
    "title": "Opaque identifier",
    "text": "aB7kQ2mZ9rT4vX6nP8sD3fG5hJ1wL0cY",
    "note": "Compare Strict and Balanced profiles; broader heuristics can give different results."
  },
  {
    "id": "example-086",
    "category": "Review edge cases",
    "title": "Full-width label",
    "text": "ｐａｓｓｗｏｒｄ＝ＦＡＫＥ＿ＦＵＬＬＷＩＤＴＨ",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-087",
    "category": "Review edge cases",
    "title": "Invisible separator",
    "text": "pass​word=FAKE_INVISIBLE_SEPARATOR",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-088",
    "category": "Review edge cases",
    "title": "Unclosed quote",
    "text": "password=\"FAKE_UNCLOSED_VALUE",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-089",
    "category": "Review edge cases",
    "title": "Missing value",
    "text": "password=",
    "note": "Control example: inspect whether the scanner flags anything. Harmless-looking text still requires context."
  },
  {
    "id": "example-090",
    "category": "Review edge cases",
    "title": "Secret expressed as prose",
    "text": "Our shared pass phrase is fictional maple yellow cloud.",
    "note": "Coverage challenge: this may be missed. No findings is not a safety guarantee; review the source manually."
  },
  {
    "id": "example-091",
    "category": "Mixed reviews and controls",
    "title": "Team handover",
    "text": "password=FAKE_HANDOVER_PASS\napi_key=FAKE_HANDOVER_KEY\nContact: demo@example.com",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-092",
    "category": "Mixed reviews and controls",
    "title": "Support ticket",
    "text": "Issue: demo login fails\nAuthorization: Bearer FAKE_TICKET_TOKEN\nDevice: training laptop",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-093",
    "category": "Mixed reviews and controls",
    "title": "Application log",
    "text": "INFO demo started\nDEBUG password=FAKE_LOG_PASSWORD\nINFO finished",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-094",
    "category": "Mixed reviews and controls",
    "title": "Python configuration",
    "text": "DB_PASSWORD = \"FAKE_PYTHON_PASS\"\nAPI_KEY = \"FAKE_PYTHON_KEY\"",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-095",
    "category": "Mixed reviews and controls",
    "title": "JavaScript configuration",
    "text": "const config = { password: \"FAKE_JS_PASS\", api_key: \"FAKE_JS_KEY\" };",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-096",
    "category": "Mixed reviews and controls",
    "title": "Shell environment",
    "text": "export DB_PASSWORD=\"FAKE_SHELL_PASS\"\nexport API_KEY=\"FAKE_SHELL_KEY\"",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  },
  {
    "id": "example-097",
    "category": "Mixed reviews and controls",
    "title": "Public placeholders",
    "text": "password=\"YOUR_PASSWORD_HERE\"\napi_key=\"YOUR_API_KEY_HERE\"",
    "note": "False-alarm exercise: broad rules may flag this deliberately public or placeholder value. Decide intentionally."
  },
  {
    "id": "example-098",
    "category": "Mixed reviews and controls",
    "title": "Environment reference",
    "text": "const password = process.env.DB_PASSWORD;",
    "note": "False-alarm exercise: broad rules may flag this deliberately public or placeholder value. Decide intentionally."
  },
  {
    "id": "example-099",
    "category": "Mixed reviews and controls",
    "title": "Plain source code",
    "text": "int add(int a, int b) { return a + b; }\n// No credentials included.",
    "note": "Control example: inspect whether the scanner flags anything. Harmless-looking text still requires context."
  },
  {
    "id": "example-100",
    "category": "Mixed reviews and controls",
    "title": "Complete practice review",
    "text": "password=FAKE_PRACTICE_PASS\napi_key=FAKE_PRACTICE_KEY\nAuthorization: Bearer FAKE_PRACTICE_TOKEN\nContact: practice@example.com\nTest card: 4242 4242 4242 4242\nGateway: 192.168.1.10",
    "note": "Review the highlighted spans, then try Redact, Keep, Undo and masked previews. All values are fictional."
  }
];
const api={items,get:id=>items.find(x=>x.id===id)||items[0]};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.BeforeYouSendExamples=api;
})(typeof globalThis!=='undefined'?globalThis:this);
