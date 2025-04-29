<script>
    import { onMount } from 'svelte'
    import { players_store } from "$lib/players.js"
    
    onMount(() => {
    
    if($players_store.length > 0){
        players = JSON.parse($players_store)
    }
        P1 = players[0]
        P2 = players[1]
        

        P1Leader = P1[1]
        P1Cards = P1[0]
        P1Hand = P1Cards.sort(() => .5- Math.random()).slice(0, 10)

        while (P1Hand.filter(card => card.type == "special").length != 2){
            P1Hand = P1Cards.sort(() => .5- Math.random()).slice(0, 10)
        }
        P1Hand = P1Hand.sort((a, b) => {return a.value - b.value})
        

        P2Leader = P2[1]
        P2Cards = P2[0]
        P2Hand = P2Cards.sort(() => .5- Math.random()).slice(0, 10)

        while (P2Hand.filter(card => card.type == "special").length != 2){
            P2Hand = P2Cards.sort(() => .5- Math.random()).slice(0, 10)
        }

        P2Hand = P2Hand.sort((a, b) => {return a.value - b.value})

    });

    let turn = 1
    
    let players = []

    let P1 = players
    let P1Leader = {name: "Ballista1"}
    let P1Cards = {name: "Ballista2"}
    let P1Hand = []


    let P2 = players
    let P2Leader = {name: "Ballista1"}
    let P2Cards = {name: "Ballista2"}
    let P2Hand = []

    let meleeP1 = []
    let meleeP2 = []

    let rangeP1 = []
    let rangeP2 = []

    let siegeP1 = []
    let siegeP2 = []

    let weather = []

    /*Card Placing Logic*/
    /* 0-----------------------------------------------------------------------------------0 */
    function placeCard(a) {

        if (turn % 2 != 0) {
            P1Hand = P1Hand.filter(card => card.name !== a.name)
            if (a.type == "unit" || a.type == "hero") {
                if(a.ability == "none"){
                    if (a.row == "melee") {
                        meleeP1.push(a)
                        meleeP1 = meleeP1
                        setTimeout(() => {turn++}, 3000)

                    } else if (a.row == "range") {
                        rangeP1.push(a)
                        rangeP1 = rangeP1
                        setTimeout(() => {turn++}, 3000)

                    } else if (a.row == "siege") {
                        siegeP1.push(a)
                        siegeP1 = siegeP1
                        setTimeout(() => {turn++}, 3000)
                    }
                }

                if(a.ability == "spy"){
                    if (a.row == "melee") {
                        meleeP2.push(a)
                        meleeP2 = meleeP2

                        setTimeout(() => {turn++}, 3000)

                    } else if (a.row == "range") {
                        rangeP2.push(a)
                        rangeP2 = rangeP2
                        setTimeout(() => {turn++}, 3000)

                    } else if (a.row == "siege") {
                        siegeP2.push(a)
                        siegeP2 = siegeP2
                        setTimeout(() => {turn++}, 3000)
                    }
                }

                if(a.ability == "tight_bond"){
                    if (a.row == "melee") {
                        meleeP1.push(a)
                        meleeP1 = meleeP1
                        setTimeout(() => {turn++}, 3000)

                    } else if (a.row == "range") {
                        rangeP1.push(a)
                        rangeP1 = rangeP1
                        setTimeout(() => {turn++}, 3000)

                    } else if (a.row == "siege") {
                        siegeP1.push(a)
                        siegeP1 = siegeP1
                        setTimeout(() => {turn++}, 3000)
                    }
                }

                if(a.ability == "medic"){
                    if (a.row == "melee") {
                        meleeP1.push(a)
                        meleeP1 = meleeP1
                        setTimeout(() => {turn++}, 3000)

                    } else if (a.row == "range") {
                        rangeP1.push(a)
                        rangeP1 = rangeP1
                        setTimeout(() => {turn++}, 3000)

                    } else if (a.row == "siege") {
                        siegeP1.push(a)
                        siegeP1 = siegeP1
                        setTimeout(() => {turn++}, 3000)
                    }
                }

                if(a.ability == "muster"){
                    if (a.row == "melee") {
                        meleeP1.push(a)
                        meleeP1 = meleeP1
                        setTimeout(() => {turn++}, 3000)

                    } else if (a.row == "range") {
                        rangeP1.push(a)
                        rangeP1 = rangeP1
                        setTimeout(() => {turn++}, 3000)

                    } else if (a.row == "siege") {
                        siegeP1.push(a)
                        siegeP1 = siegeP1
                        setTimeout(() => {turn++}, 3000)
                    }
                }
                
            } else if (a.type == "weather") {
                weather.push(a)
            }

        } else if (turn % 2 == 0) {
            P2Hand = P2Hand.filter(card => card.name !== a.name)
            if (a.type == "unit" || a.type == "hero") {
                if (a.row == "melee") {
                    meleeP2.push(a)
                    meleeP2 = meleeP2
                    setTimeout(() => {turn++}, 5000)
                } else if (a.row == "range") {
                    rangeP2.push(a)
                    rangeP2 = rangeP2
                    setTimeout(() => {turn++}, 5000)
                } else if (a.row == "siege") {
                    siegeP2.push(a)
                    siegeP2 = siegeP2
                    setTimeout(() => {turn++}, 5000)
                }
            } else if (a.type == "weather") {
                weather.push(a)
            }
        }
    }


    
    
    
    
    
