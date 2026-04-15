import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface LandingContent {
	hero: {
		tagline: string;
		title: string;
		titleItalic: string;
		subtitle: string;
	};
	products: Array<{
		id: number;
		name: string;
		weight: string;
		description: string;
		price: number;
		image: string;
	}>;
}

export const DEFAULT_CONTENT: LandingContent = {
	hero: {
		tagline: 'Tradisi & Teknologi',
		title: 'Ibadah Suci,',
		titleItalic: 'Terpilih.',
		subtitle:
			'Menghadirkan pengalaman kurban premium yang mengutamakan kualitas hewan terbaik dan transparansi proses ritual yang sakral.'
	},
	products: [
		{
			id: 1,
			name: 'Sapi Limousin',
			weight: '~650kg',
			description:
				'Genetik unggul dengan tekstur daging premium. Dipelihara dengan pakan organik di Sanctuary Best-Qurban.',
			price: 45500000,
			image:
				'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&q=80&w=800'
		},
		{
			id: 2,
			name: 'Domba Merino',
			weight: '~45kg',
			description: 'Domba berkualitas ekspor dengan tingkat lemak rendah dan karkas yang melimpah.',
			price: 4250000,
			image:
				'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=800'
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
	]
};

function createContentStore() {
	let initial: LandingContent = JSON.parse(JSON.stringify(DEFAULT_CONTENT));
	if (browser) {
		const stored = localStorage.getItem('bq_landing_content');
		if (stored) {
			try {
				const parsed = JSON.parse(stored);
				initial = { ...DEFAULT_CONTENT, ...parsed };
			} catch {}
		}
	}

	const { subscribe, set, update } = writable<LandingContent>(initial);

	return {
		subscribe,
		set,
		update,
		save: (content: LandingContent) => {
			set(content);
			if (browser) {
				localStorage.setItem('bq_landing_content', JSON.stringify(content));
			}
		},
		reset: () => {
			const fresh = JSON.parse(JSON.stringify(DEFAULT_CONTENT));
			set(fresh);
			if (browser) {
				localStorage.removeItem('bq_landing_content');
			}
		}
	};
}

export const landingContent = createContentStore();
export const isEditMode = writable(false);
