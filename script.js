// Initializes Chat
function Chat() {
  if (!window.firebase || !(firebase.app instanceof Function) || !window.config) {
    window.alert('You have not configured and imported the Firebase SDK.');
    return;
  }

  // Initialize Firebase database connection.
  this.database = firebase.database();

  // Shortcuts to DOM Elements.
  this.messageList = document.getElementById('messages');
  this.messageForm = document.getElementById('message-form');
  this.messageInput = document.getElementById('message');

  // Saves message on form submit.
  this.messageForm.addEventListener('submit', this.saveMessage.bind(this));

  // Load previous chat messages.
  this.loadMessages();

  // Focus on the input
  this.messageInput.focus();
}

window.onload = function() {
  new Chat();
};

// Loads chat messages history and listens for upcoming ones.
Chat.prototype.loadMessages = function() {
  // Reference to the /messages/ database path.
  this.messagesRef = this.database.ref('messages');
  // Make sure we remove all previous listeners.
  this.messagesRef.off();

  // Loads the last 12 messages and listen for new ones.
  var setMessage = function(data) {
    var val = data.val();
    this.displayMessage(data.key, val.text);
  }.bind(this);
  this.messagesRef.limitToLast(12).on('child_added', setMessage);
  this.messagesRef.limitToLast(12).on('child_changed', setMessage);
};

// Displays a Message in the UI.
Chat.prototype.displayMessage = function(key, text) {
  var msg = document.getElementById(key);
  // If an element for that message does not exists yet we create it.
  if (!msg) {
    var msg = document.createElement('li');
    msg.innerHTML = text;
    msg.setAttribute('id', key);
    this.messageList.appendChild(msg);
  }
};

// Saves a new message on the Firebase DB.
Chat.prototype.saveMessage = function(e) {
  e.preventDefault();
  // Check that the user entered a message.
  if (this.messageInput.value) {
    // Add a new message entry to the Firebase Database.
    this.messagesRef.push({text: this.messageInput.value}).then(function() {
      // Clear message text field and focus on it.
      this.messageInput.value = '';
      this.messageInput.focus();
    }.bind(this)).catch(function(error) {
      console.error('Error writing new message to Firebase Database', error);
    });
  }
};
