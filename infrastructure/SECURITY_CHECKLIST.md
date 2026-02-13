# Security Review Checklist — Liveshop SaaS

## Authentication & Authorization
- [ ] JWT tokens have expiry (short-lived access, refresh token rotation)
- [ ] Rate limiting enabled on auth endpoints
- [ ] Brute force protection on login (fail2ban or similar)
- [ ] MFA support optional (ready for future implementation)
- [ ] Session invalidation on logout
- [ ] Password hashing with bcrypt or Argon2
- [ ] No credentials in logs or error messages
- [ ] API keys/secrets stored in secure vaults (not .env in repo)

## API Security
- [ ] All endpoints require authentication (except health, /metrics, login, signup)
- [ ] CORS origin allowlist configured (not wildcard)
- [ ] CORS credentials handled securely
- [ ] SQL injection prevented (using Prisma ORM)
- [ ] XSS protection enabled (Content-Security-Policy headers)
- [ ] CSRF tokens on state-changing operations
- [ ] Request size limits enforced
- [ ] Timeout policies on long-running operations

## Transport Security
- [ ] HTTPS enforced in production
- [ ] HSTS header set (min 1 year)
- [ ] TLS 1.2+ required
- [ ] Certificate pinning for third-party APIs (Stripe, Twilio, etc.)
- [ ] WebSocket connections over WSS (wss://) in production

## Data Protection
- [ ] Sensitive data encrypted at rest (payment info, PII)
- [ ] Database credentials not in code
- [ ] Secrets rotation policy (API keys, DB passwords, signing keys)
- [ ] Backup encryption enabled
- [ ] No personally identifiable data in logs
- [ ] GDPR compliance (data export, deletion)

## Dependency Management
- [ ] Dependency audit run regularly (npm audit)
- [ ] High/Critical CVEs remediated immediately
- [ ] Lock file committed (prevent supply chain attacks)
- [ ] Third-party library assessment (maintenance, security track record)
- [ ] Outdated dependencies flagged for upgrade roadmap
- [ ] No dev dependencies in production builds

## Infrastructure & Deployment
- [ ] Firewall rules restrict port exposure
- [ ] Internal service networks isolated
- [ ] Secrets not in Docker images (use env vars or vaults)
- [ ] Container scanning for vulnerabilities
- [ ] Least-privilege IAM roles (cloud deployments)
- [ ] Logging and monitoring enabled
- [ ] Incident response plan documented

## Monitoring & Alerting
- [ ] 5xx error rate monitored
- [ ] Latency p95/p99 monitored
- [ ] Authentication failure spikes alerted
- [ ] Unusual API access patterns flagged
- [ ] Failed payment transaction alerts
- [ ] Backup/restore job monitoring

## Compliance & Documentation
- [ ] Security contacts documented (security@liveshop.io, PGP key)
- [ ] Incident response runbook
- [ ] Privacy policy & Terms of Service
- [ ] PII handling documented
- [ ] PCI-DSS compliance (payment processing): card data not stored locally
- [ ] Data retention policy

## Third-Party Integrations
- [ ] Stripe: testable sandbox environment configured
- [ ] Twilio: API keys rotated regularly
- [ ] Email (Resend): SPF/DKIM/DMARC configured
- [ ] No API secrets hardcoded
- [ ] API endpoint validation (no open redirects)

## Code Quality & Testing
- [ ] Automated security scanning (SAST: ESLint rules, semgrep)
- [ ] Dependency scanning (SBOM, Snyk, Dependabot)
- [ ] Secret scanning in git history (gitleaks)
- [ ] Penetration test recommendations (optional external firm)
- [ ] Security unit tests (e.g., authorization checks)

## Signoff
- [ ] Engineering lead review: _________________ Date: _______
- [ ] Operations lead review: _________________ Date: _______
- [ ] Security lead (external or designated): _________________ Date: _______

---

## Known Limitations & Accepted Risks
- [ ] Self-hosted Mediasoup (vs. managed video SaaS): ops overhead, security patching responsibility
- [ ] MinIO (vs. cloud S3): ops overhead, backup responsibility
- [ ] Custom auth (vs. Auth0/Cognito): maintenance burden, but full control

---

## Remediation Tracking
| Issue | Severity | Owner | Target Date | Status |
|-------|----------|-------|-------------|--------|
| API TS strict mode fixup | Low | Backend | TBD | Open |
| Penetration test (optional) | Medium | Security | TBD | Pending |
| Payment audit (PCI) | High | Ops | TBD | Pending |
