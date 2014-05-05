app.DetailView = Backbone.View.extend({
  className: 'detailSidebar',
  template: _.template($('#tmpl-detail-view').html()),

  bindings: {
    '.lineName': 'name',
    '.lineDescription': 'description',
    '.lineFrequency': {
      observe: 'frequency',
      onSet: function(val) { return parseInt(val, 10); },
    },
    '.lineSpeed':{
      observe: 'speed',
      onSet: function(val) { return parseInt(val, 10); },
    },
    '.lineStartTime': 'startTime',
    '.lineEndTime': 'endTime',
  },

  events: {
    'click .navHome': 'home',
    'click .navRemix': 'remix',
    // Disable select-all-text-on-click. Need to user test this.
    // 'focus [contenteditable]': 'selectAllText',
    'keydown': 'preventNewline',
  },

  initialize: function() {
    this.listenTo(this.model, 'change:coordinates', this.updateCalculations);
    this.listenTo(this.model, 'change', this.updateCalculations);

    // Save to the server when StickIt chances the underlying model
    var debouncedSave = _.debounce(this.save, 1500, { leading: false });
    this.listenTo(this.model, 'change', debouncedSave);
  },

  render: function() {
    this.lineView = new app.LineView({ model: this.model });
    this.lineView.render();

    // Compute several shades of color for the UI
    var color = this.model.get('color');
    var attrs = _.extend(this.model.attributes, {
      color2: app.utils.tweakColor(color, -22),
      color3: app.utils.tweakColor(color, -44),
    });

    this.$el.html(this.template(attrs));
    this.updateCalculations();
    this.stickit();

    return this;
  },

  updateCalculations: function() {
    var calcs = this.model.getCalculations();
    this.$('.lineDistance').html(calcs.distance.toFixed(2) + ' miles');

    var cost = calcs.cost.toFixed(0);
    // Crazy internet regex to add commas numbers
    cost =  cost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    this.$('.lineCost').html('$' + cost);
  },

  save: function(model, options) {
    if (options.stickitChange) {
      this.model.save();
    }
  },

  home: function() {
    app.router.navigate('', { trigger: true });
  },

  remix: function() {
    console.log('add remixing ability...');
  },

  // Select all text in a contentEditable field. Need to _.defer for 
  // WebKit, which receives the focus event before the cursor is inserted.
  selectAllText: function() {
    _.defer(function() {
      document.execCommand('selectAll', false, null);
    });
  },

  preventNewline: function(event) {
    if (event.which === 13) {
      event.stopPropagation();
      event.preventDefault();
      event.target.blur();
    }
  },

  remove: function() {
    this.model.save();
    this.lineView.remove();
    Backbone.View.prototype.remove.apply(this, arguments);
  },
});