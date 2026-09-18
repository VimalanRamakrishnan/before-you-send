# Detection coverage — v0.2

These are local pattern checks. No credential is submitted to a provider to test validity. The same text and profile produce the same findings. Priority is a review category, not an accuracy percentage or proof of a leak.

## Both profiles

| Family | Coverage / important boundaries |
| --- | --- |
| Private keys | Supported PEM/OpenSSH and PGP private-key headers. Unclosed blocks cover through end of input. Public-key blocks are not this rule. |
| GitHub | Selected ghp/gho/ghu/ghs/ghr and github_pat token shapes. |
| AWS | AKIA/ASIA access key IDs; secret keys require a supported label or another heuristic. |
| Stripe | sk/rk live/test patterns. Publishable pk keys are not the Stripe secret rule. |
| Slack | Selected xox token prefixes and Slack webhook URLs. |
| Other API keys | Selected sk-, AIza, npm_, glpat-, and SendGrid-like shapes. These are approximate patterns, not exhaustive provider support. |
| Webhooks | Supported Slack and Discord webhook URLs; whole URL redaction. |
| Authorization | Bearer values and Basic values in Authorization headers. |
| JWT-like tokens | Three/five-part eyJ-prefixed patterns, without signature, claims, expiry or issuer verification. |
| URL user information | Username/password pairs in scheme://user:password@host; encoded credentials are covered as original text. |
| Sensitive URL parameters | Supported token, key, password, signature and authorization-code names. One layer of percent decoding for selected encoded parameter names; no recursive decoding. |
| Cookies | Cookie/Set-Cookie header values through the end of the line. Nonsecret cookies may be included. |
| Labelled secrets | Common password/key/token names, common separators and bounded environment-variable prefixes. Quoted, multiline, escaped, short and unclosed values. |
| OTP/PIN/recovery codes | Supported explicit labels followed by an alphanumeric/hyphenated value. |
| Email | ASCII-style email patterns with dotted domains, including selected normalized copy/paste variants; not a full RFC parser. |
| Phone | Heuristic international (+) and Malaysian-style forms; not universal numbering-plan validation. |
| Payment card | 13–19 digit candidates with optional space/tab/hyphen separators and a Luhn checksum. |
| IBAN | Uppercase IBAN-like candidates with mod-97 checksum; no country-length registry, bank or account validation. |
| Labelled personal data | Selected name/address/DOB/passport/ID/account/CVV/phone labels. The field value is covered, not semantically identified as a real person. |

## Strict-only additions

- Obfuscated emails using [at]/(at) and [dot]/(dot).
- Malaysian ID-like numbers in YYMMDD-XX-XXXX form with a plausible date; no identity or state-code validation.
- IPv4 strings with octets no greater than 255. IP addresses can be public and harmless.
- Unlabelled token-like strings of 32–256 characters with mixed letter cases, digits and sufficient character variation. Hashes and ordinary IDs can trigger this heuristic.

Balanced keeps the core families and omits these broad heuristics. Strict is the default and increases review workload; it cannot guarantee fewer misses in every real-world situation.

## Copy/paste normalization

Matching uses per-code-point Unicode NFKC normalization, selected Arabic/Persian digits, selected quote/dash variants and removal of selected invisible/bidirectional formatting characters. Original text is preserved. Finding offsets map back to the original UTF-16 string, so redaction removes the original span, including invisible characters inside it.

This is not universal deobfuscation. It does not decode arbitrary base64, hex, HTML entities, escaped Unicode sequences, nested encodings, transliterations or visually similar letters from every script. Removing all Unicode separators is deliberately not attempted.

## Overlaps and output

Overlapping detected intervals are joined, and the strongest priority is retained. All detected spans in that union are removed when its checkbox is selected. This may intentionally remove more than one item, and the UI explains when several checks overlap. Adjacent, non-overlapping spans stay separate.

Redaction is user-controlled. Unchecking a finding leaves that span in the output. A copied result may still contain unsupported sensitive content or details the user chose to retain. No finding is silently treated as safe or automatically allowlisted.

## Known exclusions

No universal recognition of names, addresses, government IDs, passport formats, financial/medical/legal content, trade secrets, passwords without context, every API provider, every phone format, machine-readable binary data, non-text files, images, attachments, QR codes, audio or encrypted content. No automatic verification against breach databases. No monitoring or send interception.

Long or unusual text can hit the worker timeout. A timed-out or capped check must be split and checked again. Results of a completed check still apply only to supported patterns.

## Reference material used when reviewing scope

- Chrome activeTab and scripting: https://developer.chrome.com/docs/extensions/develop/concepts/activeTab and https://developer.chrome.com/docs/extensions/reference/api/scripting
- GitHub describes distinct supported secret patterns: https://docs.github.com/code-security/reference/secret-security/supported-secret-scanning-patterns
- Stripe secret/restricted/publishable key roles: https://docs.stripe.com/keys
- Slack token types: https://docs.slack.dev/authentication/tokens

These references inform terminology and scope. This extension does not implement GitHub's scanner or claim equivalent coverage. Pattern formats change and require maintenance.

Version 0.3 can explicitly import supported text/code files. This does not add PDF, Word, image, archive or general attachment scanning. CSV is read as plain text, not parsed or executed as a spreadsheet.
