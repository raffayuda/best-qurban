import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

export interface AuthUser {
	id: string;
	email: string;
	name: string;
	role: 'admin' | 'user';
	avatar: string;
}

const DUMMY_USERS: Array<AuthUser & { password: string }> = [
	{
		id: 'admin-1',
		email: 'admin@bestqurban.com',
		password: 'admin123',
		name: 'Ahmad Rizky',
		role: 'admin',
		avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
	},
	{
		id: 'user-1',
		email: 'user@bestqurban.com',
		password: 'user123',
		name: 'Budi Santoso',
		role: 'user',
		avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200'
	}
];

function createAuthStore() {
	let initialUser: AuthUser | null = null;
	if (browser) {
		const stored = localStorage.getItem('bq_auth_user');
		if (stored) {
			try {
				initialUser = JSON.parse(stored);
			} catch {}
		}
	}

	const { subscribe, set } = writable<AuthUser | null>(initialUser);

	return {
		subscribe,
		login: async (
			email: string,
			password: string
		): Promise<{ success: boolean; error?: string }> => {
			await new Promise((resolve) => setTimeout(resolve, 900));
			const found = DUMMY_USERS.find(
				(u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
			);
			if (!found) return { success: false, error: 'Email atau password salah.' };
			const { password: _pw, ...user } = found;
			set(user);
			if (browser) localStorage.setItem('bq_auth_user', JSON.stringify(user));
			return { success: true };
		},
		logout: () => {
			set(null);
			if (browser) localStorage.removeItem('bq_auth_user');
		}
	};
}

export const auth = createAuthStore();
export const isLoggedIn = derived(auth, ($a) => $a !== null);
export const isAdmin = derived(auth, ($a) => $a?.role === 'admin');
