## Huedeck Build Quick Guide

### Important: use `yarn add` + package name to install new package (DO NOT USE `npm install`)

`yarn install` installs run-time project dependencies and developer tools listed in package.json file

`yarn start` starts Node.js server and running on localhost (default port: 3000)

`yarn start --release` starts Node.js server in release mode (source code are encoded & minified), running on localhost (default port: 3000)

`yarn build` builds the app

`yarn build --release` builds the app in release mode

`yarn deploy` pushes the code in build/public to remote repository

### GCP Deployment

To build docker image:

`$ yarn build --release --docker`

To add tag, such as version number, to the built image:

`$ docker tag huedeck us.gcr.io/gcp-project-id/huedeck-web:v0.0.5`

To inspect the available docker image:

`$ docker images`

To push image to GCP:

`$ docker push us.gcr.io/gcp-project-id/huedeck-web:v0.0.5`

After all that, we shall see the image on GCP registry and we can choose to rolling update.
