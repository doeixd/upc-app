export function triggerDropEvent(element, files) {
  // Create a custom drop event
  const dropEvent = new Event('drop', { bubbles: true, cancelable: true });
  
  // Create a DataTransfer object and add the files
  const dataTransfer = new DataTransfer();
  for (let file of files) {
    dataTransfer.items.add(file);
  }
  
  // Set the dataTransfer property on the event
  Object.defineProperty(dropEvent, 'dataTransfer', {
    value: dataTransfer,
    writable: false
  });
  
  // Dispatch the event on the target element
  element.dispatchEvent(dropEvent);
}