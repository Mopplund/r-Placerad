#!/bin/bash

SIZEW=200
SIZEH=100

# Generate a single row
row=$(printf '"#FFFFFF",%.0s' $(seq 1 $SIZEW))
row="[${row%,}]"

# Generate full field array
field="["
for i in $(seq 1 $SIZEH); do
  field+=$row
  if [ "$i" -lt "$SIZEH" ]; then
    field+=","
  fi
done
field+="]"

# Compose JSON payload
json="{\"fieldWidth\":$SIZEW,\"fieldHeight\":$SIZEH,\"field\":$field}"

# Write JSON to file
echo "$json" > canvas.json

# Send request using file
curl -X POST http://localhost:3001/api/canva \
  -H "Content-Type: application/json" \
  --data @canvas.json

# Optional: clean up
rm canvas.json
