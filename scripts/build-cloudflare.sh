#!/bin/sh
set -eu

branch=${CF_PAGES_BRANCH:?CF_PAGES_BRANCH is required}
destination=${HUGO_DESTINATION:-public}

# Production uses an explicit canonical URL; previews use their deployment URL.
if [ "$branch" = "main" ]; then
    base_url=${SITE_BASE_URL:?SITE_BASE_URL is required for the production branch}
else
    base_url=${CF_PAGES_URL:?CF_PAGES_URL is required for preview branches}
fi

exec hugo --gc --minify --cleanDestinationDir --destination "$destination" -b "$base_url"
