$(function () {
   var local = document.URL;
   var base = 'http://www.zerohedge.com';
   var url = base + window.location.hash.replace("#","");
   load(url, false);

   var $content = $("#content");

   $(window).on("popstate", function () {
      var url = base + location.href.replace(local, "");
      load(url, false);
   });

   function load(url, scroll) {
      $.get("https://crossorigin.me/" + url, function (data) {
         var $html = $(data);
         $html.find("h1:empty, .links,script,.js-links,.similar-box,.content-box-1 > .picture, .node > .picture, .tabs").remove();
         $html.find(".node .submitted").nextUntil(".content").remove();
         $html.find("img").each(function () {
            var src = $(this).attr("src");
            src = src.indexOf("http://") >= 0 ? src : base + src;
            this.src = src;
         });
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
         $html.find(".submitted").each(function(){
            var $date = $(this);
            var text = $(this).text();
            var date = text.replace("Submitted by Tyler Durden on ","");
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

         // Show
         $content.html($html.find("#inner-content"));

         if (scroll) {
            document.body.scrollIntoView();
         }
      });
   }

   function parseDate(s){
      var re = /.*(\d\d)\/(\d\d)\/(\d{4}) (?:- )?(\d\d):(\d\d).*/;
      var m = re.exec(s);
      return m ? new Date(m[3], m[1]-1, m[2], m[4], m[5]) : null;
   }

   function isToday(td){
      var d = new Date();
      return td.getDate() == d.getDate() && td.getMonth() == d.getMonth() && td.getFullYear() == d.getFullYear();
   }

});
