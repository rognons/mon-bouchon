<script lang="ts">
export let label: string;
export let tooltip: string | undefined = undefined;
export let checked: boolean;
export let emoji: string;
</script>

<div class="checkbox-group">
    <label>
        <input type="checkbox" bind:checked />
        {emoji}
        {label}
        {#if tooltip}
            <span class="tooltip-block">
                ℹ️
                <span class="tooltip-text">{tooltip}</span>
            </span>
        {/if}
    </label>
</div>

<style>
    .checkbox-group {
        margin-bottom: 0.5rem;
    }
    .checkbox-group label {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-family: "Open Sans", Arial, sans-serif;
        font-size: 14px;
        font-weight: 400;
        color: #221f20;
        cursor: pointer;
        padding: 0.75rem;
        border-radius: 6px;
        background: #ffffff;
        transition: all 0.2s ease;
        border: 1px solid transparent;
    }
    .checkbox-group label:hover {
        background: rgba(240, 198, 218, 0.1);
        border-color: rgba(240, 198, 218, 0.3);
    }
    .checkbox-group input[type="checkbox"] {
        width: 18px;
        height: 18px;
        accent-color: #f0c6da;
    }
    .tooltip-block {
        position: relative;
        cursor: help;
        display: inline-block;
    }
    .tooltip-block .tooltip-text {
        visibility: hidden;
        width: 320px;
        background: #f0c6da;
        color: #221f20;
        text-align: left;
        border-radius: 8px;
        padding: 0.8em 1em;
        position: absolute;
        z-index: 10;
        bottom: 125%;
        left: 50%;
        transform: translateX(-50%);
        box-shadow: 0 4px 16px rgba(240, 198, 218, 0.15);
        font-size: 0.95em;
        opacity: 0;
        transition: opacity 0.2s;
        pointer-events: none;
    }
    .tooltip-block:hover .tooltip-text,
    .tooltip-block:focus .tooltip-text {
        visibility: visible;
        opacity: 1;
        pointer-events: auto;
    }
</style>
