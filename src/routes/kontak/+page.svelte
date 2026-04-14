<script lang="ts">
	import { onMount } from 'svelte';
	import { animate, inView } from 'motion';

	let heroRef: HTMLElement;
	let contactRef: HTMLElement;
	let formRef: HTMLElement;
	let infoCards: HTMLElement[] = [];
	let scrollProgress = 0;

	let formData = {
		name: '',
		email: '',
		phone: '',
		subject: '',
		message: ''
	};

	function handleSubmit() {
		alert('Terima kasih! Pesan Anda telah terkirim. Tim kami akan segera menghubungi Anda.');
		formData = { name: '', email: '', phone: '', subject: '', message: '' };
	}

	onMount(() => {
		// Hero animation
		if (heroRef) {
			animate(heroRef, { opacity: [0, 1], y: [50, 0] }, { duration: 1, easing: 'ease-out' });
		}

		// Contact section animation
		if (contactRef) {
			inView(
				contactRef,
				(info) => {
					infoCards.forEach((card, index) => {
						animate(
							card,
							{ opacity: [0, 1], y: [50, 0], scale: [0.95, 1] },
							{ duration: 0.7, delay: index * 0.15, easing: 'ease-out' }
						);
					});
					return () => {};
				},
				{ amount: 0.2 }
			);
		}

		// Form animation
		if (formRef) {
			inView(
				formRef,
				(info) => {
					animate(formRef, { opacity: [0, 1], x: [50, 0] }, { duration: 0.9, easing: 'ease-out' });
					return () => {};
				},
				{ amount: 0.3 }
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

	const contactInfo = [
		{
			icon: 'location_on',
			title: 'Alamat',
			details: ['Jl. Kurban Raya No. 123', 'Jakarta Selatan, 12345', 'Indonesia']
		},
		{
			icon: 'phone',
			title: 'Telepon',
			details: ['+62 812-3456-7890', '+62 21-1234-5678'],
			action: 'tel:+6281234567890'
		},
		{
			icon: 'mail',
			title: 'Email',
			details: ['info@alqurban.id', 'support@alqurban.id'],
			action: 'mailto:info@alqurban.id'
		},
		{
			icon: 'schedule',
			title: 'Jam Operasional',
			details: ['Senin - Sabtu: 08.00 - 17.00', 'Minggu: 09.00 - 15.00']
		}
	];

	const faqs = [
		{
			question: 'Bagaimana cara memesan hewan kurban?',
			answer:
				'Anda dapat memilih hewan melalui halaman Hewan, lalu klik tombol Pilih. Ikuti proses checkout dan lakukan pembayaran.'
		},
		{
			question: 'Apakah bisa memilih hewan secara langsung?',
			answer:
				'Tentu! Anda dapat mengunjungi sanctuary kami untuk melihat dan memilih hewan secara langsung. Buat janji terlebih dahulu melalui telepon atau email.'
		},
		{
			question: 'Bagaimana sistem distribusinya?',
			answer:
				"Kami menyediakan layanan distribusi ke berbagai kota. Tim kami akan mengurus seluruh proses penyembelihan dan distribusi sesuai syar'i."
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
		class="clay-card relative mb-20 h-[500px] overflow-hidden rounded-xl opacity-0"
	>
		<div
			class="absolute inset-0 bg-cover bg-center"
			style="background-image: url('https://images.unsplash.com/photo-1423666897890-1dbd19d3b1d4?auto=format&fit=crop&q=80&w=1600')"
		>
			<div
				class="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-emerald-950/60 to-transparent"
			></div>
		</div>
		<div class="relative flex h-full flex-col justify-center px-12 md:px-24">
			<span class="font-label mb-6 font-bold tracking-[0.3em] text-secondary-container uppercase"
				>Hubungi Kami</span
			>
			<h1
				class="font-headline mb-8 max-w-2xl text-5xl leading-[0.9] font-black tracking-tighter text-white md:text-7xl"
			>
				Kami Siap<br /><span class="font-light text-secondary-container italic">Membantu</span>
			</h1>
			<p class="max-w-2xl text-xl leading-relaxed font-medium text-emerald-50 opacity-90">
				Punya pertanyaan tentang kurban? Tim konsultan kami siap memberikan solusi terbaik untuk
				ibadah Anda.
			</p>
		</div>
	</section>

	<!-- Contact Info Cards -->
	<section bind:this={contactRef} class="mb-20">
		<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
			{#each contactInfo as info, index}
				<div
					bind:this={infoCards[index]}
					class="clay-card group rounded-xl bg-surface-container-lowest p-8 opacity-0 transition-transform duration-500 hover:-translate-y-4"
				>
					<div
						class="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 transition-transform group-hover:scale-110 group-hover:bg-primary/20"
					>
						<span class="material-symbols-outlined text-3xl text-primary">{info.icon}</span>
					</div>
					<h3 class="font-headline mb-4 text-xl font-bold text-on-surface">{info.title}</h3>
					{#each info.details as detail}
						<p class="mb-2 text-sm font-medium text-on-surface-variant">{detail}</p>
					{/each}
					{#if info.action}
						<a href={info.action} class="mt-4 inline-block font-bold text-primary hover:underline">
							Hubungi →
						</a>
					{/if}
				</div>
			{/each}
		</div>
	</section>

	<!-- Contact Form & Map Section -->
	<section class="mb-20 grid grid-cols-1 gap-12 lg:grid-cols-2">
		<!-- Contact Form -->
		<div bind:this={formRef} class="clay-card rounded-xl bg-surface-container-low p-10 opacity-0">
			<h3 class="font-headline mb-8 text-3xl font-black tracking-tighter text-primary">
				Kirim Pesan
			</h3>
			<form on:submit|preventDefault={handleSubmit} class="space-y-6">
				<div>
					<label class="font-label mb-2 block font-bold text-on-surface">Nama Lengkap</label>
					<input
						type="text"
						bind:value={formData.name}
						class="clay-recessed w-full rounded-full bg-white px-6 py-4 font-medium transition-all focus:ring-2 focus:ring-primary/50 focus:outline-none"
						placeholder="Masukkan nama Anda"
						required
					/>
				</div>
				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class="font-label mb-2 block font-bold text-on-surface">Email</label>
						<input
							type="email"
							bind:value={formData.email}
							class="clay-recessed w-full rounded-full bg-white px-6 py-4 font-medium transition-all focus:ring-2 focus:ring-primary/50 focus:outline-none"
							placeholder="email@contoh.com"
							required
						/>
					</div>
					<div>
						<label class="font-label mb-2 block font-bold text-on-surface">No. Telepon</label>
						<input
							type="tel"
							bind:value={formData.phone}
							class="clay-recessed w-full rounded-full bg-white px-6 py-4 font-medium transition-all focus:ring-2 focus:ring-primary/50 focus:outline-none"
							placeholder="+62 xxx-xxxx-xxxx"
						/>
					</div>
				</div>
				<div>
					<label class="font-label mb-2 block font-bold text-on-surface">Subjek</label>
					<select
						bind:value={formData.subject}
						class="clay-recessed w-full rounded-full bg-white px-6 py-4 font-medium transition-all focus:ring-2 focus:ring-primary/50 focus:outline-none"
						required
					>
						<option value="">Pilih subjek</option>
						<option value="info">Informasi Umum</option>
						<option value="order">Pemesanan</option>
						<option value="consult">Konsultasi</option>
						<option value="complaint">Pengaduan</option>
					</select>
				</div>
				<div>
					<label class="font-label mb-2 block font-bold text-on-surface">Pesan</label>
					<textarea
						bind:value={formData.message}
						rows="5"
						class="clay-recessed w-full resize-none rounded-2xl bg-white px-6 py-4 font-medium transition-all focus:ring-2 focus:ring-primary/50 focus:outline-none"
						placeholder="Tulis pesan Anda di sini..."
						required
					></textarea>
				</div>
				<button
					type="submit"
					class="font-headline clay-button-primary w-full rounded-full bg-primary py-5 text-lg font-bold text-on-primary transition-transform hover:scale-[1.02]"
				>
					Kirim Pesan
				</button>
			</form>
		</div>

		<!-- Map & Additional Info -->
		<div class="space-y-8">
			<div class="clay-card h-80 overflow-hidden rounded-xl bg-surface-container-low p-10">
				<div class="flex h-full w-full items-center justify-center rounded-lg bg-surface-container">
					<div class="text-center">
						<span class="material-symbols-outlined mb-4 text-6xl text-primary/30">location_on</span>
						<p class="font-medium text-on-surface-variant">Peta Lokasi Sanctuary Best-Qurban</p>
						<p class="mt-2 text-sm text-on-surface-variant/60">
							Integrasi Google Maps dapat ditambahkan di sini
						</p>
					</div>
				</div>
			</div>

			<!-- FAQ Section -->
			<div class="clay-card rounded-xl bg-secondary-container p-10">
				<h3
					class="font-headline mb-6 text-2xl font-black tracking-tighter text-on-secondary-container"
				>
					FAQ Umum
				</h3>
				<div class="space-y-6">
					{#each faqs as faq}
						<div class="rounded-lg bg-white/30 p-6">
							<h4 class="mb-2 font-bold text-on-secondary-container">{faq.question}</h4>
							<p class="text-sm font-medium text-on-secondary-container/80">{faq.answer}</p>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</section>

	<!-- Social Media & WhatsApp CTA -->
	<section class="clay-card relative overflow-hidden rounded-xl bg-emerald-950 p-12 text-white">
		<div class="relative z-10 text-center">
			<h3 class="font-headline mb-6 text-4xl font-black tracking-tighter">Terhubung Dengan Kami</h3>
			<p class="mx-auto mb-8 max-w-2xl text-lg font-medium text-emerald-100/70">
				Follow media sosial kami untuk update terbaru atau hubungi langsung via WhatsApp untuk
				respon cepat.
			</p>
			<div class="flex flex-wrap justify-center gap-6">
				<a
					href="https://wa.me/6281234567890"
					target="_blank"
					class="font-headline clay-button-primary flex items-center gap-3 rounded-full bg-green-500 px-8 py-4 font-bold text-white transition-transform hover:scale-105"
				>
					<span class="material-symbols-outlined">chat</span>
					WhatsApp
				</a>
				<a
					href="#"
					class="font-headline flex items-center gap-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-4 font-bold text-white transition-transform hover:scale-105"
				>
					<span class="material-symbols-outlined">photo_camera</span>
					Instagram
				</a>
				<a
					href="#"
					class="font-headline flex items-center gap-3 rounded-full bg-blue-600 px-8 py-4 font-bold text-white transition-transform hover:scale-105"
				>
					<span class="material-symbols-outlined">thumb_up</span>
					Facebook
				</a>
				<a
					href="#"
					class="font-headline flex items-center gap-3 rounded-full bg-red-600 px-8 py-4 font-bold text-white transition-transform hover:scale-105"
				>
					<span class="material-symbols-outlined">play_circle</span>
					YouTube
				</a>
			</div>
		</div>
		<div
			class="absolute top-0 right-0 h-full w-1/2 bg-cover bg-center opacity-10"
			style="background-image: url('https://images.unsplash.com/photo-1590059344400-985f57a3e74c?auto=format&fit=crop&q=80&w=1000')"
		></div>
	</section>
</div>
