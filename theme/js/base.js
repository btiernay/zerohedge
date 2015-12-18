$(function () {
   var local = document.URL;
   var base = 'http://www.zerohedge.com';
   var url = base + window.location.hash.replace("#", "");
   var $content = $("#content");

   bind();
   load(url, false);

   function bind() {
      $("#q").keyup(debounce(function () {
         var q = $(this).val();
         if (q == "") {
            back();
            return;
         }

         search(q);
      }, 250));

      $(window).on("popstate", back);
   }

   function load(url, scroll) {
      get(url, function (data) {
         var $html = $(data).find("#inner-content");

         // Remove useless content
         $html.find("h1:empty, .links,script,.js-links,.similar-box,.content-box-1 > .picture, .node > .picture, .node .clear-block, .tabs, .scomments_info a").remove();
         $html.find(".node .submitted").nextUntil(".content").remove();

         // Make images abosolute
         images($html);

         // Update links
         link($html);

         // Update submitted
         submitted($html)

         // Update rating
         rating($html)

         // Show
         $content.html($html);
         console.log($content.html())

         if (scroll) {
            document.body.scrollIntoView();
         }
      });
   }

   function search(q) {
      get('http://www.zerohedge.com/search/apachesolr_search/' + encodeURIComponent(q), function (data) {
         var $html = $(data).find(".search-results");
         link($html);

         // Show
         $content.html($html);
      });
   }

   function images($html) {
      $html.find("img").each(function () {
         var src = $(this).attr("src");
         src = src.indexOf("http://") >= 0 ? src : base + src;
         this.src = src;
      });
   }

   function submitted($html) {
      $html.find(".submitted").each(function () {
         var $date = $(this);
         var text = $(this).text();
         var date = text.replace("Submitted by Tyler Durden on ", "");
         var d = parseDate(date);
         if (isToday(d)) {
            var hr = d.getHours();
            var min = d.getMinutes();
            if (min < 10) {
               min = "0" + min;
            }
            var ampm = hr < 12 ? "am" : "pm";
            $date.text((hr <= 12 ? hr : hr - 12) + ":" + min + " " + ampm);
         } else {
            $date.text(date);
         }
      });
   }

   function link($html) {
      // Update links
      $html.find("a").click(function (data) {
         var href = $(this).attr('href');
         var zh = href.indexOf("www.zerohedge.com") > 0;

         if (zh || href.indexOf("http://") < 0) {
            history.pushState({}, '', "#" + href.replace(base, ""));
         }

         href = zh ? href : "http://www.zerohedge.com" + href;
         href = href.replace("/articles", "/");
         load(href, true);
         return false;
      });
   }

   function rating($html) {
      var $rating = $html.find(".fivestar-static-form-item");
      var text = $rating.find(".average-rating").text().replace("Average: ", "");
      var rating = Math.round(+text * 2) / 2;
      $rating.html(
         '<h3>Rating</h3>' +
         '<fieldset class="rating">' +
         '<span class="rating-value">' + text + '</span>' +
         '<input type="radio" disabled="disabled" id="star5" name="rating" value="5" /><label class = "full" for="star5" title="Awesome - 5 stars"></label>' +
         '<input type="radio" disabled="disabled" id="star4half" name="rating" value="4 and a half" /><label class="half" for="star4half" title="Pretty good - 4.5 stars"></label>' +
         '<input type="radio" disabled="disabled" id="star4" name="rating" value="4" /><label class = "full" for="star4" title="Pretty good - 4 stars"></label>' +
         '<input type="radio" disabled="disabled" id="star3half" name="rating" value="3 and a half" /><label class="half" for="star3half" title="Meh - 3.5 stars"></label>' +
         '<input type="radio" disabled="disabled" id="star3" name="rating" value="3" /><label class = "full" for="star3" title="Meh - 3 stars"></label>' +
         '<input type="radio" disabled="disabled" id="star2half" name="rating" value="2 and a half" /><label class="half" for="star2half" title="Kinda bad - 2.5 stars"></label>' +
         '<input type="radio" disabled="disabled" id="star2" name="rating" value="2" /><label class = "full" for="star2" title="Kinda bad - 2 stars"></label>' +
         '<input type="radio" disabled="disabled" id="star1half" name="rating" value="1 and a half" /><label class="half" for="star1half" title="Meh - 1.5 stars"></label>' +
         '<input type="radio" disabled="disabled" id="star1" name="rating" value="1" /><label class = "full" for="star1" title="Sucks big time - 1 star"></label>' +
         '<input type="radio" disabled="disabled" id="starhalf" name="rating" value="half" /><label class="half" for="starhalf" title="Sucks big time - 0.5 stars"></label>' +
         '</fieldset>');



      var ratingId = "";
      if (rating == 0.5) {
         ratingId = "#starhalf";
      } else if (rating == 1.0) {
         ratingId = "#star1";
      } else if (rating == 1.5) {
         ratingId = "#star1half";
      } else if (rating == 2.0) {
         ratingId = "#star2";
      } else if (rating == 2.5) {
         ratingId = "#star2half";
      } else if (rating == 3.0) {
         ratingId = "#star3";
      } else if (rating == 3.5) {
         ratingId = "#star3half";
      } else if (rating == 4.0) {
         ratingId = "#star4";
      } else if (rating == 4.5) {
         ratingId = "#star4half";
      } else if (rating == 5.0) {
         ratingId = "#star5";
      }

      $rating.find(ratingId).attr("checked", true);
   }

   function get(url, callback) {
      $.get("https://crossorigin.me/" + url, callback);
   }

   function back() {
      var url = base + location.href.replace(local, "");
      load(url, false);
   }

   function debounce(func, wait, immediate) {
      var timeout;
      return function () {
         var context = this,
            args = arguments;
         var later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
         };
         var callNow = immediate && !timeout;
         clearTimeout(timeout);
         timeout = setTimeout(later, wait);
         if (callNow) func.apply(context, args);
      };
   };

   function parseDate(s) {
      var re = /.*(\d\d)\/(\d\d)\/(\d{4}) (?:- )?(\d\d):(\d\d).*/;
      var m = re.exec(s);
      return m ? new Date(m[3], m[1] - 1, m[2], m[4], m[5]) : null;
   }

   function isToday(td) {
      var d = new Date();
      return td.getDate() == d.getDate() && td.getMonth() == d.getMonth() && td.getFullYear() == d.getFullYear();
   }

});
