function get_browser_info(){
    var ua=navigator.userAgent,tem,M=ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || []; 
    if(/trident/i.test(M[1])){
        tem=/\brv[ :]+(\d+)/g.exec(ua) || []; 
        return {name:'IE',version:(tem[1]||'')};
        }   
    if(M[1]==='Chrome'){
        tem=ua.match(/\bOPR\/(\d+)/)
        if(tem!=null)   {return {name:'Opera', version:tem[1]};}
        }   
    M=M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if((tem=ua.match(/version\/(\d+)/i))!=null) {M.splice(1,1,tem[1]);}
    return {
    	type: 'browser',
    	os: navigator.platform,
    	browser_name: M[0],
      	browser_version: M[1]
      	//ua
    };
}
var MyPlayer = function (id) {
	this.player = jwplayer(id);
	this.shown = false;
	this.cache = [];
	var cache = this.cache;
	setInterval(function() {
		if (cache.length > 0) {
			cache.push(get_browser_info());
			//console.log(cache);
			cache = [];
		}
	}, 50000);
}

MyPlayer.prototype.getCache = function() {
	return this.cache;
}
MyPlayer.prototype.setUp = function (img, wowza_root, smil_path, track, width, height) {
	var obj = {};
	var playlist = [{
		image: img,
		sources: [{
			file: wowza_root+smil_path+'/jwplayer.smil'
		},{
			file: wowza_root+smil_path+'/playlist.m3u8'
			//http://192.168.1.4:1935/vod/smil:bigbuckbunny.smil/manifest.f4m
		}],
		/*sources:[{
			file: '/videos/sample.mp4'
		}],*/
		tracks: [{
			file: track,
			kind: 'chapters'
		}]
	}];

	obj.playlist = playlist;
	obj.width = width;
	obj.height = height;
	this.player.setup(obj);
	var cache = this.cache;
	var player = this.player;
	player.on('seek', function(e) {
		cache.push({
			type: 'seek',
			from: e.position,
			to: e.offset
		});
	});
	player.on('play', function(e) {
		cache.push({
			type: 'play',
			at: player.getPosition(),
			oldstate: e.oldstate
		});
	});
	player.on('pause', function(e){
		cache.push({
			type: 'pause',
			at: player.getPosition(),
			oldstate: e.oldstate
		});
	});
	
	player.addButton("/icons/fast_forward_white_24x24.png", "Fast Forward", function(){
		player.seek(player.getPosition() + 5);
	}, "fast_forward");
	player.addButton("/icons/fast_rewind_white_24x24.png", "Fast Rewind", function(){
		player.seek(player.getPosition() - 5);
	}, "fast_rewind");
	if (player.getRenderingMode() == "html5") {
		var video = $("video");
	}
}

MyPlayer.prototype.addExercise = function (exercises) {
	var player = this.player;
	player.shown = false;
	player.exerciseDone = {};
	player.currentExercise = -1;
	player.counter = 0;

	var seek_times = Object.keys(exercises);
	for (var i = 0; i < seek_times.length; ++i) {
		player.exerciseDone[seek_times[i]] = false;
	}
	function showExercise(p, seek_time, question_data) {
		p.shown = true;
		p.currentExercise = seek_time;
		p.pause(p.shown);
		var content = $("<div id='content'></div>")
		var question = $.parseHTML(new EJS({url: "templates/exercise.ejs"}).render(question_data));
		content.append(question);

		if (p.getRenderingMode() == "html5"){
			var theBody = $("#"+player.id);
		} else {
			var theBody = $("#"+player.id+"_wrapper");
		}

		theBody.append(content);
		$("#submit").on('click', function(){
			p.shown = false;
			p.currentExercise = -1;
			p.play(!p.shown);
			$("#content").remove();
			p.exerciseDone[seek_time] = true;
		});
	};
	function hideExercies(p) {
		p.shown = false;
		p.currentExercise = -1;
		p.play(!p.shown);
		$("#content").remove();
	}
	player.on('time', function(e) {
		var time = Math.floor(e.position);
		if (time > player.counter) {
			player.counter += 1;
			if (seek_times.includes(player.counter.toString())) {
				var question_data = exercises[player.counter];
				showExercise(player, player.counter, question_data);
			}
		}
	});

	player.on('seek', function(e) {
		var time = e.offset;
		player.counter = Math.floor(time);
		if (!player.shown) {
			for (var i = 0; i < seek_times.length; ++i) {
				console.log(player.exerciseDone[seek_times[i]]);
				console.log(seek_times[i]+" "+time);
				if ((player.exerciseDone[seek_times[i]]&&seek_times[i] == time) ||
						(!player.exerciseDone[seek_times[i]]&&seek_times[i] <= time)) {
					var question_data = exercises[seek_times[i]];
					showExercise(player, seek_times[i], question_data);
					break;
				}
			}
		}
		else if(time < player.currentExercise){
			hideExercies(player);
		}

	});

	player.on('play', function(e) {
		if (player.shown) {
			player.play(!player.shown);
		}
	});
};