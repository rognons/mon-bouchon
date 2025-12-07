<script lang="ts">
import { onMount, onDestroy } from 'svelte';

export let label: string;
export let options: string[];
export let selectedValues: string[] = [];
export let emoji: string;
export let ariaLabel: string;
export let tooltips: Record<string, string> = {};

let isOpen = false;
let activeTooltip: string | null = null;

function toggleAccordion() {
  isOpen = !isOpen;
}

function toggleOption(option: string) {
  if (selectedValues.includes(option)) {
    selectedValues = selectedValues.filter((v) => v !== option);
  } else {
    selectedValues = [...selectedValues, option];
  }
}

function toggleTooltip(option: string, event: Event) {
  event.preventDefault();
  event.stopPropagation();
  activeTooltip = activeTooltip === option ? null : option;
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (!target.closest('.tooltip-block')) {
    activeTooltip = null;
  }
}

onMount(() => {
  if (typeof document !== 'undefined') {
    document.addEventListener('click', handleClickOutside);
  }
});

onDestroy(() => {
  if (typeof document !== 'undefined') {
    document.removeEventListener('click', handleClickOutside);
  }
});
</script>

<div class="filter-group">
  <button
    class="filter-header"
    on:click={toggleAccordion}
    aria-label={ariaLabel}
    aria-expanded={isOpen}
  >
    <div class="header-content">
      <span class="emoji" aria-label={ariaLabel} title={ariaLabel}>{emoji}</span>
      <span class="header-label">{label}</span>
      {#if selectedValues.length > 0}
        <span class="count-badge">{selectedValues.length}</span>
      {/if}
    </div>
    <span class="toggle-icon">{isOpen ? '−' : '+'}</span>
  </button>
  {#if isOpen}
    <div class="options-list">
      {#each options as option}
        {#if option !== ''}
          <label class="option-item">
            <input
              type="checkbox"
              checked={selectedValues.includes(option)}
              on:change={() => toggleOption(option)}
            />
            <span>{option}</span>
            {#if tooltips[option]}
              <span
                class="tooltip-block"
                class:active={activeTooltip === option}
                on:click={(e) => {
                  e.stopPropagation();
                  toggleTooltip(option, e);
                }}
                on:keydown={(e) => {
                  if (e.key === 'Enter') {
                    e.stopPropagation();
                    toggleTooltip(option, e);
                  }
                }}
                role="button"
                tabindex="0"
              >
                ℹ️
                <span class="tooltip-text">{tooltips[option]}</span>
              </span>
            {/if}
          </label>
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
    overflow: visible;
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
  .count-badge {
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
    overflow: visible;
    position: relative;
    z-index: 1;
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
    display: flex;
    align-items: center;
    padding: 0.65rem 1rem 0.65rem 1rem;
    cursor: pointer;
    transition: background-color 0.2s ease;
    gap: 0.6rem;
    font-family: "Open Sans", Arial, sans-serif;
    font-size: 14px;
    border-top: 1px solid #f5f5f5;
    position: relative;
  }
  .option-item:first-child {
    border-top: none;
  }
  .option-item:hover {
    background-color: #fef8fb;
  }
  .option-item input[type="checkbox"] {
    cursor: pointer;
    width: 16px;
    height: 16px;
    accent-color: #f0c6da;
    flex-shrink: 0;
  }
  .option-item span:not(.tooltip-block) {
    color: #221f20;
  }
  .tooltip-block {
    position: relative;
    cursor: help;
    display: inline-block;
    margin-left: auto;
    flex-shrink: 0;
    padding-left: 0.5rem;
  }
  .tooltip-block .tooltip-text {
    visibility: hidden;
    width: 280px;
    background: #f0c6da;
    color: #221f20;
    text-align: left;
    border-radius: 8px;
    padding: 0.8em 1em;
    position: absolute;
    z-index: 10000;
    bottom: 125%;
    right: -0.5rem;
    box-shadow: 0 4px 16px rgba(240, 198, 218, 0.15);
    font-size: 0.95em;
    opacity: 0;
    transition: opacity 0.2s;
    pointer-events: none;
    white-space: normal;
  }
  .tooltip-block .tooltip-text::after {
    content: "";
    position: absolute;
    top: 100%;
    right: 0.5rem;
    border-width: 6px;
    border-style: solid;
    border-color: #f0c6da transparent transparent transparent;
  }
  @media (max-width: 768px) {
    .tooltip-block .tooltip-text {
      width: min(280px, calc(100vw - 4rem));
      right: -0.5rem;
    }
  }
  .tooltip-block:hover .tooltip-text,
  .tooltip-block:focus .tooltip-text,
  .tooltip-block.active .tooltip-text {
    visibility: visible;
    opacity: 1;
    pointer-events: auto;
  }
</style>
