<script lang="ts">
	import { onMount } from 'svelte';
	import { animate, inView } from 'motion';

	let heroRef: HTMLElement;
	let statsRef: HTMLElement;
	let valuesRef: HTMLElement;
	let teamRef: HTMLElement;
	let statCards: HTMLElement[] = [];
	let valueCards: HTMLElement[] = [];
	let teamCards: HTMLElement[] = [];
	let scrollProgress = 0;

	onMount(() => {
		// Hero animation
		if (heroRef) {
			animate(heroRef, { opacity: [0, 1], y: [50, 0] }, { duration: 1, easing: 'ease-out' });
		}

		// Stats section
		if (statsRef) {
			inView(
				statsRef,
				(info) => {
					statCards.forEach((card, index) => {
						animate(
							card,
							{ opacity: [0, 1], y: [60, 0], scale: [0.9, 1] },
							{ duration: 0.8, delay: index * 0.1, easing: 'ease-out' }
						);
					});
					return () => {};
				},
				{ amount: 0.3 }
			);
		}

		// Values section
		if (valuesRef) {
			inView(
				valuesRef,
				(info) => {
					valueCards.forEach((card, index) => {
						animate(
							card,
							{ opacity: [0, 1], y: [50, 0] },
							{ duration: 0.7, delay: index * 0.1, easing: 'ease-out' }
						);
					});
					return () => {};
				},
				{ amount: 0.2 }
			);
		}

		// Team section
		if (teamRef) {
			inView(
				teamRef,
				(info) => {
					teamCards.forEach((card, index) => {
						animate(
							card,
							{ opacity: [0, 1], y: [70, 0], scale: [0.95, 1] },
							{ duration: 0.8, delay: index * 0.15, easing: 'ease-out' }
						);
					});
					return () => {};
				},
				{ amount: 0.2 }
			);
		}

		// Scroll progress
		if (typeof window !== 'undefined') {
			window.addEventListener('scroll', () => {
				const scrollTop = window.scrollY;
				const docHeight = document.documentElement.scrollHeight - window.innerHeight;
				scrollProgress = scrollTop / docHeight;
			});
		}
	});

	const stats = [
		{ value: '10K+', label: 'Hewan Terkurban', icon: 'pets' },
		{ value: '5K+', label: 'Keluarga Penerima', icon: 'diversity_3' },
		{ value: '50+', label: 'Kota Terjangkau', icon: 'location_city' },
		{ value: '99%', label: 'Kepuasan Pelanggan', icon: 'sentiment_satisfied' }
	];

	const values = [
		{
			icon: 'verified',
			title: 'Kualitas Terjamin',
			description:
				'Setiap hewan melewati proses seleksi ketat dengan standar kesehatan tertinggi untuk memastikan kualitas terbaik.'
		},
		{
			icon: 'transparency',
			title: 'Transparansi Penuh',
			description:
				'Dokumentasi lengkap dari pemilihan hewan hingga distribusi, memastikan kepercayaan Anda sepenuhnya.'
		},
		{
			icon: 'volunteer_activism',
			title: 'Amanah & Profesional',
			description:
				'Tim berpengalaman dan tersertifikasi menangani setiap aspek ibadah kurban Anda dengan penuh tanggung jawab.'
		},
		{
			icon: 'diversity_3',
			title: 'Dampak Sosial',
			description:
				'Menjangkau keluarga kurang mampu di berbagai kota, memastikan kebahagiaan tersebar luas.'
		}
	];

	const team = [
		{
			name: 'Dr. Ahmad Fauzi',
			role: 'Kepala Dokter Hewan',
			image:
				'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400'
		},
		{
			name: 'Hj. Siti Aminah',
			role: "Konsultan Syar'i",
			image:
				'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400'
		},
		{
			name: 'Ir. Budi Santoso',
			role: 'ManOperasional',
			image:
				'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400'
		}
	];
</script>

<!-- Scroll Progress Indicator -->
<div class="fixed top-0 left-0 z-[60] h-1 w-full">
	<div
		class="h-full bg-gradient-to-r from-primary via-secondary-container to-primary"
		style="width: {scrollProgress * 100}%; transition: width 0.1s ease-out;"
	></div>
</div>

