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
        P1Cards.sort(() => .5- Math.random())
        P1Hand = P1Cards.slice(0, P1LostCardsIndex)
        P1Hand = P1Hand.sort((a, b) => {return a.value - b.value})


        P2Leader = P2[1]
        P2Cards = P2[0]
        P2Cards.sort(() => .5- Math.random())
        P2Hand = P2Cards.slice(0, P2LostCardsIndex)
        P2Hand = P2Hand.sort((a, b) => {return a.value - b.value})

        

    });


    let turn = 1
    let players = []

    let test1 = ["1", "2"]
    let test2 = ["3", "4"]

    /* P2 variables */
    let P1 = players
    let P1Leader = {name: "Ballista1"}
    let P1Cards = [{name: "Ballista2"}]
    let P1LostCardsIndex = 10
    let P1Hand = []

    let P1TotalValue = 0
    let meleeP1 = {value: 0, rowMultiplier: 1, units: []}
    let rangeP1 = {value: 0, rowMultiplier: 1, units: []}
    let siegeP1 = {value: 0, rowMultiplier: 1, units: []}


    /* P2 variables*/
    let P2 = players
    let P2Leader = {name: "Ballista1"}
    let P2Cards = [{name: "Ballista2"}]
    let P2LostCardsIndex = 10
    let P2Hand = []
    
    let P2TotalValue = 0
    let meleeP2 = {value: 0, rowMultiplier: 1, units: []}
    let rangeP2 = {value: 0, rowMultiplier: 1, units: []}
    let siegeP2 = {value: 0, rowMultiplier: 1, units: []}

    let weather = []




    /* 0 Player Hand Setup */
    /* 0-----------------------------------------------------------------------------------0 */

    
    /* 0-----------------------------------------------------------------------------------0 */




    /* 1 Card Placing Logic*/
    /* 1-----------------------------------------------------------------------------------1 */
    function placeCard(card) {

        if (turn % 2 != 0) {
            P1Hand = P1Hand.filter(cards => cards.id !== card.id)
            if (card.type == "unit" || card.type == "hero") {
                if(card.ability == "none"){
                    if (card.row == "melee") {
                        meleeP1.units.push(card)
                        meleeP1.units = meleeP1.units
                        Value(meleeP1)
                        setTimeout(() => {turn++}, 3000)

                    } else if (card.row == "range") {
                        rangeP1.units.push(card)
                        rangeP1.units = rangeP1.units
                        Value(rangeP1)
                        setTimeout(() => {turn++}, 3000)

                    } else if (card.row == "siege") {
                        siegeP1.units.push(card)
                        siegeP1.units = siegeP1.units
                        Value(siegeP1)
                        setTimeout(() => {turn++}, 3000)
                    }
                }

                if(card.ability == "spy"){
                    if (card.row == "melee") {
                        meleeP2.units.push(card)
                        meleeP2.units = meleeP2.units
                        Value(meleeP2)
                        placedSpyCard()
                        setTimeout(() => {turn++}, 3000)

                    } else if (card.row == "range") {
                        rangeP2.units.push(card)
                        rangeP2.units = rangeP2.units
                        Value(rangeP2)
                        placedSpyCard()
                        setTimeout(() => {turn++}, 3000)

                    } else if (card.row == "siege") {
                        siegeP2.units.push(card)
                        siegeP2.units = siegeP2.units
                        Value(siegeP2)
                        placedSpyCard()
                        setTimeout(() => {turn++}, 3000)
                    }
                }

                if(card.ability == "tight_bond"){
                    if (card.row == "melee") {
                        
                        meleeP1.units.push(card)
                        meleeP1.units = meleeP1.units
                        placedTightBondCard(card, meleeP1.units)
                        Value(meleeP1)
                        setTimeout(() => {turn++}, 3000)

                    } else if (card.row == "range") {
        
                        rangeP1.units.push(card)
                        rangeP1.units = rangeP1.units
                        placedTightBondCard(card, rangeP1.units)
                        Value(rangeP1)
                        setTimeout(() => {turn++}, 3000)

                    } else if (card.row == "siege") {
                        
                        siegeP1.units.push(card)
                        siegeP1.units = siegeP1.units
                        placedTightBondCard(card, siegeP1.units)
                        Value(siegeP1)
                        setTimeout(() => {turn++}, 3000)
                    }
                }

                if(card.ability == "horn"){
                    if (card.row == "melee") {
                        meleeP1.units.push(card)
                        meleeP1.units = meleeP1.units
                        placedHornCard(meleeP1)
                        Value(meleeP1)
                        setTimeout(() => {turn++}, 3000)

                    } else if (card.row == "range") {
                        rangeP1.units.push(card)
                        rangeP1.units = rangeP1.units
                        placedHornCard(rangeP1)
                        Value(rangeP1)
                        setTimeout(() => {turn++}, 3000)

                    } else if (card.row == "siege") {
                        siegeP1.units.push(card)
                        siegeP1.units = siegeP1.units
                        placedHornCard(siegeP1)
                        Value(siegeP1)
                        setTimeout(() => {turn++}, 3000)
                    }
                }

                if(card.ability == "medic"){
                    if (card.row == "melee") {
                        meleeP1.units.push(card)
                        meleeP1.units = meleeP1.units
                        Value(meleeP1)
                        setTimeout(() => {turn++}, 3000)

                    } else if (card.row == "range") {
                        rangeP1.units.push(card)
                        rangeP1.units = rangeP1.units
                        Value(rangeP1)
                        setTimeout(() => {turn++}, 3000)

                    } else if (card.row == "siege") {
                        siegeP1.units.push(card)
                        siegeP1.units = siegeP1.units
                        Value(siegeP1)
                        setTimeout(() => {turn++}, 3000)
                    }
                }

                if(card.ability == "muster"){
                    if (card.row == "melee") {
                        meleeP1.units.push(card)
                        meleeP1.units = meleeP1.units
                        placedMusterCard(card, meleeP1.units)
                        Value(meleeP1)
                        setTimeout(() => {turn++}, 3000)

                    } else if (card.row == "range") {
                        rangeP1.units.push(card)
                        rangeP1.units = rangeP1.units
                        placedMusterCard(card, rangeP1.units)
                        Value(rangeP1)
                        setTimeout(() => {turn++}, 3000)

                    } else if (card.row == "siege") {
                        siegeP1.units.push(card)
                        siegeP1.units = siegeP1.units
                        placedMusterCard(card, siegeP1.units)
                        Value(siegeP1)
                        setTimeout(() => {turn++}, 3000)
                    }
                }

                if(card.ability == "morale_boost"){
                    if (card.row == "melee") {
                        meleeP1.units.push(card)
                        meleeP1.units = meleeP1.units
                        Value(meleeP1)
                        setTimeout(() => {turn++}, 3000)

                    } else if (card.row == "range") {
                        rangeP1.units.push(card)
                        rangeP1.units = rangeP1.units
                        Value(rangeP1)
                        setTimeout(() => {turn++}, 3000)

                    } else if (card.row == "siege") {
                        siegeP1.units.push(card)
                        siegeP1.units = siegeP1.units
                        Value(siegeP1)
                        setTimeout(() => {turn++}, 3000)
                    }
                }

                if(card.ability == "scorch"){
                    if (card.row == "melee") {
                        meleeP1.units.push(card)
                        meleeP1.units = meleeP1.units
                        Value(meleeP1)
                        setTimeout(() => {turn++}, 3000)

                    } else if (card.row == "range") {
                        rangeP1.units.push(card)
                        rangeP1.units = rangeP1.units
                        Value(rangeP1)
                        setTimeout(() => {turn++}, 3000)

                    } else if (card.row == "siege") {
                        siegeP1.units.push(card)
                        siegeP1.units = siegeP1.units
                        Value(siegeP1)
                        setTimeout(() => {turn++}, 3000)
                    }
                }
            }
                

        } else if (turn % 2 == 0) {
            P2Hand = P2Hand.filter(cards => cards.id !== card.id)
            if (card.type == "unit" || card.type == "hero") {
                if(card.ability == "none"){
                    if (card.row == "melee") {
                        meleeP2.units.push(card)
                        meleeP2.units = meleeP2.units
                        Value(meleeP2)
                        setTimeout(() => {turn++}, 3000)

                    } else if (card.row == "range") {
                        rangeP2.units.push(card)
                        rangeP2.units = rangeP2.units
                        Value(rangeP2)
                        setTimeout(() => {turn++}, 3000)

                    } else if (card.row == "siege") {
                        siegeP2.units.push(card)
                        siegeP2.units = siegeP2.units
                        Value(siegeP2)
                        setTimeout(() => {turn++}, 3000)
                    }
                }

                if(card.ability == "spy"){
                    if (card.row == "melee") {
                        meleeP1.units.push(card)
                        meleeP1.units = meleeP1.units
                        Value(meleeP1)
                        placedSpyCard()
                        setTimeout(() => {turn++}, 3000)

                    } else if (card.row == "range") {
                        rangeP1.units.push(card)
                        rangeP1.units = rangeP1.units
                        Value(rangeP1)
                        placedSpyCard()
                        setTimeout(() => {turn++}, 3000)

                    } else if (card.row == "siege") {
                        siegeP1.units.push(card)
                        siegeP1.units = siegeP1.units
                        Value(siegeP1)
                        placedSpyCard()
                        setTimeout(() => {turn++}, 3000)
                    }
                }

                if(card.ability == "tight_bond"){
                    if (card.row == "melee") {

                        meleeP2.units.push(card)
                        meleeP2.units = meleeP2.units
                        placedTightBondCard(card, meleeP2.units)
                        Value(meleeP2)
                        setTimeout(() => {turn++}, 3000)

                    } else if (card.row == "range") {

                        rangeP2.units.push(card)
                        rangeP2.units = rangeP2.units
                        placedTightBondCard(card, rangeP2.units)
                        Value(rangeP2)
                        setTimeout(() => {turn++}, 3000)

                    } else if (card.row == "siege") {

                        siegeP2.units.push(card)
                        siegeP2.units = siegeP2.units
                        placedTightBondCard(card, siegeP2.units)
                        Value(siegeP2)
                        setTimeout(() => {turn++}, 3000)
                    }
                }

                if(card.ability == "horn"){
                    if (card.row == "melee") {
                        meleeP2.units.push(card)
                        meleeP2.units = meleeP2.units
                        placedHornCard(meleeP2)
                        Value(meleeP2)
                        setTimeout(() => {turn++}, 3000)

                    } else if (card.row == "range") {
                        rangeP2.units.push(card)
                        rangeP2.units = rangeP2.units
                        placedHornCard(rangeP2)
                        Value(rangeP2)
                        setTimeout(() => {turn++}, 3000)

                    } else if (card.row == "siege") {
                        siegeP2.units.push(card)
                        siegeP2.units = siegeP2.units
                        placedHornCard(siegeP2)
                        Value(siegeP2)
                        setTimeout(() => {turn++}, 3000)
                    }
                }

                if(card.ability == "medic"){
                    if (card.row == "melee") {
                        meleeP2.units.push(card)
                        meleeP2.units = meleeP2.units
                        Value(meleeP2)
                        setTimeout(() => {turn++}, 3000)

                    } else if (card.row == "range") {
                        rangeP2.units.push(card)
                        rangeP2.units = rangeP2.units
                        Value(rangeP2)
                        setTimeout(() => {turn++}, 3000)

                    } else if (card.row == "siege") {
                        siegeP2.units.push(card)
                        siegeP2.units = siegeP2.units
                        Value(siegeP2)
                        setTimeout(() => {turn++}, 3000)
                    }
                }

                if(card.ability == "muster"){
                    if (card.row == "melee") {
                        meleeP2.units.push(card)
                        meleeP2.units = meleeP2.units
                        placedMusterCard(card, meleeP2.units)
                        Value(meleeP2)
                        setTimeout(() => {turn++}, 3000)

                    } else if (card.row == "range") {
                        rangeP2.units.push(card)
                        rangeP2.units = rangeP2.units
                        placedMusterCard(card, rangeP2.units)
                        Value(rangeP2)
                        setTimeout(() => {turn++}, 3000)

                    } else if (card.row == "siege") {
                        siegeP1.units.push(card)
                        siegeP1.units = siegeP1.units
                        placedMusterCard(card, siegeP2.units)
                        Value(siegeP2)
                        setTimeout(() => {turn++}, 3000)
                    }
                }

                if(card.ability == "morale_boost"){
                    if (a.row == "melee") {
                        meleeP2.units.push(card)
                        meleeP2.units = meleeP2.units
                        Value(meleeP2)
                        setTimeout(() => {turn++}, 3000)

                    } else if (card.row == "range") {
                        rangeP2.units.push(card)
                        rangeP2.units = rangeP2.units
                        Value(rangeP2)
                        setTimeout(() => {turn++}, 3000)

                    } else if (card.row == "siege") {
                        siegeP2.units.push(card)
                        siegeP2.units = siegeP2.units
                        Value(siegeP2)
                        setTimeout(() => {turn++}, 3000)
                    }
                }

                if(card.ability == "scorch"){
                    if (card.row == "melee") {
                        meleeP2.units.push(card)
                        meleeP2.units = meleeP2.units
                        Value(meleeP2)
                        setTimeout(() => {turn++}, 3000)

                    } else if (card.row == "range") {
                        rangeP2.units.push(card)
                        rangeP2.units = rangeP2.units
                        Value(rangeP2)
                        setTimeout(() => {turn++}, 3000)

                    } else if (card.row == "siege") {
                        siegeP2.units.push(card)
                        siegeP2.units = siegeP2.units
                        Value(siegeP2)
                        setTimeout(() => {turn++}, 3000)
                    }
                }
            }
        }
    }

    function placedSpyCard() {
        if(turn % 2 != 0){
            P1Hand.push(P1Cards.slice(P1LostCardsIndex, P1LostCardsIndex + 2)[0])
            P1Hand.push(P1Cards.slice(P1LostCardsIndex, P1LostCardsIndex + 2)[1])
            P1Hand = P1Hand
            P1LostCardsIndex += 2
            P1Hand = P1Hand.sort((a, b) => {return a.value - b.value})
        } else if(turn % 2 == 0){
            P2Hand.push(P2Cards.slice(P2LostCardsIndex, P2LostCardsIndex + 2)[0])
            P2Hand.push(P2Cards.slice(P2LostCardsIndex, P2LostCardsIndex + 2)[1])
            P2Hand = P2Hand
            P2LostCardsIndex += 2
            P2Hand = P2Hand.sort((a, b) => {return a.value - b.value})
        }
    }

    function placedTightBondCard(placedCard, row) {
        let multiplier = 0
        row.forEach(card => {
            if(card.TB_ID == placedCard.TB_ID){
                multiplier += 1
            }
        })
        row.forEach(card => {
            if(card.TB_ID == placedCard.TB_ID){
                card.ValueMultiplier = multiplier
            }
        })
    }

    function placedHornCard(row) {
        row.rowMultiplier = 2
        row = row

    }

    function placedMusterCard(placedCard, row) {
        if(turn % 2 != 0){
            let rememberhand = P1Hand.filter(cards => cards.M_ID == placedCard.M_ID)
            let rememberCards = P1Cards.slice(P1LostCardsIndex).filter(cards => cards.M_ID == placedCard.M_ID)
            rememberhand.forEach(card => {
                row.push(card)
                P1Hand = P1Hand.filter(cards => cards.M_ID !== card.M_ID)
                row = row
            })
            rememberCards.forEach(card => {
                row.push(card)
                row = row
            })
            
        }
        else if(turn % 2 == 0){
            let rememberhand = P2Hand.filter(cards => cards.M_ID == placedCard.M_ID)
            let rememberCards = P2Cards.slice(P2LostCardsIndex).filter(cards => cards.M_ID == placedCard.M_ID)
            rememberhand.forEach(card => {
                row.push(card)
                P2Hand = P2Hand.filter(cards => cards.M_ID !== card.M_ID)
                row = row
            })
            rememberCards.forEach(card => {
                row.push(card)
                row = row
            })
        }
    }
    /* 1-----------------------------------------------------------------------------------1 */




    /* 1 Value handeling */
    /* 1-----------------------------------------------------------------------------------1 */
    function Value(row){
        row.value = 0
        row.units.forEach(card => {
            if(card.type == "unit"){
                row.value += card.value * card.ValueMultiplier * row.rowMultiplier
            } else if(card.type == "hero"){
                row.value += card.value
            }
        });
        TotalValue()
    }

    function TotalValue(){
        if(turn % 2 != 0){
            P1TotalValue = 0
            P1TotalValue += meleeP1.value + rangeP1.value + siegeP1.value
        } else if(turn % 2 == 0){
            P2TotalValue = 0
            P2TotalValue += meleeP2.value + rangeP2.value + siegeP2.value
        }     
    }
    /* 1-----------------------------------------------------------------------------------1 */




    /* Keydown event listener */
    /* -----------------------------------------------------------------------------------1 */
    function onKeyDown(e) {
        if (e.key === 'Enter') {
            console.log("Enter key pressed")
        }
    }
    /* ----------------------------------------------------------------------------------- */



    
    
    
    
    
