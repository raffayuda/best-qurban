<script lang="ts">
	import {
		dashboardAnimals,
		type Animal,
		type AnimalType,
		type AnimalStatus
	} from '$lib/stores/dashboardData';

	let animals = $derived($dashboardAnimals);
	let searchQuery = $state('');
	let filterType = $state<AnimalType | 'semua'>('semua');
	let filterStatus = $state<AnimalStatus | 'semua'>('semua');
	let showModal = $state(false);
	let editingAnimal = $state<Animal | null>(null);
	let deleteConfirmId = $state<number | null>(null);

	// Form state
	let formName = $state('');
	let formType = $state<AnimalType>('sapi');
	let formWeight = $state(0);
	let formPrice = $state(0);
	let formDescription = $state('');
	let formImage = $state('');
	let formStatus = $state<AnimalStatus>('tersedia');
	let formStock = $state(1);

	const filtered = $derived(
		animals.filter((a) => {
			const matchSearch =
				!searchQuery ||
				a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				a.type.includes(searchQuery.toLowerCase());
			const matchType = filterType === 'semua' || a.type === filterType;
			const matchStatus = filterStatus === 'semua' || a.status === filterStatus;
			return matchSearch && matchType && matchStatus;
		})
	);

	const statusConfig: Record<AnimalStatus, { label: string; cls: string }> = {
		tersedia: { label: 'Tersedia', cls: 'bg-emerald-100 text-emerald-800' },
		dicadangkan: { label: 'Dicadangkan', cls: 'bg-amber-100 text-amber-800' },
		terjual: { label: 'Terjual', cls: 'bg-surface-container text-on-surface-variant' }
	};

	const typeLabel: Record<AnimalType, string> = {
		sapi: 'Sapi',
		kambing: 'Kambing',
		domba: 'Domba'
	};

	function fmt(n: number) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(n);
	}

	function openAdd() {
		editingAnimal = null;
		formName = '';
		formType = 'sapi';
		formWeight = 0;
		formPrice = 0;
		formDescription = '';
		formImage = '';
		formStatus = 'tersedia';
		formStock = 1;
		showModal = true;
	}

	function openEdit(animal: Animal) {
		editingAnimal = animal;
		formName = animal.name;
		formType = animal.type;
		formWeight = animal.weight;
		formPrice = animal.price;
		formDescription = animal.description;
		formImage = animal.image;
		formStatus = animal.status;
		formStock = animal.stock;
		showModal = true;
	}

	function handleSave() {
		const data = {
			name: formName,
			type: formType,
			weight: formWeight,
			price: formPrice,
			description: formDescription,
			image: formImage,
			status: formStatus,
			stock: formStock
		};
		if (editingAnimal) {
			dashboardAnimals.update(editingAnimal.id, data);
		} else {
			dashboardAnimals.add(data);
		}
		showModal = false;
	}

	function handleDelete(id: number) {
		dashboardAnimals.remove(id);
		deleteConfirmId = null;
	}

	function toggleStatus(animal: Animal) {
		const cycle: AnimalStatus[] = ['tersedia', 'dicadangkan', 'terjual'];
		const idx = cycle.indexOf(animal.status);
		const next = cycle[(idx + 1) % cycle.length];
		dashboardAnimals.update(animal.id, { status: next });
	}
</script>

<svelte:head>
	<title>Manajemen Hewan | Dashboard</title>
</svelte:head>

