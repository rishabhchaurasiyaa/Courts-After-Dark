// storage.js – Helper for safe localStorage and sessionStorage access
// ---------------------------------------------------------------
// All functions return parsed objects or fallback defaults and never throw.

const Storage = (function () {
  // Private helper to get storage object
  function getStore(type) {
    return type === 'session' ? window.sessionStorage : window.localStorage;
  }

  // Generic get with JSON parse safety
  function getItem(key, type = 'local') {
    try {
      const raw = getStore(type).getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn('Corrupted storage for key', key, e);
      // clean up corrupted entry
      removeItem(key, type);
      return null;
    }
  }

  // Generic set – stores JSON string
  function setItem(key, value, type = 'local') {
    try {
      const str = JSON.stringify(value);
      getStore(type).setItem(key, str);
      return true;
    } catch (e) {
      console.error('Failed to set storage for key', key, e);
      return false;
    }
  }

  function removeItem(key, type = 'local') {
    getStore(type).removeItem(key);
  }

  // Initialize default data structures if missing/corrupted
  function initDefaults() {
    if (!getItem('users')) setItem('users', []);
    if (!getItem('facilities')) setItem('facilities', []);
    if (!getItem('bookings')) setItem('bookings', []);
    if (!getItem('settings')) setItem('settings', { theme: 'light' });
    if (!getItem('currentUser')) setItem('currentUser', null);
  }

  // Public API
  return {
    getItem,
    setItem,
    removeItem,
    initDefaults,
    // Convenience wrappers for domain models
    getUsers: () => getItem('users') || [],
    setUsers: (users) => setItem('users', users),
    getFacilities: () => getItem('facilities') || [],
    setFacilities: (facilities) => setItem('facilities', facilities),
    getBookings: () => getItem('bookings') || [],
    setBookings: (bookings) => setItem('bookings', bookings),
    getSettings: () => getItem('settings') || { theme: 'light' },
    setSettings: (settings) => setItem('settings', settings),
    getCurrentUser: () => getItem('currentUser'),
    setCurrentUser: (email) => setItem('currentUser', email),
  };
})();

// Export for use in other modules (if script is loaded as module, otherwise globals)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Storage;
} else {
  window.Storage = Storage;
}
