<script>
export let value = '';
export let emoji = '';
export let ariaLabel = '';
</script>

<div class="filter-group">
  <div class="emoji-select-row">
    <span aria-label={ariaLabel} title={ariaLabel}>{emoji}</span>
    <input type="time" bind:value aria-label={ariaLabel} class="filter-time-input" />
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
.filter-time-input {
  flex: 1 1 0;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: 0.75rem 1rem;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  font-size: 14px;
  background: #ffffff;
  color: #221f20;
  font-family: "Open Sans", Arial, sans-serif;
  font-weight: 400;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
.filter-time-input:focus {
  outline: none;
  border-color: #f0c6da;
  box-shadow: 0 0 0 2px #f0c6da33;
}
</style>
