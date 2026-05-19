# OpenConfigurator — Security Review

## Threat Model

OpenConfigurator is a client-side-only SPA with no backend. The attack surface is limited to:

1. **Cross-site scripting (XSS)** via embed API messages
2. **Prototype pollution** via JSON deserialization
3. **Local storage tampering** (saved configs, theme, locale)
4. **Supply chain** (npm dependencies)
5. **Iframe security** (embed mode)

## Current Mitigations

| Threat | Risk | Mitigation | Status |
|---|---|---|---|
| XSS via postMessage | Medium | Embed API validates `type` field, no innerHTML/eval | ✅ Implemented |
| XSS via URL hash | Low | `decodeSpecFromHash` runs through `sanitizePergolaSpec` which validates every field | ✅ Implemented |
| Prototype pollution | Low | `sanitizePergolaSpec` creates new objects, doesn't merge into prototypes | ✅ Implemented |
| localStorage injection | Low | `storage.get` wraps JSON.parse in try/catch, returns fallback on failure | ✅ Implemented |
| Iframe clickjacking | Low | Host controls iframe; configurator doesn't embed sensitive actions | ✅ By design |
| npm supply chain | Medium | `package-lock.json` pins versions; `npm audit` should run in CI | ⚠ Manual |
| Content Security Policy | Medium | No CSP headers yet (client-only, hosting-dependent) | ⚠ Future |
| Sensitive data in exports | Low | Lead form data only lives in browser + embed events, not persisted server-side | ✅ By design |

## Recommendations

1. **Add `npm audit` to CI** — flag known vulnerabilities in dependencies
2. **Validate postMessage origin** — `embedApi.on()` should accept an `allowedOrigins` parameter
3. **Sanitize PDF spec sheet** — `generateSpecSheetHtml` uses `escapeHtml()` for user-generated content ✅
4. **Add CSP meta tag** — `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self';">` when self-hosted
5. **Rate-limit embed API** — prevent message flooding from malicious host pages

## Data Privacy

| Data | Storage | Retention | User Control |
|---|---|---|---|
| Configuration spec | localStorage + URL hash | Until cleared | User can delete saved configs |
| Theme preference | localStorage | Persistent | Toggle button |
| Locale preference | localStorage | Persistent | Dropdown |
| Onboarding state | localStorage | Persistent | Restart button |
| Lead form submissions | In-memory only (emitted via embed API) | None server-side | N/A |
| Analytics events | In-memory only (passed to handlers) | Depends on handler | Handler-specific |

**No cookies, no server-side storage, no third-party tracking by default.**
