<script>

    let Base_NoRe_Deck = [
        {id: 1, name: "Biting Frost", type: "special", row: "weather", ability: "W1"},
        {id: 2, name: "Biting Frost", type: "special", row: "weather", ability: "W1"},
        {id: 3, name: "Biting Frost", type: "special", row: "weather", ability: "W1"},
        {id: 4, name: "Impenetrable Fog", type: "special", row: "weather", ability: "W2"},
        {id: 5, name: "Impenetrable Fog", type: "special", row: "weather", ability: "W2"},
        {id: 6, name: "Impenetrable Fog", type: "special", row: "weather", ability: "W2"},
        {id: 7, name: "Torrential Rain", type: "special", row: "weather", ability: "W3"},
        {id: 8, name: "Torrential Rain", type: "special", row: "weather", ability: "W3"},
        {id: 9, name: "Torrential Rain", type: "special", row: "weather", ability: "W3"},
        {id: 10, name: "Skellige Storm", type: "special", row: "weather", ability: "W4"},
        {id: 11, name: "Skellige Storm", type: "special", row: "weather", ability: "W4"},
        {id: 12, name: "Skellige Storm", type: "special", row: "weather", ability: "W4"},
        {id: 13, name: "Clear Weather", type: "special", row: "weather", ability: "W5"},
        {id: 14, name: "Clear Weather", type: "special", row: "weather", ability: "W5"},
        {id: 15, name: "Clear Weather", type: "special", row: "weather", ability: "W5"},
        {id: 16, name: "Commander's Horn", type: "special", row: "none", ability: "horn"},
        {id: 17, name: "Commander's Horn", type: "special", row: "none", ability: "horn"},
        {id: 18, name: "Commander's Horn", type: "special", row: "none", ability: "horn"},
        {id: 19, name: "Decoy", type: "special", row: "none", ability: "decoy"},
        {id: 20, name: "Decoy", type: "special", row: "none", ability: "decoy"},
        {id: 21, name: "Decoy", type: "special", row: "none", ability: "decoy"},
        {id: 22, name: "Scorch", type: "special", row: "none", ability: "scorch"},
        {id: 23, name: "Scorch", type: "special", row: "none", ability: "scorch"},
        {id: 24, name: "Scorch", type: "special", row: "none", ability: "scorch"},
        {id: 25, name: "Cirilla Fiona Elen Riannon", type: "hero", row: "melee", value: 15, ability: "muster", M_ID: "Roach1"},
        {id: 26, name: "Geralt of Rivia", type: "hero", row: "melee", value: 15, ability: "muster", M_ID: "Roach1"},
        {id: 27, name: "Yennefer of Vengerberg", type: "hero", row: "melee", value: 7, ability: "medic"},
        {id: 28, name: "Triss Merigold", type: "hero", row: "melee", value: 7, ability: "none"},
        {id: 29, name: "Mysterious Elf", type: "hero", row: "melee", value: 0, ability: "spy"},
        {id: 29, name: "Emiel Regis Rohellec Terzieff", type: "unit", row: "melee", value: 5, ability: "none"},
        {id: 30, name: "Vesemir", type: "unit", row: "melee", value: 6, ability: "none"},
        {id: 31, name: "Villentretenmerth", type: "unit", row: "melee", value: 7, ability: "scorch"},
        {id: 32, name: "Dandelion", type: "unit", row: "melee", value: 2, ability: "horn"},
        {id: 33, name: "Zoltan Chivay", type: "unit", row: "melee", value: 5, ability: "none"},
        {id: 34, name: "Olgierd von Everec", type: "unit", row: "agile", value: 6, ability: "morale_boost"},
        {id: 35, name: "Gaunter O'Dimm", type: "unit", row: "seige", value: 2, ability: "muster", M_ID: "GOD1"},
        {id: 36, name: "Gaunter O'Dimm Darkness", type: "unit", row: "range", value: 4, ability: "muster", M_ID: "GOD"},
        {id: 37, name: "Gaunter O'Dimm Darkness", type: "unit", row: "range", value: 4, ability: "muster", M_ID: "GOD"},
        {id: 38, name: "Gaunter O'Dimm Darkness", type: "unit", row: "range", value: 4, ability: "muster", M_ID: "GOD"},

        {id: 39, name: "Ballista1", type: "unit", row: "siege", value: 6, ability: "none"},
        {id: 40, name: "Ballista2", type: "unit", row: "siege", value: 6, ability: "none"},
        {id: 41, name: "Blue Stripes Commando", type: "unit", row: "melee", value: 4, ability: "tight_Bond"},
        {id: 42, name: "Blue Stripes Commando", type: "unit", row: "melee", value: 4, ability: "tight_Bond"},
        {id: 43, name: "Blue Stripes Commando", type: "unit", row: "melee", value: 4, ability: "tight_Bond"},
        {id: 44, name: "Catapult", type: "unit", row: "siege", value: 8, ability: "tight_bond"},
        {id: 45, name: "Catapult", type: "unit", row: "siege", value: 8, ability: "tight_bond"},
        {id: 46, name: "Crinfrid Reavers Dragon Hunter", type: "unit", row: "range", value: 5, ability: "tight_bond"},
        {id: 47, name: "Crinfrid Reavers Dragon Hunter", type: "unit", row: "range", value: 5, ability: "tight_bond"},
        {id: 48, name: "Crinfrid Reavers Dragon Hunter", type: "unit", row: "range", value: 5, ability: "tight_bond"},
        {id: 49, name: "Dethmold", type: "unit", row: "range", value: 6, ability: "none"},
        {id: 50, name: "Dun Banner Medic", type: "unit", row: "siege", value: 5, ability: "medic"},
        {id: 51, name: "Esterad Thyssen", type: "hero", row: "melee", value: 10, ability: "none"},
        {id: 52, name: "Foltest King of Temeria", type: "leader", ability: "NR1"},
        {id: 53, name: "Foltest Lord Commander of the North", type: "leader", ability: "NR2"},
        {id: 54, name: "Foltest Son of Medell", type: "leader", ability: "NR3"},
        {id: 55, name: "Foltest The Siegemaster", type: "leader", ability: "NR4"},
        {id: 56, name: "Foltest The Steel-Forged", type: "leader", ability: "NR5"},
        {id: 57, name: "John Natalis", type: "hero", row: "melee", value: 10, ability: "none"},
        {id: 58, name: "Kaedwani Siege Expert", type: "unit", row: "siege", value: 1, ability: "morale_boost"},
        {id: 59, name: "Kaedwani Siege Expert", type: "unit", row: "siege", value: 1, ability: "morale_boost"},
        {id: 60, name: "Kaedwani Siege Expert", type: "unit", row: "siege", value: 1, ability: "morale_boost"},
        {id: 61, name: "Keira Metz", type: "unit", row: "range", value: 5, ability: "none"},
        {id: 62, name: "Philippa Eilhart", type: "hero", row: "range", value: 10, ability: "none"},
        {id: 63, name: "Poor Fucking Infantry", type: "unit", row: "melee", value: 1, ability: "tight_bond"},
        {id: 64, name: "Poor Fucking Infantry", type: "unit", row: "melee", value: 1, ability: "tight_bond"},
        {id: 65, name: "Poor Fucking Infantry", type: "unit", row: "melee", value: 1, ability: "tight_bond"},
        {id: 66, name: "Prince Stennis", type: "unit", row: "melee", value: 5, ability: "spy"},
        {id: 67, name: "Redanian Foot Soldier1", type: "unit", row: "melee", value: 1, ability: "none"},
        {id: 68, name: "Redanian Foot Soldier2", type: "unit", row: "melee", value: 1, ability: "none"},
        {id: 69, name: "Sabrina Glevissig", type: "unit", row: "range", value: 4, ability: "none"},
        {id: 70, name: "Sheldon Skaggs", type: "unit", row: "range", value: 4, ability: "none"},
        {id: 71, name: "Siege Tower", type: "unit", row: "siege", value: 6, ability: "none"},
        {id: 72, name: "Siegfried of Denesle", type: "unit", row: "melee", value: 5, ability: "none"},
        {id: 73, name: "Sigismund Dijkstra", type: "unit", row: "melee", value: 4, ability: "spy"},
        {id: 74, name: "Síle de Tansarville", type: "unit", row: "range", value: 5, ability: "none"},
        {id: 75, name: "Thaler", type: "unit", row: "siege", value: 1, ability: "spy"},
        {id: 76, name: "Trebuchet1", type: "unit", row: "siege", value: 6, ability: "none"},
        {id: 77, name: "Trebuchet2", type: "unit", row: "siege", value: 6, ability: "none"},
        {id: 78, name: "Vernon Roche", type: "hero", row: "melee", value: 10, ability: "none"},
        {id: 79, name: "Ves", type: "unit", row: "melee", value: 5, ability: "none"},
        {id: 80, name: "Yarpen Zigrin", type: "unit", row: "melee", value: 2, ability: "none"},
    ]
    let shownLeaders = []
    let shownDeck = Base_NoRe_Deck
    let decks = [{name: "Monsters", ability: "One randomly-chosen Monster Unit Card stays on the battlefield after each round"},
                {name: "Nilfgaardian Empire", ability: "Win whenever there is a draw"},
                {name: "Northern Realms", ability: "Draw a card from your deck whenever you win a round"},
                {name: "Scoia' tael", ability: "You decide who goes first at the start of a battle"},
                {name: "Skellige", ability: "2 random cards are placed back on the battlefield at the start of the third round"}]
    let selected = 2
    let selected_faction = decks[selected]

    let player = "P1"
    let selected_deck = []
    let P1_selected_Deck = []
    let P2_selected_Deck = []

    let color1
    let color2 
    let color3
    let color4
    let color5 


    function selectFaction () {
        if(selected == 0){
            color1 = "#ffe100"
            color2 = "#464030"
            color3 = "#464030"
            color4 = "#464030"
            color5 = "#464030"
        } else if (selected == 1){
            color1 = "#464030"
            color2 = "#ffe100"
            color3 = "#464030"
            color4 = "#464030"
            color5 = "#464030"
        } else if (selected == 2){
            color1 = "#464030"
            color2 = "#464030"
            color3 = "#ffe100"
            color4 = "#464030"
            color5 = "#464030"
        } else if (selected == 3){
            color1 = "#464030"
            color2 = "#464030"
            color3 = "#464030"
            color4 = "#ffe100"
            color5 = "#464030"
        } else if (selected == 4){
            color1 = "#464030"
            color2 = "#464030"
            color3 = "#464030"
            color4 = "#464030"
            color5 = "#ffe100"
        }
    }

    function cycleleft () {
        if(selected == 0){
            selected = 4
        } else {
            selected -= 1
        }
        selected_faction = decks[selected]
        selectFaction()
    }

    function cycleright () {
        if(selected == 4){
            selected = 0
        } else {
            selected += 1
        }
        selected_faction = decks[selected]
        selectFaction()
    }

    function deckSetUp () {
        shownLeaders = shownDeck.filter(card => card.type == "leader")
        shownDeck = shownDeck.filter(card => card.type != "leader")
    }

    function selectCard (a){
        selected_deck.push(a)
        shownDeck = shownDeck.filter(card => card.id != a.id)
        selected_deck = selected_deck
        shownDeck = shownDeck
    }

    deckSetUp()
    selectFaction()
