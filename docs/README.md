KGrid CLI
=========
[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![npm version](https://img.shields.io/npm/v/@kgrid/cli.svg)](https://www.npmjs.com/package/@kgrid/cli)
[![CircleCI](https://circleci.com/gh/kgrid/kgrid-cli/tree/master.svg?style=shield)](https://circleci.com/gh/kgrid/kgrid-cli/tree/master)
[![Downloads/week](https://img.shields.io/npm/dw/@kgrid/cli.svg)](https://npmjs.org/package/@kgrid/cli)
[![License](https://img.shields.io/npm/l/@kgrid/cli.svg)](https://github.com/kgrid/kgrid-cli/blob/master/package.json)

Command-line tool for Knowledge Object developers

<!-- toc -->

<!-- tocstop -->

 # Usage
 <!-- usage -->
```sh-session
$ npm install -g @kgrid/cli
$ kgrid COMMAND
running command...
$ kgrid (-v|--version|version)
@kgrid/cli/0.3.4 win32-x64 node-v10.16.3
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
* [`kgrid list`](#kgrid-list)
* [`kgrid package [ARK]`](#kgrid-package-ark)
* [`kgrid play [ARK]`](#kgrid-play-ark)
* [`kgrid setup`](#kgrid-setup)
* [`kgrid start`](#kgrid-start)
* [`kgrid start:activator`](#kgrid-startactivator)
* [`kgrid start:library`](#kgrid-startlibrary)
* [`kgrid upload [ARK]`](#kgrid-upload-ark)
* [`kgrid upload:library [ARK]`](#kgrid-uploadlibrary-ark)

## `kgrid create [KO]`

Create Knowledge Object and initialize the implementation.

```
USAGE
  $ kgrid create [KO]

OPTIONS
  -h, --help                           show CLI help
  -i, --implementation=implementation  the name for the implementation
  --bundled                            Using the template for bundled KO
  --executive                          Using the template for executive KO
  --simple                             Using the simple template

DESCRIPTION
  The create command requires a name for the knowledge object.
  It can only run at the shelf level or the KO level.

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
       --executive for the template with simple JAVASCRIPT file as payload calling other KOs
     By default, the simple template will be used
```

_See code: [src\commands\create.js](https://github.com/kgrid/kgrid-cli/blob/v0.3.4/src\commands\create.js)_

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

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.0/src\commands\help.ts)_

## `kgrid list`

List all implementations for the Knowledge Objects on the shelf.

```
USAGE
  $ kgrid list

OPTIONS
  -i, --implementation  List the implementations only

DESCRIPTION
  The list command will provide a list of the implementations for all Knowledge Objects on the shelf.
```

_See code: [src\commands\list.js](https://github.com/kgrid/kgrid-cli/blob/v0.3.4/src\commands\list.js)_

## `kgrid package [ARK]`

Package the knowledge object.

```
USAGE
  $ kgrid package [ARK]

OPTIONS
  -d, --destination=destination  the directory for the packaged file
  -h, --help                     show CLI help
  -s, --source=source            The folder holding the ko as the source directory

DESCRIPTION
  The package command will package the specified KO into a ZIP file, ready for depositing into a KGrid Library or 
  deploying to a KGrid Activator.

  If running at the shelf level, it requires the ark id for the knowledge object. Or, the flag --source can be used to 
  specify the directory for the knowledge object you'd like to package.

  If running at the KO level and a different KO is provided at the command line, the command line input will be ignored.

  If running at the implementation level, the current implementation will be packaged. Any command line inputs will be 
  ignored.

     Example: kgrid package ark:/hello/world/v1

       Or

     Example: kgrid package --source hello-world/v1
```

_See code: [src\commands\package.js](https://github.com/kgrid/kgrid-cli/blob/v0.3.4/src\commands\package.js)_

## `kgrid play [ARK]`

Try out a Knowledge Object implementation using Swagger Editor.

```
USAGE
  $ kgrid play [ARK]

OPTIONS
  -h, --help       show CLI help
  -l, --url=url    The URL of the activator or library to upload the packaged KO
  -o, --open       Open the url in the default browser
  -p, --port=port  Specify the port for KGRID Activator

DESCRIPTION
  The play command will let the user to select and interact with an activated KO implementation using the online Swagger 
  Editor.

  The implementation can be specified using the argument [ARK].

     Example: kgrid play hello/world/v1

  Or it can be selected from a list of the activated implementations.

  A local KGRID activator needs to be running to use the play command.

  If the activator is not running at the default port, use the option of '-p' to specify the port.
```

_See code: [src\commands\play.js](https://github.com/kgrid/kgrid-cli/blob/v0.3.4/src\commands\play.js)_

## `kgrid setup`

Install KGrid Components and set up kgrid environment.

```
USAGE
  $ kgrid setup

OPTIONS
  -g, --global  Install at a globally accessible location
  -u, --update  Update the KGrid components to the latest release

DESCRIPTION
  KGrid Activator and Library JAR files will be downloaded and installed.

  By default, the components will be downloaded and saved in /.kgrid under current directory.

  The flag -g can be used to install the KGrid components as globally accessible.

  The global location will be the folder defined by the environment variable of KGRID_HOME.

  IF KGRID_HOME is not defined, the user home will be used.
```

_See code: [src\commands\setup.js](https://github.com/kgrid/kgrid-cli/blob/v0.3.4/src\commands\setup.js)_

## `kgrid start`

Start Both KGrid Activator and KGrid Library.

```
USAGE
  $ kgrid start

OPTIONS
  -s, --shelf=shelf  Specify an absolute path to use as the shelf containing KOs

DESCRIPTION
  This command will start both KGrid Activator and KGrid Library.

  By default, the command will use the current directory as the shelf.
  The shelf can be specified using the flag -s.

  The default ports for Activator and Library are 8080 and 8081, respectively.

  KGrid Activator and KGrid Library can be started individually, also with more options for configuration.
  See the commands listed below.
```

_See code: [src\commands\start\index.js](https://github.com/kgrid/kgrid-cli/blob/v0.3.4/src\commands\start\index.js)_

## `kgrid start:activator`

Start KGrid Activator.

```
USAGE
  $ kgrid start:activator

OPTIONS
  -j, --jarfile=jarfile  Specify the activator JAR file to use other than the installed one
  -p, --port=port        Specify the port for KGRID Activator
  -s, --shelf=shelf      Specify an absolute path to use as the shelf containing KOs

DESCRIPTION
  This command starts KGrid Activator at the default port of 8080.

  The port can be configured using the flag -p.
     Example: kgrid start:activator -p 8088

  The current directory will be used as the default shelf unless specified using the flag -s.
```

_See code: [src\commands\start\activator.js](https://github.com/kgrid/kgrid-cli/blob/v0.3.4/src\commands\start\activator.js)_

## `kgrid start:library`

Start KGrid Library.

```
USAGE
  $ kgrid start:library

OPTIONS
  -j, --jarfile=jarfile  Specify the library JAR file to use other than the installed one
  -p, --port=port        Specify the port for KGRID Library
  -s, --shelf=shelf      Specify an absolute path to use as the shelf containing KOs

DESCRIPTION
  This command starts KGrid Library at the default port of 8080.

  The port can be configured using the flag -p.
     Example: kgrid start:library -p 8088

  The current directory will be used as the default shelf unless specified using the flag -s.
```

_See code: [src\commands\start\library.js](https://github.com/kgrid/kgrid-cli/blob/v0.3.4/src\commands\start\library.js)_

## `kgrid upload [ARK]`

Upload a packaged Knowledge Object to a KGRID activator or library.

```
USAGE
  $ kgrid upload [ARK]

OPTIONS
  -f, --file=file  The filename of the packaged KO to be uploaded
  -h, --help       show CLI help
  -l, --url=url    The URL of the activator or library to upload the packaged KO
  -p, --port=port  Specify the port for KGRID Activator

DESCRIPTION
  The upload command will send the packaged KO to a specified activator.

ALIASES
  $ kgrid upload:activator
```

_See code: [src\commands\upload\index.js](https://github.com/kgrid/kgrid-cli/blob/v0.3.4/src\commands\upload\index.js)_

## `kgrid upload:library [ARK]`

Upload a packaged Knowledge Object to a KGRID library.

```
USAGE
  $ kgrid upload:library [ARK]

OPTIONS
  -f, --file=file  The filename of the packaged KO to be uploaded
  -h, --help       show CLI help
  -p, --port=port  Specify the port for KGRID Activator
  --url=url        The URL of the library tp upload the packaged KO

DESCRIPTION
  The upload command will send the packaged KO to a specified library.
```

_See code: [src\commands\upload\library.js](https://github.com/kgrid/kgrid-cli/blob/v0.3.4/src\commands\upload\library.js)_
<!-- commandsstop -->
