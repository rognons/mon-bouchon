
<script lang="ts">
export let label: string;
export let options: any[];
export let value: string;
export let emoji: string;
export let ariaLabel: string;
</script>

<div class="filter-group">
    <div class="emoji-select-row">
        <span aria-label={ariaLabel} title={ariaLabel}>{emoji}</span>
        <select bind:value aria-label={ariaLabel}>
            <option value="">{label}</option>
            {#each options as option, i}
                {#if i === 0}
                    <!-- skip, label already rendered above -->
                {:else if typeof option === 'object' && option !== null}
                    <option value={option.value}>{option.label}</option>
                {:else}
                    <option value={option}>{option}</option>
                {/if}
            {/each}
        </select>
    </div>
</div>

<style>
    .filter-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        background: none;
        padding-left: 0.75rem;
        border-radius: 0;
        border: none;
        box-shadow: none;
        transition: none;
    }
    .emoji-select-row {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 0.7rem;
        width: 100%;
    }
    .emoji-select-row select {
        flex: 1 1 0;
        width: 100%;
        min-width: 0;
        box-sizing: border-box;
    }
    .filter-group select {
        padding: 0.75rem 1rem;
        border: 1px solid #e9ecef;
        border-radius: 6px;
        font-size: 14px;
        background: #ffffff;
        color: #221f20;
        cursor: pointer;
        font-family: "Open Sans", Arial, sans-serif;
        font-weight: 400;
        transition: all 0.3s ease;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .filter-group select:focus {
        outline: none;
        border-color: #f0c6da;
        box-shadow: 0 0 0 3px rgba(240, 198, 218, 0.2);
    }
    .filter-group select:hover {
        border-color: #f0c6da;
        box-shadow: 0 2px 6px rgba(240, 198, 218, 0.2);
    }
</style>
