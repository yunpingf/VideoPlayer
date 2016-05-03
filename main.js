$(function () {
	var player = new MyPlayer("player");
	player.setUp("/uploads/charlie-brown.jpg",
   		"http://192.168.1.4:1935/vod/smil:",
   		"bigbuckbunny.smil",
   		"/vtts/points.vtt",
   		640,360);
	player.addExercise([{
		id: 0, 
		question_data: {type:'radio', question:'This is a question',options:['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4']},
		seek_time: 62
	},
	{
		id: 1, 
		question_data: {type:'checkbox', question:'This is a question2',options:['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4']},
		seek_time: 126
	}]);

});
