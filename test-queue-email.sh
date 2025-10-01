#!/bin/bash

echo "Testing queue-based domain email endpoint..."

curl -X POST http://localhost:3001/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "from": "devchuckcamp.dev@gmail.com",
    "to": "santiagonicolas.granada@gmail.com",
    "subject": "Test Queue Email via Domain Layer",
    "textContent": "This email was sent through the domain-driven design queue system!",
    "htmlContent": "<h1>Test Queue Email</h1><p>This email was sent through the domain-driven design queue system!</p>"
  }'

echo -e "\n\nEmail should now be queued for processing!"