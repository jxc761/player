// nplab movie
(function($) {
$.widget("nplab.movie", {


	
	options : {
		images   : [],
		overlays : [],
		//bRepeat : true,

		/*class names*/
		cls_names : {  
			frames  : "nplab_frames",
			frame   : "nplab_frame",
			image   : "nplab_image",
			overlay : "nplab_overlay"
		},
		
		
		//callbacks 
		change : function( event, data ) {
  		    //alert("change frame: " + data.value);
  		}, 

  		scale         : 1, 
  		bShowOverlays : false, 

	},

	// get method   
	getFrame : function(index) {
		var self = $(this.element);

		// get valid index
		index = this._index(index);
		
		return self.find('.' + this.options.cls_names.frame + '[frameIndex=' + index + ']').get(0);
	},

	getCurFrameIndex : function () {
		return this._curIndex;
	},

	getFramesCount : function () {
		return this.options.images.length;
	},

	// set method
	showOverlays : function( bShow) {
		this.options.bShowOverlays = bShow;
		this._updateShowOverlays();
		return this;
	},

	setScale : function(scale) {
		this.options.scale = scale;
		this._updatesScale();
		return this;
	}, 

	setContent : function (images, overlays) {
        this.clearContent();
        
        this.options.images = images;
        this.options.overlays = overlays;

        this._create();
		
	},


 	// go to frame 
	gotoNextFrame : function() {
		return this.gotoFrame(this.getCurFrameIndex() + 1);
	},

	gotoPrevFrame : function() {
		return this.gotoFrame(this.getCurFrameIndex() - 1);
	},

	gotoFirstFrame : function() {
		return this.gotoFrame(0);
	},

	gotoLastFrame : function() {
		return this.gotoFrame(this.getFramesCount() - 1 );
	},

	gotoFrame : function(index) {
		this._setCurFrame(index);
		return this;
	},


	// private
	_create : function() {

		console.log(this.options);
		this._renderContent();	
		this._updatesScale();
		this._updateShowOverlays();
		this.gotoFirstFrame();
	},

	_setCurFrame : function (index) {

		var old = this._curIndex;
		this._curIndex = this._index(index);
		this._hideAll();
		$(this.element).find('.' + this.options.cls_names.frame + '[frameIndex=' + this._curIndex  + ']').show();
		
		// trigger event 
		this._trigger("change", null, {"value" : this._curIndex} );
		
		// console.log(this._curIndex );
		return this;
	},


	_renderContent :function(){

		// console.log(this.options.images.length);

		var wrapper = this.element.addClass(this.options.cls_names.frames); //$('<div />').addClass(this.options.cls_names.frames);
		
		for (var i = 0 ; i < this.options.images.length; i++) {
			var curWrapper 	= $('<div />').addClass( this.options.cls_names.frame).attr( {"frameIndex": i});
			var curImg 		= $('<img />').addClass( this.options.cls_names.image).attr( {"src" : this.options.images[i] });
			var curSpan     = $('<span />').text(this.options.overlays[i]);
			var curTitle    = $('<span />').addClass( this.options.cls_names.overlay).append(curSpan);
			curWrapper.append(curImg);
			curWrapper.append(curTitle);
			wrapper.append(curWrapper);
		}

		//$(this.element).append(wrapper);
		return this;
	},


	_updatesScale : function(){
		var self = this.element;
		var scale = this.options.scale;

		self.find('.' + this.options.cls_names.image).each(function(curIndex, curImg){
			//console.log(curIndex + ":" +  $(curImg).attr("src") );
			var img = new Image();
			img.src = $(curImg).attr("src");
			// Get accurate measurements from that.
			var newWidth  = img.width * scale  + "px";
			var newHeight = img.height * scale  + "px";
			$(curImg).css({"height" : newHeight, "width" : newWidth});
		});
	},

	_updateShowOverlays : function (){
		var self = this.element;
		if(this.options.bShowOverlays) {
			self.find('.' + this.options.cls_names.overlay).show();
		}else {
			self.find('.' + this.options.cls_names.overlay).hide();
			
		}
	},

	_hideAll : function () {
		var self = $(this.element);
		self.find('.' + this.options.cls_names.frame).hide();
		return this;
	},

	_index : function(i){
		var total = this.getFramesCount();

		i = parseInt(i);

		var index = i;
		


		if (i < 0) {
			index = 0;
		}

		if (i >= total){
			index = total - 1;
		}

		return index;
	},

	_throw: function (errorCode) {

		if (window.console) {
			console.log("nplab::error " +  errorCode);
		} else{
			alert("nplab::error " +  errorCode);
		}
	},



	clearContent : function(){
		// element
		this.element
            .removeClass(this.name)
            .find('.' + this.options.cls_names.frame).remove();
        return this;
	},

	destroy : function(){

		this.clearContent();
		this.options = {};
	}

});

})(jQuery);