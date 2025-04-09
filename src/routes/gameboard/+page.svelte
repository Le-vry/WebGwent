<script>
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import { players_store } from "$lib/players.js";
    let players = [];
    onMount(() => {
    
    if($players_store.length > 0){
        players = JSON.parse($players_store);
        console.log(players)
    }
        P1 = players[0]
        P2 = players[1]
        console.log(P1)

        P1Leader = P1[1]
        P2Leader = P2[1]

        console.log(P1Leader)

    });
    

    let P1 = players
    let P2 = players
    let P1Leader = {name: ""}
    let P2Leader = {name: ""}
    
    
    
    let allcards = []
    
</script>

<main>
    
    <button class="P1leader" on:click={() => {console.log("P1 Leader")}}>
        <img src="{P1Leader.name}.webp" alt="Player 1 Leader">
    </button>

    <button class="P2leader" on:click={() => {console.log("P2 Leader")}}>
        <img src="{P2Leader.name}.webp" alt="Player 2 Leader">
    </button>
</main>

<style>

    /* 0 Global styling for the entire page */
    /* 0-----------------------------------------------------------------------------------0 */
    :global(body), :global(html){
            margin: 0%;
            padding: 0%;
            height: 100vh;
            width: 100vw;
    }

    main {
        
        background-image: url("Board.png");
        background-size: cover;
        display: flex;
        position: relative;
        flex-direction: column;
        align-items: center;
        overflow: hidden;
        background-color: #000000ce;
        background-size:cover;
        height: 100vh;
        width: 100vw;
    }
    /* 0-----------------------------------------------------------------------------------0 */




    /* 1 Leader cards styling and positioning */
    /* 1-----------------------------------------------------------------------------------1 */
    .P1leader {
        background-color: transparent;
        border: none;
        cursor: pointer;
        position: absolute;
        top: 82%;
        left: 7.25%;
        width: 5.6%;
        height: 13.5%;
        border-radius: 1vh;
        overflow: hidden;
    }

    .P1leader img {
        width: 100%;
        height: 20vh;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    }

    .P2leader {
        background-color: transparent;
        border: none;
        cursor: pointer;
        position: absolute;
        top: 8%;
        left: 7.25%;
        width: 5.6%;
        height: 13.5%;
        border-radius: 1vh;
        overflow: hidden;
    }

    .P2leader img {
        width: 100%;
        height: 20vh;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    }
    /* 1-----------------------------------------------------------------------------------1 */
</style>