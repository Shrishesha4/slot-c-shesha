<script lang="ts">
	import { page } from '$app/stores';
	import { resetCdnData } from '$lib/services/cdn';
	
	// Define navigation items
	const navItems = [
		{ path: '/', label: 'Dashboard' },
		{ path: '/content', label: 'Content Library' },
		{ path: '/locations', label: 'Edge Locations' },
		{ path: '/analytics', label: 'Analytics' }
	];
	
	// Check if a path is active
	function isActive(path: string) {
		if (path === '/') {
			return $page.url.pathname === '/';
		}
		return $page.url.pathname.startsWith(path);
	}
	
	// Handle reset button click
	function handleReset() {
		if (confirm('Are you sure you want to reset all CDN data to defaults?')) {
			resetCdnData();
			alert('CDN data has been reset to defaults.');
		}
	}
</script>

<nav class="bg-white shadow">
	<div class="container mx-auto px-4">
		<div class="flex justify-between h-16">
			<div class="flex">
				<div class="flex-shrink-0 flex items-center">
					<span class="text-blue-600 font-bold text-xl">Cloud CDN Demo</span>
				</div>
				
				<div class="hidden sm:ml-6 sm:flex sm:space-x-8">
					{#each navItems as item}
						<a 
							href={item.path}
							class={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
								isActive(item.path) 
									? 'border-blue-500 text-gray-900' 
									: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
							}`}
						>
							{item.label}
						</a>
					{/each}
				</div>
			</div>
			
			<div class="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
				<button 
					on:click={handleReset}
					class="bg-red-100 text-red-800 hover:bg-red-200 text-xs font-semibold px-2.5 py-1.5 rounded transition-colors"
				>
					Reset Demo
				</button>
				<span class="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
					Demo Mode
				</span>
			</div>
			
			<!-- Mobile menu button -->
			<div class="flex items-center sm:hidden">
				<button type="button" class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
					<span class="sr-only">Open main menu</span>
					<!-- Icon when menu is closed -->
					<svg class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				</button>
			</div>
		</div>
	</div>
	
	<!-- Mobile menu, show/hide based on menu state -->
	<div class="sm:hidden hidden">
		<div class="pt-2 pb-3 space-y-1">
			{#each navItems as item}
				<a 
					href={item.path}
					class={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
						isActive(item.path) 
							? 'bg-blue-50 border-blue-500 text-blue-700' 
							: 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
					}`}
				>
					{item.label}
				</a>
			{/each}
			
			<button 
				on:click={handleReset}
				class="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-red-600 hover:bg-red-50 hover:border-red-300"
			>
				Reset Demo
			</button>
		</div>
	</div>
</nav>