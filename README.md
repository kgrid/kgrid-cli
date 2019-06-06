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
@kgrid/cli/0.0.10 win32-x64 node-v10.15.3
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
* [`kgrid plugins`](#kgrid-plugins)
* [`kgrid plugins:install PLUGIN...`](#kgrid-pluginsinstall-plugin)
* [`kgrid plugins:link PLUGIN`](#kgrid-pluginslink-plugin)
* [`kgrid plugins:uninstall PLUGIN...`](#kgrid-pluginsuninstall-plugin)
* [`kgrid plugins:update`](#kgrid-pluginsupdate)
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
  -h, --help                           show CLI help
  -i, --implementation=implementation  the name for the implementation
  --bundled                            Using the template for bundled KO
  --executive                          Using the template for executive KO
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
       --executive for the template with simple JAVASCRIPT file as payload calling other KOs
     By default, the simple template will be used
```

_See code: [src\commands\create.js](https://github.com/kgrid/kgrid-cli/blob/v0.0.10/src\commands\create.js)_

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

OPTIONS
  -h, --help                           show CLI help
  -i, --implementation=implementation  the name for the implementation

DESCRIPTION
  The package command will package the specified KO into a ZIP file, ready for depositing into a KGrid Library or 
  deploying to a KGrid Activator.

  If running at the shelf level, it requires a name for the knowledge object.
  The flag -i can be used to specfiy the implementation you'd like to package.

  If running at the KO level, the flag -i can be used to specify the implementation
  If a KO name is also provided at the command line, the name will be ignored.

  If running at the implementation level, the current implementation will be packaged.
  Any command line inputs will be ignored.
```

_See code: [src\commands\package.js](https://github.com/kgrid/kgrid-cli/blob/v0.0.10/src\commands\package.js)_

## `kgrid plugins`

list installed plugins

```
USAGE
  $ kgrid plugins

OPTIONS
  --core  show core plugins

EXAMPLE
  $ kgrid plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v1.7.8/src\commands\plugins\index.ts)_

## `kgrid plugins:install PLUGIN...`

installs a plugin into the CLI

```
USAGE
  $ kgrid plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  plugin to install

OPTIONS
  -f, --force    yarn install with force flag
  -h, --help     show CLI help
  -v, --verbose

DESCRIPTION
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command 
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in 
  the CLI without the need to patch and update the whole CLI.

ALIASES
  $ kgrid plugins:add

EXAMPLES
  $ kgrid plugins:install myplugin 
  $ kgrid plugins:install https://github.com/someuser/someplugin
  $ kgrid plugins:install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v1.7.8/src\commands\plugins\install.ts)_

## `kgrid plugins:link PLUGIN`

links a plugin into the CLI for development

```
USAGE
  $ kgrid plugins:link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

OPTIONS
  -h, --help     show CLI help
  -v, --verbose

DESCRIPTION
  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello' 
  command will override the user-installed or core plugin implementation. This is useful for development work.

EXAMPLE
  $ kgrid plugins:link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v1.7.8/src\commands\plugins\link.ts)_

## `kgrid plugins:uninstall PLUGIN...`

removes a plugin from the CLI

```
USAGE
  $ kgrid plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

OPTIONS
  -h, --help     show CLI help
  -v, --verbose

ALIASES
  $ kgrid plugins:unlink
  $ kgrid plugins:remove
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v1.7.8/src\commands\plugins\uninstall.ts)_

## `kgrid plugins:update`

update installed plugins

```
USAGE
  $ kgrid plugins:update

OPTIONS
  -h, --help     show CLI help
  -v, --verbose
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v1.7.8/src\commands\plugins\update.ts)_

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

_See code: [src\commands\setup.js](https://github.com/kgrid/kgrid-cli/blob/v0.0.10/src\commands\setup.js)_

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

  The default ports for Activator and Library are 8082 and 8081, respectively.

  KGrid Activator and KGrid Library can be started individually, also with more options for configuration.
  See the commands listed below.
```

_See code: [src\commands\start\index.js](https://github.com/kgrid/kgrid-cli/blob/v0.0.10/src\commands\start\index.js)_

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

_See code: [src\commands\start\activator.js](https://github.com/kgrid/kgrid-cli/blob/v0.0.10/src\commands\start\activator.js)_

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

_See code: [src\commands\start\library.js](https://github.com/kgrid/kgrid-cli/blob/v0.0.10/src\commands\start\library.js)_
<!-- commandsstop -->
