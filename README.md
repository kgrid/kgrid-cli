# kgrid-cli

A command-line tool kit for knowledge object development.

### Under development

This CLI kit is still under development and not published yet. To try it, you need to clone this repo and perform a manual installation.

## Quick Start

Node.js is required to use this CLI kit.

In your terminal:
- Clone this repo

    ```git clone https://github.com/kgrid/kgrid-cli.git```

- Go to the repo folder and manually installation

    ```npm install -g```

You should be able to run `kgrid` as a node command globally in your working directory.

## Usage

The listed subcommands are prototypes and subject to change during development.

### Initialize the knowledge object

`kgrid init <template-name> <project-name> [object-name]`

or using the interactive mode

`kgrid init -i`

After the initilization, go to the project folder,

`cd <project-name>`

### Install needed K-Grid components, including activator and adapters

``` kgrid install ```


### Package the knowledge object for activation

``` kgrid package ```

For legacy models, use

``` kgrid package -l```


### Start the activator and activate the knowledge object

``` kgrid run ```

To start the activator on a different port (Default port: 8083), use

``` kgrid run -p <port>```

For development mode, option `--dev` will use the current working directory as the shelf root.

To start the shelf only, use option `--shelfonly`


Note: If the activator/shelf starts at a different port, you may need to start a new terminal to run other Kgrid CLI commands.



### List Knowledge Grid components and files

``` kgrid list ```

To list available templates, use option `-t`

To list  the knowledge objects on the shelf, use option `-s`

To View a knowledge object on the shelf, use option `--ko <arkid>`


### Extract a legacy knowledge object

``` kgrid extract ```

To extract using legacy model, use option `-l`

If not using local template, the template will be downloaded from GitHub


### Upload a knowledge object zip file to the shelf

``` kgrid putko <filename> ```


For details in using these command, run the commands with -h option.
