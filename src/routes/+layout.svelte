<script lang="ts">
	import '../app.css';
	import Navigation from '$lib/components/Navigation.svelte';
	import { onMount } from 'svelte';
	import { edgeLocations, contentItems, requestContent, cdnMetrics } from '$lib/services/cdn';

	let { children } = $props();
	
	// Simulate high-traffic application requests
	onMount(() => {
		// Track the last update time for throttling UI updates
		let lastUIUpdate = Date.now();
		let requestCount = 0;
		
		// Function to make a batch of requests
		const makeBatchRequests = () => {
			// Simulate 10-30 requests per batch (thousands per minute)
			const batchSize = Math.floor(Math.random() * 20) + 10;
			
			for (let i = 0; i < batchSize; i++) {
				// Randomly select content and location with weighted distribution
				// Popular content gets requested more frequently
				const contentIndex = Math.floor(Math.pow(Math.random(), 2) * contentItems.length);
				const randomContent = contentItems[contentIndex];
				
				// Simulate geographic distribution - some regions have more traffic
				const locationWeights = {
					'us-east': 0.25,    // 25% of traffic
					'us-west': 0.15,    // 15% of traffic
					'eu-west': 0.20,    // 20% of traffic
					'ap-south': 0.15,   // 15% of traffic
					'ap-northeast': 0.20, // 20% of traffic
					'sa-east': 0.05     // 5% of traffic
				};
				
				// Select location based on weights
				const rand = Math.random();
				let cumulativeWeight = 0;
				let selectedLocation = edgeLocations[0].id;
				
				for (const [locId, weight] of Object.entries(locationWeights)) {
					cumulativeWeight += weight;
					if (rand <= cumulativeWeight) {
						selectedLocation = locId;
						break;
					}
				}
				
				// Make the request
				requestContent(randomContent.id, selectedLocation);
				requestCount++;
			}
			
			// Update UI at most once per second to avoid performance issues
			const now = Date.now();
			if (now - lastUIUpdate > 1000) {
				console.log(`CDN Traffic: ${requestCount} requests in the last ${((now - lastUIUpdate) / 1000).toFixed(1)}s`);
				lastUIUpdate = now;
				requestCount = 0;
			}
		};
		
		// Run batch requests at high frequency (50-100ms)
		const interval = setInterval(makeBatchRequests, Math.floor(Math.random() * 50) + 50);
		
		return () => clearInterval(interval);
	});
</script>

<div class="min-h-screen bg-gray-100">
	<Navigation />
	<main>
		{@render children()}
	</main>
</div>
