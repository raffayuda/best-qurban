<script lang="ts">
	import { auth } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { isLoggedIn } from '$lib/stores/auth';
	import { onMount } from 'svelte';

	let email = $state('');
	let password = $state('');
	let showPassword = $state(false);
	let loading = $state(false);
	let error = $state<string | null>(null);

	onMount(() => {
		// If already logged in, redirect
		const unsub = isLoggedIn.subscribe((loggedIn) => {
			if (loggedIn) goto('/dashboard');
		});
		return unsub;
	});

	async function handleLogin(e: Event) {
		e.preventDefault();
		if (!email || !password) {
			error = 'Harap isi email dan password.';
			return;
		}
		loading = true;
		error = null;
		const result = await auth.login(email, password);
		loading = false;
		if (result.success) {
			goto('/dashboard');
		} else {
			error = result.error ?? 'Login gagal.';
		}
	}

	function fillDemo(role: 'admin' | 'user') {
		if (role === 'admin') {
			email = 'admin@bestqurban.com';
			password = 'admin123';
		} else {
			email = 'user@bestqurban.com';
			password = 'user123';
		}
	}
</script>

<svelte:head>
	<title>Login | Best-Qurban</title>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link
		rel="stylesheet"
		href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700;800&family=Plus+Jakarta+Sans:wght@500;600;700&display=swap"
	/>
	<link
		rel="stylesheet"
		href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
	/>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 flex items-center justify-center p-4 font-body relative overflow-hidden">
	<!-- Background decorative orbs -->
	<div class="absolute top-20 left-20 w-64 h-64 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none"></div>
	<div class="absolute bottom-20 right-20 w-80 h-80 bg-secondary-container/10 rounded-full blur-3xl pointer-events-none"></div>
	<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-700/10 rounded-full blur-3xl pointer-events-none"></div>

	<div class="w-full max-w-md relative z-10">
		<!-- Logo & Branding -->
		<div class="text-center mb-10">
			<div class="w-20 h-20 bg-emerald-600/30 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/30 backdrop-blur-sm">
				<img src="/BQ_Logo_Mono_4.png" alt="Best-Qurban" class="w-12 h-12" />
			</div>
			<h1 class="text-4xl font-black text-white tracking-tighter font-headline">Best-Qurban</h1>
			<p class="text-emerald-300/70 font-medium mt-2">Panel Admin & Akun Pengguna</p>
		</div>

		<!-- Login Card -->
		<div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
			<h2 class="text-2xl font-black text-white tracking-tighter font-headline mb-8">Masuk ke Akun</h2>

			<form onsubmit={handleLogin} class="space-y-5">
				<!-- Email -->
				<div class="space-y-2">
					<label for="email" class="text-sm font-bold text-emerald-200/80 uppercase tracking-wider">Email</label>
					<div class="relative">
						<span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 text-xl">mail</span>
						<input
							id="email"
							type="email"
							bind:value={email}
							placeholder="nama@email.com"
							disabled={loading}
							class="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-white/30 font-medium focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all disabled:opacity-50"
						/>
					</div>
				</div>

				<!-- Password -->
				<div class="space-y-2">
					<label for="password" class="text-sm font-bold text-emerald-200/80 uppercase tracking-wider">Password</label>
					<div class="relative">
						<span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 text-xl">lock</span>
						<input
							id="password"
							type={showPassword ? 'text' : 'password'}
							bind:value={password}
							placeholder="••••••••"
							disabled={loading}
							class="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-12 py-3.5 text-white placeholder:text-white/30 font-medium focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all disabled:opacity-50"
						/>
						<button
							type="button"
							onclick={() => (showPassword = !showPassword)}
							class="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-emerald-200 transition-colors"
						>
							<span class="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
						</button>
					</div>
				</div>

				<!-- Error -->
				{#if error}
					<div class="flex items-center gap-2 bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3">
						<span class="material-symbols-outlined text-red-400 text-sm">error</span>
						<p class="text-sm font-medium text-red-300">{error}</p>
					</div>
				{/if}

				<!-- Submit -->
				<button
					type="submit"
					disabled={loading}
					class="w-full bg-primary text-on-primary rounded-xl py-4 font-headline font-bold text-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-emerald-900/50 mt-2"
				>
					{#if loading}
						<span class="flex items-center justify-center gap-2">
							<span class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
							Memverifikasi...
						</span>
					{:else}
						Masuk
					{/if}
				</button>
			</form>

			<!-- Demo Credentials -->
			<div class="mt-8 pt-6 border-t border-white/10">
				<p class="text-center text-xs font-bold text-emerald-300/60 uppercase tracking-widest mb-4">Akun Demo</p>
				<div class="grid grid-cols-2 gap-3">
					<button
						onclick={() => fillDemo('admin')}
						class="flex flex-col items-start gap-1 bg-emerald-800/40 border border-emerald-600/30 rounded-xl p-4 hover:border-emerald-400/50 hover:bg-emerald-700/30 transition-all"
					>
						<div class="flex items-center gap-2 mb-1">
							<span class="material-symbols-outlined text-emerald-400 text-base">admin_panel_settings</span>
							<span class="text-xs font-black text-emerald-300 uppercase tracking-wider">Admin</span>
						</div>
						<span class="text-xs text-white/60 font-mono break-all">admin@bestqurban.com</span>
						<span class="text-xs text-white/40 font-mono">admin123</span>
					</button>
					<button
						onclick={() => fillDemo('user')}
						class="flex flex-col items-start gap-1 bg-emerald-800/40 border border-emerald-600/30 rounded-xl p-4 hover:border-emerald-400/50 hover:bg-emerald-700/30 transition-all"
					>
						<div class="flex items-center gap-2 mb-1">
							<span class="material-symbols-outlined text-secondary-container text-base">person</span>
							<span class="text-xs font-black text-secondary-container uppercase tracking-wider">User</span>
						</div>
						<span class="text-xs text-white/60 font-mono break-all">user@bestqurban.com</span>
						<span class="text-xs text-white/40 font-mono">user123</span>
					</button>
				</div>
			</div>
		</div>

		<!-- Back to site -->
		<div class="text-center mt-6">
			<a href="/" class="text-emerald-300/60 hover:text-emerald-200 font-medium text-sm transition-colors inline-flex items-center gap-2">
				<span class="material-symbols-outlined text-base">arrow_back</span>
				Kembali ke Beranda
			</a>
		</div>
	</div>
</div>
