class DBHelper {
    // Database URL.
    static get DATABASE_URL() {
        const port = 1337; 
        return `http://localhost:${port}/`;
    }
    // Fetch all restaurants.
    //  static fetchRestaurants(callback) {
    //   const dbName = 'restaurants';
    //     // Open the database.
    //     idb.open(dbName, 1, newDb => {newDb.createObjectStore(dbName);})
    //     .then(db => {
    //       const tx = db.transaction(dbName);
    //       const keyValStore = tx.objectStore(dbName);
    //       // Return the item or asset if found from indexedDB. 
    //       return keyValStore.getAll().then(items => {
    //         if(items && items.length) {
    //           callback(null,items);
    //         }
    //         // Else, fetch that item from the network.
    //         else {
    //          fetch(`${DBHelper.DATABASE_URL}`)
    //          .then(response => response.json())
    //          .then(restaurants => {
    //           // Write data inside indexedDB.
    //           const tx2 = db.transaction(dbName, 'readwrite');
    //           const keyValStore2 = tx2.objectStore(dbName);         
    //           restaurants.forEach(item => keyValStore2.put(item, item.id))
    //           callback(null, restaurants);
    //         });
    //        }
    //      })
    //     })
    //   }

    static dbPromise() {
        return idb.open('db', 1, upgradeDB => {          
            switch(upgradeDB.oldVersion) {
            case 0:
                upgradeDB.createObjectStore('restaurants', {
                    keyPath: 'id'
                });
            case 1:
                const reviewDB = upgradeDB.createObjectStore('reviews', {
                    keyPath: 'id'
                });
                reviewDB.createIndex('restaurant', 'restaurant_id');
            }
        });
    }

    /**
* fetch restaurants
*/ 
    static fetchRestaurants() {
        return this.dbPromise()
            .then(db => {
                const tx = db.transaction('restaurants');
                const restaurantStore = tx.objectStore('restaurants');
                return restaurantStore.getAll();
            })
            .then(restaurants => {
                if (restaurants.length !== 0) {
                    return Promise.resolve(restaurants);
                }
                return this.fetchAndCacheRestaurantData();
            });
    }
    // *Fetch and cahce restaurant results
    //
    //


    static fetchAndCacheRestaurantData() {
        return fetch(DBHelper.DATABASE_URL + 'restaurants')
            .then(response => response.json())
            .then(restaurants => {
                return this.dbPromise()
                    .then(db => {
                        const tx = db.transaction('restaurants', 'readwrite');
                        const restaurantStore = tx.objectStore('restaurants');
                        restaurants.forEach(restaurant => restaurantStore.put(restaurant));

                        return tx.complete.then(() => Promise.resolve(restaurants));
                    });
            });
    }


