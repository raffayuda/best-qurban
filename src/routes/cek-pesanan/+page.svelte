<script lang="ts">
	import { onMount } from 'svelte';
	import { animate } from 'motion';

	let containerRef: HTMLElement;
	let orderId = $state('');
	let isLoading = $state(false);
	let isSearched = $state(false);

	interface TrackingStatus {
		status: 'success' | 'pending' | 'failed' | 'processing';
		currentStep: number;
		customerName: string;
		animalName: string;
		orderDate: string;
	}

	let trackingData = $state<TrackingStatus | null>(null);

	const steps = [
		{
			id: 1,
			title: 'Menunggu Pembayaran',
			icon: 'payments',
			desc: 'Selesaikan pembayaran via Midtrans'
		},
		{ id: 2, title: 'Pembayaran Diterima', icon: 'check_circle', desc: 'Dana telah diverifikasi' },
		{
			id: 3,
			title: 'Perawatan Hewan',
			icon: 'spa',
			desc: 'Hewan kurban dirawat eksklusif di Sanctuary'
		},
		{
			id: 4,
			title: 'Proses Penyembelihan',
			icon: 'routine',
			desc: 'Dilakukan sesuai syariat saat Idul Adha'
		},
		{
			id: 5,
			title: 'Laporan Dokumentasi',
			icon: 'auto_videocam',
			desc: 'Video & Bukti telah dikirimkan'
		}
	];

	function searchOrder(e: Event) {
		e.preventDefault();
		if (!orderId.trim()) return;

		isLoading = true;
		isSearched = false;

		// Simulate API Call
		setTimeout(() => {
			isSearched = true;
			isLoading = false;

			// Dummy logic based on order ID
			if (orderId.toLowerCase().includes('fail')) {
				trackingData = {
					status: 'failed',
					currentStep: 1,
					customerName: 'Hamba Allah',
					animalName: '-',
					orderDate: new Date().toLocaleDateString('id-ID')
				};
			} else if (orderId.toLowerCase().includes('pending')) {
				trackingData = {
					status: 'pending',
					currentStep: 1,
					customerName: 'Hamba Allah',
					animalName: 'Domba Merino',
					orderDate: new Date().toLocaleDateString('id-ID')
				};
			} else {
				// Default to in-progress or success
				trackingData = {
					status: 'processing',
					currentStep: 3,
					customerName: 'Hamba Allah',
					animalName: 'Sapi Limousin',
					orderDate: new Date(Date.now() - 86400000 * 2).toLocaleDateString('id-ID')
				};
			}

			// Animate newly appeared results
			setTimeout(() => {
				const resultCard = document.querySelector('[data-result-card]');
				if (resultCard) {
					animate(resultCard, { opacity: [0, 1], y: [40, 0] } as any, {
						duration: 0.6,
						easing: 'ease-out'
					});
				}
			}, 50);
		}, 1500);
	}

	onMount(() => {
		if (containerRef) {
			animate(containerRef, { opacity: [0, 1], y: [30, 0] } as any, {
				duration: 0.6,
				easing: 'ease-out'
			});
		}
	});
</script>

<svelte:head>
	<title>Cek Pesanan | Best-Qurban</title>
</svelte:head>

