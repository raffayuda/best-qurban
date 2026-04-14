<script lang="ts">
	import { onMount } from 'svelte';
	import { animate, inView } from 'motion';
	import { cart } from '$lib/stores/cart';

	let heroRef: HTMLElement;
	let filtersRef: HTMLElement;
	let productsRef: HTMLElement;
	let scrollProgress = $state(0);
	let activeCategory = $state('all');

	let showNotification = $state(false);
	let notificationMessage = $state('');

	interface Product {
		id: number;
		name: string;
		category: string;
		weight: string;
		description: string;
		price: number;
		image: string;
		badge?: {
			text: string;
			bgClass: string;
			textClass: string;
		};
		isBestChoice?: boolean;
		features: string[];
	}

	const products: Product[] = [
		{
			id: 1,
			name: 'Sapi Limousin',
			category: 'sapi',
			weight: '~650kg',
			description:
				'Genetik unggul dengan tekstur daging premium. Dipelihara dengan pakan organik di Sanctuary Best-Qurban.',
			price: 45500000,
			image:
				'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&q=80&w=800',
			badge: {
				text: 'Elite Tier',
				bgClass: 'bg-secondary-container',
				textClass: 'text-on-secondary-container'
			},
			features: ['Pakan Organik', 'Sertifikat Kesehatan', 'Video Dokumentasi']
		},
		{
			id: 2,
			name: 'Domba Merino',
			category: 'domba',
			weight: '~45kg',
			description: 'Domba berkualitas ekspor dengan tingkat lemak rendah dan karkas yang melimpah.',
			price: 4250000,
			image:
				'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=800',
			badge: {
				text: 'Best Choice',
				bgClass: 'bg-primary',
				textClass: 'text-on-primary'
			},
			isBestChoice: true,
			features: ['Bulu Premium', 'Karkas Melimpah', 'Perawatan Eksklusif']
		},
		{
			id: 3,
			name: 'Kambing Boer',
			category: 'kambing',
			weight: '~55kg',
			description:
				'Postur gagah dengan pertumbuhan daging yang sangat baik. Pilihan tepat untuk kurban personal.',
			price: 5750000,
			image:
				'https://images.unsplash.com/photo-1524024272821-2974ef4e86d6?auto=format&fit=crop&q=80&w=800',
			features: ['Postur Ideal', 'Daging Berkualitas', 'Harga Terjangkau']
		},
		{
			id: 4,
			name: 'Sapi Brahman',
			category: 'sapi',
			weight: '~700kg',
			description:
				'Ras unggul dengan daya tahan tubuh kuat. Cocok untuk kurban kolektif skala besar.',
			price: 52000000,
			image:
				'https://images.unsplash.com/photo-1527153857879-1914aa251960?auto=format&fit=crop&q=80&w=800',
			features: ['Daya Kuat Tinggi', 'Ukuran Jumbo', 'Sertifikat Lengkap']
		},
		{
			id: 5,
			name: 'Domba Garut',
			category: 'domba',
			weight: '~50kg',
			description:
				'Domba lokal berkualitas dengan adaptasi sempurna terhadap iklim tropis Indonesia.',
			price: 3850000,
			image:
				'https://images.unsplash.com/photo-1484557052118-f32bd25b45e4?auto=format&fit=crop&q=80&w=800',
			features: ['Adaptasi Baik', 'Lokal Premium', 'Perawatan Optimal']
		},
		{
			id: 6,
			name: 'Kambing Etawa',
			category: 'kambing',
			weight: '~60kg',
			description:
				'Ras kambing premium dengan postur tinggi besar. Pilihan eksklusif untuk kurban istimewa.',
			price: 6500000,
			image:
				'https://images.unsplash.com/photo-1557431177-36141475c676?auto=format&fit=crop&q=80&w=800',
			badge: {
				text: 'Premium',
				bgClass: 'bg-secondary-container',
				textClass: 'text-on-secondary-container'
			},
			features: ['Postur Besar', 'Susu Berkualitas', 'Genetik Unggul']
		}
	];

	const categories = [
		{ value: 'all', label: 'Semua', icon: 'grid_view' },
		{ value: 'sapi', label: 'Sapi', icon: 'monitor_heart' },
		{ value: 'domba', label: 'Domba', icon: 'cruelty_free' },
		{ value: 'kambing', label: 'Kambing', icon: 'emoji_nature' }
	];

	function formatPrice(price: number): string {
		return 'Rp ' + price.toLocaleString('id-ID');
	}

	let filteredProducts = $derived(
		activeCategory === 'all' ? products : products.filter((p) => p.category === activeCategory)
	);

	// Animate products when filter changes
	$effect(() => {
		const count = filteredProducts.length;
		if (count > 0) {
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					const cards = document.querySelectorAll('[data-product-card]');
					cards.forEach((card, index) => {
						animate(
							card,
							{ opacity: [0, 1], y: [60, 0], scale: [0.95, 1] },
							{ duration: 0.7, delay: index * 0.1, easing: 'ease-out' }
						);
					});
				});
			});
		}
	});

	async function addToCart(product: Product, event: MouseEvent) {
		cart.addItem({
			id: product.id,
			name: product.name,
			price: product.price,
			image: product.image,
			weight: product.weight
		});

		// Get positions
		const cartButton = document.querySelector('[data-cart-button]');
		if (!cartButton) return;

		const cartButtonRect = cartButton.getBoundingClientRect();
		const buttonRect = (event.currentTarget as HTMLElement).getBoundingClientRect();

		const startX = buttonRect.left + buttonRect.width / 2;
		const startY = buttonRect.top + buttonRect.height / 2;
		const endX = cartButtonRect.left + cartButtonRect.width / 2;
		const endY = cartButtonRect.top + cartButtonRect.height / 2;

		// Create flying element directly
		const flyingEl = document.createElement('div');
		flyingEl.style.cssText = `
			position: fixed;
			left: ${startX}px;
			top: ${startY}px;
			transform: translate(-50%, -50%);
			z-index: 9999;
			pointer-events: none;
		`;
		flyingEl.innerHTML = `
			<div class="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg">
				<span class="material-symbols-outlined text-on-primary">pets</span>
			</div>
		`;
		document.body.appendChild(flyingEl);

		// Animate
		await animate(
			flyingEl,
			{
				left: [startX, endX],
				top: [startY, endY],
				transform: ['translate(-50%, -50%) scale(1)', 'translate(-50%, -50%) scale(0.3)'],
				opacity: [1, 0.3]
			},
			{
				duration: 0.7,
				easing: [0.25, 0.1, 0.25, 1]
			}
		).finished;

		// Remove element
		flyingEl.remove();

		showNotification = true;
		notificationMessage = `${product.name} ditambahkan ke keranjang!`;
		setTimeout(() => {
			showNotification = false;
		}, 2500);
	}

	onMount(() => {
		// Hero animation
		if (heroRef) {
			animate(heroRef, { opacity: [0, 1], y: [50, 0] }, { duration: 1, easing: 'ease-out' });
		}
	});
