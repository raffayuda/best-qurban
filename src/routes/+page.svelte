<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { animate, scroll, inView } from 'motion';
	import { cart } from '$lib/stores/cart';

	// Animation refs
	let heroRef: HTMLElement;
	let heroContent: HTMLElement;
	let heroBg: HTMLElement;
	let productsRef: HTMLElement;
	let processRef: HTMLElement;
	let ctaRef: HTMLElement;
	let productCards: HTMLElement[] = [];
	let processCards: HTMLElement[] = [];
	let scrollProgress = 0;
	let showNotification = false;
	let notificationMessage = '';

	onMount(() => {
		if (heroContent) {
			animate(heroContent, { opacity: [0, 1], y: [60, 0] }, { duration: 1.2, easing: 'ease-out' });
		}

		if (heroBg && heroRef) {
			scroll(animate(heroBg, { y: [0, 80], scale: [1, 1.05] }), {
				target: heroRef,
				offset: ['start start', 'end start']
			});
		}

		if (productsRef) {
			inView(
				productsRef,
				() => {
					productCards.forEach((card, index) => {
						animate(
							card,
							{ opacity: [0, 1], y: [80, 0], scale: [0.92, 1] },
							{ duration: 0.9, delay: index * 0.12, easing: 'ease-out' }
						);
					});
					return () => {};
				},
				{ amount: 0.15 }
			);
		}

		if (processRef) {
			inView(
				processRef,
				() => {
					processCards.forEach((card, index) => {
						animate(
							card,
							{ opacity: [0, 1], y: [70, 0], scale: [0.95, 1] },
							{ duration: 0.8, delay: index * 0.1, easing: [0.22, 1, 0.36, 1] }
						);
					});
					return () => {};
				},
				{ amount: 0.2 }
			);
		}

		if (ctaRef) {
			inView(
				ctaRef,
				() => {
					animate(
						ctaRef,
						{ opacity: [0, 1], y: [60, 0], scale: [0.97, 1] },
						{ duration: 0.9, easing: 'ease-out' }
					);
					return () => {};
				},
				{ amount: 0.3 }
			);
		}
	});

	interface Product {
		id: number;
		name: string;
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
	}

	const products: Product[] = [
		{
			id: 1,
			name: 'Sapi Limousin',
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
			}
		},
		{
			id: 2,
			name: 'Domba Merino',
			weight: '~45kg',
			description: 'Domba berkualitas ekspor dengan tingkat lemak rendah dan karkas yang melimpah.',
			price: 4250000,
			image:
				'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=800',
			badge: { text: 'Best Choice', bgClass: 'bg-primary', textClass: 'text-on-primary' },
			isBestChoice: true
		},
		{
			id: 3,
			name: 'Kambing Boer',
			weight: '~55kg',
			description:
				'Postur gagah dengan pertumbuhan daging yang sangat baik. Pilihan tepat untuk kurban personal.',
			price: 5750000,
			image:
				'https://images.unsplash.com/photo-1524024272821-2974ef4e86d6?auto=format&fit=crop&q=80&w=800'
		}
	];

	const processSteps = [
		{
			icon: 'verified_user',
			title: 'Seleksi Hewan',
			description: 'Hanya 10% hewan terbaik yang lolos standar kualitas kami.'
		},
		{
			icon: 'spa',
			title: 'Rawatan Eksklusif',
			description: 'Diet spesifik dan pemantauan kesehatan rutin oleh dokter hewan.'
		},
		{
			icon: 'routine',
			title: "Ritual Syar'i",
			description: 'Penyembelihan sesuai adab Islam dengan tim ahli tersertifikasi.'
		},
		{
			icon: 'auto_videocam',
			title: 'Laporan Real-time',
			description: 'Dokumentasi video eksklusif untuk setiap pekurban.'
		}
	];

	function formatPrice(price: number): string {
		return 'Rp ' + price.toLocaleString('id-ID');
	}

	async function addToCart(product: Product, event: MouseEvent) {
		// Add to cart
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

		// Show notification
		showNotification = true;
		notificationMessage = `${product.name} ditambahkan ke keranjang!`;
		setTimeout(() => {
			showNotification = false;
		}, 2500);
	}
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

