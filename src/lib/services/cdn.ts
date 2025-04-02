import { writable } from 'svelte/store';

// Simulated edge locations around the world
export const edgeLocations = [
	{ id: 'us-east', name: 'US East (N. Virginia)', latency: 35, status: 'active' },
	{ id: 'us-west', name: 'US West (Oregon)', latency: 75, status: 'active' },
	{ id: 'eu-west', name: 'Europe (Ireland)', latency: 120, status: 'active' },
	{ id: 'ap-south', name: 'Asia Pacific (Mumbai)', latency: 180, status: 'active' },
	{ id: 'ap-northeast', name: 'Asia Pacific (Tokyo)', latency: 160, status: 'active' },
	{ id: 'sa-east', name: 'South America (São Paulo)', latency: 140, status: 'active' }
];

// Simulated content types
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
		locations: ['us-east', 'us-west', 'eu-west']
	},
	{
		id: 2,
		type: 'video',
		name: 'product-demo.mp4',
		size: '45MB',
		cached: true,
		locations: ['us-east', 'ap-south']
	},
	{
		id: 3,
		type: 'static',
		name: 'main.js',
		size: '320KB',
		cached: true,
		locations: ['us-east', 'us-west', 'eu-west', 'ap-south', 'ap-northeast', 'sa-east']
	},
	{
		id: 4,
		type: 'api',
		name: 'user-data.json',
		size: '8KB',
		cached: false,
		locations: ['us-east']
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
export function requestContent(contentId: number, locationId: string) {
	const content = contentItems.find((item) => item.id === contentId);
	const location = edgeLocations.find((loc) => loc.id === locationId);
	
	if (!content || !location) return null;
	
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