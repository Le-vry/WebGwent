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
        P1Hand = P1Cards.slice(0, 10)
        P1Hand = P1Hand.sort((a, b) => {return a.value - b.value})
        P1Cards.forEach(card => {
            P1Hand.forEach(hand => {
                if(card.id == hand.id){
                    P1Cards = P1Cards.filter(cards => cards.id != card.id)
                    P1Cards = P1Cards
                    
                }
            })
        });

        P2Leader = P2[1]
        P2Cards = P2[0]
        P2Cards.sort(() => .5- Math.random())
        P2Hand = P2Cards.slice(0, 10)
        P2Hand = P2Hand.sort((a, b) => {return a.value - b.value})
        P2Cards.forEach(card => {
            P2Hand.forEach(hand => {
                if(card.id == hand.id){
                    P2Cards = P2Cards.filter(cards => cards.id != card.id)
                    P2Cards = P2Cards
                }
            })
        })
    })
    


    let turn = 0.5
    let placedCard = false
    let passedTurn = false
    let popupvisability = "block"
    let players = []



    /* P2 variables */
    let P1 = players
    let P1Leader = {name: "Ballista1"}
    let P1Cards = [{name: "Ballista2"}]
    
    let P1Hand = []

    let P1TotalValue = 0
    
    let meleeP1 = {value: 0, rowMultiplier: 1, units: []}
    let rangeP1 = {value: 0, rowMultiplier: 1, units: []}
    let siegeP1 = {value: 0, rowMultiplier: 1, units: []}

    let P1Gem1Visability = "show"
    let P1Gem2Visability = "show"

    /* P2 variables*/
    let P2 = players
    let P2Leader = {name: "Ballista1"}
    let P2Cards = [{name: "Ballista2"}]
    let P2Hand = []
    
    let P2TotalValue = 0
    let meleeP2 = {value: 0, rowMultiplier: 1, units: []}
    let rangeP2 = {value: 0, rowMultiplier: 1, units: []}
    let siegeP2 = {value: 0, rowMultiplier: 1, units: []}

    let P2Gem1Visability = "show"
    let P2Gem2Visability = "show"

    let weather = []




    /* 1 Card Placing Logic*/
    /* 1-----------------------------------------------------------------------------------1 */
    function placeCard(card) {
        if (placedCard == false || passedTurn == true) {
            if (placedCard = false && passedTurn == true){
                placedCard = false
            } else {
                placedCard = true
            }
            if (turn % 2 == 1) {
                P1Hand = P1Hand.filter(cards => cards.id !== card.id)
                if (card.type == "unit" || card.type == "hero") {
                    
                    if(card.row == "agile") {
                    } else if(card.row == "melee") {
                            
                        if (card.ability == "spy") {
                            meleeP2.units.push(card)
                            meleeP2.units = meleeP2.units
                            Value(meleeP1)
                            placedSpyCard(card)
                            
                        } else {
                            meleeP1.units.push(card)
                            meleeP1.units = meleeP1.units
                            if(card.ability == "tight_bond"){
                                placedTightBondCard(card, meleeP1.units)
                            } else if(card.ability == "horn"){
                                placedHornCard(meleeP1)
                            } else if(card.ability == "medic"){
                                placedMedicCard(card, meleeP1.units)
                            } else if(card.ability == "muster"){
                                placedMusterCard(card, meleeP1.units)
                            } else if(card.ability == "morale_boost"){
                                placedMoraleBoostCard(card, meleeP1.units, meleeP2.units)
                            } else if(card.ability == "scorch"){
                                placedScorchCard(meleeP2)
                                meleeP2.units = meleeP2.units
                            }
                            Value(meleeP1)
                            
                        }
                    } else if(card.row == "range") {
                        if (card.ability == "spy") {
                            rangeP2.units.push(card)
                            rangeP2.units = rangeP2.units
                            Value(rangeP1)
                            placedSpyCard(card)
                            
                        } else {
                            rangeP1.units.push(card)
                            rangeP1.units = rangeP1.units
                            if(card.ability == "tight_bond"){
                                placedTightBondCard(card, rangeP1.units)
                            } else if(card.ability == "horn"){
                                placedHornCard(rangeP1)
                            } else if(card.ability == "medic"){
                                placedMedicCard(card, rangeP1.units)
                            } else if(card.ability == "muster"){
                                placedMusterCard(card, rangeP1.units)
                            } else if(card.ability == "morale_boost"){
                                placedMoraleBoostCard(card, rangeP1.units)
                            } else if(card.ability == "scorch"){
                                placedScorchCard(rangeP2)
                                rangeP2.units = rangeP2.units
                            }
                            Value(rangeP1)
                            
                        }
                    } else if(card.row == "siege") {
                        if (card.ability == "spy") {
                            siegeP2.units.push(card)
                            siegeP2.units = siegeP2.units
                            Value(siegeP1)
                            placedSpyCard(card)
                            
                        } else {
                            siegeP1.units.push(card)
                            siegeP1.units = siegeP1.units
                            if(card.ability == "tight_bond"){
                                placedTightBondCard(card, siegeP1.units)
                            } else if(card.ability == "horn"){
                                placedHornCard(siegeP1)
                            } else if(card.ability == "medic"){
                                placedMedicCard(card, siegeP1.units)
                            } else if(card.ability == "muster"){
                                placedMusterCard(card, siegeP1.units)
                            } else if(card.ability == "morale_boost"){
                                placedMoraleBoostCard(card, siegeP1.units)
                            } else if(card.ability == "scorch"){
                                placedScorchCard(siegeP2)
                                siegeP2.units = siegeP2.units
                            }
                            Value(siegeP1)
                            
                        }
                    }            
                }                

            } else if (turn % 2 == 0) {
                P2Hand = P2Hand.filter(cards => cards.id !== card.id)
                if (card.type == "unit" || card.type == "hero") {
                    if(card.row == "agile") {
                    } else if(card.row == "melee") {
                            
                        if (card.ability == "spy") {
                            meleeP1.units.push(card)
                            meleeP1.units = meleeP1.units
                            Value(meleeP2)
                            placedSpyCard(card)
                            
                        } else {
                            meleeP2.units.push(card)
                            meleeP2.units = meleeP2.units
                            if(card.ability == "tight_bond"){
                                placedTightBondCard(card, meleeP2.units)
                            } else if(card.ability == "horn"){
                                placedHornCard(meleeP2)
                            } else if(card.ability == "medic"){
                                placedMedicCard(card, meleeP2.units)
                            } else if(card.ability == "muster"){
                                placedMusterCard(card, meleeP2.units)
                            } else if(card.ability == "morale_boost"){
                                placedMoraleBoostCard(card, meleeP2.units)
                            } else if(card.ability == "scorch"){
                                placedScorchCard(meleeP1)
                                meleeP1.units = meleeP1.units
                            }
                            Value(meleeP2)
                            
                        }
                    } else if(card.row == "range") {
                        if (card.ability == "spy") {
                            rangeP1.units.push(card)
                            rangeP1.units = rangeP1.units
                            Value(rangeP2)
                            placedSpyCard(card)
                            
                        } else {
                            rangeP2.units.push(card)
                            rangeP2.units = rangeP2.units
                            if(card.ability == "tight_bond"){
                                placedTightBondCard(card, rangeP2.units)
                            } else if(card.ability == "horn"){
                                placedHornCard(rangeP2)
                            } else if(card.ability == "medic"){
                                placedMedicCard(card, rangeP2.units)
                            } else if(card.ability == "muster"){
                                placedMusterCard(card, rangeP2.units)
                            } else if(card.ability == "morale_boost"){
                                placedMoraleBoostCard(card, rangeP2.units)
                            } else if(card.ability == "scorch"){
                                placedScorchCard(rangeP1)
                                rangeP1.units = rangeP1.units
                            }
                            Value(rangeP2)
                            
                        }
                    } else if(card.row == "siege") {
                        if (card.ability == "spy") {
                            siegeP1.units.push(card)
                            siegeP1.units = siegeP1.units
                            Value(siegeP2)
                            placedSpyCard(card)
                            
                        } else {
                            siegeP2.units.push(card)
                            siegeP2.units = siegeP2.units
                            if(card.ability == "tight_bond"){
                                placedTightBondCard(card, siegeP2.units)
                            } else if(card.ability == "horn"){
                                placedHornCard(siegeP2)
                            } else if(card.ability == "medic"){
                                placedMedicCard(card, siegeP2.units)
                            } else if(card.ability == "muster"){
                                placedMusterCard(card, siegeP2.units)
                            } else if(card.ability == "morale_boost"){
                                placedMoraleBoostCard(card, siegeP2.units)
                            } else if(card.ability == "scorch"){
                                placedScorchCard(siegeP1)
                                siegeP1.units = siegeP1.units
                            }
                            Value(siegeP2)
                            
                        }
                    }
                }
            }
        }
    }

    function placedSpyCard() {
        if(turn % 2 == 1){
            let pulledCards = P1Cards.slice(0, 2)
            P1Hand.push(pulledCards[0])
            P1Hand.push(pulledCards[1])
            P1Cards = P1Cards.filter(cards => cards.id != pulledCards[0].id)
            P1Cards = P1Cards.filter(cards => cards.id != pulledCards[1].id)

            P1Hand = P1Hand
            P1Cards = P1Cards
            console.log(P1Cards)
            P1Hand = P1Hand.sort((a, b) => {return a.value - b.value})
        } else if(turn % 2 == 0){
            let pulledCards = P2Cards.slice(0, 2)
            P2Hand.push(pulledCards[0])
            P2Hand.push(pulledCards[1])
            P2Cards = P2Cards.filter(cards => cards.id != pulledCards[0].id)
            P2Cards = P2Cards.filter(cards => cards.id != pulledCards[1].id)
            
            P2Hand = P2Hand
            P2Cards = P2Cards
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
        if(turn % 2 == 1){
            
            if (placedCard.M_ID.endsWith("1")){
                
                placedCard.M_ID = placedCard.M_ID.slice(0, placedCard.M_ID.length - 1)

                let rememberhand = P1Hand.filter(cards => cards.M_ID == placedCard.M_ID)
                let rememberCards = P1Cards.filter(cards => cards.M_ID == placedCard.M_ID)
                P1Hand = P1Hand.filter(cards => cards.M_ID != placedCard.M_ID)
                P1Cards = P1Cards.filter(cards => cards.M_ID != placedCard.M_ID)
                rememberhand.forEach(card => {
                    if (card.row == "melee") {
                        meleeP1.units.push(card)
                        meleeP1.units = meleeP1.units
                        Value(meleeP1)

                    } else if (card.row == "range") {
                        rangeP1.units.push(card)
                        rangeP1.units = rangeP1.units
                        Value(rangeP1)

                    } else if (card.row == "siege") {
                        siegeP1.units.push(card)
                        siegeP1.units = siegeP1.units
                        Value(siegeP1)
                        
                    }
                })
                rememberCards.forEach(card => {
                    if (card.row == "melee") {
                        meleeP1.units.push(card)
                        meleeP1.units = meleeP1.units
                        Value(meleeP1)

                    } else if (card.row == "range") {
                        rangeP1.units.push(card)
                        rangeP1.units = rangeP1.units
                        Value(rangeP1)

                    } else if (card.row == "siege") {
                        siegeP1.units.push(card)
                        siegeP1.units = siegeP1.units
                        Value(siegeP1)
                        
                    }
                })
            } else {
                let rememberhand = P1Hand.filter(cards => cards.M_ID == placedCard.M_ID)
                let rememberCards = P1Cards.filter(cards => cards.M_ID == placedCard.M_ID)
                P1Hand = P1Hand.filter(cards => cards.M_ID != placedCard.M_ID)
                P1Cards = P1Cards.filter(cards => cards.M_ID != placedCard.M_ID)
                rememberhand.forEach(card => {
                    row.push(card)
                    row = row
                })
                rememberCards.forEach(card => {
                    row.push(card)
                    row = row
                })
            }
            
            
        }
        else if(turn % 2 == 0){
            if (placedCard.M_ID.endsWith("1")){
                
                placedCard.M_ID = placedCard.M_ID.slice(0, placedCard.M_ID.length - 1)

                let rememberhand = P2Hand.filter(cards => cards.M_ID == placedCard.M_ID)
                let rememberCards = P2Cards.filter(cards => cards.M_ID == placedCard.M_ID)
                P2Hand = P2Hand.filter(cards => cards.M_ID != placedCard.M_ID)

                rememberhand.forEach(card => {
                    if (card.row == "melee") {
                        meleeP2.units.push(card)
                        meleeP2.units = meleeP2.units
                        Value(meleeP2)

                    } else if (card.row == "range") {
                        rangeP2.units.push(card)
                        rangeP2.units = rangeP2.units
                        Value(rangeP2)

                    } else if (card.row == "siege") {
                        siegeP2.units.push(card)
                        siegeP2.units = siegeP2.units
                        Value(siegeP2)
                        
                    }
                })
                rememberCards.forEach(card => {
                    if (card.row == "melee") {
                        meleeP2.units.push(card)
                        meleeP2.units = meleeP2.units
                        Value(meleeP2)

                    } else if (card.row == "range") {
                        rangeP2.units.push(card)
                        rangeP2.units = rangeP2.units
                        Value(rangeP2)

                    } else if (card.row == "siege") {
                        siegeP2.units.push(card)
                        siegeP2.units = siegeP2.units
                        Value(siegeP2)
                        
                    }
                })
            } else {
                let rememberhand = P2Hand.filter(cards => cards.M_ID == placedCard.M_ID)
                let rememberCards = P2Cards.filter(cards => cards.M_ID == placedCard.M_ID)
                P2Hand = P2Hand.filter(cards => cards.M_ID != placedCard.M_ID)
                rememberhand.forEach(card => {
                    row.push(card)
                    row = row
                })
                rememberCards.forEach(card => {
                    row.push(card)
                    row = row
                })
            }
        }
    }

    function placedMoraleBoostCard(placedCard, row) {
        row.forEach(card => {
            if(card.id != placedCard.id){
                card.value += 1
            }
        })
    }

    function placedScorchCard(enemyRow) {
        if (enemyRow.value >= 10){
            let maxValue = 0
            enemyRow.units.forEach(card => {
                if(card.type == "unit"){
                    if (card.value * card.ValueMultiplier * enemyRow.rowMultiplier > maxValue){
                        maxValue = card.value * card.ValueMultiplier * enemyRow.rowMultiplier
                    }
                }
            })
            enemyRow.units.forEach(card => {
                if(card.type == "unit"){
                    if (card.value * card.ValueMultiplier * enemyRow.rowMultiplier == maxValue){
                        enemyRow.units = enemyRow.units.filter(cards => cards.id != card.id)
                        enemyRow.units = enemyRow.units
                    }
                }
            })
            enemyRow.units = enemyRow.units
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
        if(turn % 2 == 1){
            P1TotalValue = 0
            P1TotalValue += meleeP1.value + rangeP1.value + siegeP1.value
        } else if(turn % 2 == 0){
            P2TotalValue = 0
            P2TotalValue += meleeP2.value + rangeP2.value + siegeP2.value
        }     
    }
    /* 1-----------------------------------------------------------------------------------1 */




    /* Turn handeling */
    /* ----------------------------------------------------------------------------------- */
    function onKeyDown(e) {
        if (e.key === "Enter") {
            endTurn()
        }
        if (e.key === "Tab"){
            
            if (passedTurn == true){

            } else {
                passedTurn = true 
                endTurn()
            }
           
        }
    }
    

    function endTurn() {
        turn += 0.5
        if(popupvisability == "block"){
            popupvisability = "none"
        } else if(popupvisability == "none"){
            popupvisability = "block"
        }
        placedCard = false
        
    }
    /* ----------------------------------------------------------------------------------- */
</script>

<svelte:window on:keydown|preventDefault={onKeyDown} />

<main>
    {#if turn % 2 == 1}
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
        {#if turn % 2 == 1}
                
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
                <div class="melee-units no-scrollbar">
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
                <div class="range-units no-scrollbar">
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
                <div class="siege-units no-scrollbar">
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



        {#if turn % 2 == 1}
            <div class="totalvalue">{P2TotalValue}</div>
            
            <div class="melee" style="top: 67%;">

                <div class="melee-value" style="top:35%;">{meleeP2.value}</div>

                <div class="melee-special">

                </div>
                <div class="melee-units no-scrollbar">
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
                <div class="range-units no-scrollbar">
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
                <div class="siege-units no-scrollbar">
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
        {#if turn % 2 == 1}
            <div class="totalvalue" style="top:72.3%;">{P1TotalValue}</div>

            <div class="melee">

                <div class="melee-value">{meleeP1.value}</div>

                <div class="melee-special">

                </div>
                <div class="melee-units no-scrollbar">
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
                <div class="range-units no-scrollbar">
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
                <div class="siege-units no-scrollbar">
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
                <div class="melee-units no-scrollbar">
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
                <div class="range-units no-scrollbar">
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
                <div class="siege-units no-scrollbar">
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

    <section class="TopPlayerStats">
        {#if turn % 2 == 1}
            <div class="amountofCards" style="display:inline-flex; top: 60%;">
                
                <img src="cards_symbol.png" alt="cardsymbol">
                {P2Hand.length}
                <img src="Gem.png" alt="gem" class="gem" style="margin-left: 0.7vw; visability: {P2Gem1Visability};">
                <img src="Gem.png" alt="gem" class="gem" style="visability: {P2Gem2Visability};">
            </div>
        {/if}
        {#if turn % 2 == 0}
            <div class="amountofCards" style="display:inline-flex; top: 60%;">
                
                <img src="cards_symbol.png" alt="cardsymbol">
                {P1Hand.length}
                <img src="Gem.png" alt="gem" class="gem" style="margin-left: 0.7vw; visability: {P1Gem1Visability};">
                <img src="Gem.png" alt="gem" class="gem" style="visability: {P1Gem2Visability};">
            </div> 
        {/if}
    </section>

    <section class="BottomPlayerStats">
        {#if turn % 2 == 1}
            <div class="amountofCards" style="display:inline-flex;">
                
                <img src="cards_symbol.png" alt="cardsymbol">
                {P1Hand.length}
                <img src="Gem.png" alt="gem" class="gem" style="margin-left: 0.7vw; visability: {P1Gem1Visability};">
                <img src="Gem.png" alt="gem" class="gem" style="visability: {P1Gem2Visability};">
            </div>
        {/if}
        {#if turn % 2 == 0}
            <div class="amountofCards" style="display:inline-flex;">
                
                <img src="cards_symbol.png" alt="cardsymbol">
                {P2Hand.length}
                <img src="Gem.png" alt="gem" class="gem" style="margin-left: 0.7vw; visability: {P2Gem1Visability};">
                <img src="Gem.png" alt="gem" class="gem" style="visability: {P1Gem2Visability};">
            </div> 
        {/if}
    </section>

    <button class="passRound" on:click|preventDefault={() => {passedTurn = true; endTurn()}}>
        <img src="keyboard_tab_icon_outline.png" alt=enter class="enter"> Tab to pass Round
    </button>

    <button class="confirm" on:click|preventDefault={() => endTurn()}>
        <img src="keyboard_enter_outline.png" alt=enter class="enter"> End Turn
    </button>
        
</main>

<aside class="Ready player"> 
    <div class="darken" style="display:{popupvisability};">
        <div class="popup" >
            <h1>Player ready?</h1>
            <button class="confirm" on:click|preventDefault={() => endTurn()} style="right: 46%; bottom: 20%;">
                <img src="keyboard_enter_outline.png" alt=enter class="enter"> Start Turn
            </button>
        </div>

    </div>
</aside>

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

    /* Player stats */
    .TopPlayerStats {
        position: absolute;
        top: 26.5%;
        left: 12.3%;
        width: 11%;
        height: 13%;
        background-color: none;
    }
    .BottomPlayerStats {
        position: absolute;
        top: 64%;
        left: 12.3%;
        width: 11%;
        height: 13%;
        background-color: none;
    }

    .amountofCards {
        position: absolute;
        top: 13%;
        left: 10%;
        width: 70%;
        height: 30%;
        background-color: none;
        justify-content: center;
        align-items: center;
        
        font: 300 3vh 'Roboto', sans-serif;
        color: #e0c760;        
    }

    .amountofCards img{
        width: 4vh; 
        height: 4vh; 
    }
    .gem{
        margin-left: 0.3vw;
    }
    /* 3-----------------------------------------------------------------------------------3 */

    /* 4 Buttons & Popups*/
    /* 4-----------------------------------------------------------------------------------4 */
    .confirm{
        display: inline-flex;
        align-items: center;
        position: absolute;
        bottom: 2vh;
        right: 3.7vw;
        background-color: #0000007a;
        border-radius: 2vh;
        box-shadow: #ff9100 0 0 0.7vh;
        padding: 0.7vh;
    }
    .confirm img{
        width: 3.7vh;
        height: 3.7vh;
    }
    .passRound{
        display: inline-flex;
        align-items: center;
        position: absolute;
        bottom: 37%;
        left: 6.5%;
        background-color: #000000cb;
        border-radius: 1vh;
        box-shadow: #ffaa00 0 0 0.5vh;
        padding: 0.4vh;
    }
    .passRound img{
        width: 3.2vh;
        height: 3.2vh;
    }
    .darken{
        position: absolute;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: #00000095;
        z-index: 1;
    }
    .popup{
        position: absolute;
        top: 24%;
        width: 100vw;
        height: 50vh;
        background-color: #000000bb;
        box-shadow: #ff9100 0 0 0.7vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
    .popup h1{
        font: 600 2.5em 'Roboto', sans-serif;
        color: #f9eabd;
        text-align: center;
    }


</style>