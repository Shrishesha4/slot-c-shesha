<script lang="ts">
	import { onMount } from 'svelte';
	import { edgeLocations, contentItems } from '$lib/services/cdn';
	
	// Store for dynamic latency values
	let dynamicLatencies: Record<string, number> = {};
	let intervalId: number;
	
	// Initialize dynamic latencies with base values
	onMount(() => {
		// Set initial values
		edgeLocations.forEach(location => {
			dynamicLatencies[location.id] = location.latency;
		});
		
		// Update latencies periodically
		intervalId = setInterval(updateLatencies, 2000);
		
		return () => {
			clearInterval(intervalId);
		};
	});
	
	// Function to update latencies with realistic variations
	function updateLatencies() {
		edgeLocations.forEach(location => {
			// Get time-of-day and region-specific factors
			const timeOfDayFactor = getTimeOfDayFactor();
			const regionFactor = getRegionVariationFactor(location.id);
			
			// Apply random variation within realistic bounds
			const variationPercent = (Math.random() * 0.2) - 0.1; // -10% to +10%
			const newLatency = Math.round(
				location.latency * (1 + variationPercent) * timeOfDayFactor * regionFactor
			);
			
			// Update the dynamic latency value
			dynamicLatencies[location.id] = newLatency;
		});
	}
	
	// Helper function to simulate time-of-day effects on latency
	function getTimeOfDayFactor() {
		const hour = new Date().getHours();
		
		// Peak hours have higher latency
		if ((hour >= 8 && hour <= 11) || (hour >= 19 && hour <= 22)) {
			return 1.05 + (Math.random() * 0.1); // 5-15% higher during peak
		} 
		// Late night has lower latency
		else if (hour >= 23 || hour <= 5) {
			return 0.9 + (Math.random() * 0.05); // 5-10% lower during night
		}
		// Normal hours
		else {
			return 0.95 + (Math.random() * 0.1); // -5% to +5% during normal hours
		}
	}
	
	// Helper function to simulate geographic variations
	function getRegionVariationFactor(locationId: string) {
		// Some regions have more variable connections
		switch (locationId) {
			case 'ap-south': return 1.0 + (Math.random() * 0.15); // More variable in Asia-Pacific
			case 'ap-northeast': return 1.0 + (Math.random() * 0.12);
			case 'sa-east': return 1.0 + (Math.random() * 0.1); // South America has some variability
			default: return 1.0 + (Math.random() * 0.05); // US/EU more stable
		}
	}
	
	// Make these functions reactive to changes in contentItems
	$: getContentCount = (locationId: string) => {
		return contentItems.filter(item => item.locations.includes(locationId)).length;
	}
	
	$: getCachePercentage = (locationId: string) => {
		const contentCount = getContentCount(locationId);
		return Math.round((contentCount / contentItems.length) * 100);
	}
</script>

<div class="container mx-auto px-4 py-8">
	<div class="mb-4">
		<a href="/" class="text-blue-600 hover:underline">← Back to Dashboard</a>
	</div>
	
	<h1 class="text-2xl font-bold mb-6">Edge Locations</h1>
	
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
		{#each edgeLocations as location}
			<div class="bg-white rounded-lg shadow overflow-hidden">
				<div class="p-6">
					<h2 class="text-xl font-semibold mb-2">{location.name}</h2>
					<p class="text-gray-500 mb-4">{location.id}</p>
					
					<div class="space-y-4">
						<div>
							<div class="flex justify-between mb-1">
								<span class="text-sm font-medium text-gray-700">Cache Status</span>
								<span class="text-sm text-gray-500">{getContentCount(location.id)}/{contentItems.length}</span>
							</div>
							<div class="w-full bg-gray-200 rounded-full h-2.5">
								<div class="bg-blue-600 h-2.5 rounded-full" style="width: {getCachePercentage(location.id)}%"></div>
							</div>
						</div>
						
						<div class="grid grid-cols-2 gap-4">
							<div>
								<p class="text-sm text-gray-500">Status</p>
								<p class="font-medium">{location.status}</p>
							</div>
							
							<div>
								<p class="text-sm text-gray-500">Current Latency</p>
								<p class="font-medium">
									{dynamicLatencies[location.id] || location.latency}ms
									{#if dynamicLatencies[location.id] && dynamicLatencies[location.id] !== location.latency}
										<span class={dynamicLatencies[location.id] > location.latency ? 'text-red-500 text-xs' : 'text-green-500 text-xs'}>
											({dynamicLatencies[location.id] > location.latency ? '+' : ''}{dynamicLatencies[location.id] - location.latency}ms)
										</span>
									{/if}
								</p>
							</div>
						</div>
						
						<div>
							<p class="text-sm text-gray-500 mb-2">Cached Content</p>
							{#if getContentCount(location.id) > 0}
								<div class="space-y-2 max-h-40 overflow-y-auto">
									{#each contentItems.filter(item => item.locations.includes(location.id)) as item}
										<div class="bg-gray-50 p-2 rounded text-sm flex justify-between">
											<span>{item.name}</span>
											<span class="text-gray-500">{item.size}</span>
										</div>
									{/each}
								</div>
							{:else}
								<p class="text-sm text-gray-500 italic">No content cached at this location</p>
							{/if}
						</div>
						
						<a href="/locations/{location.id}" class="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md">
							View Details
						</a>
					</div>
				</div>
			</div>
		{/each}
	</div>
	
	<div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
		<div class="bg-gray-50 p-4 rounded-md">
			<h3 class="font-semibold mb-2">Total Edge Locations</h3>
			<p class="text-2xl font-bold">{edgeLocations.length}</p>
		</div>
		
		<div class="bg-gray-50 p-4 rounded-md">
			<h3 class="font-semibold mb-2">Average Latency</h3>
			<p class="text-2xl font-bold">
				{Math.round(Object.values(dynamicLatencies).length > 0 
					? Object.values(dynamicLatencies).reduce((sum, latency) => sum + latency, 0) / Object.values(dynamicLatencies).length
					: edgeLocations.reduce((sum, loc) => sum + loc.latency, 0) / edgeLocations.length
				)}ms
			</p>
		</div>
		
		<div class="bg-gray-50 p-4 rounded-md">
			<h3 class="font-semibold mb-2">Global Cache Coverage</h3>
			<p class="text-2xl font-bold">
				{Math.round((edgeLocations.reduce((sum, loc) => sum + getContentCount(loc.id), 0) / (edgeLocations.length * contentItems.length)) * 100)}%
			</p>
		</div>
	</div>
</div>