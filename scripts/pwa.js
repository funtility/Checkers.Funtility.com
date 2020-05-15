//#region Service Worker

/**
 * The service worker section can be used for converting this site
 * into a Progressive Web Application.
 */
var PWA = false;
if (PWA){
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js').then(function(reg){
            console.log('Successfully registered service worker.', reg);
        }).catch(function(err){
            console.warn('Error while regestering service worker.', err);
        })
    }
    
    window.addEventListener('online', function(e){
        console.log('You are online.');
    })
    
    window.addEventListener('offline', function(e) {
        console.log('You are offline.');
    })
    
    if (navigator.onLine){
        //Make initial API calls here to gather data
    } else {
        //Call offline warning
    }
}

//#endregion