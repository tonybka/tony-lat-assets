#!/usr/bin/env bash

current_path=$(pwd)
snapshot_dir="${current_path}/snapshot_data"

if [ -d "$snapshot_dir" ]; then
  printf '%s\n' "Remove existing snapshot folder: $snapshot_dir"
  rm -rf "$snapshot_dir"
fi
mkdir -p "$snapshot_dir"