<div class="space-y-6 max-w-7xl">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div>
			<h1 class="text-3xl font-black text-on-surface tracking-tighter font-headline">Manajemen Hewan</h1>
			<p class="text-on-surface-variant font-medium mt-1">Kelola katalog hewan kurban ({animals.length} ekor terdaftar)</p>
		</div>
		<button
			onclick={openAdd}
			class="inline-flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-full font-headline font-bold text-sm clay-button-primary transition-transform hover:scale-105 shrink-0"
		>
			<span class="material-symbols-outlined text-base">add</span>
			Tambah Hewan
		</button>
	</div>

	<!-- Summary Cards -->
	<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
		{#each ([ ['tersedia', 'Tersedia', 'pets', 'emerald'], ['dicadangkan', 'Dicadangkan', 'lock', 'amber'], ['terjual', 'Terjual', 'sell', 'gray'], ['semua', 'Total', 'list', 'blue'] ] as const) as [key, label, icon, color]}
			<div class="clay-card bg-white rounded-2xl p-4">
				<span class="material-symbols-outlined text-{color}-600 mb-2 block">{icon}</span>
				<p class="text-2xl font-black text-on-surface font-headline">
					{key === 'semua' ? animals.length : animals.filter((a) => a.status === key).length}
				</p>
				<p class="text-xs font-bold text-on-surface-variant mt-1">{label}</p>
			</div>
		{/each}
	</div>

	<!-- Filters -->
	<div class="clay-card bg-white rounded-2xl p-4">
		<div class="flex flex-col sm:flex-row gap-3">
			<div class="flex-1 relative">
				<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">search</span>
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Cari nama hewan..."
					class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-container-high bg-surface-container-lowest text-on-surface font-medium focus:outline-none focus:border-primary text-sm"
				/>
			</div>
			<select
				bind:value={filterType}
				class="px-4 py-2.5 rounded-xl border border-surface-container-high bg-surface-container-lowest text-on-surface font-medium focus:outline-none focus:border-primary text-sm"
			>
				<option value="semua">Semua Jenis</option>
				<option value="sapi">Sapi</option>
				<option value="kambing">Kambing</option>
				<option value="domba">Domba</option>
			</select>
			<select
				bind:value={filterStatus}
				class="px-4 py-2.5 rounded-xl border border-surface-container-high bg-surface-container-lowest text-on-surface font-medium focus:outline-none focus:border-primary text-sm"
			>
				<option value="semua">Semua Status</option>
				<option value="tersedia">Tersedia</option>
				<option value="dicadangkan">Dicadangkan</option>
				<option value="terjual">Terjual</option>
			</select>
		</div>
	</div>

	<!-- Animal Table -->
	<div class="clay-card bg-white rounded-2xl overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead class="bg-surface-container-lowest border-b border-surface-container">
					<tr>
						<th class="text-left px-6 py-4 font-bold text-on-surface-variant text-xs uppercase tracking-wider">Hewan</th>
						<th class="text-left px-4 py-4 font-bold text-on-surface-variant text-xs uppercase tracking-wider hidden md:table-cell">Jenis</th>
						<th class="text-left px-4 py-4 font-bold text-on-surface-variant text-xs uppercase tracking-wider hidden lg:table-cell">Berat</th>
						<th class="text-left px-4 py-4 font-bold text-on-surface-variant text-xs uppercase tracking-wider">Harga</th>
						<th class="text-left px-4 py-4 font-bold text-on-surface-variant text-xs uppercase tracking-wider hidden sm:table-cell">Stok</th>
						<th class="text-left px-4 py-4 font-bold text-on-surface-variant text-xs uppercase tracking-wider">Status</th>
						<th class="text-right px-6 py-4 font-bold text-on-surface-variant text-xs uppercase tracking-wider">Aksi</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-surface-container">
					{#each filtered as animal (animal.id)}
						<tr class="hover:bg-surface-container-lowest/50 transition-colors">
							<td class="px-6 py-4">
								<div class="flex items-center gap-3">
									<img src={animal.image} alt={animal.name} class="w-12 h-12 rounded-xl object-cover shrink-0" />
									<div>
										<p class="font-bold text-on-surface">{animal.name}</p>
										<p class="text-xs text-on-surface-variant truncate max-w-[200px]">{animal.description.slice(0, 60)}...</p>
									</div>
								</div>
							</td>
							<td class="px-4 py-4 hidden md:table-cell">
								<span class="text-sm font-medium text-on-surface">{typeLabel[animal.type]}</span>
							</td>
							<td class="px-4 py-4 hidden lg:table-cell">
								<span class="font-medium text-on-surface">{animal.weight} kg</span>
							</td>
							<td class="px-4 py-4">
								<span class="font-bold text-primary">{fmt(animal.price)}</span>
							</td>
							<td class="px-4 py-4 hidden sm:table-cell">
								<span class="font-bold text-on-surface {animal.stock <= 3 && animal.stock > 0 ? 'text-red-600' : ''}">
									{animal.stock} ekor
									{#if animal.stock <= 3 && animal.stock > 0}
										<span class="material-symbols-outlined text-sm text-red-500 align-middle">warning</span>
									{/if}
								</span>
							</td>
							<td class="px-4 py-4">
								<button
									onclick={() => toggleStatus(animal)}
									class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold cursor-pointer hover:opacity-80 transition-opacity {statusConfig[animal.status].cls}"
								>
									{statusConfig[animal.status].label}
								</button>
							</td>
							<td class="px-6 py-4">
								<div class="flex items-center justify-end gap-2">
									<button
										onclick={() => openEdit(animal)}
										class="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
										title="Edit"
									>
										<span class="material-symbols-outlined text-base">edit</span>
									</button>
									{#if deleteConfirmId === animal.id}
										<div class="flex gap-1">
											<button
												onclick={() => handleDelete(animal.id)}
												class="px-2 py-1 rounded-lg bg-red-100 text-red-700 text-xs font-bold hover:bg-red-200 transition-colors"
											>Hapus</button>
											<button
												onclick={() => (deleteConfirmId = null)}
												class="px-2 py-1 rounded-lg bg-surface-container text-on-surface-variant text-xs font-bold hover:bg-surface-container-high transition-colors"
											>Batal</button>
										</div>
									{:else}
										<button
											onclick={() => (deleteConfirmId = animal.id)}
											class="p-2 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
											title="Hapus"
										>
											<span class="material-symbols-outlined text-base">delete</span>
										</button>
									{/if}
								</div>
							</td>
						</tr>
					{:else}
						<tr>
							<td colspan="7" class="px-6 py-12 text-center text-on-surface-variant font-medium">
								<span class="material-symbols-outlined text-4xl mb-2 block">search_off</span>
								Tidak ada hewan yang cocok dengan filter.
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>

<!-- Add/Edit Modal -->
{#if showModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
		<div class="w-full max-w-2xl bg-white rounded-2xl clay-card overflow-hidden">
			<div class="flex items-center justify-between px-6 py-5 border-b border-surface-container">
				<h3 class="font-headline text-xl font-black text-on-surface">
					{editingAnimal ? 'Edit Hewan' : 'Tambah Hewan Baru'}
				</h3>
				<button onclick={() => (showModal = false)} class="p-2 rounded-xl hover:bg-surface-container transition-colors">
					<span class="material-symbols-outlined">close</span>
				</button>
			</div>
			<div class="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
				<div class="grid grid-cols-2 gap-4">
					<div class="col-span-2">
						<label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Nama Hewan *</label>
						<input bind:value={formName} type="text" placeholder="Sapi Limousin Premium" class="w-full border border-surface-container-high rounded-xl px-4 py-2.5 font-medium text-sm focus:outline-none focus:border-primary" />
					</div>
					<div>
						<label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Jenis *</label>
						<select bind:value={formType} class="w-full border border-surface-container-high rounded-xl px-4 py-2.5 font-medium text-sm focus:outline-none focus:border-primary">
							<option value="sapi">Sapi</option>
							<option value="kambing">Kambing</option>
							<option value="domba">Domba</option>
						</select>
					</div>
					<div>
						<label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Status *</label>
						<select bind:value={formStatus} class="w-full border border-surface-container-high rounded-xl px-4 py-2.5 font-medium text-sm focus:outline-none focus:border-primary">
							<option value="tersedia">Tersedia</option>
							<option value="dicadangkan">Dicadangkan</option>
							<option value="terjual">Terjual</option>
						</select>
					</div>
					<div>
						<label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Berat (kg) *</label>
						<input bind:value={formWeight} type="number" min="1" class="w-full border border-surface-container-high rounded-xl px-4 py-2.5 font-medium text-sm focus:outline-none focus:border-primary" />
					</div>
					<div>
						<label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Harga (Rp) *</label>
						<input bind:value={formPrice} type="number" min="0" class="w-full border border-surface-container-high rounded-xl px-4 py-2.5 font-medium text-sm focus:outline-none focus:border-primary" />
					</div>
					<div>
						<label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Stok (ekor)</label>
						<input bind:value={formStock} type="number" min="0" class="w-full border border-surface-container-high rounded-xl px-4 py-2.5 font-medium text-sm focus:outline-none focus:border-primary" />
					</div>
					<div>
						<label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">URL Foto</label>
						<input bind:value={formImage} type="url" placeholder="https://..." class="w-full border border-surface-container-high rounded-xl px-4 py-2.5 font-medium text-sm focus:outline-none focus:border-primary" />
					</div>
					<div class="col-span-2">
						<label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Deskripsi</label>
						<textarea bind:value={formDescription} rows="3" placeholder="Deskripsi hewan..." class="w-full border border-surface-container-high rounded-xl px-4 py-2.5 font-medium text-sm focus:outline-none focus:border-primary resize-none"></textarea>
					</div>
				</div>
			</div>
			<div class="flex gap-3 px-6 py-4 border-t border-surface-container">
				<button onclick={() => (showModal = false)} class="flex-1 py-2.5 rounded-xl border border-surface-container-high font-bold text-sm text-on-surface hover:bg-surface-container transition-colors">Batal</button>
				<button onclick={handleSave} class="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm clay-button-primary hover:scale-[1.02] transition-transform">
					{editingAnimal ? 'Simpan Perubahan' : 'Tambah Hewan'}
				</button>
			</div>
		</div>
	</div>
{/if}
