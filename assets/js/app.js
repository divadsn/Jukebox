var instance = this;

// jQuery hack to implement a CSS disable function for elements
jQuery.fn.extend({
  disable: function(state) {
    return this.each(function() {
      var $this = $(this);
      if ($this.is('input, button, textarea, select')) {
        this.disabled = state;
      } else {
        $this.toggleClass('disabled', state);
      }
    });
  }
});

$(document).ready(function() {
  // Initialize shoutcast client
  instance.client = $.SHOUTcast({
    host: 'listen.codebucket.de',
    port: 8000,
    stream: 1,
    interval: 5000,
    stats: updateStats
  });

  // Start fetching stats
  client.startStats();

  // Setup volume slider using bootstrap-slider
  $('#volume').slider({
    value: 100,
    formatter: function(value) {
      return value + '%';
    }
  }).on("slide", function(ev) {
    $('#player').prop("volume", ev.value / 100);
  });

  // Play/Pause audio player
  $('#play').click(function() {
    var player = $('#player').get(0);
    if (player.paused) {
      player.play();
      $(this).find('i').removeClass("fa-play")
        .addClass("fa-pause");
    } else {
      player.pause();
      $(this).find('i').removeClass("fa-pause")
        .addClass("fa-play");
    }
  });
});

this.updateStats = function() {
  // Update stream information
  $('#listeners').text(this.get('currentlisteners'));
  $('#message').text("New playlist is finally working. Enjoy!");

  // Check if songtitle has changed
  var songtitle = this.get('songtitle');
  if (songtitle != $('#songtitle').text()) {
    $('#songtitle').text(songtitle);

    // Parse meta from songtitle
    var data = getMetadata(songtitle);
    $('#artist').text(data.artist);
    $('#title').text(data.title);

    // Set cover if found
    var cover = data.cover;
    if (cover != $('#cover').attr('src')) {
      $('#cover').attr('src', cover);
    }
  }

  // For later use
  instance.stats = this;
};

this.getMetadata = function(songtitle) {
  // Result to return, containing needed info for the player
  var info = { artist: "Artist", title: "Title", cover: "/artwork.jpg" };

  // Check if songtitle is matching our regex
  var reg = /\s* - \s*/g;
  if (reg.test(songtitle)) {
    // Find our matches
    var reg = /(.*) - (.*)/g;
    var arr = reg.exec(songtitle);

    // Set extracted meta
    info.artist = arr[1];
    info.title = arr[2];
    info.cover = "http://coverart.codebucket.de/api/v1/track/" + info.artist + "/" + info.title + ".jpg";
  }

  // Return results
  return info;
};
