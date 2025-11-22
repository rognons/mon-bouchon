
<script lang="ts">
export let label: string;
export let options: any[];
export let value: string;
export let emoji: string;
export let ariaLabel: string;

let isOpen = false;

function toggleDropdown() {
  isOpen = !isOpen;
}

function selectOption(optionValue: string) {
  value = optionValue;
}
</script>

<div class="filter-group">
    <button
        class="filter-header"
        on:click={toggleDropdown}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
    >
        <div class="header-content">
            <span class="emoji" aria-label={ariaLabel} title={ariaLabel}>{emoji}</span>
            <span class="header-label">{label}</span>
            {#if value}
                <span class="active-badge">1</span>
            {/if}
        </div>
        <span class="toggle-icon">{isOpen ? '−' : '+'}</span>
    </button>
    {#if isOpen}
        <div class="options-list">
            <button
                class="option-item"
                class:selected={!value}
                on:click={() => selectOption('')}
            >
                {label}
            </button>
            {#each options as option, i}
                {#if i === 0}
                    <!-- skip, label already rendered above -->
                {:else if typeof option === 'object' && option !== null}
                    <button
                        class="option-item"
                        class:selected={value === option.value}
                        on:click={() => selectOption(option.value)}
                    >
                        {option.label}
                    </button>
                {:else}
                    <button
                        class="option-item"
                        class:selected={value === option}
                        on:click={() => selectOption(option)}
                    >
                        {option}
                    </button>
                {/if}
            {/each}
        </div>
    {/if}
</div>

<style>
    .filter-group {
        display: flex;
        flex-direction: column;
        background: #fff;
        border: 1px solid #e9ecef;
        border-radius: 6px;
        overflow: hidden;
        transition: all 0.3s ease;
    }
    .filter-header {
        width: 100%;
        padding: 0.75rem 1rem;
        background: #ffffff;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: space-between;
        transition: background-color 0.2s ease;
        font-family: "Open Sans", Arial, sans-serif;
    }
    .filter-header:hover {
        background-color: #fef8fb;
    }
    .header-content {
        display: flex;
        align-items: center;
        gap: 0.7rem;
        flex: 1;
    }
    .emoji {
        font-size: 16px;
        flex-shrink: 0;
    }
    .header-label {
        font-size: 14px;
        color: #221f20;
        font-weight: 500;
        text-align: left;
    }
    .active-badge {
        background-color: #f0c6da;
        color: #221f20;
        font-size: 12px;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 12px;
        line-height: 1.2;
    }
    .toggle-icon {
        font-size: 18px;
        font-weight: 600;
        color: #f0c6da;
        flex-shrink: 0;
        line-height: 1;
    }
    .options-list {
        display: flex;
        flex-direction: column;
        border-top: 1px solid #e9ecef;
        animation: slideDown 0.2s ease;
    }
    @keyframes slideDown {
        from {
            opacity: 0;
            max-height: 0;
        }
        to {
            opacity: 1;
            max-height: 500px;
        }
    }
    .option-item {
        width: 100%;
        padding: 0.65rem 1rem 0.65rem 2.7rem;
        border: none;
        background: none;
        text-align: left;
        cursor: pointer;
        font-size: 14px;
        font-family: "Open Sans", Arial, sans-serif;
        color: #221f20;
        transition: background-color 0.2s ease;
        border-top: 1px solid #f5f5f5;
    }
    .option-item:first-child {
        border-top: none;
    }
    .option-item:hover {
        background-color: #fef8fb;
    }
    .option-item.selected {
        background-color: #f0c6da;
        color: #221f20;
        font-weight: 500;
    }
</style>
