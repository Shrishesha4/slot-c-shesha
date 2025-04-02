<script lang="ts">
	import { edgeLocations, contentItems, cdnMetrics } from '$lib/services/cdn';
	
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
								<p class="text-sm text-gray-500">Base Latency</p>
								<p class="font-medium">{location.latency}ms</p>
							</div>
						</div>
						
						<div>
							<p class="text-sm text-gray-500 mb-2">Cached Content</p>
							{#if getContentCount(location.id) !== undefined && getContentCount(location.id) > 0}
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
</div>