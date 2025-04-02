<script lang="ts">
	import { contentItems, contentTypes, edgeLocations } from '$lib/services/cdn';
	
	// Make these functions reactive
	$: getContentType = (typeId: string) => {
		return contentTypes.find(type => type.id === typeId);
	}
	
	$: getCachePercentage = (locations: string[]) => {
		return Math.round((locations.length / edgeLocations.length) * 100);
	}
</script>

<div class="container mx-auto px-4 py-8">
	<div class="mb-4">
		<a href="/" class="text-blue-600 hover:underline">← Back to Dashboard</a>
	</div>
	
	<h1 class="text-2xl font-bold mb-6">Content Library</h1>
	
	<div class="bg-white rounded-lg shadow overflow-hidden">
		<div class="overflow-x-auto">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cache Status</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
					</tr>
				</thead>
				<tbody class="bg-white divide-y divide-gray-200">
					{#each contentItems as item}
						<tr>
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="font-medium text-gray-900">{item.name}</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
									{getContentType(item.type)?.name || item.type}
								</span>
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
								{item.size}
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="flex items-center">
									<div class="w-full bg-gray-200 rounded-full h-2.5 mr-2">
										<div class="bg-blue-600 h-2.5 rounded-full" style="width: {getCachePercentage(item.locations)}%"></div>
									</div>
									<span class="text-sm text-gray-500">{item.locations.length}/{edgeLocations.length}</span>
								</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
								<a href="/content/{item.id}" class="text-blue-600 hover:text-blue-900">View Details</a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>