</script>

<!-- Notification Toast -->
{#if showNotification}
	<div class="fixed right-8 bottom-8 z-[70] animate-bounce">
		<div class="clay-card rounded-full bg-primary px-8 py-4 font-bold text-on-primary shadow-lg">
			<span class="material-symbols-outlined mr-2 inline-block align-middle">check_circle</span>
			<span class="align-middle">{notificationMessage}</span>
		</div>
	</div>
{/if}

<div class="max-w-8xl mx-auto px-4 pb-20 md:px-12">
	<!-- Hero Section -->
	<section
		bind:this={heroRef}
		class="clay-card relative mb-16 h-[500px] overflow-hidden rounded-xl opacity-0"
	>
		<div
			class="absolute inset-0 bg-cover bg-center"
			style="background-image: url('https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&q=80&w=1600')"
		>
			<div
				class="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-emerald-950/60 to-transparent"
			></div>
		</div>
		<div class="relative flex h-full flex-col justify-center px-12 md:px-24">
			<span class="font-label mb-6 font-bold tracking-[0.3em] text-secondary-container uppercase"
				>Koleksi Kami</span
			>
			<h1
				class="font-headline mb-8 max-w-2xl text-5xl leading-[0.9] font-black tracking-tighter text-white md:text-7xl"
			>
				Hewan Kurban<br /><span class="font-light text-secondary-container italic">Premium</span>
			</h1>
			<p class="max-w-2xl text-xl leading-relaxed font-medium text-emerald-50 opacity-90">
				Pilih hewan terbaik untuk ibadah kurban Anda dari koleksi yang telah melalui proses kurasi
				ketat.
			</p>
		</div>
	</section>

	<!-- Category Filters -->
	<section bind:this={filtersRef} class="mb-12">
		<div class="flex flex-wrap gap-4">
			{#each categories as category (category.value)}
				<button
					onclick={() => {
						activeCategory = category.value;
					}}
					class="font-headline flex items-center gap-3 rounded-full px-6 py-4 font-bold transition-all duration-300 {activeCategory ===
					category.value
						? 'clay-button-primary scale-105 bg-primary text-on-primary'
						: 'bg-surface-container-low text-on-surface hover:bg-surface-container-high'}"
				>
					<span class="material-symbols-outlined">{category.icon}</span>
					{category.label}
				</button>
			{/each}
		</div>
	</section>

	<!-- Products Grid -->
	<section bind:this={productsRef} class="mb-20">
		{#if filteredProducts.length > 0}
			<div class="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
				{#each filteredProducts as product (product.id)}
					<div
						data-product-card
						class="clay-card group overflow-hidden rounded-xl bg-surface-container-lowest opacity-0 transition-transform duration-500 hover:-translate-y-4"
					>
						<div class="clay-recessed relative h-72 overflow-hidden">
							<img
								alt={product.name}
								class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
								src={product.image}
							/>
							{#if product.badge}
								<div
									class="absolute top-4 right-4 {product.badge.bgClass} {product.badge
										.textClass} font-label rounded-full px-4 py-2 text-xs font-bold tracking-widest uppercase"
								>
									{product.badge.text}
								</div>
							{/if}
						</div>
						<div class="p-8">
							<div class="mb-4 flex items-start justify-between">
								<div>
									<h3 class="font-headline mb-2 text-2xl font-black text-on-surface">
										{product.name}
									</h3>
									<span class="font-label text-sm font-bold text-emerald-700">{product.weight}</span
									>
								</div>
							</div>
							<p class="mb-6 text-sm leading-relaxed font-medium text-on-surface-variant">
								{product.description}
							</p>
							<div class="mb-6 flex flex-wrap gap-2">
								{#each product.features as feature, index (`${product.id}-${feature}-${index}`)}
									<span
										class="font-label rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary"
									>
										{feature}
									</span>
								{/each}
							</div>
							<div class="flex items-center justify-between border-t border-surface-container pt-4">
								<div class="font-headline text-2xl font-black text-primary">
									{formatPrice(product.price)}
								</div>
								<div class="flex gap-2">
									<a
										href="/hewan/{product.id}"
										class="font-headline clay-button-secondary flex items-center justify-center rounded-full bg-surface-container-high px-4 py-3 font-bold text-on-surface transition-transform hover:scale-105 hover:bg-surface-container-highest"
									>
										Detail
									</a>
									<button
										onclick={(e) => addToCart(product, e)}
										class="font-headline clay-button-primary flex items-center gap-1 rounded-full bg-primary-container px-4 py-3 font-bold text-on-primary-container transition-transform hover:scale-105"
									>
										<span class="material-symbols-outlined text-sm">add</span>
										Pilih
									</button>
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="py-20 text-center">
				<span class="material-symbols-outlined mb-4 text-6xl text-on-surface-variant/30"
					>search_off</span
				>
				<p class="text-xl font-medium text-on-surface-variant">
					Tidak ada hewan dalam kategori ini.
				</p>
			</div>
		{/if}
	</section>

	<!-- Info Section -->
	<section class="clay-card rounded-xl bg-surface-container-low p-12">
		<div class="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
			<div>
				<h3 class="font-headline mb-6 text-3xl font-black tracking-tighter text-primary">
					Mengapa Hewan Kami Istimewa?
				</h3>
				<p class="mb-6 leading-relaxed font-medium text-on-surface-variant">
					Setiap hewan di Sanctuary Best-Qurban telah melalui proses seleksi ketat, perawatan
					eksklusif oleh tim dokter hewan profesional, dan dokumentasi kesehatan lengkap.
				</p>
				<ul class="space-y-4">
					<li class="flex items-start gap-3">
						<span class="material-symbols-outlined mt-1 text-primary">check_circle</span>
						<span class="font-medium">Sertifikat kesehatan dari dokter hewan tersertifikasi</span>
					</li>
					<li class="flex items-start gap-3">
						<span class="material-symbols-outlined mt-1 text-primary">check_circle</span>
						<span class="font-medium"
							>Pakan organik berkualitas tinggi untuk pertumbuhan optimal</span
						>
					</li>
					<li class="flex items-start gap-3">
						<span class="material-symbols-outlined mt-1 text-primary">check_circle</span>
						<span class="font-medium">Video dokumentasi lengkap proses penyembelihan</span>
					</li>
				</ul>
			</div>
			<div class="clay-recessed h-80 overflow-hidden rounded-xl">
				<img
					alt="Healthy livestock"
					class="h-full w-full object-cover"
					src="https://images.unsplash.com/photo-1590059344400-985f57a3e74c?auto=format&fit=crop&q=80&w=800"
				/>
			</div>
		</div>
	</section>
</div>
