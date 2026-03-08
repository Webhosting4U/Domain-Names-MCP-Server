<?php
/**
 * Plugin Name: Code block styling and copy button
 * Description: Styles WordPress code blocks (wp-block-code) like a coding block and adds a one-click copy button.
 * Version: 1.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'wp_enqueue_scripts', function() {
	$css = '
		.wp-block-code,
		pre.wp-block-code {
			position: relative;
			background: #1e1e1e;
			color: #d4d4d4;
			font-family: Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace;
			font-size: 14px;
			line-height: 1.5;
			padding: 1em 1.25em;
			padding-top: 2.5em;
			border-radius: 6px;
			border: 1px solid #333;
			overflow-x: auto;
			margin: 1.25em 0;
			box-shadow: 0 2px 8px rgba(0,0,0,0.15);
		}
		.wp-block-code code,
		pre.wp-block-code code {
			display: block;
			background: none;
			color: inherit;
			padding: 0;
			font-size: inherit;
			white-space: pre;
		}
		.wp-block-code .code-block-copy-btn {
			position: absolute;
			top: 8px;
			right: 8px;
			padding: 6px 12px;
			font-size: 12px;
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
			background: #0e639c;
			color: #fff;
			border: none;
			border-radius: 4px;
			cursor: pointer;
			opacity: 0.9;
			transition: opacity 0.15s, background 0.15s;
		}
		.wp-block-code .code-block-copy-btn:hover {
			opacity: 1;
			background: #1177bb;
		}
		.wp-block-code .code-block-copy-btn.copied {
			background: #107c10;
		}
	';
	wp_register_style( 'code-block-styling', false, array(), '1.0' );
	wp_enqueue_style( 'code-block-styling' );
	wp_add_inline_style( 'code-block-styling', $css );
}, 20 );

add_action( 'wp_footer', function() {
	$copy_text = 'Αντιγραφή';
	$copied_text = 'Αντιγραφήκε!';
	?>
	<script>
	(function() {
		function initCodeBlockCopy() {
			var blocks = document.querySelectorAll( '.wp-block-code, pre.wp-block-code' );
			blocks.forEach(function( block ) {
				if ( block.querySelector( '.code-block-copy-btn' ) ) return;
				var code = block.querySelector( 'code' );
				var target = code || block;
				var btn = document.createElement( 'button' );
				btn.type = 'button';
				btn.className = 'code-block-copy-btn';
				btn.textContent = '<?php echo esc_js( $copy_text ); ?>';
				btn.setAttribute( 'aria-label', '<?php echo esc_js( $copy_text ); ?>' );
				block.style.position = 'relative';
				block.insertBefore( btn, block.firstChild );
				btn.addEventListener( 'click', function() {
					var text = ( code && code.textContent ) ? code.textContent : block.innerText;
					text = text.replace( /\n$/, '' );
					if ( navigator.clipboard && navigator.clipboard.writeText ) {
						navigator.clipboard.writeText( text ).then(function() {
							btn.textContent = '<?php echo esc_js( $copied_text ); ?>';
							btn.classList.add( 'copied' );
							setTimeout(function() {
								btn.textContent = '<?php echo esc_js( $copy_text ); ?>';
								btn.classList.remove( 'copied' );
							}, 2000);
						});
					} else {
						var ta = document.createElement( 'textarea' );
						ta.value = text;
						ta.style.position = 'fixed';
						ta.style.left = '-9999px';
						document.body.appendChild( ta );
						ta.select();
						try {
							document.execCommand( 'copy' );
							btn.textContent = '<?php echo esc_js( $copied_text ); ?>';
							btn.classList.add( 'copied' );
							setTimeout(function() {
								btn.textContent = '<?php echo esc_js( $copy_text ); ?>';
								btn.classList.remove( 'copied' );
							}, 2000);
						} catch ( e ) {}
						document.body.removeChild( ta );
					}
				});
			});
		}
		if ( document.readyState === 'loading' ) {
			document.addEventListener( 'DOMContentLoaded', initCodeBlockCopy );
		} else {
			initCodeBlockCopy();
		}
	})();
	</script>
	<?php
}, 99 );
