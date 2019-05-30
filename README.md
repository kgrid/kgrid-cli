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
@kgrid/cli/0.0.9 win32-x64 node-v10.15.3
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
* [`kgrid package [KO] [DESTINATION]`](#kgrid-package-ko-destination)
* [`kgrid setup`](#kgrid-setup)
* [`kgrid start`](#kgrid-start)
* [`kgrid start:activator`](#kgrid-startactivator)
* [`kgrid start:library`](#kgrid-startlibrary)

## `kgrid create [KO]`

Create Knowledge Object and initialize the implementation.

```
USAGE
  $ kgrid create [KO]

OPTIONS
  -i, --implementation=implementation  the name for the implementation
  --bundled                            Using the template for bundled KO
  --simple                             Using the simple template

DESCRIPTION
  The create command requires a name for the knowledge object.
  It can only run at the shelf level.

  A folder for the knowledge object will be created.
  An implementation will be created and initialized in the folder of [ko].

  If the specified KO exists, an implementation will be added to the KO.

  IMPLEMENTATION NAME:
     The user will be prompted to enter a name;
     Or, the name can be specified on the command line using the flag -i.

  ARK ID:
     A development ARK ID will be assigned {username}/{ko}/{implementation}.
     The ARK ID is unique by having different implementation names in the same KO.

  IMPLEMENTATION TEMPLATE TYPE:
     The implementation will be initialized using one of the templates.
     The template can be specified using the flags:
       --simple    for the template with simple JAVASCRIPT file as payload
       --bundled   for the template with JAVASCRIPT file(s); the payload will require bundling
     By default, the simple template will be used
```

_See code: [src\commands\create.js](https://github.com/kgrid/kgrid-cli/blob/v0.0.9/src\commands\create.js)_

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

## `kgrid package [KO] [DESTINATION]`

Package the knowledge object.

```
USAGE
  $ kgrid package [KO] [DESTINATION]

DESCRIPTION
  Package the specified KO into a ZIP file, ready for depositing into a KGrid Library or deploying to a KGrid Activator
```

_See code: [src\commands\package.js](https://github.com/kgrid/kgrid-cli/blob/v0.0.9/src\commands\package.js)_

## `kgrid setup`

Install KGrid Components and set up kgrid environment.

```
USAGE
  $ kgrid setup

OPTIONS
  -g, --global
  -u, --update

DESCRIPTION
  KGrid Activator and Library JAR files will be downloaded and installed.
```

_See code: [src\commands\setup.js](https://github.com/kgrid/kgrid-cli/blob/v0.0.9/src\commands\setup.js)_

## `kgrid start`

Start Both KGrid Activator and KGrid Library.

```
USAGE
  $ kgrid start

OPTIONS
  -s, --shelf=shelf

DESCRIPTION
  This command will start both KGrid Activator and KGrid Library.
  By default, the command will use the current directory as the shelf
  The shelf can be specified using the flag -s.
  The default port for Activator and library are 8081 and 8082, respectively.
  KGrid Activator and KGrid Library can be started individually, also with more options for configuration.
  See the commands listed below.
```

_See code: [src\commands\start\index.js](https://github.com/kgrid/kgrid-cli/blob/v0.0.9/src\commands\start\index.js)_

## `kgrid start:activator`

Start KGrid Activator.

```
USAGE
  $ kgrid start:activator

OPTIONS
  -j, --jarfile=jarfile
  -p, --port=port
  -s, --shelf=shelf

DESCRIPTION
  Start KGrid Activator. 
  Default port: 8080
```

_See code: [src\commands\start\activator.js](https://github.com/kgrid/kgrid-cli/blob/v0.0.9/src\commands\start\activator.js)_

## `kgrid start:library`

Start KGrid Library.

```
USAGE
  $ kgrid start:library

OPTIONS
  -j, --jarfile=jarfile
  -p, --port=port
  -s, --shelf=shelf

DESCRIPTION
  Start KGrid Library. 
  Default port: 8080
```

_See code: [src\commands\start\library.js](https://github.com/kgrid/kgrid-cli/blob/v0.0.9/src\commands\start\library.js)_
<!-- commandsstop -->
