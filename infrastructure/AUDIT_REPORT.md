# Dependency Audit Report — Liveshop SaaS

**Date**: February 13, 2026  
**Scan Tool**: npm audit  
**Status**: 14 vulnerabilities identified (6 high, 6 moderate, 2 low)

## High Severity Issues

### 1. **Axios DoS via __proto__ Merging** 
- **Package**: axios ≤1.13.4  
- **CVE**: GHSA-43fc-jf86-j433
- **Risk**: Denial of Service via prototype pollution in mergeConfig
- **Fix**: `npm audit fix` (non-breaking)
- **Action**: Apply immediately

### 2. **Fastify DoS & Bypass Issues**
- **Package**: fastify ≤5.7.2
- **CVEs**:
  - GHSA-mrq3-vjjr-p77c: Unbounded memory allocation in sendWebStream
  - GHSA-jx2c-rxcm-jvmq: Content-Type header tab bypass
- **Fix**: `npm audit fix --force` → fastify@5.7.4 (breaking, verify compatibility)
- **Action**: Apply with testing

### 3. **Next.js DoS Vulnerabilities**
- **Package**: next ≥10.0.0
- **CVEs**:
  - GHSA-9g9p-9gw9-jx7f: Image Optimizer DoS via remotePatternsConfiguration  
  - GHSA-h25m-26qc-wcjf: HTTP deserialization DoS with RSC
- **Fix**: `npm audit fix --force` → next@16.1.6 (breaking, major version bump)
- **Action**: Plan major version upgrade; test web app build and runtime thoroughly

### 4. **glob CLI Command Injection**
- **Package**: glob ≥10.2.0
- **CVE**: GHSA-5j98-mcp5-4vw2
- **Risk**: Command injection if glob -c used with untrusted input
- **Fix**: `npm audit fix` (non-breaking)
- **Action**: Apply immediately

## Moderate Severity Issues

### 5. **esbuild SSRF in Dev Server**
- **Package**: esbuild ≤0.24.2 (via vite)
- **CVE**: GHSA-67mh-4wv8-2f99
- **Risk**: Dev server can send requests to arbitrary hosts
- **Impact**: Mostly dev environment (acceptance risk for dev)
- **Fix**: `npm audit fix --force` → vitest@4.0.18 (breaking)
- **Action**: Monitor; not critical for production

### 6. **fast-jwt: Improper iss Validation**
- **Package**: fast-jwt < 5.0.6 (via @fastify/jwt)
- **CVE**: GHSA-gm45-q3v2-6cf8
- **Risk**: JWT issuer claim validation bypass
- **Fix**: `npm audit fix --force` → @fastify/jwt@10.0.0 (breaking)
- **Action**: Apply with auth testing

### 7. **qs: arrayLimit Bypass DoS**
- **Package**: qs ≥6.7.0, ≤6.14.1
- **CVE**: GHSA-w7fw-mjwx-w883
- **Risk**: querystring parsing DoS via comma delimiters
- **Fix**: `npm audit fix` (non-breaking)
- **Action**: Apply immediately

## Remediation Plan

### Immediate (non-breaking fixes)
```bash
npm audit fix
```
- Fixes: axios, glob, qs

### Phase 2 (breaking upgrades; requires testing)
```bash
npm audit fix --force
```
- Upgrades: fastify@5.7.4, @fastify/jwt@10.0.0, vitest@4.0.18
- **Note**: test API, auth routes, dev environment thoroughly

### Phase 3 (major version upgrade; high effort)
Separate PR: next@16.x migration
- Requires full web app testing
- Update Image Optimizer configuration
- Verify Server Components compatibility

## Timeline
1. **Today**: Apply Phase 1 fixes (non-breaking)
2. **This week**: Test Phase 2 upgrades in staging branch
3. **Next sprint**: Plan Next.js 16 migration

## Risk Assessment
- **Production impact**: Low-to-Medium (fixes mostly improve stability)
- **Compatibility risk**: Medium (breaking upgrades need testing)
- **Recommended action**: Apply non-breaking fixes now; schedule breaking upgrades in sprint planning

---

**Signed off by**: [Engineering Lead] Date: _______  
**Next audit scheduled**: [Date + 1 month]
