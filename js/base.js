$(function () {
   load('http://www.zerohedge.com');

   var $content = $("#content");
   function load(url) {
      $.getJSON('http://whateverorigin.org/get?url=' + encodeURIComponent(url) + '&callback=?', function(data){
         var $html = $(data.contents);
         $html.find(".links,script").remove();
         $html.find("a").click(function(data) {
            var href = $(this).attr('href');
            href = href.indexOf("www.zerohedge.com") > 0 ? href : "http://www.zerohedge.com" + href;
            load(href);
            return false;
         });
         $content.html($html.find("#inner-content"));
      });
   }
});
