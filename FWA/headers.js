/* 
  Content-Security-Policy: default-src 'self'; img-src 'self' data:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: no-referrer-when-downgrade
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  Cache-Control: no-cache
  X-Custom-Site-Header: CustomValue

# Headers for HTML Files
/*.html
  Content-Type: text/html; charset=UTF-8
  X-Injectable: false  # Default to not injectable

# Headers for CSS Files
/*.css
  Content-Type: text/css; charset=UTF-8
  Cache-Control: max-age=86400  # Cache CSS files for a day

# Headers for JavaScript Files
/*.js
  Content-Type: application/javascript; charset=UTF-8
  Cache-Control: max-age=86400  # Cache JS files for a day

# Headers for JSON Files
/*.json
  Content-Type: application/json; charset=UTF-8
  Cache-Control: max-age=86400  # Cache JSON files for a day

# Special Handling for Individual HTML Files
