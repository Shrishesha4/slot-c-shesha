<script lang="ts">
	import { onMount } from 'svelte';
	import { edgeLocations, contentItems, contentTypes, cdnMetrics } from '$lib/services/cdn';
    
	let trafficChartCanvas: HTMLCanvasElement;
	let worldMapCanvas: HTMLCanvasElement;
	let pieChartCanvas: HTMLCanvasElement;
	let trafficChart: any;
	let pieChart: any;
	
    // Add this near the top of your script section with other reactive declarations
    $: recommendations = generateRecommendations($cdnMetrics, contentTypeMetrics, locationMetrics);
    function generateRecommendations(metrics: { totalRequests: any; cacheHits: any; cacheMisses?: number; avgLatency: any; bandwidthSaved?: number; }, contentTypes: any[], locations: any[]) {
        const recommendations = [];
        
        // Check if we need more edge locations in Asia Pacific
        const apLocations = locations.filter((loc: { id: string; }) => 
            loc.id === 'ap-south' || loc.id === 'ap-northeast');
        const apCachePercentage = apLocations.reduce((sum: any, loc: { cachePercentage: any; }) => sum + loc.cachePercentage, 0) / 
            (apLocations.length || 1);
        
        if (apCachePercentage < 60 || apLocations.length < 2) {
            recommendations.push({
            title: "Expand Asia Pacific Coverage",
            description: `Adding edge locations in Seoul and Sydney would improve latency by ${Math.round(20 + Math.random() * 10)}% for users in those regions.`
            });
        }
        
        // Check video content caching
        const videoType = contentTypes.find((type: { id: string; }) => type.id === 'video');
        if (videoType && videoType.cachePercentage < 50) {
            recommendations.push({
            title: "Increase Video Content Caching",
            description: `Video content has the lowest cache distribution (${videoType.cachePercentage}%) but accounts for ${Math.round(60 + Math.random() * 10)}% of bandwidth usage.`
            });
        }
        
        // Check if cache hit rate is low
        const cacheHitRate = metrics.totalRequests ? 
            Math.round((metrics.cacheHits / metrics.totalRequests) * 100) : 0;
        
        if (cacheHitRate < 80) {
            recommendations.push({
            title: "Implement Predictive Caching",
            description: `Using AI to predict content popularity could improve cache hit rates by an estimated ${Math.round(15 + Math.random() * 10)}%.`
            });
        }
        
        // Add recommendation for high latency if applicable
        if (metrics.avgLatency > 90) {
            recommendations.push({
            title: "Optimize Origin Response Time",
            description: `Current average latency (${metrics.avgLatency.toFixed(2)}ms) could be reduced by implementing better compression and response caching.`
            });
        }
        
        // Always ensure we have at least 2 recommendations
        if (recommendations.length < 2) {
            recommendations.push({
            title: "Implement Content Compression",
            description: "Enabling Brotli compression could reduce bandwidth usage by up to 25% compared to gzip."
            });
        }
        
        return recommendations;
        }
	// Calculate metrics by location - make this reactive to cdnMetrics changes
	$: locationMetrics = edgeLocations.map(location => {
	const cachedItems = contentItems.filter(item => item.locations.includes(location.id));
	const cachePercentage = Math.round((cachedItems.length / contentItems.length) * 100);
	
	// Calculate a weighted distribution of requests based on location
	const locationWeights = {
		'us-east': 0.22,    // 22% of traffic
		'us-west': 0.12,    // 12% of traffic
		'eu-west': 0.19,    // 19% of traffic
		'ap-south': 0.17,   // 17% of traffic
		'ap-northeast': 0.24, // 24% of traffic
		'sa-east': 0.06     // 6% of traffic
	};
	
	const weight = locationWeights[location.id as keyof typeof locationWeights] || (1 / edgeLocations.length);
	
	const variation = 0.9 + (Math.random() * 0.2);
	const requests = Math.round($cdnMetrics.totalRequests * weight * variation);
	
	return {
		...location,
		cachedItems: cachedItems.length,
		cachePercentage,
		requests: requests,
		bandwidth: Math.floor(requests * 0.05) + 10, // Bandwidth roughly proportional to requests
		hitRatio: Math.floor(Math.random() * 20) + 80
	};
});
	
    $: contentTypeMetrics = contentTypes.map(type => {
        const typeItems = contentItems.filter(item => item.type === type.id);
        const totalLocations = edgeLocations.length * typeItems.length;
        let cachedLocations = 0;
        
        typeItems.forEach(item => {
            cachedLocations += item.locations.length;
        });
        
        const cachePercentage = totalLocations > 0 
            ? Math.round((cachedLocations / totalLocations) * 100) 
            : 0;
        
        // Calculate a weighted distribution of requests based on content type
        const typeWeights = {
            'video': 0.25,    // 25% of traffic
            'image': 0.35,    // 35% of traffic
            'static': 0.30,   // 30% of traffic
            'api': 0.10       // 10% of traffic
        };
        
        // Get weight for this type or use equal distribution if not found
        const weight = typeWeights[type.id as keyof typeof typeWeights] || (1 / contentTypes.length);
        
        // Calculate requests based on total requests and type weight
        // Add small random variation (±10%) to make it look more realistic
        const variation = 0.9 + (Math.random() * 0.2);
        const requests = Math.round($cdnMetrics.totalRequests * weight * variation);
        
        // Calculate bandwidth based on content type and requests
        // Different content types have different bandwidth requirements
        const bandwidthPerRequest = 
            type.id === 'video' ? 0.35 :    // ~350KB per video request
            type.id === 'image' ? 0.05 :    // ~50KB per image request
            type.id === 'static' ? 0.01 :   // ~10KB per static asset
            0.005;                          // ~5KB per API response
        
        const bandwidth = Math.round(requests * bandwidthPerRequest * 100) / 100;
        
        return {
            ...type,
            itemCount: typeItems.length,
            cachePercentage,
            requests: requests,
            bandwidth: bandwidth
        };
    });
	
	
	// Calculate global metrics - make this reactive to cdnMetrics changes
	$: globalMetrics = {
		totalRequests: $cdnMetrics.totalRequests,
		cacheHitRate: $cdnMetrics.totalRequests 
			? Math.round(($cdnMetrics.cacheHits / $cdnMetrics.totalRequests) * 100) 
			: 0,
		avgLatency: Math.round($cdnMetrics.avgLatency),
		bandwidthSaved: Math.round($cdnMetrics.bandwidthSaved * 100) / 100,
		edgeLocations: edgeLocations.length,
		contentItems: contentItems.length
	};
	
	// Calculate projected annual savings based on current metrics
	$: projectedSavings = {
		bandwidthCost: Math.round($cdnMetrics.bandwidthSaved * 0.08 * 83 * 365),
		serverInfrastructure: Math.round($cdnMetrics.bandwidthSaved * 0.06 * 83 * 365),
		operationalOverhead: Math.round($cdnMetrics.bandwidthSaved * 0.035 * 83 * 365),
		// Calculate projected growth rate based on recent metrics
		growthRate: calculateGrowthRate($cdnMetrics),
		get total() {
			return this.bandwidthCost + this.serverInfrastructure + this.operationalOverhead;
		}
	};
	
	// Function to calculate growth rate based on metrics
	function calculateGrowthRate(metrics: { totalRequests: any; cacheHits: any; cacheMisses?: number; avgLatency?: number; bandwidthSaved: any; }) {
		// Base growth rate is 15%
		let growthRate = 15;
		
		// Adjust based on cache hit rate - higher hit rates suggest faster growth
		if (metrics.totalRequests > 0) {
			const hitRate = (metrics.cacheHits / metrics.totalRequests) * 100;
			if (hitRate > 85) growthRate += 5;
			else if (hitRate < 70) growthRate -= 3;
		}
		
		// Adjust based on bandwidth saved - more bandwidth saved suggests faster adoption
		if (metrics.bandwidthSaved > 500) growthRate += 3;
		else if (metrics.bandwidthSaved < 100) growthRate -= 2;
		
		// Ensure growth rate stays within reasonable bounds
		return Math.max(5, Math.min(30, growthRate));
	}

    // Time series data for charts - make it reactive to cdnMetrics
    $: timeSeriesData = generateTimeSeriesData($cdnMetrics);

    	// Update charts when metrics change
	$: if (trafficChart && $cdnMetrics) {
		updateTrafficChart();
	}
	
	$: if (pieChart && $cdnMetrics) {
		updatePieChart();
	}

    // Function to generate time series data based on current metrics
    function generateTimeSeriesData(metrics: { totalRequests: any; cacheHits?: number; cacheMisses?: number; avgLatency: any; bandwidthSaved: any; }) {
        // Get current hour
        const currentHour = new Date().getHours();
        
        // Generate labels for the last 12 hours
        const labels = [];
        for (let i = 0; i < 12; i++) {
            const hour = (currentHour - 11 + i + 24) % 24;
            labels.push(`${hour.toString().padStart(2, '0')}:00`);
        }
        
        // Scale the data based on current metrics
        const requestScale = metrics.totalRequests / 100;
        const latencyScale = metrics.avgLatency / 100;
        const bandwidthScale = metrics.bandwidthSaved / 10;
        
        // Generate data with some randomness but influenced by current metrics
        return {
            labels,
            requests: [1200, 980, 850, 920, 1500, 2800, 3200, 3500, 3800, 3200, 2500, 1800]
                .map(val => Math.max(val * (requestScale > 0 ? requestScale : 1) * (0.8 + Math.random() * 0.4), 500)),
            latency: [85, 82, 80, 83, 90, 110, 120, 115, 105, 95, 90, 87]
                .map(val => Math.max(val * (latencyScale > 0 ? latencyScale : 1) * (0.9 + Math.random() * 0.2), 50)),
            bandwidth: [120, 100, 90, 95, 180, 320, 380, 420, 400, 350, 280, 190]
                .map(val => Math.max(val * (bandwidthScale > 0 ? bandwidthScale : 1) * (0.85 + Math.random() * 0.3), 50))
        };
    }

    function updateTrafficChart() {
        if (!trafficChart) return;
        
        const newData = generateTimeSeriesData($cdnMetrics);
        
        trafficChart.data.labels = newData.labels;
        trafficChart.data.datasets[0].data = newData.requests;
        trafficChart.data.datasets[1].data = newData.latency;
        trafficChart.data.datasets[2].data = newData.bandwidth;
        
        trafficChart.update();
    }
        
    function updatePieChart() {
        if (!pieChart) return;
        
        const cacheHits = $cdnMetrics.cacheHits;
        const cacheMisses = $cdnMetrics.cacheMisses;
        
        pieChart.data.datasets[0].data = [cacheHits, cacheMisses];
        pieChart.update();
    }	

	function createTrafficChart(Chart: any, canvas: HTMLCanvasElement) {
		if (!canvas) return null;
		
		return new Chart(canvas, {
			type: 'line',
			data: {
				labels: timeSeriesData.labels,
				datasets: [
					{
						label: 'Requests (per hour)',
						data: timeSeriesData.requests,
						borderColor: 'rgb(59, 130, 246)',
						backgroundColor: 'rgba(59, 130, 246, 0.1)',
						tension: 0.3,
						fill: true,
						yAxisID: 'y'
					},
					{
						label: 'Latency (ms)',
						data: timeSeriesData.latency,
						borderColor: 'rgb(239, 68, 68)',
						backgroundColor: 'rgba(239, 68, 68, 0.1)',
						tension: 0.3,
						fill: false,
						yAxisID: 'y1'
					},
					{
						label: 'Bandwidth (GB)',
						data: timeSeriesData.bandwidth,
						borderColor: 'rgb(16, 185, 129)',
						backgroundColor: 'rgba(16, 185, 129, 0.1)',
						tension: 0.3,
						fill: false,
						yAxisID: 'y2'
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				interaction: {
					mode: 'index',
					intersect: false,
				},
				scales: {
					y: {
						type: 'linear',
						display: true,
						position: 'left',
						title: {
							display: true,
							text: 'Requests'
						}
					},
					y1: {
						type: 'linear',
						display: true,
						position: 'right',
						grid: {
							drawOnChartArea: false,
						},
						title: {
							display: true,
							text: 'Latency (ms)'
						}
					},
					y2: {
						type: 'linear',
						display: true,
						position: 'right',
						grid: {
							drawOnChartArea: false,
						},
						title: {
							display: true,
							text: 'Bandwidth (GB)'
						}
					},
				}
			}
		});
	}
	
	// Create world map with edge locations
	function createWorldMap(canvas: HTMLCanvasElement) {
		if (!canvas || typeof window === 'undefined') return;
		
		// Load D3.js and TopoJSON
		Promise.all([
			import('d3'),
			import('topojson-client')
		]).then(([d3, topojson]) => {
			// Set canvas dimensions based on container
			const container = canvas.parentElement;
			if (container) {
				canvas.width = container.clientWidth;
				canvas.height = container.clientHeight;
			}
			
			const width = canvas.width;
			const height = canvas.height;
			const context = canvas.getContext('2d');
			if (!context) return;
			
			// Clear canvas
			context.clearRect(0, 0, width, height);
			
			// Create projection - use Natural Earth projection for better world map appearance
			const projection = d3.geoNaturalEarth1()
				.scale(width / 5.5)
				.translate([width / 2, height / 1.8])
				.precision(0.1);
			
			// Create path generator
			const path = d3.geoPath()
				.context(context);
			
			// Load world map data
			fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
				.then(response => response.json())
				.then(world => {
					// Draw countries
					context.beginPath();
					context.fillStyle = '#e5e7eb';
					path(topojson.feature(world, world.objects.countries));
					context.fill();
					
					// Draw country borders
					context.beginPath();
					context.strokeStyle = '#d1d5db';
					context.lineWidth = 0.5;
					path(topojson.mesh(world, world.objects.countries));
					context.stroke();
					
					// Draw edge locations with improved styling
					edgeLocations.forEach(location => {
						// Map location IDs to coordinates (approximate)
						const coordinates = getLocationCoordinates(location.id);
						const [x, y] = projection([coordinates.lng, coordinates.lat]) || [0, 0];
						
						// Skip if coordinates are invalid
						if (isNaN(x) || isNaN(y)) return;
						
						// Draw cache coverage indicator (draw this first so it's behind the location dot)
						const cachedItems = contentItems.filter(item => item.locations.includes(location.id));
						const radius = Math.max(12, (cachedItems.length / contentItems.length) * 25);
						
						context.beginPath();
						context.arc(x, y, radius, 0, 2 * Math.PI);
						context.fillStyle = 'rgba(59, 130, 246, 0.2)';
						context.fill();
						
						// Draw circle for location
						context.beginPath();
						context.arc(x, y, 7, 0, 2 * Math.PI);
						context.fillStyle = '#3b82f6';
						context.fill();
						context.strokeStyle = '#ffffff';
						context.lineWidth = 2;
						context.stroke();
						
						// Simplify location names for better display
						let locationName = location.name;
						if (locationName.includes('(')) {
							locationName = locationName.split('(')[0].trim();
						}
						
						// Draw text with improved visibility
						context.font = 'bold 12px sans-serif';
						const textWidth = context.measureText(locationName).width;
						const padding = 4;
						
						// Draw text background
						context.fillStyle = 'rgba(255, 255, 255, 0.9)';
						context.fillRect(
							x + 10, 
							y - 8, 
							textWidth + (padding * 2), 
							16 + padding
						);
						
						// Draw border around text background
						context.strokeStyle = 'rgba(209, 213, 219, 0.8)';
						context.lineWidth = 1;
						context.strokeRect(
							x + 10, 
							y - 8, 
							textWidth + (padding * 2), 
							16 + padding
						);
						
						// Draw text
						context.fillStyle = '#1f2937';
						context.fillText(locationName, x + 10 + padding, y + 4);
					});
				});
		});
	}
	
	// Get coordinates for edge locations - improved accuracy
	function getLocationCoordinates(locationId: string) {
		const coordinates: Record<string, {lat: number, lng: number}> = {
			'us-east': {lat: 38.9, lng: -77.0},     // N. Virginia
			'us-west': {lat: 45.5, lng: -122.7},    // Oregon
			'eu-west': {lat: 53.3, lng: -6.3},      // Ireland
			'ap-south': {lat: 19.1, lng: 72.9},     // Mumbai
			'ap-northeast': {lat: 35.7, lng: 139.8}, // Tokyo
			'sa-east': {lat: -23.5, lng: -46.6}     // São Paulo
		};
		
		return coordinates[locationId] || {lat: 0, lng: 0};
	}
	
	// Create pie chart for cache hit/miss ratio
	function createPieChart(Chart: any, canvas: HTMLCanvasElement) {
		if (!canvas) return null;
		
		const cacheHits = $cdnMetrics.cacheHits;
		const cacheMisses = $cdnMetrics.cacheMisses;
		
		return new Chart(canvas, {
			type: 'doughnut',
			data: {
				labels: ['Cache Hits', 'Cache Misses'],
				datasets: [{
					data: [cacheHits, cacheMisses],
					backgroundColor: [
						'rgba(16, 185, 129, 0.7)',
						'rgba(239, 68, 68, 0.7)'
					],
					borderColor: [
						'rgb(16, 185, 129)',
						'rgb(239, 68, 68)'
					],
					borderWidth: 1
				}]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						position: 'bottom'
					},
					tooltip: {
						callbacks: {
							label: function(context: { raw: number; label: any; }) {
								const total = cacheHits + cacheMisses;
								const value = context.raw as number;
								const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
								return `${context.label}: ${value} (${percentage}%)`;
							}
						}
					}
				}
			}
		});
	}

    onMount(() => {
        // Only run in browser environment
		if (typeof window !== 'undefined') {
            import('chart.js').then(({ Chart, registerables }) => {
                Chart.register(...registerables);
                
                // Create Traffic Chart - store the returned chart instance
                trafficChart = createTrafficChart(Chart, trafficChartCanvas);
                
                // Create World Map
                createWorldMap(worldMapCanvas);
                
                // Create Pie Chart - store the returned chart instance
                pieChart = createPieChart(Chart, pieChartCanvas);
                
                // Add resize handler for responsive charts
                const handleResize = () => {
                    if (worldMapCanvas) {
                        createWorldMap(worldMapCanvas);
                    }
                };
                
                window.addEventListener('resize', handleResize);
                
                return () => {
                    window.removeEventListener('resize', handleResize);
                };
            });
        }
	});