    /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id) {
    // fetch all restaurants with proper error handling.
        return DBHelper.fetchRestaurants()
            .then(restaurants => restaurants.find(r => r.id === id));

    }

    /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
    static fetchRestaurantByCuisine(cuisine) {
    // Fetch all restaurants  with proper error handling
        return DBHelper.fetchRestaurants()
            .then(restaurants => restaurants.filter(r => r.cuisine_type === cuisine));
    }

    /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
    static fetchRestaurantByNeighborhood(neighborhood) {
    // Fetch all restaurants
        return DBHelper.fetchRestaurants()
            .then(restaurants => restaurants.filter(r => r.neighborhood === neighborhood));
        
    }

    /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
    static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood) {
    // Fetch all restaurants
        return DBHelper.fetchRestaurants()
            .then(restaurants => {
                let results = restaurants;
                if (cuisine !== 'all') { // filter by cuisine
                    results = results.filter(r => r.cuisine_type == cuisine);
                }
                if (neighborhood !== 'all') { // filter by neighborhood
                    results = results.filter(r => r.neighborhood == neighborhood);
                }
                return results;
            
            });
    }

    
    /**
   * Fetch all neighborhoods with proper error handling.
   */
    static fetchNeighborhoods() {
    // Fetch all restaurants
        return DBHelper.fetchRestaurants().then(restaurants => {
            const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
            // Remove duplicates from neighborhoods
            const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
            return uniqueNeighborhoods;
        });
    }

    /**
   * Fetch all cuisines with proper error handling.
   */
    static fetchCuisines(callback) {
    // Fetch all restaurants
        return DBHelper.fetchRestaurants().then(restaurants => {
            const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
            // Remove duplicates from cuisines
            const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);
            return uniqueCuisines;
            
        });
    }


    // // Fetch a restaurant by its ID.
    // static fetchRestaurantById(id, callback) {
    // // Fetch all restaurants with proper error handling.
    //     DBHelper.fetchRestaurants((error, restaurants) => {
    //         if (error) {
    //             callback(error, null);
    //         } else {
    //             const restaurant = restaurants.find(r => r.id == id);
    //             if (restaurant) { // Got the restaurant.
    //                 callback(null, restaurant);
    //             } else { // Restaurant does not exist in the database.
    //                 callback('Restaurant does not exist', null);
    //             }
    //         }
    //     });
    // }

    // // Fetch restaurants by a cuisine type with proper error handling.
    // static fetchRestaurantByCuisine(cuisine, callback) {
    //     DBHelper.fetchRestaurants((error, restaurants) => {
    //         if (error) {
    //             callback(error, null);
    //         } else {
    //             const results = restaurants.filter(r => r.cuisine_type == cuisine);
    //             callback(null, results);
    //         }
    //     });
    // }

    // // Fetch restaurants by a neighborhood with proper error handling.
    // static fetchRestaurantByNeighborhood(neighborhood, callback) {
    //     DBHelper.fetchRestaurants((error, restaurants) => {
    //         if (error) {
    //             callback(error, null);
    //         } else {
    //             const results = restaurants.filter(r => r.neighborhood == neighborhood);
    //             callback(null, results);
    //         }
    //     });
    // }

    // // Fetch restaurants by a cuisine and a neighborhood with proper error handling.
    // static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    //     DBHelper.fetchRestaurants((error, restaurants) => {
    //         if (error) {
    //             callback(error, null);
    //         } else {
    //             let results = restaurants;
    //             if (cuisine != 'all') { // Filter by cuisine.
    //                 results = results.filter(r => r.cuisine_type == cuisine);
    //             }
    //             if (neighborhood != 'all') { // Filter by neighborhood.
    //                 results = results.filter(r => r.neighborhood == neighborhood);
    //             }
    //             callback(null, results);
    //         }
    //     });
    // }

    // // Fetch all neighborhoods with proper error handling.
    // static fetchNeighborhoods(callback) {
    //     DBHelper.fetchRestaurants((error, restaurants) => {
    //         if (error) {
    //             callback(error, null);
    //         } else {
    //             // Get all neighborhoods from all restaurants.
    //             const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
    //             // Remove duplicates from neighborhoods.
    //             const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
    //             callback(null, uniqueNeighborhoods);
    //         }
    //     });
    // }

    // // Fetch all cuisines with proper error handling.
    // static fetchCuisines(callback) {
    //     DBHelper.fetchRestaurants((error, restaurants) => {
    //         if (error) {
    //             callback(error, null);
    //         } else {
    //             // Get all cuisines from all restaurants.
    //             const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
    //             // Remove duplicates from cuisines.
    //             const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);
    //             callback(null, uniqueCuisines);
    //         }
    //     });
    // }

    // Restaurant page URL.
    static urlForRestaurant(restaurant) {
        return (`./restaurant.html?id=${restaurant.id}`);
    }

    // Restaurant image URL.
    static imageUrlForRestaurant(restaurant) {
        return (`/img/${restaurant.id}.webp`);
    }

    // Map marker for a restaurant.
    static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker  
        const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
            {title: restaurant.name,
                alt: restaurant.name,
                url: DBHelper.urlForRestaurant(restaurant)
            });
        marker.addTo(newMap);
        return marker;
    } 

    // Add review online.
    static addReview(review) {
        let offline_obj = {
            name: 'addReview',
            data: review,
            object_type: 'review'
        };
        if (!navigator.onLine && (offline_obj.name === 'addReview')) {
            DBHelper.sendDataWhenOnline(offline_obj);
            return;
        }
        let reviewSend = {
            'name': review.name,
            'rating': parseInt(review.rating),
            'comments': review.comments,
            'restaurant_id': parseInt(review.restaurant_id)
        };
        console.log('Sending review: ', reviewSend);
        var fetch_options = {
            method: 'POST',
            body: JSON.stringify(reviewSend),
            headers: new Headers({
                'Content-Type': 'application/json'
            })
        };
        fetch('http://localhost:1337/reviews', fetch_options).then((response) => {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.indexOf('application/json') !== -1) {
                return response.json();
            } else { return 'API call successfull';}})
            .then((data) => {console.log('Fetch successful!');})
            .catch(error => console.log('error:', error));
    }

    // Add review offline.
    static sendDataWhenOnline(offline_obj) {
        console.log('Offline OBJ', offline_obj);
        localStorage.setItem('data', JSON.stringify(offline_obj.data));
        console.log(`Local Storage: ${offline_obj.object_type} stored`);
        window.addEventListener('online', (event) => {
            console.log('Browser: Online again!');
            let data = JSON.parse(localStorage.getItem('data'));
            console.log('updating and cleaning ui');
            [...document.querySelectorAll('.reviews_offline')]
                .forEach(el => {
                    el.classList.remove('reviews_offline');
                    el.querySelector('.offline_label').remove();
                });
            if (data !== null) {
                console.log(data);
                if (offline_obj.name === 'addReview') {
                    DBHelper.addReview(offline_obj.data);
                }
                console.log('LocalState: data sent to api');
                localStorage.removeItem('data');
                console.log(`Local Storage: ${offline_obj.object_type} removed`);
            }
        });
    }

    // Send favorite status update.
    static updateFavoriteStatus(restaurantId, isFavorite) {
        console.log('changing status to: ', isFavorite);
        fetch(`http://localhost:1337/restaurants/${restaurantId}/?is_favorite=${isFavorite}`, {
            method: 'PUT'
        })
            .then(() => {
                console.log('changed');
                this.dbPromise()
                    .then(db => {
                        const tx = db.transaction('restaurants', 'readwrite');
                        const restaurantsStore = tx.objectStore('restaurants');
                        restaurantsStore.get(restaurantId)
                            .then(restaurant => {
                                restaurant.is_favorite = isFavorite;
                                restaurantsStore.put(restaurant);
                            });
                    });
            });
    }

    // Fetch all reviews.
    static storeIndexedDB(table, objects) {
        this.dbPromise.then(function(db) {
            if (!db) return;
            let tx = db.transaction(table, 'readwrite');
            const store = tx.objectStore(table);
            if (Array.isArray(objects)) {
                objects.forEach(function(object) {
                    store.put(object);
                });
            } else {
                store.put(objects);
            }
        });
    }
    // Get stored object by Id.
    static getStoredObjectById(table, idx, id) {
        return this.dbPromise()
            .then(function(db) {
                if (!db) return;
                const store = db.transaction(table).objectStore(table);
                const indexId = store.index(idx);
                return indexId.getAll(id);
            });
    }
    // Fetch reviews by Id.
    static fetchReviewsByRestId(id) {
        return fetch(`${DBHelper.DATABASE_URL}reviews/?restaurant_id=${id}`)
            .then(response => response.json())
            .then(reviews => {
                this.dbPromise()
                    .then(db => {
                        if (!db) return;
                        let tx = db.transaction('reviews', 'readwrite');
                        const store = tx.objectStore('reviews');
                        if (Array.isArray(reviews)) {
                            reviews.forEach(function(review) {
                                store.put(review);
                            });
                        } else {
                            store.put(reviews);
                        }
                    });
                console.log('revs are: ', reviews);
                return Promise.resolve(reviews);
            })
            .catch(error => {
                return DBHelper.getStoredObjectById('reviews', 'restaurant', id)
                    .then((storedReviews) => {
                        console.log('looking for offline stored reviews');
                        return Promise.resolve(storedReviews);
                    });
            });
    }

}