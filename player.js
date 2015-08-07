// https://css-tricks.com/text-blocks-over-image/
//http://code-tricks.com/simple-css-drop-down-menu/
$.widget("nplab.player", {
    options : {
        
        scale : 1,
        fps  : 30,
        
        cls_names : {
            player       : "nplab_player", 
            controls     : "nplab_controls",
            view         : "nplab_view",
            controlbar   : "nplab_controlbar" 
        }
                                                                                        
    },
    
    pause : function() {
        window.clearInterval(this.intervalId);
    },
    
    play : function () {
    }, 
    
    onSeekTo : function (event, data) {
        
    },
    
    gotoFrame : function(index) {
        this.getMov().gotoFrame(index);
        this.getProgressbar().val(index);
    }, 
    
    gotoNextFrame : function() {
        var mov = this.getMov();
        mov.gotoNextFrame();
        
        var index = mov.getCurFrameIndex();
        this.getProgressbar().val(index);
    },
    
    getDelay : function() {
        return 1000.0 / this.fps;
    },
    
    _onFrameChange : function(event, index){
        this.getProgressbar().val(index);
    }
    
    onDropFiles : function (files) {
        var  images 	= new Array( files.length );
        var  overlays 	= new Array( files.length );
	    var  total      = 0;


  	    for (var i = 0; i < files.length; i++) {
  		    var file = files[i];
   
		    // Only pics
		    if(!file.type.match('image'))
			    continue;
        
            var picReader = new FileReader();
            picReader.onload = ( function(curFile, index) {
        	    return function(event) {
        		    var picFile = event.target;

        		    images[index] = picFile.result;
                    overlays[index] = index + ":" + curFile.name ;
				    total = total + 1;
                    
                    // file loaded
				    if (total == files.length ){
                       this._updateMov(images, overlays);
				    }
        	    };
      	    })(file, i);
        }

    
    },

    _create : function() {
        
        var self = this.element;
        
        // drag and drop
        // forbit the document to response to the drap and drop event 
        $(document).on('dragenter', function (e)  {
            e.stopPropagation();
            e.preventDefault();
        });

        $(document).on('dragover', function (e) {
              e.stopPropagation();
              e.preventDefault();
          //obj.css('border', '2px dotted #0B85A1');
        });

        $(document).on('drop', function (e) {
            e.stopPropagation();
            e.preventDefault();
        });
        
        // make the view response to the drop action
        this.view.on('drop', function (e) {
    	    // print("ondrop")
     	    $(this).css('border', '2px dotted #0B85A1');
     	    e.preventDefault();
     	    var files = e.originalEvent.dataTransfer.files;
 
     	    //We need to send dropped files to Server
     	    this.onDropFiles(files);
	    });
    },
    
    _createControls : function () {
        
       
        var player = this;
		this.controls =  $('<div />').addClass(this.options.cls_names.controls);

		var progressbar = 	 $('<div />').addClass(this.options.cls_names.controlbar);
		progressbar.html('<input type ="range" class="progress" min=0 max=30 step=1 onchange="">')
		
        // create  
		var toolbar  = 	 $('<div />').addClass(this.options.cls_names.controlbar);
      
        var btnPrev = $('<div class="btn prev"> </div>').click(function(){
            player.gotoPrev(); 
        });
        
        var btnFirst = $('<div class="btn first"> </div>').click(function(){
            player.gotoFirst(); 
        });
        
        var btnNext = $('<div class="btn next"> </div>').click(function(){
            player.gotoNext(); 
        });
        
        var btnLast = $('<div class="btn last"> </div>').click(function(){
            player.gotoLast(); 
        });
        
        var btnPlay = $('<div class="btn play" status="play"> </div>').click( function(){
            var el = $(this);
            if (el.attr("status") == "play"){
                // change to the other status
                el.attr("status", "pause");
                player.play();
            } else {      
                el.attr("status", "play");
                player.stop();
            }
        });
        
        var btnPlayOrder =  $('<div class="btn playorder"> </div>').click(function(){
            var el = $(this);         
            player.getMov().option( {"bCycle" : el.hasClass("repeat")} );
            el.toggleClass("repeat");
   
        });
        
				'<div class="btn scale">
				    <div class="scaleslider"> <input type="range" min=0.25 max=8 step=0.25>  </div>'
        var btnScale =  $('<div class="btn scale"> </div>').click(function(){
            var el = $(this);
            
        });

        toolbar.append([btnPlayOrder, btnFirst, btnPrev, btnPlay, btnNext, btnLast, btnScale]); 
        
	

		this.controls.append(progressbar);
		this.controls.append(toolbar);
        
        
	};
    _updateMov : function (images, overlays){
        // destroy the old movie plugin;
        this.view.movie("destroy");
        
        this.view.movie({"images" : images, "overlays" : overlays});
        var mov = this.view.data("movie");
        
        mov.setScale (this.options.scale);
        mov.showOverlays(this.options.overlay);
        
        //bind event
        mov.bind("movieupdate", this._onFrameChange);
        return this;
    },
    
    destroy : function() {
    }
});
