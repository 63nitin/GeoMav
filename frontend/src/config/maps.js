// Get the API key from environment or use a default for development
export const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY';

// Additional map configuration options if needed
export const MAP_CONFIG = {
    defaultZoom: 15,
    defaultRegion: {
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    }
};

// Geocoding options
export const GEOCODING_OPTIONS = {
    language: 'en',
    // Get a more precise address
    result_type: ['street_address', 'route', 'neighborhood', 'sublocality', 'locality'],
}; 