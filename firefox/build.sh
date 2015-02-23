#!/bin/sh
mkdir -p data/core
mkdir -p lib/core
cp -ar ../core/data/* data/core
cp -ar ../core/lib/* lib/core

cfx xpi
