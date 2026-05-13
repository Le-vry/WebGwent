<script>
	/**
	 * Reusable card display modal with cylinder scroller
	 * Used for graveyard and mulligan redraw
	 *
	 * Props:
	 * - cards: array of card objects to display
	 * - isOpen: boolean controlling visibility
	 * - onClose: function called when modal closes
	 * - onCardClick: function(card) called when a card is clicked
	 * - cardCustomClass: function(card) returning additional CSS class
	 * - showSkipButton: boolean, show skip/action button at bottom
	 * - skipButtonLabel: string, label for skip/action button
	 * - onSkipClick: function called when skip button is clicked
	 * - isPendingAction: boolean, highlight cards as actionable
	 * - hideCloseBtn: boolean
	 */
	export let cards = [];
	export let isOpen = false;
	export let onClose = () => {};
	export let onCardClick = (card) => {};
	export let cardCustomClass = (card) => '';
	export let showSkipButton = false;
	export let skipButtonLabel = 'Skip';
	export let onSkipClick = () => {};
	export let isPendingAction = false;
	export let hideCloseBtn = false;

	let scrollOffset = 0;
	let scroller = null;
	let scrollTimeout = null;

	function handleScroll(e) {
		scrollOffset = e.target.scrollLeft / 230;
		if (scrollTimeout) clearTimeout(scrollTimeout);
		scrollTimeout = setTimeout(() => {
			if (scroller) {
				scroller.scrollTo({
					left: Math.round(scrollOffset) * 230,
					behavior: 'smooth'
				});
			}
		}, 150);
	}

	function handleWheel(e) {
		if (scroller && isOpen) {
			e.preventDefault();
			const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
			scroller.scrollLeft += delta;
		}
	}

	function getCardAbilityInfo(card) {
		if (card.ability === 'tight_bond') {
			return 'Tight Bond: Place next to a card with the same name to double the strength of both cards.';
		} else if (card.ability === 'medic') {
			return 'Medic: Choose one card from your discard pile and play it instantly (no Heroes or Special Cards).';
		} else if (card.type === 'hero') {
			return 'Hero: Not affected by any Special Cards or abilities.';
		} else if (card.ability === 'morale_boost') {
			return 'Morale boost: Adds +1 to all units in the row (excluding itself).';
		} else if (card.ability === 'spy') {
			return "Spy: Place on your opponent's battlefield (counts towards opponent's total) and draw 2 cards from your deck.";
		} else if (card.ability === 'agile') {
			return 'Agile: Can be placed in either the Close Combat or the Ranged Combat row. Cannot be moved once placed.';
		} else if (card.name === 'Villentretenmerth') {
			return "Scorch - Close Combat: Destroy your enemy's strongest Close Combat unit(s) if the combined strength of all his or her Close Combat units is 10 or more.";
		} else if (card.name === 'Toad') {
			return "Scorch - Ranged: Destroy your enemy's strongest Ranged Combat unit(s) if the combined strength of all his or her Ranged Combat units is 10 or more.";
		} else if (card.name === 'Schirrú' || card.name === 'Schirru') {
			return "Scorch - Siege: Destroys your enemy's strongest Siege Combat unit(s) if the combined strength of all his or her Siege Combat units is 10 or more.";
		} else if (card.ability === 'muster') {
			return 'Muster: Find any cards with the same name in your deck and play them instantly.';
		} else if (card.ability === 'W1' || card.name === 'Biting Frost') {
			return 'Sets the strength of all Close Combat cards to 1 for both players.';
		} else if (card.ability === 'W2' || card.name === 'Impenetrable Fog') {
			return 'Sets the strength of all Ranged Combat cards to 1 for both players.';
		} else if (card.ability === 'W3' || card.name === 'Torrential Rain') {
			return 'Sets the strength of all Siege Combat cards to 1 for both players.';
		} else if (card.ability === 'W4' || card.name === 'Skellige Storm') {
			return 'Reduces the Strength of all Range and Siege Units to 1.';
		} else if (card.ability === 'W5' || card.name === 'Clear Weather') {
			return 'Removes all Weather Card (Biting Frost, Impenetrable Fog and Torrential Rain) effects.';
		} else if (
			card.ability === 'horn' ||
			card.ability === "Commander's Horn" ||
			card.name === "Commander's Horn"
		) {
			return "Commander's Horn: Doubles the strength of all unit cards in that row. Limited to 1 per row.";
		} else if (card.ability === 'decoy' || card.name === 'Decoy') {
			return 'Swap with a card on the battlefield to return it to your hand.';
		} else if (card.ability === 'scorch' || card.ability === 'Scorch') {
			return 'Scorch: Discards after playing. Kills the strongest card(s) on the battlefield.';
		}
		return '';
	}
