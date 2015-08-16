var LaundryDisplay = React.createClass({
  currentState: function() {
    return this.state == null ? null : this.state.state;
  },
  bodyContent: function() {
    var state = this.currentState();
    if (state == "idle") {
      return (
        <div className="content" id="content-idle">
          <h2 className="not-in-use">NOT IN USE</h2>
          <div className="button green-button" onClick={this.startFromIdle}>START</div>
        </div>
      );
    } else if (state == "choosing_person") {
      var owners = this.state.possibleOwners;
      var component = this;
      return (
        <div className="content" id="content-choosing-person">
          <div>Who are you?</div>
          {owners.map(function (owner) {
            return (
              <div className="button" onClick={function() { component.choosePerson(owner) }}>{owner}</div>
            );
          }, this)}
          <div><small>Punishment for lying is death.</small></div>
        </div>
      );
    } else if (state == "choosing_ok_for_dryer") {
      var component = this;
      return (
        <div className="content" id="content-choosing-ok-for-dryer">
          <div>Are you OK if the next person to use the washer puts your clothes in the dryer? Say NO if any of your clothes cannot go in the dryer.</div>
          <div className="button red-button" onClick={function() { component.chooseOkForDryer(true) }}>YES, all my clothes are OK for the dryer</div>
          <div className="button" onClick={function() { component.chooseOkForDryer(false) }}>NO</div>
        </div>
      );
    } else if (state == "in_use") {
      var secondsElapsed = (Date.now() - this.state.startTime) / 1000;
      var secondsRemaining = Math.floor(this.state.cycleTime - secondsElapsed);

      var minutesRemaining = Math.max(Math.floor(secondsRemaining / 60), 0);
      var secondsMinusMinutes = secondsRemaining - (minutesRemaining * 60);
      if (secondsMinusMinutes < 0) {
        secondsMinusMinutes = "00";
      } else if (secondsMinusMinutes < 10) {
        secondsMinusMinutes = "0" + secondsMinusMinutes;
      }
      return (
        <div className="content" id="content-in-use">
          <h2 className="in-use">IN USE</h2>
          <div className="in-use-timer">{minutesRemaining}:{secondsMinusMinutes}</div>
          <div className="in-use-user">{this.state.owner.name}</div>
        </div>
      );
    } else if (state == "finished") {
      var machine = this.props.type.toUpperCase();
      var owner = this.state.owner.name;
      var notice;
      if (this.props.type == "dryer") {
        notice = owner + " still needs to take their clothes out of the dryer before someone else can use it.";
      } else if (this.state.okForDryer) {
        notice = owner + " said it was OK if someone else moved their clothes to the dryer."
      } else {
        notice = "If you are not " + owner + " , it is NOT OK to put these clothes ";
        notice += "in the dryer. Please wait for them."
      }
      return (
        <div className="content" id="content-finished">
          <h2 className="finished">DONE<br />BUT CLOTHES STILL IN {machine}</h2>
          <div className="finished-user">{owner}</div>
          <div className="finished-notice">{notice}</div>
          <div className="button finished-button" onClick={this.remindComplete}>REMIND {owner.toUpperCase()}</div>
          <div className="button finished-button green-button" onClick={this.finishComplete}>IT&#39;S DONE</div>
        </div>
      );
    } else {
      return "Unknown state " + state + " with " + JSON.stringify(this.state) + ", please complain to Isaac";
    }
  },

  shouldDisplayCancel: function() {
    return this.currentState() != "idle" && this.currentState() != "finished";
  },

  makeServerRequest: function(endpoint, params) {
    if (params == undefined) {
      params = {};
    }
    params.washer_or_dryer = this.props.type;
    makeServerRequest(endpoint, params);
  },

  startFromIdle: function() {
    this.makeServerRequest("start_from_idle");
  },

  cancel: function() {
    if (this.currentState() == "in_use") {
      this.setState({ showCancel: true });
    } else {
      // Just cancel immediately
      this.confirmCancel();
    }
  },

  hideCancel: function() {
    this.setState({ showCancel: false });
  },

  confirmCancel: function() {
    this.makeServerRequest("cancel");
  },

  choosePerson: function(person) {
    this.makeServerRequest("choose_person", { person: person });
  },

  chooseOkForDryer: function(ok_for_dryer) {
    this.makeServerRequest("choose_ok_for_dryer", { ok_for_dryer: ok_for_dryer });
  },

  remindComplete: function(ok_for_dryer) {
    this.makeServerRequest("remind_complete");
  },

  finishComplete: function(ok_for_dryer) {
    this.makeServerRequest("finish_complete");
  },

  render: function() {
    var cancelStyle = {
      display: this.shouldDisplayCancel() ? 'block' : 'none'
    };
    var dialogStyle = {};
    if (this.state == null || this.state.showCancel != true) {
      dialogStyle.display = 'none';
    }
    return (
      <div className="fragment-inner">
        <h1>{this.props.type.toUpperCase()}</h1>
        <div className="fragment-body">
          {this.bodyContent()}
        </div>
        <div className="fragment-cancel" style={cancelStyle} onClick={this.cancel}>
          CANCEL
        </div>
        <div className="fragment-cancel-dialog" style={dialogStyle}>
          <div className="fragment-cancel-inner">
            <div className="message">Are you sure you would like to cancel?</div>
            <div className="button red-button" onClick={this.confirmCancel}>Cancel</div>
            <div className="button" onClick={this.hideCancel}>Back</div>
          </div>
        </div>
      </div>
    );
  }
})


var washerDisplay = React.render(
  <LaundryDisplay type="washer" />,
  document.getElementById('fragment-washer')
);
var dryerDisplay = React.render(
  <LaundryDisplay type="dryer" />,
  document.getElementById('fragment-dryer')
);

var washerHasTimer = false;
var dryerHasTimer = false;

function loadFailure() {
  location.reload();
}

function updateState() {
  $.get("/state", function (data) {
    updateStateFromResponse(data);
  }).fail(loadFailure);
}

function updateStateFromResponse(response) {
  washerDisplay.replaceState(response['washer']);
  dryerDisplay.replaceState(response['dryer']);

  washerHasTimer = response['washer']['state'] == 'in_use';
  dryerHasTimer = response['dryer']['state'] == 'in_use';

  [response['washer'], response['dryer']].some(function (obj) {
    if (obj.state == 'in_use') {
      var targetTime = obj.startTime + (obj.cycleTime * 1000);
      var difference = targetTime - Date.now();
      difference += 100; // Just to account for server / client timing differences
      setTimeout(updateState, difference);
      console.log("Updating state in " + difference + "ms");
    }
    return false;
  });
}

function makeServerRequest(endpoint, params) {
  $.post("/" + endpoint, params, function (data) {
    updateStateFromResponse(data);
  }).fail(loadFailure);
}

updateState();

// Timer

function updateTimers() {
  if (washerHasTimer) {
    washerDisplay.forceUpdate();
  }
  if (dryerHasTimer) {
    dryerDisplay.forceUpdate();
  }
}
setInterval(updateTimers, 100);
setInterval(updateState, 30000); // Update state every 30 seconds, just in case of desync
