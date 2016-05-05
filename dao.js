var DAO = function() {
	this.chapters = [];
	this.captions = [];
}

DAO.prototype.getChapters = function(file) {
	var dao = this;
	if (this.chapters.length == 0) {
		var r = new XMLHttpRequest();
		r.onreadystatechange = function() {
			if (r.readyState == 4 && r.status == 200) {
				var text = r.responseText.split("\n\n");
				text.shift();
				console.log(text);
				for (var i = 0; i < text.length; ++i) {

				}
				return this.chapters;
			}
		};
		r.open('GET',file, true);
  		r.send();
	}
	else {
		return this.chapters;
	}
}

DAO.prototype.getCaptions = function(file, index) {
	var dao = this;
	if (dao.captions[index] == null) {
		var r = new XMLHttpRequest();
		r.onreadystatechange = function() {
			if (r.readyState == 4 && r.status == 200) {
				var texts = r.responseText.split("\n\n");
				texts.shift();
				dao.captions[index] = [];
				for (var i = 0; i < texts.length; ++i) {
					dao.captions[index].push(dao.parseVTT(texts[i]));
				}
				console.log(dao.captions[index]);
				return dao.captions[index];
			}
		};
		r.open('GET',file, true);
  		r.send();
	}
	else {
		return dao.captions[index];
	}
};

DAO.prototype.parseVTT = function(text){
	var dao = this;
	var lines = text.split("\n");
	var time = lines.length == 2 ? lines[0].split(" "):lines[1].split(" ");
	var beginTime = dao.toSeconds(time[0]);
	var endTime = dao.toSeconds(time[2]);
	var caption = lines[lines.length - 1];
	return {
		"beginTime": beginTime,
		"endTime": endTime,
		"caption": caption
	};
};

DAO.prototype.toSeconds = function(s) {
	var nums = s.split(":");
	var res = 0;
	res += parseInt(nums[0]) * 3600;
	res += parseInt(nums[1]) * 60;
	res += parseFloat(nums[2]);
	return res;
};