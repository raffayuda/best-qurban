<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { animate } from 'motion';
	import { cart } from '$lib/stores/cart';
	import { goto } from '$app/navigation';

	interface Product {
		id: number;
		name: string;
		category: string;
		weight: string;
		description: string;
		longDescription?: string;
		price: number;
		image: string;
		images?: string[];
		badge?: {
			text: string;
			bgClass: string;
			textClass: string;
		};
		features: string[];
		healthStatus?: string;
		age?: string;
	}

	const products: Product[] = [
		{
			id: 1,
			name: 'Sapi Limousin',
			category: 'sapi',
			weight: '~650kg',
			description:
				'Genetik unggul dengan tekstur daging premium. Dipelihara dengan pakan organik di Sanctuary Best-Qurban.',
			longDescription:
				'Sapi Limousin kami adalah pilihan premium bagi pekurban yang mencari kualitas daging luar biasa dan karkas maksimal. Sapi ini dirawat di fasilitas Sanctuary Best-Qurban dengan standar peternakan presisi, pakan organik bersertifikat, dan pengawasan dokter hewan 24/7. Sangat ideal untuk kurban tujuh orang dengan jaminan kepuasan tinggi.',
			price: 45500000,
			image:
				'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&q=80&w=800',
			images: [
				'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&q=80&w=800',
				'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&q=80&w=800',
				'https://images.unsplash.com/photo-1590059344400-985f57a3e74c?auto=format&fit=crop&q=80&w=800'
			],
			badge: {
				text: 'Elite Tier',
				bgClass: 'bg-secondary-container',
				textClass: 'text-on-secondary-container'
			},
			features: ['Pakan Organik', 'Sertifikat Kesehatan', 'Video Dokumentasi'],
			healthStatus: 'Sehat Paripurna (Sertifikat No. VET-2024-001)',
			age: '2.5 Tahun'
		},
		{
			id: 2,
			name: 'Domba Merino',
			category: 'domba',
			weight: '~45kg',
			description: 'Domba berkualitas ekspor dengan tingkat lemak rendah dan karkas yang melimpah.',
			longDescription:
				'Domba Merino terkenal dengan bulunya yang lebat dan kualitas daging yang lembut tanpa bau menyengat (prengus). Dirawat di padang rumput tersimulasi dengan iklim sejuk untuk menjaga tingkat stres yang rendah, menghasilkan kualitas kurban terbaik untuk Anda dan keluarga.',
			price: 4250000,
			image:
				'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=800',
			images: [
				'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=800',
				'https://images.unsplash.com/photo-1484557052118-f32bd25b45e4?auto=format&fit=crop&q=80&w=800'
			],
			badge: { text: 'Best Choice', bgClass: 'bg-primary', textClass: 'text-on-primary' },
			features: ['Bulu Premium', 'Karkas Melimpah', 'Perawatan Eksklusif'],
			healthStatus: 'Sangat Sehat (Sertifikat No. VET-2024-012)',
			age: '1.2 Tahun'
		}
		// Fallbacks for other generic products based on ID.
	];

	// Get product logic
	let idParam = $derived(Number($page.params.id));
	let product = $derived(
		products.find((p) => p.id === idParam) ||
			({
				id: idParam,
				name: 'Hewan Kurban Premium',
				category: 'hewan',
				weight: '~50kg - 500kg',
				description: 'Hewan pilihan dengan spesifikasi premium.',
				longDescription:
					'Hewan ini telah melalui proses seleksi yang sangat ketat untuk memastikan kelayakannya sebagai hewan kurban. Kami menjamin kesehatan, postur tubuh, dan perawatan terbaik dari peternak ahli kami.',
				price: 5000000,
				image:
					'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&q=80&w=800',
				images: [
					'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&q=80&w=800'
				],
				features: ['Sertifikat Dokter Hewan', 'Siap Kurban'],
				healthStatus: 'Sehat (Tersertifikasi)',
				age: 'Sesuai Syariat'
			} as Product)
	);

	let activeImage = $state('');

	$effect(() => {
		if (product && product.images) {
			activeImage = product.images[0];
		} else if (product) {
			activeImage = product.image;
		}
	});

	let showNotification = $state(false);

	let containerRef: HTMLElement;
	let imageRef: HTMLElement;
	let contentRef: HTMLElement;

	onMount(() => {
		if (containerRef) {
			animate(containerRef, { opacity: [0, 1] }, { duration: 0.5 });
		}
		if (imageRef) {
			animate(imageRef, { opacity: [0, 1], x: [-50, 0] }, { duration: 0.8, easing: 'ease-out' });
		}
		if (contentRef) {
			animate(
				contentRef,
				{ opacity: [0, 1], x: [50, 0] },
				{ duration: 0.8, easing: 'ease-out', delay: 0.2 }
			);
		}
	});

	function formatPrice(price: number): string {
		return 'Rp ' + price.toLocaleString('id-ID');
	}

	async function addToCartHandler(e: MouseEvent) {
		cart.addItem({
			id: product.id,
			name: product.name,
			price: product.price,
			image: product.image,
			weight: product.weight
		});

		// Simple fly animation to cart button in layout
		const flyEl = document.createElement('div');
		flyEl.innerHTML = `<span class="material-symbols-outlined text-4xl text-primary">pets</span>`;
		flyEl.style.position = 'fixed';
		flyEl.style.left = `${e.clientX}px`;
		flyEl.style.top = `${e.clientY}px`;
		flyEl.style.zIndex = '9999';
		flyEl.style.pointerEvents = 'none';
		document.body.appendChild(flyEl);

		const cartButton = document.querySelector('[data-cart-button]');
		const cartRect = cartButton
			? cartButton.getBoundingClientRect()
			: { left: window.innerWidth - 100, top: 40 };

		await animate(
			flyEl,
			{
				left: [e.clientX, cartRect.left],
				top: [e.clientY, cartRect.top],
				opacity: [1, 0],
				scale: [1, 0.5]
			},
			{ duration: 0.6, easing: [0.17, 0.67, 0.83, 0.67] }
		).finished;

		flyEl.remove();
		showNotification = true;

		setTimeout(() => {
			showNotification = false;
		}, 2500);
	}
