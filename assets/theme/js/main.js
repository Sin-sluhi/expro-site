function testWebP(callback) {

	var webP = new Image();
	webP.onload = webP.onerror = function () {
		callback(webP.height == 2);
	};
	webP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
}

testWebP(function (support) {

	if (support == true) {
		document.querySelector('body').classList.add('webp');
	} else {
		document.querySelector('body').classList.add('no-webp');
	}
});

$(document).ready(function () {

	$(".buttons").on("click", ".white_btn", function (event) {
		event.preventDefault();
		var id = $(this).attr('href'),
			top = $(id).offset().top;
		$('body,html').animate({ scrollTop: top }, 1500);
	});

	$('.menu-item-has-children').hover(function () {
		if (screen.width > 979) {
			$(this).children('.sub-menu').stop(true, true).fadeIn(200);
		}
	},
		function () {
			if (screen.width > 979) {
				$(this).children('.sub-menu').stop(true, true).fadeOut(200);
			}
		})

	$('.review__slider').slick({
		'slidesToShow': 2,
		'slidesToScroll': 2,
		'arrows': false,
		'dots': true,
		'dotsClass': 'slick-dots custom-dots',
		responsive: [{
			breakpoint: 641,
			settings: {
				'slidesToShow': 1,
				'slidesToScroll': 1,
			}
		}]
	});

	$('.news__list').slick({
		'arrows': false,
		'dots': false,
		'infinite': true,
		'slidesToShow': 4,
		'slidesToScroll': 1,
		responsive: [{
			breakpoint: 981,
			settings: {
				slidesToShow: 2,
				slidesToScroll: 2,
			}
		},
		{
			breakpoint: 545,
			settings: {
				slidesToShow: 1,
				slidesToScroll: 1,
			}
		}
		]
	});

	$('.main__slider').slick({
		dots: true,
		infinite: true,
		prevArrow: '<button class="main-prev slick-arrow" aria-label="Previous" type="button" style=""><svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 1L1 5L5 9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>',
		nextArrow: '<button class="main-next slick-arrow" aria-label="Next" type="button" style=""><svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 1L1 5L5 9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>',
		responsive: [{
			breakpoint: 770,
			settings: 'unslick'
		}]
	});

	$('.clients__slider').slick({
		'arrows': false,
		'dots': false,
		'infinite': true,
		'slidesToShow': 4,
		'slidesToScroll': 1,
		responsive: [{
			breakpoint: 981,
			settings: {
				slidesToShow: 3,
				slidesToScroll: 1,
				centerMode: true,
				autoplay: true,
			}
		},
		{
			breakpoint: 481,
			settings: {
				slidesToShow: 1,
				autoplay: true,
				centerMode: false,
			}
		}
		]
	});

	$('.change-list').slick({
		mobileFirst: true,
		arrows: false,
		dots: true,
		infinite: true,
		responsive: [{
			breakpoint: 633,
			settings: 'unslick'
		}]
	})

	$('.useful__list').slick({
		arrows: false,
		dots: false,
		slidesToShow: 4,
		slidesToScroll: 4,
		infinite: false,
		dotsClass: 'slick-dots custom-dots',
		responsive: [
			{
				breakpoint: 743,
				settings: {
					dots: true,
					slidesToShow: 2,
					slidesToScroll: 2,
				}
			},
			{
				breakpoint: 421,
				settings: {
					dots: true,
					slidesToShow: 1,
					slidesToScroll: 1,
				}
			}
		]
	})

	$('.tax-in__list').slick({
		arrows: false,
		dots: false,
		slidesToShow: 4,
		slidesToScroll: 4,
		infinite: false,
		dotsClass: 'slick-dots custom-dots',
		responsive: [{
			breakpoint: 992,
			settings: {
				dots: true,
				slidesToShow: 2,
				slidesToScroll: 2,
			}
		},
		{
			breakpoint: 470,
			settings: {
				dots: true,
				slidesToShow: 1,
				slidesToScroll: 1,
			}
		}
		]
	})

	$('.proof__list').slick({
		arrows: false,
		dots: true,
		dotsClass: 'slick-dots custom-dots',
		infinite: false,
		slidesToShow: 2,
		slidesToScroll: 2,
	})

	$('#bars').click(function () {
		$('.header__menu--btm').toggleClass('active');
		$('body').toggleClass('fixed');
		$(this).toggleClass('active');
		if ($('.overlay').hasClass('showed')) {
			$('.overlay').fadeOut(300);
			$('.overlay').removeClass('showed');
		} else {
			$('.overlay').fadeIn(300);
			$('.overlay').addClass('showed')
		}
	});
	$('.overlay, .close_btn').click(function () {
		$('.overlay').removeClass('showed');
		$('.overlay').fadeOut(300);
		$('body').removeClass('fixed');
		$('.header__menu--btm').removeClass('active');
		$('#bars').removeClass('active');
	});

	$('.sitemap__title').click(function () {
		if (screen.width < 981) {
			$('.sitemap__item').not($(this)).removeClass('active');
			$('.sitemap__title').not($(this)).removeClass('open');
			$('.sitemap__title').not($(this)).next('ul').slideUp();
			$(this).toggleClass('open');
			$(this).parent().toggleClass('active');
			$(this).next('ul').slideToggle();
		}
	});

});

