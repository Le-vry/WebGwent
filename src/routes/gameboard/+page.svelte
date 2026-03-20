<script>
    // @ts-nocheck
    import { onMount } from 'svelte'
    import { players_store } from "$lib/players.js"

    let matchmakingStatus = ''
    let matchmakingError = ''
    let gameCode = ''
    let myRole = ''
    let sseConnection = null
    let syncTimer = null
    let suppressStateSync = false
    let p1Username = 'Player 1'
    let p2Username = 'Player 2'
    let actionNotice = ''
    let waitingPollTimer = null
    let waitingPollDelay = 2000
    let waitingPollInFlight = false
    let disconnectNotice = ''
    let disconnectDeadlineMs = 0
    let disconnectTicker = null

    function roleToPlayerNumber(role) {
        return role === 'p2' ? 2 : 1;
    }

    function getTurnPlayer(value) {
        return value === 2 ? 2 : 1;
    }

    function setActionNotice(message) {
        actionNotice = message;
        window.setTimeout(() => {
            if (actionNotice === message) actionNotice = '';
        }, 2200);
    }

    function formatCountdown(totalMs) {
        const totalSeconds = Math.max(0, Math.ceil(totalMs / 1000));
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${String(seconds).padStart(2, '0')}`;
    }

    function stopDisconnectTicker() {
        if (disconnectTicker) {
            window.clearInterval(disconnectTicker);
            disconnectTicker = null;
        }
    }

    function clearDisconnectNotice() {
        disconnectDeadlineMs = 0;
        disconnectNotice = '';
        stopDisconnectTicker();
    }

    function refreshDisconnectNotice() {
        if (!disconnectDeadlineMs) {
            clearDisconnectNotice();
            return;
        }

        const remaining = disconnectDeadlineMs - Date.now();
        if (remaining <= 0) {
            disconnectNotice = 'Opponent did not reconnect in time. Ending match...';
            stopDisconnectTicker();
            return;
        }

        disconnectNotice = `Player disconnected, has ${formatCountdown(remaining)} to reconnect before match termination.`;
    }

    function setDisconnectNotice(deadlineMs) {
        disconnectDeadlineMs = deadlineMs;
        refreshDisconnectNotice();

        if (!disconnectTicker) {
            disconnectTicker = window.setInterval(() => {
                refreshDisconnectNotice();
            }, 1000);
        }
    }

    function initializeFromPlayers(playersData) {
        if (!Array.isArray(playersData) || playersData.length < 2) {
            return false;
        }

        players = playersData
        p1 = players[0]
        p2 = players[1]

        p1Leader = p1[1]
        const p1Init = initializePlayerHand(p1[0]);
        p1Cards = p1Init.deck;
        p1Hand = p1Init.hand;

        p2Leader = p2[1]
        const p2Init = initializePlayerHand(p2[0]);
        p2Cards = p2Init.deck;
        p2Hand = p2Init.hand;

        return true;
    }

    function exportMatchState() {
        return {
            __version: 1,
            players,
            turn,
            placedCard,
            passedTurn,
            popupVisibility,
            meleeSelected,
            rangeSelected,
            siegeSelected,
            p1Leader,
            p1Cards,
            p1Hand,
            p1TotalValue,
            meleeP1,
            rangeP1,
            siegeP1,
            p1Gem1Visibility,
            p1Gem2Visibility,
            p2Leader,
            p2Cards,
            p2Hand,
            p2TotalValue,
            meleeP2,
            rangeP2,
            siegeP2,
            p2Gem1Visibility,
            p2Gem2Visibility,
            placedFrostCard,
            placedFogCard,
            placedRainCard,
            weather
        };
    }

    function applyMatchState(state) {
        if (!state || typeof state !== 'object') return;

        suppressStateSync = true;

        players = Array.isArray(state.players) ? state.players : players;
        p1 = players[0] ?? p1;
        p2 = players[1] ?? p2;

        turn = typeof state.turn === 'number' ? getTurnPlayer(Math.round(state.turn)) : turn;
        placedCard = typeof state.placedCard === 'boolean' ? state.placedCard : placedCard;
        passedTurn = typeof state.passedTurn === 'boolean' ? state.passedTurn : passedTurn;
        popupVisibility = typeof state.popupVisibility === 'string' ? state.popupVisibility : popupVisibility;

        meleeSelected = Boolean(state.meleeSelected);
        rangeSelected = Boolean(state.rangeSelected);
        siegeSelected = Boolean(state.siegeSelected);

        p1Leader = state.p1Leader ?? p1Leader;
        p1Cards = Array.isArray(state.p1Cards) ? state.p1Cards : p1Cards;
        p1Hand = Array.isArray(state.p1Hand) ? state.p1Hand : p1Hand;
        p1TotalValue = typeof state.p1TotalValue === 'number' ? state.p1TotalValue : p1TotalValue;

        meleeP1 = state.meleeP1 ?? meleeP1;
        rangeP1 = state.rangeP1 ?? rangeP1;
        siegeP1 = state.siegeP1 ?? siegeP1;
        p1Gem1Visibility = state.p1Gem1Visibility ?? p1Gem1Visibility;
        p1Gem2Visibility = state.p1Gem2Visibility ?? p1Gem2Visibility;

        p2Leader = state.p2Leader ?? p2Leader;
        p2Cards = Array.isArray(state.p2Cards) ? state.p2Cards : p2Cards;
        p2Hand = Array.isArray(state.p2Hand) ? state.p2Hand : p2Hand;
        p2TotalValue = typeof state.p2TotalValue === 'number' ? state.p2TotalValue : p2TotalValue;

        meleeP2 = state.meleeP2 ?? meleeP2;
        rangeP2 = state.rangeP2 ?? rangeP2;
        siegeP2 = state.siegeP2 ?? siegeP2;
        p2Gem1Visibility = state.p2Gem1Visibility ?? p2Gem1Visibility;
        p2Gem2Visibility = state.p2Gem2Visibility ?? p2Gem2Visibility;

        placedFrostCard = Boolean(state.placedFrostCard);
        placedFogCard = Boolean(state.placedFogCard);
        placedRainCard = Boolean(state.placedRainCard);
        weather = Array.isArray(state.weather) ? state.weather : weather;

        suppressStateSync = false;
    }

    async function pushStateToServer(force = false) {
        if (!gameCode || matchmakingStatus !== 'active') return;
        if (!force && !isMyTurn) return;

        try {
            await fetch(`/api/matchmaking/state/${encodeURIComponent(gameCode)}`, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                    state: exportMatchState(),
                    role: myRole
                })
            });
        } catch (error) {
            console.error('Failed to sync match state:', error);
        }
    }

    function queueStateSync() {
        if (suppressStateSync || !gameCode || matchmakingStatus !== 'active' || !isMyTurn) return;
        if (syncTimer) window.clearTimeout(syncTimer);
        syncTimer = window.setTimeout(() => {
            pushStateToServer();
            syncTimer = null;
        }, 250);
    }

    function startSseStream(code) {
        if (sseConnection) sseConnection.close();

        sseConnection = new EventSource(`/api/matchmaking/stream/${encodeURIComponent(code)}`);
        sseConnection.addEventListener('game', (event) => {
            try {
                const meta = JSON.parse(event.data);
                if (typeof meta.currentTurn === 'number') {
                    turn = getTurnPlayer(Math.round(meta.currentTurn));
                }

                if (meta.status === 'active' && matchmakingStatus !== 'active') {
                    fetchMatchGameState(code).catch((error) => {
                        console.error('Failed to hydrate active match state:', error);
                    });
                } else if (meta.status === 'waiting') {
                    matchmakingStatus = 'waiting';
                    clearDisconnectNotice();
                } else if (meta.status) {
                    matchmakingError = 'This match ended. Start a new match from card select.';
                    matchmakingStatus = '';
                    clearWaitingPoll();
                    clearDisconnectNotice();
                    if (sseConnection) {
                        sseConnection.close();
                        sseConnection = null;
                    }
                }

                if (
                    meta.disconnect &&
                    typeof meta.disconnect.deadlineMs === 'number' &&
                    meta.disconnect.role !== myRole &&
                    meta.status === 'active'
                ) {
                    setDisconnectNotice(meta.disconnect.deadlineMs);
                } else {
                    clearDisconnectNotice();
                }
            } catch (error) {
                console.error('Failed to parse SSE game meta:', error);
            }
        });
        sseConnection.addEventListener('state', (event) => {
            try {
                const next = JSON.parse(event.data);
                applyMatchState(next);
                syncBoardState();
            } catch (error) {
                console.error('Failed to parse SSE state:', error);
            }
        });
    }

    async function fetchMatchGameState(code) {
        let res;
        try {
            res = await fetch(`/api/matchmaking/game/${encodeURIComponent(code)}`);
        } catch (error) {
            matchmakingError = 'Network error while loading game state.';
            return { ready: false };
        }

        const raw = await res.text();
        let result = null;
        try {
            result = raw ? JSON.parse(raw) : null;
        } catch {
            result = null;
        }

        if (!res.ok) {
            matchmakingError = result?.error ?? `Could not load game state (HTTP ${res.status}).`;
            if (res.status === 410) {
                matchmakingStatus = '';
                clearWaitingPoll();
                clearDisconnectNotice();
            }
            return { ready: false };
        }

        if (!result || typeof result !== 'object') {
            matchmakingError = 'Received an invalid game state response.';
            return { ready: false };
        }

        matchmakingError = '';

        if (result.status === 'waiting') {
            matchmakingStatus = 'waiting';
            myRole = result.role ?? myRole;
            clearDisconnectNotice();
            return { ready: false };
        }

        matchmakingStatus = 'active';
        myRole = result.role ?? myRole;
        if (result.playerNames) {
            p1Username = result.playerNames.p1 ?? p1Username;
            p2Username = result.playerNames.p2 ?? p2Username;
        }
        initializeFromPlayers(result.players);
        if (result.state) {
            applyMatchState(result.state);
        } else if (typeof result.currentTurn === 'number') {
            turn = getTurnPlayer(Math.round(result.currentTurn));
        }
        $players_store = JSON.stringify(result.players);
        return { ready: true };
    }

    function clearWaitingPoll() {
        if (waitingPollTimer) {
            window.clearTimeout(waitingPollTimer);
            waitingPollTimer = null;
        }
        waitingPollInFlight = false;
    }

    function scheduleWaitingPoll(code) {
        if (matchmakingStatus === 'active') {
            clearWaitingPoll();
            return;
        }

        waitingPollTimer = window.setTimeout(async () => {
            if (waitingPollInFlight || matchmakingStatus === 'active') {
                scheduleWaitingPoll(code);
                return;
            }

            waitingPollInFlight = true;
            const next = await fetchMatchGameState(code);
            waitingPollInFlight = false;

            if (next.ready) {
                clearWaitingPoll();
                queueStateSync();
                return;
            }

            // Back off under repeated waiting/errors to avoid request storms.
            waitingPollDelay = Math.min(waitingPollDelay + 500, 5000);
            scheduleWaitingPoll(code);
        }, waitingPollDelay);
    }

    onMount(() => {
        const init = async () => {
            const params = new URLSearchParams(window.location.search);
            gameCode = params.get('gameCode') ?? '';

            if (gameCode) {
                startSseStream(gameCode);
                const first = await fetchMatchGameState(gameCode);
                if (first.ready) {
                    if (!players.length && $players_store.length > 0) {
                        initializeFromPlayers(JSON.parse($players_store));
                    }
                    queueStateSync();
                    return;
                }

                // Fallback polling keeps matchmaking reliable when SSE is delayed by hosting proxies.
                waitingPollDelay = 2000;
                scheduleWaitingPoll(gameCode);

                return;
            }

            if ($players_store.length > 0) {
                initializeFromPlayers(JSON.parse($players_store));
            }
        };

        init();

        return () => {
            clearWaitingPoll();
            clearDisconnectNotice();
            if (syncTimer) clearTimeout(syncTimer);
            if (sseConnection) {
                sseConnection.close();
                sseConnection = null;
            }
        };
    })
    

    /* Turn Handeling*/
    let turn = 1
    let placedCard = false
    let passedTurn = false
    let popupVisibility = "none"

    $: isP1Perspective = myRole !== 'p2'
    $: myPlayerNumber = roleToPlayerNumber(myRole)
    $: activePlayerNumber = getTurnPlayer(turn)
    $: isMyTurn = matchmakingStatus === 'active' && activePlayerNumber === myPlayerNumber
    
    

    /*Global player Vars*/
    let meleeSelected = false
    let rangeSelected = false
    let siegeSelected = false
    let players = []



    /* p2 variables */
    let p1 = players
    let p1Leader = {name: "Ballista1"}
    let p1Cards = [{name: "Ballista2"}]
    
    let p1Hand = []

    let p1TotalValue = 0
    
    let meleeP1 = {value: 0, rowMultiplier: 1, units: [], special: []}
    let rangeP1 = {value: 0, rowMultiplier: 1, units: [], special: []}
    let siegeP1 = {value: 0, rowMultiplier: 1, units: [], special: []}



    let p1Gem1Visibility = "visible"
    let p1Gem2Visibility = "visible"

    /* p2 variables*/
    let p2 = players
    let p2Leader = {name: "Ballista1"}
    let p2Cards = [{name: "Ballista2"}]
    let p2Hand = []
    
    let p2TotalValue = 0
    let meleeP2 = {value: 0, rowMultiplier: 1, units: [], special: []}
    let rangeP2 = {value: 0, rowMultiplier: 1, units: [], special: []}
    let siegeP2 = {value: 0, rowMultiplier: 1, units: [], special: []}
    

    let p2Gem1Visibility = "visible"
    let p2Gem2Visibility = "visible"

    /* Weather variables*/
    let placedFrostCard = false
    let placedFogCard = false
    let placedRainCard = false
    let weather = []


    /* Helper functions */

    // Fisher-Yates shuffle algorithm - O(n) instead of O(n*m) sorting
    function shuffleArray(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    // Initialize player hands efficiently
    function initializePlayerHand(cards) {
        const shuffled = shuffleArray(cards);
        const hand = shuffled.slice(0, 10).sort((a, b) => a.value - b.value);
        const handIds = new Set(hand.map(c => c.id));
        const deck = shuffled.filter(c => !handIds.has(c.id));
        return { hand, deck };
    }

    // Returns the row objects for a given player (1 = p1, 2 = p2)
    function getPlayerRows(player) {
        return player === 1
            ? { melee: meleeP1, range: rangeP1, siege: siegeP1 }
            : { melee: meleeP2, range: rangeP2, siege: siegeP2 };
    }

    // Returns the weather flag for a given row type
    function getWeatherForRow(rowType) {
        if (rowType === "melee") return placedFrostCard;
        if (rowType === "range")  return placedFogCard;
        if (rowType === "siege")  return placedRainCard;
        return false;
    }

    // Returns the currently-selected row name
    function getSelectedRow() {
        if (meleeSelected) return "melee";
        if (rangeSelected) return "range";
        if (siegeSelected) return "siege";
        return null;
    }

    // Force Svelte to pick up nested board/array mutations immediately
    function syncBoardState() {
        meleeP1 = { ...meleeP1 };
        rangeP1 = { ...rangeP1 };
        siegeP1 = { ...siegeP1 };
        meleeP2 = { ...meleeP2 };
        rangeP2 = { ...rangeP2 };
        siegeP2 = { ...siegeP2 };

        p1Hand = [...p1Hand];
        p2Hand = [...p2Hand];
        p1Cards = [...p1Cards];
        p2Cards = [...p2Cards];
        weather = [...weather];

        queueStateSync();
    }


    /* 1 Card Placing Logic*/
    /* 1-----------------------------------------------------------------------------------1 */

    /* Placement */
    function selectRow(row) {
        if (!isMyTurn) return;
        meleeSelected = row === "melee";
        rangeSelected = row === "range";
        siegeSelected = row === "siege";
    }

    function placeCard(card) {
        if (!isMyTurn) {
            return;
        }

        const cardWasPlaced = !placedCard || passedTurn;

        if (!placedCard || passedTurn) {
            const activePlayer  = activePlayerNumber;
            const enemyPlayer   = activePlayer === 1 ? 2 : 1;
            const ownRows       = getPlayerRows(activePlayer);
            const enemyRows     = getPlayerRows(enemyPlayer);
            const activeHand    = activePlayer === 1 ? p1Hand : p2Hand;

            // Only cards currently in the active hand can be played.
            if (!activeHand.some((handCard) => handCard.id === card.id)) {
                return;
            }

            // Agile cards must be placed in the currently selected melee/range row.
            // If no valid row is selected, keep the card in hand and do not consume the turn.
            if ((card.type === "unit" || card.type === "hero") && card.row === "agile") {
                const selectedRow = getSelectedRow();
                if (selectedRow !== "melee" && selectedRow !== "range") {
                    setActionNotice('Select Melee or Range row before placing an agile card.');
                    return;
                }
            }

            // Commander's Horn must have a row selected before placing.
            if (card.type === "special" && card.ability === "horn") {
                if (!getSelectedRow()) {
                    setActionNotice("Select a row before placing a Commander's Horn.");
                    return;
                }
            }

            placedCard = !passedTurn;

            // Remove card from active player's hand
            if (activePlayer === 1) p1Hand = p1Hand.filter(c => c.id !== card.id);
            else                    p2Hand = p2Hand.filter(c => c.id !== card.id);

            if (card.type === "unit" || card.type === "hero") {
                if (card.row === "agile") {
                    // Agile cards only support morale_boost, no spy
                    const rowName = getSelectedRow();
                    if (rowName === "melee" || rowName === "range") {
                        const row = ownRows[rowName];
                        row.units.push(card);
                        if (card.ability === "morale_boost") placedMoraleBoostCard(card, row.units);
                        updateWeatherCard(getWeatherForRow(rowName), row);
                        updateRowValue(row);
                    }
                } else {
                    // melee / range / siege
                    const rowName = card.row;
                    placeUnitInRow(card, ownRows[rowName], enemyRows[rowName], getWeatherForRow(rowName));
                }
            } else if (card.type === "special") {
                if (card.row === "weather") {
                    weather = [...weather, card];
                    placedWeatherCard(card);
                }
                if (card.ability === "horn") {
                    placeHornSpecial(card, ownRows);
                }
                if (card.ability === "scorch") {
                    placedSpecialScorchCard();
                }
            }
        }
        updateTotalValue();
        syncBoardState();
        
        // Auto-end turn after successfully placing a card (reactive turn switching)
        if (cardWasPlaced && placedCard) {
            endTurn();
        }
    }

    function placeUnitInRow(card, ownRow, enemyRow, weather) {
        if (card.ability === "spy") {
            enemyRow.units.push(card);
            updateWeatherCard(weather, enemyRow);
            updateRowValue(enemyRow);
            placedSpyCard();
        } else {
            ownRow.units.push(card);
            switch (card.ability) {
                case "tight_bond":   placedTightBondCard(card, ownRow.units); break;
                case "horn":         placedHornCard(ownRow); break;
                case "medic":        placedMedicCard(card, ownRow.units); break;
                case "muster":       placedMusterCard(card, ownRow.units); break;
                case "morale_boost": placedMoraleBoostCard(card, ownRow.units); break;
                case "scorch":       placedScorchCard(enemyRow); break;
            }
            updateWeatherCard(weather, ownRow);
            updateRowValue(ownRow);
        }
    }

    /* Abilities */
    function placedSpyCard() {
        // Spy card draws 2 cards for the active player
        if (activePlayerNumber === 1) {
            const pulled = p1Cards.slice(0, 2);
            const pulledIds = new Set(pulled.map(c => c.id));
            p1Hand = [...p1Hand, ...pulled].sort((a, b) => a.value - b.value);
            p1Cards = p1Cards.filter(c => !pulledIds.has(c.id));
        } else {
            const pulled = p2Cards.slice(0, 2);
            const pulledIds = new Set(pulled.map(c => c.id));
            p2Hand = [...p2Hand, ...pulled].sort((a, b) => a.value - b.value);
            p2Cards = p2Cards.filter(c => !pulledIds.has(c.id));
        }
    }

    function placedTightBondCard(placedCard, row) {
        // Count and apply in a single pass
        const multiplier = row.filter(c => c.TB_ID === placedCard.TB_ID).length;
        row.forEach(card => {
            if (card.TB_ID === placedCard.TB_ID) card.ValueMultiplier = multiplier;
        });
    }

    function placedHornCard(row) {
        row.rowMultiplier = 2
        updateTotalValue()
    }

    function placeHornSpecial(card, playerRows) {
        const rowName = getSelectedRow();
        if (!rowName) return;
        const row = playerRows[rowName];
        row.special = [card];
        placedHornCard(row);
        updateRowValue(row);
    }

    function placedMedicCard(placedCard, row) {
        null
    }

    function musterPlaceCard(card, playerRows) {
        const rowName = card.row;
        if (rowName !== "melee" && rowName !== "range" && rowName !== "siege") return;
        const row = playerRows[rowName];
        row.units.push(card);
        updateWeatherCard(getWeatherForRow(rowName), row);
        updateRowValue(row);
    }

    function placedMusterCard(placedCard, row) {
        const isP1 = activePlayerNumber === 1;
        let hand  = isP1 ? p1Hand  : p2Hand;
        let deck  = isP1 ? p1Cards : p2Cards;
        const playerRows = getPlayerRows(isP1 ? 1 : 2);

        // M_ID ending in "1" means this is the leader card — gather all variants
        const isLeader = placedCard.M_ID.endsWith("1");
        const baseId   = isLeader
            ? placedCard.M_ID.slice(0, -1)
            : placedCard.M_ID;

        if (isLeader) {
            if (isLeader) placedCard.M_ID = baseId;
            const fromHand = hand.filter(c => c.M_ID === baseId);
            const fromDeck = deck.filter(c => c.M_ID === baseId);
            hand = hand.filter(c => c.M_ID !== baseId);
            deck = deck.filter(c => c.M_ID !== baseId);
            [...fromHand, ...fromDeck].forEach(c => musterPlaceCard(c, playerRows));
        } else {
            const fromHand = hand.filter(c => c.M_ID === baseId);
            const fromDeck = deck.filter(c => c.M_ID === baseId);
            hand = hand.filter(c => c.M_ID !== baseId);
            deck = deck.filter(c => c.M_ID !== baseId);
            [...fromHand, ...fromDeck].forEach(c => row.push(c));
        }

        if (isP1) { p1Hand = hand; p1Cards = deck; }
        else      { p2Hand = hand; p2Cards = deck; }
    }

    function placedMoraleBoostCard(placedCard, row) {
        row.forEach(card => {
            if(card.id != placedCard.id){
                card.value += 1
            }
        })
    }

    function placedScorchCard(enemyRow) {
        if (enemyRow.value < 10) return;
        const unitScore = c => c.value * c.ValueMultiplier * enemyRow.rowMultiplier;
        const maxValue = enemyRow.units
            .filter(c => c.type === "unit")
            .reduce((max, c) => Math.max(max, unitScore(c)), 0);
        enemyRow.units = enemyRow.units.filter(c => c.type !== "unit" || unitScore(c) !== maxValue);
        updateRowValue(enemyRow);
    }

    function placedSpecialScorchCard() {
        const allRows = [meleeP1, rangeP1, siegeP1, meleeP2, rangeP2, siegeP2];
        let maxStrength = 0;
        allRows.forEach(row => {
            row.units.forEach(card => {
                if (card.type === "unit") maxStrength = Math.max(maxStrength, card.value);
            });
        });
        if (maxStrength === 0) return;
        allRows.forEach(row => {
            const before = row.units.length;
            row.units = row.units.filter(c => c.type !== "unit" || c.value !== maxStrength);
            if (row.units.length !== before) updateRowValue(row);
        });
    }

    /* Weather */
    function getBaseCardValue(card) {
        if (typeof card.Basevalue === "number") return card.Basevalue;
        if (typeof card.baseValue === "number") {
            card.Basevalue = card.baseValue;
            return card.Basevalue;
        }
        // Capture original value once so later weather/morale recalculations are stable.
        card.Basevalue = card.value;
        return card.Basevalue;
    }

    function updateWeatherCard(weatherBool, row) {
        const moraleBoosters = row.units.filter(c => c.ability === "morale_boost").length;

        row.units.forEach(card => {
            if (card.type === "unit") {
                const baseValue = getBaseCardValue(card);
                const weatherValue = weatherBool ? 1 : baseValue;
                const moraleBonus = moraleBoosters - (card.ability === "morale_boost" ? 1 : 0);
                card.value = weatherValue + Math.max(0, moraleBonus);
            } else if (card.type === "hero") {
                // Keep hero cards anchored to their base value.
                card.value = getBaseCardValue(card);
            }
        });
    }

    function placedWeatherCard(card) {
        // Helper function to apply weather to rows
        const applyWeather = (weatherFlag, rows) => {
            rows.forEach(row => {
                updateWeatherCard(weatherFlag, row);
                updateRowValue(row);
                row = row;
            });
        };

        const weatherActions = {
            "W1": () => {
                placedFrostCard = true;
                applyWeather(placedFrostCard, [meleeP1, meleeP2]);
            },
            "W2": () => {
                placedFogCard = true;
                applyWeather(placedFogCard, [rangeP1, rangeP2]);
            },
            "W3": () => {
                placedRainCard = true;
                applyWeather(placedRainCard, [siegeP1, siegeP2]);
            },
            "W4": () => {
                placedFogCard = true;
                applyWeather(placedFogCard, [rangeP1, rangeP2]);
                placedRainCard = true;
                applyWeather(placedRainCard, [siegeP1, siegeP2]);
            },
            "W5": () => {
                placedFrostCard = false;
                applyWeather(placedFrostCard, [meleeP1, meleeP2]);
                placedFogCard = false;
                applyWeather(placedFogCard, [rangeP1, rangeP2]);
                placedRainCard = false;
                applyWeather(placedRainCard, [siegeP1, siegeP2]);
                weather = [];
            }
        };

        if (weatherActions[card.ability]) {
            weatherActions[card.ability]();
            updateTotalValue();
        }
    }

    /* 1-----------------------------------------------------------------------------------1 */



    /* 1 Value handeling */
    /* 1-----------------------------------------------------------------------------------1 */
    function updateRowValue(row){
        row.value = 0
        row.units.forEach(card => {
            if(card.type == "unit"){
                row.value += card.value * card.ValueMultiplier * row.rowMultiplier
            } else if(card.type == "hero"){
                row.value += card.value
            }
        });
        updateTotalValue()
    }

    function updateTotalValue(){
        p1TotalValue = 0
        p1TotalValue += meleeP1.value + rangeP1.value + siegeP1.value
    
        p2TotalValue = 0
        p2TotalValue += meleeP2.value + rangeP2.value + siegeP2.value
      
    }
    /* 1-----------------------------------------------------------------------------------1 */



    /* Turn handeling */
    /* ----------------------------------------------------------------------------------- */
    function onKeyDown(e) {
        if (!isMyTurn) {
            return;
        }

        if (e.key === "Enter") {
            endTurn()
        }
        if (e.key === "Tab"){
            
            if (passedTurn == true){
                compareValue()
                p1TotalValue = 0
                meleeP1 = {value: 0, rowMultiplier: 1, units: [], special: []}
                rangeP1 = {value: 0, rowMultiplier: 1, units: [], special: []}
                siegeP1 = {value: 0, rowMultiplier: 1, units: [], special: []}


                p2TotalValue = 0
                meleeP2 = {value: 0, rowMultiplier: 1, units: [], special: []}
                rangeP2 = {value: 0, rowMultiplier: 1, units: [], special: []}
                siegeP2 = {value: 0, rowMultiplier: 1, units: [], special: []}

                weather = []
                endTurn()
                passedTurn = false
            } else {
                passedTurn = true 
                endTurn()
            }
           
        }
    }

    function compareValue(){
        
        if(p1TotalValue > p2TotalValue){
            if(p2Gem1Visibility == "visible"){
                p2Gem1Visibility = "hidden"
            } else if(p2Gem1Visibility == "hidden"){
                p2Gem2Visibility = "hidden"
                setActionNotice('Player 1 wins!')
            }
        } else if(p1TotalValue < p2TotalValue){
            if(p1Gem1Visibility == "visible"){
                p1Gem1Visibility = "hidden"
            } else if(p1Gem1Visibility == "hidden"){
                p1Gem2Visibility = "hidden"
            }
        } else {
            if(p2Gem1Visibility == "visible"){
                p2Gem1Visibility = "hidden"
            } else if(p2Gem1Visibility == "hidden"){
                p2Gem2Visibility = "hidden"
            }
            if(p1Gem1Visibility == "visible"){
                p1Gem1Visibility = "hidden"
            } else if(p1Gem1Visibility == "hidden"){
                p1Gem2Visibility = "hidden"
                setActionNotice('Player 2 wins!')
            }

        }
        
    }
    
    function endTurn() {
        if (!isMyTurn) {
            return;
        }

        turn = activePlayerNumber === 1 ? 2 : 1
        placedCard = false
        // Force-sync turn handoff immediately so opponent gets notified.
        pushStateToServer(true)
        
    }
    /* ----------------------------------------------------------------------------------- */
</script>

<svelte:window on:keydown|preventDefault={onKeyDown} />

<audio src="Gwent Music.mp3" autoplay loop></audio>

<main>
    {#if matchmakingError}
        <div class="match-status match-status--error">{matchmakingError}</div>
    {:else if matchmakingStatus === 'waiting'}
        <div class="match-status">Waiting for an opponent to join match {gameCode}...</div>
    {:else if matchmakingStatus === 'active' && !isMyTurn}
        <div class="match-status">Opponent is making their move...</div>
    {/if}

    {#if actionNotice}
        <div class="match-status match-status--info">{actionNotice}</div>
    {/if}

    {#if disconnectNotice}
        <div class="match-status match-status--warning">{disconnectNotice}</div>
    {/if}

    {#if isP1Perspective}
        <button class="P1leader" on:click={() => {console.log("p1 Leader")}}>
            <img src="{p1Leader.name}.webp" alt="Player 1 Leader" loading="lazy" decoding="async">
        </button>

        <button class="P2leader" on:click={() => {console.log("p2 Leader")}}>
            <img src="{p2Leader.name}.webp" alt="Player 2 Leader" loading="lazy" decoding="async">
        </button>
    {/if}

    {#if !isP1Perspective}
        <button class="P1leader" on:click={() => {console.log("p1 Leader")}}>
            <img src="{p2Leader.name}.webp" alt="Player 1 Leader" loading="lazy" decoding="async">
        </button>

        <button class="P2leader" on:click={() => {console.log("p2 Leader")}}>
            <img src="{p1Leader.name}.webp" alt="Player 2 Leader" loading="lazy" decoding="async">
        </button>
    {/if}
    

    <div class="HeldCards">
        {#if isP1Perspective}
                
            {#each p1Hand as card}
                {#if card.type == "unit"}
                    <button class="card" on:click={() => {placeCard(card)}} style="padding-left:0.2vw; padding-top:0.2vw;">
                    <img src="{card.name}.webp" alt="{card.name}" loading="lazy" decoding="async">
                    {#if card.value >= 10}
                        <p class="unit_value" style="left:8.5%;">{card.value * card.ValueMultiplier}</p>
                    {:else}
                        <p class="unit_value">{card.value * card.ValueMultiplier}</p>
                    {/if}
                    </button>       
                {/if} 

                {#if card.type == "hero"}
                    <button class="card" on:click={() => {placeCard(card)}}>
                    <img src="{card.name}.webp" alt="{card.name}" loading="lazy" decoding="async">
                    </button>
                {/if}

                {#if card.type == "special"}
                    <button class="card" on:click={() => {placeCard(card)}} style="padding-left:0.2vw; padding-top:0.2vw;">
                    <img src="{card.name}.webp" alt="{card.name}" loading="lazy" decoding="async">
                    </button>
                {/if}
            {/each}
        {/if}

        {#if !isP1Perspective}
                
            {#each p2Hand as card}
                {#if card.type == "unit"}
                    <button class="card" on:click={() => {placeCard(card)}} style="padding-left:0.2vw; padding-top:0.2vw;">
                    <img src="{card.name}.webp" alt="{card.name}" loading="lazy" decoding="async">
                    {#if card.value  >= 10}
                        <p class="unit_value" style="left:8.5%;">{card.value * card.ValueMultiplier}</p>
                    {:else}
                        <p class="unit_value">{card.value * card.ValueMultiplier}</p>
                    {/if}
                    </button>       
                {/if} 

                {#if card.type == "hero"}
                    <button class="card" on:click={() => {placeCard(card)}}>
                    <img src="{card.name}.webp" alt="{card.name}" loading="lazy" decoding="async">
                    </button>
                {/if}

                {#if card.type == "special"}
                    <button class="card" on:click={() => {placeCard(card)}} style="padding-left:0.2vw; padding-top:0.2vw;">
                    <img src="{card.name}.webp" alt="{card.name}" loading="lazy" decoding="async">
                    </button>
                {/if}
            {/each}
        {/if}
    </div>



    <section class="Board-top">
        {#if !isP1Perspective}
            <div class="totalvalue">{p1TotalValue}</div>

            <div class="melee" style="top: 67%;">

                <div class="melee-value" style="top:35%;">{meleeP1.value}</div>

                <div class="melee-special">
                    {#each meleeP1.special as special}
                        <div class="card">
                        <img src="{special.name}.webp" alt="{special.name}">
                        </div>
                    {/each}
                </div>
                <div class="melee-units no-scrollbar">
                    {#each meleeP1.units as card}
                        {#if card.type == "unit"}
                            <button class="card" on:click={() => {placeCard(card)}} style="padding-left:0.2vw; padding-top:0.2vw;">
                            <img src="{card.name}.webp" alt="{card.name}">
                            {#if card.value * card.ValueMultiplier * meleeP1.rowMultiplier >= 10}
                                {#if card.value * card.ValueMultiplier * meleeP1.rowMultiplier > card.Basevalue}
                                    <p class="unit_value" style="left:8.5%; color:green;">{card.value * card.ValueMultiplier * meleeP1.rowMultiplier}</p>
                                {:else}
                                    <p class="unit_value" style="left:8.5%;">{card.value * card.ValueMultiplier * meleeP1.rowMultiplier}</p>
                                {/if}

                            {:else}
                                {#if card.value * card.ValueMultiplier * meleeP1.rowMultiplier > card.Basevalue}
                                    <p class="unit_value" style="color:green;">{card.value * card.ValueMultiplier * meleeP1.rowMultiplier}</p>
                                {:else if card.value * card.ValueMultiplier * meleeP1.rowMultiplier < card.Basevalue}
                                    <p class="unit_value" style="color:red;">{card.value * card.ValueMultiplier * meleeP1.rowMultiplier}</p>
                                {:else}
                                    <p class="unit_value">{card.value * card.ValueMultiplier * meleeP1.rowMultiplier}</p>
                                {/if}
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

                <div>
                    <img src="Frost Symbol.png" alt="Weather" class="weatherSymbol" style="visibility:{placedFrostCard ? 'visible' : 'hidden'}">
                </div>
            </div>

            <div class="range">

                <div class="range-value" style="top:32%;">{rangeP1.value}</div>

                <div class="range-special">
                    {#each rangeP1.special as special}
                        <div class="card">
                        <img src="{special.name}.webp" alt="{special.name}">
                        </div>
                    {/each}
                </div>
                <div class="range-units no-scrollbar">
                    {#each rangeP1.units as card}
                        {#if card.type == "unit"}
                            <button class="card" on:click={() => {placeCard(card)}} style="padding-left:0.2vw; padding-top:0.2vw;">
                            <img src="{card.name}.webp" alt="{card.name}">
                            {#if card.value * card.ValueMultiplier * rangeP1.rowMultiplier>= 10}
                                {#if card.value * card.ValueMultiplier * rangeP1.rowMultiplier > card.Basevalue}
                                    <p class="unit_value" style="left:8.5%; color:green;">{card.value * card.ValueMultiplier * rangeP1.rowMultiplier}</p>
                                {:else}
                                    <p class="unit_value" style="left:8.5%;">{card.value * card.ValueMultiplier * rangeP1.rowMultiplier}</p>
                                {/if}

                            {:else}
                                {#if card.value * card.ValueMultiplier * rangeP1.rowMultiplier > card.Basevalue}
                                    <p class="unit_value" style="color:green;">{card.value * card.ValueMultiplier * rangeP1.rowMultiplier}</p>
                                {:else if card.value * card.ValueMultiplier * rangeP1.rowMultiplier < card.Basevalue}
                                    <p class="unit_value" style="color:red;">{card.value * card.ValueMultiplier * rangeP1.rowMultiplier}</p>
                                {:else}
                                    <p class="unit_value">{card.value * card.ValueMultiplier * rangeP1.rowMultiplier}</p>
                                {/if}
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

                <div>
                    <img src="Fog Symbol.png" alt="Weather" class="weatherSymbol" style="visibility:{placedFogCard ? 'visible' : 'hidden'}">
                </div>
            </div>

            <div class="siege" style="top:2%;">

                <div class="siege-value">{siegeP1.value}</div>

                <div class="siege-special">
                    {#each siegeP1.special as special}
                        <div class="card">
                        <img src="{special.name}.webp" alt="{special.name}">
                        </div>
                    {/each}
                </div>
                <div class="siege-units no-scrollbar">
                    {#each siegeP1.units as card}
                        {#if card.type == "unit"}
                            <button class="card" on:click={() => {placeCard(card)}} style="padding-left:0.2vw; padding-top:0.2vw;">
                            <img src="{card.name}.webp" alt="{card.name}">
                            {#if card.value * card.ValueMultiplier * siegeP1.rowMultiplier >= 10}
                                {#if card.value * card.ValueMultiplier * siegeP1.rowMultiplier > card.Basevalue}
                                    <p class="unit_value" style="left:8.5%; color:green;">{card.value * card.ValueMultiplier * siegeP1.rowMultiplier}</p>
                                {:else}
                                    <p class="unit_value" style="left:8.5%;">{card.value * card.ValueMultiplier * siegeP1.rowMultiplier}</p>
                                {/if}

                            {:else}
                                {#if card.value * card.ValueMultiplier * siegeP1.rowMultiplier > card.Basevalue}
                                    <p class="unit_value" style="color:green;">{card.value * card.ValueMultiplier * siegeP1.rowMultiplier}</p>
                                {:else if card.value * card.ValueMultiplier * siegeP1.rowMultiplier < card.Basevalue}
                                    <p class="unit_value" style="color:red;">{card.value * card.ValueMultiplier * siegeP1.rowMultiplier}</p>
                                {:else}
                                    <p class="unit_value">{card.value * card.ValueMultiplier * siegeP1.rowMultiplier}</p>
                                {/if}
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

                <div>
                    <img src="Rain Symbol.png" alt="Weather" class="weatherSymbol" style="visibility:{placedRainCard ? 'visible' : 'hidden'}">
                </div>
            </div>
        {/if}


        {#if isP1Perspective}
            <div class="totalvalue">{p2TotalValue}</div>
            
            <div class="melee" style="top: 67%;">

                <div class="melee-value" style="top:35%;">{meleeP2.value}</div>

                <div class="melee-special">
                    {#each meleeP2.special as special}
                        <div class="card">
                        <img src="{special.name}.webp" alt="{special.name}">
                        </div>
                    {/each}
                </div>
                <div class="melee-units no-scrollbar">
                    {#each meleeP2.units as card}
                        {#if card.type == "unit"}
                            <button class="card" on:click={() => {placeCard(card)}} style="padding-left:0.2vw; padding-top:0.2vw;">
                            <img src="{card.name}.webp" alt="{card.name}">
                            {#if card.value * card.ValueMultiplier * meleeP2.rowMultiplier >= 10}
                                {#if card.value * card.ValueMultiplier * meleeP2.rowMultiplier > card.Basevalue}
                                    <p class="unit_value" style="left:8.5%; color:green;">{card.value * card.ValueMultiplier * meleeP2.rowMultiplier}</p>
                                {:else}
                                    <p class="unit_value" style="left:8.5%;">{card.value * card.ValueMultiplier * meleeP2.rowMultiplier}</p>
                                {/if}

                            {:else}
                                {#if card.value * card.ValueMultiplier * meleeP2.rowMultiplier > card.Basevalue}
                                    <p class="unit_value" style="color:green;">{card.value * card.ValueMultiplier * meleeP2.rowMultiplier}</p>
                                {:else if card.value * card.ValueMultiplier * meleeP2.rowMultiplier < card.Basevalue}
                                    <p class="unit_value" style="color:red;">{card.value * card.ValueMultiplier * meleeP2.rowMultiplier}</p>
                                {:else}
                                    <p class="unit_value">{card.value * card.ValueMultiplier * meleeP2.rowMultiplier}</p>
                                {/if}
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

                <div>
                    <img src="Frost Symbol.png" alt="Weather" class="weatherSymbol" style="visibility:{placedFrostCard ? 'visible' : 'hidden'}">
                </div>
            </div>

            <div class="range">

                <div class="range-value" style="top:32%;">{rangeP2.value}</div>

                <div class="range-special">
                    {#each rangeP2.special as special}
                        <div class="card">
                        <img src="{special.name}.webp" alt="{special.name}">
                        </div>
                    {/each}
                </div>
                <div class="range-units no-scrollbar">
                    {#each rangeP2.units as card}
                        {#if card.type == "unit"}
                            <button class="card" on:click={() => {placeCard(card)}} style="padding-left:0.2vw; padding-top:0.2vw;">
                            <img src="{card.name}.webp" alt="{card.name}">
                            {#if card.value * card.ValueMultiplier * rangeP2.rowMultiplier >= 10}
                                {#if card.value * card.ValueMultiplier * rangeP2.rowMultiplier > card.Basevalue}
                                    <p class="unit_value" style="left:8.5%; color:green;">{card.value * card.ValueMultiplier * rangeP2.rowMultiplier}</p>
                                {:else}
                                    <p class="unit_value" style="left:8.5%;">{card.value * card.ValueMultiplier * rangeP2.rowMultiplier}</p>
                                {/if}

                            {:else}
                                {#if card.value * card.ValueMultiplier * rangeP2.rowMultiplier > card.Basevalue}
                                    <p class="unit_value" style="color:green;">{card.value * card.ValueMultiplier * rangeP2.rowMultiplier}</p>
                                {:else if card.value * card.ValueMultiplier * rangeP2.rowMultiplier < card.Basevalue}
                                    <p class="unit_value" style="color:red;">{card.value * card.ValueMultiplier * rangeP2.rowMultiplier}</p>
                                {:else}
                                    <p class="unit_value">{card.value * card.ValueMultiplier * rangeP2.rowMultiplier}</p>
                                {/if}
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

                <div>
                    <img src="Fog Symbol.png" alt="Weather" class="weatherSymbol" style="visibility:{placedFogCard ? 'visible' : 'hidden'}">
                </div>
            </div>

            <div class="siege" style="top:2%;">

                <div class="siege-value">{siegeP2.value}</div>

                <div class="siege-special">
                    {#each siegeP2.special as special}
                        <div class="card">
                        <img src="{special.name}.webp" alt="{special.name}">
                        </div>
                    {/each}
                </div>
                <div class="siege-units no-scrollbar">
                    {#each siegeP2.units as card}
                        {#if card.type == "unit"}
                            <button class="card" on:click={() => {placeCard(card)}} style="padding-left:0.2vw; padding-top:0.2vw;">
                            <img src="{card.name}.webp" alt="{card.name}">
                            {#if card.value * card.ValueMultiplier * siegeP2.rowMultiplier >= 10}
                                {#if card.value * card.ValueMultiplier * siegeP2.rowMultiplier > card.Basevalue}
                                    <p class="unit_value" style="left:8.5%; color:green;">{card.value * card.ValueMultiplier * siegeP2.rowMultiplier}</p>
                                {:else}
                                    <p class="unit_value" style="left:8.5%;">{card.value * card.ValueMultiplier * siegeP2.rowMultiplier}</p>
                                {/if}

                            {:else}
                                {#if card.value * card.ValueMultiplier * siegeP2.rowMultiplier > card.Basevalue}
                                    <p class="unit_value" style="color:green;">{card.value * card.ValueMultiplier * siegeP2.rowMultiplier}</p>
                                {:else if card.value * card.ValueMultiplier * siegeP2.rowMultiplier < card.Basevalue}
                                    <p class="unit_value" style="color:red;">{card.value * card.ValueMultiplier * siegeP2.rowMultiplier}</p>
                                {:else}
                                    <p class="unit_value">{card.value * card.ValueMultiplier * siegeP2.rowMultiplier}</p>
                                {/if}
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

                <div>
                    <img src="Rain Symbol.png" alt="Weather" class="weatherSymbol" style="visibility:{placedRainCard ? 'visible' : 'hidden'}">
                </div>
            </div>
        {/if}


    </section>

    <section class="Board-bottom">
        {#if isP1Perspective}
            <div class="totalvalue" style="top:72.3%;">{p1TotalValue}</div>

            <button class="melee" on:click={() => selectRow("melee")} style="box-shadow: {meleeSelected ? "#ff9100" : "#ff910000"} 0 0 1vh;">

                <div class="melee-value">{meleeP1.value}</div>

                <div class="melee-special">
                    {#each meleeP1.special as special}
                        <div class="card">
                        <img src="{special.name}.webp" alt="{special.name}">
                        </div>
                    {/each}
                </div>
                <div class="melee-units no-scrollbar">
                    {#each meleeP1.units as card}
                        {#if card.type == "unit"}
                            <button class="card" on:click={() => {placeCard(card)}} style="padding-left:0.2vw; padding-top:0.2vw;">
                            <img src="{card.name}.webp" alt="{card.name}">
                            {#if card.value * card.ValueMultiplier * meleeP1.rowMultiplier>= 10}
                                {#if card.value * card.ValueMultiplier * meleeP1.rowMultiplier > card.Basevalue}
                                    <p class="unit_value" style="left:8.5%; color:green;">{card.value * card.ValueMultiplier * meleeP1.rowMultiplier}</p>
                                {:else}
                                    <p class="unit_value" style="left:8.5%;">{card.value * card.ValueMultiplier * meleeP1.rowMultiplier}</p>
                                {/if}

                            {:else}
                                {#if card.value * card.ValueMultiplier * meleeP1.rowMultiplier > card.Basevalue}
                                    <p class="unit_value" style="color:green;">{card.value * card.ValueMultiplier * meleeP1.rowMultiplier}</p>
                                {:else if card.value * card.ValueMultiplier * meleeP1.rowMultiplier < card.Basevalue}
                                    <p class="unit_value" style="color:red;">{card.value * card.ValueMultiplier * meleeP1.rowMultiplier}</p>
                                {:else}
                                    <p class="unit_value">{card.value * card.ValueMultiplier * meleeP1.rowMultiplier}</p>
                                {/if}
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
                <div>
                    <img src="Frost Symbol.png" alt="Weather" class="weatherSymbol" style="visibility:{placedFrostCard ? 'visible' : 'hidden'}">
                </div>
            </button>

            <button class="range" on:click={() => selectRow("range")} style="box-shadow: {rangeSelected ? "#ff9100" : "#ff910000"} 0 0 1vh;">

                <div class="range-value">{rangeP1.value}</div>

                <div class="range-special">
                    {#each rangeP1.special as special}
                        <div class="card">
                        <img src="{special.name}.webp" alt="{special.name}">
                        </div>
                    {/each}
                </div>
                <div class="range-units no-scrollbar">
                    {#each rangeP1.units as card}
                        {#if card.type == "unit"}
                            <button class="card" on:click={() => {placeCard(card)}} style="padding-left:0.2vw; padding-top:0.2vw;">
                            <img src="{card.name}.webp" alt="{card.name}">
                            {#if card.value * card.ValueMultiplier * rangeP1.rowMultiplier >= 10}
                                {#if card.value * card.ValueMultiplier * rangeP1.rowMultiplier > card.Basevalue}
                                    <p class="unit_value" style="left:8.5%; color:green;">{card.value * card.ValueMultiplier * rangeP1.rowMultiplier}</p>
                                {:else}
                                    <p class="unit_value" style="left:8.5%;">{card.value * card.ValueMultiplier * rangeP1.rowMultiplier}</p>
                                {/if}

                            {:else}
                                {#if card.value * card.ValueMultiplier * rangeP1.rowMultiplier > card.Basevalue}
                                    <p class="unit_value" style="color:green;">{card.value * card.ValueMultiplier * rangeP1.rowMultiplier}</p>
                                {:else if card.value * card.ValueMultiplier * rangeP1.rowMultiplier < card.Basevalue}
                                    <p class="unit_value" style="color:red;">{card.value * card.ValueMultiplier * rangeP1.rowMultiplier}</p>
                                {:else}
                                    <p class="unit_value">{card.value * card.ValueMultiplier * rangeP1.rowMultiplier}</p>
                                {/if}
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

                <div>
                    <img src="Fog Symbol.png" alt="Weather" class="weatherSymbol" style="visibility:{placedFogCard ? 'visible' : 'hidden'}">
                </div>
            </button>

            <button class="siege" on:click={() => selectRow("siege")} style="box-shadow: {siegeSelected ? "#ff9100" : "#ff910000"} 0 0 1vh;">

                <div class="siege-value">{siegeP1.value}</div>

                <div class="siege-special">
                    {#each siegeP1.special as special}
                        <div class="card">
                        <img src="{special.name}.webp" alt="{special.name}">
                        </div>
                    {/each}
                </div>
                <div class="siege-units no-scrollbar">
                    {#each siegeP1.units as card}
                        {#if card.type == "unit"}
                            <button class="card" on:click={() => {placeCard(card)}} style="padding-left:0.2vw; padding-top:0.2vw;">
                            <img src="{card.name}.webp" alt="{card.name}">
                            {#if card.value * card.ValueMultiplier * siegeP1.rowMultiplier >= 10}
                                {#if card.value * card.ValueMultiplier * siegeP1.rowMultiplier > card.Basevalue}
                                    <p class="unit_value" style="left:8.5%; color:green;">{card.value * card.ValueMultiplier * siegeP1.rowMultiplier}</p>
                                {:else}
                                    <p class="unit_value" style="left:8.5%;">{card.value * card.ValueMultiplier * siegeP1.rowMultiplier}</p>
                                {/if}

                            {:else}
                                {#if card.value * card.ValueMultiplier * siegeP1.rowMultiplier > card.Basevalue}
                                    <p class="unit_value" style="color:green;">{card.value * card.ValueMultiplier * siegeP1.rowMultiplier}</p>
                                {:else if card.value * card.ValueMultiplier * siegeP1.rowMultiplier < card.Basevalue}
                                    <p class="unit_value" style="color:red;">{card.value * card.ValueMultiplier * siegeP1.rowMultiplier}</p>
                                {:else}
                                    <p class="unit_value">{card.value * card.ValueMultiplier * siegeP1.rowMultiplier}</p>
                                {/if}
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

                <div>
                    <img src="Rain Symbol.png" alt="Weather" class="weatherSymbol" style="visibility:{placedRainCard ? 'visible' : 'hidden'}">
                </div>
            </button>
        {/if}



        {#if !isP1Perspective}
            <div class="totalvalue" style="top:72%;">{p2TotalValue}</div>

            <button class="melee" on:click={() => selectRow("melee")} style="box-shadow: {meleeSelected ? "#ff9100" : "#ff910000"} 0 0 1vh;">

                <div class="melee-value">{meleeP2.value}</div>

                <div class="melee-special">
                    {#each meleeP2.special as special}
                        <div class="card">
                        <img src="{special.name}.webp" alt="{special.name}">
                        </div>
                    {/each}
                </div>
                <div class="melee-units no-scrollbar">
                    {#each meleeP2.units as card}
                        {#if card.type == "unit"}
                            <button class="card" on:click={() => {placeCard(card)}} style="padding-left:0.2vw; padding-top:0.2vw;">
                            <img src="{card.name}.webp" alt="{card.name}">
                            {#if card.value * card.ValueMultiplier * meleeP2.rowMultiplier >= 10}
                                {#if card.value * card.ValueMultiplier * meleeP2.rowMultiplier > card.Basevalue}
                                    <p class="unit_value" style="left:8.5%; color:green;">{card.value * card.ValueMultiplier * meleeP2.rowMultiplier}</p>
                                {:else}
                                    <p class="unit_value" style="left:8.5%;">{card.value * card.ValueMultiplier * meleeP2.rowMultiplier}</p>
                                {/if}

                            {:else}
                                {#if card.value * card.ValueMultiplier * meleeP2.rowMultiplier > card.Basevalue}
                                    <p class="unit_value" style="color:green;">{card.value * card.ValueMultiplier * meleeP2.rowMultiplier}</p>
                                {:else if card.value * card.ValueMultiplier * meleeP2.rowMultiplier < card.Basevalue}
                                    <p class="unit_value" style="color:red;">{card.value * card.ValueMultiplier * meleeP2.rowMultiplier}</p>
                                {:else}
                                    <p class="unit_value">{card.value * card.ValueMultiplier * meleeP2.rowMultiplier}</p>
                                {/if}
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

                <div>
                    <img src="Frost Symbol.png" alt="Weather" class="weatherSymbol" style="visibility:{placedFrostCard ? 'visible' : 'hidden'}">
                </div>
            </button>

            <button class="range" on:click={() => selectRow("range")} style="box-shadow: {rangeSelected ? "#ff9100" : "#ff910000"} 0 0 1vh;">

                <div class="range-value">{rangeP2.value}</div>

                <div class="range-special">
                    {#each rangeP2.special as special}
                        <div class="card">
                        <img src="{special.name}.webp" alt="{special.name}">
                        </div>
                    {/each}
                </div>
                <div class="range-units no-scrollbar">
                    {#each rangeP2.units as card}
                        {#if card.type == "unit"}
                            <button class="card" on:click={() => {placeCard(card)}} style="padding-left:0.2vw; padding-top:0.2vw;">
                            <img src="{card.name}.webp" alt="{card.name}">
                            {#if card.value * card.ValueMultiplier * rangeP2.rowMultiplier >= 10}
                                {#if card.value * card.ValueMultiplier * rangeP2.rowMultiplier > card.Basevalue}
                                    <p class="unit_value" style="left:8.5%; color:green;">{card.value * card.ValueMultiplier * rangeP2.rowMultiplier}</p>
                                {:else}
                                    <p class="unit_value" style="left:8.5%;">{card.value * card.ValueMultiplier * rangeP2.rowMultiplier}</p>
                                {/if}
                            {:else}
                                {#if card.value * card.ValueMultiplier * rangeP2.rowMultiplier > card.Basevalue}
                                    <p class="unit_value" style="color:green;">{card.value * card.ValueMultiplier * rangeP2.rowMultiplier}</p>
                                {:else if card.value * card.ValueMultiplier * rangeP2.rowMultiplier < card.Basevalue}
                                    <p class="unit_value" style="color:red;">{card.value * card.ValueMultiplier * rangeP2.rowMultiplier}</p>
                                {:else}
                                    <p class="unit_value">{card.value * card.ValueMultiplier * rangeP2.rowMultiplier}</p>
                                {/if}
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

                <div>
                    <img src="Fog Symbol.png" alt="Weather" class="weatherSymbol" style="visibility:{placedFogCard ? 'visible' : 'hidden'}">
                </div>
            </button>

            <button class="siege" on:click={() => selectRow("siege")} style="box-shadow: {siegeSelected ? "#ff9100" : "#ff910000"} 0 0 1vh;">

                <div class="siege-value">{siegeP2.value}</div>

                <div class="siege-special">
                    {#each siegeP2.special as special}
                        <div class="card">
                        <img src="{special.name}.webp" alt="{special.name}">
                        </div>
                    {/each}
                </div>
                <div class="siege-units no-scrollbar">
                    {#each siegeP2.units as card}
                        {#if card.type == "unit"}
                            <button class="card" on:click={() => {placeCard(card)}} style="padding-left:0.2vw; padding-top:0.2vw;">
                            <img src="{card.name}.webp" alt="{card.name}">
                            {#if card.value * card.ValueMultiplier * siegeP2.rowMultiplier >= 10}
                                {#if card.value * card.ValueMultiplier * siegeP2.rowMultiplier > card.Basevalue}
                                    <p class="unit_value" style="left:8.5%; color:green;">{card.value * card.ValueMultiplier * siegeP2.rowMultiplier}</p>
                                {:else}
                                    <p class="unit_value" style="left:8.5%;">{card.value * card.ValueMultiplier * siegeP2.rowMultiplier}</p>
                                {/if}
                            {:else}
                                {#if card.value * card.ValueMultiplier * siegeP2.rowMultiplier > card.Basevalue}
                                    <p class="unit_value" style="color:green;">{card.value * card.ValueMultiplier * siegeP2.rowMultiplier}</p>
                                {:else if card.value * card.ValueMultiplier * siegeP2.rowMultiplier < card.Basevalue}
                                    <p class="unit_value" style="color:red;">{card.value * card.ValueMultiplier * siegeP2.rowMultiplier}</p>
                                {:else}
                                    <p class="unit_value">{card.value * card.ValueMultiplier * siegeP2.rowMultiplier}</p>
                                {/if}
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

                <div>
                    <img src="Rain Symbol.png" alt="Weather" class="weatherSymbol" style="visibility:{placedRainCard ? 'visible' : 'hidden'}">
                </div>
            </button>
        {/if}
            
        
    </section>



    <section class="TopPlayerStats">
        {#if isP1Perspective}
            <div class="PlayerInfo">
                <h1>{p2Username}</h1>
                <p>{p2?.[2]?.name ?? 'Unknown Faction'}</p>
            </div>

            <div class="amountofCards" style="display:inline-flex; top: 60%;">
                <img src="cards_symbol.png" alt="cardsymbol">
                {p2Hand.length}
                <img src="Gem.png" alt="gem" class="gem" style="margin-left: 0.7vw; visibility: {p2Gem1Visibility};">
                <img src="Gem.png" alt="gem" class="gem" style="visibility: {p2Gem2Visibility};">
            </div>
        {/if}
        {#if !isP1Perspective}
            <div class="PlayerInfo">
                <h1>{p1Username}</h1>
                <p>{p1?.[2]?.name ?? 'Unknown Faction'}</p>
            </div>

            <div class="amountofCards" style="display:inline-flex; top: 60%;">
                <img src="cards_symbol.png" alt="cardsymbol">
                {p1Hand.length}
                <img src="Gem.png" alt="gem" class="gem" style="margin-left: 0.7vw; visibility: {p1Gem1Visibility};">
                <img src="Gem.png" alt="gem" class="gem" style="visibility: {p1Gem2Visibility};">
            </div> 
        {/if}
    </section>

    <section class="BottomPlayerStats">
        {#if isP1Perspective}
            <div class="PlayerInfo" style="margin-top: 40%;">
                <h1>{p1Username}</h1>
                <p>{p1?.[2]?.name ?? 'Unknown Faction'}</p>
            </div>

            <div class="amountofCards" style="display:inline-flex;">
                <img src="cards_symbol.png" alt="cardsymbol">
                {p1Hand.length}
                <img src="Gem.png" alt="gem" class="gem" style="margin-left: 0.7vw; visibility: {p1Gem1Visibility};">
                <img src="Gem.png" alt="gem" class="gem" style="visibility: {p1Gem2Visibility};">
            </div>
        {/if}
        {#if !isP1Perspective}
            <div class="PlayerInfo" style="margin-top: 40%;">
                <h1>{p2Username}</h1>
                <p>{p2?.[2]?.name ?? 'Unknown Faction'}</p>
            </div>

            <div class="amountofCards" style="display:inline-flex;">
                
                <img src="cards_symbol.png" alt="cardsymbol">
                {p2Hand.length}
                <img src="Gem.png" alt="gem" class="gem" style="margin-left: 0.7vw; visibility: {p2Gem1Visibility};">
                <img src="Gem.png" alt="gem" class="gem" style="visibility: {p1Gem2Visibility};">
            </div> 
        {/if}
    </section>

    <div class="weather">
        {#each weather as card}
            <button class="card" on:click={() => {placeCard(card)}}>
                <img src="{card.name}.webp" alt="{card.name}">
            </button>
        {/each}
    </div>

    <button class="passRound" disabled={!isMyTurn} style="opacity: {isMyTurn ? 1 : 0.45};" on:click|preventDefault={() => {passedTurn = true; endTurn()}}>
        <img src="keyboard_tab_icon_outline.png" alt=enter class="enter"> Tab to pass Round
    </button>


        
</main>

<aside class="Ready player"> 
    <div class="darken" style="display:{popupVisibility};">
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
        
        background-image: url("/Board.png");
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

    .match-status {
        position: absolute;
        top: 1.5vh;
        left: 50%;
        transform: translateX(-50%);
        z-index: 20;
        padding: 0.5rem 0.9rem;
        border-radius: 0.6rem;
        background: rgba(0, 0, 0, 0.72);
        color: #f8e9c2;
        border: 1px solid rgba(255, 187, 51, 0.45);
        font: 500 0.95rem 'Roboto', sans-serif;
    }

    .match-status--error {
        background: rgba(75, 8, 8, 0.82);
        border-color: rgba(255, 120, 120, 0.5);
        color: #ffe8e8;
    }

    .match-status--info {
        top: 7vh;
        background: rgba(22, 44, 22, 0.82);
        border-color: rgba(111, 219, 111, 0.5);
        color: #eaffea;
    }

    .match-status--warning {
        top: 12.5vh;
        background: rgba(63, 42, 3, 0.88);
        border-color: rgba(255, 192, 74, 0.6);
        color: #ffe9ba;
    }

    main button {
        border: none;
        outline: none;
        -webkit-appearance: none;
        appearance: none;
    }

    main button:focus,
    main button:focus-visible {
        outline: none;
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
    .weatherSymbol {
        position: absolute;
        top: 23%;
        right: -8%;
        width: 6.5%;
        height: 50%;
        background-color: none;
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
        justify-items: center;
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
        justify-content: center;
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
        justify-content: center;
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

    /* Weather row */
    .weather {
        position: absolute;
        top: 43.1%;
        left: 7.35%;
        width: 14.6%;
        height: 13.4%;
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
    .PlayerInfo{
        font: 300 1.7vh 'Roboto', sans-serif;
        color: #e0c760;
        margin-top: 5%;
        margin-left: 5%;
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