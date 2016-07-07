const React = require('react');
const ReactDom = require('react-dom');
const Corleone = require('../corleone');


class App extends Corleone.Component {

  render() {
    return <div>App bootstraped !</div>;
  }

}

ReactDom.render(<App />, document.getElementById('content'));
