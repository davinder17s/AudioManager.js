function AudioManager () {
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    this.context = new AudioContext();
    this.source = null;
    this.arrayBuffer = null;
    // status
    this.timer = 0;
    this.duration = 0;
    this.interval = 300;
    this.lastUpdated = Date.now();
    this.isPlaying = false;
    this.isLoading = false;
    this.filters = {};
    // events
    this.onended = null;
    this.onupdated = null;
    this.onapplyfilters = null;
    this.onplay = null;
    this.onstop = null;

    // initialize
    this.runWatcher();
}
AudioManager.prototype = {
    getSource: function(){
        var src = this.context.createBufferSource();
        src.buffer = this.arrayBuffer;
        this.source = src;
        return this;
    },
    applyFilters: function(){
        if(typeof this.onapplyfilters == 'function') {
            this.onapplyfilters.apply(this);
        } else {
            this.source.connect(this.context.destination);
            this.source.onended = this.onended;
        }
        return this;
    },
    updater: function(){
        var deltaTime = Date.now() - this.lastUpdated;
        if(this.isPlaying == true) {
            if(this.source && this.source.duration > 0) {
                this.timer += deltaTime;
                if(this.timer >= this.source.duration) {
                    this.timer = 0;
                    this.isPlaying = false;
                }
            }
        }
        if(typeof this.onupdated == 'function') {
            this.onupdated.apply(this, [deltaTime]);
        }
        this.lastUpdated = Date.now();
    },
    runWatcher: function(){
        clearInterval(this.interval);
        this.interval = setInterval(this.updater.bind(this), this.interval);
    },
    play: function(seek){
        try {
            seek = seek || this.timer;
            seek = parseFloat(seek);
            this.getSource().applyFilters().source.start(this.context.currentTime, seek);
            this.isPlaying = true;
            if(typeof this.onplay == 'function') {
                this.onplay.apply(this);
            }
        } catch (e) {
            console.log(e.message);
        }
    },
    stop: function(){
        this.isPlaying = false;
        try{
            this.source.stop();
            if(typeof this.onstop == 'function') {
                this.onstop.apply(this);
            }
        } catch (e) {
            console.log(e.message);
        }
    },
    decodeAudio: function(buffer){
        var self = this;
        self.stop();
        self.isLoading = true;
        return new Promise( function(resolve, reject){
            self.context.decodeAudioData(buffer, function(decoded){
                self.isLoading = false;
                self.arrayBuffer = decoded;
                self.timer = 0;
                if(typeof resolve == 'function') {
                    resolve.apply(self);
                }
            });
        });
    }
};