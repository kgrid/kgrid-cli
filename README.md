kgrid-cli
=========

Command-line tool for Knowledge Object developers

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/kgrid-cli.svg)](https://npmjs.org/package/kgrid-cli)
[![CircleCI](https://circleci.com/gh/kgrid/kgrid-cli/tree/master.svg?style=shield)](https://circleci.com/gh/kgrid/kgrid-cli/tree/master)
[![Downloads/week](https://img.shields.io/npm/dw/kgrid-cli.svg)](https://npmjs.org/package/kgrid-cli)
[![License](https://img.shields.io/npm/l/kgrid-cli.svg)](https://github.com/kgrid/kgrid-cli/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g kgrid-cli
$ kgrid COMMAND
running command...
$ kgrid (-v|--version|version)
kgrid-cli/0.1.0 win32-x64 node-v8.12.0
$ kgrid --help [COMMAND]
USAGE
  $ kgrid COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`kgrid init`](#kgrid-init)
* [`kgrid hello`](#kgrid-hello)
* [`kgrid help [COMMAND]`](#kgrid-help-command)

## `kgrid init`

Create the knowledge object implementation

```
USAGE
  $ kgrid init

OPTIONS
  -v, --version=version  version for the implementation

DESCRIPTION
  ...
  Extra documentation goes here
```

_See code: [src\commands\init.js](https://github.com/kgrid/kgrid-cli/blob/v0.1.0/src\commands\init.js)_

## `kgrid hello`

Describe the command here

```
USAGE
  $ kgrid hello

OPTIONS
  -n, --name=name  name to print

DESCRIPTION
  ...
  Extra documentation goes here
```

_See code: [src\commands\hello.js](https://github.com/kgrid/kgrid-cli/blob/v0.1.0/src\commands\hello.js)_

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

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.1.6/src\commands\help.ts)_
<!-- commandsstop -->
