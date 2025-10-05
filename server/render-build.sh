#!/usr/bin/env bash

# Download the correct tectonic release (update version if needed)
curl -L -o tectonic.tar.gz https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%400.14.1/tectonic-0.14.1-x86_64-unknown-linux-musl.tar.gz

# Extract the tarball
tar -xzf tectonic.tar.gz

# Move the tectonic binary to the project root
mv tectonic-0.14.1-x86_64-unknown-linux-musl/tectonic .

# Make it executable
chmod +x ./tectonic

# Clean up
rm -rf tectonic-0.14.1-x86_64-unknown-linux-musl tectonic.tar.gz