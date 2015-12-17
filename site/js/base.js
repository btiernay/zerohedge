$(function () {
   load('http://www.zerohedge.com');

   var $content = $("#content");

   function load(url) {
      $.get("https://crossorigin.me/" + url, function(data){
         var $html = $(data);
         $html.find(".links,script,.js-links,.similar-box").remove();
         $html.find("img").each(function(){
            var src = $(this).attr("src");
            src = src.indexOf("http://") >= 0 ? src : "http://www.zerohedge.com" + src;
            this.src = src;
         });
         $html.find("a").click(function(data) {
            var href = $(this).attr('href');
            href = href.indexOf("www.zerohedge.com") > 0 ? href : "http://www.zerohedge.com" + href;
            href = href.replace("/articles","/");
            load(href);
            return false;
         });
         $content.html($html.find("#inner-content"));
      });
   }
});
