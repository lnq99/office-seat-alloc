#!/usr/bin/env sh

# abort on errors
set -e

# # build
npm run build

# # navigate into the build output directory
cd dist

git init
git add -A
git commit -m 'deploy'

# if you are deploying to https://lnq99.github.io/seat-alloc
git push -f git@github.com:lnq99/seat-alloc.git master:main

cd -