</script>

<main>

    <div class="headerContainer">  

        <h1 class="playerID">{player}</h1>
        <button class="left" on:click={() => cycleleft() }>⇦</button>
        <div class="header_center">
            <div class="imgHolder"><img src="{selected_faction.name}.png" alt="{selected_faction.name} logo"> <h1>{selected_faction.name}</h1></div>
            <div class="selectors">
                <span style="box-shadow: {color1} 0 0 0.7vh; background-color:{color1};"></span>
                <span style="box-shadow: {color2} 0 0 0.7vh; background-color:{color2};"></span>
                <span style="box-shadow: {color3} 0 0 0.7vh; background-color:{color3};"></span>
                <span style="box-shadow: {color4} 0 0 0.7vh; background-color:{color4};"></span>
                <span style="box-shadow: {color5} 0 0 0.7vh; background-color:{color5};"></span>
            </div> 
            <p class="ability_text">{selected_faction.ability}</p>
        </div>
        <button class="right" on:click={() => cycleright() }>⇨</button>
    </div>
    
    <div class="selectorholder">
        <section class="baseDeck">
            {#each shownDeck as card}
                <button class="card" on:click={() => selectCard(card)}>
                    <img src="{card.name}.webp" alt="{card.name}"> 
                    {#if card.type == "unit"}
                        <p class="unit_value">{card.value}</p>
                    {/if}
                    
                </button>
            {/each}
        </section>
        <section></section>
        <section class="chosenDeck">
            {#each selected_deck as card}
                <img src="{card.name}.webp" alt="{card.name}">
            {/each}

        </section>
    </div>
</main>

<aside class="card-select"></aside>

<style>
    :global(body), :global(html){
		margin: 0%;
		padding: 0%;
		height: 100vh;
		width: 100vw;
	} 
    
    main{
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

    .card-select{
        background-image: url("/static/Deck select background.jpg");
        background-size:cover;
        z-index: -1;
        left:0;
        top:0;
        position: fixed;
        height: 100vh;
        width: 100vw;
    }

    .headerContainer{
        display: flex;
        justify-content: center;
        flex-direction: row;
        align-items: center;
        background-color: #00000034;
        width: 100vw;
        height: 17vh;
    }

    .header_center{
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-end;
    }
    .headerContainer img{
        height: 7vh;
        margin: 0 1vw;
        margin-bottom: 1vh;

    }

    .imgHolder{
        display: flex;
        align-items: center;
        margin-right: 4vh;
    }

    h1{
        font: 200 2em 'Roboto', sans-serif;
        margin-bottom: 1.3vh;
        color: #f6efda;
    }
    
    .selectors{
        display: flex;
        justify-content: center;
    }
    span{
        background-color: #464030;
        height: 1vh;
        width: 1vh;
        border-radius: 1cm;
        margin: 0 0.5vw;
    }

    .ability_text{
        font: 200 0.85em 'Roboto', sans-serif;
        color: #b3ad9c;
        margin: 1vh 0;
    }

    .left{
        position: absolute;
        left: 31vw;
        top: 4.4vh;
        font-size: 7vh;
        margin-bottom: 5vh;
        color: #d1c39d;
    }

    .right{
        position: absolute;
        left: 63vw;
        top: 4.4vh;
        font-size: 7vh;
        margin-bottom: 5vh;
        color: #d1c39d;
    }

    .playerID{
        position: absolute;
        left: 2vw;
        top: 4vh;
        font: 200 2em 'Roboto', sans-serif;
        color: #f6efda;
        margin: 0 1vw;
        background: #0000007a;
        box-shadow: #ff9100 0 0 0.7vh;
        padding: 0.5em;
        border-radius: 2em;
    }

    .selectorholder{
        display: grid;
        grid-template-columns: 3fr 1.5fr 3fr;
        width: 90vw;
        height: 70vh;
        grid-gap: 3vw;
        margin: 6vh 5vw;
        border-radius: 5vh;
        align-items: center;
        background-color: #00000060;
    
    }

    section{
        background-color: #0000002d;
        height: 83%;
    }

    .baseDeck{
        display: grid;
        overflow-y: scroll;
        margin: 2vh;
        border-radius: 1vh;
        grid-template-columns: 1fr 1fr 1fr;
        grid-gap: 1%;
        height: 94%;
    }

    .chosenDeck{
        display: grid;
        overflow-y: scroll;
        
        grid-template-columns: 1fr 1fr 1fr;
        grid-gap: 1%;
        height: 90%;
    }

    
    .card{
        width: auto;
        height: auto;
    }
    
    .unit_value{
        position: relative;
        z-index: 1;
        color: black;
        
    }

    .card img{
        width: 100%;
        height: 100%;
        border-radius: 1vh;
        
    }
</style>