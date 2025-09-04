// Polyfills para crypto en macOS
if (typeof (globalThis as any).global === 'undefined') {
  (globalThis as any).global = globalThis;
}

if (typeof (globalThis as any).process === 'undefined') {
  (globalThis as any).process = { env: {} };
}

// Polyfill para crypto.getRandomValues
if (typeof (globalThis as any).crypto === 'undefined') {
  (globalThis as any).crypto = {
    getRandomValues: function(arr: any) {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }
  };
} else if (typeof (globalThis as any).crypto.getRandomValues === 'undefined') {
  (globalThis as any).crypto.getRandomValues = function(arr: any) {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  };
}
