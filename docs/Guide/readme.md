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

You can set the port values in the file of `kgrid-cli-config.json`. See [Config CLI](#config-cli)


## Config CLI
A config file of `kgrid-cli-config.json` is saved at `{USERHOME}/.config`. It specifies values to override the default value for certain development settings .
