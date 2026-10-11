#!/bin/bash
cd "$(dirname "$0")"
node tools/build-posts.js
echo
read -n 1 -s -r -p "按任意键关闭"
