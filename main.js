$(function () {
	var player = new MyPlayer("player");
	player.setUp("/uploads/charlie-brown.jpg",
   		"http://192.168.1.4:1935/vod/smil:",
   		"bigbuckbunny.smil",
   		"/vtts/points.vtt",
   		640,360);
	player.addExercise([{
		template_path: "templates/exercise.ejs",
		question_path: "",
		seek_time: 62
	},
	{
		template_path: "templates/exercise2.ejs",
		question_path: "",
		seek_time: 126
	}]);

});
