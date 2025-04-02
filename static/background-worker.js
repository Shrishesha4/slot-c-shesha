// Background service worker to keep CDN simulation running
self.addEventListener('install', event => {
  self.skipWaiting();
  console.log('CDN simulation background worker installed');
});

self.addEventListener('activate', event => {
  console.log('CDN simulation background worker activated');
  event.waitUntil(self.clients.claim());
  
  // Set up periodic sync if available
  if ('periodicSync' in self.registration) {
    try {
      self.registration.periodicSync.register('cdn-traffic-simulation', {
        minInterval: 60 * 1000 // Attempt to sync at least every minute
      });
    } catch (error) {
      console.error('Periodic background sync could not be registered:', error);
    }
  }
  
  // Set up a background interval as fallback - make it run more frequently
  setInterval(() => {
    self.clients.matchAll().then(clients => {
      if (clients.length > 0) {
        clients.forEach(client => {
          client.postMessage({
            type: 'SIMULATE_CDN_TRAFFIC'
          });
        });
      } else {
        // No clients connected, perform background simulation directly
        performBackgroundSimulation();
      }
    });
  }, 15000); // Every 15 seconds instead of every minute
});

// Function to perform background simulation when no clients are connected
function performBackgroundSimulation() {
  // Fetch current metrics from storage
  fetch('/api/cdn-metrics')
    .catch(() => {
      // If fetch fails, try to use IndexedDB or localStorage as fallback
      console.log('Performing background simulation using stored data');
      
      try {
        // Try to read from localStorage as fallback
        const storedMetrics = localStorage.getItem('cdnMetrics');
        if (storedMetrics) {
          const metrics = JSON.parse(storedMetrics);
          
          // Get current hour to adjust traffic volume
          const hour = new Date().getHours();
          
          // Late night hours (11pm-8am): VERY high traffic
          if (hour >= 23 || hour <= 7) {
            metrics.totalRequests += Math.floor(Math.random() * 150) + 1000; // 1000-1150 requests
            metrics.cacheHits += Math.floor(Math.random() * 100) + 800; // 800-900 cache hits
            metrics.bandwidthSaved += (Math.random() * 5) + 3; // 3-8 MB saved
            // Faster average latency
            metrics.avgLatency = Math.min(metrics.avgLatency, 15 + (Math.random() * 10)); // 15-25ms
          } 
          // Normal business hours
          else {
            metrics.totalRequests += Math.floor(Math.random() * 50) + 30; // 30-80 requests
            metrics.cacheHits += Math.floor(Math.random() * 35) + 20; // 20-55 cache hits
            metrics.bandwidthSaved += (Math.random() * 2) + 1; // 1-3 MB saved
            // Faster average latency
            metrics.avgLatency = Math.min(metrics.avgLatency, 30 + (Math.random() * 15)); // 30-45ms
          }
          
          // Store updated metrics
          localStorage.setItem('cdnMetrics', JSON.stringify(metrics));
        }
      } catch (e) {
        console.error('Error in background simulation:', e);
      }
    });
}

self.addEventListener('periodicsync', event => {
  if (event.tag === 'cdn-traffic-simulation') {
    // Trigger background requests
    self.clients.matchAll().then(clients => {
      if (clients.length > 0) {
        clients.forEach(client => {
          client.postMessage({
            type: 'SIMULATE_CDN_TRAFFIC'
          });
        });
      } else {
        performBackgroundSimulation();
      }
    });
  }
});

// Listen for messages from the main thread
self.addEventListener('message', event => {
  if (event.data) {
    if (event.data.type === 'KEEP_ALIVE') {
      console.log('Background worker received keep-alive ping');
    } else if (event.data.type === 'STORE_METRICS') {
      // Store metrics data received from the main thread
      if (event.data.metrics) {
        try {
          localStorage.setItem('cdnMetrics', JSON.stringify(event.data.metrics));
        } catch (e) {
          console.error('Error storing metrics in worker:', e);
        }
      }
    }
  }
});

// Handle fetch events to keep the worker alive
self.addEventListener('fetch', event => {
  // Check if this is a request for our metrics API
  if (event.request.url.includes('/api/cdn-metrics')) {
    event.respondWith(
      new Response(
        localStorage.getItem('cdnMetrics') || '{"totalRequests":0,"cacheHits":0,"cacheMisses":0,"avgLatency":0,"bandwidthSaved":0}',
        { headers: { 'Content-Type': 'application/json' } }
      )
    );
    return;
  }
  
  // Just let the normal fetch happen for other requests
  return;
});