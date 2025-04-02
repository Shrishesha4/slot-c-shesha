<script lang="ts">
	import { 
		edgeLocations, 
		contentTypes, 
		contentItems, 
		cdnMetrics, 
		requestContent, 
		cacheContent 
	} from '$lib/services/cdn';

	let selectedContent = contentItems[0];
	let selectedLocation = edgeLocations[0].id;
	let requestResult: any = null;
	let isLoading = false;


	function handleRequest() {
		isLoading = true;
		
		setTimeout(() => {
			requestResult = requestContent(selectedContent.id, selectedLocation);
			isLoading = false;
		}, 800);
	}

	function handleCache() {
		if (requestResult && !requestResult.cached) {
			cacheContent(selectedContent.id, selectedLocation);
			requestResult = requestContent(selectedContent.id, selectedLocation);
		}
	}

	function getContentTypeInfo(typeId: string) {
		return contentTypes.find(type => type.id === typeId);
	}
</script>

<div class="container mx-auto px-4 py-8">
	<h1 class="text-3xl font-bold mb-6">Scalable Cloud CDN Demo</h1>
	
	<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
		<!-- CDN Metrics Panel -->
		<div class="col-span-1 bg-white rounded-lg shadow p-6">
			<h2 class="text-xl font-semibold mb-4">CDN Performance Metrics</h2>
			
			<div class="space-y-4">
				<div>
					<p class="text-sm text-gray-500">Total Requests</p>
					<p class="text-2xl font-bold">{$cdnMetrics.totalRequests}</p>
				</div>
				
				<div class="grid grid-cols-2 gap-4">
					<div>
						<p class="text-sm text-gray-500">Cache Hit Rate</p>
						<p class="text-xl font-bold">
							{$cdnMetrics.totalRequests ? 
								Math.round(($cdnMetrics.cacheHits / $cdnMetrics.totalRequests) * 100) : 0}%
						</p>
					</div>
					
					<div>
						<p class="text-sm text-gray-500">Avg. Latency</p>
						<p class="text-xl font-bold">{Math.round($cdnMetrics.avgLatency)}ms</p>
					</div>
				</div>
				
				<div>
					<p class="text-sm text-gray-500">Bandwidth Saved</p>
					<p class="text-xl font-bold">{$cdnMetrics.bandwidthSaved.toFixed(2)} MB</p>
				</div>
			</div>
		</div>
		
		<!-- Content Request Simulator -->
		<div class="col-span-1 md:col-span-2 bg-white rounded-lg shadow p-6">
			<h2 class="text-xl font-semibold mb-4">Content Request Simulator</h2>
			
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Content</label>
					<select 
						bind:value={selectedContent} 
						class="w-full p-2 border border-gray-300 rounded-md"
					>
						{#each contentItems as item}
							<option value={item}>{item.name} ({item.type})</option>
						{/each}
					</select>
				</div>
				
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Edge Location</label>
					<select 
						bind:value={selectedLocation} 
						class="w-full p-2 border border-gray-300 rounded-md"
					>
						{#each edgeLocations as location}
							<option value={location.id}>{location.name}</option>
						{/each}
					</select>
				</div>
			</div>
			
			<button 
				on:click={handleRequest}
				disabled={isLoading}
				class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md mb-4 disabled:opacity-50"
			>
				{isLoading ? 'Requesting...' : 'Request Content'}
			</button>
			
			{#if requestResult}
				<div class="bg-gray-50 p-4 rounded-md">
					<div class="flex justify-between items-center mb-2">
						<h3 class="font-semibold">Request Result</h3>
						<span class={`${requestResult.cached ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'} px-2 py-1 rounded text-sm`}>
							{requestResult.cached ? 'Cache HIT' : 'Cache MISS'}
						</span>
					</div>
					
					<div class="grid grid-cols-2 gap-4">
						<div>
							<p class="text-sm text-gray-500">Content</p>
							<p class="font-medium">{requestResult.content.name}</p>
						</div>
						
						<div>
							<p class="text-sm text-gray-500">Size</p>
							<p class="font-medium">{requestResult.content.size}</p>
						</div>
						
						<div>
							<p class="text-sm text-gray-500">Edge Location</p>
							<p class="font-medium">{requestResult.location.name}</p>
						</div>
						
						<div>
							<p class="text-sm text-gray-500">Latency</p>
							<p class="font-medium">{requestResult.latency}ms</p>
						</div>
					</div>
					
					{#if !requestResult.cached}
						<button 
							on:click={handleCache}
							class="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md"
						>
							Cache at this Edge Location
						</button>
					{/if}
				</div>
			{/if}
		</div>
	</div>
	
	<!-- Edge Locations Map -->
	<div class="mt-8 bg-white rounded-lg shadow p-6">
		<h2 class="text-xl font-semibold mb-4">Global Edge Locations</h2>
		
		<div class="overflow-x-auto">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Latency</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cached Content</th>
					</tr>
				</thead>
				<tbody class="bg-white divide-y divide-gray-200">
					{#each edgeLocations as location}
						<tr>
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="font-medium text-gray-900">{location.name}</div>
								<div class="text-sm text-gray-500">{location.id}</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
									{location.status}
								</span>
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
								{location.latency}ms
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
								{contentItems.filter(item => item.locations.includes(location.id)).length} / {contentItems.length}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
	
	<!-- Content Types -->
	<div class="mt-8 bg-white rounded-lg shadow p-6">
		<h2 class="text-xl font-semibold mb-4">Content Types & Caching Policies</h2>
		
		<div class="overflow-x-auto">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average Size</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cache Time</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
					</tr>
				</thead>
				<tbody class="bg-white divide-y divide-gray-200">
					{#each contentTypes as type}
						<tr>
							<td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
								{type.name}
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
								{type.avgSize}
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
								{type.cacheTime}
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
								{contentItems.filter(item => item.type === type.id).length}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
