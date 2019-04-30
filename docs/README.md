# `kgrid-cli` Quick Start

A command-line tool kit for knowledge object development.

### Under development

This CLI kit is still under development and not published yet. To try it, you need to clone this repo and perform a manual installation.

## Installing the Kgrid command line tool

Node.js is required to use this CLI kit and can be found at https://nodejs.org/en/.

In your terminal:
- Clone this repo

  ` git clone https://github.com/kgrid/kgrid-cli.git `

- Go to the repo folder and manually installation

    `npm install -g`

    You should be able to run `kgrid` as a node command globally. Change to another directory and run

    `kgrid -h`

Note: If you have installed previous version of kgrid-cli, uninstall first by `npm uninstall kgrid -g` and reinstall by `npm install -g`.

Once the kgrid command line tool is installed, you don't need the repo you checked out, but you can update and reinstall using:

```bash
npm uninstall kgrid -g
git pull
npm install kgrid -g
```

## Usage

Change to your working directory (which should not be the kgrid-cli repo you checked out during installation). Type:

`kgrid -h`

The listed subcommands are prototypes and subject to change during development.


### Create the knowledge object in a project folder

- Create a project folder.

  `mkdir <my-project>`

- Change the created project folder

  `cd <my-project>`

- Start the initilization

  `kgrid init `

It will prompt for entering the implementation information.

If the implementation exists, you will be prompted to choose a different version for the implementation.

<!--



### Install needed Node modules and K-Grid components, including activator and adapters

` kgrid install `

It will install needed node modules defined in devDependencies, as well as the KGrid runtime dependencies.

If the knowledge object has been modified or new knowledge objects have been added, you might need to run install command to load the latest set of knowledge objects and adapters



### Start the activator and activate the knowledge object

You start the activator in two modes:

 - In DEV mode,

    ` npm run dev `

    The activator will use the project directory as the shelf serving all knowledge objects within the directory.

- In PROD mode,

    `npm run prod -- <options>`

    You can use command line arguments to specify the options for the activator.

    `npm run prod` will use the default shelf location, which is equivalent to `npm run prod -- --kgrid.shelf.cdostore.filesystem.location=activator/shelf`

To start the activator on a different port (Default port: 8080), include ` --server.port=8090 ` as part of the options on the command line.



### Package the knowledge objects

Knowledge objects in the project will be individually packaged into zip files and stored in target folder.

  ` npm run package <objectname> `


### Update the knowledge object Project

After you create a new knowledge object from template, or simply copy/move a knowledge object from another project/directory, or add a new version of existing knowledge object, the file of package.json needs to be updated by

`kgrid update` .

If new dependencies are added, you will need to run `kgrid install` to get the new components ready for use. -->

---

For details in using these command, run the commands with -h option.
