#!/usr/bin/env bash
# Helper: drive aidlc-orchestrate.ts next/continue until a run-stage (or other terminal) directive is returned.
set -euo pipefail
cd /home/claude/aidlc-project
out=$(bun .claude/tools/aidlc-orchestrate.ts next 2>/dev/null)
kind=$(echo "$out" | python3 -c "import json,sys; print(json.load(sys.stdin).get('kind',''))")
while [ "$kind" = "load-steering" ]; do
  token=$(echo "$out" | python3 -c "import json,sys; print(json.load(sys.stdin)['continue_token'])")
  out=$(bun .claude/tools/aidlc-orchestrate.ts continue "$token" 2>/dev/null)
  kind=$(echo "$out" | python3 -c "import json,sys; print(json.load(sys.stdin).get('kind',''))")
done
echo "$out"
