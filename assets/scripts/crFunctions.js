$.extend({
	namespace: function() {
		var a = arguments,
			o = null,
			i, j, d;

		for (i = 0; i < a.length; i = i + 1) {
			d = a[i].split(".");
			o = window;

			for (j=0; j<d.length; j=j+1) {
				o[d[j]] = o[d[j]] || {};
				o = o[d[j]];
			}
		}

		return o;
	},

	base_url: function(uri) {
		if (uri != null) {
			uri = uri.replace(crSettings.base_url, '');
			return crSettings.base_url + uri;
		}
		return crSettings.base_url;
	},

	isMobile: function() {
		return $('#header .navbar-toggle').is(':visible');
	},

	validateEmail: function(value) {
		if (value == '') {
			return true;
		}
		var filter = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
		return !!filter.test(value);
	},

	validateUrl: function(value) {
		if (value.length == 0) { return true; }

		if(!/^(https?|ftp):\/\//i.test(value)) {
			value = 'http://' + value;
		}

		var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
		return regexp.test(value);
	},

	strPad: function(i,l,s) {
		var o = i.toString();
		if (!s) { s = '0'; }
		while (o.length < l) {
			o = s + o;
		}
		return o;
	},

	htmlspecialchars: function(string) {
		return $('<div></div>').html(string).text();
	},

	base64Decode: function( data ) {
		var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
		var o1, o2, o3, h1, h2, h3, h4, bits, i = 0, ac = 0, dec = "", tmp_arr = [];

		if (!data) {
			return data;
		}

		data += '';

		do {
			h1 = b64.indexOf(data.charAt(i++));
			h2 = b64.indexOf(data.charAt(i++));
			h3 = b64.indexOf(data.charAt(i++));
			h4 = b64.indexOf(data.charAt(i++));

			bits = h1<<18 | h2<<12 | h3<<6 | h4;

			o1 = bits>>16 & 0xff;
			o2 = bits>>8 & 0xff;
			o3 = bits & 0xff;

			if (h3 == 64) {
				tmp_arr[ac++] = String.fromCharCode(o1);
			} else if (h4 == 64) {
				tmp_arr[ac++] = String.fromCharCode(o1, o2);
			} else {
				tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
			}
		} while (i < data.length);

		dec = tmp_arr.join('');
		dec = $.utf8Decode(dec);

		return dec;
	},

	base64Encode: function(data) {
		var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
		var o1, o2, o3, h1, h2, h3, h4, bits, i = 0, ac = 0, enc="", tmp_arr = [];

		if (!data) {
			return data;
		}

		data = $.utf8Encode(data+'');

		do { // pack three octets into four hexets
			o1 = data.charCodeAt(i++);
			o2 = data.charCodeAt(i++);
			o3 = data.charCodeAt(i++);

			bits = o1<<16 | o2<<8 | o3; h1 = bits>>18 & 0x3f;
			h2 = bits>>12 & 0x3f;
			h3 = bits>>6 & 0x3f;
			h4 = bits & 0x3f;

			// use hexets to index into b64, and append result to encoded string
			tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
		} while (i < data.length);

		enc = tmp_arr.join('');

		switch (data.length % 3) {
			case 1:
				enc = enc.slice(0, -2) + '==';
				break;
			case 2:
				enc = enc.slice(0, -1) + '=';
				break;
		}

		return enc;
	},

	utf8Decode: function( str_data ) {
		var tmp_arr = [], i = 0, ac = 0, c1 = 0, c2 = 0, c3 = 0;

		str_data += '';

		while ( i < str_data.length ) {
			c1 = str_data.charCodeAt(i);
			if (c1 < 128) {
				tmp_arr[ac++] = String.fromCharCode(c1);
				i++;
			} else if ((c1 > 191) && (c1 < 224)) {
				c2 = str_data.charCodeAt(i+1);
				tmp_arr[ac++] = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
				i += 2;
			} else {
				c2 = str_data.charCodeAt(i+1);
				c3 = str_data.charCodeAt(i+2);
				tmp_arr[ac++] = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
		}

		return tmp_arr.join('');
	},

	utf8Encode: function( argString ) {
		var string = (argString+''); // .replace(/\r\n/g, "\n").replace(/\r/g, "\n");

		var utftext = "", start, end, stringl = 0;

		start = end = 0;
		stringl = string.length;
		for (var n = 0; n < stringl; n++) {
			var c1 = string.charCodeAt(n);
			var enc = null;

			if (c1 < 128) {
				end++;
			}
			else if (c1 > 127 && c1 < 2048) {
				enc = String.fromCharCode((c1 >> 6) | 192) + String.fromCharCode((c1 & 63) | 128);
			}
			else {
				enc = String.fromCharCode((c1 >> 12) | 224) + String.fromCharCode(((c1 >> 6) & 63) | 128) + String.fromCharCode((c1 & 63) | 128);
			}
			if (enc !== null) {
				if (end > start) {
					utftext += string.slice(start, end);
				}
				utftext += enc;
				start = end = n+1;
			}
		}

		if (end > start) {
			utftext += string.slice(start, stringl);
		}

		return utftext;
	},

	stripTags: function(str, allowed_tags) {
		var key = '', allowed = false;
		var matches = [];
		var allowed_array = [];
		var allowed_tag = '';
		var i = 0;
		var k = '';
		var html = '';
		var replacer = function (search, replace, str) {
			return str.split(search).join(replace);
		};
		// Build allowes tags associative array
		if (allowed_tags) {
			allowed_array = allowed_tags.match(/([a-zA-Z0-9]+)/gi);
		}
		str += '';
		// Match tags
		matches = str.match(/(<\/?[\S][^>]*>)/gi);
		// Go through all HTML tags
		for (key in matches) {
			if (isNaN(key)) {
				// IE7 Hack
				continue;
			}
			// Save HTML tag
			html = matches[key].toString();
			// Is tag not in allowed list? Remove from str!
			allowed = false;
			// Go through all allowed tags
			for (k in allowed_array) {
				// Init
				allowed_tag = allowed_array[k];
				i = -1;
				if (i != 0) { i = html.toLowerCase().indexOf('<'+allowed_tag+'>');}
				if (i != 0) { i = html.toLowerCase().indexOf('<'+allowed_tag+' ');}
				if (i != 0) { i = html.toLowerCase().indexOf('</'+allowed_tag)   ;}

				// Determine
				if (i == 0) {
					allowed = true;
					break;
				}
			}
			if (!allowed) {
				str = replacer(html, "", str); // Custom replace. No regexing
			}
		}
		return str;
	},

	showNotification: function(msg, className){
		if (className == null) {
			className = 'alert-success';
		}
		$div = $('<div class="notification alert ' + className +' fade in navbar-fixed-top"><strong>' + msg + '</strong></div>')
			.appendTo('body')
			.fadeTo('slow', 0.95).delay(2000).slideUp('slow');
	},

	showWaiting: function(forceWaiting) {
		/*
		 * TODO:
		 * Para forzar que muestre o oculte el div, sumo o resto a la variable countProcess; pensar si hay una forma mas elegante de resolver esto.
		 */
		if ($.countProcess < 0) { $.countProcess = 0; }
		if (forceWaiting == true) {$.countProcess++;}
		if (forceWaiting == false) {$.countProcess--;}

		var isLoading = ($.countProcess > 0);


		$('#divWaiting').css( { 'display':	isLoading == true ? 'block' : 'none' } );

		$('#divWaiting').appendTo('body');

		$('body').removeClass('isLoading');
		if (isLoading == true) {
			$('body').addClass('isLoading');
		}
	},

	goToUrl: function(url) {
		if ($.support.pushState == false) {
			$.showWaiting(true);
			location.href = url;
			return;
		}

		history.pushState(null, null, url);
		crMain.loadUrl(url);
	},

	goToUrlList: function() {
		var urlList = $.url().param('urlList');
		if (urlList != null) {
			$.goToUrl($.base64Decode(decodeURIComponent(urlList)));
		}
	},

	reloadUrl: function() {
		if ($.support.pushState == false) {
			$.showWaiting(true);
			location.reload();
			return;
		}

		crMain.loadUrl(location.href);
	},

	ISODateString: function(d, skipTime){
		function pad(n) { return n<10 ? '0'+n : n; }
		var string = d.getUTCFullYear() + '-' + pad(d.getUTCMonth()+1) + '-' + pad(d.getUTCDate());
		if (skipTime != true) {
			string += ' ' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds());
		}
		return string;
	},

	formatDate: function($element) {
		if (crSettings.momentLoaded != true) {
			crSettings.momentLoaded = true;
			moment.lang(crSettings.langId);
			crSettings.fixDatetime = moment(crSettings.datetime, 'YYYY-MM-DDTHH:mm:ss').diff(moment(), 'ms'); // guardo en memoria la diferencia de tiempo entre la db y el cliente, para mostrar bien las fechas
		}

		if ($element.data('datetime') == null) {
			$element.data('datetime', $element.text());
		}

		var datetime = $element.data('datetime');
		if (datetime == '') {
			return;
		}

		if (moment(datetime, 'YYYY-MM-DDTHH:mm:ss').isValid() == false) {
			$element.text('');
			return;
		}

		var $moment = moment(datetime, 'YYYY-MM-DDTHH:mm:ss' );
		var format  = crLang.line('MOMENT_DATE_FORMAT');
		if ($element.hasClass('datetime')) {
			format += ' HH:mm:ss';
		}

		$element.attr('title', $moment.format(format) );

		if ($element.hasClass('fromNow')) {
			$element.text( $moment.from( moment().add(-crSettings.fixDatetime, 'ms')));
		}
		else {
			$element.text( $moment.format( format) );
		}
	},

	hideMobileNavbar: function() {
		if ($.isMobile() == true) {
			if ($('.navbar-ex1-collapse').is(':visible') == true) {
				$('.navbar-ex1-collapse').collapse('hide');
			}
		}
	},

	showModal: function($modal, keyboard, onCloseRemove) {
		$('body').addClass('modal-open');

		$modal.data('onCloseRemove', onCloseRemove == null ? true : onCloseRemove);

		$modal.modal( { 'backdrop': 'static', 'keyboard': keyboard });

		$('.modal').css('z-index', 1039);

		$(document).unbind('hidden.bs.modal');
		$(document).bind('hidden.bs.modal', function (event) {
			if ($(event.target).data('onCloseRemove') == true) {
				$(event.target).remove();
				$(this).removeData('bs.modal');
			}

			$(document.body).removeClass('modal-open');
			if ($('.modal-backdrop').length > 0) {
				$('.modal-backdrop').last().show();
				$('body').addClass('modal-open');
				$('.modal:last').css('z-index', 1050);
			}
		});

		$(document).off('focusin.modal');

		$('.modal-backdrop').hide();

		$('.modal-backdrop:last')
			.css( {'opacity': 0.3  } )
			.show();
		$('.modal:last').css('z-index', 1050);
	},

	/**
	 * 	Ejecuta las acciones por defecto de una peticion ajax (alerts, redirects, notifications, etc)
	 * 	Params:
	 * 		skipAppLink      fuerza la variable $.support.pushState=false; se utiliza para un hard redirect
	 * 		goToUrl          carga una url
	 * 		notification     muestra una notificación
	 * 		msg              muestra un alert, y al cerrarlo carga una url
	 * 		reloadMenu       vuelve a pedir el menu y las traducciones
	 * 		reloadUrl        vuelve a cargar la url actual
	 * 		formErrors       un array con el formato: {'fieldName': 'errorMessage' }.
	 * 							muestra un alert con los errores del form;
	 * 							en las  llamadas a esta funcion desde crForm se agrega la referencia "response['result']['crForm']" para agregar el has-error a los fields con errores
	 * 		showPopupLogin   muestra el popup de login
	 */
	hasAjaxDefaultAction: function(response) {
		if (response == null) {
			$(document).crAlert('error');
			return true;
		}
		var result = response['result'];

		if (result['reloadMenu'] == true) {
			crMain.reloadMenu();
		}

		if (result['skipAppLink'] == true) {
			$.support.pushState = false;
		}

		if (response['code'] != true && result['crForm'] != null && result['formErrors'] != null) {
			var msg = '';
			for (var fieldName in result['formErrors']){
				result['crForm'].setErrorField(fieldName);
				msg += '<p>' + result['formErrors'][fieldName] + '</p>';
			}
			if (msg != '') {
				$(document).crAlert(msg);
				return true;
			}
		}

		if (result['showPopupLogin'] == true) {
			$.showPopupLogin(response);
			return true;
		}

		if (response['code'] != true) {
			$(document).crAlert(result);
			return true;
		}

		if (result['msg'] != null) {
			var callback = null;
			if (result['goToUrl'] != null) {
				callback = function() { $.goToUrl(result['goToUrl']); }
			}
			if (result['reloadUrl'] == true) {
				callback = function() { $.reloadUrl(); }
			}
			$(document).crAlert({
				'msg':      result['msg'],
				'icon':     result['icon'],
				'callback': callback
			});
			return true;
		}
		if (result['notification'] != null) {
			$.showNotification(result['notification']);
			return true;
		}
		if (result['goToUrl'] != null) {
			$.goToUrl(result['goToUrl']);
			return true;
		}
		if (result['reloadUrl'] == true) {
			$.reloadUrl();
			return true;
		}

		return false;
	},

	showPopupForm: function(form) {
		var $subform = $(document).crForm('renderPopupForm', form);
		var $modal   = $subform.parents('.modal');

		$.showModal($modal, false);

		return $modal;
	},

	showPopupLogin: function(response) {
		var $modal = $('\
			<div class="modal" role="dialog" >\
				<div class="modal-dialog" >\
					<div class="modal-content" >\
						<div class="modal-header">\
							<button aria-hidden="true" data-dismiss="modal" class="close" type="button">\
								<i class="fa fa-times"></i>\
							</button>\
							<h4 />\
						</div> \
						<div class="modal-body"> </div>\
					</div>\
				</div>\
			</div>\
		');
		$modal.appendTo($('body'));
		$modal.find('.modal-header h4').text(response['result']['title']);
		$modal.find('.modal-body').append(response['result']['html']);

		$.showModal($modal, false);
	},

	showPopupSimpleForm: function($element, placeholder, callback, value){
		if ($.$popupSimpleForm == null) {
			$.$popupSimpleForm = $('\
				<form class="btn-default dropdown-menu form-inline popupSimpleForm "> \
					<div class="input-group"> \
						<input type="text" class="form-control"  /> \
						<span class="input-group-btn" > \
							<button class="btn btn-primary"> <i class="fa fa-check" /> </button> \
						</span> \
					</div> \
				</form>\
			');

			$.$popupSimpleForm.find('input').keyup(function(event) {
				event.stopPropagation();
			});

			$.$popupSimpleForm.data('$element', $('body'));

			$(document).click(
				function(event) {
					if ($(event.target).parents('.modal').length != 0) {
						return;
					}
					if ($('.crAlert:visible').length != 0) {
						return;
					}
					if ($.$popupSimpleForm != null) {
						if ($.contains($.$popupSimpleForm[0], event.target)) {
							return;
						}
					}

					$.hidePopupSimpleForm();
				}
			);
		}

		if ($.$popupSimpleForm.data('$element').is($element)) {
			return $.hidePopupSimpleForm();
		}

		var $page = $('.cr-page:visible');

		$.hidePopupSimpleForm();
		$.hideMobileNavbar();
		$element.addClass('active');

		if (value == null) { value = ''; }

		$.$popupSimpleForm
			.data('$element', $element)
			.unbind()
			.submit(function(event) {
				event.preventDefault();
				callback();
				return false;
			});
		$.$popupSimpleForm.find('input').attr('placeholder', placeholder.toLowerCase()).val( value );

		var top  = $element.offset().top + $element.outerHeight(false);
		var left = $element.offset().left;

		$.$popupSimpleForm
			.css({ 'top': top,  'left': left, 'right': 'auto', 'position': 'fixed' })
			.appendTo($('body'))
			.stop()
			.fadeIn();

		if ($page.width() < ($.$popupSimpleForm.width() + left)) {
			$.$popupSimpleForm.css({ 'left': 'auto', 'right': 5 });
		}

		if ($.isMobile() == false) {
			$.$popupSimpleForm.find('input').focus();
		}
	},

	hidePopupSimpleForm: function() {
		if ($.$popupSimpleForm != null) {
			$.$popupSimpleForm.hide();
			if ($.$popupSimpleForm.data('$element') != null) {
				$.$popupSimpleForm.data('$element').removeClass('active');
			}
			$.$popupSimpleForm.data('$element', $('body'));
		}
	},

	formatNumber: function(value) { // TODO: ver si hay alguna manera de que autoNumeric devuelva el numero formateado sin tener que crear un $elemento
		return $('<span />')
			.text(value)
			.autoNumeric('init', { aSep: crLang.line('NUMBER_THOUSANDS_SEP'), aDec: crLang.line('NUMBER_DEC_SEP'),  aSign: '', mDec: 0 } )
			.text();
	},

	normalizeLang: function(langId) {
		// FIXME: mejorar esto, pone una parte del langId en mayusculas. Se usa en datetimepicker
		var aTmp = langId.split('-');
		if (aTmp.length == 2) {
			return aTmp[0] + '-' + aTmp[1].toUpperCase();
		}

		return langId;
	},

	initGallery: function($gallery) {
		if ($gallery.data('initGallery') == true) {
			return;
		}

		$gallery.on('click', 'a', $.proxy(
			function($gallery, event) {
				if ($.hasCrGallery != true) {
					$('<div id="blueimp-gallery" class="blueimp-gallery blueimp-gallery-controls"> \
						<div class="slides"></div> \
						<h3 class="title"></h3> \
						<a title="‹" class="prev">‹</a> \
						<a title="›" class="next">›</a> \
						<a title="×" class="close">×</a> \
						<a title="" class="play-pause"></a> \
						<ol class="indicator"></ol> \
					</div> ').appendTo($('body'));
					$.hasCrGallery = true;
				}

				var target = event.currentTarget;
				if ($(target).hasClass('thumbnail') == false) {
					return;
				}
				blueimp.Gallery($gallery.find('a'), {index: target, event: event, startSlideshow: true, slideshowInterval: 5000, stretchImages: false});
			}
		, this, $gallery));

		$gallery.data('initGallery', true);
	},

	saveGalleryLog: function() {
		if ($('#fileupload').find('input[name=hasEntityLog]').val() != 'true') {
			return;
		}

		if ($.countGalleryProcess < 0) { $.countGalleryProcess = 0; }
		if ($.countGalleryProcess > 0) {
			return;
		}

		$.ajax({
			'type':   'post',
			'url':    $.base_url('gallery/saveGalleryLog'),
			'data':   {
				'entityTypeId': $('#fileupload').find('input[name=entityTypeId]').val(),
				'entityId':     $('#fileupload').find('input[name=entityId]').val()
			},
		});
	},

	saveEntitySef: function(event, entityTypeId, entityId) {
		var crForm = $(event.target).parents('form').data('crForm');
		$.ajax({
			'url':   $.base_url('app/saveEntitySef/' + entityTypeId + '/' + entityId),
			'data':  { },
			'crForm': crForm,
			'success':
				function (response) {
					var crForm    = this.crForm;
					var field     = crForm.getFieldByName('entityUrl');
					var entityUrl = response['result']['entityUrl'];
					field.attr('href', entityUrl).text(entityUrl);

					$(document).crAlert({ 'msg': crLang.line('Data updated successfully'), 'icon': 'success' });
				}
		});
	},

	showPopupEntityLog: function(entityTypeId, entityId) {
		$.ajax({
			'url':   $.base_url('logs/detail/' + entityTypeId + '-' + entityId + '?isPopUp=true'),
			'data':  { },
			'success':
				function (response) {
					$html = $(response['result']);
					var $modal = $('\
						<div class="modal" role="dialog" >\
							<div class="modal-dialog" >\
								<div class="modal-content" >\
									<div class="modal-header">\
										<button aria-hidden="true" data-dismiss="modal" class="close" type="button">\
											<i class="fa fa-times"></i>\
										</button>\
										<h4 />\
									</div> \
									<div class="modal-body"> </div>\
									<div class="modal-footer"> \
										<button type="button" class="btn btn-default" data-dismiss="modal"> ' + crLang.line('Close') + ' </button> \
									</div>\
								</div>\
							</div>\
						</div>\
					');
					$modal.appendTo($('body'));
					$modal.find('.modal-header h4').html(' <i class="fa fa-files-o text-info"></i> Log - ' + $html.find('.panel-heading span').text());
					$modal.find('.modal-body').addClass('cr-page-logs-detail').append($html.find('ul.list-group'));

					$modal.find('.modal-body ul.list-group li:first').remove();

					$modal.find('.cr-page-logs-detail .datetime').each( function() { $.formatDate($(this)); } );

					$.showModal($modal, true, true);
				}
		});
	}
});

$(window).resize(function() {
	resizeWindow();
});

function resizeWindow() {
}

function cn(value) {
	console.log(value);
}
