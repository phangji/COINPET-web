/**
 * Created by Jeon on 2015-05-12.
 */
//
//alert('myKids.js is loaded');

define(function() {

    $('#kidsimgc').click(function() {
        $( ":file").click();
    });

    $('#kidsimg').mouseenter(function() {
        $('#kidsimgc').show()
    });
    $('#kidsimgc').mouseout(function() {
        $('#kidsimgc').hide();
    });
});