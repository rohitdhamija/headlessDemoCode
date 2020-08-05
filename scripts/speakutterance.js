var synth = window.speechSynthesis;

function speakUtterance(utterance){
    console.log("inside speak utterance function");
    if (synth.speaking) {
        console.error('speechSynthesis.speaking');
        return;
    }
    if (utterance!== '') {
    var utterThis = new SpeechSynthesisUtterance(utterance);
    utterThis.onend = function (event) {
        console.log('SpeechSynthesisUtterance.onend');
    }
    utterThis.onerror = function (event) {
        console.error('SpeechSynthesisUtterance.onerror');
    }
  
    utterThis.pitch = 1;
    utterThis.rate = 1;
   
    synth.speak(utterThis);
  }
}