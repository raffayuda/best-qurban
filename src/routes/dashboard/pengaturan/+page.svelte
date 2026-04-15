<script lang="ts">
	import { dashboardSettings } from '$lib/stores/dashboardData';

	let settings = $derived($dashboardSettings);
	let saving = $state(false);
	let saved = $state(false);

	// Local editable copies
	let adminFee = $state(settings.adminFeePercent);
	let freeShipping = $state(settings.freeShipping);
	let discountActive = $state(settings.discountActive);
	let discountPercent = $state(settings.discountPercent);
	let discountCode = $state(settings.discountCode);

	async function handleSave() {
		saving = true;
		await new Promise((r) => setTimeout(r, 800));
		dashboardSettings.update({
			adminFeePercent: adminFee,
			freeShipping,
			discountActive,
			discountPercent,
			discountCode
		});
		saving = false;
		saved = true;
		setTimeout(() => (saved = false), 2500);
	}
</script>

<svelte:head>
	<title>Pengaturan | Dashboard</title>
</svelte:head>

<div class="space-y-6 max-w-2xl">
	<!-- Header -->
	<div>
		<h1 class="text-3xl font-black text-on-surface tracking-tighter font-headline">Pengaturan</h1>
		<p class="text-on-surface-variant font-medium mt-1">Atur harga, biaya, dan konfigurasi aplikasi</p>
	</div>

	<!-- Admin Fee -->
	<div class="clay-card bg-white rounded-2xl p-6 space-y-4">
		<div class="flex items-center gap-3 mb-2">
			<div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
				<span class="material-symbols-outlined text-primary">percent</span>
			</div>
			<div>
				<h2 class="font-headline font-black text-on-surface">Biaya Admin</h2>
				<p class="text-sm text-on-surface-variant">Persentase biaya layanan dari total pesanan</p>
			</div>
		</div>
		<div>
			<label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-2">
				Persentase Biaya Admin (%)
			</label>
			<div class="flex items-center gap-3">
				<input
					type="number"
					bind:value={adminFee}
					min="0"
					max="10"
					step="0.1"
					class="w-32 border border-surface-container-high rounded-xl px-4 py-2.5 font-bold text-center text-on-surface focus:outline-none focus:border-primary"
				/>
				<span class="text-on-surface-variant font-medium">%</span>
				<div class="flex-1 bg-surface-container-lowest rounded-xl px-4 py-2.5">
					<p class="text-sm font-medium text-on-surface-variant">
						Contoh: pesanan Rp 10.000.000 → biaya admin 
						<span class="font-black text-primary">
							Rp {(10000000 * adminFee / 100).toLocaleString('id-ID')}
						</span>
					</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Shipping -->
	<div class="clay-card bg-white rounded-2xl p-6">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
					<span class="material-symbols-outlined text-blue-600">local_shipping</span>
				</div>
				<div>
					<h2 class="font-headline font-black text-on-surface">Layanan Gratis</h2>
					<p class="text-sm text-on-surface-variant">Aktifkan layanan pengiriman/distribusi gratis</p>
				</div>
			</div>
			<button
				onclick={() => (freeShipping = !freeShipping)}
				class="relative inline-flex h-7 w-12 items-center rounded-full transition-colors {freeShipping ? 'bg-primary' : 'bg-surface-container-high'}"
			>
				<span class="inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform {freeShipping ? 'translate-x-6' : 'translate-x-1'}"></span>
			</button>
		</div>
	</div>

	<!-- Discount / Promo -->
	<div class="clay-card bg-white rounded-2xl p-6 space-y-4">
		<div class="flex items-center justify-between mb-2">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center">
					<span class="material-symbols-outlined text-on-secondary-container">local_offer</span>
				</div>
				<div>
					<h2 class="font-headline font-black text-on-surface">Promo / Diskon</h2>
					<p class="text-sm text-on-surface-variant">Aktifkan kode promo untuk pelanggan</p>
				</div>
			</div>
			<button
				onclick={() => (discountActive = !discountActive)}
				class="relative inline-flex h-7 w-12 items-center rounded-full transition-colors {discountActive ? 'bg-primary' : 'bg-surface-container-high'}"
			>
				<span class="inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform {discountActive ? 'translate-x-6' : 'translate-x-1'}"></span>
			</button>
		</div>

		{#if discountActive}
			<div class="grid grid-cols-2 gap-4 pt-2 border-t border-surface-container">
				<div>
					<label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-2">Kode Promo</label>
					<input
						type="text"
						bind:value={discountCode}
						placeholder="QURBAN2026"
						class="w-full border border-surface-container-high rounded-xl px-4 py-2.5 font-bold text-on-surface focus:outline-none focus:border-primary uppercase"
					/>
				</div>
				<div>
					<label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-2">Diskon (%)</label>
					<input
						type="number"
						bind:value={discountPercent}
						min="0"
						max="100"
						class="w-full border border-surface-container-high rounded-xl px-4 py-2.5 font-bold text-on-surface focus:outline-none focus:border-primary"
					/>
				</div>
			</div>

			<div class="bg-secondary-container/30 rounded-xl p-3">
				<p class="text-sm font-medium text-on-surface">
					Pelanggan menggunakan kode <span class="font-black text-primary">{discountCode || '...'}</span> 
					akan mendapat diskon <span class="font-black text-primary">{discountPercent}%</span>.
				</p>
			</div>
		{/if}
	</div>

	<!-- Dummy Info Card -->
	<div class="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
		<span class="material-symbols-outlined text-amber-600 shrink-0">info</span>
		<div>
			<p class="font-bold text-amber-800 text-sm">Mode Dummy</p>
			<p class="text-amber-700 text-sm font-medium mt-0.5">
				Pengaturan ini saat ini hanya tersimpan di memori dan tidak terhubung ke database. Pengaturan akan hilang saat halaman di-refresh. Hubungkan ke backend untuk persistensi nyata.
			</p>
		</div>
	</div>

	<!-- Save Button -->
	<div class="flex items-center justify-end gap-4">
		{#if saved}
			<div class="flex items-center gap-2 text-emerald-600 font-bold">
				<span class="material-symbols-outlined text-base">check_circle</span>
				Pengaturan disimpan!
			</div>
		{/if}
		<button
			onclick={handleSave}
			disabled={saving}
			class="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-3 rounded-full font-headline font-bold clay-button-primary transition-transform hover:scale-105 disabled:opacity-60 disabled:hover:scale-100"
		>
			{#if saving}
				<span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
				Menyimpan...
			{:else}
				<span class="material-symbols-outlined text-sm">save</span>
				Simpan Pengaturan
			{/if}
		</button>
	</div>
</div>
