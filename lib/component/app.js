const React = require('react');
const ReactDom = require('react-dom');
const Corleone = require('../corleone');
const AppBar = require('material-ui/AppBar').default;
const Paper = require('material-ui/Paper').default;
const Card = require('material-ui/Card').default;
const CardMedia = require('material-ui/Card').CardMedia;
const CardHeader = require('material-ui/Card').CardHeader;
const CardTitle = require('material-ui/Card').CardTitle;
const CardText = require('material-ui/Card').CardText;
const GoogleMapLoader = require('react-google-maps').GoogleMapLoader;
const GoogleMap = require('react-google-maps').GoogleMap;
const Marker = require('react-google-maps').Marker;
const MuiThemeProvider = require('material-ui/styles/MuiThemeProvider').default;
const darkBaseTheme = require('material-ui/styles/baseThemes/darkBaseTheme').default;
const getMuiTheme = require('material-ui/styles/getMuiTheme').default;
const injectTapEventPlugin = require('react-tap-event-plugin');
const Geosuggest = require('react-geosuggest').default;
const Dispersive = require('dispersive');
const mafia = require('../mafia');


/*
 * Actions
 */

const actions = {};

actions.bootApp = Dispersive.createAction();

actions.selectSuggest = Dispersive.createAction((suggest) => suggest);


/*
 * Store
 */

const RestaurantStore = Dispersive.createStore();

RestaurantStore.currentSuggest = null;

RestaurantStore.bindAction(actions.bootApp, () => mafia.forEach(
  (restaurant) => RestaurantStore.create(restaurant)
));

RestaurantStore.bindAction(actions.selectSuggest, (suggest) => {
  RestaurantStore.currentSuggest = suggest;
  RestaurantStore.trigger('change');
});


RestaurantStore.getSuggested = () => {
  if (!RestaurantStore.currentSuggest) return [];

  const required = RestaurantStore.currentSuggest.location;
  let restaurants = [];


  for (const restaurant of RestaurantStore.all()) {
    const latOk = Math.abs(required.lat - restaurant.location.lat) <= 0.02;
    const longOk = Math.abs(required.lng - restaurant.location.lng) <= 50;

    if (latOk && longOk) restaurants.push(restaurant);
  }

  return restaurants;
};


/*
 * Components
 */


class SimpleMap extends Corleone.Component {

  render() {
    return (
      <section style={{height: "100%"}}>
        <GoogleMapLoader
          containerElement={
            <div
              style={{
                height: "100%",
              }}
            />
          }
          googleMapElement={
            <GoogleMap
              defaultZoom={3}
              defaultCenter={{ lat: this.props.lat, lng: this.props.lng}} >
            </GoogleMap>
          }
        />
      </section>
    );

  }
}

class RestaurantThumbnail extends Corleone.Component {
  render() {
    return (
      <Card>
        <CardTitle title={this.props.restaurant.name} />
        <CardHeader
          title={this.props.restaurant.address}
          avatar={this.props.restaurant.icon} />
      </Card>
    );
  } 
}


class App extends Corleone.Component {

  onRestaurantChange() {
    this.setState(this.getState());
  }

  initState() {
    this.state = this.getState();
  }

  getState() {
    return {restaurants: RestaurantStore.getSuggested()};
  }

  bindListeners() {
    this.onRestaurantChange = this.onRestaurantChange.bind(this);
  }

  listenStores() {
    RestaurantStore.on('change', this.onRestaurantChange);
  }

  componentDidMount() {
    actions.bootApp();
  }

  render() {
    const restaurants = this.state.restaurants.map(
      (restaurant) => <RestaurantThumbnail restaurant={restaurant} />
    );

    return (
      <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
        <Paper className="container">
          <AppBar title="Vegan Corleone" />
          <Geosuggest onSuggestSelect={actions.selectSuggest}/>
          <div className="results">
          {restaurants}
          </div>
        </Paper>
      </MuiThemeProvider>
    );
  }

}

injectTapEventPlugin();
ReactDom.render(<App />, document.getElementById('content'));
