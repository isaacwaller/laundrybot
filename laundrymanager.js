
var STATE_IDLE = 'idle';
var STATE_CHOOSING_PERSON = 'choosing_person';
var STATE_CHOOSING_OK_FOR_DRYER = 'choosing_ok_for_dryer';
var STATE_IN_USE = 'in_use';
var STATE_FINISHED = 'finished';

var laundryManager = {
  washer: {
    state: STATE_IDLE
  },
  dryer: {
    state: STATE_IDLE
  },

  getWasherOrDryer: function (washer_or_dryer) {
    if (washer_or_dryer == 'washer') {
      return this.washer;
    } else {
      return this.dryer;
    }
  }
};

module.exports = laundryManager;