</script>

<svelte:head>
	<title>{product.name} | Best-Qurban</title>
</svelte:head>

<!-- Notification Toast -->
{#if showNotification}
	<div class="fixed right-8 bottom-8 z-[70] animate-bounce">
		<div class="clay-card rounded-full bg-primary px-8 py-4 font-bold text-on-primary shadow-lg">
			<span class="material-symbols-outlined mr-2 inline-block align-middle">check_circle</span>
			<span class="align-middle">{product.name} ditambahkan ke keranjang!</span>
		</div>
	</div>
{/if}

<div bind:this={containerRef} class="max-w-8xl mx-auto px-4 pb-32 md:px-12">
	<!-- Breadcrumb -->
	<nav class="mb-8 flex items-center gap-2 text-sm font-medium text-on-surface-variant">
		<a href="/" class="transition-colors hover:text-primary">Beranda</a>
		<span class="material-symbols-outlined text-sm">chevron_right</span>
		<a href="/hewan" class="transition-colors hover:text-primary">Koleksi Hewan</a>
		<span class="material-symbols-outlined text-sm">chevron_right</span>
		<span class="font-bold text-primary">{product.name}</span>
	</nav>

	<div class="grid grid-cols-1 gap-16 lg:grid-cols-2">
		<!-- Image Gallery -->
		<div bind:this={imageRef} class="flex flex-col gap-6">
			<div
				class="clay-card clay-recessed relative h-[500px] overflow-hidden rounded-2xl bg-surface-container-low"
			>
				<img
					src={activeImage}
					alt={product.name}
					class="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
				/>
				{#if product.badge}
					<div
						class="absolute top-6 right-6 {product.badge.bgClass} {product.badge
							.textClass} font-label rounded-full px-6 py-2 text-sm font-bold tracking-widest uppercase shadow-lg"
					>
						{product.badge.text}
					</div>
				{/if}
			</div>

			<!-- Thumbnails -->
			{#if product.images && product.images.length > 1}
				<div class="hide-scrollbar flex gap-4 overflow-x-auto pb-4">
					{#each product.images as img}
						<button
							onclick={() => (activeImage = img)}
							class="clay-card h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl transition-all {activeImage ===
							img
								? 'ring-4 ring-primary ring-offset-2'
								: 'opacity-70 hover:opacity-100'}"
						>
							<img src={img} alt="Thumbnail {product.name}" class="h-full w-full object-cover" />
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Product Info -->
		<div bind:this={contentRef} class="flex flex-col justify-center">
			<div class="mb-4">
				<span
					class="font-label rounded-full bg-emerald-100 px-4 py-1 text-sm font-bold tracking-widest text-emerald-700 uppercase"
					>{product.category}</span
				>
			</div>

			<h1
				class="font-headline mb-2 text-5xl font-black tracking-tighter text-on-surface md:text-6xl"
			>
				{product.name}
			</h1>

			<div
				class="font-headline mb-8 border-b border-surface-container-highest pb-6 text-3xl font-black text-primary"
			>
				{formatPrice(product.price)}
			</div>

			<div class="mb-10 space-y-6">
				<h3
					class="font-headline border-b border-surface-container pb-2 text-xl font-bold text-on-surface"
				>
					Spesifikasi Detail
				</h3>

				<div class="grid grid-cols-2 gap-y-4">
					<div class="flex flex-col gap-1">
						<span class="flex items-center gap-2 text-sm font-medium text-on-surface-variant"
							><span class="material-symbols-outlined text-sm">weight</span> Bobot</span
						>
						<span class="text-lg font-bold">{product.weight}</span>
					</div>
					<div class="flex flex-col gap-1">
						<span class="flex items-center gap-2 text-sm font-medium text-on-surface-variant"
							><span class="material-symbols-outlined text-sm">cake</span> Usia</span
						>
						<span class="text-lg font-bold">{product.age}</span>
					</div>
					<div class="col-span-2 flex flex-col gap-1">
						<span class="flex items-center gap-2 text-sm font-medium text-on-surface-variant"
							><span class="material-symbols-outlined text-sm">medical_services</span> Status Kesehatan</span
						>
						<span class="flex items-center gap-2 font-bold text-emerald-700">
							{product.healthStatus}
							<span
								class="material-symbols-outlined rounded-full border border-emerald-600 p-[2px] text-sm text-[10px] text-emerald-600"
								>verified</span
							>
						</span>
					</div>
				</div>
			</div>

			<div class="mb-10 leading-relaxed font-medium text-on-surface-variant">
				<h3
					class="font-headline mb-4 border-b border-surface-container pb-2 text-xl font-bold text-on-surface"
				>
					Deskripsi
				</h3>
				<p>{product.longDescription}</p>
			</div>

			<!-- Features Tags -->
			<div class="mb-10 flex flex-wrap gap-3">
				{#each product.features as feature}
					<span
						class="font-label flex items-center gap-2 rounded-full border border-surface-container-highest bg-surface-container-high px-4 py-2 text-sm font-bold text-on-surface"
					>
						<span class="material-symbols-outlined text-[16px] text-primary">done</span>
						{feature}
					</span>
				{/each}
			</div>

			<!-- Action Buttons -->
			<div class="flex gap-4">
				<button
					onclick={addToCartHandler}
					class="font-headline clay-button-primary flex flex-1 items-center justify-center gap-3 rounded-full bg-primary py-5 text-xl font-bold text-on-primary shadow-[0_10px_20px_rgba(0,104,83,0.3)] transition-transform hover:scale-105 active:scale-95"
				>
					<span class="material-symbols-outlined">shopping_cart</span>
					Tambah ke Keranjang
				</button>
				<button
					onclick={() => {
						addToCartHandler({
							clientX: window.innerWidth / 2,
							clientY: window.innerHeight / 2
						} as MouseEvent);
						setTimeout(() => goto('/checkout'), 800);
					}}
					class="font-headline clay-button-secondary flex flex-1 items-center justify-center gap-3 rounded-full bg-secondary-container py-5 text-xl font-bold text-on-secondary-container transition-transform hover:scale-105 active:scale-95"
				>
					<span class="material-symbols-outlined">payments</span>
					Beli Sekarang
				</button>
			</div>
		</div>
	</div>
</div>

<style>
	.hide-scrollbar::-webkit-scrollbar {
		display: none;
	}
	.hide-scrollbar {
		-ms-overflow-style: none; /* IE and Edge */
		scrollbar-width: none; /* Firefox */
	}
</style>
