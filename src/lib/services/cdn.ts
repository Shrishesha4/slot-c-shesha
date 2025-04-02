import { writable } from 'svelte/store';

export const edgeLocations = [
	{ id: 'us-east', name: 'US East (N. Virginia)', latency: 35, status: 'active' },
	{ id: 'us-west', name: 'US West (Oregon)', latency: 75, status: 'active' },
	{ id: 'eu-west', name: 'Europe (Ireland)', latency: 120, status: 'active' },
	{ id: 'ap-south', name: 'Asia Pacific (Mumbai)', latency: 180, status: 'active' },
	{ id: 'ap-northeast', name: 'Asia Pacific (Tokyo)', latency: 160, status: 'active' },
	{ id: 'sa-east', name: 'South America (São Paulo)', latency: 140, status: 'active' }
];


export const contentTypes = [
	{ id: 'image', name: 'Images', avgSize: '2MB', cacheTime: '7 days' },
	{ id: 'video', name: 'Videos', avgSize: '50MB', cacheTime: '3 days' },
	{ id: 'static', name: 'Static Assets', avgSize: '500KB', cacheTime: '30 days' },
	{ id: 'api', name: 'API Responses', avgSize: '10KB', cacheTime: '1 hour' }
];

// Default content items
const defaultContentItems = [
	{
		id: 1,
		type: 'image',
		name: 'hero-banner.jpg',
		size: '1.8MB',
		cached: true,
		locations: ['us-east', 'us-west', 'eu-west'],
		popularity: 85,
		version: '1.0',
		lastUpdated: new Date().toISOString(),
		uploadDate: new Date().toISOString(),
		accessCount: 0
	},
	{
		id: 2,
		type: 'video',
		name: 'product-demo.mp4',
		size: '45MB',
		cached: true,
		locations: ['us-east', 'ap-south'],
		popularity: 85,
		version: '1.0',
		lastUpdated: new Date().toISOString(),
		uploadDate: new Date().toISOString(),
		accessCount: 0
	},
	{
		id: 3,
		type: 'static',
		name: 'main.js',
		size: '320KB',
		cached: true,
		locations: ['us-east', 'us-west', 'eu-west', 'ap-south', 'ap-northeast', 'sa-east'],
		popularity: 85,
		version: '1.0',
		lastUpdated: new Date().toISOString(),
		uploadDate: new Date().toISOString(),
		accessCount: 0
	},
	{
		id: 4,
		type: 'api',
		name: 'user-data.json',
		size: '8KB',
		cached: false,
		locations: ['us-east'],
		popularity: 85,
		version: '1.0',
		lastUpdated: new Date().toISOString(),
		uploadDate: new Date().toISOString(),
		accessCount: 0
	}
];

// Simulated content items
export let contentItems = [...defaultContentItems];

// Default metrics
const defaultMetrics = {
	totalRequests: 0,
	cacheHits: 0,
	cacheMisses: 0,
	avgLatency: 0,
	bandwidthSaved: 0
};

// Store for CDN metrics
export const cdnMetrics = writable({ ...defaultMetrics });

// Simulate a content request
// export function requestContent(contentId: number, locationId: string) {
// 	const content = contentItems.find((item) => item.id === contentId);
// 	const location = edgeLocations.find((loc) => loc.id === locationId);
	
// 	if (!content || !location) return null;
	
// 	const isCached = content.locations.includes(locationId);
// 	const metrics = getCdnMetrics();
	
// 	// Update metrics
// 	if (metrics) {
// 		(metrics as { totalRequests: number }).totalRequests += 1;
// 	}
	
//     if (!metrics) return;

//     if (isCached) {
//         (metrics as { cacheHits: number }).cacheHits += 1;
//         // Calculate bandwidth saved based on content size
//         const sizeInMB = content.size.includes('MB') 
//             ? parseFloat(content.size.replace('MB', ''))
//             : parseFloat(content.size.replace('KB', '')) / 1000;
        
//         if (!isNaN(sizeInMB)) {
//             (metrics as { bandwidthSaved: number }).bandwidthSaved += sizeInMB;
//         }
//     } else {
//         (metrics as { cacheMisses: number }).cacheMisses += 1;
//     }
    
//     // Calculate new latency with realistic variation
//     const baseLatency = location.latency;
    
//     // Add realistic latency variation based on several factors
//     const timeOfDayFactor = getTimeOfDayFactor();
//     const networkCongestionFactor = Math.random() * 0.3 + 0.85; // 0.85-1.15 random factor
//     const contentTypeFactor = getContentTypeFactor(content.type);
//     const distanceFactor = getDistanceVariationFactor(locationId);
    
