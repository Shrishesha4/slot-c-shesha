<script lang="ts">
  import { contentItems, contentTypes, edgeLocations } from '$lib/services/cdn';
  
  // Sorting options
  let sortBy = 'newest'; // Default sort by newest
  let filteredItems = [...contentItems];
  
  // Apply sorting and filtering
  $: {
    filteredItems = [...contentItems];
    
    // Apply sorting
    if (sortBy === 'newest') {
      filteredItems.sort((a, b) => {
        const dateA = a.uploadDate ? new Date(a.uploadDate).getTime() : 0;
        const dateB = b.uploadDate ? new Date(b.uploadDate).getTime() : 0;
        return dateB - dateA; // Newest first
      });
    } else if (sortBy === 'oldest') {
      filteredItems.sort((a, b) => {
        const dateA = a.uploadDate ? new Date(a.uploadDate).getTime() : 0;
        const dateB = b.uploadDate ? new Date(b.uploadDate).getTime() : 0;
        return dateA - dateB; // Oldest first
      });
    } else if (sortBy === 'popular') {
      filteredItems.sort((a, b) => (b.popularity || 0) - (a.popularity || 0)); // Most popular first
    } else if (sortBy === 'size') {
      filteredItems.sort((a, b) => {
        const sizeA = parseFloat(a.size.replace(/[^0-9.]/g, '')) * (a.size.includes('MB') ? 1000 : 1);
        const sizeB = parseFloat(b.size.replace(/[^0-9.]/g, '')) * (b.size.includes('MB') ? 1000 : 1);
        return sizeB - sizeA; // Largest first
      });
    }
  }
  
  function getContentType(typeId: string) {
    return contentTypes.find(type => type.id === typeId);
  }
  
  function getCachePercentage(locations: string[]) {
    return Math.round((locations.length / edgeLocations.length) * 100);
  }
  
  function getPopularityClass(popularity: number = 50) {
    if (popularity >= 80) return 'bg-green-100 text-green-800';
    if (popularity >= 50) return 'bg-blue-100 text-blue-800';
    if (popularity >= 30) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  }
  
  function formatLastUpdated(timestamp: string | undefined) {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString();
  }
  
  function formatUploadDate(timestamp: string | undefined) {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  }
</script>

<div class="container mx-auto px-4 py-8">
  <div class="mb-4">
    <a href="/" class="text-blue-600 hover:underline">← Back to Dashboard</a>
  </div>
  
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold">Content Library ({contentItems.length} items)</h1>
    
    <div class="flex items-center space-x-2">
      <label for="sortBy" class="text-sm font-medium text-gray-700">Sort by:</label>
      <select 
        id="sortBy" 
        bind:value={sortBy} 
        class="border border-gray-300 rounded-md px-3 py-1 text-sm"
      >
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="popular">Most Popular</option>
        <option value="size">Largest Size</option>
      </select>
    </div>
  </div>
  
  <div class="bg-white rounded-lg shadow overflow-hidden">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Version</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Popularity</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cache Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Date</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          {#each filteredItems as item}
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
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                v{item.version || '1.0'}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full {getPopularityClass(item.popularity || 50)}">
                  {item.popularity || 50}%
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                    <div class="bg-blue-600 h-2.5 rounded-full" style="width: {getCachePercentage(item.locations)}%"></div>
                  </div>
                  <span class="text-sm text-gray-500">{item.locations.length}/{edgeLocations.length}</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatUploadDate(item.uploadDate || '')}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatLastUpdated(item.lastUpdated || '')}
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