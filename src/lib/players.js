import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const players = browser ? window.localStorage.getItem('players') ?? '' : '';

export const players_store = writable(players);

if (browser) {
	players_store.subscribe((value) => {
		window.localStorage.setItem('players', value);
	});
}
