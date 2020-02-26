## BUILD on Windows


### Install node-gyp build environment

1. Find `PowerShell` and then right click on it, choose `Run as Administrator`
2. execute this command: `npm install --global --production windows-build-tools`

### Install dependencies & Build

1. Goto the directory in cmd or PowerShell
2. execute this command: `npm install`
3. execute build command: `npm run build`

After the build. You'll get both installer and binary-executables under `build` folder.

