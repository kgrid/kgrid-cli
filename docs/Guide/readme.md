# KGRID CLI Usage Guide

[![npm version](https://img.shields.io/npm/v/@kgrid/cli.svg)](https://www.npmjs.com/package/@kgrid/cli)
[![CircleCI](https://circleci.com/gh/kgrid/kgrid-cli/tree/master.svg?style=shield)](https://circleci.com/gh/kgrid/kgrid-cli/tree/master)
[![Downloads/week](https://img.shields.io/npm/dw/@kgrid/cli.svg)](https://npmjs.org/package/@kgrid/cli)
[![License](https://img.shields.io/npm/l/@kgrid/cli.svg)](https://github.com/kgrid/kgrid-cli/blob/master/package.json)

A command-line tool kit for knowledge object development.


## Set up KGRID globally

To set up KGRID globally, run

  ```
  $ kgrid setup -g
  ```

If the environment variable `KGRID_HOME` is set, KGIRD components will be installed and accessible globally at `{KGRID_HOME}`; Otherwise, CLI will install KGRID components at `{USERHOME}/.kgrid`.


## Update KGRID Components

To update KGRID components, run

  ```
  $ kgrid setup -u        // If installed locally
  $ kgrid setup -g -u     // If installed globally
  ```

## Change the default {naan}

The default `{naan}` is the username.

To change, set the value in the file of `kgrid-cli-config.json`. See [Config CLI](#config-cli)


## Start KGRID Library/Activator at different ports

When KGRID Library and Activator are started together by running `kgrid start`, the default values are 8081 and 8082, respectively. The values can not be overwritten on the command line.

You can change the default port values in the file of `kgrid-cli-config.json`. See [Config CLI](#config-cli). To be noted, the values will always be used once set. To revert back to the original default, change the values to `''`.

If you'd like to run KGRID Library/Activator at different ports without changing the defaults, you need to start the components individually with the option of port by running
  ```
  $ kgrid start:library -p 9000
  $ kgrid start:activator -p 9001
  ```


## Start KGRID Library/Activator using a different directory as the shelf

When KGRID Library and Activator are started, the default shelf will be the current directory.  The values can be overwritten on the command line, using the option of shelf by running
  ```
  $ kgrid start -s [shelf]
  $ kgrid start:library -s [shelf]
  $ kgrid start:activator -s [shelf]
  ```

If you'd like to run KGRID Library/Activator at different shelves, you need to start the components individually.



## Config CLI
A config file of `kgrid-cli-config.json` is saved at `{USERHOME}/.config`. It specifies values to override the default value for certain development settings.

Current fields available for configuration:
```
naan
activator_port
library_port
```