//     // Apply all factors to create realistic variation
//     const variableBaseLatency = Math.round(
//         baseLatency * timeOfDayFactor * networkCongestionFactor * distanceFactor
//     );
    
//     // Cached content is faster, uncached needs to fetch from origin
//     const contentLatency = isCached 
//         ? variableBaseLatency 
//         : Math.round(variableBaseLatency * (2.5 + Math.random())); // 2.5-3.5x slower for uncached
    
//     if ((metrics as { totalRequests: number }).totalRequests > 0) {
//         (metrics as { avgLatency: number }).avgLatency = (
//             ((metrics as { avgLatency: number }).avgLatency * ((metrics as { totalRequests: number }).totalRequests - 1)) + contentLatency
//         ) / (metrics as { totalRequests: number }).totalRequests;
//     }
    
//     cdnMetrics.set(metrics);
// 	return {
// 		content,
// 		location,
// 		latency: contentLatency,
// 		cached: isCached
// 	};
// }

// Helper function to simulate time-of-day effects on latency
function getTimeOfDayFactor() {
    const hour = new Date().getHours();
    
    // Peak hours have slightly higher latency but still fast
    if ((hour >= 8 && hour <= 11) || (hour >= 19 && hour <= 22)) {
        return 0.8 + (Math.random() * 0.1); // 10-20% faster during peak
    } 
    // Late night has extremely low latency (super fast)
    else if (hour >= 23 || hour <= 5) {
        return 0.3 + (Math.random() * 0.1); // 60-70% lower during night - extremely fast
    }
    // Normal hours
    else {
        return 0.6 + (Math.random() * 0.1); // 30-40% faster during normal hours
    }
}

// Helper function to adjust latency based on content type - make all content types faster
function getContentTypeFactor(contentTypeId: string) {
    switch (contentTypeId) {
        case 'video': return 0.9 + (Math.random() * 0.1); // Videos are still heavier but faster
        case 'image': return 0.8 + (Math.random() * 0.1); // Images are faster
        case 'static': return 0.7 + (Math.random() * 0.1); // Static content is much faster
        case 'api': return 0.75 + (Math.random() * 0.1); // API responses are faster
        default: return 0.8;
    }
}

// Helper function to simulate geographic distance variations - improve all regions
function getDistanceVariationFactor(locationId: string) {
    // Some regions have more variable connections but all are faster now
    switch (locationId) {
        case 'ap-south': return 0.8 + (Math.random() * 0.2); // Improved Asia-Pacific
        case 'ap-northeast': return 0.8 + (Math.random() * 0.15);
        case 'sa-east': return 0.8 + (Math.random() * 0.15); // Improved South America
        default: return 0.7 + (Math.random() * 0.1); // US/EU much faster
    }
}

// Get current CDN metrics
export function getCdnMetrics() {
	let metrics;
	cdnMetrics.subscribe((value) => {
		metrics = value;
	})();
	return metrics;
}

// Simulate caching content at a new edge location
export function cacheContent(contentId: number, locationId: string) {
	const contentIndex = contentItems.findIndex((item) => item.id === contentId);
	if (contentIndex === -1) return false;
	
	if (!contentItems[contentIndex].locations.includes(locationId)) {
		contentItems[contentIndex].locations.push(locationId);
		return true;
	}
	
	return false;
}

// Reset all CDN data to defaults
export function resetCdnData() {
	// Reset metrics
	cdnMetrics.set({ ...defaultMetrics });
	
	// Reset content items to default state
	contentItems = [...defaultContentItems];
	
	return true;
}

// Add these properties to content items
// Update the content item interface to include all the properties you're using
export interface ContentItem {
  id: number;
  name: string;
  type: string;
  size: string;
  locations: string[];
  cached: boolean;     // Changed from optional to required
  popularity?: number;  // Make optional with default value
  version?: string;     // Make optional with default value
  lastUpdated?: string; // Make optional
  accessCount?: number; // Make optional for tracking
  uploadDate?: string;  // When the content was added to the library
}