</script>

<svelte:window on:keydown|preventDefault={onKeyDown} />

<main>
    {#if turn % 2 != 0}
        <button class="P1leader" on:click={() => {console.log("P1 Leader")}}>
            <img src="{P1Leader.name}.webp" alt="Player 1 Leader">
        </button>

        <button class="P2leader" on:click={() => {console.log("P2 Leader")}}>
            <img src="{P2Leader.name}.webp" alt="Player 2 Leader">
        </button>
    {/if}

    {#if turn % 2 == 0}
        <button class="P1leader" on:click={() => {console.log("P1 Leader")}}>
            <img src="{P2Leader.name}.webp" alt="Player 1 Leader">
        </button>

        <button class="P2leader" on:click={() => {console.log("P2 Leader")}}>
            <img src="{P1Leader.name}.webp" alt="Player 2 Leader">
        </button>
    {/if}
    

    <div class="HeldCards">
        {#if turn % 2 != 0}
                
            {#each P1Hand as card}
                {#if card.type == "unit"}
                    <button class="card" on:click={() => {placeCard(card)}} style="padding-left:0.2vw; padding-top:0.2vw;">
                    <img src="{card.name}.webp" alt="{card.name}">
                    {#if card.value >= 10}
                        <p class="unit_value" style="left:8.5%;">{card.value * card.ValueMultiplier}</p>
                    {:else}
                        <p class="unit_value">{card.value * card.ValueMultiplier}</p>
                    {/if}
                    </button>       
                {/if} 

                {#if card.type == "hero"}
                    <button class="card" on:click={() => {placeCard(card)}}>
                    <img src="{card.name}.webp" alt="{card.name}">
                    </button>
                {/if}

                {#if card.type == "special"}
                    <button class="card" on:click={() => {placeCard(card)}} style="padding-left:0.2vw; padding-top:0.2vw;">
                    <img src="{card.name}.webp" alt="{card.name}">
                    </button>
                {/if}
            {/each}
        {/if}

        {#if turn % 2 == 0}
                
            {#each P2Hand as card}
                {#if card.type == "unit"}
                    <button class="card" on:click={() => {placeCard(card)}} style="padding-left:0.2vw; padding-top:0.2vw;">
                    <img src="{card.name}.webp" alt="{card.name}">
                    {#if card.value  >= 10}
                        <p class="unit_value" style="left:8.5%;">{card.value * card.ValueMultiplier}</p>
                    {:else}
                        <p class="unit_value">{card.value * card.ValueMultiplier}</p>
                    {/if}
                    </button>       
                {/if} 

                {#if card.type == "hero"}
                    <button class="card" on:click={() => {placeCard(card)}}>
                    <img src="{card.name}.webp" alt="{card.name}">
                    </button>
                {/if}

                {#if card.type == "special"}
                    <button class="card" on:click={() => {placeCard(card)}} style="padding-left:0.2vw; padding-top:0.2vw;">
                    <img src="{card.name}.webp" alt="{card.name}">
                    </button>
                {/if}
            {/each}
        {/if}


    </div>

    <section class="Board-top">
        {#if turn % 2 == 0}
            <div class="totalvalue">{P1TotalValue}</div>

            <div class="melee" style="top: 67%;">

                <div class="melee-value" style="top:35%;">{meleeP1.value}</div>

                <div class="melee-special">

                </div>
                <div class="melee-units">
                    {#each meleeP1.units as card}
                        {#if card.type == "unit"}
                            <button class="card" on:click={() => {placeCard(card)}} style="padding-left:0.2vw; padding-top:0.2vw;">
                            <img src="{card.name}.webp" alt="{card.name}">
                            {#if card.value * card.ValueMultiplier * meleeP1.rowMultiplier >= 10}
                                <p class="unit_value" style="left:8.5%;">{card.value * card.ValueMultiplier * meleeP1.rowMultiplier}</p>
                            {:else}
                                <p class="unit_value">{card.value * card.ValueMultiplier * meleeP1.rowMultiplier}</p>
                            {/if}
                            </button>       
                        {/if} 

                        {#if card.type == "hero"}
                            <button class="card" on:click={() => {placeCard(card)}}>
                            <img src="{card.name}.webp" alt="{card.name}">
                            </button>
                        {/if}
                    {/each}
                </div>
            </div>

            <div class="range">

                <div class="range-value" style="top:32%;">{rangeP1.value}</div>

                <div class="range-special">

                </div>
                <div class="range-units">
                    {#each rangeP1.units as card}
                        {#if card.type == "unit"}
                            <button class="card" on:click={() => {placeCard(card)}} style="padding-left:0.2vw; padding-top:0.2vw;">
                            <img src="{card.name}.webp" alt="{card.name}">
                            {#if card.value * card.ValueMultiplier * rangeP1.rowMultiplier>= 10}
                                <p class="unit_value" style="left:8.5%;">{card.value * card.ValueMultiplier * rangeP1.rowMultiplier}</p>
                            {:else}
                                <p class="unit_value">{card.value * card.ValueMultiplier * rangeP1.rowMultiplier}</p>
                            {/if}
                            </button>       
                        {/if} 

                        {#if card.type == "hero"}
                            <button class="card" on:click={() => {placeCard(card)}}>
                            <img src="{card.name}.webp" alt="{card.name}">
                            </button>
                        {/if}
                    {/each}
                </div>
            </div>

            <div class="siege" style="top:2%;">

                <div class="siege-value">{siegeP1.value}</div>

                <div class="siege-special">

                </div>
                <div class="siege-units">
                    {#each siegeP1.units as card}
                        {#if card.type == "unit"}
                            <button class="card" on:click={() => {placeCard(card)}} style="padding-left:0.2vw; padding-top:0.2vw;">
                            <img src="{card.name}.webp" alt="{card.name}">
                            {#if card.value * card.ValueMultiplier * siegeP1.rowMultiplier >= 10}
                                <p class="unit_value" style="left:8.5%;">{card.value * card.ValueMultiplier * siegeP1.rowMultiplier}</p>
                            {:else}
                                <p class="unit_value">{card.value * card.ValueMultiplier * siegeP1.rowMultiplier}</p>
                            {/if}
                            </button>       
                        {/if} 

                        {#if card.type == "hero"}
                            <button class="card" on:click={() => {placeCard(card)}}>
                            <img src="{card.name}.webp" alt="{card.name}">
                            </button>
                        {/if}
                    {/each}
                </div>
            </div>
        {/if}



        {#if turn % 2 != 0}
            <div class="totalvalue">{P2TotalValue}</div>
            
            <div class="melee" style="top: 67%;">

                <div class="melee-value" style="top:35%;">{meleeP2.value}</div>

                <div class="melee-special">

                </div>
                <div class="melee-units">
                    {#each meleeP2.units as card}
                        {#if card.type == "unit"}
                            <button class="card" on:click={() => {placeCard(card)}} style="padding-left:0.2vw; padding-top:0.2vw;">
                            <img src="{card.name}.webp" alt="{card.name}">
                            {#if card.value * card.ValueMultiplier * meleeP2.rowMultiplier >= 10}
                                <p class="unit_value" style="left:8.5%;">{card.value * card.ValueMultiplier * meleeP2.rowMultiplier}</p>
                            {:else}
                                <p class="unit_value">{card.value * card.ValueMultiplier * meleeP2.rowMultiplier}</p>
                            {/if}
                            </button>       
                        {/if} 

                        {#if card.type == "hero"}
                            <button class="card" on:click={() => {placeCard(card)}}>
                            <img src="{card.name}.webp" alt="{card.name}">
                            </button>
                        {/if}
                    {/each}
                </div>
            </div>

            <div class="range">

                <div class="range-value" style="top:32%;">{rangeP2.value}</div>

                <div class="range-special">

                </div>
                <div class="range-units">
                    {#each rangeP2.units as card}
                        {#if card.type == "unit"}
                            <button class="card" on:click={() => {placeCard(card)}} style="padding-left:0.2vw; padding-top:0.2vw;">
                            <img src="{card.name}.webp" alt="{card.name}">
                            {#if card.value * card.ValueMultiplier * rangeP2.rowMultiplier >= 10}
                                <p class="unit_value" style="left:8.5%;">{card.value * card.ValueMultiplier * rangeP2.rowMultiplier}</p>
                            {:else}
                                <p class="unit_value">{card.value * card.ValueMultiplier * rangeP2.rowMultiplier}</p>
                            {/if}
                            </button>       
                        {/if} 

                        {#if card.type == "hero"}
                            <button class="card" on:click={() => {placeCard(card)}}>
                            <img src="{card.name}.webp" alt="{card.name}">
                            </button>
                        {/if}
                    {/each}
                </div>
            </div>

            <div class="siege" style="top:2%;">

                <div class="siege-value">{siegeP2.value}</div>

                <div class="siege-special">

                </div>
                <div class="siege-units">
                    {#each siegeP2.units as card}
                        {#if card.type == "unit"}
                            <button class="card" on:click={() => {placeCard(card)}} style="padding-left:0.2vw; padding-top:0.2vw;">
                            <img src="{card.name}.webp" alt="{card.name}">
                            {#if card.value * card.ValueMultiplier * siegeP2.rowMultiplier >= 10}
                                <p class="unit_value" style="left:8.5%;">{card.value * card.ValueMultiplier * siegeP2.rowMultiplier}</p>
                            {:else}
                                <p class="unit_value">{card.value * card.ValueMultiplier * siegeP2.rowMultiplier}</p>
                            {/if}
                            </button>       
                        {/if} 

                        {#if card.type == "hero"}
                            <button class="card" on:click={() => {placeCard(card)}}>
                            <img src="{card.name}.webp" alt="{card.name}">
                            </button>
                        {/if}
                    {/each}
                </div>
            </div>
        {/if}


    </section>

    <section class="Board-bottom">
        {#if turn % 2 != 0}
            <div class="totalvalue" style="top:72.3%;">{P1TotalValue}</div>

            <div class="melee">

                <div class="melee-value">{meleeP1.value}</div>

                <div class="melee-special">

                </div>
                <div class="melee-units">
                    {#each meleeP1.units as card}
                        {#if card.type == "unit"}
                            <button class="card" on:click={() => {placeCard(card)}} style="padding-left:0.2vw; padding-top:0.2vw;">
                            <img src="{card.name}.webp" alt="{card.name}">
                            {#if card.value * card.ValueMultiplier * meleeP1.rowMultiplier>= 10}
                                <p class="unit_value" style="left:8.5%;">{card.value * card.ValueMultiplier * meleeP1.rowMultiplier}</p>
                            {:else}
                                <p class="unit_value">{card.value * card.ValueMultiplier * meleeP1.rowMultiplier}</p>
                            {/if}
                            </button>       
                        {/if} 

                        
                        {#if card.type == "hero"}
                            <button class="card" on:click={() => {placeCard(card)}}>
                            <img src="{card.name}.webp" alt="{card.name}">
                            </button>
                        {/if}
                    {/each}
                </div>
            </div>

            <div class="range">

                <div class="range-value">{rangeP1.value}</div>

                <div class="range-special">

                </div>
                <div class="range-units">
                    {#each rangeP1.units as card}
                        {#if card.type == "unit"}
                            <button class="card" on:click={() => {placeCard(card)}} style="padding-left:0.2vw; padding-top:0.2vw;">
                            <img src="{card.name}.webp" alt="{card.name}">
                            {#if card.value * card.ValueMultiplier * rangeP1.rowMultiplier >= 10}
                                <p class="unit_value" style="left:8.5%;">{card.value * card.ValueMultiplier * rangeP1.rowMultiplier}</p>
                            {:else}
                                <p class="unit_value">{card.value * card.ValueMultiplier * rangeP1.rowMultiplier}</p>
                            {/if}
                            </button>       
                        {/if} 

                        {#if card.type == "hero"}
                            <button class="card" on:click={() => {placeCard(card)}}>
                            <img src="{card.name}.webp" alt="{card.name}">
                            </button>
                        {/if}
                    {/each}
                </div>
            </div>

            <div class="siege">

                <div class="siege-value">{siegeP1.value}</div>

                <div class="siege-special">

                </div>
                <div class="siege-units">
                    {#each siegeP1.units as card}
                        {#if card.type == "unit"}
                            <button class="card" on:click={() => {placeCard(card)}} style="padding-left:0.2vw; padding-top:0.2vw;">
                            <img src="{card.name}.webp" alt="{card.name}">
                            {#if card.value * card.ValueMultiplier * siegeP1.rowMultiplier >= 10}
                                <p class="unit_value" style="left:8.5%;">{card.value * card.ValueMultiplier * siegeP1.rowMultiplier}</p>
                            {:else}
                                <p class="unit_value">{card.value * card.ValueMultiplier * siegeP1.rowMultiplier}</p>
                            {/if}
                            </button>       
                        {/if} 

                        {#if card.type == "hero"}
                            <button class="card" on:click={() => {placeCard(card)}}>
                            <img src="{card.name}.webp" alt="{card.name}">
                            </button>
                        {/if}
                    {/each}
                </div>
            </div>
        {/if}



        {#if turn % 2 == 0}
            <div class="totalvalue" style="top:72%;">{P2TotalValue}</div>

            <div class="melee">

                <div class="melee-value">{meleeP2.value}</div>

                <div class="melee-special">

                </div>
                <div class="melee-units">
                    {#each meleeP2.units as card}
                        {#if card.type == "unit"}
                            <button class="card" on:click={() => {placeCard(card)}} style="padding-left:0.2vw; padding-top:0.2vw;">
                            <img src="{card.name}.webp" alt="{card.name}">
                            {#if card.value * card.ValueMultiplier * meleeP2.rowMultiplier >= 10}
                                <p class="unit_value" style="left:8.5%;">{card.value * card.ValueMultiplier * meleeP2.rowMultiplier}</p>
                            {:else}
                                <p class="unit_value">{card.value * card.ValueMultiplier * meleeP2.rowMultiplier}</p>
                            {/if}
                            </button>       
                        {/if} 

                        {#if card.type == "hero"}
                            <button class="card" on:click={() => {placeCard(card)}}>
                            <img src="{card.name}.webp" alt="{card.name}">
                            </button>
                        {/if}
                    {/each}
                </div>
            </div>

            <div class="range">

                <div class="range-value">{rangeP2.value}</div>

                <div class="range-special">

                </div>
                <div class="range-units">
                    {#each rangeP2.units as card}
                        {#if card.type == "unit"}
                            <button class="card" on:click={() => {placeCard(card)}} style="padding-left:0.2vw; padding-top:0.2vw;">
                            <img src="{card.name}.webp" alt="{card.name}">
                            {#if card.value * card.ValueMultiplier * rangeP2.rowMultiplier >= 10}
                                <p class="unit_value" style="left:8.5%;">{card.value * card.ValueMultiplier * rangeP2.rowMultiplier}</p>
                            {:else}
                                <p class="unit_value">{card.value * card.ValueMultiplier * rangeP2.rowMultiplier}</p>
                            {/if}
                            </button>       
                        {/if} 

                        {#if card.type == "hero"}
                            <button class="card" on:click={() => {placeCard(card)}}>
                            <img src="{card.name}.webp" alt="{card.name}">
                            </button>
                        {/if}
                    {/each}
                </div>
            </div>

            <div class="siege">

                <div class="siege-value">{siegeP2.value}</div>

                <div class="siege-special">

                </div>
                <div class="siege-units">
                    {#each siegeP2.units as card}
                        {#if card.type == "unit"}
                            <button class="card" on:click={() => {placeCard(card)}} style="padding-left:0.2vw; padding-top:0.2vw;">
                            <img src="{card.name}.webp" alt="{card.name}">
                            {#if card.value * card.ValueMultiplier * siegeP2.rowMultiplier >= 10}
                                <p class="unit_value" style="left:8.5%;">{card.value * card.ValueMultiplier * siegeP2.rowMultiplier}</p>
                            {:else}
                                <p class="unit_value">{card.value * card.ValueMultiplier * siegeP2.rowMultiplier}</p>
                            {/if}
                            </button>       
                        {/if} 

                        {#if card.type == "hero"}
                            <button class="card" on:click={() => {placeCard(card)}}>
                            <img src="{card.name}.webp" alt="{card.name}">
                            </button>
                        {/if}
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
        font: 500 0.75em 'Roboto', sans-serif;
        top: 7%;
        left: 13.5%;
        z-index: 1;
        color: black;
    }
    .card img {
        width: 100%;
        height: 16vh;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    }

    .card:hover{
        transform: scale(1.025);
        transition: all 0.2s ease-in-out;
    }

    .card:active{
        transform: scale(1.01);
        transition: all 0.2s ease-in-out;
    }
    .card img:hover{
        box-shadow: #ff9100 0 0 1vh;
    }
    .card img:active{
        box-shadow: #ff9100 0 0 0.5vh;
    }
    /* 2-----------------------------------------------------------------------------------2 */




    /* 3 Board setup */
    /* 3-----------------------------------------------------------------------------------3 */
    .Board-top {
        position: absolute;
        left: 26.1%;
        width: 53.2%;
        height: 40%;
        background-color: none;
        
    }
    .Board-bottom {
        position: absolute;
        top: 40.5%;
        left: 26.1%;
        width: 53.2%;
        height: 39%;
        background-color: none;
    }
    .totalvalue {
        position: absolute;
        top: 75%;
        left: -7.3%;
        width: 5.3%;
        
        background-color: none;
        font: 600 1.7em 'Roboto', sans-serif;
        color: #000000;
        text-align: center;
        text-shadow:
                -1.5px -1.5px 2px #ffffff,
                1.5px -1.5px 2px #ffffff,
                -1.5px 1.5px 2px #ffffff,
                1.5px 1.5px 2px #ffffff,
                -2px 0px 2px #ffffff,
                2px 0px 2px #ffffff,
                0px -2px 2px #ffffff,
                0px 2px 2px #ffffff;
    }
    
    /* Melee row */
    .melee {
        position: absolute;
        top: 2%;
        width: 100%;
        height: 31%;
        background-color: none;
    }
    .melee-value {
        position: absolute;
        top: 34%;
        left: 0.8%;
        width: 5.3%;
        
        background-color: none;
        font: 500 1.7em 'Roboto', sans-serif;
        color: #000000;
        text-align: center;
        text-shadow:
                -1.5px -1.5px 2px #ffffff,
                1.5px -1.5px 2px #ffffff,
                -1.5px 1.5px 2px #ffffff,
                1.5px 1.5px 2px #ffffff,
                -2px 0px 2px #ffffff,
                2px 0px 2px #ffffff,
                0px -2px 2px #ffffff,
                0px 2px 2px #ffffff;
        
    }
    .melee-special {
        position: absolute;
        top: 5%;
        left: 7%;
        width: 12.5%;
        height: 92%;
        background-color: none;
    }
    .melee-units {
        position: absolute;
        top: 4%;
        left: 20.2%;
        width: 79.5%;
        height: 92%;
        background-color: none;
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
        background-color: none;
    }
    .range-value {
        position: absolute;
        top: 34%;
        left: 0.8%;
        width: 5.3%;
        
        background-color: none;
        font: 500 1.7em 'Roboto', sans-serif;
        color: #000000;
        text-align: center;
        text-shadow:
                -1.5px -1.5px 2px #ffffff,
                1.5px -1.5px 2px #ffffff,
                -1.5px 1.5px 2px #ffffff,
                1.5px 1.5px 2px #ffffff,
                -2px 0px 2px #ffffff,
                2px 0px 2px #ffffff,
                0px -2px 2px #ffffff,
                0px 2px 2px #ffffff;
        
    }
    .range-special {
        position: absolute;
        top: 4%;
        left: 7%;
        width: 12.5%;
        height: 92%;
        background-color: none;
    }
    .range-units {
        position: absolute;
        top: 4%;
        left: 20.2%;
        width: 79.5%;
        height: 92%;
        background-color: none;
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
        background-color: none;
    }
    .siege-value {
        position: absolute;
        top: 36.25%;
        left: 0.8%;
        width: 5.3%;
        
        background-color: none;
        font: 500 1.7em 'Roboto', sans-serif;
        color: #000000;
        text-align: center;
        text-shadow:
                -1.5px -1.5px 2px #ffffff,
                1.5px -1.5px 2px #ffffff,
                -1.5px 1.5px 2px #ffffff,
                1.5px 1.5px 2px #ffffff,
                -2px 0px 2px #ffffff,
                2px 0px 2px #ffffff,
                0px -2px 2px #ffffff,
                0px 2px 2px #ffffff;
        
    }
    .siege-special {
        position: absolute;
        top: 5%;
        left: 7%;
        width: 12.5%;
        height: 92%;
        background-color: none;
    }
    .siege-units {
        position: absolute;
        top: 5%;
        left: 20.2%;
        width: 79.5%;
        height: 92%;
        background-color: none;
        display: flex;
        flex-wrap: nowrap;
        justify-content: center;
        align-items: center;
    }
    /* 3-----------------------------------------------------------------------------------3 */

</style>