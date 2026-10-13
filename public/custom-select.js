// custom-select.js
// Auto-converts native <select> into custom UI components.
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('select').forEach(setupCustomSelect);

  const bodyObserver = new MutationObserver((mutations) => {
    mutations.forEach(mut => {
      mut.addedNodes.forEach(node => {
        if (node.nodeType === 1) {
          if (node.tagName === 'SELECT') setupCustomSelect(node);
          else node.querySelectorAll('select').forEach(setupCustomSelect);
        }
      });
    });
  });
  bodyObserver.observe(document.body, { childList: true, subtree: true });
});

function setupCustomSelect(selectEl) {
  if (selectEl.dataset.customized) return;
  selectEl.dataset.customized = "true";

  selectEl.style.display = 'none';

  const wrapper = document.createElement('div');
  wrapper.className = 'custom-select-wrapper';
  selectEl.parentNode.insertBefore(wrapper, selectEl);
  wrapper.appendChild(selectEl);

  const trigger = document.createElement('div');
  trigger.className = 'custom-select-trigger';
  
  const dropdown = document.createElement('div');
  dropdown.className = 'custom-select-dropdown';
  
  wrapper.appendChild(trigger);
  wrapper.appendChild(dropdown);

  // Options may carry data-short (text for the closed trigger) and data-detail
  // (a second line in the open list); plain options just show their text.
  function renderOptions() {
    dropdown.innerHTML = '';
    const options = Array.from(selectEl.options);

    const selectedOpt = options[selectEl.selectedIndex] || options[0];
    const label = document.createElement('span');
    label.className = 'custom-select-label';
    label.textContent = selectedOpt ? (selectedOpt.dataset.short || selectedOpt.text) : 'Select...';
    const arrow = document.createElement('span');
    arrow.className = 'custom-arrow';
    trigger.replaceChildren(label, arrow);
    trigger.title = selectedOpt ? selectedOpt.text : '';

    options.forEach((opt, index) => {
      const item = document.createElement('div');
      item.className = 'custom-select-item';
      if (index === selectEl.selectedIndex) item.classList.add('selected');
      if (opt.dataset.detail) {
        const title = document.createElement('span');
        title.className = 'custom-select-item-title';
        title.textContent = opt.dataset.short || opt.text;
        const detail = document.createElement('span');
        detail.className = 'custom-select-item-detail';
        detail.textContent = opt.dataset.detail;
        item.append(title, detail);
      } else {
        item.textContent = opt.text;
      }
      
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        selectEl.selectedIndex = index;
        selectEl.dispatchEvent(new Event('change', { bubbles: true }));
        closeAll();
        renderOptions();
      });
      dropdown.appendChild(item);
    });
  }

  renderOptions();

  const observer = new MutationObserver(renderOptions);
  observer.observe(selectEl, { childList: true, subtree: true, attributes: true, attributeFilter: ['value', 'selectedIndex'] });

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = wrapper.classList.contains('open');
    closeAll();
    if (!isOpen) wrapper.classList.add('open');
  });
}

function closeAll() {
  document.querySelectorAll('.custom-select-wrapper.open').forEach(w => w.classList.remove('open'));
}

document.addEventListener('click', closeAll);
