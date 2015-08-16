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
    } else {
      return "Unknown state " + state + " with " + JSON.stringify(this.state) + ", please complain to Isaac";
    }
  },

  shouldDisplayCancel: function() {
    return this.currentState() != "idle";
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
    this.setState({ showCancel: true });
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
}

function makeServerRequest(endpoint, params) {
  $.post("/" + endpoint, params, function (data) {
    updateStateFromResponse(data);
  }).fail(loadFailure);
}

updateState();
