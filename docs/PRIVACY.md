# Privacy

Author: Saad Kamal

Skywrite is designed around a simple privacy promise: camera frames are processed locally and are not uploaded to an application backend.

## What Stays Local

- Webcam frames
- MediaPipe hand landmarks
- In-progress strokes
- Exported artwork until the user saves or shares it
- Mouse and touch drawing input

## What Uses Browser Storage

Skywrite stores one local preference:

- `skywrite-help-shown`: remembers whether the drawing help dialog has already been shown.

No account, analytics identifier, or drawing history is stored by the app.

## Network Requests

The browser still downloads static app assets. These include JavaScript, CSS, SVG/PNG files, WebAssembly, and MediaPipe model files.

MediaPipe files are installed from npm and copied into the app's own static asset folder during development/build. The running page does not execute MediaPipe JavaScript from a CDN.

## Camera Permission

The drawing page starts the browser camera permission flow when `/draw` opens. The camera cannot turn on unless the user grants permission through the browser prompt or has already allowed the site.

Skywrite initializes local hand tracking only after camera access is granted and a video frame is available. This keeps camera permission failures separate from MediaPipe runtime failures.

When `Stop Camera` is clicked, the app stops the real media tracks. That is the behavior users should expect from a privacy-minded camera control.

## Exporting Images

When the user clicks `Save PNG`, Skywrite creates a local canvas export and triggers a browser download. The app does not upload the file.

If the user shares the downloaded file elsewhere, that sharing happens outside Skywrite.
