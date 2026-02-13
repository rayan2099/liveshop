# Backup & Restore Runbook — Postgres + Object Storage (MinIO/S3)

This runbook describes recommended backup and restore procedures for Postgres and object storage used by Liveshop.

Prerequisites
- `pg_dump` and `psql` (Postgres client)
- `mc` (MinIO client) or `aws` CLI configured for S3-compatible endpoint
- Access credentials for the Postgres superuser and MinIO admin

Environment variables
- Postgres: `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`
- MinIO: `MINIO_ENDPOINT`, `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD`, `MINIO_BUCKET`

Backups

Postgres logical backup (recommended for smaller DBs / portability):

```bash
# Full DB dump to compressed file
PGHOST=postgres HOSTPORT=5432 PGUSER="$POSTGRES_USER" PGPASSWORD="$POSTGRES_PASSWORD" PGDATABASE="$POSTGRES_DB" \
pg_dump -Fc -f /backups/liveshop-$(date +%F-%H%M).dump
```

Postgres physical backup (for large DBs / PITR) — use `pg_basebackup` or filesystem snapshot of the data directory when using managed storage.

MinIO (object storage) backup (using `mc`):

```bash
# Configure alias (one-time)
mc alias set liveshop "$MINIO_ENDPOINT" "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD"

# Mirror bucket to local filesystem or another bucket
mc mirror liveshop/$MINIO_BUCKET /backups/minio/$MINIO_BUCKET-$(date +%F)
```

Restore

Restore Postgres from logical dump:

```bash
# Create DB (if needed)
createdb -U "$PGUSER" -h "$PGHOST" "$PGDATABASE"

# Restore
pg_restore -U "$PGUSER" -h "$PGHOST" -d "$PGDATABASE" /backups/liveshop-YYYY-MM-DD.dump
```

Restore MinIO objects:

```bash
mc alias set liveshop_restore "$MINIO_ENDPOINT" "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD"
mc mirror /backups/minio/$MINIO_BUCKET-YYYY-MM-DD liveshop_restore/$MINIO_BUCKET
```

Verification
- Check Postgres: run smoke queries (count rows, check latest transactions)
- Check object storage: list recent keys, sample-download representative objects

Notes & operational guidance
- Rotate backups daily and keep a retention policy (e.g., daily x7, weekly x4, monthly x6)
- Encrypt backups at rest and during transfer
- Test full restores quarterly in a staging environment
- For high-traffic services consider PITR (Point-in-time recovery) with WAL archiving
