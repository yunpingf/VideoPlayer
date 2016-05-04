$(function () {
	var player = new MyPlayer("player");
	var track = [
	{
		file: "/vtts/chapters.vtt",
		kind: "chapters"
	},{ 
	    file: "/vtts/captions-cn.vtt", 
	    label: "中文",
	    kind: "captions",
	    "default": true 
	},{ 
	    file: "/vtts/captions-en.vtt", 
	    kind: "captions",
	    label: "English"
	}];

	player.setUp("/uploads/charlie-brown.jpg",
   		"http://192.168.1.4:1935/vod/smil:",
   		"bigbuckbunny.smil",
   		track,
   		640,360);
	player.addExercise({
			62: {
				type: 'radio', 
				question: 'This is a question',
				options: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
				answer: 0  //选项的index
			},
			126: {
				type: 'checkbox', 
				question: 'This is a question2',
				options: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
				answer: [0, 1, 2]
			}
	});

});
