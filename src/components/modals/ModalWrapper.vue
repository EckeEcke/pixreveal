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
  padding: 16px;
  z-index: 99;
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
  box-sizing: border-box;
}

.modal {
  position: relative;
  background: var(--card-bg);
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  height: auto;
  overflow: auto;
  max-width: 468px;
  max-height: 90vh;
  box-sizing: border-box;
}

.modal-content {
  height: 100%;
  overflow: auto;
  margin: -32px;
  padding: 32px;
}

@media (min-width: 576px) {
  .modal::-webkit-scrollbar {
    width: 6px;
  }

  .modal::-webkit-scrollbar-track {
    background: rgba(10, 10, 15, 0.5);
    border-radius: 10px;
  }

  .modal::-webkit-scrollbar-thumb {
    background: rgb(50, 50, 50);
    border-radius: 10px;
    box-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
  }

  .modal::-webkit-scrollbar-thumb:hover {
    background: var(--primary);
  }
}
</style>
