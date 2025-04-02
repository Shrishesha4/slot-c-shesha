<script lang="ts">
	import { page } from '$app/stores';
	import { edgeLocations, contentItems, contentTypes, requestContent, cdnMetrics } from '$lib/services/cdn';
	
	const locationId = $page.params.id;
	$: location = edgeLocations.find(loc => loc.id === locationId);
	
	let selectedContent = contentItems.length > 0 ? contentItems[0].id : null;
	let requestResult: any = null;
	let isLoading = false;
	
	// Make these functions reactive to changes in contentItems and location
	$: getContentCount = () => {
		if (!location) return 0;
		return contentItems.filter(item => item.locations.includes(location.id)).length;
	}
	
	$: getCachePercentage = () => {
		return Math.round((getContentCount() / contentItems.length) * 100);
	}
	
	$: getContentType = (typeId: string) => {
		return contentTypes.find(type => type.id === typeId);
	}
	
	function handleRequest() {
		if (!selectedContent || !location) return;
		
		isLoading = true;
		setTimeout(() => {
			requestResult = selectedContent ? requestContent(selectedContent, location.id) : null;
			isLoading = false;
		}, 800);
	}
	
	// Group content by type - make reactive
	$: getContentByType = () => {
		if (!location) return {};
		
		const result: Record<string, any[]> = {};
		
		contentItems.filter(item => item.locations.includes(location.id)).forEach(item => {
			if (!result[item.type]) {
				result[item.type] = [];
			}
			result[item.type].push(item);
		});
		
		return result;
	}
	
	// Get non-cached content - make reactive
	$: getNonCachedContent = () => {
		if (!location) return [];
		return contentItems.filter(item => !item.locations.includes(location.id));
	}
</script>