<div bind:this={containerRef} class="mx-auto min-h-[70vh] max-w-4xl px-4 pb-32 md:px-12">
	<div class="mb-16 text-center">
		<span class="material-symbols-outlined mb-6 text-6xl text-primary">travel_explore</span>
		<h1 class="font-headline mb-4 text-4xl font-black tracking-tighter text-on-surface md:text-5xl">
			Cek Status Pesanan
		</h1>
		<p class="mx-auto max-w-xl text-lg font-medium text-on-surface-variant">
			Pantau perkembangan ibadah kurban Anda secara real-time. Masukkan Order ID yang Anda terima
			setelah checkout.
		</p>
	</div>

	<!-- Search Form -->
	<div class="clay-card mb-12 rounded-2xl bg-surface-container-low p-8">
		<form onsubmit={searchOrder} class="flex flex-col gap-4 md:flex-row">
			<div
				class="clay-recessed flex flex-grow items-center gap-3 rounded-xl bg-surface-container-lowest px-6 py-4"
			>
				<span class="material-symbols-outlined text-on-surface-variant">qr_code_scanner</span>
				<input
					bind:value={orderId}
					type="text"
					placeholder="Masukkan Order ID (contoh: ORDER-12345)"
					class="w-full border-none bg-transparent font-bold text-on-surface placeholder:font-medium placeholder:text-on-surface-variant/50 focus:ring-0"
					disabled={isLoading}
				/>
			</div>
			<button
				type="submit"
				disabled={isLoading}
				class="clay-button-primary font-headline flex min-w-[160px] items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 font-bold text-on-primary transition-all hover:scale-105 active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
			>
				{#if isLoading}
					<span class="material-symbols-outlined animate-spin">sync</span>
					Mencari...
				{:else}
					<span class="material-symbols-outlined">search</span>
					Lacak
				{/if}
			</button>
		</form>

		<!-- Dummy ID hints -->
		<div
			class="mt-6 flex flex-wrap justify-center gap-2 text-xs font-medium text-on-surface-variant/70"
		>
			<span>Coba Order ID: </span>
			<button
				onclick={() => {
					orderId = 'ORDER-SUCCESS-1';
					searchOrder({ preventDefault: () => {} } as Event);
				}}
				class="rounded bg-surface-container px-2 py-1 hover:text-primary">ORDER-SUCCESS-1</button
			>
			<button
				onclick={() => {
					orderId = 'ORDER-PENDING';
					searchOrder({ preventDefault: () => {} } as Event);
				}}
				class="rounded bg-surface-container px-2 py-1 hover:text-secondary-container"
				>ORDER-PENDING</button
			>
		</div>
	</div>

	<!-- Search Results / Tracking Info -->
	{#if isSearched && trackingData}
		<div
			data-result-card
			class="clay-card rounded-2xl border-t-8 border-primary bg-surface-container-lowest p-8 opacity-0 md:p-12"
		>
			<div
				class="mb-10 flex flex-col items-start justify-between border-b border-surface-container pb-6 md:flex-row md:items-end"
			>
				<div>
					<span
						class="font-label mb-2 block text-sm font-bold tracking-widest text-on-surface-variant uppercase"
						>Detail Pesanan: {orderId}</span
					>
					<h3 class="font-headline text-2xl font-black text-on-surface">
						{trackingData.animalName}
					</h3>
					<span class="font-medium text-on-surface-variant"
						>Atas nama: <span class="font-bold text-on-surface">{trackingData.customerName}</span
						></span
					>
				</div>
				<div class="mt-4 text-right md:mt-0">
					<span class="mb-1 block font-medium text-on-surface-variant">Tanggal Checkout</span>
					<span class="font-bold text-on-surface">{trackingData.orderDate}</span>
				</div>
			</div>

			<!-- Status Badge -->
			<div class="mb-12">
				{#if trackingData.status === 'failed'}
					<div
						class="flex items-center gap-3 rounded-xl bg-red-100 px-6 py-4 font-bold text-red-800"
					>
						<span class="material-symbols-outlined">error</span>
						Pesanan Dibatalkan / Gagal. Pembayaran tidak diterima.
					</div>
				{:else if trackingData.status === 'pending'}
					<div
						class="flex items-center gap-3 rounded-xl bg-amber-100 px-6 py-4 font-bold text-amber-800"
					>
						<span class="material-symbols-outlined">hourglass_empty</span>
						Menunggu Pembayaran. Silakan selesaikan pembayaran Anda segera.
					</div>
				{:else}
					<div
						class="flex items-center gap-3 rounded-xl bg-emerald-100 px-6 py-4 font-bold text-emerald-800"
					>
						<span class="material-symbols-outlined">check_circle</span>
						Pesanan Aktif. Proses berjalan sesuai dengan prosedur Best-Qurban.
					</div>
				{/if}
			</div>

			<!-- Stepper / Timeline -->
			{#if trackingData.status !== 'failed'}
				<div class="relative pt-6">
					<!-- Progress Line Background -->
					<div
						class="absolute top-0 bottom-0 left-8 z-0 w-1 bg-surface-container md:left-1/2 md:-translate-x-1/2"
					></div>

					<!-- Active Progress Line -->
					<div
						class="absolute top-0 left-8 z-0 w-1 bg-primary transition-all duration-1000 md:left-1/2 md:-translate-x-1/2"
						style="height: {((trackingData.currentStep - 1) / (steps.length - 1)) * 100}%"
					></div>

					<div class="relative z-10 space-y-12">
						{#each steps as step, i}
							{@const isActive = i < trackingData.currentStep}
							{@const isCurrent = i === trackingData.currentStep - 1}

							<div
								class="flex flex-col items-center gap-6 md:flex-row md:gap-16 {i % 2 !== 0
									? 'md:flex-row-reverse'
									: ''}"
							>
								<!-- Content (Left or Right) -->
								<div
									class="w-full md:w-1/2 {i % 2 !== 0
										? 'pl-20 md:pl-0 md:text-left'
										: 'pl-20 md:pr-0 md:text-right'} flex flex-col justify-center"
								>
									<h4
										class="font-headline text-lg font-bold md:text-xl {isActive
											? 'text-on-surface'
											: 'text-on-surface-variant/50'}"
									>
										{step.title}
									</h4>
									<p
										class="font-medium {isActive
											? 'text-on-surface-variant'
											: 'text-on-surface-variant/30'}"
									>
										{step.desc}
									</p>
								</div>

								<!-- Circle Icon -->
								<div
									class="absolute left-0 flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full md:relative md:left-auto {isActive
										? isCurrent
											? 'clay-card bg-secondary-container text-on-secondary-container ring-8 ring-secondary-container/20'
											: 'bg-primary text-on-primary'
										: 'border-4 border-surface-container-highest bg-surface-container text-on-surface-variant/30'} z-10 transition-all duration-500"
								>
									<span class="material-symbols-outlined"
										>{isActive && !isCurrent ? 'check' : step.icon}</span
									>
								</div>

								<!-- Empty placeholder for balance logic -->
								<div class="hidden w-full md:block md:w-1/2"></div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>
