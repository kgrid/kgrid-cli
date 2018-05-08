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


### Create the knowledge object project

`kgrid create `

It will prompt for entering project information.

Or using the auto mode. By supplying template-name and project name, the project will be created using the default value from the template. The project information can be modified later.

`kgrid create -a <template-name> <project-name> [object-name]`

After the initilization, go to the project folder,

`cd <project-name>`



### Setup runtime environment

``` kgrid setup ```

By default, it is development mode, `--dev`, which will create `runtime` folder and generate `manifest.json` in the runtime folder

Production mode, enabled with option `--prod`, which will generate `manifest.json` in the working directory if there exists a `shelf` containing knowledge objects.



### Install needed K-Grid components, including activator and adapters

``` kgrid install ```

By default, it is development mode, `--dev`, which will download and install needed files in the runtime folder.

Production mode, enabled with option `--prod`, which will download and install needed files in the working directory.



### Start the activator and activate the knowledge object

``` kgrid run ```

To start the activator on a different port (Default port: 8083), use

``` kgrid run -p <port>```

To start the shelf only, use option `--shelfonly`

To start the adapter gateway only, use option `--adapteronly`

Note: At current development stage, you may need to change the working directory to runtime if applicable.

Note: If the activator/shelf starts at a different port, you may need to start a new terminal to run other Kgrid CLI commands.



### Package the knowledge object for activation

``` kgrid package ```

For legacy models, use

``` kgrid package -l```



### Extract a legacy knowledge object

``` kgrid extract ```

To extract using legacy model, use option `-l`

If not using local template, the template will be downloaded from GitHub




### List Knowledge Grid components and files

``` kgrid list ```

To list available templates, use option `-t`

To list  the knowledge objects on the shelf, use option `-s`

To View a knowledge object on the shelf, use option `--ko <arkid>`




### Upload a knowledge object zip file to the shelf

``` kgrid putko <filename> ```


For details in using these command, run the commands with -h option.
