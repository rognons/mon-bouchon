<script lang="ts">
export let label: string;
export let options: string[];
export let selectedValues: string[] = [];
export let emoji: string;
export let ariaLabel: string;

let isOpen = false;

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
    padding: 0.65rem 1rem 0.65rem 2.7rem;
    cursor: pointer;
    transition: background-color 0.2s ease;
    gap: 0.6rem;
    font-family: "Open Sans", Arial, sans-serif;
    font-size: 14px;
    border-top: 1px solid #f5f5f5;
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
  .option-item span {
    flex: 1;
    color: #221f20;
  }
</style>
