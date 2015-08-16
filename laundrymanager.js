var Q = require('q');
var hangups = require('hangupsjs');

// Connect to Hangouts
var people = [
  { name: "Isaac", email: "isaacwaller.com@gmail.com", conversation: "Ugy_qvST55Hh_7SjT1B4AaABAQ" }
];
var hangoutsToken = "4/zZeYxT_pqk5ay7mYWUD00s-WleWJUUrV2x9PISuE6ow";
var creds = Q({ creds: Q(hangoutsToken) });
var client = new hangups();

var connectToHangouts = function() {
  console.log("Connecting to Hangouts...");
  client.connect(creds).then(function() {
      console.log("Connected to Hangouts");
  }).done();
}

client.on('connect_failed', function() {
  console.log("Disconnected from Hangouts. Reconnecting in 3 seconds");
    Q.Promise(function(rs) {
        // backoff for 3 seconds
        setTimeout(rs, 3000);
    }).then(connectToHangouts);
});
connectToHangouts();


var STATE_IDLE = 'idle';
var STATE_CHOOSING_PERSON = 'choosing_person';
var STATE_CHOOSING_OK_FOR_DRYER = 'choosing_ok_for_dryer';
var STATE_IN_USE = 'in_use';
var STATE_FINISHED = 'finished';

var TIME_WASHER = 2400;
var TIME_DRYER = 2400;

var laundryManager = {
  washer: {
    state: STATE_IDLE
  },
  dryer: {
    state: STATE_IDLE
  },

  onChatMessageReceived: function (message) {
    var conversationId = message.conversation_id.id;
    // Find person from conversation ID
    var person;
    for (index = 0; index < people.length; ++index) {
      if (people[index].conversation == conversationId) {
        person = people[index];
      }
    }

    // Make sure this is not a message we sent
    if (message.sender_id.chat_id == "112521152669924048890") {
      return; // We sent this message :)
    }

    var message = message.chat_message.message_content.segment[0].text;

    if (message.match(/status/i)) {
      var status = "Right now the laundry status is:\n";
      status += this.laundryStatusToString("washer") + "\n";
      status += this.laundryStatusToString("dryer");
      this.sendChatMessage(status, person);
    } else {
      this.sendChatMessage("I don't understand 😓\nI only understand 'status'\nSorry master", person);
    }
  },

  laundryStatusToString: function (washer_or_dryer) {
    var result = washer_or_dryer == "washer" ? "Washer: " : "Dryer: ";
    var obj = this.getWasherOrDryer(washer_or_dryer);
    if (obj.state == STATE_IDLE) {
      result += "available! 🙌";
    } else if (obj.state == STATE_CHOOSING_PERSON || obj.state == STATE_CHOOSING_OK_FOR_DRYER) {
      result += "someone is about to start a load 😱";
    } else if (obj.state == STATE_IN_USE) {
      var remaining = "12:23";
      result += "in use 😞 (" + remaining + " remaining)";
    } else if (obj.state == STATE_FINISHED) {
      result += "available 😌 (but the previous user still needs to take their clothes out)";
    }
    return result;
  },

  sendChatMessage: function (message, person) {
    var builder = new hangups.MessageBuilder();

    message.split("\n").forEach(function (part) {
      builder.text(part);
      builder.linebreak();
    });

    client.sendchatmessage(person.conversation, builder.toSegments());
  },

  findPerson: function (person_name) {
    for (index = 0; index < people.length; ++index) {
      if (people[index].name == person_name) {
        return people[index];
      }
    }
  },

  getWasherOrDryer: function (washer_or_dryer) {
    if (washer_or_dryer == 'washer') {
      return this.washer;
    } else {
      return this.dryer;
    }
  },

  startFromIdle: function (washer_or_dryer) {
    var obj = this.getWasherOrDryer(washer_or_dryer);
    obj.state = STATE_CHOOSING_PERSON;
    delete obj.owner;
    obj.possibleOwners = people.map(function (person) {
      return person.name;
    });
  },

  choosePerson: function (washer_or_dryer, person_name) {
    var obj = this.getWasherOrDryer(washer_or_dryer);
    obj.owner = this.findPerson(person_name);
    delete obj.possibleOwners;

    if (washer_or_dryer == 'washer') {
      obj.state = STATE_CHOOSING_OK_FOR_DRYER;
    } else {
      // Dryer does not have "ok for dryer" step
      this.startTimer(washer_or_dryer);
    }
  },

  chooseOkForDryer: function (washer_or_dryer, ok_for_dryer) {
    var obj = this.getWasherOrDryer(washer_or_dryer);
    obj.okForDryer = ok_for_dryer;
    this.startTimer(washer_or_dryer);
  },

  startTimer: function (washer_or_dryer) {
    var obj = this.getWasherOrDryer(washer_or_dryer);
    obj.state = STATE_IN_USE;
    obj.startTime = Date.now;
    obj.cycleTime = washer_or_dryer == 'washer' ? TIME_WASHER : TIME_DRYER;
  },

  cancel: function (washer_or_dryer) {
    var obj = this.getWasherOrDryer(washer_or_dryer);

    if (obj.state == STATE_IN_USE && obj.owner) {
      // If cancelled while in use, send a message to the person
      // who started the load so they know it was cancelled.
      this.sendChatMessage("Someone (maybe you) cancelled your laundry timer. Investigation time 🔍", obj.owner);
    }

    obj.state = STATE_IDLE;
  },
};

client.on('chat_message', function (event) {
  laundryManager.onChatMessageReceived(event);
});

module.exports = laundryManager;
