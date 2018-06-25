var interval;
var settings;
var app = {
    macAddress: "00:21:13:00:D8:A2",  // get your mac address from bluetoothSerial.list
    chars: "",

/*
    Application constructor
 */
    initialize: function() {
        this.bindEvents();
        console.log("Starting SimpleSerial app");
    },
/*
    bind any events that are required on startup to listeners:
*/
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        
        connectButton.addEventListener('touchstart', app.tapHighlight, false);
        openLock.addEventListener('touchstart', app.tapHighlight, false);

        connectButton.addEventListener('touchend', app.manageConnection, false);
        openLock.addEventListener('touchend', app.sendToDevice, false);
    },

/*
    this runs when the device is ready for user interaction:
*/
    onDeviceReady: function() {
        //app.fileWriter();

        app.getSettings();
    },
    connectionProcedures:function(){
        // check to see if Bluetooth is turned on.
        // this function is called only
        //if isEnabled(), below, returns success:
        var listPorts = function() {
            // list the available BT ports:
            bluetoothSerial.list(
                function(results) {
                    app.display(JSON.stringify(results));
                },
                function(error) {
                    app.display(JSON.stringify(error));
                }
            );
        }

        // if isEnabled returns failure, this function is called:
        var notEnabled = function() {
            app.display("Bluetooth is not enabled.")
        }

         // check if Bluetooth is on:
        bluetoothSerial.isEnabled(
            listPorts,
            notEnabled
        );
    },
/*
    Connects if not connected, and disconnects if connected:
*/
    manageConnection: function() {

        // connect() will get called only if isConnected() (below)
        // returns failure. In other words, if not connected, then connect:
        var connect = function () {
            // if not connected, do this:
            // clear the screen and display an attempt to connect
            app.clear();
            app.display("Attempting to connect. " +
                "Make sure the serial port is open on the target device.");
            // attempt to connect:
            bluetoothSerial.connect(
                app.macAddress,  // device to connect to
                app.openPort,    // start listening if you succeed
                app.showError    // show the error if you fail
            );
        };

        // disconnect() will get called only if isConnected() (below)
        // returns success  In other words, if  connected, then disconnect:
        var disconnect = function () {
            app.display("attempting to disconnect");
            // if connected, do this:
            bluetoothSerial.disconnect(
                app.closePort,     // stop listening to the port
                app.showError      // show the error if you fail
            );
        };

        // here's the real action of the manageConnection function:
        bluetoothSerial.isConnected(disconnect, connect);
        app.tapHighlightOff();
    },
    tapHighlight: function(e) {
        var el = e.target;
        el.classList.add("beat-tapped");
        console.log('el',el); 
    },
    tapHighlightOff: function(e) {
        var x = document.getElementsByClassName("beat-tapped");
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("beat-tapped");
        }
    },
