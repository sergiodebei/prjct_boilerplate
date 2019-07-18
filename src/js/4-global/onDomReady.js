$(document).on("ready", function () {

    console.log('ready');

    function initHome(){
    }

    // INIT
    // if ($('body').hasClass('home')) initHome();

    // INIT LAZYLOAD
    $('img.lazy').lazyload({
        threshold: '100%',
        effect: 'fadeIn',
        // load: resize,
        placeholder: ''
    });

});