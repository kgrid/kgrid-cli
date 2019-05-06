kgrid-cli
=========
[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![npm version](https://img.shields.io/npm/v/@kgrid/kgrid-cli.svg)](https://www.npmjs.com/package/@kgrid/kgrid-cli)
[![CircleCI](https://circleci.com/gh/kgrid/kgrid-cli/tree/master.svg?style=shield)](https://circleci.com/gh/kgrid/kgrid-cli/tree/master)
[![Downloads/week](https://img.shields.io/npm/dw/@kgrid/kgrid-cli.svg)](https://npmjs.org/package/@kgrid/kgrid-cli)
[![License](https://img.shields.io/npm/l/@kgrid/kgrid-cli.svg)](https://github.com/kgrid/kgrid-cli/blob/master/package.json)

Command-line tool for Knowledge Object developers

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @kgrid/kgrid-cli
$ kgrid COMMAND
running command...
$ kgrid (-v|--version|version)
@kgrid/kgrid-cli/0.0.3 linux-x64 node-v10.15.3
$ kgrid --help [COMMAND]
USAGE
  $ kgrid COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`kgrid add`](#kgrid-add)
* [`kgrid create [KO]`](#kgrid-create-ko)
* [`kgrid help [COMMAND]`](#kgrid-help-command)
* [`kgrid setup`](#kgrid-setup)
* [`kgrid start`](#kgrid-start)
* [`kgrid start:activator`](#kgrid-startactivator)
* [`kgrid start:library`](#kgrid-startlibrary)

## `kgrid add`

Add an implementation to the knowledge object.

```
USAGE
  $ kgrid add

OPTIONS
  -v, --version=version
```

_See code: [src/commands/add.js](https://github.com/kgrid/kgrid-cli/blob/v0.0.3/src/commands/add.js)_

## `kgrid create [KO]`

Create the knowledge object

```
USAGE
  $ kgrid create [KO]

OPTIONS
  -v, --version=version
```

_See code: [src/commands/create.js](https://github.com/kgrid/kgrid-cli/blob/v0.0.3/src/commands/create.js)_

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

## `kgrid setup`

Setup KGrid Component

```
USAGE
  $ kgrid setup

OPTIONS
  --home=home
```

_See code: [src/commands/setup.js](https://github.com/kgrid/kgrid-cli/blob/v0.0.3/src/commands/setup.js)_

## `kgrid start`

Start KGrid

```
USAGE
  $ kgrid start

OPTIONS
  -s, --shelf=shelf
```

_See code: [src/commands/start/index.js](https://github.com/kgrid/kgrid-cli/blob/v0.0.3/src/commands/start/index.js)_

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

_See code: [src/commands/start/activator.js](https://github.com/kgrid/kgrid-cli/blob/v0.0.3/src/commands/start/activator.js)_

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

_See code: [src/commands/start/library.js](https://github.com/kgrid/kgrid-cli/blob/v0.0.3/src/commands/start/library.js)_
<!-- commandsstop -->