// Update content popularity based on access patterns
export function updateContentPopularity() {
  // Find the most accessed content
  const sortedContent = [...contentItems].sort((a, b) => 
    (b.accessCount || 0) - (a.accessCount || 0)
  );
  
  // Update popularity scores
  sortedContent.forEach((item, index) => {
    // Top 20% get high popularity
    if (index < contentItems.length * 0.2) {
      item.popularity = Math.min(100, item.popularity + Math.floor(Math.random() * 3) + 1);
    } 
    // Middle 60% get moderate changes
    else if (index < contentItems.length * 0.8) {
      item.popularity = Math.min(100, Math.max(1, 
        item.popularity + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 2)
      ));
    }
    // Bottom 20% decrease in popularity
    else {
      item.popularity = Math.max(1, item.popularity - Math.floor(Math.random() * 2));
    }
  });
  
  // Reset access counts for next cycle
  contentItems.forEach(item => {
    item.accessCount = 0;
  });
}

// Auto-cache popular content at edge locations
export function autoCachePopularContent() {
  // Get highly popular content (popularity > 70)
  const popularContent = contentItems.filter(item => item.popularity > 70);
  
  // For each popular item, ensure it's cached at more edge locations
  popularContent.forEach(item => {
    // Calculate how many locations it should be cached at based on popularity
    const targetCacheCount = Math.ceil((item.popularity / 100) * edgeLocations.length);
    
    // If it's not cached at enough locations, add more
    if (item.locations.length < targetCacheCount) {
      // Find locations where it's not cached
      const uncachedLocations = edgeLocations
        .filter(loc => !item.locations.includes(loc.id))
        .map(loc => loc.id);
      
      // Randomly select locations to cache at
      while (item.locations.length < targetCacheCount && uncachedLocations.length > 0) {
        const randomIndex = Math.floor(Math.random() * uncachedLocations.length);
        const locationId = uncachedLocations.splice(randomIndex, 1)[0];
        item.locations.push(locationId);
      }
    }
  });
}

// Simulate content version updates
export function simulateContentVersionUpdate() {
  // Randomly select a content item to update
  const randomIndex = Math.floor(Math.random() * contentItems.length);
  const item = contentItems[randomIndex];
  
  // Update version
  item.version = (parseFloat(item.version || "1.0") + 0.1).toFixed(1);
  
  // Update size slightly (content changes)
  const currentSize = parseFloat(item.size.replace(/[^0-9.]/g, ''));
  const unit = item.size.includes('MB') ? 'MB' : 'KB';
  const newSize = (currentSize * (0.95 + Math.random() * 0.1)).toFixed(1);
  item.size = `${newSize}${unit}`;
  
  // Add last updated timestamp
  item.lastUpdated = new Date().toISOString();
  
  // Reset cache locations (new version needs to be re-cached)
  item.locations = [];
  
  return item;
}

export function requestContent(contentId: number, locationId: string) {
  const content = contentItems.find((item) => item.id === contentId);
  const location = edgeLocations.find((loc) => loc.id === locationId);
  
  if (!content || !location) return null;
  
  // Track access count for popularity calculations
  content.accessCount = (content.accessCount || 0) + 1;
  
  const isCached = content.locations.includes(locationId);
  const metrics = getCdnMetrics();
  
  // Update metrics
  if (metrics) {
      (metrics as { totalRequests: number }).totalRequests += 1;
  }
  
      if (!metrics) return;
  
      if (isCached) {
          (metrics as { cacheHits: number }).cacheHits += 1;
          // Calculate bandwidth saved based on content size
          const sizeInMB = content.size.includes('MB') 
              ? parseFloat(content.size.replace('MB', ''))
              : parseFloat(content.size.replace('KB', '')) / 1000;
          
          if (!isNaN(sizeInMB)) {
              (metrics as { bandwidthSaved: number }).bandwidthSaved += sizeInMB;
          }
      } else {
          (metrics as { cacheMisses: number }).cacheMisses += 1;
      }
      
      // Calculate new latency with realistic variation
      const baseLatency = location.latency;
      
      // Add realistic latency variation based on several factors
      const timeOfDayFactor = getTimeOfDayFactor();
      const networkCongestionFactor = Math.random() * 0.3 + 0.85; // 0.85-1.15 random factor
      const contentTypeFactor = getContentTypeFactor(content.type);
      const distanceFactor = getDistanceVariationFactor(locationId);
      
      // Apply all factors to create realistic variation
      const variableBaseLatency = Math.round(
          baseLatency * timeOfDayFactor * networkCongestionFactor * distanceFactor
      );
      
      // Cached content is faster, uncached needs to fetch from origin
      const contentLatency = isCached 
          ? variableBaseLatency 
          : Math.round(variableBaseLatency * (2.5 + Math.random())); // 2.5-3.5x slower for uncached
      
      if ((metrics as { totalRequests: number }).totalRequests > 0) {
          (metrics as { avgLatency: number }).avgLatency = (
              ((metrics as { avgLatency: number }).avgLatency * ((metrics as { totalRequests: number }).totalRequests - 1)) + contentLatency
          ) / (metrics as { totalRequests: number }).totalRequests;
      }
      
      cdnMetrics.set(metrics);
  return {
      content,
      location,
      latency: contentLatency,
      cached: isCached
  };
}