<!-- Update the template to use the correct function calls -->
<div class="container mx-auto px-4 py-8">
	<div class="mb-4">
		<a href="/locations" class="text-blue-600 hover:underline">← Back to Edge Locations</a>
	</div>
	
	{#if location}
		<div class="bg-white rounded-lg shadow overflow-hidden">
			<div class="p-6">
				<h1 class="text-2xl font-bold mb-2">{location.name}</h1>
				<p class="text-gray-500 mb-6">{location.id}</p>
				
				<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
					<div class="bg-gray-50 p-4 rounded-md">
						<h3 class="font-semibold mb-2">Status</h3>
						<span class="px-2 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
							{location.status}
						</span>
					</div>
					
					<div class="bg-gray-50 p-4 rounded-md">
						<h3 class="font-semibold mb-2">Base Latency</h3>
						<p class="text-2xl font-bold">{location.latency}ms</p>
					</div>
					
					<div class="bg-gray-50 p-4 rounded-md">
						<h3 class="font-semibold mb-2">Cache Coverage</h3>
						<div class="flex items-center">
							<div class="w-full bg-gray-200 rounded-full h-2.5 mr-2">
								<div class="bg-blue-600 h-2.5 rounded-full" style="width: {getCachePercentage()}%"></div>
							</div>
							<span>{getContentCount()}/{contentItems.length}</span>
						</div>
					</div>
				</div>
				
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<h2 class="text-xl font-semibold mb-4">Cached Content</h2>
						
						{#if getContentCount() > 0}
							{#each Object.entries(getContentByType()) as [type, items]}
								<div class="mb-4">
									<h3 class="font-medium text-gray-700 mb-2">
										{getContentType(type)?.name || type} ({items.length})
									</h3>
									<div class="space-y-2">
										{#each items as item}
											<div class="bg-gray-50 p-3 rounded-md flex justify-between items-center">
												<div>
													<p class="font-medium">{item.name}</p>
													<p class="text-sm text-gray-500">{item.size}</p>
												</div>
												<a href="/content/{item.id}" class="text-blue-600 hover:underline text-sm">
													View
												</a>
											</div>
										{/each}
									</div>
								</div>
							{/each}
						{:else}
							<div class="bg-yellow-50 p-4 rounded-md text-yellow-800">
								No content is cached at this edge location yet.
							</div>
						{/if}
					</div>
					
					<div>
						<h2 class="text-xl font-semibold mb-4">Content Request Simulator</h2>
						
						<div class="bg-gray-50 p-4 rounded-md">
							<div class="mb-4">
								<label class="block text-sm font-medium text-gray-700 mb-1">Content</label>
								<select 
									bind:value={selectedContent} 
									class="w-full p-2 border border-gray-300 rounded-md"
								>
									{#each contentItems as item}
										<option value={item.id}>{item.name} ({item.type})</option>
									{/each}
								</select>
							</div>
							
							<button 
								on:click={handleRequest}
								disabled={isLoading}
								class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md mb-4 disabled:opacity-50"
							>
								{isLoading ? 'Requesting...' : 'Request Content'}
							</button>
							
							{#if requestResult}
								<div class="bg-gray-100 p-3 rounded-md">
									<div class="flex justify-between items-center mb-2">
										<h3 class="font-semibold">Request Result</h3>
										<span class="{`${requestResult.cached ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'} px-2 py-1 rounded text-sm`}">
											{requestResult.cached ? 'Cache HIT' : 'Cache MISS'}
										</span>
									</div>
									
									<div class="grid grid-cols-2 gap-2 text-sm">
										<div>
											<p class="text-gray-500">Content</p>
											<p class="font-medium">{requestResult.content.name}</p>
										</div>
										
										<div>
											<p class="text-gray-500">Size</p>
											<p class="font-medium">{requestResult.content.size}</p>
										</div>
										
										<div>
											<p class="text-gray-500">Latency</p>
											<p class="font-medium">{requestResult.latency}ms</p>
										</div>
										
										<div>
											<p class="text-gray-500">Type</p>
											<p class="font-medium">{getContentType(requestResult.content.type)?.name || requestResult.content.type}</p>
										</div>
									</div>
								</div>
							{/if}
						</div>
						
						<h2 class="text-xl font-semibold mt-6 mb-4">Non-Cached Content</h2>
						
						{#if getNonCachedContent().length > 0}
							<div class="bg-gray-50 p-4 rounded-md">
								<p class="text-sm text-gray-700 mb-3">
									{getNonCachedContent().length} items are not cached at this location
								</p>
								
								<div class="max-h-60 overflow-y-auto space-y-2">
									{#each getNonCachedContent() as item}
										<div class="bg-gray-100 p-2 rounded-md text-sm flex justify-between items-center">
											<span>{item.name}</span>
											<a href="/content/{item.id}" class="text-blue-600 hover:underline">
												Cache Here
											</a>
										</div>
									{/each}
								</div>
							</div>
						{:else}
							<div class="bg-green-50 p-4 rounded-md text-green-800">
								All content is cached at this edge location!
							</div>
						{/if}
					</div>
				</div>
				
				<div class="mt-8">
					<h2 class="text-xl font-semibold mb-4">Performance Metrics</h2>
					
					<div class="bg-gray-50 p-4 rounded-md">
						<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<p class="text-sm text-gray-500">Average Response Time</p>
								<p class="text-2xl font-bold">{location.latency * 0.8}ms</p>
								<p class="text-xs text-green-600">20% faster than origin</p>
							</div>
							
							<div>
								<p class="text-sm text-gray-500">Cache Hit Ratio</p>
								<p class="text-2xl font-bold">92%</p>
								<p class="text-xs text-gray-500">Last 24 hours</p>
							</div>
							
							<div>
								<p class="text-sm text-gray-500">Bandwidth Saved</p>
								<p class="text-2xl font-bold">128 GB</p>
								<p class="text-xs text-gray-500">Last 7 days</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	{:else}
		<div class="bg-red-50 p-6 rounded-lg text-red-800">
			Edge location with ID {locationId} not found.
		</div>
	{/if}
</div>