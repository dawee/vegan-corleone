const React = require('react');
const ReactDom = require('react-dom');
const Corleone = require('../corleone');
const AppBar = require('material-ui/AppBar').default;
const MuiThemeProvider = require('material-ui/styles/MuiThemeProvider').default;
const darkBaseTheme = require('material-ui/styles/baseThemes/darkBaseTheme').default;
const getMuiTheme = require('material-ui/styles/getMuiTheme').default;
const injectTapEventPlugin = require('react-tap-event-plugin');

const mafia = require('../mafia');


class App extends Corleone.Component {

  render() {
    return (
      <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
        <AppBar title="Vegan Corleone" />
      </MuiThemeProvider>
    );
  }

}

injectTapEventPlugin();
ReactDom.render(<App />, document.getElementById('content'));
