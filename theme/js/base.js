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
         $html.find(".links,script,.js-links,.similar-box,.content-box-1 > .picture, .node > .picture, .tabs").remove();
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
            var date = $(this).text();
            $(this).text(date);
         });

         // Show
         $content.html($html.find("#inner-content"));

         if (scroll) {
            document.body.scrollIntoView();
         }
      });
   }
});
