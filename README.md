# kgrid-cli

A command-line tool kit for knowledge object development.

### Under development

This CLI kit is still under development and not published yet. To try it, you need to clone this repo and perform a manual installation.

## Quick Start

Node.js is required to use this CLI kit and can be found at https://nodejs.org/en/.

In your terminal:
- Clone this repo

    ```git clone https://github.com/kgrid/kgrid-cli.git```

- Go to the repo folder and manually installation

    ```npm install -g```

- Change to your working directory, which should not be this repo folder

    You should be able to run `kgrid` as a node command globally.

Note: If you have installed previous version of kgrid-cli, uninstall first by `npm uninstall kgrid -g` and reinstall by `npm install -g`.


## Usage

The listed subcommands are prototypes and subject to change during development.


### Create the knowledge object in a project folder

`kgrid create `

It will prompt for entering project information and new knowledge object id, which should have the format of `*****-*****`.

If the project exists, the new knowledge object will be created and added to the project.

After the initilization is done, go to the project folder,

`cd <project-name>`



### Setup runtime environment

``` kgrid setup ```

By default, it is development mode, `--dev`, which will create `activator` folder and generate `manifest.json` in the activator folder.

If the knowledge object is created and added to the existing project, you will need to run setup command again and overwrite the existing manifest.json.



### Install needed K-Grid components, including activator and adapters

``` kgrid install ```

By default, it is development mode, `--dev`, which will download and install needed files in the activator folder.

If the knowledge object has been modified or new knowledge objects have been added, you will need to run install command to load the latest set of knowledge objects and adapters



### Start the activator and activate the knowledge object

``` kgrid run ```

To start the activator on a different port (Default port: 8083), use

``` kgrid run -p <port>```

Note: If the activator starts at a different port, you may need to start a new terminal to run other Kgrid CLI commands.



### Package the knowledge objects

Knowledge objects in the project will be individually packaged into zip files and stored in target folder.

``` kgrid package ```



### Extract a legacy knowledge object

``` kgrid extract ```

If not using local template, the template will be downloaded from GitHub




### List Knowledge Grid components and files

``` kgrid list ```

To list available templates, use option `-t`

To list  the knowledge objects on the shelf, use option `-s`

To View a knowledge object on the shelf, use option `--ko <arkid>`


---

For details in using these command, run the commands with -h option.
