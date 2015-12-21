$(function () {
   // Constants
   var local = document.URL;
   var base = 'http://www.zerohedge.com';
   var url = base + window.location.hash.replace("#", "");
   var $content = $("#content");

   // Initialize
   init();

   function init() {
      bind();
      load(url, false);
   }

function bind() {
   var submitIcon = $('.searchbox-icon');
   var inputBox = $('.searchbox-input');
   var $search = $('.searchbox');
   var isOpen = false;

   $search.submit(function(e){
      e.preventDefault();
      submitIcon.click();
   })

   submitIcon.click(function () {
      if (isOpen == false) {
         inputBox.val("");
         $search.addClass('searchbox-open');
         inputBox.focus();
         isOpen = true;
      } else {
         $search.removeClass('searchbox-open');
         inputBox.focusout();
         isOpen = false;
      }
   });
   submitIcon.mouseup(function () {
      return false;
   });
   $search.mouseup(function () {
      return false;
   });
   $(document).mouseup(function () {
      if (isOpen == true) {
         $('.searchbox-icon').css('display', 'block');
         submitIcon.click();
      }
   });

   inputBox.keyup(debounce(function () {
      var q = inputBox.val().trim();

      if (q == "") {
         back();
      } else {
         search(q);
      }
   }, 300));

   $(window).on("popstate", back);
}

function load(url, scroll) {
   get(url, function (data) {
      var $page = $(data).find("#inner-content");

      // Update content
      clean($page);
      submitted($page);
      links($page);
      images($page);
      article($page);
      rating($page);
      comments($page);

      // Display
      show($page, scroll);
   });
}

function search(q) {
   get(base + '/search/apachesolr_search/' + encodeURIComponent(q), function (data) {
      var $page = $(data).find(".search-results");
      links($page);

      // Display
      show($page, true);
   });
}

function clean($page) {
   $page.find("h1:empty, .links,script,.js-links,.similar-box,.content-box-1 > .picture, .content-box-1 > br, .node > .picture, .node .clear-block, .tabs").remove();
   $page.find(".node .submitted").nextUntil(".content").remove();
}

function submitted($page) {
   $page.find(".submitted").each(function () {
      var $date = $(this);
      var text = $(this).text().replace("Submitted by Tyler Durden on ", "");
      var date = parseDate(text);

      if (isToday(date)) {
         var hr = date.getHours(),
            min = date.getMinutes();

         if (min < 10) {
            min = "0" + min;
         }
         var ampm = hr < 12 ? "am" : "pm";
         text = (hr <= 12 ? hr : hr - 12) + ":" + min + " " + ampm;
      }

      $date.text(text);
   });
}

function links($page) {
   // Update links
   $page.find("a").click(function (data) {
      var href = $(this).attr('href');
      var relative = href.indexOf("http://") < 0;
      var site = href.indexOf(base) >= 0;

      if (!relative && !site) {
         this.target = "_blank";
         return;
      }

      var hash = href.replace(base, "");
      history.pushState({}, '', "#" + hash);

      href = site ? href : base + href;
      href = href.replace("/articles", "/");

      // Load
      load(href, true);

      return false;
   });
}

function images($page) {
   $page.find("img").each(function () {
      // Fade-in on loads
      var $img = $(this);
      $img.hide().bind("load", function () {
         $img.fadeIn();
      });

      // Update absolute location
      var src = $img.attr("src");
      src = src.indexOf("http://") >= 0 ? src : base + src;
      this.src = src;
   });
}

function article($page) {
   $page.children("p:first-child").css({
      borderRadius: "5px",
      backgroundColor: "#F5F5DC",
      padding: "10px",
      height: "auto",
      color: "black"
   });
}

function rating($page) {
   var $rating = $page.find(".fivestar-static-form-item");
   var text = $rating.find(".average-rating").text().replace("Average: ", "");
   var rating = Math.round(+text * 2) / 2;
   var votes = $rating.find(".total-votes").text();

   $rating.html(
      '<fieldset class="rating">' +
      '<span class="rating-value">' + text + ' ' + votes + '</span>' +
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

   var ratingId = "#star" + parseInt(rating) + (rating % 1 == 0.5 ? "half" : "");
   $rating.find(ratingId).attr("checked", true);
}

function comments($page) {
   var $comments = $page.find("#comments");
   $page.find(".non_toggle_area").each(function () {
      var $comment = $(this);

      var $info = $comment.find(".scomments_info");
      $info.find("a").remove();
      $info.text($info.text().replace("\|", ""));

      // Remove blank lines
      $comment.find(".comment-content p").each(function () {
         var $text = $(this);
         $text.html($text.html().replace(/&nbsp;/g, ''));
         if ($text.text().trim() == "") {
            $text.remove();
         }
      });
   });
}

function show($page, scroll) {
   $content.html($page);
   if (scroll) {
      document.body.scrollIntoView();
   }
}

function get(url, callback) {
   $.get("https://crossorigin.me/" + url, callback);
}

function back() {
   var url = base + location.href.replace(local, "");
   load(url, false);
}

function parseDate(s) {
   var re = /.*(\d\d)\/(\d\d)\/(\d{4}) (?:- )?(\d\d):(\d\d).*/;
   var m = re.exec(s);
   return m ? new Date(m[3], m[1] - 1, m[2], m[4], m[5]) : null;
}

/**
 * Utilities
 */

function isToday(td) {
   var d = new Date();
   return td.getDate() == d.getDate() && td.getMonth() == d.getMonth() && td.getFullYear() == d.getFullYear();
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

});
