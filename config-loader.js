// Configuration loader for browser extension
// This loads IGDB credentials from browser storage or embedded defaults

let configCache = null;

async function loadConfig() {
    if (configCache) {
        return configCache;
    }
    
    try {
        const storedConfig = await loadConfigFromStorage();
        if (storedConfig && storedConfig.igdb && storedConfig.igdb.clientId && storedConfig.igdb.clientSecret) {
            console.log('IGDB credentials loaded from browser storage');
            configCache = storedConfig;
            return storedConfig;
        }
        
    } catch (error) {
        console.error('Failed to load configuration:', error);
        return;
    }
}

// Load configuration from browser storage
async function loadConfigFromStorage() {
    return new Promise((resolve) => {
        browser.storage.local.get(['igdb_client_id', 'igdb_client_secret'], function(result) {
            if (result.igdb_client_id && result.igdb_client_secret) {
                resolve({
                    igdb: {
                        clientId: result.igdb_client_id,
                        clientSecret: result.igdb_client_secret
                    }
                });
            } else {
                resolve(null);
            }
        });
    });
}

// Save configuration to browser storage
async function saveConfigToStorage(clientId, clientSecret) {
    return new Promise((resolve, reject) => {
        browser.storage.local.set({
            'igdb_client_id': clientId,
            'igdb_client_secret': clientSecret
        }, function() {
            if (browser.runtime.lastError) {
                reject(browser.runtime.lastError);
            } else {
                // Clear cache so it reloads on next access
                configCache = null;
                console.log('IGDB credentials saved to browser storage');
                resolve();
            }
        });
    });
}

// Get IGDB credentials
async function getIgdbCredentials() {
    const config = await loadConfig();
    return config.igdb;
}

// Make functions available globally
if (typeof window !== 'undefined') {
    window.loadConfig = loadConfig;
    window.getIgdbCredentials = getIgdbCredentials;
    window.saveConfigToStorage = saveConfigToStorage;
}
