(function (global) {
    console.log("[Cordova.js] Initialisation de Cordova...");

    // Simulation de l'objet Cordova
    global.cordova = {
        plugins: {},
        require: function () { console.warn("[Cordova.js] require() non implémenté."); },
        exec: function (success, error, plugin, action, args) {
            console.log(`[Cordova.js] Appel de ${plugin}.${action} avec`, args);
            if (typeof success === 'function') success();
        }
    };

    // Simulation de l'événement 'deviceready'
    document.addEventListener("DOMContentLoaded", function () {
        console.log("[Cordova.js] Simulation de 'deviceready'");
        setTimeout(() => {
            var event = new Event("deviceready");
            document.dispatchEvent(event);
        }, 500); // Simule un léger délai avant la disponibilité de Cordova
    });

    // Simulation d'un plugin de géolocalisation
    navigator.geolocation = {
        getCurrentPosition: function (success, error) {
            console.log("[Cordova.js] Simulation de getCurrentPosition");
            setTimeout(() => {
                if (typeof success === 'function') {
                    success({
                        coords: {
                            latitude: 48.8566,
                            longitude: 2.3522,
                            altitude: null,
                            accuracy: 5,
                            altitudeAccuracy: null,
                            heading: null,
                            speed: null
                        },
                        timestamp: Date.now()
                    });
                }
            }, 1000);
        }
    };

    console.log("[Cordova.js] Fichier chargé avec succès.");
})(window);
