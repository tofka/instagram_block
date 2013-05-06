/*
 * Instagram jQuery plugin
 * v0.2.1
 * http://potomak.github.com/jquery-instagram/
 * Copyright (c) 2012 Giovanni Cappellotto
 * Licensed MIT
 */

(function ($, Drupal, window, document, undefined) {
  Drupal.behaviors.instagram_block = {
    attach: function(context, settings) {
      (function ($){
        $.fn.instagram = function (options) {
          var that = this,
              apiEndpoint = "https://api.instagram.com/v1",
              settings = {
                  hash: null
                , userId: true
                , locationId: null
                , search: null
                , accessToken: null
                , clientId: null
                , show: null
                , onLoad: null
                , onComplete: null
                , maxId: null
                , minId: null
                , next_url: null
                , image_size: null
                , photoLink: true
              };
              
          options && $.extend(settings, options);
          
           function createPhotoElement(photo) {
            if (Drupal.settings.instagram_block.resolution == 'low_resolution') {
              image_url = photo.images.low_resolution.url;
            }
            else if (Drupal.settings.instagram_block.resolution == 'thumbnail') {
              image_url = photo.images.thumbnail.url;
            }
            else if (Drupal.settings.instagram_block.resolution == 'standard_resolution') {
              image_url = photo.images.standard_resolution.url;
            }
            var innerHtml = $('<img>')
              .addClass('instagram-image')
              .attr('src', image_url)
              .attr('alt', 'Gå till denna bild på Instagram');      
            var user_link = $('<a>').attr('target', '_blank')
              .attr('href', 'http://www.instagram.com/' + photo.user.username)
              .attr('title', photo.user.username).html('@').append(photo.user.username);
            
            if (settings.photoLink) {
              innerHtml = $('<a>')
                .attr('target', '_blank')
                .attr('href', photo.link)
                .attr('title', photo.user.username)
                .append(innerHtml);
            }  
           
            return $('<div>').addClass('instagram-placeholder')
              .attr('id', photo.id).append(innerHtml).append('Postat av ', user_link);
          }

          function createEmptyElement() {
            return $('<div>')
              .addClass('instagram-placeholder')
              .attr('id', 'empty')
              .append($('<p>').html('No photos for this query'));
          }
          
          function composeRequestURL() {

            var url = apiEndpoint,
                params = {};
            
            if (settings.next_url != null) {
              return settings.next_url;
            }

            if (settings.hash != null) {
              url += "/tags/" + settings.hash + "/media/recent";
            }
            else if (settings.search != null) {
              url += "/media/search";
              params.lat = settings.search.lat;
              params.lng = settings.search.lng;
              settings.search.max_timestamp != null && (params.max_timestamp = settings.search.max_timestamp);
              settings.search.min_timestamp != null && (params.min_timestamp = settings.search.min_timestamp);
              settings.search.distance != null && (params.distance = settings.search.distance);
            }
            else if (settings.userId != null) {
              url += "/users/" + settings.userId + "/media/recent";
            }
            else if (settings.locationId != null) {
              url += "/locations/" + settings.locationId + "/media/recent";
            }
            else {
              url += "/media/popular";
            }
            
            settings.accessToken != null && (params.access_token = settings.accessToken);
            settings.clientId != null && (params.client_id = settings.clientId);
            settings.minId != null && (params.min_id = settings.minId);
            settings.maxId != null && (params.max_id = settings.maxId);
            settings.show != null && (params.count = settings.show);

            url += "?" + $.param(params)
            
            return url;
          }
          var loaded = false;
          if (loaded != true) {
            settings.onLoad != null && typeof settings.onLoad == 'function' && settings.onLoad();
            
            $.ajax({
              type: "GET",
              dataType: "jsonp",
              cache: false,
              url: composeRequestURL(),
              success: function (res) {
                var length = typeof res.data != 'undefined' ? res.data.length : 0;
                var limit = settings.show != null && settings.show < length ? settings.show : length;
                
                if (limit > 0) {
                  loaded = true;
                  var number_of_instagrams = Drupal.settings.instagram_block.number_of_instagrams;

                  for (var i = 0; i < number_of_instagrams; i++) {
                    that.append(createPhotoElement(res.data[i])); 
                  }
                }
                else {
                  that.append(createEmptyElement());
                }

                settings.onComplete != null && typeof settings.onComplete == 'function' && settings.onComplete(res.data, res);
                 
              }

            });  

          }      
          return this;
        };
      })(jQuery);

      if (Drupal.settings.instagram_block) {
        var instagram_tag = Drupal.settings.instagram_block.instagram_tag;
        var client_id = Drupal.settings.instagram_block.client_id;

        $(".instagram-feed").instagram({
        hash: instagram_tag,
        clientId: client_id
        });
      }
    }
  }; 
})(jQuery, Drupal, this, this.document);