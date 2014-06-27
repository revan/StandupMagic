// Saves options to chrome.storage
function save_options() {
  var cl_address = document.getElementById('cl-address').value;
  var cl_email = document.getElementById('cl-email').value;
  chrome.storage.sync.set({
    cl_address: cl_address,
    cl_email: cl_email
  }, function() {
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.sync.get({
    cl_address: 'http://codereview.example.com',
    cl_email: ''
  }, function(items) {
    cl_address = document.getElementById('cl-address').value = items.cl_address;
    cl_email = document.getElementById('cl-email').value = items.cl_email;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);