<div class="max-w-8xl mx-auto px-4 md:px-12">
	<!-- Hero Section -->
	<section
		bind:this={heroRef}
		class="clay-card group relative mb-20 h-[870px] min-h-[600px] w-full overflow-hidden rounded-xl"
	>
		<div
			bind:this={heroBg}
			class="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
			style="background-image: url('https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&q=80&w=1600')"
		>
			<div
				class="absolute inset-0 bg-gradient-to-r from-emerald-950/80 via-emerald-950/40 to-transparent"
			></div>
		</div>
		<div
			bind:this={heroContent}
			class="relative flex h-full flex-col justify-center px-12 opacity-0 md:px-24"
		>
			<span class="font-label mb-6 font-bold tracking-[0.3em] text-secondary-container uppercase"
				>Tradisi & Teknologi</span
			>
			<h1
				class="font-headline mb-8 max-w-2xl text-6xl leading-[0.9] font-black tracking-tighter text-white md:text-8xl"
			>
				Ibadah Suci,<br /><span class="font-light text-secondary-container italic">Terpilih.</span>
			</h1>
			<p
				class="mb-12 max-w-lg text-xl leading-relaxed font-medium text-emerald-50 opacity-90 md:text-2xl"
			>
				Menghadirkan pengalaman kurban premium yang mengutamakan kualitas hewan terbaik dan
				transparansi proses ritual yang sakral.
			</p>
			<div class="flex flex-wrap gap-6">
				<a
					href="/hewan"
					class="font-headline clay-button-primary flex items-center gap-3 rounded-full bg-primary px-10 py-5 text-lg font-extrabold text-on-primary transition-all hover:gap-4 active:scale-95"
				>
					Pilih Hewan <span class="material-symbols-outlined">arrow_forward</span>
				</a>
				<a
					href="/tentang"
					class="font-headline rounded-full border border-white/20 bg-white/10 px-10 py-5 text-lg font-bold text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-95"
				>
					Pelajari Proses
				</a>
			</div>
		</div>
	</section>

	<!-- Product Grid -->
	<section bind:this={productsRef} class="mb-32">
		<div class="mb-16 flex flex-col items-end justify-between gap-8 md:flex-row">
			<div class="max-w-xl">
				<h2
					class="font-headline mb-6 text-5xl leading-none font-black tracking-tighter text-primary"
				>
					Hewan Kurban Pilihan
				</h2>
				<p class="text-lg leading-relaxed font-medium text-on-surface-variant">
					Setiap hewan di Best-Qurban melewati kurasi ketat untuk memastikan standar kesehatan dan
					kelayakan syar'i terbaik bagi ibadah Anda.
				</p>
			</div>
			<a
				href="/hewan"
				class="flex items-center gap-4 font-bold text-primary transition-all hover:gap-4"
			>
				Lihat Semua <span class="material-symbols-outlined">arrow_forward</span>
			</a>
		</div>
		<div class="grid grid-cols-1 gap-12 md:grid-cols-3">
			{#each products as product, index}
				<div
					bind:this={productCards[index]}
					class="clay-card group flex flex-col rounded-xl bg-surface-container-lowest p-8 transition-transform duration-500 hover:-translate-y-4 {product.isBestChoice
						? 'border-2 border-primary/10'
						: ''} opacity-0"
				>
					<div class="clay-recessed relative mb-8 h-80 w-full overflow-hidden rounded-lg">
						<img
							alt={product.name}
							class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
							src={product.image}
						/>
						{#if product.badge}
							<div
								class="absolute top-4 right-4 {product.badge.bgClass} {product.badge
									.textClass} font-label rounded-full px-4 py-1 text-xs font-bold tracking-widest uppercase"
							>
								{product.badge.text}
							</div>
						{/if}
					</div>
					<div class="mb-4 flex items-start justify-between">
						<h3 class="font-headline text-3xl font-black text-on-surface">{product.name}</h3>
						<span class="font-label font-bold text-emerald-700">{product.weight}</span>
					</div>
					<p class="mb-8 flex-grow font-medium text-on-surface-variant">{product.description}</p>
					<div class="mt-auto flex items-center justify-between">
						<div class="font-headline text-2xl font-black text-primary">
							{formatPrice(product.price)}
						</div>
						<div class="flex gap-2">
							<a
								href="/hewan/{product.id}"
								class="clay-button-secondary flex items-center justify-center rounded-full bg-surface-container-high px-4 py-2 font-bold text-on-surface transition-transform hover:scale-105 hover:bg-surface-container-highest"
							>
								Detail
							</a>
							<button
								on:click={(e) => addToCart(product, e)}
								class="clay-button-primary flex h-10 w-10 items-center justify-center rounded-full bg-primary-container text-on-primary-container transition-transform hover:scale-110"
							>
								<span class="material-symbols-outlined text-sm">add</span>
							</button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- Process Section -->
	<section bind:this={processRef} class="mb-32">
		<div
			class="clay-card relative overflow-hidden rounded-xl bg-emerald-950 p-12 text-white md:p-20"
		>
			<div
				class="absolute top-0 right-0 h-full w-1/2 bg-cover bg-center opacity-10"
				style="background-image: url('https://images.unsplash.com/photo-1590059344400-985f57a3e74c?auto=format&fit=crop&q=80&w=1000')"
			></div>
			<h2 class="font-headline relative z-10 mb-20 text-5xl font-black tracking-tighter">
				Proses <span class="text-secondary-container">Terkurasi</span>
			</h2>
			<div class="relative z-10 grid grid-cols-1 gap-8 md:grid-cols-4">
				{#each processSteps as step, index}
					<div bind:this={processCards[index]} class="group flex flex-col gap-6 opacity-0">
						<div
							class="clay-button-secondary flex h-20 w-20 items-center justify-center rounded-xl bg-white/10 transition-transform duration-300 group-hover:scale-110"
						>
							<span class="material-symbols-outlined text-4xl text-secondary-container"
								>{step.icon}</span
							>
						</div>
						<div class="relative h-1 w-full overflow-hidden rounded-full bg-white/10">
							<div
								class="absolute inset-0 bg-secondary-container {index === 0
									? 'w-1/4'
									: 'w-full'} {index !== 0 ? 'opacity-30' : ''}"
							></div>
						</div>
						<h4 class="font-headline text-xl font-extrabold">{step.title}</h4>
						<p class="font-medium text-emerald-100/60">{step.description}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- CTA Bento -->
	<section bind:this={ctaRef} class="mb-32 grid grid-cols-1 gap-8 opacity-0 md:grid-cols-12">
		<div
			class="clay-card group relative overflow-hidden rounded-xl bg-surface-container-low p-12 transition-transform duration-500 hover:-translate-y-2 md:col-span-7"
		>
			<div class="relative z-10">
				<h3 class="font-headline mb-6 text-4xl font-black tracking-tighter text-primary">
					Bergabung dalam<br />Komunitas Donatur
				</h3>
				<p class="mb-8 max-w-md text-lg font-medium text-on-surface-variant">
					Dapatkan update berkala mengenai program kemanusiaan dan stok hewan kurban terbaru.
				</p>
				<div class="flex gap-4">
					<div
						class="clay-recessed flex-grow rounded-full bg-white px-6 py-4 transition-shadow hover:shadow-lg"
					>
						<input
							class="w-full border-none bg-transparent font-medium focus:ring-0"
							placeholder="Email Anda"
							type="email"
						/>
					</div>
					<button
						class="font-headline clay-button-primary rounded-full bg-primary px-8 font-bold text-on-primary transition-transform hover:scale-105"
						>Langganan</button
					>
				</div>
			</div>
			<div
				class="absolute top-1/2 -right-20 h-80 w-80 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl transition-colors group-hover:bg-primary/10"
			></div>
		</div>
		<div
			class="clay-card group flex flex-col justify-center rounded-xl bg-secondary-container p-12 transition-transform duration-500 hover:-translate-y-2 md:col-span-5"
		>
			<span
				class="material-symbols-outlined mb-6 text-6xl text-on-secondary-container transition-transform duration-300 group-hover:scale-110"
				>support_agent</span
			>
			<h3
				class="font-headline mb-4 text-3xl font-black tracking-tighter text-on-secondary-container"
			>
				Butuh Bantuan Personal?
			</h3>
			<p class="mb-8 font-bold text-on-secondary-container/80">
				Tim Sanctuary Best-Qurban siap membantu memilih hewan terbaik.
			</p>
			<a
				href="/kontak"
				class="font-headline clay-button-secondary rounded-full bg-on-secondary-container py-4 text-center font-black text-secondary-container transition-transform hover:scale-105"
				>Hubungi Konsultan</a
			>
		</div>
	</section>
</div>
