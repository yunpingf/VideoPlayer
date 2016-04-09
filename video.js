var videoElement = document.querySelector("video");
var textTracks = videoElement.textTracks; // one for each track element
var textTrack = textTracks[0]; // corresponds to the first track element
/*var kind = textTrack.kind // e.g. "subtitles"
var mode = textTrack.mode // e.g. "disabled", hidden" or "showing"

var cues = textTrack.cues;
var cue = cues[0]; // corresponds to the first cue in a track src file
var cueId = cue.id // cue.id corresponds to the cue id set in the WebVTT file
var cueText = cue.text; // 

var trackElements = document.querySelectorAll("track");
// for each track element
for (var i = 0; i < trackElements.length; i++) {
	trackElements[i].addEventListener("load", function() {
	    var textTrack = this.track; // gotcha: "this" is an HTMLTrackElement, not a TextTrack object
	    var isSubtitles = textTrack.kind === "subtitles"; // for example...
	    // for each cue
	    for (var j = 0; j < textTrack.cues.length; ++j) {
	      var cue = textTrack.cues[j];
	      // do something
	    }
	})
}*/

textTrack.oncuechange = function (){
  // "this" is a textTrack
  var cue = this.activeCues[0]; // assuming there is only one active cue
  //var obj = JSON.parse(cue.text);
  //console.log(cue);
  alert("!!!");
}