<div class="max-w-8xl mx-auto px-4 pb-20 md:px-12">
	<!-- Hero Section -->
	<section
		bind:this={heroRef}
		class="clay-card relative mb-20 h-[600px] overflow-hidden rounded-xl opacity-0"
	>
		<div
			class="absolute inset-0 bg-cover bg-center"
			style="background-image: url('https://images.unsplash.com/photo-1590059344400-985f57a3e74c?auto=format&fit=crop&q=80&w=1600')"
		>
			<div
				class="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-emerald-950/60 to-transparent"
			></div>
		</div>
		<div class="relative flex h-full flex-col justify-center px-12 md:px-24">
			<span class="font-label mb-6 font-bold tracking-[0.3em] text-secondary-container uppercase"
				>Tentang Kami</span
			>
			<h1
				class="font-headline mb-8 max-w-2xl text-5xl leading-[0.9] font-black tracking-tighter text-white md:text-7xl"
			>
				Sanctuary<br /><span class="font-light text-secondary-container italic">Best-Qurban</span>
			</h1>
			<p class="max-w-2xl text-xl leading-relaxed font-medium text-emerald-50 opacity-90">
				Membawa tradisi kurban ke era modern dengan standar kualitas premium dan transparansi penuh
				untuk ketenangan ibadah Anda.
			</p>
		</div>
	</section>

	<!-- Stats Section -->
	<section bind:this={statsRef} class="mb-32">
		<div class="mb-16 text-center">
			<h2 class="font-headline mb-6 text-5xl font-black tracking-tighter text-primary">
				Dampak Kami
			</h2>
			<p class="mx-auto max-w-2xl text-lg font-medium text-on-surface-variant">
				Bertahun-tahun melayani masyarakat dengan penuh amanah dan profesionalisme
			</p>
		</div>
		<div class="grid grid-cols-1 gap-8 md:grid-cols-4">
			{#each stats as stat, index}
				<div
					bind:this={statCards[index]}
					class="clay-card group flex flex-col items-center rounded-xl bg-surface-container-lowest p-10 text-center opacity-0 transition-transform duration-500 hover:-translate-y-4"
				>
					<div
						class="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 transition-transform group-hover:scale-110"
					>
						<span class="material-symbols-outlined text-4xl text-primary">{stat.icon}</span>
					</div>
					<div class="font-headline mb-3 text-5xl font-black text-primary">{stat.value}</div>
					<div class="font-medium text-on-surface-variant">{stat.label}</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- Values Section -->
	<section bind:this={valuesRef} class="mb-32">
		<div
			class="clay-card relative overflow-hidden rounded-xl bg-emerald-950 p-12 text-white md:p-20"
		>
			<div
				class="absolute top-0 right-0 h-full w-1/2 bg-cover bg-center opacity-10"
				style="background-image: url('https://images.unsplash.com/photo-1590059344400-985f57a3e74c?auto=format&fit=crop&q=80&w=1000')"
			></div>
			<div class="relative z-10">
				<h2 class="font-headline mb-16 text-center text-5xl font-black tracking-tighter">
					Nilai <span class="text-secondary-container">Kami</span>
				</h2>
				<div class="grid grid-cols-1 gap-8 md:grid-cols-2">
					{#each values as value, index}
						<div
							bind:this={valueCards[index]}
							class="group rounded-xl bg-white/5 p-8 opacity-0 backdrop-blur-sm transition-all duration-300 hover:bg-white/10"
						>
							<div
								class="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-white/10 transition-transform group-hover:scale-110"
							>
								<span class="material-symbols-outlined text-3xl text-secondary-container"
									>{value.icon}</span
								>
							</div>
							<h3 class="font-headline mb-4 text-2xl font-bold">{value.title}</h3>
							<p class="leading-relaxed font-medium text-emerald-100/70">{value.description}</p>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</section>

	<!-- Team Section -->
	<section bind:this={teamRef} class="mb-32">
		<div class="mb-16 text-center">
			<h2 class="font-headline mb-6 text-5xl font-black tracking-tighter text-primary">Tim Kami</h2>
			<p class="mx-auto max-w-2xl text-lg font-medium text-on-surface-variant">
				Ditangani oleh para profesional berpengalaman di bidangnya
			</p>
		</div>
		<div class="grid grid-cols-1 gap-10 md:grid-cols-3">
			{#each team as member, index}
				<div
					bind:this={teamCards[index]}
					class="clay-card group overflow-hidden rounded-xl bg-surface-container-lowest opacity-0 transition-transform duration-500 hover:-translate-y-4"
				>
					<div class="h-80 overflow-hidden">
						<img
							alt={member.name}
							class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
							src={member.image}
						/>
					</div>
					<div class="p-8">
						<h3 class="font-headline mb-2 text-2xl font-bold text-on-surface">{member.name}</h3>
						<p class="font-label font-bold text-primary">{member.role}</p>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- CTA Section -->
	<section class="clay-card rounded-xl bg-secondary-container p-16 text-center">
		<h3 class="font-headline mb-6 text-4xl font-black tracking-tighter text-on-secondary-container">
			Siap Memulai Perjalanan Kurban Anda?
		</h3>
		<p class="mx-auto mb-8 max-w-2xl text-lg font-medium text-on-secondary-container/80">
			Bergabunglah dengan ribuan keluarga yang telah mempercayakan ibadah kurban mereka kepada kami.
		</p>
		<div class="flex flex-wrap justify-center gap-6">
			<a
				href="/hewan"
				class="font-headline clay-button-secondary rounded-full bg-on-secondary-container px-10 py-5 font-bold text-secondary-container transition-transform hover:scale-105"
			>
				Pilih Hewan Kurban
			</a>
			<a
				href="/kontak"
				class="font-headline rounded-full border border-white/30 bg-white/20 px-10 py-5 font-bold text-on-secondary-container backdrop-blur-md transition-all hover:bg-white/30"
			>
				Hubungi Kami
			</a>
		</div>
	</section>
</div>
