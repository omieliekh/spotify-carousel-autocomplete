function jsonFlickrFeed(json) {
  app.fetchCarouselItemsCallback(json.items);
}

var app = new Vue({
  el: '#app',
  data: {
    activeTab: '',

    spotifyTimeout: null,
    spotifyValue: 'music',
    spotifyItems: [],

    carouselPosition: 0,
    carouselItems: [],

    isAutocompleteShown: false,
    autocompleteValue: '',
    activeAutocompleteItemIndex: null,
    autocompleteItemsLimit: 5,
    autocompleteItems: []
  },

  computed: {
    autocompleteFilteredItems() {
      const value = this.autocompleteValue.toLowerCase();

      if (!value) {
        return [];
      }

      return this.autocompleteItems
        .filter(item => item.toLowerCase().indexOf(value) !== -1)
        .filter((item, index) => index < this.autocompleteItemsLimit);
    }
  },

  mounted: function () {
    this.activateTab();

    this.fetchSpotify();
    this.fetchCarouselItems();
    this.fetchAutocompleteItems();
  },

  methods: {
    activateTab(tab) {
      tab = tab || localStorage.getItem('activeTab') || 'spotify';

      this.activeTab = tab;
      localStorage.setItem('activeTab', tab);
    },

    // -----------------------------

    fetchSpotify() {
      if (this.spotifyValue.length < 2) {
        return;
      }

      this.$http.get('/spotify', {
        params: {
          q: this.spotifyValue
        }
      })
        .then(res => {
          const items = res.body.artists.items.filter(item => item.images.length);
          this.spotifyItems = items;
        })
        .catch(() => {});
    },

    getImage(item) {
      const image = item.images.find(image => image.width > 200 && image.width < 400) || item.images[0];
      return image.url;
    },

    modifySpotify() {
      clearTimeout(this.spotifyTimeout);

      this.spotifyTimeout = setTimeout(() => {
        this.fetchSpotify();
      }, 250);
    },

    // -----------------------------

    fetchCarouselItems() {
      this.$http.jsonp('https://api.flickr.com/services/feeds/photos_public.gne?tags=dog&format=json&jsoncallback=jsonFlickrFeed', {})
        .catch(() => {});
    },

    fetchCarouselItemsCallback (items) {
      this.carouselItems = items;
    },

    scrollLeft() {
      this.carouselPosition = Math.max(0, this.carouselPosition - 1);
    },

    scrollRight() {
      this.carouselPosition = Math.min(this.carouselItems.length - 3, this.carouselPosition + 1);
    },

    // -----------------------------

    fetchAutocompleteItems() {
      this.$http.get('resources/js-libraries.json')
        .then(res => {
          this.autocompleteItems = res.body;
        })
        .catch(() => {});
    },

    modifyAutocomplete(event) {
      if (['ArrowUp', 'ArrowDown', 'Enter', 'Escape'].indexOf(event.key) !== -1) {
        event.preventDefault();
      }

      if (event.key === 'ArrowUp') {
        this.prevAutocompleteItem();
        return;
      }

      if (event.key === 'ArrowDown') {
        this.nextAutocompleteItem();
        return;
      }

      if (event.key === 'Enter') {
        this.chooseAutocompleteItem();
        return;
      }

      if (event.key === 'Escape') {
        this.closeAutocomplete();
        return;
      }

      if (!this.autocompleteFilteredItems.length) {
        this.closeAutocomplete();
      } else {
        this.isAutocompleteShown = true;
        this.activeAutocompleteItemIndex = 0;
      }
    },

    closeAutocomplete() {
      this.isAutocompleteShown = false;
      this.activeAutocompleteItemIndex = null;
    },

    chooseAutocompleteItem(index) {
      index = index || this.activeAutocompleteItemIndex;

      if (!index) {
        return;
      }

      this.autocompleteValue = this.autocompleteFilteredItems[index];

      setTimeout(() => {
        this.$refs.autocompleteValue.focus();
        this.closeAutocomplete();
      });

    },

    prevAutocompleteItem() {
      if (this.activeAutocompleteItemIndex === null) {
        return;
      }

      this.activeAutocompleteItemIndex--;

      if (this.activeAutocompleteItemIndex < 0) {
        this.activeAutocompleteItemIndex = this.autocompleteFilteredItems.length - 1;
      }
    },

    nextAutocompleteItem() {
      if (this.activeAutocompleteItemIndex === null) {
        return;
      }

      this.activeAutocompleteItemIndex++;

      if (this.activeAutocompleteItemIndex > this.autocompleteFilteredItems.length - 1) {
        this.activeAutocompleteItemIndex = 0;
      }
    }

  }
});

