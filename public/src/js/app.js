const manifest = {
    "name": "Progressive Selfies",
    "short_name": "PWA Selfies",
    "icons": [
      {
        "src": "/src/images/icons/app-icon-192x192.png",
        "type": "image/png",
        "sizes": "192x192"
      },
      {
        "src": "/src/images/icons/app-icon-512x512.png",
        "type": "image/png",
        "sizes": "512x512"
      }
    ],
    // "start_url": "/index.html",
    // "scope": ".",
    "display": "standalone",
    "background_color": "#fff",
    "theme_color": "#3f51b5"
  }

window.addEventListener('load', () => {
    const base = document.querySelector('base');
    let baseUrl = base && base.href || '';

    if (!baseUrl.endsWith('/')) {
        baseUrl = `${baseUrl}/`;
    }

    manifest['start_url'] = `${baseUrl}index.html`;

    manifest.icons.forEach(icon => {
        icon.src = `${baseUrl}${icon.src}`;
    });

    const stringManifest = JSON.stringify(manifest);
    const blob = new Blob([stringManifest], {type: 'application/json'});
    const manifestURL = URL.createObjectURL(blob);
    document.querySelector('#manifestPlaceholder').setAttribute('href', manifestURL);

    // Service worker stuff
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register(`${baseUrl}sw.js`)
            .then( registration => {
            // Registration was successful
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        })
        .catch(err => {
            // registration failed :(
            console.log('ServiceWorker registration failed: ', err);
        });
    }
});