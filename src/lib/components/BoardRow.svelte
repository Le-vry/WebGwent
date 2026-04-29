<script lang="ts">
	export let rowType: 'melee' | 'range' | 'siege';
	export let rowData: any;
	export let onRowClick: (type: string) => void;
	export let onCardClick: (card: any, type: string) => void;
	export let isDecoyTarget: (card: any, type: string) => boolean;
	export let weatherActive: boolean;
	export let isTopBoard: boolean; // true if this is rendered on the top half of the board
	export let isSelectedRow: boolean = false;

	const weatherIcons = {
		melee: 'Frost Symbol.png',
		range: 'Fog Symbol.png',
		siege: 'Rain Symbol.png'
	};

	let rowStyle = '';
	if (isTopBoard) {
		if (rowType === 'melee') rowStyle = 'top: 67%;';
		else if (rowType === 'range') rowStyle = '';
		else if (rowType === 'siege') rowStyle = 'top:2%;';
	} else {
		let shadow = isSelectedRow ? 'box-shadow: #ff9100 0 0 1vh;' : 'box-shadow: #ff910000 0 0 1vh;';
		rowStyle = shadow;
	}

	function getScore(card: any) {
		return card.value * card.ValueMultiplier * rowData.rowMultiplier;
	}
</script>

<button class={rowType} style={rowStyle} on:click={() => onRowClick(rowType)}>
	<div
		class="{rowType}-value"
		style={isTopBoard && rowType !== 'siege' ? 'top:35%;' : ''}
	>
		{rowData.value}
	</div>

	<div class="{rowType}-special">
		{#each rowData.special as special}
			<div class="card">
				<img src="{special.name}.webp" alt={special.name} />
			</div>
		{/each}
	</div>
	
	<div class="{rowType}-units no-scrollbar">
		{#each rowData.units as card}
			{#if card.type === 'unit'}
				<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
				<button
					class="card"
					class:decoy-target={isDecoyTarget(card, rowType)}
					on:click|stopPropagation={() => onCardClick(card, rowType)}
					style="padding-left:0.2vw; padding-top:0.2vw;"
				>
					<img src="{card.name}.webp" alt={card.name} />
					<p class="unit_value"
						style:left={getScore(card) >= 10 ? '8.5%' : undefined}
						style:color={getScore(card) > card.Basevalue ? 'green' : getScore(card) < card.Basevalue ? 'red' : undefined}
					>
						{getScore(card)}
					</p>
				</button>
			{:else if card.type === 'hero'}
				<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
				<button
					class="card"
					on:click|stopPropagation={() => onCardClick(card, rowType)}
				>
					<img src="{card.name}.webp" alt={card.name} />
				</button>
			{/if}
		{/each}
	</div>

	<div>
		<img
			src={weatherIcons[rowType]}
			alt="Weather"
			class="weatherSymbol"
			style="visibility:{weatherActive ? 'visible' : 'hidden'}"
		/>
	</div>
</button>

<style>
	/* Row Styles */
	.weatherSymbol {
		position: absolute;
		top: 23%;
		right: -8%;
		width: 6.5%;
		height: 50%;
		background-color: transparent;
	}

	.melee, .range, .siege {
		background-color: transparent;
		border: none;
		border-radius: 0;
		padding: 0;
		position: absolute;
		width: 100%;
		height: 31%;
	}
	.melee { top: 2%; }
	.range { top: 35%; }
	.siege { top: 68%; }

	.melee-value, .range-value, .siege-value {
		position: absolute;
		left: 0.8%;
		width: 5.3%;
		background-color: transparent;
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
	.melee-value, .range-value { top: 34%; }
	.siege-value { top: 36.25%; }

	.melee-special, .range-special, .siege-special {
		position: absolute;
		left: 7%;
		width: 12.5%;
		height: 92%;
		background-color: transparent;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.melee-special { top: 5%; }
	.range-special { top: 4%; }
	.siege-special { top: 5%; }

	.melee-units, .range-units, .siege-units {
		position: absolute;
		left: 20.2%;
		width: 79.5%;
		height: 92%;
		background-color: transparent;
		display: flex;
		flex-wrap: nowrap;
		justify-content: center;
		align-items: center;
	}
	.melee-units { top: 4%; }
	.range-units { top: 4%; }
	.siege-units { top: 5%; }

	/* Cards Styles */
	.card {
		position: relative;
		background: none;
		border: none;
		width: 5vw;
		min-width: 5vw;
		height: 11.7vh;
		margin-left: 0.5%;
		overflow: hidden;
		padding: 0;
		cursor: pointer;
	}
	.card img {
		width: 100%;
		height: 16vh;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
	}
	.card:hover {
		transform: scale(1.025);
		transition: all 0.2s ease-in-out;
	}
	.card:active {
		transform: scale(1.01);
		transition: all 0.2s ease-in-out;
	}
	.card img:hover {
		box-shadow: #ff9100 0 0 1vh;
	}
	.card img:active {
		box-shadow: #ff9100 0 0 0.5vh;
	}
	.decoy-target {
		transform: scale(1.045);
		transition: transform 0.16s ease, filter 0.16s ease;
		filter: brightness(1.08);
	}
	.decoy-target img {
		box-shadow: 0 0 0.75vh rgba(255, 223, 120, 0.9);
	}
	.unit_value {
		position: absolute;
		font: 500 0.75em 'Roboto', sans-serif;
		top: 7%;
		left: 13.5%;
		z-index: 1;
		color: black;
		margin: 0;
	}
</style>