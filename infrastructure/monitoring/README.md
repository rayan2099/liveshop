**Prometheus monitoring for Liveshop**

This folder contains example Prometheus alert rules and guidance for scraping service metrics.

How to use

- Add a `scrape_config` for each service, pointing to their `/metrics` endpoint (API and streaming services).
- Load `alerts.yml` into Prometheus `rule_files` and configure Alertmanager for notifications.

Example scrape config (prometheus.yml):

```yaml
scrape_configs:
  - job_name: 'liveshop-api'
    static_configs:
      - targets: ['api:3001']

  - job_name: 'liveshop-streaming'
    static_configs:
      - targets: ['streaming:3002']
```

Notes
- Secure the `/metrics` endpoint in production (IP allowlist or basic auth) if exposing sensitive labels.
- Tune alert thresholds to your traffic patterns before enabling paging alerts.
