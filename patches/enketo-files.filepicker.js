*** node_modules_backup/enketo-core/src/widget/file/filepicker.js	2017-08-18 01:35:50.000000000 +0100
--- node_modules/enketo-core/src/widget/file/filepicker.js	2017-11-02 16:05:41.000000000 +0100
***************
*** 35,41 ****
   * Initialize
   */
  Filepicker.prototype._init = function() {
!     var $input = $( this.element );
      var existingFileName = $input.attr( 'data-loaded-file-name' );
      var that = this;
  
--- 35,42 ----
   * Initialize
   */
  Filepicker.prototype._init = function() {
!     var element = this.element;
!     var $input = $( element );
      var existingFileName = $input.attr( 'data-loaded-file-name' );
      var that = this;
  
***************
*** 80,86 ****
              that._changeListener();
              $input.prop( 'disabled', false );
              if ( existingFileName ) {
!                 fileManager.getFileUrl( existingFileName )
                      .then( function( url ) {
                          that._showPreview( url, that.props.mediaType );
                      } )
--- 81,87 ----
              that._changeListener();
              $input.prop( 'disabled', false );
              if ( existingFileName ) {
!                 fileManager.getFileUrl( element, existingFileName )
                      .then( function( url ) {
                          that._showPreview( url, that.props.mediaType );
                      } )
***************
*** 138,144 ****
              fileName = utils.getFilename( file, postfix );
  
              // process the file
!             fileManager.getFileUrl( file, fileName )
                  .then( function( url ) {
                      // update UI
                      that._showPreview( url, that.props.mediaType );
--- 139,145 ----
              fileName = utils.getFilename( file, postfix );
  
              // process the file
!             fileManager.getFileUrl( that.element, file, fileName )
                  .then( function( url ) {
                      // update UI
                      that._showPreview( url, that.props.mediaType );
