$(document).ready(function(){

	// hide #back-top first
	$(".mypresta_scrollup").hide();
	
	// fade in .mypresta_scrollup
	$(function () {
		$(window).scroll(function () {
			if ($(this).scrollTop() > 100) {
				$('.mypresta_scrollup').fadeIn();
			} else {
				$('.mypresta_scrollup').fadeOut();
			}
		});
		// scroll body to 0px on click
		$('.mypresta_scrollup').click(function () {
			$('body,html').animate({
				scrollTop: 0
			}, 800);
			return false;
		});
	});

});
