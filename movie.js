// nplab movie
$.widget("nplab.movie", {
	options : {
		images   : [],
		overlays : [],
		bCycle : false,


		/*class names*/
		cls_names : {  
			frames  : "nplab_frames",
			frame   : "nplab_frame",
			image   : "nplab_image",
			overlay : "nplab_overlay"
		},

		//callbacks 
		// update : function( event, data ) {
  		//           alert( "defaults" );
  		//       }

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

	nTotalFrames : function () {
		return this.options.images.length;
	},

	// set method
	showOverlays : function( bShow) {
		var self = $(this.element);
		if(bShow) {
			self.find('.' + this.options.cls_names.overlay).hide();
		}else {
			self.find('.' + this.options.cls_names.overlay).show();
		}
		return this;
	},

	setScale : function(scale) {

		var self = $(this.element);
		self.find('.' + this.options.cls_names.image).each(function(curIndex, curImg){
			var img = new Image();
			img.src = $(curImg).attr("src");
			// Get accurate measurements from that.
			var newWidth  = img.width * scale  + "px";
			var newHeight = img.height * scale  + "px";
			$(curImg).css({"height" : newHeight, "width" : newWidth});
		});

		return this;
	}, 


 	// go to frame 
	gotoNextFrame : function() {
		return this.gotoFrame(this.getCurFrameIndex() + 1);
	},

	gotoPreFrame : function() {
		return this.gotoFrame(this.getCurFrameIndex() - 1);
	},

	gotoFirstFrame : function() {
		return this.gotoFrame(0);
	},

	gotoLastFrame : function() {
		return this.gotoFrame(this.nTotalFrames() - 1 );
	},

	gotoFrame : function(index) {
		this._setCurFrame(index);
		return this;
	},


	// private
	_create : function() {
		this._renderContent();	
		this.gotoFirstFrame();
		return this;    
	},

	_setCurFrame : function (index) {
		var old = this._curIndex;
		this._curIndex = this._index(index);
		this._hideAll();
		$(this.element).find('.' + this.options.cls_names.frame + '[frameIndex=' + this._curIndex  + ']').show();
		
		// trigger event 
		// if(old !== this._curIndex) {
		// 	_trigger("update", null, this._curIndex);
		// }
		return this;
	},

    
	_renderContent :function(){

		// console.log(this.options.images.length);

		var wrapper = $('<div />').addClass(this.options.cls_names.frames);
		
		for (var i = 0 ; i < this.options.images.length; i++) {
			
			var curWrapper 	= $('<div />').addClass( this.options.cls_names.frame).attr( {"frameIndex": i});
			var curImg 		= $('<img />').addClass( this.options.cls_names.image).attr( {"src" : this.options.images[i] });
			var curSpan     = $('<span />').text(this.options.overlays[i]);
			var curTitle    = $('<span />').addClass( this.options.cls_names.overlay).append(curSpan);
			curWrapper.append(curImg);
			curWrapper.append(curTitle);
			wrapper.append(curWrapper);
		}

		$(this.element).append(wrapper);
		return this;
	},
	
	_hideAll : function () {
		var self = $(this.element);
		self.find('.' + this.options.cls_names.frame).hide();
		return this;
	},

	_index : function(i){
		var total = this.nTotalFrames;

		// no images ...
		if (total < 1) {
			this._throw("-1");
			return 0;
		}
		

		i = parseInt(i);

		var index = i;
	
		
		if( this.bCycle) {
			index = i - Math.floor(i/total) * total; 
		} else {
			if (i < 0) {
				index = 0;
			}

			if (i >= total){
				index = total - 1;
			}
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

	destroy : function(){
		// element
		this.element
            .removeClass(this.name );
            .remove('.' + this.options.cls_names.frames);
        this.options = {};
	}

});