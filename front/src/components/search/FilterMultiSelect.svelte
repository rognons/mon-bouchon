<script lang="ts">
export let label: string;
export let options: string[];
export let selectedValues: string[] = [];
export let emoji: string;
export let ariaLabel: string;

let isOpen = false;

function toggleDropdown() {
  isOpen = !isOpen;
}

function toggleOption(option: string) {
  if (selectedValues.includes(option)) {
    selectedValues = selectedValues.filter((v) => v !== option);
  } else {
    selectedValues = [...selectedValues, option];
  }
}

function getDisplayText(): string {
  if (selectedValues.length === 0) return label;
  if (selectedValues.length === 1) return selectedValues[0];
  return `${selectedValues.length} sélectionnés`;
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (!target.closest('.multi-select-container')) {
    isOpen = false;
  }
}

$: if (typeof window !== 'undefined') {
  if (isOpen) {
    window.addEventListener('click', handleClickOutside);
  } else {
    window.removeEventListener('click', handleClickOutside);
  }
}
</script>

<div class="filter-group">
  <div class="emoji-select-row">
    <span aria-label={ariaLabel} title={ariaLabel}>{emoji}</span>
    <div class="multi-select-container">
      <button
        type="button"
        class="multi-select-trigger"
        on:click|stopPropagation={toggleDropdown}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
      >
        <span class="selected-text">{getDisplayText()}</span>
        <span class="arrow" class:open={isOpen}>▼</span>
      </button>
      
      {#if isOpen}
        <div class="multi-select-dropdown">
          {#each options as option}
            {#if option !== ''}
              <label class="option-item">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option)}
                  on:change={() => toggleOption(option)}
                />
                <span>{option}</span>
              </label>
            {/if}
          {/each}
        </div>
      {/if}
    </div>
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
  
  .multi-select-container {
    flex: 1 1 0;
    width: 100%;
    min-width: 0;
    position: relative;
  }
  
  .multi-select-trigger {
    width: 100%;
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
    display: flex;
    justify-content: space-between;
    align-items: center;
    text-align: left;
  }
  
  .multi-select-trigger:hover {
    border-color: #f0c6da;
    box-shadow: 0 2px 6px rgba(240, 198, 218, 0.2);
  }
  
  .multi-select-trigger:focus {
    outline: none;
    border-color: #f0c6da;
    box-shadow: 0 0 0 3px rgba(240, 198, 218, 0.2);
  }
  
  .selected-text {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .arrow {
    font-size: 10px;
    transition: transform 0.2s;
    margin-left: 0.5rem;
  }
  
  .arrow.open {
    transform: rotate(180deg);
  }
  
  .multi-select-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 4px;
    background: #ffffff;
    border: 1px solid #e9ecef;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    max-height: 250px;
    overflow-y: auto;
    z-index: 1000;
  }
  
  .option-item {
    display: flex;
    align-items: center;
    padding: 0.6rem 1rem;
    cursor: pointer;
    transition: background 0.2s;
    gap: 0.6rem;
    font-family: "Open Sans", Arial, sans-serif;
    font-size: 14px;
  }
  
  .option-item:hover {
    background: #f9f9f9;
  }
  
  .option-item input[type="checkbox"] {
    cursor: pointer;
    width: 16px;
    height: 16px;
    accent-color: #f0c6da;
  }
  
  .option-item span {
    flex: 1;
  }
</style>
