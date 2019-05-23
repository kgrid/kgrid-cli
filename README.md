kgrid-cli
=========
[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![npm version](https://img.shields.io/npm/v/@kgrid/cli.svg)](https://www.npmjs.com/package/@kgrid/cli)
[![CircleCI](https://circleci.com/gh/kgrid/kgrid-cli/tree/master.svg?style=shield)](https://circleci.com/gh/kgrid/kgrid-cli/tree/master)
[![Downloads/week](https://img.shields.io/npm/dw/@kgrid/cli.svg)](https://npmjs.org/package/@kgrid/cli)
[![License](https://img.shields.io/npm/l/@kgrid/cli.svg)](https://github.com/kgrid/kgrid-cli/blob/master/package.json)

Command-line tool for Knowledge Object developers

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @kgrid/cli
$ kgrid COMMAND
running command...
$ kgrid (-v|--version|version)
@kgrid/cli/0.0.8 linux-x64 node-v10.15.3
$ kgrid --help [COMMAND]
USAGE
  $ kgrid COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`kgrid create [KO]`](#kgrid-create-ko)
* [`kgrid help [COMMAND]`](#kgrid-help-command)
* [`kgrid package [KO] [DEST]`](#kgrid-package-ko-dest)
* [`kgrid setup`](#kgrid-setup)
* [`kgrid start`](#kgrid-start)
* [`kgrid start:activator`](#kgrid-startactivator)
* [`kgrid start:library`](#kgrid-startlibrary)

## `kgrid create [KO]`

Create the knowledge object

```
USAGE
  $ kgrid create [KO]

OPTIONS
  -i, --implementation=implementation
  --bundled
  --flat
```

_See code: [src/commands/create.js](https://github.com/kgrid/kgrid-cli/blob/v0.0.8/src/commands/create.js)_

## `kgrid help [COMMAND]`

display help for kgrid

```
USAGE
  $ kgrid help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.1.6/src/commands/help.ts)_

## `kgrid package [KO] [DEST]`

Package the knowledge object

```
USAGE
  $ kgrid package [KO] [DEST]

OPTIONS
  -i, --implementation=implementation
  -s, --includeSource=includeSource
  -t, --includeTests=includeTests
```

_See code: [src/commands/package.js](https://github.com/kgrid/kgrid-cli/blob/v0.0.8/src/commands/package.js)_

## `kgrid setup`

Setup KGrid Component

```
USAGE
  $ kgrid setup

OPTIONS
  -g, --global
  -u, --update
```

_See code: [src/commands/setup.js](https://github.com/kgrid/kgrid-cli/blob/v0.0.8/src/commands/setup.js)_

## `kgrid start`

Start KGrid

```
USAGE
  $ kgrid start

OPTIONS
  -s, --shelf=shelf
```

_See code: [src/commands/start/index.js](https://github.com/kgrid/kgrid-cli/blob/v0.0.8/src/commands/start/index.js)_

## `kgrid start:activator`

Start KGrid Activator

```
USAGE
  $ kgrid start:activator

OPTIONS
  -j, --jarfile=jarfile
  -p, --port=port
  -s, --shelf=shelf
```

_See code: [src/commands/start/activator.js](https://github.com/kgrid/kgrid-cli/blob/v0.0.8/src/commands/start/activator.js)_

## `kgrid start:library`

Start KGrid Library

```
USAGE
  $ kgrid start:library

OPTIONS
  -j, --jarfile=jarfile
  -p, --port=port
  -s, --shelf=shelf
```

_See code: [src/commands/start/library.js](https://github.com/kgrid/kgrid-cli/blob/v0.0.8/src/commands/start/library.js)_
<!-- commandsstop -->
