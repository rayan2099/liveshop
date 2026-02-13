# Production Hardening Guide — Liveshop SaaS

## Pre-Release Checklist

### Security Headers ✅ Added
- [x] X-Content-Type-Options: nosniff (prevent MIME sniffing)
- [x] X-Frame-Options: DENY (prevent clickjacking)
- [x] X-XSS-Protection: 1; mode=block (legacy XSS filter)
- [x] Referrer-Policy: strict-origin-when-cross-origin
- [x] HSTS: max-age=31536000 (production only, 1 year)

**Where**: `services/api/src/server.ts` onSend hook

### Dependency Audit ✅ Completed
- [x] 14 vulnerabilities identified
- [x] Non-breaking fixes applied (2 vulnerabilities reduced)
- [ ] Breaking fixes scheduled (fastify, @fastify/jwt, vitest)
- [ ] Next.js 16 migration planned

**Report**: [infrastructure/AUDIT_REPORT.md](infrastructure/AUDIT_REPORT.md)

### Rate Limiting & DDoS Protection
**Current**: @fastify/rate-limit enabled (100 req/min default)

**Recommendations for production**:
```typescript
// Tighten rate limits per endpoint
POST /auth/login: 5 req/min per IP
POST /auth/signup: 3 req/hour per IP
GET /health: unlimited
POST /orders: 10 req/min per user
GET /streams: 20 req/min per user
```

**Deploy**: Use API Gateway (AWS ALB, Cloudflare) for DDoS mitigation

### Database Security
**Current**: 
- Database credentials in .env (template provided)
- Connections over internal network only

**Recommendations**:
- [ ] Enable Postgres SSL connections (sslmode=require)
- [ ] Set up connection pooling (pgBouncer)
- [ ] Enable audit logging for sensitive tables (users, payments, deliveries)
- [ ] Regular backups (encrypted, tested for restore)

### Secrets Management
**Current**: `.env.template` provided, .env not in repo

**For production**:
- [ ] Use AWS Secrets Manager / HashiCorp Vault
- [ ] Rotate API keys quarterly
  - JWT_SECRET (sign new tokens after rotation)
  - STRIPE_SECRET_KEY
  - Database passwords
  - Redis passwords
- [ ] Separate prod/staging credentials

### WebSocket (Streaming) Security
**Current**: Socket.io with CORS origin check

**Recommendations**:
- [ ] Enforce WSS (wss://) scheme in production
- [ ] Validate JWT on socket connect (already implemented)
- [ ] Set socket.io heartbeat timeout: `{ upgradeTimeout: 10000 }`
- [ ] Limit concurrent connections per user
- [ ] Monitor WebSocket disconnect spikes (alert rule: >10% spike in 5m)

### Payment Processing (Stripe)
**Current**: Using testable config, no card storage

**For production**:
- [ ] PCI-DSS compliance audit (Stripe handles most burden via tokenization)
- [ ] Never log full card numbers or CvV
- [ ] Webhook signature validation enabled
- [ ] Webhook delivery monitoring
- [ ] Refund audit trail maintained

### Logging & Monitoring
**Current**: Structured logs (requestId, userId, tenantId, streamId)

**For production**:
- [ ] Centralized log aggregation (ELK, CloudWatch, Datadog)
- [ ] Mask sensitive fields in logs (passwords, PII)
- [ ] Alert on:
  - 5xx error rate >5% (alert: critical)
  - Auth failure spike >10x baseline (alert: warning)
  - Database query latency p95 >1s (alert: warning)
  - WebSocket disconnect spike (alert: warning)
- [ ] Daily backup job monitor
- [ ] Incident response alerting (PagerDuty, Opsgenie)

### Browser Security
**For web app (Next.js)**:
- [ ] Content-Security-Policy header
- [ ] No inline scripts (CSP nonce-based approach)
- [ ] SRI (Subresource Integrity) for CDN resources
- [ ] Secure cookies: HttpOnly, Secure (HTTPS only), SameSite=Strict

### Third-Party Integrations Security
| Service | Current | Recommendation |
|---------|---------|-----------------|
| Stripe | Testable keys | Rotate annually; use restricted keys scopes |
| Twilio | SMS service | Monitor SMS delivery failures; set fraud alerts |
| Resend | Email | SPF/DKIM/DMARC configured; monitor bounce rates|
| MinIO | Public endpoint 9000/9001 | Restrict network access; disable public console in prod |
| Postgres | Port 5432 (internal) | No change; internal network only |
| Redis | No auth on Port 6379 | **ADD** Redis password; use requirepass config |

### Deployment Security
**Recommendations**:
- [ ] Docker images scanned for CVEs (Trivy)
- [ ] Base image: `node:20-alpine` (minimal attack surface)
- [ ] No secrets in Docker build (use build args, env vars at runtime)
- [ ] Secrets mounted from external vaults (AWS Secrets Manager, K8s secrets)
- [ ] Container restart policies (always, unless-stopped)
- [ ] Health checks configured (liveness, readiness probes if K8s)

### Incident Response
**Setup**:
- [ ] Create security contact: security@liveshop.io
- [ ] PGP key published (for encrypted incident reports)
- [ ] Runbooks:
  - Credential compromise
  - Data breach discovery
  - DDoS mitigation
  - Payment system incident
- [ ] On-call rotation (engineering + ops)
- [ ] Post-incident review process

### Access Control
**Principle of Least Privilege**:
- [ ] App services run as unprivileged user (not root)
- [ ] Database user has minimal permissions (app user ≠ admin)
- [ ] Cloud IAM roles narrowly scoped
- [ ] API keys with restricted capability scopes
- [ ] No hardcoded credentials in code

### Backup & Disaster Recovery
**Current**: Backup/restore runbook available

**For production**:
- [ ] Automated daily backups (encrypted, immutable)
- [ ] Test restore quarterly in staging
- [ ] RTO (Recovery Time Objective): < 1 hour
- [ ] RPO (Recovery Point Objective): < 24 hours
- [ ] Offsite backup copy (cross-region or external)

### Compliance & Documentation
**Required**:
- [ ] Privacy Policy (PII handling, retention, rights)
- [ ] Terms of Service (liability, acceptable use)
- [ ] Data Processing Agreement (if handling customer data)
- [ ] Security incident contact policy
- [ ] GDPR compliance (if serving EU customers): data export, deletion

**Optional but recommended**:
- [ ] SOC 2 Type II audit (attracts enterprise customers)
- [ ] Penetration test (annual, 3rd-party firm)
- [ ] Bug bounty program (e.g., HackerOne, Bugcrowd)

---

## Go/No-Go Launch Checklist
- [ ] All critical security headers deployed
- [ ] npm audit: no high-severity unpatched vulnerabilities
- [ ] Rate limiting configured and tested
- [ ] Logging & monitoring live and alerting
- [ ] Secrets management in place
- [ ] TLS certs provisioned (valid domain)
- [ ] Incident response contacts configured
- [ ] Backup/restore tested in staging
- [ ] Load test passed (see: PR8 results)
- [ ] Soak test passed (see: PR8 results)
- [ ] Security checklist signed off (engineering + ops)

**Launch approved**: _________________ Date: _______
