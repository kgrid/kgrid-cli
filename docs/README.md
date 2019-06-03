# KGRID CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![npm version](https://img.shields.io/npm/v/@kgrid/cli.svg)](https://www.npmjs.com/package/@kgrid/cli)
[![CircleCI](https://circleci.com/gh/kgrid/kgrid-cli/tree/master.svg?style=shield)](https://circleci.com/gh/kgrid/kgrid-cli/tree/master)
[![Downloads/week](https://img.shields.io/npm/dw/@kgrid/cli.svg)](https://npmjs.org/package/@kgrid/cli)
[![License](https://img.shields.io/npm/l/@kgrid/cli.svg)](https://github.com/kgrid/kgrid-cli/blob/master/package.json)

A command-line tool kit for knowledge object development.

## Installation

Node.js is required to use this CLI kit and can be found at [https://nodejs.org/en/](https://nodejs.org/en/).

In your terminal:

  ```
  $ npm install -g @kgrid/cli
  ```


## Usage

### Basic Use

You should be able to run the CLI tool globally.

  ```
  $ kgrid [command]
  ```

If no command is entered, a list of available commands will be displayed.

To display the usage information about that command, you can use

  ```
  $ kgrid help [command]
  ```
or

  ```
  $ kgrid [command] -h
  ```


### Set Up Knowledge Grid

  The command `SETUP` will check if you have KGRID components installed and set up.

  ```
  $ kgrid setup
  ```
  will use the current directory to install KGRID components. Library and Activator jar files will be downloaded and installed under `.kgrid`;

  Using the flag `-g` will install KGRID components in the location specified by the environmental variable KGRID_HOME. if KGRID_HOME is not set, the default location will be `.kgrid` under the user home.

  Using the flag `-u` will enable the setup process to install the latest releases of the KGRID components



### Create KO

The current directory will be used as the shelf serving KGRID Activator and/or KGRID Library.

To create a Knowledge Object (KO), run

  ```
  $ kgrid create [ko]
  ```

The create command requires a name for the knowledge object. It can only run at the shelf level.

A folder for the knowledge object will be created. An implementation will be created and initialized in the folder of `[ko]`. If the specified KO exists, an implementation will be added to the KO.

#### IMPLEMENTATION NAME:

The user will be prompted to enter a name; Alternatively, the name can be specified on the command line using the flag `-i`.

#### ARK ID:

A development ARK ID will be assigned as `{username}/{ko}/{implementation}`. The ARK ID is unique by having different implementation names in the same KO.

####  IMPLEMENTATION TEMPLATE TYPE:

The implementation will be initialized using one of the templates.

The template can be specified using the flags:

  `--simple`    for the template with simple JAVASCRIPT file as payload

  `--bundled`   for the template with JAVASCRIPT file(s); the payload will require bundling

By default, the *simple* template will be used.



### Package KO

Knowledge objects in the project will be individually packaged into zip files and stored in the destination folder.

  ```
  $ kgrid package [ko] [destination]
  ```


### Start Knowledge Grid

  `kgrid start`

  `kgrid start:acvtivator`

  `kgrid start:library`
