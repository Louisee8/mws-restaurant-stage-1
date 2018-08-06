let restaurants,
  neighborhoods,
  cuisines
var newMap
var markers = []

// Fetch neighborhoods and cuisines as soon as the page is loaded.
document.addEventListener('DOMContentLoaded', (event) => {
  initMap(); 
  fetchNeighborhoods();
  fetchCuisines();
});

// Fetch all neighborhoods and set their HTML.
// fetchNeighborhoods = () => {
//   DBHelper.fetchNeighborhoods((error, neighborhoods) => {
//     if (error) { // Got an error
//       console.error(error);
//     } else {
//       self.neighborhoods = neighborhoods;
//       fillNeighborhoodsHTML();
//     }
//   });
// }
const fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods()
      .then(neighborhoods => {
          self.neighborhoods = neighborhoods;
          fillNeighborhoodsHTML();
      });
};


// // Set neighborhoods HTML.
// fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
//   const select = document.getElementById('neighborhoods-select');
//   neighborhoods.forEach(neighborhood => {
//     const option = document.createElement('option');
//     option.innerHTML = neighborhood;
//     option.value = neighborhood;
//     select.append(option);
//   });
// }
const fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
      const option = document.createElement('option');
      option.innerHTML = neighborhood;
      option.value = neighborhood;
      select.append(option);
  });
};
// Fetch all cuisines and set their HTML.
// fetchCuisines = () => {
//   DBHelper.fetchCuisines((error, cuisines) => {
//     if (error) { // Got an error!
//       console.error(error);
//     } else {
//       self.cuisines = cuisines;
//       fillCuisinesHTML();
//     }
//   });
// }

const fetchCuisines = () => {
  DBHelper.fetchCuisines()
      .then(cuisines => {
          self.cuisines = cuisines;
          fillCuisinesHTML();
      });
};


// Set cuisines HTML.
// fillCuisinesHTML = (cuisines = self.cuisines) => {
//   const select = document.getElementById('cuisines-select');

//   cuisines.forEach(cuisine => {
//     const option = document.createElement('option');
//     option.innerHTML = cuisine;
//     option.value = cuisine;
//     select.append(option);
//   });
// }
const fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
      const option = document.createElement('option');
      option.innerHTML = cuisine;
      option.value = cuisine;
      select.append(option);
  });
};
// Initialize Google map, called from HTML.
initMap = () => {
  self.newMap = L.map('map', {
        center: [40.722216, -73.987501],
        zoom: 12,
        scrollWheelZoom: false
      });
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
    mapboxToken: 'pk.eyJ1IjoibG91aXNlZTgiLCJhIjoiY2prY3Y5MnZpMWIxaDNrcGRmdDlmNWJ4MiJ9.TAI9ZwpNz-UzV_ycC5qTzw',
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox.streets'
  }).addTo(newMap);

  updateRestaurants();
}

// Update page and map for current restaurants.
// updateRestaurants = () => {
//   const cSelect = document.getElementById('cuisines-select');
//   const nSelect = document.getElementById('neighborhoods-select');
//   const cIndex = cSelect.selectedIndex;
//   const nIndex = nSelect.selectedIndex;
//   const cuisine = cSelect[cIndex].value;
//   const neighborhood = nSelect[nIndex].value;
//   DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
//     if (error) {
//       console.error(error);
//     } else {
//       resetRestaurants(restaurants);
//       fillRestaurantsHTML();
//     }
//   })
// }

const updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood)
      .then(restaurants => {
          resetRestaurants(restaurants);
          fillRestaurantsHTML();
      }).catch(error => console.error(error));
};

// Clear current restaurants, their HTML and remove their map markers.
// resetRestaurants = (restaurants) => {
//   // Remove all restaurants
//   self.restaurants = [];
//   const ul = document.getElementById('restaurants-list');
//   ul.innerHTML = '';

//   // Remove all map markers
//   self.markers.forEach(m => m.setMap(null));
//   self.markers = [];
//   self.restaurants = restaurants;
// }

const resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  // self.markers = [];
  if(self.markers) {
      self.markers.forEach(m => m.remove());
  }
  self.markers = [];
  self.restaurants = restaurants;
};



// Create all restaurants HTML and add them to the webpage.
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

// Create restaurant HTML.
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');
  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt = restaurant.name;
  li.append(image);
  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  li.append(name);

  // Add favorite.
 const favorite = document.createElement('button');
  favorite.innerHTML = '★';
  favorite.classList.add("fav_btn");
  //change fav status on click
  favorite.onclick = function() {
    const isFavNow = !restaurant.is_favorite;
    DBHelper.updateFavoriteStatus(restaurant.id, isFavNow);
    restaurant.is_favorite = !restaurant.is_favorite
    changeFavElementClass(favorite, restaurant.is_favorite)
  };
  changeFavElementClass(favorite, restaurant.is_favorite)
  li.append(favorite);
  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);
  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);
  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.setAttribute('aria-label', 'View Details for ' + restaurant.name);
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more)
  return li
}

// Change favorite status. 
changeFavElementClass = (el, fav) => {
  if (!fav) {
    el.classList.remove('favorite_yes');
    el.classList.add('favorite_no');
    el.setAttribute('aria-label', 'mark as favorite');

  } else {
    console.log('toggle yes upd');
    el.classList.remove('favorite_no');
    el.classList.add('favorite_yes');
    el.setAttribute('aria-label', 'remove as favorite');

  }
}

// Add markers for current restaurants to the map.
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
    marker.on("click", onClick);
    function onClick() {
      window.location.href = marker.options.url;
    }
    self.markers.push(marker);
  });
} 