# README

#### This wiki and **all** scripts that will be made by wuseman is licensed under GPL Version 3.

##### This is the first wiki online that will help you to bring the power back from Telia and Sagemcom developers via _telnet_.

##### No intrusion on Telia or Sagemcom's servers has occurred and no damage on hardware has been done. It's all about extremely poor security in the firmware.

##### A notice to all nerds. If you will copy the wiki and steal the real developers work will not make you a hacker.

##### For all lazy people, just use misc/sagemcom-settings.txt for list any setting without getting tired to do it manually all the time. :-)

##### This is the most powerful router I've ever played with. It is also possible to use lxc for almost all distros included in default setup. You can setup your linux container with the lxc- * commands, will add a howto for this later.

![Screenshot](https://nr1.nu/sagem/felia1.jpg)

- Big thanks to [kevdagoat](https://github.com/kevdagoat) who got me on the right track.

#### Below is a preview for how it will look when you have successfully hacked the router.

![Screenshot](https://nr1.nu/sagem/telia-telnet.gif)

Alright, after few weeks with this "most powerful router" from Telia i finally managed to find a way to get root access. For all who does not like this kind of exposing please remember it's not me who adding backdoors to all swedes that using this router(~1 million). This repo have been made for expose Telia and Sagemcom's backdoors **again**.

###### As on earlier versions from Telia they use backdoors without our knowledge for be able to telnet/ssh into our network wich means they can sniff **EVERYTHING** on your network.

![Screenshot](https://nr1.nu/sagem/sagem-backdoor.png)

###### And it's not only Telia that got backdoors on our device, also sagemcom that can use our network and sniff traffic, here is a proof for how to find info about all settings they have configured:

![Screenshot](https://nr1.nu/sagem/sagem-owned2.png)

###### Misc

      $.xmo.setValuesTree("true", "Device/UserInterface/AdvancedMode"); # # ENABLE ADVANCED MODE
      $.xmo.getValuesTree("Device/UserInterface/AdvancedMode");  # Confirm advanced mode has been set

###### Colors

      $.xmo.setValuesTree("#000000", "Device/UserInterface/BackgroundColor")
      $.xmo.setValuesTree("white", "Device/UserInterface/ButtonTextColor")
      $.xmo.setValuesTree("magenta", "Device/UserInterface/ButtonColor")
      $.xmo.setValuesTree("white", "Device/UserInterface/TextColor")

###### Disable upcomming firmware upgrades:

      # Default "https://acs.telia.com:7575/ACS-server/ACS"
      $.xmo.setValuesTree("", "Device/Managers/NetworkData/MultiVlanUrl");
      $.xmo.setValuesTree("",  "Device/Managers/NetworkData/SingleModeUrl");
      $.xmo.setValuesTree("",  "Device/ManagementServer/ConnectionRequestURL");
      $.xmo.setValuesTree(false", "Device/ManagementServer/PeriodicInformEnable");
      $.xmo.setValuesTree("", "Device/ManagementServer/URL");
      $.xmo.getValuesTree("Device/Managers/NetworkData")

###### Set a new hostname/dns

      $.xmo.getValuesTree("Device/DNS/Client/HostName");
      $.xmo.setValuesTree("router", "Device/DNS/Client/HostName");

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

###### Gather info for users

    $.xmo.getValuesTree("Device/UserAccounts/Users");

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

###### Setup dropbear

     mkdir -p /tmp/dropbear
     /usr/bin/dropbearkey -t rsa -f 
     /tmp/dropbear/dropbear_rsa_host_key 2>&- >&-
     /usr/bin/dropbearkey -t dss -f 
     /tmp/dropbear/dropbear_dss_host_key 2>&- >&-
     vim /etc/dropbear/authorized_keys
     chmod 600 authorized_keys

###### LXC - Telia 

     lxc-start -n teliaLxc -F


##### LXC - Any support distro below (will add a howto soon): 

    /usr/share/lxs/userns.conf
    /usr/share/lxs/ubuntu-cloud.userns.conf
    /usr/share/lxs/plamo.common.conf
    /usr/share/lxs/opensuse.userns.conf
    /usr/share/lxs/gentoo.common.conf
    /usr/share/lxs/debian.common.conf
    /usr/share/lxs/centos.userns.conf
    /usr/share/lxs/ubuntu.userns.conf
    /usr/share/lxs/ubuntu-cloud.lucid.conf
    /usr/share/lxs/oracle.userns.conf
    /usr/share/lxs/opensuse.common.conf
    /usr/share/lxs/fedora.userns.conf
    /usr/share/lxs/common.seccomp
    /usr/share/lxs/centos.common.conf
    /usr/share/lxs/ubuntu.lucid.conf
    /usr/share/lxs/ubuntu-cloud.common.conf
    /usr/share/lxs/oracle.common.conf
    /usr/share/lxs/gentoo.userns.conf
    /usr/share/lxs/fedora.common.conf
    /usr/share/lxs/common.conf.d
    /usr/share/lxs/archlinux.userns.conf
    /usr/share/lxs/ubuntu.common.conf
    /usr/share/lxs/plamo.userns.conf
    /usr/share/lxs/openwrt.common.conf
    /usr/share/lxs/gentoo.moresecure.conf
    /usr/share/lxs/debian.userns.conf
    /usr/share/lxs/common.conf
    /usr/share/lxs/archlinux.common.conf


##### General Admin Stuff (Edit after your neeeds)

# USERS (USER/1 = admin)

      $.xmo.getValuesTree("Device/UserAccounts/Users/User[@uid='1']");
      $.xmo.getValuesTree("Device/UserAccounts/Users/User[@uid='1']/Role");
      $.xmo.setValuesTree("SuperUser", "Device/UserAccounts/Users/User[@uid='1']/Role");
      $.xmo.setValuesTree("true", "Device/UserAccounts/Users/User[@uid='1']/CurrentlyRemoteAccess");
      $.xmo.setValuesTree("wuseman@nr1.nu", "Device/UserAccounts/Users/User[@uid='1']/Email");
      $.xmo.setValuesTree("Sweden", "Device/UserAccounts/Users/User[@uid='1']/Country");
      $.xmo.setValuesTree("wuseman", "Device/UserAccounts/Users/User[@uid='1']/Lastname");
      $.xmo.setValuesTree("true", "Device/UserAccounts/Users/User[@uid='1']/OwnPass");
      $.xmo.getValuesTree("Device/UserAccounts/Users/User[@uid='1']/RemoteAccesses/RemoteAccess[@uid='1']");
      $.xmo.getValuesTree("Device/UserAccounts/Users/User[@uid='2']/RemoteAccesses/RemoteAccess[@uid='1']");
      $.xmo.getValuesTree("Device/UserAccounts/Users/User[@uid='3']/RemoteAccesses/RemoteAccess[@uid='1']");
      $.xmo.getValuesTree("Device/UserAccounts/Users/User[@uid='2']/RemoteAccesses/RemoteAccess[@uid='1']");

######## Firmware
      
      http://MASKED
      USER: MASKED
      PASS: MASKED
      $.xmo.getValuesTree("Device/ManagementServer/Username");
      $.xmo.setValuesTree("", "Device/ManagementServer/Username");
      $.xmo.getValuesTree("Device/ManagementServer/Password");
      $.xmo.setValuesTree("", "Device/ManagementServer/Password");

###### Rip

      $.xmo.getValuesTree("Device/Routing/RIP/Enable");
      $.xmo.setValuesTree("true", "Device/Routing/RIP/Enable");

###### Leds

      $.xmo.getValuesTree("Device/Managers/Led/LedPowerBlink");
      $.xmo.setValuesTree("true", "Device/Managers/Led/LedPowerBlink");

###### AccessControl
      $.xmo.getValuesTree("Device/Managers/NetworkLan/AccessControlEnable");
      $.xmo.setValuesTree("true", "Device/Managers/NetworkLan/AccessControlEnable");

###### Logs

      $.xmo.getValuesTree("Device/DeviceInfo/FlushDeviceLog");
      $.xmo.getValuesTree("true", "Device/DeviceInfo/FlushDeviceLog");    **# REMINDER WUSEMAN -  WHY THIS NOT WORK?**


# Cwmpd Disable

      $.xmo.getValuesTree("Device/ManagementServer/EnableCWMP")
      $.xmo.setValuesTree(false, "Device/ManagementServer/EnableCWMP")

###### Route info

      $.xmo.getValuesTree("Device/Routing/RouteInformation/Enable");
      $.xmo.setValuesTree("true", "Device/Routing/RouteInformation/Enable");

###### CLI Password

      $.xmo.getValuesTree("Device/Services/CLIPassword");
      $.xmo.setValuesTree("odemnn", "Device/Services/CLIPassword");

###### Parent control

      $.xmo.getValuesTree("Device/Services/ParentalControl/Enable");
      $.xmo.setValuesTree("true", "Device/Services/ParentalControl/Enable");

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

# URLS
http://192.168.1.1/0.1/gui/js/answering-machine.js
http://192.168.1.1/0.1/gui/js/answering-machine.js
http://192.168.1.1/0.1/gui/js/config.js
http://192.168.1.1/0.1/gui/js/grid.locale-en.js
http://192.168.1.1/0.1/gui/js/gui-api.js
http://192.168.1.1/0.1/gui/js/gui-common.js
http://192.168.1.1/0.1/gui/js/gui-core.js
http://192.168.1.1/0.1/gui/js/gui-widgets.js
http://192.168.1.1/0.1/gui/js/jquery-1.3.2-sc.js
http://192.168.1.1/0.1/gui/js/jquery-1.7.2-sc.js
http://192.168.1.1/0.1/gui/js/jquery-ui-1.7.2.custom.js
http://192.168.1.1/0.1/gui/js/jquery-ui-1.7.3.custom-sc.js
http://192.168.1.1/0.1/gui/js/jquery-ui-1.8.20.custom.js
http://192.168.1.1/0.1/gui/js/jquery-ui.js
http://192.168.1.1/0.1/gui/js/jquery-utils.js
http://192.168.1.1/0.1/gui/js/jquery.cookie.js
http://192.168.1.1/0.1/gui/js/jquery.form.js
http://192.168.1.1/0.1/gui/js/jquery.jcarousel.js
http://192.168.1.1/0.1/gui/js/jquery.jqGrid.js
http://192.168.1.1/0.1/gui/js/jquery.js
http://192.168.1.1/0.1/gui/js/jquery.metadata.js
http://192.168.1.1/0.1/gui/js/jquery.mobile.js
http://192.168.1.1/0.1/gui/js/jquery.printf.js
http://192.168.1.1/0.1/gui/js/jquery.random.js
http://192.168.1.1/0.1/gui/js/jquery.tmpl.js
http://192.168.1.1/0.1/gui/js/json
http://192.168.1.1/0.1/gui/js/json2.js
http://192.168.1.1/0.1/gui/js/libs.js
http://192.168.1.1/0.1/gui/js/md5.js
http://192.168.1.1/0.1/gui/js/scripts.js
http://192.168.1.1/0.1/gui/js/sha512.js
http://192.168.1.1/0.1/gui/js/vendor.js
http://192.168.1.1/0.1/gui/js/xmo.js
http://192.168.1.1/0.1/gui/images/BoB-down-icon-24.png
http://192.168.1.1/0.1/gui/images/BoB-up-icon-24.png
http://192.168.1.1/0.1/gui/images/alert.png
http://192.168.1.1/0.1/gui/images/allow-both.png
http://192.168.1.1/0.1/gui/images/allow-local.png
http://192.168.1.1/0.1/gui/images/allow-remote.png
http://192.168.1.1/0.1/gui/images/app-install-01.png
http://192.168.1.1/0.1/gui/images/app-install-02.png
http://192.168.1.1/0.1/gui/images/arrow.jpg
http://192.168.1.1/0.1/gui/images/arrow_down.png
http://192.168.1.1/0.1/gui/images/barcode-2d.png
http://192.168.1.1/0.1/gui/images/btn-arrow-left-over.svg
http://192.168.1.1/0.1/gui/images/btn-arrow-left.svg
http://192.168.1.1/0.1/gui/images/btn-arrow-right-over.svg
http://192.168.1.1/0.1/gui/images/btn-arrow-right.svg
http://192.168.1.1/0.1/gui/images/btn_arrow.svg
http://192.168.1.1/0.1/gui/images/btn_arrow2.svg
http://192.168.1.1/0.1/gui/images/btn_arrow2_press.svg
http://192.168.1.1/0.1/gui/images/btn_arrow_press.svg
http://192.168.1.1/0.1/gui/images/check-status-hybrid.png
http://192.168.1.1/0.1/gui/images/check-status-no.png
http://192.168.1.1/0.1/gui/images/check-status-other.png
http://192.168.1.1/0.1/gui/images/coloricons-sprite.png
http://192.168.1.1/0.1/gui/images/coloricons-sprite2.png
http://192.168.1.1/0.1/gui/images/conect-05.svg
http://192.168.1.1/0.1/gui/images/conect-06.svg
http://192.168.1.1/0.1/gui/images/disallow-both.png
http://192.168.1.1/0.1/gui/images/disallow-local.png
http://192.168.1.1/0.1/gui/images/disallow-remote.png
http://192.168.1.1/0.1/gui/images/dlna-icon.png
http://192.168.1.1/0.1/gui/images/dot-bg.gif
http://192.168.1.1/0.1/gui/images/download166.png
http://192.168.1.1/0.1/gui/images/downstream.png
http://192.168.1.1/0.1/gui/images/external-link-pink.png
http://192.168.1.1/0.1/gui/images/external-link.png
http://192.168.1.1/0.1/gui/images/fair.gif
http://192.168.1.1/0.1/gui/images/favicon-gomalta.ico
http://192.168.1.1/0.1/gui/images/faviconNone.ico
http://192.168.1.1/0.1/gui/images/get_adobe_flash.png
http://192.168.1.1/0.1/gui/images/get_adobe_shockwave.png
http://192.168.1.1/0.1/gui/images/help-icon.png
http://192.168.1.1/0.1/gui/images/hide-password-icon.png
http://192.168.1.1/0.1/gui/images/ico-bottomNavigation.png
http://192.168.1.1/0.1/gui/images/ico-maintance.svg
http://192.168.1.1/0.1/gui/images/ico-qrcode.svg
http://192.168.1.1/0.1/gui/images/ico-sagencom.svg
http://192.168.1.1/0.1/gui/images/ico-wifi.svg
http://192.168.1.1/0.1/gui/images/icon-add-gcontacts-pink.png
http://192.168.1.1/0.1/gui/images/icon-add-gcontacts.png
http://192.168.1.1/0.1/gui/images/icon-alert-white.png
http://192.168.1.1/0.1/gui/images/icon-arrow.png
http://192.168.1.1/0.1/gui/images/icon-cell-phone.png
http://192.168.1.1/0.1/gui/images/icon-delete.png
http://192.168.1.1/0.1/gui/images/icon-dlna.png
http://192.168.1.1/0.1/gui/images/icon-dropbox.png
http://192.168.1.1/0.1/gui/images/icon-eject.png
http://192.168.1.1/0.1/gui/images/icon-ethernet.png
http://192.168.1.1/0.1/gui/images/icon-export-pink.png
http://192.168.1.1/0.1/gui/images/icon-export.png
http://192.168.1.1/0.1/gui/images/icon-femto.png
http://192.168.1.1/0.1/gui/images/icon-gcontacts-pink.png
http://192.168.1.1/0.1/gui/images/icon-gcontacts.png
http://192.168.1.1/0.1/gui/images/icon-gcontacts2.png
http://192.168.1.1/0.1/gui/images/icon-gdrive.png
http://192.168.1.1/0.1/gui/images/icon-harddrive-white.png
http://192.168.1.1/0.1/gui/images/icon-harddrive.png
http://192.168.1.1/0.1/gui/images/icon-hd.png
http://192.168.1.1/0.1/gui/images/icon-hidden.png
http://192.168.1.1/0.1/gui/images/icon-home-white.svg
http://192.168.1.1/0.1/gui/images/icon-home.png
http://192.168.1.1/0.1/gui/images/icon-home.svg
http://192.168.1.1/0.1/gui/images/icon-import-pink.png
http://192.168.1.1/0.1/gui/images/icon-import.png
http://192.168.1.1/0.1/gui/images/icon-networt-storage.png
http://192.168.1.1/0.1/gui/images/icon-next.svg
http://192.168.1.1/0.1/gui/images/icon-office.png
http://192.168.1.1/0.1/gui/images/icon-partner.png
http://192.168.1.1/0.1/gui/images/icon-pause.svg
http://192.168.1.1/0.1/gui/images/icon-phone.png
http://192.168.1.1/0.1/gui/images/icon-play.svg
http://192.168.1.1/0.1/gui/images/icon-prev.svg
http://192.168.1.1/0.1/gui/images/icon-settings.png
http://192.168.1.1/0.1/gui/images/icon-telephone.png
http://192.168.1.1/0.1/gui/images/icon-voicemail.svg
http://192.168.1.1/0.1/gui/images/icon-wifi0.png
http://192.168.1.1/0.1/gui/images/icon-wifi1.png
http://192.168.1.1/0.1/gui/images/icon-wifi2.png
http://192.168.1.1/0.1/gui/images/icon-wifi3.png
http://192.168.1.1/0.1/gui/images/icon-wifi4.png
http://192.168.1.1/0.1/gui/images/ipv6-logo.png
http://192.168.1.1/0.1/gui/images/loading.gif
http://192.168.1.1/0.1/gui/images/loading2.gif
http://192.168.1.1/0.1/gui/images/loading_dots.gif
http://192.168.1.1/0.1/gui/images/lock.png
http://192.168.1.1/0.1/gui/images/lock.svg
http://192.168.1.1/0.1/gui/images/logo-footer.svg
http://192.168.1.1/0.1/gui/images/logo-sgc-mobile.svg
http://192.168.1.1/0.1/gui/images/logoappstore.png
http://192.168.1.1/0.1/gui/images/logogplay.png
http://192.168.1.1/0.1/gui/images/mass-storage-help.png
http://192.168.1.1/0.1/gui/images/name.svg
http://192.168.1.1/0.1/gui/images/network-map.svg
http://192.168.1.1/0.1/gui/images/off-hook.svg
http://192.168.1.1/0.1/gui/images/on-hook.svg
http://192.168.1.1/0.1/gui/images/order-down.png
http://192.168.1.1/0.1/gui/images/order-up.png
http://192.168.1.1/0.1/gui/images/qrcode.png
http://192.168.1.1/0.1/gui/images/refresh.png
http://192.168.1.1/0.1/gui/images/refresh2-over.png
http://192.168.1.1/0.1/gui/images/refresh2.png
http://192.168.1.1/0.1/gui/images/rubbish7.png
http://192.168.1.1/0.1/gui/images/simple_wait_spinner.svg
http://192.168.1.1/0.1/gui/images/spectrum-greyed.svg
http://192.168.1.1/0.1/gui/images/spectrum-normal.svg
http://192.168.1.1/0.1/gui/images/splash_FU.gif
http://192.168.1.1/0.1/gui/images/sprite-devices.png
http://192.168.1.1/0.1/gui/images/sprite-home.svg
http://192.168.1.1/0.1/gui/images/sprite-machine.svg
http://192.168.1.1/0.1/gui/images/sprite-novo.svg
http://192.168.1.1/0.1/gui/images/sprite.png
http://192.168.1.1/0.1/gui/images/sprite_mobile.svg
http://192.168.1.1/0.1/gui/images/sprite_tree.png
http://192.168.1.1/0.1/gui/images/strong.png
http://192.168.1.1/0.1/gui/images/telia
http://192.168.1.1/0.1/gui/images/test-connection-ok.png
http://192.168.1.1/0.1/gui/images/test-connection.jpg
http://192.168.1.1/0.1/gui/images/upstream.png
http://192.168.1.1/0.1/gui/images/view-password-icon.png
http://192.168.1.1/0.1/gui/images/weak.png
http://192.168.1.1/0.1/gui/images/wps-icon-da.png
http://192.168.1.1/0.1/gui/images/wps-icon.png
http://192.168.1.1/0.1/gui/css/gui-common.css
http://192.168.1.1/0.1/gui/css/gui-core.css
http://192.168.1.1/0.1/gui/css/images
http://192.168.1.1/0.1/gui/css/jquery-ui-1.8.20.custom.css
http://192.168.1.1/0.1/gui/css/jquery-ui.css
http://192.168.1.1/0.1/gui/css/jquery.jqGrid.css
http://192.168.1.1/0.1/gui/css/jquery.mobile.css
http://192.168.1.1/0.1/gui/js/answering-machine.js
http://192.168.1.1/0.1/gui/js/config.js
http://192.168.1.1/0.1/gui/js/grid.locale-en.js
http://192.168.1.1/0.1/gui/js/gui-api.js
http://192.168.1.1/0.1/gui/js/gui-common.js
http://192.168.1.1/0.1/gui/js/gui-core.js
http://192.168.1.1/0.1/gui/js/gui-widgets.js
http://192.168.1.1/0.1/gui/js/jquery-1.3.2-sc.js
http://192.168.1.1/0.1/gui/js/jquery-1.7.2-sc.js
http://192.168.1.1/0.1/gui/js/jquery-ui-1.7.2.custom.js
http://192.168.1.1/0.1/gui/js/jquery-ui-1.7.3.custom-sc.js
http://192.168.1.1/0.1/gui/js/jquery-ui-1.8.20.custom.js
http://192.168.1.1/0.1/gui/js/jquery-ui.js
http://192.168.1.1/0.1/gui/js/jquery-utils.js
http://192.168.1.1/0.1/gui/js/jquery.cookie.js
http://192.168.1.1/0.1/gui/js/jquery.form.js
http://192.168.1.1/0.1/gui/js/jquery.jcarousel.js
http://192.168.1.1/0.1/gui/js/jquery.jqGrid.js
http://192.168.1.1/0.1/gui/js/jquery.js
http://192.168.1.1/0.1/gui/js/jquery.metadata.js
http://192.168.1.1/0.1/gui/js/jquery.mobile.js
http://192.168.1.1/0.1/gui/js/jquery.printf.js
http://192.168.1.1/0.1/gui/js/jquery.random.js
http://192.168.1.1/0.1/gui/js/jquery.tmpl.js
http://192.168.1.1/0.1/gui/js/json
http://192.168.1.1/0.1/gui/js/json2.js
http://192.168.1.1/0.1/gui/js/libs.js
http://192.168.1.1/0.1/gui/js/md5.js
http://192.168.1.1/0.1/gui/js/scripts.js
http://192.168.1.1/0.1/gui/js/sha512.js
http://192.168.1.1/0.1/gui/js/vendor.js
http://192.168.1.1/0.1/gui/js/xmo.js
http://192.168.1.1/0.1/gui/msg/da
http://192.168.1.1/0.1/gui/msg/en
http://192.168.1.1/0.1/gui/styles/app-download.css
http://192.168.1.1/0.1/gui/styles/dev.css
http://192.168.1.1/0.1/gui/styles/fonts
http://192.168.1.1/0.1/gui/styles/lib.css
http://192.168.1.1/0.1/gui/styles/login-malta.css
http://192.168.1.1/0.1/gui/styles/login-telia.css
http://192.168.1.1/0.1/gui/styles/main.css
http://192.168.1.1/0.1/gui/styles/mobile
http://192.168.1.1/0.1/gui/styles/mobile-main.css
http://192.168.1.1/0.1/gui/styles/themes
http://192.168.1.1/0.1/gui/styles/vendor.css
http://192.168.1.1/0.1/gui/views/access-control.dmz-ipv6.html
http://192.168.1.1/0.1/gui/views/access-control.dmz.html
http://192.168.1.1/0.1/gui/views/access-control.firewall.html
http://192.168.1.1/0.1/gui/views/access-control.ipv6-pinholling.html
http://192.168.1.1/0.1/gui/views/access-control.main.html
http://192.168.1.1/0.1/gui/views/access-control.main.wifi.html
http://192.168.1.1/0.1/gui/views/access-control.parental-control.filtering.html
http://192.168.1.1/0.1/gui/views/access-control.parental-control.main.html
http://192.168.1.1/0.1/gui/views/access-control.parental-control.planning.dual.html
http://192.168.1.1/0.1/gui/views/access-control.parental-control.planning.html
http://192.168.1.1/0.1/gui/views/access-control.parental-control.planning.simple.html
http://192.168.1.1/0.1/gui/views/access-control.parental-control.planning.timeslot.html
http://192.168.1.1/0.1/gui/views/access-control.port-forwarding.games-app.html
http://192.168.1.1/0.1/gui/views/access-control.port-forwarding.html
http://192.168.1.1/0.1/gui/views/access-control.port-forwarding.main.html
http://192.168.1.1/0.1/gui/views/access-control.port-forwarding.main.simple.html
http://192.168.1.1/0.1/gui/views/access-control.port-triggering.html
http://192.168.1.1/0.1/gui/views/access-control.portmirror.html
http://192.168.1.1/0.1/gui/views/access-control.remote-access.simple.html
http://192.168.1.1/0.1/gui/views/access-control.smartinterface-rrm.html
http://192.168.1.1/0.1/gui/views/access-control.upnp.html
http://192.168.1.1/0.1/gui/views/access-control.user.html
http://192.168.1.1/0.1/gui/views/access-control.user.simple.html
http://192.168.1.1/0.1/gui/views/android-help.html
http://192.168.1.1/0.1/gui/views/answering-machine.mail-server.html
http://192.168.1.1/0.1/gui/views/answering-machine.main.html
http://192.168.1.1/0.1/gui/views/answering-machine.messages.html
http://192.168.1.1/0.1/gui/views/answering-machine.settings.html
http://192.168.1.1/0.1/gui/views/base-simple-talktalk.html
http://192.168.1.1/0.1/gui/views/base.html
http://192.168.1.1/0.1/gui/views/baseSimple.html
http://192.168.1.1/0.1/gui/views/broad-band.simple.html
http://192.168.1.1/0.1/gui/views/content-sharing.simple.html
http://192.168.1.1/0.1/gui/views/dect.advanced.html
http://192.168.1.1/0.1/gui/views/dect.basic.html
http://192.168.1.1/0.1/gui/views/dect.handset.advanced.html
http://192.168.1.1/0.1/gui/views/dect.handset.handset.html
http://192.168.1.1/0.1/gui/views/dect.handset.main.html
http://192.168.1.1/0.1/gui/views/dect.handset.main.simple.html
http://192.168.1.1/0.1/gui/views/dect.main.html
http://192.168.1.1/0.1/gui/views/ethernet-device.device-info.html
http://192.168.1.1/0.1/gui/views/ethernet-device.dmz.html
http://192.168.1.1/0.1/gui/views/ethernet-device.main.html
http://192.168.1.1/0.1/gui/views/ethernet-device.main.simple.html
http://192.168.1.1/0.1/gui/views/ethernet-device.port-forwarding.main.html
http://192.168.1.1/0.1/gui/views/ethernet-device.port-forwarding.main.simple.html
http://192.168.1.1/0.1/gui/views/ethernet-lan.html
http://192.168.1.1/0.1/gui/views/ethernet.html
http://192.168.1.1/0.1/gui/views/extended-menu.html
http://192.168.1.1/0.1/gui/views/first-access.connection.html
http://192.168.1.1/0.1/gui/views/first-access.end.html
http://192.168.1.1/0.1/gui/views/first-access.html
http://192.168.1.1/0.1/gui/views/first-access.ppp.html
http://192.168.1.1/0.1/gui/views/first-access.user.html
http://192.168.1.1/0.1/gui/views/first-access.wifi.html
http://192.168.1.1/0.1/gui/views/internet-connection-talktalk.html
http://192.168.1.1/0.1/gui/views/internet-connectivity.3g.cellular.html
http://192.168.1.1/0.1/gui/views/internet-connectivity.3g.hsxpalte.html
http://192.168.1.1/0.1/gui/views/internet-connectivity.basic.html
http://192.168.1.1/0.1/gui/views/internet-connectivity.connectionServices.html
http://192.168.1.1/0.1/gui/views/internet-connectivity.docsis.main.html
http://192.168.1.1/0.1/gui/views/internet-connectivity.gpon.html
http://192.168.1.1/0.1/gui/views/internet-connectivity.greTunnel.html
http://192.168.1.1/0.1/gui/views/internet-connectivity.ipv4.html
http://192.168.1.1/0.1/gui/views/internet-connectivity.ipv6Simple.html
http://192.168.1.1/0.1/gui/views/internet-connectivity.main.html
http://192.168.1.1/0.1/gui/views/internet-connectivity.main.simple.html
http://192.168.1.1/0.1/gui/views/internet-connectivity.mapT.html
http://192.168.1.1/0.1/gui/views/internet-connectivity.mptcp.kpi-information.html
http://192.168.1.1/0.1/gui/views/internet-connectivity.mptcp.main.html
http://192.168.1.1/0.1/gui/views/internet-connectivity.mptcp.statistics.html
http://192.168.1.1/0.1/gui/views/internet-connectivity.mptcp.status.html
http://192.168.1.1/0.1/gui/views/internet-connectivity.ppp.html
http://192.168.1.1/0.1/gui/views/internet-connectivity.vlan.html
http://192.168.1.1/0.1/gui/views/lan.main.html
http://192.168.1.1/0.1/gui/views/login-dtag-xdsl.html
http://192.168.1.1/0.1/gui/views/login-dtag.html
http://192.168.1.1/0.1/gui/views/login-get.html
http://192.168.1.1/0.1/gui/views/login-optus.html
http://192.168.1.1/0.1/gui/views/login-simple-comhem.html
http://192.168.1.1/0.1/gui/views/login-tim-v2.html
http://192.168.1.1/0.1/gui/views/login-wizard-tim-v2.html
http://192.168.1.1/0.1/gui/views/login.html
http://192.168.1.1/0.1/gui/views/loginSimple.html
http://192.168.1.1/0.1/gui/views/main-charter-5280.html
http://192.168.1.1/0.1/gui/views/main-comhem.html
http://192.168.1.1/0.1/gui/views/main-malta.html
http://192.168.1.1/0.1/gui/views/main-new.html
http://192.168.1.1/0.1/gui/views/main-simple-talktalk.html
http://192.168.1.1/0.1/gui/views/main-talktalk-simple.html
http://192.168.1.1/0.1/gui/views/main-talktalk.html
http://192.168.1.1/0.1/gui/views/main-telia.html
http://192.168.1.1/0.1/gui/views/main-telus.html
http://192.168.1.1/0.1/gui/views/main.html
http://192.168.1.1/0.1/gui/views/my-devices-simple-talktalk.html
http://192.168.1.1/0.1/gui/views/mynetwork.main.html
http://192.168.1.1/0.1/gui/views/mynetwork.map.html
http://192.168.1.1/0.1/gui/views/mysagemcombox.advanced.options.html
http://192.168.1.1/0.1/gui/views/mysagemcombox.antenna-settings.html
http://192.168.1.1/0.1/gui/views/mysagemcombox.autodimming.html
http://192.168.1.1/0.1/gui/views/mysagemcombox.bridge-mode.html
http://192.168.1.1/0.1/gui/views/mysagemcombox.ddns.html
http://192.168.1.1/0.1/gui/views/mysagemcombox.ddns.simple.html
http://192.168.1.1/0.1/gui/views/mysagemcombox.device-info.arp.html
http://192.168.1.1/0.1/gui/views/mysagemcombox.device-info.configuration.html
http://192.168.1.1/0.1/gui/views/mysagemcombox.device-info.connection.html
http://192.168.1.1/0.1/gui/views/mysagemcombox.device-info.device-info.html
http://192.168.1.1/0.1/gui/views/mysagemcombox.device-info.dhcp-leases.html
http://192.168.1.1/0.1/gui/views/mysagemcombox.device-info.docsis.configuration.html
http://192.168.1.1/0.1/gui/views/mysagemcombox.device-info.docsis.connection.html
http://192.168.1.1/0.1/gui/views/mysagemcombox.device-info.docsis.html
http://192.168.1.1/0.1/gui/views/mysagemcombox.device-info.licenses.html
http://192.168.1.1/0.1/gui/views/mysagemcombox.device-info.main.html
http://192.168.1.1/0.1/gui/views/mysagemcombox.dhcp.html
http://192.168.1.1/0.1/gui/views/mysagemcombox.dns.main.html
http://192.168.1.1/0.1/gui/views/mysagemcombox.dns.server.html
http://192.168.1.1/0.1/gui/views/mysagemcombox.fon.html
http://192.168.1.1/0.1/gui/views/mysagemcombox.lan-ipv6-router.html
http://192.168.1.1/0.1/gui/views/mysagemcombox.led-slider.html
http://192.168.1.1/0.1/gui/views/mysagemcombox.led.html
http://192.168.1.1/0.1/gui/views/mysagemcombox.ledDimmed.html
http://192.168.1.1/0.1/gui/views/mysagemcombox.main.html
http://192.168.1.1/0.1/gui/views/mysagemcombox.maintenance.dsl-line.html
http://192.168.1.1/0.1/gui/views/mysagemcombox.maintenance.first-install.html
http://192.168.1.1/0.1/gui/views/mysagemcombox.maintenance.internet-utilities.html
http://192.168.1.1/0.1/gui/views/mysagemcombox.maintenance.log.main.html
http://192.168.1.1/0.1/gui/views/mysagemcombox.maintenance.main.html
http://192.168.1.1/0.1/gui/views/mysagemcombox.maintenance.mainSimple.html
http://192.168.1.1/0.1/gui/views/mysagemcombox.maintenance.ntp.html
http://192.168.1.1/0.1/gui/views/mysagemcombox.maintenance.reset.html
http://192.168.1.1/0.1/gui/views/mysagemcombox.mass-storage.html
http://192.168.1.1/0.1/gui/views/mysagemcombox.network-configuration.html
http://192.168.1.1/0.1/gui/views/mysagemcombox.simple-main.html
http://192.168.1.1/0.1/gui/views/mysagemcombox.sip-alg.html
http://192.168.1.1/0.1/gui/views/mysagemcombox.walled-garden.html
http://192.168.1.1/0.1/gui/views/partials
http://192.168.1.1/0.1/gui/views/plc.device-info.html
http://192.168.1.1/0.1/gui/views/ploampassword.html
http://192.168.1.1/0.1/gui/views/scheduling.control.html
http://192.168.1.1/0.1/gui/views/scheduling.html
http://192.168.1.1/0.1/gui/views/scheduling.main.html
http://192.168.1.1/0.1/gui/views/services.simple.main.html
http://192.168.1.1/0.1/gui/views/splash-firmware-upgrade.html
http://192.168.1.1/0.1/gui/views/traffic-monitor.main.simple.html
http://192.168.1.1/0.1/gui/views/traffic-monitor.simple.html
http://192.168.1.1/0.1/gui/views/usb-device.device-info.html
http://192.168.1.1/0.1/gui/views/usb-device.main.html
http://192.168.1.1/0.1/gui/views/usb-device.main.simple.html
http://192.168.1.1/0.1/gui/views/webradio.html
http://192.168.1.1/0.1/gui/views/wifi-simple-talktalk.html
http://192.168.1.1/0.1/gui/views/wifi.advanced.html
http://192.168.1.1/0.1/gui/views/wifi.basic.dual.generic.html
http://192.168.1.1/0.1/gui/views/wifi.basic.html
http://192.168.1.1/0.1/gui/views/wifi.environment.main.html
http://192.168.1.1/0.1/gui/views/wifi.environment.scan.html
http://192.168.1.1/0.1/gui/views/wifi.mac-filter.html
http://192.168.1.1/0.1/gui/views/wifi.main.dual.html
http://192.168.1.1/0.1/gui/views/wifi.main.html
http://192.168.1.1/0.1/gui/views/wifi.new-ssid.main.html
http://192.168.1.1/0.1/gui/views/wifi.simple.html
http://192.168.1.1/0.1/gui/views/wifi.simple.main.html
http://192.168.1.1/0.1/gui/views/wifi.ssid.creation.html
http://192.168.1.1/0.1/gui/views/wifi.stats.html
http://192.168.1.1/0.1/gui/views/wifi.wps.html
http://192.168.1.1/0.1/gui/views-mobile/404.html
http://192.168.1.1/0.1/gui/views-mobile/answering-machine.html
http://192.168.1.1/0.1/gui/views-mobile/base.html
http://192.168.1.1/0.1/gui/views-mobile/ethernet-device.device-info.html
http://192.168.1.1/0.1/gui/views-mobile/ethernet-device.main.html
http://192.168.1.1/0.1/gui/views-mobile/guest-access.html
http://192.168.1.1/0.1/gui/views-mobile/login.html
http://192.168.1.1/0.1/gui/views-mobile/main.html
http://192.168.1.1/0.1/gui/views-mobile/maintenance.internet-utilities.html
http://192.168.1.1/0.1/gui/views-mobile/maintenance.main.html
http://192.168.1.1/0.1/gui/views-mobile/maintenance.reset.html
http://192.168.1.1/0.1/gui/views-mobile/my.media.html
http://192.168.1.1/0.1/gui/views-mobile/networkmap-app-phone.html
http://192.168.1.1/0.1/gui/views-mobile/networkmap-app-tablet.html
http://192.168.1.1/0.1/gui/views-mobile/networkmap-app.html
http://192.168.1.1/0.1/gui/views-mobile/parental-control.html
http://192.168.1.1/0.1/gui/views-mobile/qr-code.html
http://192.168.1.1/0.1/gui/views-mobile/status-settings.main.html
http://192.168.1.1/0.1/gui/views-mobile/status-settings.wifi.basic.html
http://192.168.1.1/0.1/gui/views-mobile/status-settings.wifi.main.html
http://192.168.1.1/0.1/gui/views-mobile/status-settings.wifi.sched.html
http://192.168.1.1/0.1/gui/views-mobile/status-settings.wifi.wps.html
http://192.168.1.1/0.1/gui/views-mobile/status-statistics.main.html
http://192.168.1.1/0.1/gui/views-mobile/status-statistics.statistics.html
http://192.168.1.1/0.1/gui/views-mobile/status-statistics.status.html
http://192.168.1.1/0.1/gui/views-mobile/usb-device.device-info.html
http://192.168.1.1/0.1/gui/views-mobile/voice.device-info.html
http://192.168.1.1/0.1/gui/views-mobile/wifi-strength.html


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
