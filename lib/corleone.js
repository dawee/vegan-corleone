const React = require('react');

class Component extends React.Component {

  constructor(...args) {
    super(...args);
    this.bindListeners();
    this.listenStores();
    this.initState();
  }

  bindListeners() {}
  listenStores() {}
  initState() {}
}

exports.Component = Component;
