$(function () {
   'use strict';

   // Constants
   var local = document.URL.replace(/#.*$/, ""),
       base = 'http://www.zerohedge.com',
       url = base + window.location.hash.replace("#", ""),
       state = {
          url: url
       };

   // Elements
   var $window = $(window),
       $content = $("#content"),
       $topLink = $('.cd-top');

   /**
    * Load a {@param url} into the page.
    */
   function load(url, options) {
      options = $.extend({
         scroll: false,
         append: false,
         selector: null,
         fade: true
      }, options);

      state.url = url;
      if (options.fade) {
         $content.fadeTo(0, 0.5);
      }

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
         if (options.fade) {
            $content.fadeTo(0, 1.0);
         }
         show($page, options);
      });
   }

   function search(q) {
      $content.fadeTo(0, 0.5);
      get(base + '/search/apachesolr_search/' + encodeURIComponent(q), function (data) {
         var $page = $(data).find(".search-results");
         links($page);

         // Display
         $content.fadeTo(0, 1.0);
         show($page, true);
      });
   }

   function clean($page) {
      $page.find("h1:empty, .links,script,.js-links,.similar-box,.content-box-1 > .picture, .content-box-1 > br, .node > .picture, .node .clear-block, .tabs,.quote_start,.quote_end").remove();
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
         load(href, {
            scroll: true
         });

         return false;
      });
   }

   function images($page) {
      $page.find("img,video,object").each(function () {
         // Fade-in on load
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
         borderRadius: "3px",
         backgroundColor: "rgb(114, 114, 114)",
         padding: "10px",
         height: "auto",
         color: "white"
      });
   }

   function rating($page) {
      var $rating = $page.find(".fivestar-static-form-item"),
          text = $rating.find(".average-rating").text().match(/[0-9 , \.]+/) || "0",
          rating = Math.round(+text * 2) / 2,
          votes = $rating.find(".total-votes").text().match(/\d+/) || 0;

      $rating.html(
         '<fieldset class="rating">' +
         '<span class="rating-value"><b>' + text + '</b> from ' + votes + ' votes</span>' +
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

      var ratingId = "#star" + parseInt(rating) + (rating % 1 === 0.5 ? "half" : "");
      $rating.find(ratingId).attr("checked", true);
   }

   function comments($page) {
      var $comments = $page.find("#comments");
      $page.find(".non_toggle_area").each(function () {
         var $comment = $(this),
             $header = $comment.find(".non_toggle_label"),
             $info = $comment.find(".scomments_info"),
             $picture = $comment.find(".picture");

         $picture.prependTo($comment);
         $info.find("a").remove();
         var time = $info.text().replace("\|", "");
         $info.text(moment(time, "ddd, MM/DD/YYYY - HH:mm").fromNow());
         $info.appendTo($header);

         // Remove blank lines
         $comment.find(".comment-content p").each(function () {
            var $text = $(this);

            if ($text.text().trim() === "") {
               $text.remove();
            }
         });
      });
   }

   function show($page, options) {
      if (options.append) {
         $content.append(options.selector ? $page.find(options.selector) : $page);
      } else {
         $content.html($page);
      }

      if (options.scroll) {
         document.body.scrollIntoView();
      }
   }

   function get(url, callback) {
      $.get("https://crossorigin.me/" + url, callback);
   }

   function back() {
      var url = base + location.href.replace(local, "").replace("#","");
      load(url);
   }

   function parseDate(s) {
      var re = /.*(\d\d)\/(\d\d)\/(\d{4}) (?:- )?(\d\d):(\d\d).*/,
          m = re.exec(s);
      return m ? new Date(m[3], m[1] - 1, m[2], m[4], m[5]) : null;
   }

   function isToday(td) {
      var d = new Date();
      return td.getDate() === d.getDate() && td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear();
   }

   function debounce(func, wait, immediate) {
      var timeout;
      return function () {
         var context = this,
             args = arguments,
             later = function () {
                timeout = null;
                if (!immediate) {
                   func.apply(context, args);
                }
             },
             callNow = immediate && !timeout;
         clearTimeout(timeout);
         timeout = setTimeout(later, wait);
         if (callNow) {
            func.apply(context, args);
         }
      };
   }

   function bind() {
      var submitIcon = $('.searchbox-icon'),
          inputBox = $('.searchbox-input'),
          $search = $('.searchbox'),
          $home = $('.navbar-brand'),
          isOpen = false;

      $home.click(function (e) {
         $content.blur();
         history.pushState({}, 'Zero Hedge', local);
         load(base, {
            scroll: true
         });

         e.preventDefault();
      });

      $search.submit(function (e) {
         e.preventDefault();
         submitIcon.click();
      });

      submitIcon.click(function () {
         if (isOpen === false) {
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
         if (isOpen === true) {
            $('.searchbox-icon').css('display', 'block');
            submitIcon.click();
         }
      });

      inputBox.keyup(debounce(function () {
         var q = inputBox.val().trim();

         if (q === "") {
            back();
         } else {
            search(q);
         }
      }, 300));

      $window.on("popstate", back);

      // Top link
      $window.scroll(function () {
         if ($window.scrollTop() > 300) {
            $topLink.addClass('cd-is-visible');
         } else {
            $topLink.removeClass('cd-is-visible cd-fade-out');
         }

         if ($window.scrollTop() > 1200) {
            $topLink.addClass('cd-fade-out');
         }
      });

      // Paging
      $(window).scroll(function () {
         if ($(window).scrollTop() > ($(document).height() - $(window).height()) - 1000) {
            var $pager = $(".pager"),
                href = $pager.find(".pager-current").last().next().find("a").attr("href");
            if (!href) {
               return;
            }

            var url = base + href;
            if (state.url === url) {
               return;
            }

            console.log("Loading ", url);
            var selector = $("#comments").length ? "#comments" : null;
            load(url, {
               append: true,
               selector: selector,
               fade: false
            });
         }
      });

      $topLink.on('click', function (event) {
         event.preventDefault();
         $('body').animate({
            scrollTop: 0
         }, 700);
      });
   }

   function init() {
      bind();
      load(url);
   }

   // Initialize
   init();
});
