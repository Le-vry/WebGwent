
import { browser } from "$app/environment";
import { writable } from "svelte/store";


/* initialize the users to "" if the users has not already been stored */
const players = browser ? window?.localStorage.getItem('players') ?? "" : ""

export const players_store = writable(players)

if (browser) {
        /* https://svelte.dev/tutorial/auto-subscriptions */
        players_store.subscribe((value) => {
                /* on changes to the users_store, update the localStorage in the browser. */
                window?.localStorage.setItem('players', value);
        })
}
                            
