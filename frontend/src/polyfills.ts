// Polyfills para crypto en macOS
if (typeof global === 'undefined') {
  (window as any).global = window;
}

if (typeof process === 'undefined') {
  (window as any).process = { env: {} };
}

// Polyfill para crypto.getRandomValues
if (typeof crypto !== 'undefined' && !crypto.getRandomValues) {
  (crypto as any).getRandomValues = function(arr: any) {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  };
}
