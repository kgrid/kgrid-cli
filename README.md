# kgrid-cli

A command-line tool kit for knowledge object development.

### Under development

This CLI kit is still under development and not published yet. To try it, you need to clone this repo and perform a manual installation.

## Quick Start

Node.js is required to use this CLI kit and can be found at https://nodejs.org/en/.

In your terminal:
- Clone this repo

  ` git clone https://github.com/kgrid/kgrid-cli.git `

- Go to the repo folder and manually installation

    `npm install -g`

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



### Install needed Node modules and K-Grid components, including activator and adapters

` kgrid install `

It will install needed node modules defined in devDependencies, as well as the KGrid runtime dependencies.

If the knowledge object has been modified or new knowledge objects have been added, you might need to run install command to load the latest set of knowledge objects and adapters



### Start the activator and activate the knowledge object

You start the activator in two modes:

 - In DEV mode,

    ` npm run start:dev `

    The activator will use the project directory as the shelf serving all knowledge objects within the directory.

- In PROD mode,

    `npm run start:prod -- <options>`

    You can use command line arguments to specify the options for the activator.

    For example, `npm run start:prod -- --kgrid.shelf.cdostore.filesystem.location=activator/shelf`

To start the activator on a different port (Default port: 8080), include ` --server.port=8090 ` as part of the options on the command line.



### Package the knowledge objects

Knowledge objects in the project will be individually packaged into zip files and stored in target folder.

  ` npm run build:zipko <objectname> `

---

For details in using these command, run the commands with -h option.
