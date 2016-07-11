const React = require('react');
const ReactDom = require('react-dom');
const Corleone = require('../corleone');
const GoogleMapLoader = require('react-google-maps').GoogleMapLoader;
const GoogleMap = require('react-google-maps').GoogleMap;
const Marker = require('react-google-maps').Marker;
const Dispersive = require('dispersive');
const mafia = require('../mafia');


/*
 * Actions
 */

const actions = {};

actions.feedRestaurantsStore = Dispersive.createAction();

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

RestaurantStore.bindAction(actions.feedRestaurantsStore, () => {
  mafia.forEach((restaurant) => RestaurantStore.create(restaurant));
  RestaurantStore.trigger('change');
});


RestaurantStore.bindAction(actions.fetchCurrentPosition, (location) => {
  RestaurantStore.location = location;
  RestaurantStore.trigger('change');
});


RestaurantStore.getSuggested = () => {
  if (!RestaurantStore.location) return [];

  const required = RestaurantStore.location;
  let restaurants = [];


  for (const restaurant of RestaurantStore.all()) {
    const latOk = Math.abs(required.lat - restaurant.location.lat) <= 0.01;
    const longOk = Math.abs(required.lng - restaurant.location.lng) <= 0.01;

    if (latOk && longOk) restaurants.push(restaurant);
  }

  return restaurants;
};

/*
 * Components
 */


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

  render() {
    return (
      <section style={{position: 'absolute', width: '100%', height: "100%"}}>
        <GoogleMapLoader
          containerElement={
            <div style={{height: "100%"}}/>
          }
          googleMapElement={
            <GoogleMap
              defaultZoom={15}
              defaultCenter={{lat: this.state.location.lat, lng: this.state.location.lng}} >
              {this.state.restaurants.map((restaurant, index) => (
                 <Marker position={restaurant.location} key={index} defaultAnimation={2} />
              ))}
            </GoogleMap>
          }
        />
      </section>
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
      location: RestaurantStore.location
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

    return <RestaurantMap />;
  }

}

ReactDom.render(<App />, document.getElementById('content'));
