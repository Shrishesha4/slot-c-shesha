<script lang="ts">
	import { page } from '$app/stores';
	import { 
		contentItems, 
		edgeLocations, 
		contentTypes,
		requestContent,
		cacheContent
	} from '$lib/services/cdn';
	
	const contentId = parseInt($page.params.id);
	$: content = contentItems.find(item => item.id === contentId);
	
	let selectedLocation = '';
	let requestResult: any = null;
	
	// Make these functions reactive
$: getContentType = (typeId: string) => {
		return contentTypes.find(type => type.id === typeId);
	}
	
$: getEdgeLocation = (locationId: string) => {
		return edgeLocations.find(location => location.id === locationId);
	}
	
	function handleRequest() {
		if (selectedLocation && content) {
			requestResult = requestContent(content.id, selectedLocation);
		}
	}
	
	function handleCache() {
		if (content && selectedLocation) {
			cacheContent(content.id, selectedLocation);
			// Refresh content to show updated cache status
			requestResult = requestContent(content.id, selectedLocation);
		}
	}
</script>

<div class="container mx-auto px-4 py-8">
	<div class="mb-4">
		<a href="/" class="text-blue-600 hover:underline">← Back to Dashboard</a>
	</div>
	
	{#if content}
		<div class="bg-white rounded-lg shadow overflow-hidden">
			<div class="p-6">
				<h1 class="text-2xl font-bold mb-2">{content.name}</h1>
				<div class="flex items-center mb-6">
					<span class="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded mr-2">
						{getContentType(content.type)?.name || content.type}
					</span>
					<span class="text-gray-500 text-sm">{content.size}</span>
				</div>
				
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<h2 class="text-lg font-semibold mb-3">Content Details</h2>
						<div class="bg-gray-50 p-4 rounded-md">
							<div class="grid grid-cols-2 gap-4">
								<div>
									<p class="text-sm text-gray-500">Type</p>
									<p class="font-medium">{getContentType(content.type)?.name || content.type}</p>
								</div>
								
								<div>
									<p class="text-sm text-gray-500">Size</p>
									<p class="font-medium">{content.size}</p>
								</div>
								
								<div>
									<p class="text-sm text-gray-500">Cache Time</p>
									<p class="font-medium">{getContentType(content.type)?.cacheTime || 'Unknown'}</p>
								</div>
								
								<div>
									<p class="text-sm text-gray-500">Cached Locations</p>
									<p class="font-medium">{content.locations.length} / {edgeLocations.length}</p>
								</div>
							</div>
						</div>
						
						<h2 class="text-lg font-semibold mt-6 mb-3">Request Simulator</h2>
						<div class="bg-gray-50 p-4 rounded-md">
							<div class="mb-4">
								<label class="block text-sm font-medium text-gray-700 mb-1">Edge Location</label>
								<select 
									bind:value={selectedLocation} 
									class="w-full p-2 border border-gray-300 rounded-md"
								>
									<option value="">Select an edge location</option>
									{#each edgeLocations as location}
										<option value={location.id}>{location.name}</option>
									{/each}
								</select>
							</div>
							
							<button 
								on:click={handleRequest}
								disabled={!selectedLocation}
								class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
							>
								Request Content
							</button>
							
							{#if requestResult}
								<div class="mt-4 p-3 border rounded-md">
									<div class="flex justify-between items-center mb-2">
										<h3 class="font-semibold">Request Result</h3>
										<span class={`${requestResult.cached ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'} px-2 py-1 rounded text-sm`}>
											{requestResult.cached ? 'Cache HIT' : 'Cache MISS'}
										</span>
									</div>
									
									<div class="text-sm">
										<p><span class="text-gray-500">Latency:</span> {requestResult.latency}ms</p>
										<p><span class="text-gray-500">Location:</span> {requestResult.location.name}</p>
									</div>
									
									{#if !requestResult.cached}
										<button 
											on:click={handleCache}
											class="mt-3 w-full bg-green-600 hover:bg-green-700 text-white font-medium py-1 px-3 rounded-md text-sm"
										>
											Cache at this Edge Location
										</button>
									{/if}
								</div>
							{/if}
						</div>
					</div>
					
					<div>
						<h2 class="text-lg font-semibold mb-3">Cached Edge Locations</h2>
						{#if content.locations.length > 0}
							<div class="space-y-3">
								{#each content.locations as locationId}
									{#if getEdgeLocation(locationId)}
										<div class="bg-gray-50 p-3 rounded-md flex justify-between items-center">
											<div>
												<p class="font-medium">{getEdgeLocation(locationId)?.name}</p>
												<p class="text-sm text-gray-500">Latency: {getEdgeLocation(locationId)?.latency}ms</p>
											</div>
											<span class="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
												Cached
											</span>
										</div>
									{/if}
								{/each}
							</div>
						{:else}
							<div class="bg-yellow-50 p-4 rounded-md text-yellow-800">
								This content is not cached at any edge location yet.
							</div>
						{/if}
						
						<h2 class="text-lg font-semibold mt-6 mb-3">Non-Cached Edge Locations</h2>
						<div class="space-y-3">
							{#each edgeLocations.filter(loc => !content.locations.includes(loc.id)) as location}
								<div class="bg-gray-50 p-3 rounded-md flex justify-between items-center">
									<div>
										<p class="font-medium">{location.name}</p>
										<p class="text-sm text-gray-500">Latency: {location.latency}ms</p>
									</div>
									<button 
										on:click={() => {
											selectedLocation = location.id;
											requestResult = requestContent(content.id, location.id);
											if (!requestResult.cached) {
												handleCache();
											}
										}}
										class="px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700"
									>
										Cache Here
									</button>
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>
	{:else}
		<div class="bg-red-50 p-6 rounded-lg text-red-800">
			Content with ID {contentId} not found.
		</div>
	{/if}
</div>