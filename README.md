# AudioManager.js
Simplest WebAudio library

##Properties
---

Property | Default | Possible values | Description
--------|---------|----------|-----------
context | AudioContext | AudioContext | Default AudioContext 
source | null | AudioSourceNode | Decoded audio source node, actual playable, filters applied 
arrayBuffer | null | AudioSourceNode | Decoded arrayBuffer from blob 
timer | 0 | (in seconds from where to start) | value must be less than duration  
duration | length of buffer in seconds | length of buffer in seconds | read only property 
interval | 300 | milliseconds | rate, at which updated event must be fired 
lastUpdated | Date.now() | timestamp |  read only - when the last updated event was fired 
isPlaying | false |  | read only - tells if audio is playing or not 
isLoading | false |  | read only - it goes to true when library is loading/converting arraybuffer to audio data
filters | {} | {} | this is indexed value object, you can store any filter you want here so, you can refer them in updated event 

##Events
---

| Event | Description |
|--|--|
|onended | Called when audio is finished playing |
|onupdated| Called after each interval, helps keeping timer updated |
|onapplyfilters| Called when source is ready and you can attach your filters to it. |
|onplay| Called when it starts playing |
|onstop| Called when stop is fired |

##Usage examples

```html
<input type="file" onchange="decodeIt(this)"/>
```

```javascript
// create new instance
var audio = new AudioManager();

// create a handler
function decodeIt(target) {
    var fr = new FileReader();
    fr.onload = function(e){
        audio.decodeAudio(e.target.result).then(function(){
            audio.play();
        });
    };
    fr.readAsArrayBuffer(target.files[0]);
}

// advanced callbacks
audio.onapplyfilters = function(){
    let analyser = this.context.createAnalyser();
    analyser.connect(this.context.destination);
    analyser.smoothingTimeConstant = 0.5;
    this.source.connect(analyser);

    let gainNode = this.context.createGain();
    gainNode.gain.value = 0;
    this.source.connect(gainNode);

    this.filters['analyser'] = analyser;
    this.filters['gain'] = gainNode;
};
// use it to update user interface
audio.onupdated = function(){
    if(this.isPlaying == true) {
        var array = new Uint8Array(this.filters.analyser.frequencyBinCount);
        this.filters.analyser.getByteFrequencyData(array);
    }
};

// drag and drop way
$('body').on('dragover', function(e){
    e.preventDefault();
});
$('body').on('drop', function(e){
    e.preventDefault();
    var file = e.originalEvent.dataTransfer.files[0];
    var fr = new FileReader();
    fr.onload = function(e){
        audio.decodeAudio(e.target.result).then(function(){
            audio.play();
        });
    };
    fr.readAsArrayBuffer(file);
});
```