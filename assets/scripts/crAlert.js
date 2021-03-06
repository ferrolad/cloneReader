;(function($) {
	var
		methods,
		crAlert;

	methods = {
		init : function( options ) {
			if ($(this).data('crAlert') == null) {
				$(this).data('crAlert', new crAlert($(this), options));
			}
			$(this).data('crAlert').show($(this), options);

			return $(this);
		},

		hide: function() {
			$(this).data('crAlert').hide();
			return $(this);
		}
	};

	$.fn.crAlert = function( method ) {
		// Method calling logic
		if ( methods[method] ) {
			return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'string' || typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.tooltip' );
		}
	};

	crAlert = function() {

	};

	crAlert.prototype = {
		/*
		 * input indica a que elemento se le pasara el foco cuando el crAlert se cierre
		 * options puede ser un object cons las propiedades {msg, callback }
		 * 			tambien puede ser un DomNode o un String, es este caso el pluggin se encarga de mergear las options
		 */
		show: function($input, options) {
			this.$input  = $input;
			this.options = $.extend(
				{
					msg:          '',
					callback:     null,
					isConfirm:    false,
					icon:         '', // [success,] // TODO: implementar más iconos por defecto
					confirmText:  crLang.line('Ok')
				},
				(typeof options === 'string' ? { msg: options } :
					($(options).get(0).tagName != null ? { msg: options } : options ) )
			);

			if (this.options.icon == 'success') {
				this.options.msg = ' <i class="fa fa-check-circle fa-3x text-success  "></i> ' + this.options.msg;
			}

			this.$modal         = $('<div role="dialog" class="modal in crAlert" />');
			this.$modalDialog   = $('<div class="modal-dialog" />').appendTo(this.$modal);
			this.$modalContent  = $('<div class="modal-content" />').appendTo(this.$modalDialog);
			this.$body          = $('<div />').html(this.options.msg).addClass('modal-body').appendTo(this.$modalContent);
			this.$footer        = $('<div />').addClass('modal-footer').appendTo(this.$modalContent);
			this.$btn           = $('<button data-dismiss="modal" class="btn btn-default" />').text(this.options.isConfirm == true ? crLang.line('Cancel') : crLang.line('Close')).appendTo(this.$footer);

			if (this.options.isConfirm == true) {
				$('<button data-dismiss="modal" class="btn btn-primary" />')
					.text(this.options.confirmText)
					.on('click', $.proxy(
						function(event) {
							this.options.callback();
							this.$modal.modal('hide');
						}
					, this))
					.appendTo(this.$footer);
			}

			// para evitar que se vaya el foco a otro elemento de la pagina con tab
			$(document).bind('keydown.crAlertKeydown', ($.proxy(
				function(event) {
					event.stopPropagation();

					switch (event.keyCode) {
						case 27: // esc!
							this.$modal.modal('hide');
							return false;
							break;
						case 9: // tab
							if (this.$modal.find('.btn-primary').length != 0 && this.$modal.find('.btn-primary').is(':focus') == false) {
								this.$modal.find('.btn-primary').focus();
							}
							else {
								this.$modal.find('.btn-default').focus();
							}
							return false;
							break;
						case 13: // enter
							//return false;
							break;
						default:
							event.preventDefault();
							return false;
					}
				}
			, this)));


			$.showModal(this.$modal, true);
			this.$modal.on('hidden.bs.modal', $.proxy(
				function(event) {
					$(this).remove();
					$(document).unbind('keydown.crAlertKeydown');

					if (this.options.isConfirm == false) {
						if(this.options.callback instanceof Function) {
							this.options.callback();
						}
						this.$input.focus();
					}
				}
			, this));

			this.$btn.focus();
			$(document).focus();
		}
	};
})($);