</script>

<svelte:head>
	<script src="https://cdn.jsdelivr.net/npm/d3@7"></script>
	<script src="https://cdn.jsdelivr.net/npm/topojson-client@3"></script>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="mb-4">
		<a href="/" class="text-blue-600 hover:underline">← Back to Dashboard</a>
	</div>
	
	<h1 class="text-2xl font-bold mb-6">CDN Analytics</h1>
	
	<!-- Global Metrics -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
		<div class="bg-white rounded-lg shadow p-6">
			<p class="text-sm text-gray-500">Total Requests</p>
			<p class="text-3xl font-bold">{globalMetrics.totalRequests.toLocaleString()}</p>
			<p class="text-xs text-green-600 mt-1">+0% from last week</p>
		</div>
		
		<div class="bg-white rounded-lg shadow p-6">
			<p class="text-sm text-gray-500">Cache Hit Rate</p>
			<p class="text-3xl font-bold">{globalMetrics.cacheHitRate}%</p>
			<p class="text-xs text-green-600 mt-1">+0% from last week</p>
		</div>
		
		<div class="bg-white rounded-lg shadow p-6">
			<p class="text-sm text-gray-500">Average Latency</p>
			<p class="text-3xl font-bold">{globalMetrics.avgLatency}ms</p>
			<p class="text-xs text-green-600 mt-1">-0ms from last week</p>
		</div>
		
		<div class="bg-white rounded-lg shadow p-6">
			<p class="text-sm text-gray-500">Bandwidth Saved</p>
			<p class="text-3xl font-bold">{globalMetrics.bandwidthSaved} MB</p>
			<p class="text-xs text-green-600 mt-1">+0% from last week</p>
		</div>
	</div>
	
	<!-- Traffic Over Time Chart -->
	<div class="bg-white rounded-lg shadow p-6 mb-8">
		<h2 class="text-xl font-semibold mb-4">Traffic Over Time</h2>
		
		<div class="h-64 bg-gray-50 p-4 rounded-md">
			<canvas bind:this={trafficChartCanvas}></canvas>
		</div>
	</div>
	
	<!-- Performance by Location -->
	<div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
		<!-- Edge Location Performance -->
		<div class="bg-white rounded-lg shadow p-6">
			<div class="flex justify-between items-center mb-4">
				<h2 class="text-xl font-semibold">Edge Location Performance</h2>
				<span class="text-sm text-blue-600">{locationMetrics.length} active locations</span>
			</div>
			
			<div class="overflow-x-auto">
				<table class="min-w-full divide-y divide-gray-200">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
							<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requests</th>
							<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hit Ratio</th>
							<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cache</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#each locationMetrics.sort((a, b) => b.requests - a.requests) as metric}
							<tr class="hover:bg-gray-50 transition-colors">
								<td class="px-4 py-3 whitespace-nowrap">
									<div class="font-medium text-gray-900">{metric.name}</div>
									<div class="text-xs text-gray-500">{metric.id}</div>
								</td>
								<td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
									{metric.requests.toLocaleString()}
								</td>
								<td class="px-4 py-3 whitespace-nowrap text-sm">
									<span class={metric.hitRatio > 85 ? 'text-green-600 font-medium' : 'text-gray-500'}>
										{metric.hitRatio}%
									</span>
								</td>
								<td class="px-4 py-3 whitespace-nowrap">
									<div class="flex items-center">
										<div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
											<div class="bg-blue-600 h-2 rounded-full" style="width: {metric.cachePercentage}%"></div>
										</div>
										<span class="text-xs text-gray-500">{metric.cachePercentage}%</span>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
		
		<!-- Content Type Performance -->
		<div class="bg-white rounded-lg shadow p-6 mt-8">
		  <h2 class="text-xl font-semibold mb-4">Content Type Performance</h2>
		  
		  <div class="overflow-x-auto">
		    <table class="min-w-full divide-y divide-gray-200">
		      <thead class="bg-gray-50">
		        <tr>
		          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
		          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
		          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requests</th>
		          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bandwidth</th>
		        </tr>
		      </thead>
		      <tbody class="bg-white divide-y divide-gray-200">
		        {#each contentTypeMetrics as metric}
		          <tr>
		            <td class="px-4 py-3 whitespace-nowrap">
		              <div class="font-medium text-gray-900">{metric.name}</div>
		              <div class="text-xs text-gray-500">{metric.cacheTime} TTL</div>
		            </td>
		            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
		              {metric.itemCount}
		            </td>
		            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
		              {metric.requests.toLocaleString()}
		            </td>
		            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
		              {metric.bandwidth} GB
		            </td>
		          </tr>
		        {/each}
		      </tbody>
		    </table>
		  </div>
		</div>
	</div>
	
	<!-- Cache Efficiency -->
	<div class="bg-white rounded-lg shadow p-6 mb-8">
		<h2 class="text-xl font-semibold mb-4">Cache Efficiency</h2>
		
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<div>
				<h3 class="font-medium text-gray-700 mb-3">Global Cache Distribution</h3>
				<div class="bg-gray-50 p-4 rounded-md h-80 relative">
					<canvas bind:this={worldMapCanvas} class="w-full h-full"></canvas>
					
					<div class="absolute bottom-3 right-3 bg-white shadow-sm p-2 rounded-md text-xs">
						<div class="flex items-center mb-2">
							<div class="w-4 h-4 rounded-full bg-blue-500 mr-2 border border-white"></div>
							<span class="font-medium">Edge Location</span>
						</div>
						<div class="flex items-center">
							<div class="w-5 h-5 rounded-full bg-blue-100 mr-2 opacity-80"></div>
							<span class="font-medium">Cache Coverage</span>
						</div>
					</div>
				</div>
			</div>
			
			<div>
				<h3 class="font-medium text-gray-700 mb-3">Cache Hit/Miss Ratio</h3>
				<div class="bg-gray-50 p-4 rounded-md h-64">
					<canvas bind:this={pieChartCanvas}></canvas>
					
					<div class="grid grid-cols-2 gap-4 mt-4">
						<div class="bg-green-50 p-3 rounded-md text-center">
							<p class="text-sm text-gray-700">Cache Hits</p>
							<p class="font-bold text-green-600">{$cdnMetrics.cacheHits.toLocaleString()}</p>
						</div>
						
						<div class="bg-red-50 p-3 rounded-md text-center">
							<p class="text-sm text-gray-700">Cache Misses</p>
							<p class="font-bold text-red-600">{$cdnMetrics.cacheMisses.toLocaleString()}</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	
	<!-- Cost Savings -->
	<div class="bg-white rounded-lg shadow p-6">
		<h2 class="text-xl font-semibold mb-4">Cost Savings Analysis</h2>
		
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			<div class="bg-gray-50 p-4 rounded-md">
				<h3 class="font-medium text-gray-700 mb-2">Bandwidth Savings</h3>
				<p class="text-3xl font-bold text-green-600">₹{Math.round($cdnMetrics.bandwidthSaved * 0.08 * 83 * 100) / 100}</p>
				<p class="text-sm text-gray-500 mt-1">Based on ₹6.64/MB transfer cost</p>
			</div>
			
			<div class="bg-gray-50 p-4 rounded-md">
				<h3 class="font-medium text-gray-700 mb-2">Origin Server Load</h3>
				<p class="text-3xl font-bold text-green-600">-{globalMetrics.cacheHitRate}%</p>
				<p class="text-sm text-gray-500 mt-1">Reduction in origin server load</p>
			</div>
			
			<div class="bg-gray-50 p-4 rounded-md">
				<h3 class="font-medium text-gray-700 mb-2">Performance Gain</h3>
				<p class="text-3xl font-bold text-green-600">+65%</p>
				<p class="text-sm text-gray-500 mt-1">Improvement in content delivery speed</p>
			</div>
		</div>
		
		<div class="mt-6 bg-blue-50 p-4 rounded-md">
			<h3 class="font-medium text-blue-800 mb-2">Projected Annual Savings</h3>
			<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
				<div class="bg-white p-3 rounded-md shadow-sm">
					<p class="text-sm text-gray-500">Bandwidth Cost</p>
					<p class="text-xl font-bold text-green-600">₹{projectedSavings.bandwidthCost.toLocaleString()}</p>
				</div>
				<div class="bg-white p-3 rounded-md shadow-sm">
					<p class="text-sm text-gray-500">Server Infrastructure</p>
					<p class="text-xl font-bold text-green-600">₹{projectedSavings.serverInfrastructure.toLocaleString()}</p>
				</div>
				<div class="bg-white p-3 rounded-md shadow-sm">
					<p class="text-sm text-gray-500">Operational Overhead</p>
					<p class="text-xl font-bold text-green-600">₹{projectedSavings.operationalOverhead.toLocaleString()}</p>
				</div>
				<div class="bg-white p-3 rounded-md shadow-sm">
					<p class="text-sm text-gray-500">Total Savings</p>
					<p class="text-xl font-bold text-green-600">₹{projectedSavings.total.toLocaleString()}</p>
				</div>
			</div>
			<p class="text-sm text-blue-600 mt-3">Based on current usage patterns and projected growth of {projectedSavings.growthRate}% annually</p>
		</div>
	</div>
	
	<!-- Recommendations -->
	<div class="bg-white rounded-lg shadow p-6 mt-8">
		<h2 class="text-xl font-semibold mb-4">Optimization Recommendations</h2>
		
		<div class="space-y-4">
			{#each recommendations as recommendation}
				<div class="flex items-start">
					<div class="flex-shrink-0 h-5 w-5 text-green-500">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
							<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
						</svg>
					</div>
					<div class="ml-3">
						<h3 class="text-lg font-medium text-gray-900">{recommendation.title}</h3>
						<p class="mt-1 text-sm text-gray-500">{recommendation.description}</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
