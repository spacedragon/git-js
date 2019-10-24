#!/bin/bash
set -euo pipefail

yarn install --ignore-scripts

node scripts/build.js
