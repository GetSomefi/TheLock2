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

        connectButton.addEventListener('touchend', app.manageConnection, false);
        openLock.addEventListener('touchend', app.sendToDevice, false);

        var pageChangeEl = document.getElementsByClassName("page-change");
        for (var i1 = 0; i1 < pageChangeEl.length; i1++) {
            pageChangeEl[i1].addEventListener('touchend', app.pageChange, false);
        }

        //to get tap effect add tapable class
        var tapableEl = document.getElementsByClassName("tapable");
        for (var i2 = 0; i2 < tapableEl.length; i2++) {
            tapableEl[i2].addEventListener('touchstart', app.tapHighlight, false);
            tapableEl[i2].addEventListener('touchend', app.tapHighlightOff, false);
        }

        //back button routes to main
        var backEl = document.getElementsByClassName("back");
        for (var i3 = 0; i3 < tapableEl.length; i3++) {
            if( backEl[i3] ){
                backEl[i3].addEventListener('touchstart', app.backToMain, false);
            }
        }

    },

/*
    this runs when the device is ready for user interaction:
*/
    onDeviceReady: function() {
        /*
        //reset settings with these
        var settings = {
            lang:"es-ES",
            sounds:1,
            key:905623
        }
        app.fileWriter(settings);
        */

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

            //fi
            //app.speak("Bluetooth ei ole käytössä.");
            //es
            //app.speak("Bluetooth no está habilitado.");
            //fi
            app.speak("Bluetooth is not enabled.");

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
        app.tapHighlightOff();
        var el;

        if(e.target.dataset.targetpage){
            el = e.target;
            el.classList.add("beat-tapped");

            //console.log('el',el); 
        }else if(e.target.offsetParent.dataset.targetpage){
            el = e.target.offsetParent;
            el.classList.add("beat-tapped");

            //console.log('el',el); 
        }else{
            el = e.target;
            el.classList.add("beat-tapped");

            //console.log('el',el); 
        }
    },
    tapHighlightOff: function() {
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
        //app.speak("Conectado");
        //fi
        app.speak("Connected");

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

    fileWriter:function(settings){
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {

            console.log('file system open: ' + fs.name);
            fs.root.getFile("options.json", { create: true, exclusive: false }, function (fileEntry) {

                console.log("fileEntry is file? " + fileEntry.isFile.toString());

                var dataObj = new Blob([JSON.stringify(settings)], { type: 'text/plain' });
                app.writeFile(fileEntry, dataObj, settings);

            }, app.wroteToFile);

        }, app.errorCallback);
    },
    writeFile:function(fileEntry, dataObj, asObj) {
        // Create a FileWriter object for our FileEntry (log.txt).
        fileEntry.createWriter(function (fileWriter) {

            fileWriter.onwriteend = function() {
                console.log("Successful file write...");
                //app.readFile(fileEntry);
                settings = asObj;
                app.createSettings(JSON.stringify(asObj));
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
                        
                        //store to global var
                        settings = JSON.parse(this.result);

                        app.createSettings(this.result);

                        app.connectionProcedures();
                    };

                    reader.readAsText(file);

                }, app.errorCallback);

            }, app.wroteToFile);
        });
    },
    createSettings:function(settings){
        console.log('Settings fetched', settings);
        document.getElementById('settings-list').innerHTML = "list:<br />" + settings + "<br />----<br />";
        var settings = JSON.parse(settings);

        for(key in settings){
            //create button
            var btn = document.createElement("button");
            btn.dataset.setting = key;
            btn.dataset.settingValue = settings[key];
            btn.classList.add('setting-button');
            
            //add icon and label
            var icon = "<img src='./img/"+key+".png' alt='"+key+"' />";
            icon += "<span>" + settings[key] + "</span>";            
            btn.innerHTML = icon;

            //touch event
            btn.addEventListener('touchend', function(e){
                app.changeSetting(e,settings);
            }, false);
            
            //add to setting list
            document.getElementById("settings-list").appendChild(btn);
        }
    },
    changeSetting: function(e,settings){
        //Prevent capturing down to child elements.
        //e.stopPropagation();

        console.log('e', e);
        var el = e.target;
        var setting;
        setting = el.parentElement.dataset.setting;
        var settingValue;
        settingValue = el.parentElement.dataset.settingValue;

        console.log( setting, settingValue );

        if(setting == "sounds"){
            if(settingValue == 1){
                console.log('sounds are on... muting');
                settings[setting] = 0;
            }else{
                console.log('sounds are off... unmuting');
                settings[setting] = 1;
            }
            var writeFile = app.fileWriter(settings);
        }

        if(setting == "lang"){
            if(settingValue == "es-ES"){
                console.log('English');
                settings[setting] = "en-EN";
            }else if(settingValue == "en-EN"){
                console.log('Suomi');
                settings[setting] = "fi-FI";
            }else if(settingValue == "fi-FI"){
                console.log('Espana');
                settings[setting] = "es-ES";
            }
            var writeFile = app.fileWriter(settings);
        }

        if(setting == "key"){
            //original 905623
            var msg = "<h2>You are about to change the key of The Lock 2</h2>";
            msg += "<p><b>Note</b> that change of this setting will change the code <b>only</b> in app end!</p>";
            msg += "<p>If you are not sure what you are doing please press Cancel</p>";
            msg += "<div id='new-key-row'></div>";
            msg += "<div id='key-confirmation-row'></div>";
            document.getElementById('pop-message').innerHTML = "<div class='message-inner'>" + msg + "</div>";
            //show popup
            document.getElementById('pop-message').classList.add("show-popup");

            var newKey = document.createElement("input");
            newKey.type = "number"; 
            newKey.id = 'new-key';
            newKey.placeholder = "Set the new key";
            document.getElementById("new-key-row").appendChild(newKey);

            var btn = document.createElement("button");
            btn.id = 'accept-button';
            btn.innerHTML = "Confirm";
            document.getElementById("key-confirmation-row").appendChild(btn);

            var btnCancel = document.createElement("button");
            btnCancel.id = 'cancel-button';
            btnCancel.innerHTML = "Cancel";
            document.getElementById("key-confirmation-row").appendChild(btnCancel);

            //events for popup
            btnCancel.addEventListener('touchend', function(){
                document.getElementById('pop-message').classList.remove("show-popup");
            }, false);

            btn.addEventListener('touchend', function(){
                btn.innerHTML = "Done";
                console.log('newKey.value',newKey.value); 
                settings[setting] = newKey.value;
                var writeFile = app.fileWriter(settings);
                setTimeout(function(){
                    document.getElementById('pop-message').classList.remove("show-popup");
                },1500);
            }, false);

            /*
            document.getElementById('pop-message').classList.add("show-popup");
            setTimeout(function(){
                document.getElementById('pop-message').classList.remove("show-popup");
            },5000);
            */
        }
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
        //app.speak("Desconectado");
        //fi
        app.speak("Disconnected");

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
        //fi
        //app.speak("Virhe");
        //es
        //app.speak("Error");
        //fi
        app.speak("Error");

        app.display(error);
        if( error == "Device connection was lost" ){
            app.popMessage(error);
            app.closePort();
        }
        if( error == "Unable to connect to device" ){
            //fi
            //app.speak("Tarkista, että lukossa on virta päällä ja kantaman sisällä");
            //es
            //app.speak("Verifique que la cerradura esté encendida y dentro del alcance");
            //fi
            app.speak("Please check that the lock is powered on and in range");

            app.popMessage("Please check that the lock is powered on and in range");
        }
    },

    popMessage: function(msg){
        document.getElementById('pop-message').innerHTML = "<div class='message-inner'>" + msg + "</div>";
        document.getElementById('pop-message').classList.add("show-popup");
        setTimeout(function(){
            document.getElementById('pop-message').classList.remove("show-popup");
        },5000);
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
        
        if(settings.lang == "es-ES"){
            if( text == "Opening" ){
                text = "Apertura";
            }
            if( text == "Connected" ){
                text = "Conectado";
            }
            if( text == "Disconnected" ){
                text = "Desconectado";
            }
            if( text == "Bluetooth is not enabled." ){
                text = "Bluetooth no está habilitado.";
            }         
            if( text == "Please check that the lock is powered on and in range" ){
                text = "Verifique que la cerradura este encendida y dentro del alcance";
            }
        } else if(settings.lang == "fi-FI"){
            if( text == "Opening" ){
                text = "Avataan";
            }
            if( text == "Connected" ){
                text = "Yhteys muodostettu";
            }
            if( text == "Disconnected" ){
                text = "Yhteys katkaistu";
            }
            if( text == "Bluetooth is not enabled." ){
                text = "Bluetooth ei ole käytössä.";
            }
            if( text == "Error" ){
                text = "Virhe";
            }
            if( text == "Please check that the lock is powered on and in range" ){
                text = "Tarkista, että lukossa on virta päällä ja kantaman sisällä";
            }
        }

        var speak = new SpeechSynthesisUtterance();
        speak.voiceURI = 'native';
        speak.volume = 1; // 0 to 1
        //speak.rate = 0.4; // 0.1 to 10
        speak.rate = 1; // 0.1 to 10
        speak.pitch = 1; //0 to 2
        speak.text = text;
        //speak.lang = 'en-US';
        //speak.lang = 'fi-FI';
        //speak.lang = 'es-ES';
        speak.lang = settings.lang;

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
        app.speak("Opening");

        //bluetoothSerial.write("1");
        //bluetoothSerial.write("905623");
        console.log('using code ', settings.key); 
        bluetoothSerial.write(settings.key);

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
    },
    //works with parent that has child
    pageChange:function(e){
        var page;
        if(e.target.dataset.targetpage){
            page = e.target.dataset.targetpage;
        }else if(e.target.offsetParent.dataset.targetpage){
            page = e.target.offsetParent.dataset.targetpage;
        }else{
            page = "404";
        }

        //clear
        var clearEl = document.getElementsByClassName("page");
        for (var i = 0; i < clearEl.length; i++) {
            clearEl[i].classList.remove("active");
        }
        document.getElementById('page-'+page).classList.add("active");
        console.log('target',page,e); 
    },
    backToMain:function(){
        var clearEl = document.getElementsByClassName("page");
        for (var i = 0; i < clearEl.length; i++) {
            clearEl[i].classList.remove("active");
        }
        document.getElementById('page-main').classList.add("active");        
    }
};      // end of app
app.initialize();