﻿/*	
 *	jQuery validVal debugger
 *	Helps debugging the validation of forms
 *
 *	Copyright (c) 2013 Fred Heusschen
 *	www.frebsite.nl
 *
 *	Dual licensed under the MIT and GPL licenses.
 *	http://en.wikipedia.org/wiki/MIT_License
 *	http://en.wikipedia.org/wiki/GNU_General_Public_License
 */


(function( $ )
{
	if ( !console )				console 			= {};
	if ( !console.log ) 		console.log 		= function() {};
	if ( !console.info ) 		console.info 		= function() {};
	if ( !console.warn ) 		console.warn 		= function() {};
	if ( !console.error ) 		console.error 		= function() {};
	if ( !console.group ) 		console.group 		= function() {};
	if ( !console.groupEnd )	console.groupEnd	= function() {};

    $.fn.validValDebug = function( addBtn )
    {

		//	validVal not found, don't proceed
	    if ( !$.fn.validVal || typeof $.fn.validVal.version == 'undefined' )
	    {
			console.error( 'validVal-plugin not found or too old!' );
			return this;
	    }

		var version = $.fn.validVal.version;
		if ( typeof version == 'string' )
		{
			version = version.split( '.' );
		}
		version = parseFloat( version[ 0 ] + '.' + version[ 1 ] );

		//	Old version of validVal, don't proceed
	    if ( version < 4.4 )
	    {
	    	console.error( 'validValDebug needs at least version 4.4.0 of the validVal-plugin.' );
		    return this;
	    }

		//	Fired on multiple forms
	    if ( this.length > 1 )
        {
            return this.each(
            	function()
            	{
                	$(this).validValDebug( addBtn );
                }
            );
        }

        var form = this;
		var api = ( version < 5.0 )
			? 'vv-isValidVal'
			: 'validVal';

		//	Form is not validVal, don't proceed
	    if ( !form.data( api ) )
		{
			console.log( nodeStringFromNode( form[ 0 ] ) + ' is not a validVal form.' );
			return form;
		}

		var opts = form.triggerHandler( 'options.vv' );


		//	Add the validate button
		if ( typeof addBtn != 'boolean' )
		{
			addBtn = true;
		}
		if ( addBtn )
		{
			var panel = $( '<div />' )
				.appendTo( form )
				.css({
					'padding': '20px 0'
				});

			$( '<input type="submit" value="Validate" />' )
				.appendTo( panel )
				.bind(
					'click.vv',
					function( event )
					{
						event.preventDefault();
						event.stopPropagation();
						form.triggerHandler( 'validate.vv', [ form, false ] );
					}
				);
		}



		//	Bind the debugging info to the fields
		if ( version < 5.0 )
	    {
		    $('input, select, textarea', form).bind(
				'isValid.vv',
				function( e, valid, callCallback, invalidCheck )
				{
					isValid.call( this, valid, invalidCheck, $(this).data( 'vv-validations' ), opts );
				}
			);
	    }
	    else
	    {
		 	$('input, select, textarea', form).each(
				function()
				{
					var that = this,
						vf = $(this).data( 'validValField' );
					
					if ( vf )
					{
						var of = vf.isValid;
	
						vf.isValid = function( valid, callCallback, invalidCheck )
						{
							of.apply( vf, arguments );
							isValid.call( that, valid, invalidCheck, vf.validations, opts );
						};
					}
				}
			);   
	    }
		
		return form;
    }

	function isValid( valid, invalidCheck, validations, opts )
	{
		if ( valid )
		{
			console.group( 'Valid:\n', this );
			console.log( 'Validation(s) that passed: "' + validations.join( '", "' ) + '".' );
		}
		else
		{
			console.group( 'NOT VALID!\n', this );
			var msg = 'Validation "' + invalidCheck + '" failed for the value "' + $(this).val() + '"';
			if ( opts.validations[ invalidCheck ] )
			{
				msg += ':\n';
				msg += ( '\t' + opts.validations[ invalidCheck ] )
					.split( '\r\n' ).join( '\r' )
					.split( '\n\r' ).join( '\r' )
					.split( '\r\r' ).join( '\r' )
					.split( '\r' ).join( '\n' )
					.split( '\t' ).join( '    ' );
			}
			else
			{
				msg += '.';
			}
			console.warn( msg + '\n\n' );
		}
		console.groupEnd();
	}

	function nodeStringFromNode( node )
	{
		var str = node.nodeName.toLowerCase();
		if ( node.id )
		{
			str += '#' + node.id;
		}
		else if ( node.name )
		{
			str += '[name="' + node.name + '"]';
		}

		return str;
	}


})( jQuery );