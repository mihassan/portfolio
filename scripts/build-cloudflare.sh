#!/bin/sh
set -eu

destination=${HUGO_DESTINATION:-public}
# Workers preview URLs are assigned after the build. Every build therefore uses
# the explicit production canonical until a separately approved domain cutover.
base_url=${SITE_BASE_URL:?SITE_BASE_URL is required}

exec hugo --gc --minify --cleanDestinationDir --destination "$destination" -b "$base_url"