</script>

{#if isOpen}
	<div class="card-display-modal" on:click={onClose} role="presentation">
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
		<div
			class="card-display-modal__panel"
			on:click|stopPropagation
			on:wheel|preventDefault={handleWheel}
			role="dialog"
			aria-modal="true"
			aria-label="Card display"
		>
			{#if !hideCloseBtn}
				<button class="card-display-modal__close" on:click={onClose} aria-label="Close modal"
					>X</button
				>
			{/if}

			{#if showSkipButton}
				<button class="skip-action-btn" on:click|stopPropagation={onSkipClick}>
					{skipButtonLabel}
				</button>
			{/if}

			<div class="cylinder-scroller-wrapper">
				<div class="cylinder-viewport">
					{#each cards as card, i (i)}
						<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
						<div
							class="cylinder-card {cardCustomClass(card)} {isPendingAction ? 'action-target' : ''}"
							on:click|stopPropagation={() => onCardClick(card)}
							style="
                                pointer-events: auto;
                                transition: transform 0.2s ease, opacity 0.2s ease, z-index 0s;
                                --tz: {-Math.abs(i - scrollOffset) * 22}vw;
                                --tx: {(i - scrollOffset) * 19}vw;
                                transform: translateX(var(--tx)) translateZ(var(--tz));
                                opacity: {Math.max(
								0,
								1 - Math.max(0, Math.abs(i - scrollOffset) - 2) * 1.5
							)};
                                visibility: {Math.abs(i - scrollOffset) < 4.5
								? 'visible'
								: 'hidden'};
                                z-index: {100 - Math.round(Math.abs(i - scrollOffset) * 10)};
                            "
						>
							<img src="{card.name}.webp" alt={card.name} draggable="false" />
							{#if card.type == 'unit'}
								<p
									class="card-display-unit-value"
									style={(card.Basevalue !== undefined ? card.Basevalue : card.value) >= 10
										? 'left: 9%;'
										: ''}
								>
									{card.Basevalue !== undefined ? card.Basevalue : card.value}
								</p>
							{/if}
							{#if Math.round(scrollOffset) === i}
								{@const info = getCardAbilityInfo(card)}
								{#if info}
									<div class="card-display-ability-info">
										{info}
									</div>
								{/if}
							{/if}
						</div>
					{/each}
				</div>

				<div class="native-scroller" bind:this={scroller} on:scroll={handleScroll}>
					<div
						style="width: calc(100% + {Math.max(0, cards.length - 1) * 230}px); height: 1px;"
					></div>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.card-display-modal {
		position: fixed;
		inset: 0;
		z-index: 100;
		background: rgba(10, 10, 10, 0.4);
		display: flex;
		justify-content: center;
		align-items: flex-start;
		padding-top: 10vh;
	}

	.card-display-modal__panel {
		position: relative;
		width: 100vw;
		height: 80vh;
		background: transparent;
		border-top: 3px solid;
		border-bottom: 3px solid;
		border-left: none;
		border-right: none;
		border-image: linear-gradient(
				to right,
				transparent 0%,
				rgba(223, 154, 55, 0.8) 50%,
				transparent 100%
			)
			1;
		padding: 1.2rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		overflow: hidden;
	}

	.card-display-modal__close {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		background: none;
		border: none;
		color: #df9a37;
		font:
			700 1.5rem 'Roboto',
			sans-serif;
		cursor: pointer;
		z-index: 101;
		padding: 0.3rem 0.5rem;
		transition: color 0.2s ease;
	}

	.card-display-modal__close:hover {
		color: #ffb24c;
	}

	.cylinder-scroller-wrapper {
		position: relative;
		width: 100%;
	}

	.cylinder-viewport {
		position: relative;
		width: 100%;
		height: 60vh;
		min-height: 400px;
		perspective: 2500px;
		display: flex;
		justify-content: center;
		align-items: center;
		pointer-events: none;
		overflow: visible;
	}

	.cylinder-card {
		position: absolute;
		width: 15vw;
		aspect-ratio: 5 / 8;
		max-width: 250px;
		transform-style: preserve-3d;
		will-change: transform, opacity;
		transition: transform 0.2s ease;
	}

	.cylinder-card:hover {
		transform: translateX(var(--tx)) translateZ(var(--tz)) scale(1.05) !important;
		z-index: 200 !important;
	}

	.cylinder-card:hover img {
		box-shadow: 0 0 2.5vh 0.8vh rgba(255, 145, 0, 0.7);
		outline: 0.4vh solid rgba(255, 145, 0, 0.9);
	}

	.cylinder-card img {
		width: 100%;
		height: 100%;
		border-radius: 0.75rem;
		box-shadow: 0 0 1.2vh rgba(0, 0, 0, 0.7);
		backface-visibility: hidden;
		transition: all 0.2s ease;
	}

	.card-display-unit-value {
		position: absolute;
		font:
			500 clamp(10px, 1.8vw, 24px) 'Roboto',
			sans-serif;
		top: 6.5%;
		left: 14%;
		z-index: 10;
		color: black;
		margin: 0;
	}

	.card-display-ability-info {
		position: absolute;
		top: 105%;
		left: 50%;
		transform: translateX(-50%);
		width: 140%;
		height: 25%;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0.85);
		color: #fcebbb;
		font-family: 'Roboto', sans-serif;
		font-size: clamp(0.7rem, 1vw, 0.9rem);
		padding: 0.5rem;
		border: 1px solid #df9a37;
		border-radius: 0.15rem;
		text-align: center;
		box-shadow: 0 0.5vh 1vh rgba(0, 0, 0, 0.8);
		pointer-events: none;
		z-index: 15;
	}

	.native-scroller {
		width: 100%;
		overflow-x: auto;
		overflow-y: hidden;
		margin-top: 1rem;
		padding-bottom: 0.5rem;
		scrollbar-width: none;
		cursor: grab;
	}

	.native-scroller:active {
		cursor: grabbing;
	}

	.native-scroller::-webkit-scrollbar {
		display: none;
	}

	.skip-action-btn {
		position: absolute;
		z-index: 1000;
		bottom: 2rem;
		left: 50%;
		transform: translateX(-50%);
		background: rgba(43, 23, 10, 0.95);
		color: #e5cd94;
		border: 2px solid #a3722e;
		border-radius: 4px;
		padding: 10px 24px;
		font-family: inherit;
		font-weight: bold;
		font-size: 1.2rem;
		cursor: pointer;
		text-transform: uppercase;
		letter-spacing: 1px;
		transition: all 0.2s ease;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.7);
	}

	.skip-action-btn:hover {
		background: rgba(63, 33, 15, 0.95);
		border-color: #d19a3f;
		transform: translateX(-50%) scale(1.05);
	}

	.action-target {
		cursor: pointer;
		transition: transform 0.2s ease;
		pointer-events: auto;
	}

	.action-target:hover {
		transform: scale(1.05);
		box-shadow: 0 0 15px rgba(255, 215, 0, 0.8);
		z-index: 100;
	}
</style>
