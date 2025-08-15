#!/bin/bash

SIZEW=200
SIZEH=100


row=$(printf '"#FFFFFF",%.0s' $(seq 1 $SIZEW))
row="[${row%,}]"


field="["
for i in $(seq 1 $SIZEH); do
  field+=$row
  if [ "$i" -lt "$SIZEH" ]; then
    field+=","
  fi
done
field+="]"

json="{\"fieldWidth\":$SIZEW,\"fieldHeight\":$SIZEH,\"field\":$field}"

echo "$json" > canvas.json

curl -X POST http://localhost:3001/api/canva \
  -H "Content-Type: application/json" \
  --data @canvas.json


rm canvas.json
