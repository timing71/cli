# Timing71 CLI

![AGPL v3.0](https://img.shields.io/github/license/timing71/cli)

[Timing71](https://www.timing71.org/) is a motorsports live timing aggregation
and analysis system.This package provides a command-line interface to Timing71
functionality.

## Usage

From the repo: `./src/index.js [options]`

Installed via yarn / npm: `timing71 [options]`

For consistency this guide will use the latter. Online help is available by
running `timing71 --help` or `timing71 help <command>`.

## Commands

### services

Usage: `timing71 services`

Displays a list of available service providers. If you haven't installed the
(private) `@timing71/services` package this is likely to be empty.

### start

Usage: `timing71 start <timing URL>`

Starts a timing service. With no other options specified, data will be
displayed on stdout. If the URL supplied is not supported by any available
service provider then an error message is displayed and the program will exit.
