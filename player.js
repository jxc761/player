(function($) {
	$.widget("nplab.player", {
		
		options : {
			
			// change 
			fps     	: 30,
			brepeat  	: false , // 0: noraml, 1 : repeat,
			bloop       : false ,


			cls_names : {
				player       : "nplab_player",       
				view         : "nplab_view",
				controls     : "nplab_controls",
				controlbar   : "nplab_controlbar",
				loading      : "nplab_loading",
			},


			// internal states 
			bstopping   : true , // 0  
			bloaded  	: false , 
			bbackward   : false ,
			intervalId  : null  , 

			// initialized in _creates
			controls : {
				elem  : null, // controls root

				first : null,
				prev  : null,
				next  : null,
				last  : null,
				play  : null,

				progressbar : null,
				scale     	: null,
				fps       	: null,
				showinfo  	: null,
				showtitle 	: null,


				loop 		: null,
				repeat 		: null,

			},

			view : {
				elem : null, 
				mov : null, 
			},

			files : [],

		},

		_create : function() {
	
			this.element.addClass(this.options.cls_names.player);
	
			this._createView();

			this._createControls();

			this._bind();
			return this;
		},
		
		
		
		
		_createView : function() {
			var player = this;
		
			var view = $('<div />').addClass(this.options.cls_names.view).attr({"status" : 0});

			// initialize with empty 
			view.movie({
				"images" : [], 
				"overlays" : [],

			});

			this.element.append(view);
			this.options.view.elem = view;
			this.options.view.mov = view.data("movie");


			
			// forbit the document to response to the drap and drop event 
			$(document).on('dragenter', function(e){
				e.stopPropagation();
				e.preventDefault();
			});
	
			$(document).on('dragover', function (e) {
				e.stopPropagation();
				e.preventDefault();
			});
	
			$(document).on('drop', function (e) {
				e.stopPropagation();
				e.preventDefault();
			});

			//console.log(this);

			
			this.options.view.elem.on('drop', function (e) {
				// stopping and not onloadding
				console.log("dropping :" + player.options);
				if ( player.options.bstopping && $(this).attr("status") != "1" )  {
					player.onDropFiles(e.originalEvent.dataTransfer.files);
				}
				e.preventDefault(); 
			});

			
			return this;
		},

	
		onDropFiles  : function (files) {
		
			// load files
			this.options.view.elem.attr("status", 1); // set staus to loading


			// clear current frames 
	   		this.options.view.mov.setContent([], []);
	   		this.options.files = [];


	   		// filter out no-image
	   		for (var i = 0; i < files.length ; i++){
	   			var file = files[i];
	   			if( file.type.match('image') ){
	   				this.options.files.push(file)
	   			}
	   		}

	   		
	   		// load images and create mov
	   		var  images    = new Array( this.options.files.length );
			var  overlays  = new Array( this.options.files.length );
			var  total     = 0;

			
			var player 	= this;

			// console.log(i + ":" + file.name);
			for(var i = 0; i < this.options.files.length; i++ ){
				var file = this.options.files[i];

				console.log(this.options.files[i].name);

				var picReader = new FileReader();
				picReader.onload = ( function(player,curFile, fileIndex) {
					return function(event) {
						var picFile = event.target;
	
						images[fileIndex]   = picFile.result;
						overlays[fileIndex] = curFile.name;                  
						total = total + 1;
	
						// file loaded
						if (total == player.options.files.length){

							player.options.view.mov.setContent(images, overlays);
							player.options.controls.progressbar.attr({ "max" : images.length-1, "min" : 0, "step" : 1});
							player.options.view.elem.attr("status", 2);  // change status loaded 
							player.options.bloaded = true;	
						}
					};
				})(this, file, i);
	
				picReader.readAsDataURL(file);
			}


	   		
		},

		_bind : function(){
			// response to drop
			var player = this;

			this.options.view.mov.option( "change" , function(event, data){
				player.onChangeFrame(data.value);
			});
		},

		onChangeFrame : function(v) {
			this.options.controls.progressbar.val(v);
		},

		_createControls : function () {
			var player = this;
			var mov = this.options.view.mov;

			var controls  =  $('<div />').addClass(this.options.cls_names.controls);
		
			//
			// the main control set 
			//
			// goto the begin
			var btnFirst = $('<div class="btn first"> </div>').click(function(){
				if( player.options.bloaded ) {
					mov.gotoFirstFrame();
				}
			});
		
			// backward
			var btnPrev = $('<div class="btn prev"> </div>').click(function(){
				if( player.options.bloaded && player.options.bstopping ) {
					mov.gotoPrevFrame();
				}
			});

			// 0: play , 1: pause 
			var btnPlay = $('<div class="btn play" status="0"></div>').click( function(){
				
				if( player.options.bloaded ){
					// "this" is the element trigger the event
					if( $(this).attr("status") == 0){
						//do sth
						player.play();
					} else {
						player.stop();
					}
				}

			});
		
			// forward
			var btnNext = $('<div class="btn next"> </div>').click(function(){ 
				if( player.options.bloaded && player.options.bstopping ) {
					mov.gotoNextFrame();
				}
			
			});
		
			// go to end
			var btnLast = $('<div class="btn last"> </div>').click(function(){
				if( player.options.bloaded) {
					mov.gotoLastFrame();
				}
			});
		
		
		
	


        	var btn_repeat =  $('<div class="btn repeat"/>').click(function(){
				$(this).toggleClass("button-active");
				player.options.brepeat = $(this).hasClass("button-active") ;
				
        	});
		
        	var btn_loop =  $('<div class="btn loop" />').click(function(){
        		$(this).toggleClass("button-active");
				player.options.bloop = $(this).hasClass("button-active");
				

        	});
		
			// set fps  
			var setting_fps =  $('<select type="select" class="select fps">' 
				+  '<option value=5> 5</option>' 
				+  '<option value=10> 10 </option>' 
				+  '<option value=15> 15</option>' 
				+  '<option value=24> 24 </option>' 
				+  '<option value=30 selected> 30</option>' 
				+'</select> ').change(function(){ 
					var fps = parseFloat( $(this).find('option:selected').val() );

					player.options.fps = fps;
				
			});
		
			// set scale 
			var setting_scale =  $('<select type="select" class="select scale">' 
				+  '<option value=0.25 > 0.25x </option>' 
				+  '<option value=0.5> 0.5x </option>' 
				+  '<option value=1 selected> 1x </option> '
				+  '<option value=2> 2x </option> ' 
				+  '<option value=4> 4x </option> '
				+  '<option value=8> 8x </option> '
				+  '</select>').change(function(){ 
					var scale = parseFloat( $(this).find('option:selected').val() );

					//console.log(scale);

					mov.setScale(scale);
				
			});
	
			var setting_showInfo = $('<div class="btn showinfo"> </div>').click(function(){
				var info = player._render_info();
				info.dialog({
					"title" :  "Images",
					"modal" :  true, 
				});
			});


		
			var setting_showTitle = $('<div class="btn showtitle"></div>').click(function(){
				if ( player.options.view.elem.attr("status") != "1" ) {
					$(this).toggleClass("button-active");
					mov.showOverlays( $(this).hasClass("button-active") );
				}
					

			});
		
			//progressbar
			var progressbar_wrapper = $('<div />').addClass(this.options.cls_names.controlbar);
			var progressbar =$('<input type="range" class="progressbar" min=0 max=0 step=0 value=0 />').change(function(){
	
				if ( player.options.bloaded ){
					console.log($(this).val() );
					mov.gotoFrame( $(this).val() );
				}
			});

			progressbar_wrapper.append(progressbar);

			controls.append(progressbar_wrapper);
			
			controls.append([btnFirst, btnPrev, btnPlay, btnNext, btnLast]);
			controls.append([btn_repeat, btn_loop, setting_fps, setting_scale,  setting_showTitle, setting_showInfo]);
	

        	this.element.append(controls);
        	
        	this.options.controls = {
				elem  : controls, // controls root

				first : btnFirst,
				prev  : btnPrev,
				next  : btnNext,
				last  : btnLast,
				play  : btnPlay,

				progressbar : progressbar,
				scale     : setting_scale,
				fps       : setting_fps,
				showinfo  : setting_showInfo,
				showtitle : setting_showTitle,


				loop 		: btn_repeat,
				repeat 		: btn_loop,
        	}

        	return this;
    	},
	

		
		play : function() {
			// for debug : 

			if ( ! ( this.options.bstopping && this.options.bloaded && this.options.intervalId == null ) ) {
				console.log("error: the status of calling play is not correct.");
			}

			console.log(this.options.brepeat );
			console.log(this.options.bloop );
			// change status 
			this.options.bstopping = false;
			this.options.bbackward = false;

			
			// if current is at the last frame, go to first frame;
			var mov = this.options.view.mov; 
			if(mov.getCurFrameIndex() == mov.getFramesCount() -1 ) {
				mov.gotoFirstFrame();
			}
		
			// init _playing data 
			this.options.intervalId = window.setInterval(function(player){
				
				// current time
				var curIndex = player.options.view.mov.getCurFrameIndex();
				var lastIndex = player.options.view.mov.getFramesCount() - 1;

				var brepeat   = player.options.brepeat;
				var bloop     = player.options.bloop;

				var mov       = player.options.view.mov; 


				if ( bloop ) {

					if (brepeat) {
						if(curIndex == 0 ) {
							player.options.bbackward = false;
						}

						if (curIndex == lastIndex) {
							player.options.bbackward = true;
						}

						if (player.options.bbackward) {
							mov.gotoPrevFrame();
						} else {
							mov.gotoNextFrame();
						}

					} else {

						if(curIndex == 0 && player.options.bbackward) {
							player.stop();
							return; 
						}


						else if(curIndex == lastIndex) {
							player.options.bbackward = true;
						}


						if (player.options.bbackward) {
							mov.gotoPrevFrame();
						} else {
							mov.gotoNextFrame();
						}
					}



				} else { // not loop

					if ( brepeat && curIndex == lastIndex ) {
	
						mov.gotoFirstFrame();

					} else if( (! brepeat ) && curIndex == lastIndex ){

						player.stop();
						return;

					} else {
						mov.gotoNextFrame();
					}

				} // end else

				
			}, this.getDelay(), this);


			// change the play button
			this.options.controls.play.attr("status", 1);
		
		},
		
		stop : function() {
			// clear interval 
			if ( this.options.intervalId != null ){
				window.clearInterval(this.options.intervalId);
				this.options.intervalId = null;
			}

			// change status 
			this.options.bstopping = true;

			// change the play button
			this.options.controls.play.attr("status", 0);
			
		}, 



		getDelay  : function () {
        	return 1000.0 / this.options.fps;
		},

		_render_info : function() {
			if (this.options.files.length  == 0) {
				return $('<div />').text("No file");
			}

			var ul = $('<ul />').addClass("nplab_info");

			for (var i=0; i < this.options.files.length; i++){
				ul.append('<li class="nplab_filename">' + this.options.files[i].name + '</li>')
			}

			return ul;
		},


		_chunkify : function (t) {
    		var tz = new Array();
    		var x = 0, y = -1, n = 0, i, j;

    		while (i = (j = t.charAt(x++)).charCodeAt(0)) {
      			var m = (i == 46 || (i >=48 && i <= 57));
      			if (m !== n) {
        			tz[++y] = "";
        			n = m;
      			}
      			tz[y] += j;
    		}

    		return tz;
  		},

  		_compare : function (a, b) {
			var aa = chunkify(a.toLowerCase());
			var bb = chunkify(b.toLowerCase());

			for (x = 0; aa[x] && bb[x]; x++) {
				if (aa[x] !== bb[x]) {
					var c = Number(aa[x]), d = Number(bb[x]);
					if (c == aa[x] && d == bb[x]) {
						return c - d;
					} else {
						return (aa[x] > bb[x]) ? 1 : -1;
					}
				}
			}

			return aa.length - bb.length;			
  		},

		_destroy : function() {

		},


	
	});
})(jQuery)