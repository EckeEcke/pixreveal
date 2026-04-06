<template>
  <div class="modal-wrapper" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-content">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-wrapper {
  position: fixed;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 32px;
  z-index: 99;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  box-sizing: border-box;
}

.modal {
  position: relative;
  background: var(--card-bg);
  border: 2px solid var(--primary);
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  height: auto;
  overflow: auto;
  max-width: 400px;
  max-height: 90vh;
  box-sizing: border-box;
}

.modal-content {
  height: 100%;
  overflow: auto;
  margin: -32px;
  padding: 32px;
}
</style>
