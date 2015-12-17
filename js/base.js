$(function () {
   var local = window.location.toString();
   var base = 'http://www.zerohedge.com';
   load(base);

   var $content = $("#content");

   $(window).on("popstate", function () {
      var url = base + location.href.replace(local, "");
      load(url);
   });

   function load(url) {
      $.get("https://crossorigin.me/" + url, function (data) {
         var $html = $(data);
         $html.find(".links,script,.js-links,.similar-box").remove();
         $html.find("img").each(function () {
            var src = $(this).attr("src");
            src = src.indexOf("http://") >= 0 ? src : base + src;
            this.src = src;
         });
         $html.find("a").click(function (data) {
            var href = $(this).attr('href');
            var zh = href.indexOf("www.zerohedge.com") > 0;

            if (zh || href.indexOf("http://") < 0) {
               history.pushState({}, '', href.replace(base, ""));
            }

            href = zh ? href : "http://www.zerohedge.com" + href;
            href = href.replace("/articles", "/");
            load(href);
            document.body.scrollIntoView();
            return false;
         });
         $content.html($html.find("#inner-content"));
      });
   }
});
