"""Hand-annotated synthetic examples. Never derive labels from scanner output."""
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[1]
# Brackets delimit the intended review span; values are deliberately fictional.
DEV=[
('password','password="⟦DEV_ONLY_SECRET⟧"'),('email','Write to ⟦dev@example.com⟧.'),('card','⟦4242 4242 4242 4242⟧'),('phone','Call ⟦+60 12-345 6789⟧'),('url','https://⟦dev:DEMO_PASS⟧@example.com'),('cookie','Cookie: ⟦session=DEMO_TOKEN; theme=dark⟧'),('otp','OTP: ⟦123456⟧'),('personal','DOB: ⟦2000-01-01⟧'),('ip','Internal server ⟦192.168.1.10⟧'),('none','Meet at the library tomorrow.'),('none','Order number: ORD-2026-1042'),('none','Basic knowledge matters.'),('key','api_key=⟦DEV_ONLY_KEY⟧'),('overlap','password="⟦Bearer DEV_TOKEN with tail⟧"'),('unicode','password=“⟦ＤＥＶ＿ＳＥＣＲＥＴ⟧”'),('query','https://example.com?token=⟦DEMO_TOKEN⟧&page=2'),('none','const token_count = 4;'),('none','Version 1.2.3'),('none','const password = "";'),('none','The password policy requires twelve characters.')]
EVAL=[
('password','DB_PASSWORD="⟦EVAL_ONLY_PASS⟧";'),
('password','passphrase: \'⟦fictional phrase for testing⟧\''),
('password','password=⟦x⟧'),
('key','CLIENT_SECRET=⟦EVAL_CLIENT_SECRET⟧'),
('key','API_KEY="⟦EVAL_DEMO_KEY⟧"'),
('token','Authorization: Bearer ⟦EVAL_TOKEN_NOT_LIVE⟧'),
('token','Authorization: Basic ⟦ZXZhbDpkZW1v⟧'),
('cookie','Cookie: ⟦session=EVAL_SESSION; preference=light⟧'),
('url','postgres://⟦reviewer:EVAL_PASSWORD⟧@db.example/eval'),
('url','https://⟦reviewer:p%40ssword⟧@example.org/'),
('query','https://example.org?access_token=⟦EVAL%2FTOKEN⟧&page=2'),
('query','https://example.org?%74oken=⟦EVAL_ONLY⟧&page=2'),
('otp','Verification code: ⟦654321⟧'),
('otp','PIN=⟦4321⟧'),
('email','Please ask ⟦reviewer@example.org⟧.'),
('email','⟦first.last+review@example.net⟧'),
('email-obfuscated','⟦reviewer [at] example [dot] org⟧'),
('phone','Mobile: ⟦011-23456789⟧'),
('phone','Reach me at ⟦+44 7700 900123⟧'),
('card','Sample card ⟦4111 1111 1111 1111⟧'),
('iban','⟦GB82 WEST 1234 5698 7654 32⟧'),
('personal','Home address: ⟦456 Fictional Avenue⟧'),
('personal','passport_number=⟦FAKE123456⟧'),
('personal','Full name: ⟦Fictional Example Person⟧'),
('personal','DOB: ⟦1999-12-31⟧'),
('personal','Bank_account_number: ⟦12345678⟧'),
('id','⟦010203-01-0000⟧'),
('ip','Private address ⟦10.20.30.40⟧'),
('unicode','pass\u200bword=“⟦ＥＶＡＬ＿ＳＥＣＲＥＴ⟧”'),
('multiline','password="⟦line one\nline two⟧"'),
('escaped','password="⟦EVAL\\"SECRET⟧"'),
('overlap','password="⟦Bearer EVAL_TOKEN and remainder⟧"'),
('private-key','⟦-----BEGIN PRIVATE KEY-----\nEVAL_ONLY_NOT_A_KEY\n-----END PRIVATE KEY-----⟧'),
('multiple','password=⟦EVAL_SECRET⟧; contact ⟦reviewer@example.org⟧'),
# Deliberate coverage challenges, retained even when missed.
('unlabelled-secret','The Wi-Fi phrase I use is ⟦fictional blue river seven⟧.'),
('unlabelled-personal','Send the parcel to ⟦789 Imaginary Lane⟧.'),
('encoded','Encoded credential, with no supported label: ⟦ZXZhbHVhdGlvbl9vbmx5X3NlY3JldA==⟧'),
('email-obfuscated','Contact ⟦reviewer AT example DOT org⟧'),
('none','Please review the report tomorrow.'),
('none','Order: ORD-2026-7890'),
('none','Basic knowledge is useful.'),
('none','const token_count = 9;'),
('none','const password = "";'),
('none','-----BEGIN PUBLIC KEY-----\nFAKE_PUBLIC_MATERIAL\n-----END PUBLIC KEY-----'),
('none','Version 3.4.5'),
('none','Total: RM 180.00; quantity: 3'),
('none','build_id=0123456789abcdef0123456789abcdef'),
# Context says these are intentionally public placeholders, so expected is empty.
('public-placeholder','Template only: password="YOUR_PASSWORD"'),
('public-placeholder','Demo documentation: api_key="REPLACE_ME"'),
('public-contact','Published help address: help@example.org'),
]
def parse(item,i,split):
 category,raw=item;text='';spans=[]
 while '⟦' in raw:
  prefix,raw=raw.split('⟦',1);value,raw=raw.split('⟧',1);text+=prefix
  start=len(text.encode('utf-16-le'))//2;text+=value;end=len(text.encode('utf-16-le'))//2
  spans.append({'start':start,'end':end,'category':category})
 text+=raw
 return {'id':f'{split}-{i:03d}','category':category,'text':text,'expected':spans,'synthetic':True}
for split,examples in [('development',DEV),('evaluation',EVAL)]:
 (ROOT/'datasets'/f'{split}.jsonl').write_text(''.join(json.dumps(parse(x,i+1,split),ensure_ascii=False)+'\n' for i,x in enumerate(examples)),encoding='utf8')
