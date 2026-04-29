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