$('.feedback-submit').hover(function () {
	$('#Layer_1').addClass('active');
}, function () {
	$('#Layer_1').removeClass('active');
})

$('.tax__title').click(function () {
	$('.tax__title').not($(this)).removeClass('active');
	$('.tax__title').not($(this)).next('ul').slideUp();
	$(this).toggleClass('active');
	$(this).next('ul').slideToggle();
})

$('.svg-circle').hover(function () {
	let a = $(this).offset().top;
	let b = $(this).offset().left;

	let text1 = $(this).data('cl');
	let text2 = $(this).data('win');

	$('.chart-win').text(text2);
	$('.chart-cl').text(text1);

	if (screen.width > 903) {
		$('.chart__popup').offset({ top: a - 150, left: b + 20 });
	}
	$('.chart__popup').addClass('active');
}, function () {
	$('.chart__popup').removeClass('active');
})

if (screen.width < 676) {
	$('#first').addClass('active');

	$('.svg-circle').click(function () {
		$('.svg-circle').not($(this)).removeClass('active');
		$(this).addClass('active');
	})
}

$('.escort__item').click(function () {
	$('.escort__item').removeClass('active');
	$(this).addClass('active');

	let id = $(this).data('id');
	$('.tax').removeClass('active');
	$('#' + id).addClass('active');

	$('.tax-in__list')[1].slick.refresh()
});

$('.more_btn').click(function () {
	if (screen.width < 481) {
		$(this).toggleClass('active');
		let text = $(this).text();
		text = text.replace(/\s+/g, '');
		if (text == 'Подробнее') {
			$(this).text('Скрыть');
		} else {
			$(this).text('Подробнее');
		}
		$('.content__mobile').slideToggle();
	}
})

$('.send-call').click(function (e) {
	e.preventDefault();
	$('#call').fadeOut(500, function () {
		$('#thanks').fadeIn(500);
	})
});

$('.call-btn').click(function (e) {
	e.preventDefault();
	$('body').addClass('active');
	if (screen.width > 768) {
		$('#call').fadeIn(500);
	} else {
		$('#call').css('display', "block");
	}
})
$('.send-btn').click(function (e) {
	e.preventDefault();
	$('body').addClass('active');
	if (screen.width > 768) {
		$('#send').fadeIn(500);
	} else {
		$('#send').css('display', "block");
	}
})
$('.send-order-btn').click(function (e) {
	e.preventDefault();
	$('body').addClass('active');
	if (screen.width > 768) {
		$('#send-order').fadeIn(500);
	} else {
		$('#send-order').css('display', "block");
	}
})
$('.subscr-btn').click(function (e) {
	e.preventDefault();
	$('body').addClass('active');
	if (screen.width > 768) {
		$('#subscribe').fadeIn(500);
	} else {
		$('#subscribe').css('display', "block");
	}
});

function saveUtmPoint() {
	var referer_domain = document.referrer ? new URL(document.referrer).hostname : '';
	var utm_source = getUrlParameterByName('utm_source');
	var points = {
		'utm_source': utm_source,
		'utm_campaign': getUrlParameterByName('utm_campaign'),
		'utm_medium': getUrlParameterByName('utm_medium'),
		'url': location.href,
		'referer': document.referrer,
		'referer_domain': referer_domain,
	};

	if (utm_source) {
		localStorage.setItem("utm_points", JSON.stringify(points));
	}
}
saveUtmPoint();

