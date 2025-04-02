<script lang="ts">
	import '../app.css';
	import Navigation from '$lib/components/Navigation.svelte';
	import { onMount } from 'svelte';
	import { 
		edgeLocations, 
		contentItems, 
		requestContent, 
		cdnMetrics, 
		updateContentPopularity, 
		autoCachePopularContent, 
		simulateContentVersionUpdate,
		addNewContent 
	} from '$lib/services/cdn';

	let { children } = $props();
	let serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
	
	// Simulate real-world CDN traffic with time-based patterns
	onMount(() => {
		// First, try to load saved metrics from localStorage
		try {
			const savedMetrics = localStorage.getItem('cdnMetrics');
			if (savedMetrics) {
				const parsedMetrics = JSON.parse(savedMetrics);
				cdnMetrics.set(parsedMetrics);
				console.log('Restored CDN metrics from storage:', parsedMetrics);
			}
		} catch (e) {
			console.error('Error loading saved metrics:', e);
		}
		
		// Subscribe to cdnMetrics changes to persist them
		const unsubscribe = cdnMetrics.subscribe(metrics => {
			try {
				localStorage.setItem('cdnMetrics', JSON.stringify(metrics));
				
				// Also send to service worker if available
				if (serviceWorkerRegistration) {
					serviceWorkerRegistration.active?.postMessage({
						type: 'STORE_METRICS',
						metrics
					});
				}
			} catch (e) {
				console.error('Error saving metrics:', e);
			}
		});
		
		// Set up background request simulation
		let simulationInterval: number;
		
		// Function to make requests at varying rates based on time of day
		const simulateTraffic = () => {
			// Get current time-based parameters
			const { batchSize, interval } = getTimeBasedRequestParams();
			
			// Clear existing interval if any
			if (simulationInterval) clearInterval(simulationInterval);
			
			// Set up new interval with time-appropriate frequency
			simulationInterval = setInterval(() => {
				// Make multiple requests in each batch to simulate real traffic
				for (let i = 0; i < batchSize; i++) {
					// Select content with weighted distribution (popular content gets more requests)
					const contentIndex = Math.floor(Math.pow(Math.random(), 1.5) * contentItems.length);
					const randomContent = contentItems[contentIndex];
					
					// Select location with geographic distribution weighting
					const randomLocation = selectWeightedLocation();
					
					// Make the request
					requestContent(randomContent.id, randomLocation);
				}
			}, interval);
		};
		
		// Start initial simulation
		simulateTraffic();
		
		// Set up periodic adjustment based on time of day
		const timeAdjustmentInterval = setInterval(() => {
			simulateTraffic();
		}, 15 * 60 * 1000); // Re-adjust every 15 minutes
		
		// Register service worker for background operation
		if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
			navigator.serviceWorker.register('/background-worker.js')
				.then(registration => {
					console.log('Background worker registered for CDN simulation');
					serviceWorkerRegistration = registration;
					
					// Set up message listener for service worker
					navigator.serviceWorker.addEventListener('message', event => {
						if (event.data && event.data.type === 'SIMULATE_CDN_TRAFFIC') {
							// Trigger a batch of simulated traffic
							const { batchSize } = getTimeBasedRequestParams();
							for (let i = 0; i < batchSize; i++) {
								const contentIndex = Math.floor(Math.pow(Math.random(), 1.5) * contentItems.length);
								const randomContent = contentItems[contentIndex];
								const randomLocation = selectWeightedLocation();
								requestContent(randomContent.id, randomLocation);
							}
						} else if (event.data && event.data.type === 'UPDATE_CONTENT_POPULARITY') {
							// Update content popularity based on access patterns
							updateContentPopularity();
							
							// Send updated content library to service worker
							if (serviceWorkerRegistration) {
								serviceWorkerRegistration.active?.postMessage({
									type: 'STORE_CONTENT_LIBRARY',
									contentItems
								});
							}
						} else if (event.data && event.data.type === 'AUTO_CACHE_POPULAR_CONTENT') {
							// Auto-cache popular content at edge locations
							autoCachePopularContent();
							
							// Send updated content library to service worker
							if (serviceWorkerRegistration) {
								serviceWorkerRegistration.active?.postMessage({
									type: 'STORE_CONTENT_LIBRARY',
									contentItems
								});
							}
						} else if (event.data && event.data.type === 'CONTENT_VERSION_UPDATE') {
							// Simulate content version update
							const updatedItem = simulateContentVersionUpdate();
							
							// Send updated content library to service worker
							if (serviceWorkerRegistration) {
								serviceWorkerRegistration.active?.postMessage({
									type: 'STORE_CONTENT_LIBRARY',
									contentItems
								});
							}
						} else if (event.data && event.data.type === 'ADD_NEW_CONTENT') {
							// Simulate new content being added (user upload)
							const newContent = addNewContent();
							console.log('New content added to library:', newContent.name);
							
							// Send updated content library to service worker
							if (serviceWorkerRegistration) {
								serviceWorkerRegistration.active?.postMessage({
									type: 'STORE_CONTENT_LIBRARY',
									contentItems
								});
							}
						}
					});
				})
				.catch(error => {
					console.error('Background worker registration failed:', error);
				});
		}
		
		// Clean up on component unmount
		return () => {
			unsubscribe();
			clearInterval(simulationInterval);
			clearInterval(timeAdjustmentInterval);
		};
	});
	
	// Helper function to get time-based request parameters
	function getTimeBasedRequestParams() {
		const hour = new Date().getHours();
		
		// Business hours (8am-6pm): High traffic with faster processing
		if (hour >= 8 && hour <= 18) {
			return {
				batchSize: Math.floor(Math.random() * 10) + 15, // 15-25 requests per batch - increased
				interval: Math.floor(Math.random() * 500) + 500 // 500-1000ms between batches - much faster
			};
		}
		// Evening hours (6pm-11pm): Medium traffic with faster processing
		else if (hour > 18 && hour <= 23) {
			return {
				batchSize: Math.floor(Math.random() * 8) + 10, // 10-18 requests per batch - increased
				interval: Math.floor(Math.random() * 700) + 800 // 800-1500ms between batches - faster
			};
		}
		// Late night/early morning (11pm-8am): VERY HIGH traffic with ultra-fast processing
		else {
			return {
				batchSize: Math.floor(Math.random() * 150) + 2599, // Keep the high volume
				interval: Math.floor(Math.random() * 300) + 300 // 300-600ms between batches - ultra fast
			};
		}
	}
	
	// Helper function to select a location based on geographic distribution
	function selectWeightedLocation() {
		// Define geographic distribution weights
		const locationWeights = {
			'us-east': 0.25,    // 25% of traffic
			'us-west': 0.15,    // 15% of traffic
			'eu-west': 0.20,    // 20% of traffic
			'ap-south': 0.15,   // 15% of traffic
			'ap-northeast': 0.20, // 20% of traffic
			'sa-east': 0.05     // 5% of traffic
		};
		
		const random = Math.random();
		let cumulativeWeight = 0;
		
		for (const [locationId, weight] of Object.entries(locationWeights)) {
			cumulativeWeight += weight;
			if (random <= cumulativeWeight) {
				return locationId;
			}
		}
		
		// Fallback to first location
		return edgeLocations[0].id;
	}
</script>

<div class="min-h-screen bg-gray-100">
	<Navigation />
	<main>
		{@render children()}
	</main>
</div>
