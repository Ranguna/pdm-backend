LevaMeContigo Backend
===

This repository contains the source code of LevaMeContigo's backend.

The server was implemented in Nodejs, Express.js was used as the main http routing framework and sqlite was used as our RDBMS (despite the fact that we'd rather use Mongodb, sqlite is a good dbms but still, SQL will always be SQL).

# Table of Contents
 - [Requirements](#requirements)
	- [Installing Nodejs](#installing-nodejs)
 - [Setting Things Up](#setting-things-up)
- [Coding Style and General Guidelines](#coding-style-and-general-guidelines)

## Requirements
 - [Nodejs](#installing-nodejs)

### Installing Nodejs
We'll install node through [nvm](https://github.com/creationix/nvm) (node version manager).

You can follow the instruction in the official github repo linked above, here's the gist:

Check the latest release version in the `` Releases `` tab and run the following wget or curl commands to download and run the installer:
```
wget -qO- https://raw.githubusercontent.com/creationix/nvm/(---latest_version---)/install.sh | bash
```
```
curl -o- https://raw.githubusercontent.com/creationix/nvm/(---latest_version---)/install.sh | bash
```
Once nvm is installed, reload you terminal by running:
```
source ~/.bashrc
```
Now download node v10 (or latest):
v10:
```
nvm install v10
```
Latest Stable:
```
nvm install node
```
Congrats, node is installed on you machine !

While you're at it, update npm (node package manager) to it's latest release:
```
npm i -g npm
```

## Setting Things Up
To git this server running, you should [install Nodejs](#installing-nodejs) first, once that's done, clone this repo and `npm install` the necessary packages.

After installing the packages, start the server with `node index.js` from the project's root.

If you're gonna change the files and don't want to manually reset the server everytime, install `nodemon` (this is not required):

Install nodemon globaly like so:
```
npm i -g nodemon
```
And use it to run the server:
```
nodemon
```
From the project's root.

That's all, happy coding !

## Coding Style and General Guidelines

Follow these rules and eveyone will be happy ;)
 - This project uses tabs instead of spaces, please set up you editor accordingly.
 - Please use the included `.eslintrc.js` with you preferred editor/IDE.
 - Try to keep your code as simple as possible, if for any reason you need to write complex code, comment it.
 - Do not delete or modify code unless you've properly reviewed it with the respective author.
 - Do not include large files in this repo, always review you commits before uploading ! (rebasing is a pain)