/*
    subscribes to a Bluetooth serial listener for newline
    and changes the button:
*/
    openPort: function() {
        document.getElementById("lock-connected").style.display = "block";
        // if you get a good Bluetooth serial connection:
        app.clear();
        app.display("Connected to: " + app.macAddress);

        
        //fi
        //app.speak("Yhteys muodostettu");
        //es
        app.speak("Conectado");
        //fi
        //app.speak("Connected");

        // change the button's name:
        connectButton.innerHTML = "Disconnect";
        connectButton.classList.remove("beat-offline");
        connectButton.classList.add("beat-online");
        // set up a listener to listen for newlines
        // and display any new data that's come in since
        // the last newline:
        bluetoothSerial.subscribe('\n', function (data) {
            app.clear();
            app.display(data);
        });
    },

    fileWriter:function(){
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {

            console.log('file system open: ' + fs.name);
            fs.root.getFile("options.json", { create: true, exclusive: false }, function (fileEntry) {

                console.log("fileEntry is file? " + fileEntry.isFile.toString());

                var settings = {
                    lang:"es-ES",
                    sounds:true
                }
                var dataObj = new Blob([JSON.stringify(settings)], { type: 'text/plain' });
                app.writeFile(fileEntry, dataObj);

            }, app.wroteToFile);

        }, app.errorCallback);
    },
    writeFile:function(fileEntry, dataObj) {
        // Create a FileWriter object for our FileEntry (log.txt).
        fileEntry.createWriter(function (fileWriter) {

            fileWriter.onwriteend = function() {
                console.log("Successful file write...");
                app.readFile(fileEntry);
            };

            fileWriter.onerror = function (e) {
                console.log("Failed file write: " + e.toString());
            };

            // If data object is not passed in,
            // create a new Blob instead.
            if (!dataObj) {
                dataObj = new Blob(['some file data','mopo'], { type: 'text/plain' });
            }

            fileWriter.write(dataObj);
        });
    },
    readFile:function(fileEntry) {

        fileEntry.file(function (file) {
            var reader = new FileReader();

            reader.onloadend = function() {
                console.log("Successful file read: " + this.result);
                //displayFileData(fileEntry.fullPath + ": " + this.result);
                //document.getElementById("profile-picture").src = this.result;
            };

            reader.readAsText(file);

        }, app.errorCallback);
    },
    wroteToFile:function(){
        console.log('Loading...'); 
    },
    getSettings:function(){
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
            fs.root.getFile("options.json", { create: true, exclusive: false }, function (fileEntry) {
                
                fileEntry.file(function (file) {
                    var reader = new FileReader();

                    reader.onloadend = function() {
                        console.log("Successful file read: " + this.result);
                        //displayFileData(fileEntry.fullPath + ": " + this.result);
                        document.getElementById("message").innerHTML = "Settings fetched!";
                        settings = JSON.parse(this.result);
                        console.log('Settings fetched', this.result);
                        app.connectionProcedures();
                    };

                    reader.readAsText(file);

                }, app.errorCallback);

            }, app.wroteToFile);
        });
    },

/*
    unsubscribes from any Bluetooth serial listener and changes the button:
*/
    closePort: function() {
        document.getElementById("lock-connected").style.display = "none";
        // if you get a good Bluetooth serial connection:
        app.display("Disconnected from: " + app.macAddress);

        
        //fi
        //app.speak("Yhteys katkaistu");
        //es
        app.speak("Desconectado");
        //fi
        //app.speak("Disconnected");

        // change the button's name:
        connectButton.innerHTML = "Connect";
        connectButton.classList.remove("beat-online");
        connectButton.classList.add("beat-offline");
        // unsubscribe from listening:
        bluetoothSerial.unsubscribe(
                function (data) {
                    app.display(data);
                },
                app.showError
        );
    },
/*
    appends @error to the message div:
*/
    showError: function(error) {
        app.display(error);
    },

/*
    appends @message to the message div:
*/
    display: function(message) {
        var display = document.getElementById("message"), // the message div
            lineBreak = document.createElement("br"),     // a line break
            label = document.createTextNode(message);     // create the label

        display.appendChild(lineBreak);          // add a line break
        display.appendChild(label);              // add the message node
    },
/*
    clears the message div:
*/
    clear: function() {
        var display = document.getElementById("message");
        display.innerHTML = "";
    },

    speak: function(text){
        var speak = new SpeechSynthesisUtterance();
        speak.voiceURI = 'native';
        speak.volume = 1; // 0 to 1
        //speak.rate = 0.4; // 0.1 to 10
        speak.rate = 1; // 0.1 to 10
        speak.pitch = 1; //0 to 2
        speak.text = text;
        //speak.lang = 'en-US';
        //speak.lang = 'fi-FI';
        speak.lang = 'es-ES';
        window.speechSynthesis.speak(speak);
    },

    displayCommunication:function(data){
        console.log('data ',data); 
        var display = document.getElementById("message");
        display.innerHTML = "Data:<br />" + data;
    },
    displayCommunicationError:function(data){
        console.log('data err ',data); 
        var display = document.getElementById("message");
        display.innerHTML = "Error:<br />" + data;        
    },
    sendToDevice:function(){
        //bluetoothSerial.write("1");
        bluetoothSerial.write("905623");

        //start listening
        interval = setInterval(function(){
            bluetoothSerial.subscribe('\n', app.displayCommunication, app.displayCommunicationError);
        },100);

        setTimeout(function(){
            console.log('Interval cleared'); 
            clearInterval(interval);
        },6000);
        app.tapHighlightOff();
    },
    errorCallback:function(err){
        console.log('error ', err); 
    }
};      // end of app
app.initialize();