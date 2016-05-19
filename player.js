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
		tracks: track
	}];

	obj.playlist = playlist;
	obj.width = width;
	obj.height = height;
	this.player.setup(obj);
	var cache = this.cache;
	var player = this.player;
	var chapters = [], captions = [], captionLists = [];
	var searchinput = $("#searchinput");
	var matches = [];

	player.on('seek', function(e) {
		cache.push({
			type: 'seek',
			from: e.position,
			to: e.offset
		});
		var index = player.getCurrentCaptions();
		var pos = e.offset;
		highlightCaption(index, pos);
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

	player.on('time', function(e){
		var pos = e.position;
		var index = player.getCurrentCaptions();
		if (index != 0)
			highlightCaption(index, pos);
	});

	function buildCaptions(index, label) {
		$("#captions").empty();
		if (index != 0) {
			var caption = 
				$.parseHTML(new EJS({url: "templates/caption.ejs"}).render({index:index, label:label,"captions":captions[index]}));
			$("#captions").append(caption);
			for (var i = 0; i < captions[index].length; ++i) {
				$($(".caption")[i]).on('click', (function(val){
					return function(e){
						var beginTime = captions[index][val].beginTime;
						player.seek(beginTime);
					};
				})(i));
				
			};
			$(".caption:not(.captionHighlight)").on('mouseenter', function(e){
				$(e.target).addClass("captionHover");
			});
			$(".caption:not(.captionHighlight)").on('mouseleave', function(e){
				$(e.target).removeClass("captionHover");
			});
		}
	};

	function toSeconds(s) {
		var nums = s.split(":");
		var res = 0;
		res += parseInt(nums[0]) * 3600;
		res += parseInt(nums[1]) * 60;
		res += parseFloat(nums[2]);
		return res;
	};

	function parseVTT(text) {
		var lines = text.split("\n");
		var time = null;
		var i = 0;
		if (lines[0].indexOf("-->") == -1){
			time = lines[1].split(" ");
			i = 2;
		}
		else {
			time = lines[0].split(" ");
			i = 1;
		}
		var beginTime = toSeconds(time[0]);
		var endTime = toSeconds(time[2]);
		var caption = "";
		for (; i < lines.length; ++i)
			caption += lines[i]+" ";
		caption = caption.substr(0, caption.length-1);
		return {
			"beginTime": beginTime,
			"endTime": endTime,
			"caption": caption
		};
	};

	function loadCaptions(text, file, index) {
		if (captions[index] == null) {
			var texts = text.split("\n\n");
			texts.shift();
			console.log(texts);
			captions[index] = [];
			for (var i = 0; i < texts.length; ++i) {
				captions[index].push(parseVTT(texts[i]));
			}
			return captions[index];
		}
		else {
			return captions[index];
		}
	};

	function highlightCaption(index, pos) {
		var caption = captions[index];
		for (var i = 0; i < caption.length; ++i) {
			var beginTime = caption[i].beginTime, endTime = caption[i].endTime;
			$($(".caption")[i]).removeClass("captionHighlight");
			if (beginTime <= pos && endTime > pos) {
				$($(".caption")[i]).addClass("captionHighlight");
				break;
			}
		}
	}

	player.on('ready', function(e){
		
	});

	player.on('captionsList', function(e){
		captionLists = player.getCaptionsList();
		console.log(captionLists);
		var index = player.getCurrentCaptions();
		if (index != 0) {
			var currentCaption = captionLists[index];//id(file path), label
			$.ajax({
				url: currentCaption.id
			}).done(function(text){
				loadCaptions(text, currentCaption.id, index);
				buildCaptions(index, currentCaption.label);
			});
		}
	});

	player.on('captionsChanged', function(e) {
		var index = player.getCurrentCaptions();
		var currentCaption = captionLists[index];
		if (index != 0 && captions[index] == null) {
			$.ajax({
				url: currentCaption.id
			}).done(function(text){
				loadCaptions(text, currentCaption.id, index);
				buildCaptions(index, currentCaption.label);
			});
		}
		else {
			buildCaptions(index, currentCaption.label);
		};
	});

	function buildSearchItem(searchword){
		var item = $.parseHTML(new EJS({url: "templates/searchItem.ejs"}).render({"val":searchword}));
		var searchBox = $("#searchbox");
		$("#searchinput").before(item);
		$(item).children(".close").on('click', function(e){
			$(item).remove();
			unbindKeywords(searchword);
		});
	};

	function hightlightKeywords(searchword) {
		var index = player.getCurrentCaptions();
		if (index != 0){
			var caption = captions[index];
			for (var i = 0; i < caption.length; ++i) {
				var elem = $($("#captions").children().children()[i]);
				var text = elem.html();
				var startIndex = 0,k = 0, len = searchword.length;
				while ((k = text.indexOf(searchword, startIndex)) != -1) {
					text = text.substr(0, k) + "<em>" + 
					text.substr(k, len) + "</em>" +
					text.substr(k + len);
					elem.html(text);
					startIndex = k + len + 9;
				}
			}
		}
	};

	function unbindKeywords(searchword) {
		var index = player.getCurrentCaptions();
		if (index != 0){
			searchword = "<em>" + searchword + "</em>";
			var caption = captions[index];
			for (var i = 0; i < caption.length; ++i) {
				var elem = $($("#captions").children().children()[i]);
				var text = elem.html();
				var startIndex = 0,k = 0, len = searchword.length;
				while ((k = text.indexOf(searchword, startIndex)) != -1) {
					text = text.substr(0, k) + 
					text.substr(k+4, len-9) + 
					text.substr(k + len);
					elem.html(text);
					startIndex = k+len-9;
				}
			}
		}
	};

	searchinput.on('keydown', function(e){
		if (e.keyCode == 13) {//enter
			var searchword = this.value.toLowerCase();
			if (searchword.length > 0){
				buildSearchItem(searchword);
				hightlightKeywords(searchword);
			}
			setTimeout(function(){
				$("#searchinput").val("");
			}, 10);
		}
		/*else if (e.keyCode == 32){//space
			var searchword = this.value.toLowerCase().trim();
			buildSearchItem(searchword);
			setTimeout(function(){
				$("#searchinput").val("");
			}, 10);
		}*/
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
			$("#content").remove();
			p.exerciseDone[seek_time] = true;
			p.play();
			p.seek(parseInt(seek_time)+1);
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
			player.pause();
		}
	});
};