</script>

<main>
    
    <button class="P1leader" on:click={() => {console.log("P1 Leader")}}>
        <img src="{P1Leader.name}.webp" alt="Player 1 Leader">
    </button>

    <button class="P2leader" on:click={() => {console.log("P2 Leader")}}>
        <img src="{P2Leader.name}.webp" alt="Player 2 Leader">
    </button>

    <div class="HeldCards">
        {#if turn % 2 != 0}
                
            {#each P1Hand as card}
                {#if card.type == "unit"}
                    <button class="card" on:click={() => {placeCard(card)}} style="padding-left:0.2vw; padding-top:0.2vw;">
                    <img src="{card.name}.webp" alt="Player 1 Card">
                    <p class="unit_value">{card.value}</p>
                    </button>       
                {/if} 

                {#if card.type == "hero"}
                    <button class="card" on:click={() => {placeCard(card)}}>
                    <img src="{card.name}.webp" alt="Player 1 Card">
                    </button>
                {/if}

                {#if card.type == "special"}
                    <button class="card" on:click={() => {placeCard(card)}} style="padding-left:0.2vw; padding-top:0.2vw;">
                    <img src="{card.name}.webp" alt="Player 1 Card">
                    </button>
                {/if}
            {/each}
        {/if}

        {#if turn % 2 == 0}
                
            {#each P2Hand as card}
                {#if card.type == "unit"}
                    <button class="card" on:click={() => {placeCard(card)}} style="padding-left:0.2vw; padding-top:0.2vw;">
                    <img src="{card.name}.webp" alt="Player 2 Card">
                    <p class="unit_value">{card.value}</p>
                    </button>       
                {/if} 

                {#if card.type == "hero"}
                    <button class="card" on:click={() => {placeCard(card)}}>
                    <img src="{card.name}.webp" alt="Player 2 Card">
                    </button>
                {/if}

                {#if card.type == "special"}
                    <button class="card" on:click={() => {placeCard(card)}} style="padding-left:0.2vw; padding-top:0.2vw;">
                    <img src="{card.name}.webp" alt="Player 2 Card">
                    </button>
                {/if}
            {/each}
        {/if}


    </div>

    <section class="Board-top">
        {#if turn % 2 == 0}
            <div class="melee" style="top: 68%;">

                <div class="melee-special">

                </div>
                <div class="melee-units">
                    {#each meleeP1 as card}
                        <button class="card" on:click={() => {}} style="padding-left:0.2vw; padding-top:0.2vw;">
                            <img src="{card.name}.webp" alt="Player 1 Card">
                            {#if card.type == "unit"}
                                <p class="unit_value">{card.value}</p>
                            {/if}
                        </button>
                    {/each}
                </div>
            </div>

            <div class="range">
                <div class="range-special">

                </div>
                <div class="range-units">
                    {#each rangeP1 as card}
                        <button class="card" on:click={() => {}} style="padding-left:0.2vw; padding-top:0.2vw;">
                            <img src="{card.name}.webp" alt="Player 1 Card">
                            {#if card.type == "unit"}
                                <p class="unit_value">{card.value}</p>
                            {/if}
                        </button>
                    {/each}
                </div>
            </div>

            <div class="siege" style="top:2%;">
                <div class="siege-special">

                </div>
                <div class="siege-units">
                    {#each siegeP1 as card}
                        <button class="card" on:click={() => {}} style="padding-left:0.2vw; padding-top:0.2vw;">
                            <img src="{card.name}.webp" alt="Player 1 Card">
                            {#if card.type == "unit"}
                                <p class="unit_value">{card.value}</p>
                            {/if}
                        </button>
                    {/each}
                </div>
            </div>
        {/if}



        {#if turn % 2 != 0}
            <div class="melee" style="top: 68%;">

                <div class="melee-special">

                </div>
                <div class="melee-units">
                    {#each meleeP2 as card}
                        <button class="card" on:click={() => {}} style="padding-left:0.2vw; padding-top:0.2vw;">
                            <img src="{card.name}.webp" alt="Player 2 Card">
                            {#if card.type == "unit"}
                                <p class="unit_value">{card.value}</p>
                            {/if}
                        </button>
                    {/each}
                </div>
            </div>

            <div class="range">
                <div class="range-special">

                </div>
                <div class="range-units">
                    {#each rangeP2 as card}
                        <button class="card" on:click={() => {}} style="padding-left:0.2vw; padding-top:0.2vw;">
                            <img src="{card.name}.webp" alt="Player 2 Card">
                            {#if card.type == "unit"}
                                <p class="unit_value">{card.value}</p>
                            {/if}
                        </button>
                    {/each}
                </div>
            </div>

            <div class="siege" style="top:2%;">
                <div class="siege-special">

                </div>
                <div class="siege-units">
                    {#each siegeP2 as card}
                        <button class="card" on:click={() => {}} style="padding-left:0.2vw; padding-top:0.2vw;">
                            <img src="{card.name}.webp" alt="Player 2 Card">
                            {#if card.type == "unit"}
                                <p class="unit_value">{card.value}</p>
                            {/if}
                        </button>
                    {/each}
                </div>
            </div>
        {/if}
    </section>

    <section class="Board-bottom">
        {#if turn % 2 != 0}
            <div class="melee">

                <div class="melee-special">

                </div>
                <div class="melee-units">
                    {#each meleeP1 as card}
                        <button class="card" on:click={() => {}} style="padding-left:0.2vw; padding-top:0.2vw;">
                            <img src="{card.name}.webp" alt="Player 1 Card">
                            {#if card.type == "unit"}
                                <p class="unit_value">{card.value}</p>
                            {/if}
                        </button>
                    {/each}
                </div>
            </div>

            <div class="range">
                <div class="range-special">

                </div>
                <div class="range-units">
                    {#each rangeP1 as card}
                        <button class="card" on:click={() => {}} style="padding-left:0.2vw; padding-top:0.2vw;">
                            <img src="{card.name}.webp" alt="Player 1 Card">
                            {#if card.type == "unit"}
                                <p class="unit_value">{card.value}</p>
                            {/if}
                        </button>
                    {/each}
                </div>
            </div>

            <div class="siege">
                <div class="siege-special">

                </div>
                <div class="siege-units">
                    {#each siegeP1 as card}
                        <button class="card" on:click={() => {}} style="padding-left:0.2vw; padding-top:0.2vw;">
                            <img src="{card.name}.webp" alt="Player 1 Card">
                            {#if card.type == "unit"}
                                <p class="unit_value">{card.value}</p>
                            {/if}
                        </button>
                    {/each}
                </div>
            </div>
        {/if}



        {#if turn % 2 == 0}
            <div class="melee">

                <div class="melee-special">

                </div>
                <div class="melee-units">
                    {#each meleeP2 as card}
                        <button class="card" on:click={() => {}} style="padding-left:0.2vw; padding-top:0.2vw;">
                            <img src="{card.name}.webp" alt="Player 2 Card">
                            {#if card.type == "unit"}
                                <p class="unit_value">{card.value}</p>
                            {/if}
                        </button>
                    {/each}
                </div>
            </div>

            <div class="range">
                <div class="range-special">

                </div>
                <div class="range-units">
                    {#each rangeP2 as card}
                        <button class="card" on:click={() => {}} style="padding-left:0.2vw; padding-top:0.2vw;">
                            <img src="{card.name}.webp" alt="Player 2 Card">
                            {#if card.type == "unit"}
                                <p class="unit_value">{card.value}</p>
                            {/if}
                        </button>
                    {/each}
                </div>
            </div>

            <div class="siege">
                <div class="siege-special">

                </div>
                <div class="siege-units">
                    {#each siegeP2 as card}
                        <button class="card" on:click={() => {}} style="padding-left:0.2vw; padding-top:0.2vw;">
                            <img src="{card.name}.webp" alt="Player 2 Card">
                            {#if card.type == "unit"}
                                <p class="unit_value">{card.value}</p>
                            {/if}
                        </button>
                    {/each}
                </div>
            </div>
        {/if}
            
        
    </section>
        
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
        top: 79.75%;
        left: 7.13%;
        width: 5.4%;
        height: 13%;
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
        top: 7.3%;
        left: 7.13%;
        width: 5.4%;
        height: 13%;
        overflow: hidden;
    }

    .P2leader img {
        width: 100%;
        height: 20vh;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    }
    /* 1-----------------------------------------------------------------------------------1 */




    /* 2 Held cards styling and positioning */
    /* 2-----------------------------------------------------------------------------------2 */
    .HeldCards {
        position: absolute;
        top: 80%;
        left: 29.75%;
        display: flex;
        flex-wrap: nowrap;
        justify-content: center;
        align-items: center;
        width: 49.45%;
        height: 13%;
    }
    .card{
        position: relative;
        background: none;
        border: none;
        width: 5vw;
        min-width: 5vw;
        height: 11.7vh;
        margin-left: 0.5%;
        overflow: hidden;
    }
    .unit_value{
        position: absolute;
        font: 500 0.8em 'Roboto', sans-serif;
        top: 7%;
        left: 13%;
        z-index: 1;
        color: black;
    }
    .card img {
        width: 100%;
        height: 16vh;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    }
    .card:hover{
        box-shadow: #ff9100 0 0 1vh;
        transform: scale(1.025);
        transition: all 0.2s ease-in-out;
    }
    .card:active{
        box-shadow: #ff9100 0 0 0.5vh;
        transform: scale(1.01);
        transition: all 0.2s ease-in-out;
    }
    /* 2-----------------------------------------------------------------------------------2 */




    /* 3 Board setup */
    /* 3-----------------------------------------------------------------------------------3 */
    .Board-top {
        position: absolute;
        top: 1%;
        left: 26.1%;
        width: 53.2%;
        height: 39%;
        background-color: #0000004e;
        
    }
    .Board-bottom {
        position: absolute;
        top: 40.5%;
        left: 26.1%;
        width: 53.2%;
        height: 39%;
        background-color: #0000005e;
    }
    /* Melee row */
    .melee {
        position: absolute;
        top: 2%;
        width: 100%;
        height: 31%;
        background-color: #d606062a;
    }
    .melee-special {
        position: absolute;
        top: 5%;
        left: 7%;
        width: 12.5%;
        height: 92%;
        background-color: #d6b0062a;
    }
    .melee-units {
        position: absolute;
        top: 5%;
        left: 20.2%;
        width: 79.5%;
        height: 92%;
        background-color: #d6b0062a;
        display: flex;
        flex-wrap: nowrap;
        justify-content: center;
        align-items: center;
    }
    /* Ranged row */
    .range {
        position: absolute;
        top: 35%;
        width: 100%;
        height: 31%;
        background-color: #d606062a;
    }
    .range-special {
        position: absolute;
        top: 5%;
        left: 7%;
        width: 12.5%;
        height: 92%;
        background-color: #d6b0062a;
    }
    .range-units {
        position: absolute;
        top: 5%;
        left: 20.2%;
        width: 79.5%;
        height: 92%;
        background-color: #d6b0062a;
        display: flex;
        flex-wrap: nowrap;
        justify-content: center;
        align-items: center;
    }
    /* Siege row */
    .siege {
        position: absolute;
        top: 68%;
        width: 100%;
        height: 31%;
        background-color: #d606062a;
    }
    .siege-special {
        position: absolute;
        top: 5%;
        left: 7%;
        width: 12.5%;
        height: 92%;
        background-color: #d6b0062a;
    }
    .siege-units {
        position: absolute;
        top: 5%;
        left: 20.2%;
        width: 79.5%;
        height: 92%;
        background-color: #d6b0062a;
        display: flex;
        flex-wrap: nowrap;
        justify-content: center;
        align-items: center;
    }

</style>