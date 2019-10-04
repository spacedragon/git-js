#!/bin/bash
set -euo pipefail
set +x

readonly ACCESS_KEY="${ACCESS_KEY:?'AWS Access Key needed'}"
readonly NPM_PASSWORD="${NPM_PASSWORD:?'NPM Password needed'}"
readonly SECRET_ACCESS_KEY="${SECRET_ACCESS_KEY:?'AWS Secret Key needed'}"

AWS_ACCESS_KEY=${ACCESS_KEY} AWS_SECRET_ACCESS_KEY=${SECRET_ACCESS_KEY} node scripts/upload.js

npm config set //registry.npmjs.org/:_authToken ${NPM_PASSWORD}

npm publish