function getUtmPoint() {

	var points = localStorage.getItem('utm_points');

	if (points) {
		return points;
	}
}

function setInputUTM() {
	var points = getUtmPoint();

	if ( points ){	
		var utm_source = JSON.parse(points)['utm_source'];
		var utm_campaign = JSON.parse(points)['utm_campaign'];
		var utm_medium = JSON.parse(points)['utm_medium'];
		
		$("body").append('<input type="hidden" name="utm_source" value="' + utm_source + '">');
		$("body").append('<input type="hidden" name="utm_campaign" value="' + utm_campaign + '">');
		$("body").append('<input type="hidden" name="utm_medium" value="' + utm_medium + '">');
	}
}
setInputUTM();

function LocationUtm() {
	var points = getUtmPoint();

	var utm_source = JSON.parse(points)['utm_source'];
	var utm_campaign = JSON.parse(points)['utm_campaign'];
	var utm_medium = JSON.parse(points)['utm_medium'];
	var utm_string = '';

	if (utm_source) {
		utm_string = '?utm_source=' + utm_source;
	}

	if (utm_source && utm_campaign) {
		utm_string = utm_string + '&utm_campaign=' + utm_campaign;
	} else if (utm_campaign) {
		utm_string = '?utm_campaign=' + utm_campaign;
	}

	if ((utm_source && utm_campaign && utm_medium) || (utm_source && utm_medium) || (utm_campaign && utm_medium)) {
		utm_string = utm_string + '&utm_medium=' + utm_medium;
	} else if (utm_medium) {
		utm_string = '?utm_medium=' + utm_medium;
	}

	var url = location.href + utm_string;

	if (utm_string && !getUrlParameterByName('utm_source') && !getUrlParameterByName('utm_campaign') && !getUrlParameterByName('utm_medium')) {
		window.location.href = url;
	}
}
// LocationUtm();

function quize(){
	var quize = $('#quize');
	var quize_button_next = $('#quize-btn-next');
	var quize_button_prev = $('#quize-btn-prev');

	quize_button_next.on('click', function (){
		var step = quize.attr('data-step');
		var steps = quize.attr('steps');
		var next_step = parseInt(step) + 1;

		if ( steps > step ){
			
			if ( quize.find('.quize__question_active input:checked' ).length ){
			
				if ( $(this).hasClass('button_disabled') ){
					$(this).removeClass('button_disabled');
					$(this).removeClass('quize__button_hide');
				}

				quize.find('.quize__question').removeClass('quize__question_active');
				quize.find('.quize__question[step="' + next_step + '"]').addClass('quize__question_active');
				
				$('#quize-step').text(next_step);
		
				$(this).closest('#quize').attr('data-step', next_step);
			
				if ( steps == next_step ){
					$(this).addClass('button_disabled');
					$(this).addClass('quize__button_hide');
				}

			}else{
				alert('Выберите вариант ответа');
			}
		}

		if ( steps == next_step ){
			var answers_input = quize.find('form input[name="quize"]');
			var answers = '';

			quize.find('.quize__question').not('.quize__question_active').each(function(){
				answers += ' '+$(this).find('.quize__title').text() + ': ' + $(this).find('input:checked').val()+'; ';
			});
			
			answers_input.val(answers);
		}
		
	});

	quize_button_prev.on('click', function (){
		var step = quize.attr('data-step');
		var prev_step = parseInt(step) - 1;

		if ( prev_step >= 1 ){
			
			if ( quize_button_next.hasClass('button_disabled') ){
				quize_button_next.removeClass('button_disabled');
				quize_button_next.removeClass('quize__button_hide');
			}

			quize.find('.quize__question').removeClass('quize__question_active');
			quize.find('.quize__question[step="' + prev_step + '"]').addClass('quize__question_active');
			
			$('#quize-step').text(prev_step);
	
			$(this).closest('#quize').attr('data-step', prev_step);
		}
		
	});

}
quize();

function getUrlParameterByName(name) {
	var name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
	var results = regex.exec(location.search);
	return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}