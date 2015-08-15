var LaundryDisplay = React.createClass({
  bodyContent: function() {
    return "lol";
  },

  render: function() {
    return (
      <div>
        <h1>{this.props.type.toUpperCase()}</h1>
        <div class="fragment-body">
          {this.bodyContent()}
        </div>
        <div class="fragment-cancel">
          CANCEL
        <div>
      </div>
    );
  }
})


React.render(
  <LaundryDisplay type="washer" />,
  document.getElementById('fragment-washer')
);
React.render(
  <LaundryDisplay type="dryer" />,
  document.getElementById('fragment-dryer')
);