// Generate a realistic file name based on content type
function generateFileName(type: string): string {
  const timestamp = Date.now().toString().slice(-6);
  
  switch(type) {
    case 'image':
      const imageNames = ['product', 'banner', 'hero', 'profile', 'thumbnail', 'gallery', 'promo'];
      const imageFormats = ['jpg', 'png', 'webp'];
      return `${imageNames[Math.floor(Math.random() * imageNames.length)]}-${timestamp}.${imageFormats[Math.floor(Math.random() * imageFormats.length)]}`;
    
    case 'video':
      const videoNames = ['intro', 'tutorial', 'promo', 'demo', 'testimonial', 'background'];
      return `${videoNames[Math.floor(Math.random() * videoNames.length)]}-${timestamp}.mp4`;
    
    case 'static':
      const staticTypes = ['main', 'vendor', 'app', 'bundle', 'styles', 'framework'];
      const staticExts = ['js', 'css', 'svg', 'woff2'];
      return `${staticTypes[Math.floor(Math.random() * staticTypes.length)]}.${staticExts[Math.floor(Math.random() * staticExts.length)]}`;
    
    case 'api':
      const apiTypes = ['user', 'product', 'cart', 'settings', 'analytics', 'data'];
      return `${apiTypes[Math.floor(Math.random() * apiTypes.length)]}-${timestamp}.json`;
    
    default:
      return `file-${timestamp}.bin`;
  }
}

// Generate realistic file size based on content type
function generateFileSize(type: string): string {
  switch(type) {
    case 'image':
      // Images typically 100KB to 3MB
      return `${(Math.random() * 2.9 + 0.1).toFixed(1)}MB`;
    
    case 'video':
      // Videos typically 5MB to 100MB
      return `${Math.floor(Math.random() * 95 + 5)}MB`;
    
    case 'static':
      // Static assets typically 10KB to 500KB
      return `${Math.floor(Math.random() * 490 + 10)}KB`;
    
    case 'api':
      // API responses typically 1KB to 50KB
      return `${Math.floor(Math.random() * 49 + 1)}KB`;
    
    default:
      return `${Math.floor(Math.random() * 100 + 1)}KB`;
  }
}

// Add new content to the library (simulating user uploads)
// In the addNewContent function, ensure cached property is set
export function addNewContent() {
  // Determine content type with weighted distribution
  // (more static and image files than video files in typical CDN)
  const typeRandom = Math.random();
  let contentType: string;
  
  if (typeRandom < 0.35) {
    contentType = 'static';
  } else if (typeRandom < 0.7) {
    contentType = 'image';
  } else if (typeRandom < 0.9) {
    contentType = 'video';
  } else {
    contentType = 'api';
  }
  
  // Generate a new ID (max of existing IDs + 1)
  const newId = Math.max(...contentItems.map(item => item.id)) + 1;
  
  // Create the new content item
  const newContent: ContentItem = {
    id: newId,
    type: contentType,
    name: generateFileName(contentType),
    size: generateFileSize(contentType),
    locations: [], // Initially not cached anywhere
    cached: false, // Explicitly set cached to false for new content
    popularity: Math.floor(Math.random() * 30) + 1, // Initial popularity 1-30
    version: '1.0',
    lastUpdated: new Date().toISOString(),
    uploadDate: new Date().toISOString(),
    accessCount: 0
  };
  
  // Add to content library
  contentItems.push(newContent as any);
  
  // If library gets too big, implement content pruning
  if (contentItems.length > 100) {
    pruneContentLibrary();
  }
  
  return newContent;
}
function pruneContentLibrary() {
  contentItems.sort((a, b) => {
    const popularityDiff = (a.popularity || 0) - (b.popularity || 0);
    if (popularityDiff !== 0) return popularityDiff;
    
    const aDate = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0;
    const bDate = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0;
    return aDate - bDate;
  });
  
  while (contentItems.length > 80) { // Keep around 80 items
    contentItems.shift(); // Remove the first (least popular/oldest) item
  }
}