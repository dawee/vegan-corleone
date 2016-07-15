const React = require('react');
const ReactDom = require('react-dom');
const Corleone = require('../corleone');
const GoogleMapLoader = require('react-google-maps').GoogleMapLoader;
const GoogleMap = require('react-google-maps').GoogleMap;
const Snackbar = require('material-ui/Snackbar').default;
const Marker = require('react-google-maps').Marker;
var ReactMarkdown = require('react-markdown');
const Dispersive = require('dispersive');
const mafia = require('../mafia');
const MuiThemeProvider = require('material-ui/styles/MuiThemeProvider').default;
const darkBaseTheme = require('material-ui/styles/baseThemes/darkBaseTheme').default;
const getMuiTheme = require('material-ui/styles/getMuiTheme').default;
const injectTapEventPlugin = require('react-tap-event-plugin');

/*
 * Actions
 */

const actions = {};
let unselectId = null;
let lastSelection = null;


actions.selectRestaurant = Dispersive.createAction((restaurant) => {
  lastSelection = Date.now();
  clearTimeout(unselectId);
  unselectId = null;

  return restaurant;
});

actions.unselectRestaurant = Dispersive.createAction();

actions.feedRestaurantsStore = Dispersive.createAction();
actions.setRestaurantsStoreReady = Dispersive.createAction(() => {
  document.getElementById('content').dispatchEvent(new Event('ready'));
  return {};
});

actions.bootApp = Dispersive.createAction(
  () => Dispersive.createActionGroup()
    .chain(actions.feedRestaurantsStore)
    .chain(actions.fetchCurrentPosition)
);

actions.fetchCurrentPosition = Dispersive.createAction(() => new Promise(
  (resolve) => navigator.geolocation.getCurrentPosition((position) => {
    resolve({lat: position.coords.latitude, lng: position.coords.longitude})
  })
));

/*
 * Store
 */

const RestaurantStore = Dispersive.createStore();

RestaurantStore.ready = false;

RestaurantStore.bindAction(actions.feedRestaurantsStore, () => {
  mafia.forEach((restaurant) => RestaurantStore.create(restaurant));
  RestaurantStore.trigger('change');
});


RestaurantStore.bindAction(actions.fetchCurrentPosition, (location) => {
  RestaurantStore.location = location;
  RestaurantStore.trigger('change');
});

RestaurantStore.bindAction(actions.selectRestaurant, (restaurant) => {
  RestaurantStore.selected = restaurant;
  RestaurantStore.trigger('change');
});

RestaurantStore.bindAction(actions.unselectRestaurant, () => {
  RestaurantStore.selected = null;
  RestaurantStore.trigger('change');
});

RestaurantStore.bindAction(actions.setRestaurantsStoreReady, () => {
  RestaurantStore.ready = true;
  RestaurantStore.trigger('change');
});

RestaurantStore.getSuggested = () => {
  if (!RestaurantStore.location) return [];

  const required = RestaurantStore.location;
  let restaurants = [];


  for (const restaurant of RestaurantStore.all()) {
    const latOk = Math.abs(required.lat - restaurant.location.lat) <= 0.05;
    const longOk = Math.abs(required.lng - restaurant.location.lng) <= 0.05;

    if (latOk && longOk) restaurants.push(restaurant);
  }

  return restaurants;
};

RestaurantStore.getSelected = () => {
  return RestaurantStore.selected;
};

/*
 * Components
 */


class GoogleMapElement extends GoogleMap {
  componentDidMount () {
    setTimeout(() => actions.setRestaurantsStoreReady(), 2000);
  }
}


class RestaurantMap extends Corleone.Component {

  onRestaurantChange() {
    this.setState(this.getState());
  }

  initState() {
    this.state = this.getState();
  }

  getState() {
    return {
      restaurants: RestaurantStore.getSuggested(),
      location: RestaurantStore.location
    };
  }

  bindListeners() {
    this.onRestaurantChange = this.onRestaurantChange.bind(this);
  }

  onSelect(restaurant) {
    actions.selectRestaurant(restaurant);
  }

  onUnselect() {
    if (!!RestaurantStore.getSelected() && !!RestaurantStore.getSelected().name) actions.unselectRestaurant();
  }

  render() {
    return (
      <section style={{position: 'absolute', width: '100%', height: "100%"}} onClick={this.onUnselect.bind(this)}>
        <GoogleMapLoader
          containerElement={
            <div style={{height: "100%"}}/>
          }
          googleMapElement={
            <GoogleMapElement
              defaultZoom={15}
              defaultCenter={{lat: this.state.location.lat, lng: this.state.location.lng}} >
              {this.state.restaurants.map((restaurant, index) => (
                 <Marker
                  position={restaurant.location}
                  key={index}
                  defaultAnimation={4}
                  onTouchStart={this.onSelect.bind(this, restaurant)}
                  onClick={this.onSelect.bind(this, restaurant)} />
              ))}
            </GoogleMapElement>
          }
        />
      </section>
    );

  }
}

class SelectionSlider extends Corleone.Component {


  onRestaurantChange() {
    this.setState(this.getState());
  }

  initState() {
    this.state = this.getState();
  }

  getState() {
    const lastSelection = !!this.state && this.state.selected;
    const newSelection = RestaurantStore.getSelected();

    return {
      hasSelection: !!newSelection && !!newSelection.name,
      selected: {
        name: (!!newSelection && newSelection.name) || (!!lastSelection && lastSelection.name),
        description: (!!newSelection && newSelection.description) || (!!lastSelection && lastSelection.description),
        address: (!!newSelection && newSelection.address) || (!!lastSelection && lastSelection.address),
        icon: (!!newSelection && newSelection.icon) || (!!lastSelection && lastSelection.icon),
      }
    };
  }

  bindListeners() {
    this.onRestaurantChange = this.onRestaurantChange.bind(this);
  }

  listenStores() {
    RestaurantStore.on('change', this.onRestaurantChange);
  }

  render() {
    return (
      <div className="selection-slider" style={{transform: this.state.hasSelection ? 'translate(0,0)': 'translate(110%,0)'}}>
        <h2>{this.state.selected.name}</h2>
        <ReactMarkdown className="description" source={this.state.selected.description} />
        <div className="icon" style={{backgroundImage: `url(${this.state.selected.icon})`}} />
        <div className="address">{this.state.selected.address}</div>
      </div>
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
    return {
      location: RestaurantStore.location,
      ready: RestaurantStore.ready,
    };
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
    if (!this.state.location) return <div />;

    return (
      <div className="corleone" style={{opacity: this.state.ready ? 1 : 0}}>
        <RestaurantMap />;
        <SelectionSlider />
      </div>
    )

  }

}

injectTapEventPlugin();
ReactDom.render(<App />, document.getElementById('content'));
