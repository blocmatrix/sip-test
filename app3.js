var LS_USERNAME = 'LS_USERNAME';
var LS_CALL_TO = 'LS_CALL_TO';
var dialText = '200';

let profileUserID = null; // Internal reference ID. (DON'T CHANGE THIS!)
let profileName = 'Sarath'; // eg: Keyla James
let wssServer = 'pbx-2.testd.com'; // eg: raspberrypi.local
let WebSocketPort = 4443; // eg: 444 | 4443
let ServerPath = '/ws'; // eg: /ws
let SipDomain = 'pbx-2.testd.com'; // eg: raspberrypi.local
let SipUsername = 'User1'; // eg: webrtc
let SipPassword = '1234'; // eg: webrtc

const appversion = '3.7';
const sipjsversion = '0.20.0';
const navUserAgent = window.navigator.userAgent;
const localDB = window.localStorage;

let ContactUserName = '';
let IpInContact = true;
let DoNotDisturbEnabled = false;
let DoNotDisturbPolicy = 'allow';
let ChatEngine = 'SIMPLE';
let WssInTransport = '1';
let TransportConnectionTimeout = 15;
let BundlePolicy = 'balanced';
let IceStunServerJson = '';
let IceStunCheckTimeout = 500;
let NoAnswerTimeout = 120;
let TransportReconnectionAttempts = 999;
let RegisterExpires = 300;
let RegisterExtraHeaders = '{}';
let RegisterContactParams = '{}';
let RegisterExtraContactParams = '{}';
let userAgentStr = 'Browser Phone ' + appversion + ' (SIPJS - ' + sipjsversion + ') ' + navUserAgent;
let alertObj = null;
let Buddies = [];

let EnableAlphanumericDial = false;
let telNumericRegEx = /[^\d\*\#\+]/g;
let MaxDidLength = 16;
let DidLength = 6;
let AutoDeleteDefault = true;
let Lines = [];
let DisableBuddies = false;
let BuddySortBy = 'activity';
let BuddyAutoDeleteAtEnd = false;
let HideAutoDeleteBuddies = false;
let DisplayTimeFormat = 'h:mm:ss A';
let defaultAvatars =
  'avatars/default.0.webp,avatars/default.1.webp,avatars/default.2.webp,avatars/default.3.webp,avatars/default.4.webp,avatars/default.5.webp,avatars/default.6.webp,avatars/default.7.webp,avatars/default.8.webp';
let hostingPrefix = '';
let imagesDirectory = '';
let BuddyShowExtenNum = false;
let EnableVideoCalling = true;
let EnableTextMessaging = true;
let UiMessageLayout = 'middle';
let MaxBuddyAge = 365;
let DisplayDateFormat = 'YYYY-MM-DD';
let MaxBuddies = 999;
let newLineNumber = 1;
let CallRecordingPolicy = 'allow';
let EnableConference = true;
let EnableTransfer = true;
let UiMaxWidth = 1240;
let selectedBuddy = null;
let windowObj = null;
let confirmObj = null;
let promptObj = null;
let menuObj = null;
let HasAudioDevice = false;
let AutoGainControl = true;
let EchoCancellation = true;
let NoiseSuppression = true;
let InviteExtraHeaders = '{}';
let DisableFreeDial = false;
let selectedLine = null;
let EnableAccountSettings = true;
let VoiceMailSubscribe = true;
let EnableAppearanceSettings = true;
let EnableNotificationSettings = true;
let MirrorVideo = 'rotateY(180deg)';
let maxFrameRate = '';
let videoHeight = '';
let videoAspectRatio = '1.33';
let NotificationsActive = false;
let RecordAllCalls = false;
let CallQosDataIndexDb = null;
let MaxDataStoreDays = 0;
let AutoAnswerEnabled = false;
let IntercomPolicy = 'enabled';
let AutoAnswerPolicy = 'allow';
let EnableRingtone = true;
let StreamBuffer = 50;

let lang = {};
let audioBlobs = {};

$(document).ready(function () {
  // add version
  $('#version').html(appversion);
  var username = localStorage.getItem(LS_USERNAME);
  if (username) {
    SipUsername = username;
    $('#username').val(username);
    register();
  }
  var lsDialText = localStorage.getItem(LS_CALL_TO);
  if (lsDialText) {
    dialText = lsDialText;
    $('#dialText').val(lsDialText);
  }

  $.getJSON(hostingPrefix + 'en.json', function (data) {
    lang = data;
    InitUi();
  });
  PreloadAudioFiles();
});

function makeRegister() {
  if ($('#username').val()) {
    SipUsername = $('#username').val();
    localStorage.setItem(LS_USERNAME, SipUsername);
  }
  register();
}

function makeCall() {
  if ($('#dialText').val()) {
    dialText = $('#dialText').val();
    localStorage.setItem(LS_CALL_TO, dialText);
  }
  DialByLine('audio');
}

function PreloadAudioFiles() {
  audioBlobs.Alert = { file: 'Alert.mp3', url: hostingPrefix + 'media/Alert.mp3' };
  audioBlobs.Ringtone = { file: 'Ringtone_1.mp3', url: hostingPrefix + 'media/Ringtone_1.mp3' };
  audioBlobs.speech_orig = { file: 'speech_orig.mp3', url: hostingPrefix + 'media/speech_orig.mp3' };
  audioBlobs.Busy_UK = { file: 'Tone_Busy-UK.mp3', url: hostingPrefix + 'media/Tone_Busy-UK.mp3' };
  audioBlobs.Busy_US = { file: 'Tone_Busy-US.mp3', url: hostingPrefix + 'media/Tone_Busy-US.mp3' };
  audioBlobs.CallWaiting = { file: 'Tone_CallWaiting.mp3', url: hostingPrefix + 'media/Tone_CallWaiting.mp3' };
  audioBlobs.Congestion_UK = { file: 'Tone_Congestion-UK.mp3', url: hostingPrefix + 'media/Tone_Congestion-UK.mp3' };
  audioBlobs.Congestion_US = { file: 'Tone_Congestion-US.mp3', url: hostingPrefix + 'media/Tone_Congestion-US.mp3' };
  audioBlobs.EarlyMedia_Australia = { file: 'Tone_EarlyMedia-Australia.mp3', url: hostingPrefix + 'media/Tone_EarlyMedia-Australia.mp3' };
  audioBlobs.EarlyMedia_European = { file: 'Tone_EarlyMedia-European.mp3', url: hostingPrefix + 'media/Tone_EarlyMedia-European.mp3' };
  audioBlobs.EarlyMedia_Japan = { file: 'Tone_EarlyMedia-Japan.mp3', url: hostingPrefix + 'media/Tone_EarlyMedia-Japan.mp3' };
  audioBlobs.EarlyMedia_UK = { file: 'Tone_EarlyMedia-UK.mp3', url: hostingPrefix + 'media/Tone_EarlyMedia-UK.mp3' };
  audioBlobs.EarlyMedia_US = { file: 'Tone_EarlyMedia-US.mp3', url: hostingPrefix + 'media/Tone_EarlyMedia-US.mp3' };

  $.each(audioBlobs, function (i, item) {
    var oReq = new XMLHttpRequest();
    oReq.open('GET', item.url, true);
    oReq.responseType = 'blob';
    oReq.onload = function (oEvent) {
      var reader = new FileReader();
      reader.readAsDataURL(oReq.response);
      reader.onload = function () {
        item.blob = reader.result;
      };
    };
    oReq.send();
  });
  // console.log(audioBlobs);
}

function InitUi() {
  var phone = $('#Phone');
  phone.empty();
  phone.attr('class', 'pageContainer');
  phone.css('max-width', UiMaxWidth + 'px');

  // Right Section
  var rightSection = $('<div/>');
  rightSection.attr('id', 'rightContent');
  rightSection.attr('class', 'rightContent');
  // rightSection.attr('style', 'margin-left: 320px; height: 100%');

  phone.append(rightSection);
}

function register() {
  var options = {
    logConfiguration: false, // If true, constructor logs the registerer configuration.
    uri: SIP.UserAgent.makeURI('sip:' + SipUsername + '@' + SipDomain),
    transportOptions: {
      server: 'wss://' + wssServer + ':' + WebSocketPort + '' + ServerPath,
      traceSip: false,
      connectionTimeout: TransportConnectionTimeout,
      // keepAliveInterval: 30 // Uncomment this and make this any number greater then 0 for keep alive...
      // NB, adding a keep alive will NOT fix bad internet, if your connection cannot stay open (permanent WebSocket Connection) you probably
      // have a router or ISP issue, and if your internet is so poor that you need to some how keep it alive with empty packets
      // upgrade you internet connection. This is voip we are talking about here.
    },
    sessionDescriptionHandlerFactoryOptions: {
      peerConnectionConfiguration: {
        bundlePolicy: BundlePolicy,
        // certificates: undefined,
        // iceCandidatePoolSize: 10,
        // iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        // iceTransportPolicy: "all",
        // peerIdentity: undefined,
        // rtcpMuxPolicy: "require",
      },
      iceGatheringTimeout: IceStunCheckTimeout,
    },
    contactName: ContactUserName,
    displayName: profileName,
    authorizationUsername: SipUsername,
    authorizationPassword: SipPassword,
    hackIpInContact: IpInContact, // Asterisk should also be set to rewrite contact
    userAgentString: userAgentStr,
    autoStart: false,
    autoStop: true,
    register: false,
    noAnswerTimeout: NoAnswerTimeout,
    contactParams: {},
    delegate: {
      onInvite: function (sip) {
        ReceiveCall(sip);
      },
      // onMessage: function (sip) {
      //   ReceiveOutOfDialogMessage(sip);
      // },
    },
  };

  userAgent = new SIP.UserAgent(options);

  userAgent.transport.onConnect = function () {
    console.log('onConnect---------------');
    $('#regStatus').html('Connected to Web Socket!');
    var RegistererRegisterOptions = {
      requestDelegate: {
        onReject: function (sip) {
          console.log('Registration Failed: ', sip.message);
          $('#regStatus').html('Registration failed');
        },
      },
    };
    console.log('Sending Registration--------------');
    $('#regStatus').html('Sending Registration...');
    userAgent.registerer.register(RegistererRegisterOptions);
  };

  userAgent.registerer = new SIP.Registerer(userAgent);
  console.log('Creating Registerer--------------');

  userAgent.registerer.stateChange.addListener(function (newState) {
    console.log('User Agent Registration State--------------:', newState);
    switch (newState) {
      case SIP.RegistererState.Initial:
        // Nothing to do
        break;
      case SIP.RegistererState.Registered:
        $('#regStatus').html('Registered');
        break;
      case SIP.RegistererState.Unregistered:
        $('#regStatus').html('Unregistered, bye!');
        break;
      case SIP.RegistererState.Terminated:
        // Nothing to do
        break;
    }
  });

  console.log('User Agent Connecting to WebSocket--------------');
  $('#regStatus').html('Connecting to Web Socket...');
  userAgent.start().catch(function (error) {
    console.error(error);
  });
}

function SubscribeBuddy(buddyObj) {
  console.log(buddyObj, '---------buddyObj');

  if ((buddyObj.type == 'extension' || buddyObj.type == 'xmpp') && buddyObj.EnableSubscribe == true && buddyObj.SubscribeUser != '') {
    var targetURI = SIP.UserAgent.makeURI('sip:' + buddyObj.SubscribeUser + '@' + SipDomain);

    var options = {
      expires: SubscribeBuddyExpires,
      extraHeaders: ['Accept: ' + SubscribeBuddyAccept],
    };
    var blfSubscribe = new SIP.Subscriber(userAgent, targetURI, SubscribeBuddyEvent, options);
    blfSubscribe.data = {};
    blfSubscribe.data.buddyId = buddyObj.identity;
    blfSubscribe.delegate = {
      onNotify: function (sip) {
        ReceiveNotify(sip, false);
      },
    };
    console.log('SUBSCRIBE: ' + buddyObj.SubscribeUser + '@' + SipDomain);
    blfSubscribe.subscribe().catch(function (error) {
      console.warn('Error subscribing to Buddy notifications:', error);
    });

    if (!userAgent.BlfSubs) userAgent.BlfSubs = [];
    userAgent.BlfSubs.push(blfSubscribe);
  }
}

// ============================================================ Call ================================================================================
var Buddy = function (
  type,
  identity,
  CallerIDName,
  ExtNo,
  MobileNumber,
  ContactNumber1,
  ContactNumber2,
  lastActivity,
  desc,
  Email,
  jid,
  dnd,
  subscribe,
  subscription,
  autoDelete,
  pinned
) {
  this.type = type; // extension | xmpp | contact | group
  this.identity = identity;
  this.jid = jid;
  this.CallerIDName = CallerIDName ? CallerIDName : '';
  this.Email = Email ? Email : '';
  this.Desc = desc ? desc : '';
  this.ExtNo = ExtNo;
  this.MobileNumber = MobileNumber;
  this.ContactNumber1 = ContactNumber1;
  this.ContactNumber2 = ContactNumber2;
  this.lastActivity = lastActivity; // Full Date as string eg "1208-03-21 15:34:23 UTC"
  this.devState = 'dotOffline';
  this.presence = 'Unknown';
  this.missed = 0;
  this.IsSelected = false;
  this.imageObjectURL = '';
  this.presenceText = lang.default_status;
  this.EnableDuringDnd = dnd;
  this.EnableSubscribe = subscribe;
  this.SubscribeUser = subscription ? subscription : ExtNo;
  this.AllowAutoDelete = typeof autoDelete !== 'undefined' ? autoDelete : AutoDeleteDefault;
  this.Pinned = typeof pinned !== 'undefined' ? pinned : false;
};
var Line = function (lineNumber, displayName, displayNumber, buddyObj) {
  this.LineNumber = lineNumber;
  this.DisplayName = displayName;
  this.DisplayNumber = displayNumber;
  this.IsSelected = false;
  this.BuddyObj = buddyObj;
  this.SipSession = null;
  this.LocalSoundMeter = null;
  this.RemoteSoundMeter = null;
};
class SoundMeter {
  constructor(sessionId, lineNum) {
    var audioContext = null;
    try {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContext = new AudioContext();
    } catch (e) {
      console.warn('AudioContext() LocalAudio not available... its fine.');
    }
    if (audioContext == null) return null;
    this.context = audioContext;
    this.source = null;

    this.lineNum = lineNum;
    this.sessionId = sessionId;

    this.captureInterval = null;
    this.levelsInterval = null;
    this.networkInterval = null;
    this.startTime = 0;

    this.ReceiveBitRateChart = null;
    this.ReceiveBitRate = [];
    this.ReceivePacketRateChart = null;
    this.ReceivePacketRate = [];
    this.ReceivePacketLossChart = null;
    this.ReceivePacketLoss = [];
    this.ReceiveJitterChart = null;
    this.ReceiveJitter = [];
    this.ReceiveLevelsChart = null;
    this.ReceiveLevels = [];
    this.SendBitRateChart = null;
    this.SendBitRate = [];
    this.SendPacketRateChart = null;
    this.SendPacketRate = [];

    this.instant = 0; // Primary Output indicator

    this.AnalyserNode = this.context.createAnalyser();
    this.AnalyserNode.minDecibels = -90;
    this.AnalyserNode.maxDecibels = -10;
    this.AnalyserNode.smoothingTimeConstant = 0.85;
  }
  connectToSource(stream, callback) {
    console.log('SoundMeter connecting...');
    try {
      this.source = this.context.createMediaStreamSource(stream);
      this.source.connect(this.AnalyserNode);
      // this.AnalyserNode.connect(this.context.destination); // Can be left unconnected
      this._start();

      callback(null);
    } catch (e) {
      console.error(e); // Probably not audio track
      callback(e);
    }
  }
  _start() {
    var self = this;
    self.instant = 0;
    self.AnalyserNode.fftSize = 32; // 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, and 32768. Defaults to 2048
    self.dataArray = new Uint8Array(self.AnalyserNode.frequencyBinCount);

    this.captureInterval = window.setInterval(function () {
      self.AnalyserNode.getByteFrequencyData(self.dataArray); // Populate array with data from 0-255

      // Just take the maximum value of this data
      self.instant = 0;
      for (var d = 0; d < self.dataArray.length; d++) {
        if (self.dataArray[d] > self.instant) self.instant = self.dataArray[d];
      }
    }, 1);
  }
  stop() {
    console.log('Disconnecting SoundMeter...');
    window.clearInterval(this.captureInterval);
    this.captureInterval = null;
    window.clearInterval(this.levelsInterval);
    this.levelsInterval = null;
    window.clearInterval(this.networkInterval);
    this.networkInterval = null;
    try {
      this.source.disconnect();
    } catch (e) {}
    this.source = null;
    try {
      this.AnalyserNode.disconnect();
    } catch (e) {}
    this.AnalyserNode = null;
    try {
      this.context.close();
    } catch (e) {}
    this.context = null;

    // Save to IndexDb
    var lineObj = FindLineByNumber(this.lineNum);
    var QosData = {
      ReceiveBitRate: this.ReceiveBitRate,
      ReceivePacketRate: this.ReceivePacketRate,
      ReceivePacketLoss: this.ReceivePacketLoss,
      ReceiveJitter: this.ReceiveJitter,
      ReceiveLevels: this.ReceiveLevels,
      SendBitRate: this.SendBitRate,
      SendPacketRate: this.SendPacketRate,
    };
    if (this.sessionId != null) {
      SaveQosData(QosData, this.sessionId, lineObj.BuddyObj?.identity);
    }
  }
}
function FindBuddyByDid(did) {
  // Used only in Inbound
  for (var b = 0; b < Buddies.length; b++) {
    if (Buddies[b].ExtNo == did || Buddies[b].MobileNumber == did || Buddies[b].ContactNumber1 == did || Buddies[b].ContactNumber2 == did) {
      return Buddies[b];
    }
  }
  return null;
}
function FindBuddyByIdentity(identity) {
  for (var b = 0; b < Buddies.length; b++) {
    if (Buddies[b].identity == identity) return Buddies[b];
  }
  return null;
}
function MakeBuddy(type, update, focus, subscribe, callerID, did, jid, AllowDuringDnd, subscribeUser, autoDelete, addToXmppRoster) {
  var json = JSON.parse(localStorage.getItem(profileUserID + '-Buddies'));
  if (json == null) json = InitUserBuddies();

  var dateNow = utcDateNow();
  var buddyObj = null;
  var id = uID();

  if (type == 'extension') {
    json.DataCollection.push({
      Type: 'extension',
      LastActivity: dateNow,
      ExtensionNumber: did,
      MobileNumber: '',
      ContactNumber1: '',
      ContactNumber2: '',
      uID: id,
      cID: null,
      gID: null,
      jid: null,
      DisplayName: callerID,
      Description: '',
      Email: '',
      MemberCount: 0,
      EnableDuringDnd: AllowDuringDnd,
      Subscribe: subscribe,
      SubscribeUser: subscribeUser,
      AutoDelete: autoDelete,
    });
    buddyObj = new Buddy(
      'extension',
      id,
      callerID,
      did,
      '',
      '',
      '',
      dateNow,
      '',
      '',
      null,
      AllowDuringDnd,
      subscribe,
      subscribeUser,
      autoDelete
    );
    AddBuddy(buddyObj, update, focus, subscribe, true);
  }
  if (type == 'xmpp') {
    json.DataCollection.push({
      Type: 'xmpp',
      LastActivity: dateNow,
      ExtensionNumber: did,
      MobileNumber: '',
      ContactNumber1: '',
      ContactNumber2: '',
      uID: id,
      cID: null,
      gID: null,
      jid: jid,
      DisplayName: callerID,
      Description: '',
      Email: '',
      MemberCount: 0,
      EnableDuringDnd: AllowDuringDnd,
      Subscribe: subscribe,
      SubscribeUser: subscribeUser,
      AutoDelete: autoDelete,
    });
    buddyObj = new Buddy('xmpp', id, callerID, did, '', '', '', dateNow, '', '', jid, AllowDuringDnd, subscribe, subscribeUser, autoDelete);
    if (addToXmppRoster == true) {
      XmppAddBuddyToRoster(buddyObj);
    }
    AddBuddy(buddyObj, update, focus, subscribe, true);
  }
  if (type == 'contact') {
    json.DataCollection.push({
      Type: 'contact',
      LastActivity: dateNow,
      ExtensionNumber: '',
      MobileNumber: '',
      ContactNumber1: did,
      ContactNumber2: '',
      uID: null,
      cID: id,
      gID: null,
      jid: null,
      DisplayName: callerID,
      Description: '',
      Email: '',
      MemberCount: 0,
      EnableDuringDnd: AllowDuringDnd,
      Subscribe: false,
      SubscribeUser: null,
      AutoDelete: autoDelete,
    });
    buddyObj = new Buddy('contact', id, callerID, '', '', did, '', dateNow, '', '', null, AllowDuringDnd, false, null, autoDelete);
    AddBuddy(buddyObj, update, focus, false, true);
  }
  if (type == 'group') {
    json.DataCollection.push({
      Type: 'group',
      LastActivity: dateNow,
      ExtensionNumber: did,
      MobileNumber: '',
      ContactNumber1: '',
      ContactNumber2: '',
      uID: null,
      cID: null,
      gID: id,
      jid: null,
      DisplayName: callerID,
      Description: '',
      Email: '',
      MemberCount: 0,
      EnableDuringDnd: false,
      Subscribe: false,
      SubscribeUser: null,
      AutoDelete: autoDelete,
    });
    buddyObj = new Buddy('group', id, callerID, did, '', '', '', dateNow, '', '', null, false, false, null, autoDelete);
    AddBuddy(buddyObj, update, focus, false, true);
  }
  // Update Size:
  json.TotalRows = json.DataCollection.length;

  // Save To DB
  localStorage.setItem(profileUserID + '-Buddies', JSON.stringify(json));

  // Return new buddy
  return buddyObj;
}
function AddBuddy(buddyObj, update, focus, subscribe, cleanup) {
  Buddies.push(buddyObj);
  if (update == true) UpdateBuddyList();
  AddBuddyMessageStream(buddyObj);
  if (subscribe == true) SubscribeBuddy(buddyObj);
  if (focus == true) SelectBuddy(buddyObj.identity);
  if (cleanup == true) CleanupBuddies();
}
function UpdateBuddyList() {
  var filter = $('#txtFindBuddy').val();

  $('#myContacts').empty();

  // Show Lines
  var callCount = 0;
  for (var l = 0; l < Lines.length; l++) {
    var classStr = Lines[l].IsSelected ? 'buddySelected' : 'buddy';
    if (Lines[l].SipSession != null) classStr = Lines[l].SipSession.isOnHold ? 'buddyActiveCallHollding' : 'buddyActiveCall';

    var html = '<div id="line-' + Lines[l].LineNumber + '" class=' + classStr + ' onclick="SelectLine(\'' + Lines[l].LineNumber + '\')">';
    if (
      Lines[l].IsSelected == false &&
      Lines[l].SipSession &&
      Lines[l].SipSession.data.started != true &&
      Lines[l].SipSession.data.calldirection == 'inbound'
    ) {
      html +=
        '<span id="line-' +
        Lines[l].LineNumber +
        '-ringing" class=missedNotifyer style="padding-left: 5px; padding-right: 5px; width:unset"><i class="fa fa-phone"></i> ' +
        lang.state_ringing +
        '</span>';
    }
    html += '<div class=lineIcon>' + (l + 1) + '</div>';
    html += '<div class=contactNameText><i class="fa fa-phone"></i> ' + lang.line + ' ' + (l + 1) + '</div>';
    html += '<div id="line-' + Lines[l].LineNumber + '-datetime" class=contactDate>&nbsp;</div>';
    html += '<div class=presenceText>' + Lines[l].DisplayName + ' <' + Lines[l].DisplayNumber + '>' + '</div>';
    html += '</div>';
    // SIP.Session.C.STATUS_TERMINATED
    if (Lines[l].SipSession && Lines[l].SipSession.data.earlyReject != true) {
      $('#myContacts').append(html);
      callCount++;
    }
  }

  // End here if they are not using the buddy system
  if (DisableBuddies == true) {
    // If there are no calls, show the dial pad (if you are allowed)
    if (callCount == 0 && DisableFreeDial != true) {
      if (false) {
        if (typeof web_hook_dial_out !== 'undefined') {
          web_hook_dial_out(null);
        }
      } else {
        ShowDial();
      }
    }
    return;
  }

  // Draw a line if there are calls
  if (callCount > 0) {
    $('#myContacts').append('<hr class=hrline>');
  }

  // If there are no buddies, and no calls, then, show the dial pad (if you are allowed)
  if (Buddies.length == 0 && callCount == 0 && DisableFreeDial != true) {
    console.warn('You have no buddies, will show the Dial Screen rather');
    if (false) {
      if (typeof web_hook_dial_out !== 'undefined') {
        web_hook_dial_out(null);
      }
    } else {
      ShowDial();
    }
    return;
  }

  // Sort and filter
  SortBuddies();

  var hiddenBuddies = 0;

  // Display
  for (var b = 0; b < Buddies.length; b++) {
    var buddyObj = Buddies[b];

    if (filter && filter.length >= 1) {
      // Perform Filter Display
      var display = false;
      if (buddyObj.CallerIDName && buddyObj.CallerIDName.toLowerCase().indexOf(filter.toLowerCase()) > -1) display = true;
      if (buddyObj.ExtNo && buddyObj.ExtNo.toLowerCase().indexOf(filter.toLowerCase()) > -1) display = true;
      if (buddyObj.Desc && buddyObj.Desc.toLowerCase().indexOf(filter.toLowerCase()) > -1) display = true;
      if (!display) continue;
    }

    var today = moment.utc();
    var lastActivity = moment.utc(buddyObj.lastActivity.replace(' UTC', ''));
    var displayDateTime = '';
    if (lastActivity.isSame(today, 'day')) {
      displayDateTime = lastActivity.local().format(DisplayTimeFormat);
    } else {
      displayDateTime = lastActivity.local().format(DisplayDateFormat);
    }

    if (HideAutoDeleteBuddies) {
      if (buddyObj.AllowAutoDelete) {
        hiddenBuddies++;
        continue;
      }
    }

    var classStr = buddyObj.IsSelected ? 'buddySelected' : 'buddy';
    if (buddyObj.type == 'extension') {
      var friendlyState = buddyObj.presence;
      if (friendlyState == 'Unknown') friendlyState = lang.state_unknown;
      if (friendlyState == 'Not online') friendlyState = lang.state_not_online;
      if (friendlyState == 'Ready') friendlyState = lang.state_ready;
      if (friendlyState == 'On the phone') friendlyState = lang.state_on_the_phone;
      if (friendlyState == 'Proceeding') friendlyState = lang.state_on_the_phone;
      if (friendlyState == 'Ringing') friendlyState = lang.state_ringing;
      if (friendlyState == 'On hold') friendlyState = lang.state_on_hold;
      if (friendlyState == 'Unavailable') friendlyState = lang.state_unavailable;
      if (buddyObj.EnableSubscribe != true) friendlyState = buddyObj.Desc ? buddyObj.Desc : '';
      var autDeleteStatus = '';
      if (buddyObj.AllowAutoDelete == true) autDeleteStatus = '<i class="fa fa-clock-o"></i> ';
      var html =
        '<div id="contact-' +
        buddyObj.identity +
        '" class=' +
        classStr +
        ' onclick="SelectBuddy(\'' +
        buddyObj.identity +
        "', 'extension')\">";
      html +=
        '<span id="contact-' +
        buddyObj.identity +
        '-missed" class=missedNotifyer style="' +
        (buddyObj.missed && buddyObj.missed > 0 ? '' : 'display:none') +
        '">' +
        buddyObj.missed +
        '</span>';
      html +=
        '<div id="contact-' +
        buddyObj.identity +
        '-picture" class=buddyIcon style="background-image: url(\'' +
        getPicture(buddyObj.identity, buddyObj.type) +
        '\')"></div>';
      html += buddyObj.Pinned ? '<span class=pinnedBuddy><i class="fa fa-thumb-tack"></i></span>' : '';
      html += '<div class=contactNameText>';
      html +=
        '<span id="contact-' +
        buddyObj.identity +
        '-devstate" class="' +
        (buddyObj.EnableSubscribe ? buddyObj.devState : 'dotDefault') +
        '"></span>';
      html += BuddyShowExtenNum == true ? ' ' + buddyObj.ExtNo + ' - ' : ' ';
      html += buddyObj.CallerIDName;
      html += '</div>';
      html += '<div id="contact-' + buddyObj.identity + '-datetime" class=contactDate>' + autDeleteStatus + '' + displayDateTime + '</div>';
      html += '<div id="contact-' + buddyObj.identity + '-presence" class=presenceText>' + friendlyState + '</div>';
      html += '</div>';
      $('#myContacts').append(html);
    } else if (buddyObj.type == 'xmpp') {
      var friendlyState = buddyObj.presenceText;
      var autDeleteStatus = '';
      if (buddyObj.AllowAutoDelete == true) autDeleteStatus = '<i class="fa fa-clock-o"></i> ';
      // NOTE: Set by user could contain malicious code
      friendlyState = friendlyState.replace(/[<>"'\r\n&]/g, function (chr) {
        let table = {
          '<': 'lt',
          '>': 'gt',
          '"': 'quot',
          "'": 'apos',
          '&': 'amp',
          '\r': '#10',
          '\n': '#13',
        };
        return '&' + table[chr] + ';';
      });

      var html =
        '<div id="contact-' +
        buddyObj.identity +
        '" class=' +
        classStr +
        ' onclick="SelectBuddy(\'' +
        buddyObj.identity +
        "', 'extension')\">";
      html +=
        '<span id="contact-' +
        buddyObj.identity +
        '-missed" class=missedNotifyer style="' +
        (buddyObj.missed && buddyObj.missed > 0 ? '' : 'display:none') +
        '">' +
        buddyObj.missed +
        '</span>';
      html +=
        '<div id="contact-' +
        buddyObj.identity +
        '-picture" class=buddyIcon style="background-image: url(\'' +
        getPicture(buddyObj.identity, buddyObj.type) +
        '\')"></div>';
      html += buddyObj.Pinned ? '<span class=pinnedBuddy><i class="fa fa-thumb-tack"></i></span>' : '';
      html += '<div class=contactNameText>';
      html +=
        '<span id="contact-' +
        buddyObj.identity +
        '-devstate" class="' +
        (buddyObj.EnableSubscribe ? buddyObj.devState : 'dotDefault') +
        '"></span>';
      html += BuddyShowExtenNum == true ? ' ' + buddyObj.ExtNo + ' - ' : ' ';
      html += buddyObj.CallerIDName;
      html += '</div>';
      html += '<div id="contact-' + buddyObj.identity + '-datetime" class=contactDate>' + autDeleteStatus + '' + displayDateTime + '</div>';
      html +=
        '<div id="contact-' +
        buddyObj.identity +
        '-presence" class=presenceText><i class="fa fa-comments"></i> ' +
        friendlyState +
        '</div>';
      html +=
        '<div id="contact-' +
        buddyObj.identity +
        '-chatstate-menu" class=presenceText style="display:none"><i class="fa fa-commenting-o"></i> ' +
        buddyObj.CallerIDName +
        ' ' +
        lang.is_typing +
        '...</div>';
      html += '</div>';
      $('#myContacts').append(html);
    } else if (buddyObj.type == 'contact') {
      var autDeleteStatus = '';
      if (buddyObj.AllowAutoDelete == true) autDeleteStatus = '<i class="fa fa-clock-o"></i> ';
      var html =
        '<div id="contact-' +
        buddyObj.identity +
        '" class=' +
        classStr +
        ' onclick="SelectBuddy(\'' +
        buddyObj.identity +
        "', 'contact')\">";
      html +=
        '<span id="contact-' +
        buddyObj.identity +
        '-missed" class=missedNotifyer style="' +
        (buddyObj.missed && buddyObj.missed > 0 ? '' : 'display:none') +
        '">' +
        buddyObj.missed +
        '</span>';
      html +=
        '<div id="contact-' +
        buddyObj.identity +
        '-picture" class=buddyIcon style="background-image: url(\'' +
        getPicture(buddyObj.identity, buddyObj.type) +
        '\')"></div>';
      html += buddyObj.Pinned ? '<span class=pinnedBuddy><i class="fa fa-thumb-tack"></i></span>' : '';
      html += '<div class=contactNameText><i class="fa fa-address-card"></i> ' + buddyObj.CallerIDName + '</div>';
      html += '<div id="contact-' + buddyObj.identity + '-datetime" class=contactDate>' + autDeleteStatus + '' + displayDateTime + '</div>';
      html += '<div class=presenceText>' + buddyObj.Desc + '</div>';
      html += '</div>';
      $('#myContacts').append(html);
    } else if (buddyObj.type == 'group') {
      var autDeleteStatus = '';
      if (buddyObj.AllowAutoDelete == true) autDeleteStatus = '<i class="fa fa-clock-o"></i> ';
      var html =
        '<div id="contact-' + buddyObj.identity + '" class=' + classStr + ' onclick="SelectBuddy(\'' + buddyObj.identity + "', 'group')\">";
      html +=
        '<span id="contact-' +
        buddyObj.identity +
        '-missed" class=missedNotifyer style="' +
        (buddyObj.missed && buddyObj.missed > 0 ? '' : 'display:none') +
        '">' +
        buddyObj.missed +
        '</span>';
      html +=
        '<div id="contact-' +
        buddyObj.identity +
        '-picture" class=buddyIcon style="background-image: url(\'' +
        getPicture(buddyObj.identity, buddyObj.type) +
        '\')"></div>';
      html += buddyObj.Pinned ? '<span class=pinnedBuddy><i class="fa fa-thumb-tack"></i></span>' : '';
      html += '<div class=contactNameText><i class="fa fa-users"></i> ' + buddyObj.CallerIDName + '</div>';
      html += '<div id="contact-' + buddyObj.identity + '-datetime" class=contactDate>' + autDeleteStatus + '' + displayDateTime + '</div>';
      html += '<div class=presenceText>' + buddyObj.Desc + '</div>';
      html += '</div>';
      $('#myContacts').append(html);
    }
  }
  if (hiddenBuddies > 0) {
    console.warn('Auto Delete Buddies not shown', hiddenBuddies);
    var html = '<div id=hiddenBuddies class=hiddenBuddiesText>(' + lang.sort_no_showing.replace('{0}', hiddenBuddies) + ')</div>';
    $('#myContacts').append(html);
    $('#hiddenBuddies').on('click', function () {
      HideAutoDeleteBuddies = false;
      // Show now, but leave default set in storage
      UpdateBuddyList();
    });
  }

  // Make Select
  // ===========
  for (var b = 0; b < Buddies.length; b++) {
    if (Buddies[b].IsSelected) {
      SelectBuddy(Buddies[b].identity, Buddies[b].type);
      break;
    }
  }
}
function InitUserBuddies() {
  var template = { TotalRows: 0, DataCollection: [] };
  localStorage.setItem(profileUserID + '-Buddies', JSON.stringify(template));
  return JSON.parse(localStorage.getItem(profileUserID + '-Buddies'));
}
function uID() {
  return (
    Date.now() +
    Math.floor(Math.random() * 10000)
      .toString(16)
      .toUpperCase()
  );
}
function getDbItem(itemIndex, defaultValue) {
  if (localStorage.getItem(itemIndex) != null) return localStorage.getItem(itemIndex);
  return defaultValue;
}
function utcDateNow() {
  return moment().utc().format('YYYY-MM-DD HH:mm:ss UTC');
}
function getAudioSrcID() {
  var id = localStorage.getItem('AudioSrcId');
  return id != null ? id : 'default';
}
function getAudioOutputID() {
  var id = localStorage.getItem('AudioOutputId');
  return id != null ? id : 'default';
}
function getVideoSrcID() {
  var id = localStorage.getItem('VideoSrcId');
  return id != null ? id : 'default';
}
function getRingerOutputID() {
  var id = localStorage.getItem('RingOutputId');
  return id != null ? id : 'default';
}
function formatShortDuration(seconds) {
  var sec = Math.floor(parseFloat(seconds));
  if (sec < 0) {
    return sec;
  } else if (sec >= 0 && sec < 60) {
    return '00:' + (sec > 9 ? sec : '0' + sec);
  } else if (sec >= 60 && sec < 60 * 60) {
    // greater then a minute and less then an hour
    var duration = moment.duration(sec, 'seconds');
    return (
      (duration.minutes() > 9 ? duration.minutes() : '0' + duration.minutes()) +
      ':' +
      (duration.seconds() > 9 ? duration.seconds() : '0' + duration.seconds())
    );
  } else if (sec >= 60 * 60 && sec < 24 * 60 * 60) {
    // greater than an hour and less then a day
    var duration = moment.duration(sec, 'seconds');
    return (
      (duration.hours() > 9 ? duration.hours() : '0' + duration.hours()) +
      ':' +
      (duration.minutes() > 9 ? duration.minutes() : '0' + duration.minutes()) +
      ':' +
      (duration.seconds() > 9 ? duration.seconds() : '0' + duration.seconds())
    );
  }
  //  Otherwise.. this is just too long
}
function SortBuddies() {
  // Firstly: Type - Second: Last Activity
  if (BuddySortBy == 'type') {
    Buddies.sort(function (a, b) {
      var aMo = moment.utc(a.lastActivity.replace(' UTC', ''));
      var bMo = moment.utc(b.lastActivity.replace(' UTC', ''));
      // contact | extension | (group) | xmpp
      var aType = a.type;
      var bType = b.type;
      // No groups for now
      if (SortByTypeOrder == 'c|e|x') {
        if (a.type == 'contact') aType = 'A';
        if (b.type == 'contact') bType = 'A';
        if (a.type == 'extension') aType = 'B';
        if (b.type == 'extension') bType = 'B';
        if (a.type == 'xmpp') aType = 'C';
        if (b.type == 'xmpp') bType = 'C';
      }
      if (SortByTypeOrder == 'c|x|e') {
        if (a.type == 'contact') aType = 'A';
        if (b.type == 'contact') bType = 'A';
        if (a.type == 'extension') aType = 'C';
        if (b.type == 'extension') bType = 'C';
        if (a.type == 'xmpp') aType = 'B';
        if (b.type == 'xmpp') bType = 'B';
      }
      if (SortByTypeOrder == 'x|e|c') {
        if (a.type == 'contact') aType = 'C';
        if (b.type == 'contact') bType = 'C';
        if (a.type == 'extension') aType = 'B';
        if (b.type == 'extension') bType = 'B';
        if (a.type == 'xmpp') aType = 'A';
        if (b.type == 'xmpp') bType = 'A';
      }
      if (SortByTypeOrder == 'x|c|e') {
        if (a.type == 'contact') aType = 'B';
        if (b.type == 'contact') bType = 'B';
        if (a.type == 'extension') aType = 'C';
        if (b.type == 'extension') bType = 'C';
        if (a.type == 'xmpp') aType = 'A';
        if (b.type == 'xmpp') bType = 'A';
      }
      if (SortByTypeOrder == 'e|x|c') {
        if (a.type == 'contact') aType = 'C';
        if (b.type == 'contact') bType = 'C';
        if (a.type == 'extension') aType = 'A';
        if (b.type == 'extension') bType = 'A';
        if (a.type == 'xmpp') aType = 'B';
        if (b.type == 'xmpp') bType = 'B';
      }
      if (SortByTypeOrder == 'e|c|x') {
        if (a.type == 'contact') aType = 'B';
        if (b.type == 'contact') bType = 'A';
        if (a.type == 'extension') aType = 'A';
        if (b.type == 'extension') bType = 'A';
        if (a.type == 'xmpp') aType = 'C';
        if (b.type == 'xmpp') bType = 'C';
      }

      return aType.localeCompare(bType) || (aMo.isSameOrAfter(bMo, 'second') ? -1 : 1);
    });
  }

  // Extension Number (or Contact Number) - Second: Last Activity
  if (BuddySortBy == 'extension') {
    Buddies.sort(function (a, b) {
      var aSortBy = a.type == 'extension' || a.type == 'xmpp' ? a.ExtNo : a.ContactNumber1;
      var bSortBy = b.type == 'extension' || b.type == 'xmpp' ? b.ExtNo : a.ContactNumber1;
      var aMo = moment.utc(a.lastActivity.replace(' UTC', ''));
      var bMo = moment.utc(b.lastActivity.replace(' UTC', ''));
      return aSortBy.localeCompare(bSortBy) || (aMo.isSameOrAfter(bMo, 'second') ? -1 : 1);
    });
  }

  // Name Alphabetically - Second: Last Activity
  if (BuddySortBy == 'alphabetical') {
    Buddies.sort(function (a, b) {
      var aMo = moment.utc(a.lastActivity.replace(' UTC', ''));
      var bMo = moment.utc(b.lastActivity.replace(' UTC', ''));
      return a.CallerIDName.localeCompare(b.CallerIDName) || (aMo.isSameOrAfter(bMo, 'second') ? -1 : 1);
    });
  }

  // Last Activity Only
  if (BuddySortBy == 'activity') {
    Buddies.sort(function (a, b) {
      var aMo = moment.utc(a.lastActivity.replace(' UTC', ''));
      var bMo = moment.utc(b.lastActivity.replace(' UTC', ''));
      return aMo.isSameOrAfter(bMo, 'second') ? -1 : 1;
    });
  }

  // Second Sorts

  // Sort Auto Delete
  if (BuddyAutoDeleteAtEnd == true) {
    Buddies.sort(function (a, b) {
      return a.AllowAutoDelete === b.AllowAutoDelete ? 0 : a.AllowAutoDelete ? 1 : -1;
    });
  }
  // Sort Out Pinned
  Buddies.sort(function (a, b) {
    return a.Pinned === b.Pinned ? 0 : a.Pinned ? -1 : 1;
  });
}
function getPicture(buddy, typestr, ignoreCache) {
  var avatars = defaultAvatars.split(',');
  var rndInt = Math.floor(Math.random() * avatars.length);
  var defaultImg = hostingPrefix + '' + imagesDirectory + '' + avatars[rndInt].trim();
  if (buddy == 'profilePicture') {
    // Special handling for profile image
    var dbImg = localStorage.getItem('profilePicture');
    if (dbImg == null) {
      return defaultImg;
    } else {
      return dbImg;
      // return URL.createObjectURL(base64toBlob(dbImg, 'image/png'));
    }
  }

  typestr = typestr ? typestr : 'extension';
  var buddyObj = FindBuddyByIdentity(buddy);
  if (buddyObj == null) {
    return defaultImg;
  }
  if (ignoreCache != true && buddyObj.imageObjectURL != '') {
    // Use Cache
    return buddyObj.imageObjectURL;
  }
  var dbImg = localStorage.getItem('img-' + buddy + '-' + typestr);
  if (dbImg == null) {
    buddyObj.imageObjectURL = defaultImg;
    return buddyObj.imageObjectURL;
  } else {
    buddyObj.imageObjectURL = URL.createObjectURL(base64toBlob(dbImg, 'image/webp')); // image/png
    return buddyObj.imageObjectURL;
  }
}
function AddBuddyMessageStream(buddyObj) {
  // Profile Etc Row
  // ----------------------------------------------------------
  var profileRow = '';
  profileRow +=
    '<tr><td id="contact-' +
    buddyObj.identity +
    '-ProfileCell" class="streamSection highlightSection buddyProfileSection" style="height: 50px; box-sizing: border-box;">';

  // Left Content - Profile
  profileRow += '<table cellpadding=0 cellspacing=0 border=0 style="width:100%; table-layout: fixed;">';
  profileRow += '<tr>';
  // Close|Return|Back Button
  profileRow += '<td style="width:38px; text-align: center;">';
  profileRow +=
    '<button id="contact-' +
    buddyObj.identity +
    '-btn-back" onclick="CloseBuddy(\'' +
    buddyObj.identity +
    '\')" class=roundButtons style="margin-right:5px" title="' +
    lang.back +
    '"><i class="fa fa-chevron-left"></i></button> ';
  profileRow += '</td>';

  // Profile UI
  profileRow += '<td style="width:100%">';
  profileRow += '<div class=contact style="cursor: unset; padding:0px">';
  if (buddyObj.type == 'extension' || buddyObj.type == 'xmpp') {
    profileRow +=
      '<div id="contact-' +
      buddyObj.identity +
      '-picture-main" class=buddyIcon style="background-image: url(\'' +
      getPicture(buddyObj.identity) +
      '\')"></div>';
  } else if (buddyObj.type == 'contact') {
    profileRow +=
      '<div id="contact-' +
      buddyObj.identity +
      '-picture-main" class=buddyIcon style="background-image: url(\'' +
      getPicture(buddyObj.identity, 'contact') +
      '\')"></div>';
  } else if (buddyObj.type == 'group') {
    profileRow +=
      '<div id="contact-' +
      buddyObj.identity +
      '-picture-main" class=buddyIcon style="background-image: url(\'' +
      getPicture(buddyObj.identity, 'group') +
      '\')"></div>';
  }
  // Caller ID
  if (buddyObj.type == 'extension' || buddyObj.type == 'xmpp') {
    profileRow += '<div class=contactNameText style="margin-right: 0px;">';
    profileRow += '<span id="contact-' + buddyObj.identity + '-devstate-main" class="' + buddyObj.devState + '"></span>';
    profileRow += ' <span id="contact-' + buddyObj.identity + '-name">' + buddyObj.CallerIDName + '</span>';
    profileRow += '</div>';
  } else if (buddyObj.type == 'contact') {
    profileRow += '<div class=contactNameText style="margin-right: 0px;">';
    profileRow += '<i class="fa fa-address-card"></i>';
    profileRow += ' <span id="contact-' + buddyObj.identity + '-name">' + buddyObj.CallerIDName + '</span>';
    profileRow += '</div>';
  } else if (buddyObj.type == 'group') {
    profileRow += '<div class=contactNameText style="margin-right: 0px;">';
    profileRow += '<i class="fa fa-users"></i>';
    profileRow += ' <span id="contact-' + buddyObj.identity + '-name">' + buddyObj.CallerIDName + '</span>';
    profileRow += '</div>';
  }
  // Presence
  if (buddyObj.type == 'extension') {
    var friendlyState = buddyObj.presence;
    if (friendlyState == 'Unknown') friendlyState = lang.state_unknown;
    if (friendlyState == 'Not online') friendlyState = lang.state_not_online;
    if (friendlyState == 'Ready') friendlyState = lang.state_ready;
    if (friendlyState == 'On the phone') friendlyState = lang.state_on_the_phone;
    if (friendlyState == 'Ringing') friendlyState = lang.state_ringing;
    if (friendlyState == 'On hold') friendlyState = lang.state_on_hold;
    if (friendlyState == 'Unavailable') friendlyState = lang.state_unavailable;
    profileRow += '<div id="contact-' + buddyObj.identity + '-presence-main" class=presenceText>' + friendlyState + '</div>';
  } else if (buddyObj.type == 'xmpp') {
    profileRow +=
      '<div id="contact-' +
      buddyObj.identity +
      '-presence-main" class=presenceText><i class="fa fa-comments"></i> ' +
      buddyObj.presenceText +
      '</div>';
    profileRow +=
      '<div id="contact-' +
      buddyObj.identity +
      '-chatstate-main" class=presenceText style="display:none"><i class="fa fa-commenting-o"></i> ' +
      buddyObj.CallerIDName +
      ' ' +
      lang.is_typing +
      '...</div>';
  } else {
    profileRow += '<div id="contact-' + buddyObj.identity + '-presence-main" class=presenceText>' + buddyObj.Desc + '</div>';
  }
  profileRow += '</div>';
  profileRow += '</td>';

  // Right Content - Action Buttons
  var buttonsWidth = 80; // 1 button = 34px ~40px
  if ((buddyObj.type == 'extension' || buddyObj.type == 'xmpp') && EnableVideoCalling == true) {
    buttonsWidth = 120;
  }
  var fullButtonsWidth = 200;
  if ((buddyObj.type == 'extension' || buddyObj.type == 'xmpp') && EnableVideoCalling == true) {
    fullButtonsWidth = 240;
  }
  profileRow += '<td id="contact-' + buddyObj.identity + '-action-buttons" style="width: ' + buttonsWidth + 'px; text-align: right">';
  profileRow +=
    '<button id="contact-' +
    buddyObj.identity +
    '-btn-audioCall" onclick="AudioCallMenu(\'' +
    buddyObj.identity +
    '\', this)" class=roundButtons title="' +
    lang.audio_call +
    '"><i class="fa fa-phone"></i></button>';
  if ((buddyObj.type == 'extension' || buddyObj.type == 'xmpp') && EnableVideoCalling == true) {
    profileRow +=
      ' <button id="contact-' +
      buddyObj.identity +
      "-btn-videoCall\" onclick=\"DialByLine('video', '" +
      buddyObj.identity +
      "', '" +
      buddyObj.ExtNo +
      '\');" class=roundButtons title="' +
      lang.video_call +
      '"><i class="fa fa-video-camera"></i></button>';
  }
  profileRow += '<span id="contact-' + buddyObj.identity + '-extra-buttons" style="display:none">';
  profileRow +=
    ' <button id="contact-' +
    buddyObj.identity +
    '-btn-edit" onclick="EditBuddyWindow(\'' +
    buddyObj.identity +
    '\')" class=roundButtons title="' +
    lang.edit +
    '"><i class="fa fa-pencil"></i></button>';
  profileRow +=
    ' <button id="contact-' +
    buddyObj.identity +
    '-btn-search" onclick="FindSomething(\'' +
    buddyObj.identity +
    '\')" class=roundButtons title="' +
    lang.find_something +
    '"><i class="fa fa-search"></i></button>';
  profileRow +=
    ' <button id="contact-' +
    buddyObj.identity +
    '-btn-pin" onclick="TogglePinned(\'' +
    buddyObj.identity +
    '\')" class=roundButtons title="' +
    lang.pin_to_top +
    '"><i class="fa fa-thumb-tack"></i></button>';
  profileRow += '</span>';
  profileRow +=
    ' <button id="contact-' +
    buddyObj.identity +
    '-btn-toggle-extra" onclick="ToggleExtraButtons(\'' +
    buddyObj.identity +
    "', " +
    buttonsWidth +
    ', ' +
    fullButtonsWidth +
    ')" class=roundButtons><i class="fa fa-ellipsis-h"></i></button>';
  profileRow += '</td>';

  profileRow += '</tr></table>';
  profileRow += '</div>';

  // Separator
  profileRow += '<div style="clear:both; height:0px"></div>';

  // Search & Related Elements
  profileRow += '<div id="contact-' + buddyObj.identity + '-search" style="margin-top:6px; display:none">';
  profileRow +=
    '<span class=searchClean style="width:100%"><input type=text style="width: calc(100% - 40px);" autocomplete=none oninput=SearchStream(this,\'' +
    buddyObj.identity +
    '\') placeholder="' +
    lang.find_something_in_the_message_stream +
    '"></span>';
  profileRow += '</div>';

  profileRow += '</td></tr>';

  // Messages Row
  // ----------------------------------------------------------
  var messagesRow = '';
  messagesRow +=
    '<tr><td id="contact-' +
    buddyObj.identity +
    '-MessagesCell" class="streamSection streamSectionBackground wallpaperBackground buddyMessageSection">';
  messagesRow +=
    '<div id="contact-' +
    buddyObj.identity +
    '-ChatHistory" class="chatHistory cleanScroller" ondragenter="setupDragDrop(event, \'' +
    buddyObj.identity +
    '\')" ondragover="setupDragDrop(event, \'' +
    buddyObj.identity +
    '\')" ondragleave="cancelDragDrop(event, \'' +
    buddyObj.identity +
    '\')" ondrop="onFileDragDrop(event, \'' +
    buddyObj.identity +
    '\')">';
  // Previous Chat messages
  messagesRow += '</div>';
  messagesRow += '</td></tr>';

  // Interaction row
  // ----------------------------------------------------------
  var textRow = '';
  if ((buddyObj.type == 'extension' || buddyObj.type == 'xmpp' || buddyObj.type == 'group') && EnableTextMessaging) {
    textRow +=
      '<tr><td id="contact-' +
      buddyObj.identity +
      '-InteractionCell" class="streamSection highlightSection buddyInteractionSection" style="height:80px">';

    // Send Paste Image
    textRow +=
      '<div id="contact-' + buddyObj.identity + '-imagePastePreview" class=sendImagePreview style="display:none" tabindex=0></div>';
    // Preview
    textRow += '<div id="contact-' + buddyObj.identity + '-msgPreview" class=sendMessagePreview style="display:none">';
    textRow += '<table class=sendMessagePreviewContainer cellpadding=0 cellspacing=0><tr>';
    textRow +=
      '<td style="text-align:right"><div id="contact-' +
      buddyObj.identity +
      '-msgPreviewhtml" class="sendMessagePreviewHtml cleanScroller"></div></td>';
    textRow +=
      '<td style="width:40px"><button onclick="SendChatMessage(\'' +
      buddyObj.identity +
      '\')" class="roundButtons" title="' +
      lang.send +
      '"><i class="fa fa-paper-plane"></i></button></td>';
    textRow += '</tr></table>';
    textRow += '</div>';

    // Send File
    textRow += '<div id="contact-' + buddyObj.identity + '-fileShare" style="display:none">';
    textRow += '<input type=file multiple onchange="console.log(this)" />';
    textRow += '</div>';

    // Send Audio Recording
    textRow += '<div id="contact-' + buddyObj.identity + '-audio-recording" style="display:none"></div>';

    // Send Video Recording
    textRow += '<div id="contact-' + buddyObj.identity + '-video-recording" style="display:none"></div>';

    // Dictate Message
    textRow += '<div id="contact-' + buddyObj.identity + '-dictate-message" style="display:none"></div>';

    // Emoji Menu Bar
    textRow += '<div id="contact-' + buddyObj.identity + '-emoji-menu" style="display:none"></div>';

    // ChatState
    textRow +=
      '<div id="contact-' +
      buddyObj.identity +
      '-chatstate" style="display:none"><i class="fa fa-commenting-o"></i> ' +
      buddyObj.CallerIDName +
      ' ' +
      lang.is_typing +
      '...</div>';

    // Type Area
    textRow += '<table class=sendMessageContainer cellpadding=0 cellspacing=0><tr>';
    textRow +=
      '<td id="contact-' +
      buddyObj.identity +
      '-add-menu" class=MessageActions style="width:40px"><button onclick="AddMenu(this, \'' +
      buddyObj.identity +
      '\')" class=roundButtons title="' +
      lang.menu +
      '"><i class="fa fa-ellipsis-h"></i></button></td>';
    textRow +=
      '<td><textarea id="contact-' +
      buddyObj.identity +
      '-ChatMessage" class="chatMessage cleanScroller" placeholder="' +
      lang.type_your_message_here +
      '" onkeydown="chatOnkeydown(event, this,\'' +
      buddyObj.identity +
      '\')" oninput="chatOnInput(event, this,\'' +
      buddyObj.identity +
      '\')" onpaste="chatOnbeforepaste(event, this,\'' +
      buddyObj.identity +
      '\')"></textarea></td>';
    textRow +=
      '<td id="contact-' +
      buddyObj.identity +
      '-sendMessageButtons" style="width:40px; display:none"><button onclick="SendChatMessage(\'' +
      buddyObj.identity +
      '\')" class="roundButtons" title="' +
      lang.send +
      '"><i class="fa fa-paper-plane"></i></button></td>';
    textRow += '</tr></table>';

    textRow += '</td></tr>';
  }

  var html = '<table id="stream-' + buddyObj.identity + '" class=stream cellspacing=0 cellpadding=0>';
  if (UiMessageLayout == 'top') {
    html += messagesRow;
    html += profileRow;
  } else {
    html += profileRow;
    html += messagesRow;
  }
  html += textRow;
  html += '</table>';

  $('#rightContent').append(html);
  if (UiMessageLayout == 'top') {
    $('#contact-' + buddyObj.identity + '-MessagesCell').addClass('');
    $('#contact-' + buddyObj.identity + '-ProfileCell').addClass('sectionBorderTop');
    $('#contact-' + buddyObj.identity + '-InteractionCell').addClass('');
  } else {
    $('#contact-' + buddyObj.identity + '-ProfileCell').addClass('sectionBorderBottom');
    $('#contact-' + buddyObj.identity + '-MessagesCell').addClass('');
    $('#contact-' + buddyObj.identity + '-InteractionCell').addClass('sectionBorderTop');
  }
}
function CleanupBuddies() {
  if (MaxBuddyAge > 1 || MaxBuddies > 1) {
    // Sort According to .lastActivity
    Buddies.sort(function (a, b) {
      var aMo = moment.utc(a.lastActivity.replace(' UTC', ''));
      var bMo = moment.utc(b.lastActivity.replace(' UTC', ''));
      if (aMo.isSameOrAfter(bMo, 'second')) {
        return -1;
      } else return 1;
      return 0;
    });

    if (MaxBuddyAge > 1) {
      var expiredDate = moment.utc().subtract(MaxBuddyAge, 'days');
      console.log('Running Buddy Cleanup for activity older than: ', expiredDate.format(DisplayDateFormat + ' ' + DisplayTimeFormat));
      for (var b = Buddies.length - 1; b >= 0; b--) {
        var lastActivity = moment.utc(Buddies[b].lastActivity.replace(' UTC', ''));
        if (lastActivity.isSameOrAfter(expiredDate, 'second')) {
          // This one is fine
        } else {
          // Too Old
          if (Buddies[b].AllowAutoDelete == true) {
            console.warn('This buddy is too old, and will be deleted: ', lastActivity.format(DisplayDateFormat + ' ' + DisplayTimeFormat));
            DoRemoveBuddy(Buddies[b].identity);
          }
        }
      }
    }
    if (MaxBuddies > 1 && MaxBuddies < Buddies.length) {
      console.log('Running Buddy Cleanup for buddies more than: ', MaxBuddies);
      for (var b = Buddies.length - 1; b >= MaxBuddies; b--) {
        if (Buddies[b].AllowAutoDelete == true) {
          console.warn('This buddy is too Many, and will be deleted: ', Buddies[b].identity);
          DoRemoveBuddy(Buddies[b].identity);
        }
      }
    }
  }
}
function AddLineHtml(lineObj, direction) {
  var avatar = 'avatars/default.5.webp';
  var html = '';

  // Audio Activity
  html += '<div style="float:right; line-height: 46px;">';
  html += '<div  id="line-' + lineObj.LineNumber + '-monitoring" style="margin-right:10px">';
  html += '<span style="vertical-align: middle"><i class="fa fa-microphone"></i></span> ';
  html += '<span class=meterContainer title="' + lang.microphone_levels + '">';
  html += '<span id="line-' + lineObj.LineNumber + '-Mic" class=meterLevel style="height:0%"></span>';
  html += '</span> ';
  html += '<span style="vertical-align: middle"><i class="fa fa-volume-up"></i></span> ';
  html += '<span class=meterContainer title="' + lang.speaker_levels + '">';
  html += '<span id="line-' + lineObj.LineNumber + '-Speaker" class=meterLevel style="height:0%"></span>';
  html += '</span> ';
  html += '</div>';
  html += '</div>';

  // Remote Audio Object
  html += '<div style="display:none;">';
  html += '<audio id="line-' + lineObj.LineNumber + '-remoteAudio"></audio>';
  html += '</div>';

  // Call Answer UI
  html += '<div class=callingDisplayName>' + lineObj.DisplayName + '</div>';
  html += '<div class=callingDisplayNumber>' + lineObj.DisplayNumber + '</div>';
  html += '<div class=answerCall>';
  html +=
    '<button onclick="AnswerAudioCall(\'' +
    lineObj.LineNumber +
    '\')" class=answerButton><i class="fa fa-phone"></i> ' +
    lang.answer_call +
    '</button> ';
  html +=
    ' <button onclick="RejectCall(\'' +
    lineObj.LineNumber +
    '\')" class=rejectButton><i class="fa fa-phone" style="transform: rotate(135deg);"></i> ' +
    lang.reject_call +
    '</button> ';
  html += '</div>';

  // In Call Control
  // ===============
  html += '<div class=CallControlContainer>';
  // Mute
  html +=
    '<button id="line-' +
    lineObj.LineNumber +
    '-btn-Mute" onclick="MuteSession(\'' +
    lineObj.LineNumber +
    '\')" class="roundButtons dialButtons inCallButtons" title="' +
    lang.mute +
    '"><i class="fa fa-microphone-slash"></i></button>';
  html +=
    '<button id="line-' +
    lineObj.LineNumber +
    '-btn-Unmute" onclick="UnmuteSession(\'' +
    lineObj.LineNumber +
    '\')" class="roundButtons dialButtons inCallButtons" title="' +
    lang.unmute +
    '" style="color: red; display:none"><i class="fa fa-microphone"></i></button>';
  // Hold
  html +=
    '<button id="line-' +
    lineObj.LineNumber +
    '-btn-Hold" onclick="holdSession(\'' +
    lineObj.LineNumber +
    '\')" class="roundButtons dialButtons inCallButtons"  title="' +
    lang.hold_call +
    '"><i class="fa fa-pause-circle"></i></button>';
  html +=
    '<button id="line-' +
    lineObj.LineNumber +
    '-btn-Unhold" onclick="unholdSession(\'' +
    lineObj.LineNumber +
    '\')" class="roundButtons dialButtons inCallButtons" title="' +
    lang.resume_call +
    '" style="color: red; display:none"><i class="fa fa-play-circle"></i></button>';
  // End Call
  html +=
    '<button id="line-' +
    lineObj.LineNumber +
    '-btn-End" onclick="endSession(\'' +
    lineObj.LineNumber +
    '\')" class="roundButtons dialButtons inCallButtons hangupButton" title="' +
    lang.end_call +
    '"><i class="fa fa-phone" style="transform: rotate(135deg);"></i></button>';
  html += '</div>';

  $('#rightContent').append(html);
}
function SelectLine(lineNum) {
  var lineObj = FindLineByNumber(lineNum);
  if (lineObj == null) return;

  var displayLineNumber = 0;
  for (var l = 0; l < Lines.length; l++) {
    if (Lines[l].LineNumber == lineObj.LineNumber) displayLineNumber = l + 1;
    if (Lines[l].IsSelected == true && Lines[l].LineNumber == lineObj.LineNumber) {
      // Nothing to do, you re-selected the same buddy;
      return;
    }
  }

  console.log('Selecting Line : ' + lineObj.LineNumber);

  // Can only display one thing on the Right
  $('.streamSelected').each(function () {
    $(this).prop('class', 'stream');
  });
  $('#line-ui-' + lineObj.LineNumber).prop('class', 'streamSelected');

  $('#line-ui-' + lineObj.LineNumber + '-DisplayLineNo').html('<i class="fa fa-phone"></i> ' + lang.line + ' ' + displayLineNumber);
  $('#line-ui-' + lineObj.LineNumber + '-LineIcon').html(displayLineNumber);

  // Switch the SIP Sessions
  SwitchLines(lineObj.LineNumber);

  // Update Lines List
  for (var l = 0; l < Lines.length; l++) {
    var classStr = Lines[l].LineNumber == lineObj.LineNumber ? 'buddySelected' : 'buddy';
    if (Lines[l].SipSession != null) classStr = Lines[l].SipSession.isOnHold ? 'buddyActiveCallHollding' : 'buddyActiveCall';

    $('#line-' + Lines[l].LineNumber).prop('class', classStr);
    Lines[l].IsSelected = Lines[l].LineNumber == lineObj.LineNumber;
  }
  // Update Buddy List
  for (var b = 0; b < Buddies.length; b++) {
    $('#contact-' + Buddies[b].identity).prop('class', 'buddy');
    Buddies[b].IsSelected = false;
  }

  // Change to Stream if in Narrow view
  UpdateUI();
}
function FindLineByNumber(lineNum) {
  for (var l = 0; l < Lines.length; l++) {
    if (Lines[l].LineNumber == lineNum) return Lines[l];
  }
  return null;
}
function SwitchLines(lineNum) {
  $.each(userAgent.sessions, function (i, session) {
    // All the other calls, not on hold
    if (session.state == SIP.SessionState.Established) {
      if (session.isOnHold == false && session.data.line != lineNum) {
        holdSession(session.data.line);
      }
    }
    session.data.IsCurrentCall = false;
  });

  var lineObj = FindLineByNumber(lineNum);
  if (lineObj != null && lineObj.SipSession != null) {
    var session = lineObj.SipSession;
    if (session.state == SIP.SessionState.Established) {
      if (session.isOnHold == true) {
        unholdSession(lineNum);
      }
    }
    session.data.IsCurrentCall = true;
  }
  selectedLine = lineNum;

  RefreshLineActivity(lineNum);
}
function RefreshLineActivity(lineNum) {
  var lineObj = FindLineByNumber(lineNum);
  if (lineObj == null || lineObj.SipSession == null) {
    return;
  }
  var session = lineObj.SipSession;

  $('#line-' + lineNum + '-CallDetails').empty();

  var callDetails = [];

  var ringTime = 0;
  var CallStart = moment.utc(session.data.callstart.replace(' UTC', ''));
  var CallAnswer = null;
  if (session.data.startTime) {
    CallAnswer = moment.utc(session.data.startTime);
    ringTime = moment.duration(CallAnswer.diff(CallStart));
  }
  CallStart = CallStart.format('YYYY-MM-DD HH:mm:ss UTC');
  (CallAnswer = CallAnswer ? CallAnswer.format('YYYY-MM-DD HH:mm:ss UTC') : null), (ringTime = ringTime != 0 ? ringTime.asSeconds() : 0);

  var srcCallerID = '';
  var dstCallerID = '';
  if (session.data.calldirection == 'inbound') {
    srcCallerID = '<' + session.remoteIdentity.uri.user + '> ' + session.remoteIdentity.displayName;
  } else if (session.data.calldirection == 'outbound') {
    dstCallerID = session.data.dst;
  }

  var withVideo = session.data.withvideo ? '(' + lang.with_video + ')' : '';
  var startCallMessage =
    session.data.calldirection == 'inbound'
      ? lang.you_received_a_call_from + ' ' + srcCallerID + ' ' + withVideo
      : lang.you_made_a_call_to + ' ' + dstCallerID + ' ' + withVideo;
  callDetails.push({
    Message: startCallMessage,
    TimeStr: CallStart,
  });
  if (CallAnswer) {
    var answerCallMessage =
      session.data.calldirection == 'inbound'
        ? lang.you_answered_after + ' ' + ringTime + ' ' + lang.seconds_plural
        : lang.they_answered_after + ' ' + ringTime + ' ' + lang.seconds_plural;
    callDetails.push({
      Message: answerCallMessage,
      TimeStr: CallAnswer,
    });
  }

  var Transfers = session.data.transfer ? session.data.transfer : [];
  $.each(Transfers, function (item, transfer) {
    var msg =
      transfer.type == 'Blind'
        ? lang.you_started_a_blind_transfer_to + ' ' + transfer.to + '. '
        : lang.you_started_an_attended_transfer_to + ' ' + transfer.to + '. ';
    if (transfer.accept && transfer.accept.complete == true) {
      msg += lang.the_call_was_completed;
    } else if (transfer.accept.disposition != '') {
      msg += lang.the_call_was_not_completed + ' (' + transfer.accept.disposition + ')';
    }
    callDetails.push({
      Message: msg,
      TimeStr: transfer.transferTime,
    });
  });
  var Mutes = session.data.mute ? session.data.mute : [];
  $.each(Mutes, function (item, mute) {
    callDetails.push({
      Message: mute.event == 'mute' ? lang.you_put_the_call_on_mute : lang.you_took_the_call_off_mute,
      TimeStr: mute.eventTime,
    });
  });
  var Holds = session.data.hold ? session.data.hold : [];
  $.each(Holds, function (item, hold) {
    callDetails.push({
      Message: hold.event == 'hold' ? lang.you_put_the_call_on_hold : lang.you_took_the_call_off_hold,
      TimeStr: hold.eventTime,
    });
  });
  var ConfbridgeEvents = session.data.ConfbridgeEvents ? session.data.ConfbridgeEvents : [];
  $.each(ConfbridgeEvents, function (item, event) {
    callDetails.push({
      Message: event.event,
      TimeStr: event.eventTime,
    });
  });
  var Recordings = session.data.recordings ? session.data.recordings : [];
  $.each(Recordings, function (item, recording) {
    var msg = lang.call_is_being_recorded;
    if (recording.startTime != recording.stopTime) {
      msg += '(' + lang.now_stopped + ')';
    }
    callDetails.push({
      Message: msg,
      TimeStr: recording.startTime,
    });
  });
  var ConfCalls = session.data.confcalls ? session.data.confcalls : [];
  $.each(ConfCalls, function (item, confCall) {
    var msg = lang.you_started_a_conference_call_to + ' ' + confCall.to + '. ';
    if (confCall.accept && confCall.accept.complete == true) {
      msg += lang.the_call_was_completed;
    } else if (confCall.accept.disposition != '') {
      msg += lang.the_call_was_not_completed + ' (' + confCall.accept.disposition + ')';
    }
    callDetails.push({
      Message: msg,
      TimeStr: confCall.startTime,
    });
  });

  callDetails.sort(function (a, b) {
    var aMo = moment.utc(a.TimeStr.replace(' UTC', ''));
    var bMo = moment.utc(b.TimeStr.replace(' UTC', ''));
    if (aMo.isSameOrAfter(bMo, 'second')) {
      return -1;
    } else return 1;
    return 0;
  });

  $.each(callDetails, function (item, detail) {
    var Time = moment.utc(detail.TimeStr.replace(' UTC', '')).local().format(DisplayTimeFormat);
    var messageString = '<table class=timelineMessage cellspacing=0 cellpadding=0><tr>';
    messageString += '<td class=timelineMessageArea>';
    messageString += '<div class=timelineMessageDate><i class="fa fa-circle timelineMessageDot"></i>' + Time + '</div>';
    messageString += '<div class=timelineMessageText>' + detail.Message + '</div>';
    messageString += '</td>';
    messageString += '</tr></table>';
    $('#line-' + lineNum + '-CallDetails').prepend(messageString);
  });
}
function UpdateUI() {
  var windowWidth = $(window).outerWidth();
  var windowHeight = $(window).outerHeight();
  if (windowWidth > UiMaxWidth) {
    $('#leftContentTable').css('border-left-width', '1px');
    if (selectedBuddy == null && selectedLine == null) {
      $('#leftContentTable').css('border-right-width', '1px');
    } else {
      $('#rightContent').css('border-right-width', '1px');
    }
  } else {
    // Touching Edges
    $('#leftContentTable').css('border-left-width', '0px');
    if (selectedBuddy == null && selectedLine == null) {
      $('#leftContentTable').css('border-right-width', '0px');
    } else {
      $('#leftContentTable').css('border-right-width', '1px');
    }
    $('#rightContent').css('border-right-width', '0px');
  }

  if (windowWidth < 920) {
    // Narrow Layout

    if ((selectedBuddy == null) & (selectedLine == null)) {
      // Nobody Selected (SHow Only Left Table)
      $('#rightContent').hide();

      $('#leftContent').css('width', '100%');
      $('#leftContent').show();
    } else {
      // Nobody Selected (SHow Only Buddy / Line)
      $('#rightContent').css('margin-left', '0px');
      $('#rightContent').show();

      $('#leftContent').hide();

      if (selectedBuddy != null) updateScroll(selectedBuddy.identity);
    }
  } else {
    // Wide Screen Layout
    if ((selectedBuddy == null) & (selectedLine == null)) {
      $('#leftContent').css('width', '100%');
      $('#rightContent').css('margin-left', '0px');
      $('#leftContent').show();
      $('#rightContent').hide();
    } else {
      $('#leftContent').css('width', '320px');
      $('#rightContent').css('margin-left', '320px');
      $('#leftContent').show();
      $('#rightContent').show();

      if (selectedBuddy != null) updateScroll(selectedBuddy.identity);
    }
  }
  for (var l = 0; l < Lines.length; l++) {
    updateLineScroll(Lines[l].LineNumber);
    RedrawStage(Lines[l].LineNumber, false);
  }

  if (windowObj != null) {
    var offsetTextHeight = windowObj.parent().outerHeight();
    var width = windowObj.width();
    if (windowWidth <= width || windowHeight <= offsetTextHeight) {
      // First apply to dialog, then set css
      windowObj.dialog('option', 'height', windowHeight);
      windowObj.dialog('option', 'width', windowWidth - (1 + 1 + 2 + 2)); // There is padding and a border
      windowObj.parent().css('top', '0px');
      windowObj.parent().css('left', '0px');
    } else {
      windowObj.parent().css('left', windowWidth / 2 - width / 2 + 'px');
      windowObj.parent().css('top', windowHeight / 2 - offsetTextHeight / 2 + 'px');
    }
  }
  if (alertObj != null) {
    var width = 300;
    var offsetTextHeight = alertObj.parent().outerHeight();
    if (windowWidth <= width || windowHeight <= offsetTextHeight) {
      if (windowWidth <= width) {
        // First apply to dialog, then set css
        alertObj.dialog('option', 'width', windowWidth - (1 + 1 + 2 + 2));
        alertObj.parent().css('left', '0px');
        alertObj.parent().css('top', windowHeight / 2 - offsetTextHeight / 2 + 'px');
      }
      if (windowHeight <= offsetTextHeight) {
        // First apply to dialog, then set css
        alertObj.dialog('option', 'height', windowHeight);
        alertObj.parent().css('left', windowWidth / 2 - width / 2 + 'px');
        alertObj.parent().css('top', '0px');
      }
    } else {
      alertObj.parent().css('left', windowWidth / 2 - width / 2 + 'px');
      alertObj.parent().css('top', windowHeight / 2 - offsetTextHeight / 2 + 'px');
    }
  }
  if (confirmObj != null) {
    var width = 300;
    var offsetTextHeight = confirmObj.parent().outerHeight();
    if (windowWidth <= width || windowHeight <= offsetTextHeight) {
      if (windowWidth <= width) {
        // First apply to dialog, then set css
        confirmObj.dialog('option', 'width', windowWidth - (1 + 1 + 2 + 2));
        confirmObj.parent().css('left', '0px');
        confirmObj.parent().css('top', windowHeight / 2 - offsetTextHeight / 2 + 'px');
      }
      if (windowHeight <= offsetTextHeight) {
        // First apply to dialog, then set css
        confirmObj.dialog('option', 'height', windowHeight);
        confirmObj.parent().css('left', windowWidth / 2 - width / 2 + 'px');
        confirmObj.parent().css('top', '0px');
      }
    } else {
      confirmObj.parent().css('left', windowWidth / 2 - width / 2 + 'px');
      confirmObj.parent().css('top', windowHeight / 2 - offsetTextHeight / 2 + 'px');
    }
  }
  if (promptObj != null) {
    var width = 300;
    var offsetTextHeight = promptObj.parent().outerHeight();
    if (windowWidth <= width || windowHeight <= offsetTextHeight) {
      if (windowWidth <= width) {
        // First apply to dialog, then set css
        promptObj.dialog('option', 'width', windowWidth - (1 + 1 + 2 + 2));
        promptObj.parent().css('left', '0px');
        promptObj.parent().css('top', windowHeight / 2 - offsetTextHeight / 2 + 'px');
      }
      if (windowHeight <= offsetTextHeight) {
        // First apply to dialog, then set css
        promptObj.dialog('option', 'height', windowHeight);
        promptObj.parent().css('left', windowWidth / 2 - width / 2 + 'px');
        promptObj.parent().css('top', '0px');
      }
    } else {
      promptObj.parent().css('left', windowWidth / 2 - width / 2 + 'px');
      promptObj.parent().css('top', windowHeight / 2 - offsetTextHeight / 2 + 'px');
    }
  }
  HidePopup();
}
function updateLineScroll(lineNum) {
  RefreshLineActivity(lineNum);

  var element = $('#line-' + lineNum + '-CallDetails').get(0);
  if (element) element.scrollTop = element.scrollHeight;
}
function RedrawStage(lineNum, videoChanged) {
  var stage = $('#line-' + lineNum + '-VideoCall');
  var container = $('#line-' + lineNum + '-stage-container');
  var previewContainer = $('#line-' + lineNum + '-preview-container');
  var videoContainer = $('#line-' + lineNum + '-remote-videos');

  var lineObj = FindLineByNumber(lineNum);
  if (lineObj == null) return;
  var session = lineObj.SipSession;
  if (session == null) return;

  var isVideoPinned = false;
  var pinnedVideoID = '';

  // Preview Area
  previewContainer.find('video').each(function (i, video) {
    $(video).hide();
  });
  previewContainer.css('width', '');

  // Count and Tag Videos
  var videoCount = 0;
  videoContainer.find('video').each(function (i, video) {
    var thisRemoteVideoStream = video.srcObject;
    var videoTrack = thisRemoteVideoStream.getVideoTracks()[0];
    var videoTrackSettings = videoTrack.getSettings();
    var srcVideoWidth = videoTrackSettings.width ? videoTrackSettings.width : video.videoWidth;
    var srcVideoHeight = videoTrackSettings.height ? videoTrackSettings.height : video.videoHeight;

    if (thisRemoteVideoStream.mid) {
      thisRemoteVideoStream.channel = 'unknown'; // Asterisk Channel
      thisRemoteVideoStream.CallerIdName = '';
      thisRemoteVideoStream.CallerIdNumber = '';
      thisRemoteVideoStream.isAdminMuted = false;
      thisRemoteVideoStream.isAdministrator = false;
      if (session && session.data && session.data.videoChannelNames) {
        session.data.videoChannelNames.forEach(function (videoChannelName) {
          if (thisRemoteVideoStream.mid == videoChannelName.mid) {
            thisRemoteVideoStream.channel = videoChannelName.channel;
          }
        });
      }
      if (session && session.data && session.data.ConfbridgeChannels) {
        session.data.ConfbridgeChannels.forEach(function (ConfbridgeChannel) {
          if (ConfbridgeChannel.id == thisRemoteVideoStream.channel) {
            thisRemoteVideoStream.CallerIdName = ConfbridgeChannel.caller.name;
            thisRemoteVideoStream.CallerIdNumber = ConfbridgeChannel.caller.number;
            thisRemoteVideoStream.isAdminMuted = ConfbridgeChannel.muted;
            thisRemoteVideoStream.isAdministrator = ConfbridgeChannel.admin;
          }
        });
      }
      // console.log("Track MID :", thisRemoteVideoStream.mid, thisRemoteVideoStream.channel);
    }

    // Remove any in the preview area
    if (videoChanged) {
      $('#line-' + lineNum + '-preview-container')
        .find('video')
        .each(function (i, video) {
          if (video.id.indexOf('copy-') == 0) {
            video.remove();
          }
        });
    }

    // Prep Videos
    $(video).parent().off('click');
    $(video).parent().css('width', '1px');
    $(video).parent().css('height', '1px');
    $(video).hide();
    $(video).parent().hide();

    // Count Videos
    if (
      lineObj.pinnedVideo &&
      lineObj.pinnedVideo == thisRemoteVideoStream.trackID &&
      videoTrack.readyState == 'live' &&
      srcVideoWidth > 10 &&
      srcVideoHeight >= 10
    ) {
      // A valid and live video is pinned
      isVideoPinned = true;
      pinnedVideoID = lineObj.pinnedVideo;
    }
    // Count All the videos
    if (videoTrack.readyState == 'live' && srcVideoWidth > 10 && srcVideoHeight >= 10) {
      videoCount++;
      console.log(
        'Display Video - ',
        videoTrack.readyState,
        'MID:',
        thisRemoteVideoStream.mid,
        'channel:',
        thisRemoteVideoStream.channel,
        'src width:',
        srcVideoWidth,
        'src height',
        srcVideoHeight
      );
    } else {
      console.log('Hide Video - ', videoTrack.readyState, 'MID:', thisRemoteVideoStream.mid);
    }
  });
  if (videoCount == 0) {
    // If you are the only one in the conference, just display your self
    previewContainer.css('width', previewWidth + 'px');
    previewContainer.find('video').each(function (i, video) {
      $(video).show();
    });
    return;
  }
  if (isVideoPinned) videoCount = 1;

  if (!videoContainer.outerWidth() > 0) return;
  if (!videoContainer.outerHeight() > 0) return;

  // videoAspectRatio (1|1.33|1.77) is for the peer video, so can technically be used here
  // default ia 4:3
  var Margin = 3;
  var videoRatio = 0.75; // 0.5625 = 9/16 (16:9) | 0.75   = 3/4 (4:3)
  if (videoAspectRatio == '' || videoAspectRatio == '1.33') videoRatio = 0.75;
  if (videoAspectRatio == '1.77') videoRatio = 0.5625;
  if (videoAspectRatio == '1') videoRatio = 1;
  var stageWidth = videoContainer.outerWidth() - Margin * 2;
  var stageHeight = videoContainer.outerHeight() - Margin * 2;
  var previewWidth = previewContainer.outerWidth();
  var maxWidth = 0;
  let i = 1;
  while (i < 5000) {
    let w = StageArea(i, videoCount, stageWidth, stageHeight, Margin, videoRatio);
    if (w === false) {
      maxWidth = i - 1;
      break;
    }
    i++;
  }
  maxWidth = maxWidth - Margin * 2;

  // Layout Videos
  videoContainer.find('video').each(function (i, video) {
    var thisRemoteVideoStream = video.srcObject;
    var videoTrack = thisRemoteVideoStream.getVideoTracks()[0];
    var videoTrackSettings = videoTrack.getSettings();
    var srcVideoWidth = videoTrackSettings.width ? videoTrackSettings.width : video.videoWidth;
    var srcVideoHeight = videoTrackSettings.height ? videoTrackSettings.height : video.videoHeight;

    var videoWidth = maxWidth;
    var videoHeight = maxWidth * videoRatio;

    // Set & Show
    if (isVideoPinned) {
      // One of the videos are pinned
      if (pinnedVideoID == video.srcObject.trackID) {
        $(video)
          .parent()
          .css('width', videoWidth + 'px');
        $(video)
          .parent()
          .css('height', videoHeight + 'px');
        $(video).show();
        $(video).parent().show();
        // Pinned Actions
        var unPinButton = $('<button />', {
          class: 'videoOverlayButtons',
        });
        unPinButton.html('<i class="fa fa-th-large"></i>');
        unPinButton.on('click', function () {
          UnPinVideo(lineNum, video);
        });
        $(video).parent().find('.Actions').empty();
        $(video).parent().find('.Actions').append(unPinButton);
      } else {
        // Put the videos in the preview area
        if (videoTrack.readyState == 'live' && srcVideoWidth > 10 && srcVideoHeight >= 10) {
          if (videoChanged) {
            var videoEl = $('<video />', {
              id: 'copy-' + thisRemoteVideoStream.id,
              muted: true,
              autoplay: true,
              playsinline: true,
              controls: false,
            });
            var videoObj = videoEl.get(0);
            videoObj.srcObject = thisRemoteVideoStream;
            $('#line-' + lineNum + '-preview-container').append(videoEl);
          }
        }
      }
    } else {
      // None of the videos are pinned
      if (videoTrack.readyState == 'live' && srcVideoWidth > 10 && srcVideoHeight >= 10) {
        // Unpinned
        $(video)
          .parent()
          .css('width', videoWidth + 'px');
        $(video)
          .parent()
          .css('height', videoHeight + 'px');
        $(video).show();
        $(video).parent().show();
        // Unpinned Actions
        var pinButton = $('<button />', {
          class: 'videoOverlayButtons',
        });
        pinButton.html('<i class="fa fa-thumb-tack"></i>');
        pinButton.on('click', function () {
          PinVideo(lineNum, video, video.srcObject.trackID);
        });
        $(video).parent().find('.Actions').empty();
        if (videoCount > 1) {
          // More then one video, nothing pinned
          $(video).parent().find('.Actions').append(pinButton);
        }
      }
    }

    // Populate Caller ID
    var adminMuteIndicator = '';
    var administratorIndicator = '';
    if (thisRemoteVideoStream.isAdminMuted == true) {
      adminMuteIndicator = '<i class="fa fa-microphone-slash" style="color:red"></i>&nbsp;';
    }
    if (thisRemoteVideoStream.isAdministrator == true) {
      administratorIndicator = '<i class="fa fa-user" style="color:orange"></i>&nbsp;';
    }
    if (thisRemoteVideoStream.CallerIdName == '') {
      thisRemoteVideoStream.CallerIdName = FindBuddyByIdentity(session.data.buddyId).CallerIDName;
    }
    $(video)
      .parent()
      .find('.callerID')
      .html(administratorIndicator + adminMuteIndicator + thisRemoteVideoStream.CallerIdName);
  });

  // Preview Area
  previewContainer.css('width', previewWidth + 'px');
  previewContainer.find('video').each(function (i, video) {
    $(video).show();
  });
}
function HidePopup(timeout) {
  if (timeout) {
    window.setTimeout(function () {
      if (menuObj != null) {
        menuObj.menu('destroy');
        try {
          menuObj.empty();
        } catch (e) {}
        try {
          menuObj.remove();
        } catch (e) {}
        menuObj = null;
      }
    }, timeout);
  } else {
    if (menuObj != null) {
      menuObj.menu('destroy');
      try {
        menuObj.empty();
      } catch (e) {}
      try {
        menuObj.remove();
      } catch (e) {}
      menuObj = null;
    }
  }
}
function Alert(messageStr, TitleStr, onOk) {
  if (confirmObj != null) {
    confirmObj.dialog('close');
    confirmObj = null;
  }
  if (promptObj != null) {
    promptObj.dialog('close');
    promptObj = null;
  }
  if (alertObj != null) {
    console.error('Alert not null, while Alert called: ' + TitleStr + ', saying:' + messageStr);
    return;
  } else {
    console.log('Alert called with Title: ' + TitleStr + ', saying: ' + messageStr);
  }

  var html = '<div class=NoSelect>';
  html += '<div class=UiText style="padding: 10px" id=AllertMessageText>' + messageStr + '</div>';
  html += '</div>';

  alertObj = $('<div>')
    .html(html)
    .dialog({
      autoOpen: false,
      title: TitleStr,
      modal: true,
      width: 300,
      height: 'auto',
      resizable: false,
      closeOnEscape: false,
      close: function (event, ui) {
        $(this).dialog('destroy');
        alertObj = null;
      },
    });

  var buttons = [];
  buttons.push({
    text: lang.ok,
    click: function () {
      console.log('Alert OK clicked');
      if (onOk) onOk();
      $(this).dialog('close');
      alertObj = null;
    },
  });
  alertObj.dialog('option', 'buttons', buttons);

  // Open the Window
  alertObj.dialog('open');

  alertObj.dialog({ dialogClass: 'no-close' });

  // Call UpdateUI to perform all the nesesary UI updates.
  UpdateUI();
}
function UserLocale() {
  var language = window.navigator.userLanguage || window.navigator.language; // "en", "en-US", "fr", "fr-FR", "es-ES", etc.
  // langtag = language["-"script]["-" region] *("-" variant) *("-" extension) ["-" privateuse]
  // TODO Needs work
  langtag = language.split('-');
  if (langtag.length == 1) {
    return '';
  } else if (langtag.length == 2) {
    return langtag[1].toLowerCase(); // en-US => us
  } else if (langtag.length >= 3) {
    return langtag[1].toLowerCase(); // en-US => us
  }
}
// ============================================================ Dial ================================================================================
function DialByLine() {
  var numDial = $('#dialText').val();
  // Create a Line
  newLineNumber = newLineNumber + 1;
  var lineObj = new Line(newLineNumber, numDial, numDial);
  Lines.push(lineObj);

  AddLineHtml(lineObj, 'outbound');

  SelectLine(newLineNumber);

  AudioCall(lineObj, numDial);
}

function DetectDevices() {
  navigator.mediaDevices
    .enumerateDevices()
    .then(function (deviceInfos) {
      // deviceInfos will not have a populated lable unless to accept the permission
      // during getUserMedia. This normally happens at startup/setup
      // so from then on these devices will be with lables.
      HasVideoDevice = false;
      HasAudioDevice = false;
      HasSpeakerDevice = false; // Safari and Firefox don't have these
      AudioinputDevices = [];
      VideoinputDevices = [];
      SpeakerDevices = [];
      for (var i = 0; i < deviceInfos.length; ++i) {
        if (deviceInfos[i].kind === 'audioinput') {
          HasAudioDevice = true;
          AudioinputDevices.push(deviceInfos[i]);
        } else if (deviceInfos[i].kind === 'audiooutput') {
          HasSpeakerDevice = true;
          SpeakerDevices.push(deviceInfos[i]);
        } else if (deviceInfos[i].kind === 'videoinput') {
          if (EnableVideoCalling == true) {
            HasVideoDevice = true;
            VideoinputDevices.push(deviceInfos[i]);
          }
        }
      }
      // console.log(AudioinputDevices, VideoinputDevices);
    })
    .catch(function (e) {
      console.error('Error enumerating devices', e);
    });
}

DetectDevices();
window.setInterval(function () {
  DetectDevices();
}, 10000);

function AudioCall(lineObj, dialledNumber) {
  if (userAgent == null) return;
  if (lineObj == null) return;

  if (HasAudioDevice == false) {
    Alert(lang.alert_no_microphone);
    return;
  }

  var supportedConstraints = navigator.mediaDevices.getSupportedConstraints();

  var spdOptions = {
    earlyMedia: true,
    sessionDescriptionHandlerOptions: {
      constraints: {
        audio: { deviceId: 'default' },
        video: false,
      },
    },
  };
  // Add additional Constraints
  if (supportedConstraints.autoGainControl) {
    spdOptions.sessionDescriptionHandlerOptions.constraints.audio.autoGainControl = AutoGainControl;
  }
  if (supportedConstraints.echoCancellation) {
    spdOptions.sessionDescriptionHandlerOptions.constraints.audio.echoCancellation = EchoCancellation;
  }
  if (supportedConstraints.noiseSuppression) {
    spdOptions.sessionDescriptionHandlerOptions.constraints.audio.noiseSuppression = NoiseSuppression;
  }

  var startTime = moment.utc();

  // Invite
  console.log('INVITE (audio): ' + dialledNumber + '@' + SipDomain);

  var targetURI = SIP.UserAgent.makeURI('sip:' + dialledNumber.replace(/#/g, '%23') + '@' + SipDomain);
  lineObj.SipSession = new SIP.Inviter(userAgent, targetURI, spdOptions);
  lineObj.SipSession.data = {};
  lineObj.SipSession.data.line = lineObj.LineNumber;
  lineObj.SipSession.data.buddyId = lineObj.BuddyObj?.identity;
  lineObj.SipSession.data.calldirection = 'outbound';
  lineObj.SipSession.data.dst = dialledNumber;
  lineObj.SipSession.data.callstart = startTime.format('YYYY-MM-DD HH:mm:ss UTC');
  lineObj.SipSession.data.callTimer = window.setInterval(function () {
    var now = moment.utc();
    var duration = moment.duration(now.diff(startTime));
    var timeStr = formatShortDuration(duration.asSeconds());
    $('#line-' + lineObj.LineNumber + '-timer').html(timeStr);
    $('#line-' + lineObj.LineNumber + '-datetime').html(timeStr);
  }, 1000);
  lineObj.SipSession.data.VideoSourceDevice = null;
  lineObj.SipSession.data.AudioSourceDevice = 'default';
  lineObj.SipSession.data.AudioOutputDevice = 'default';
  lineObj.SipSession.data.terminateby = 'them';
  lineObj.SipSession.data.withvideo = false;
  lineObj.SipSession.data.earlyReject = false;
  lineObj.SipSession.isOnHold = false;
  lineObj.SipSession.delegate = {
    onBye: function (sip) {
      console.log(sip, '----------------sip in onBye');
      // onSessionReceivedBye(lineObj, sip);
    },
    onMessage: function (sip) {
      console.log(sip, '----------------sip in onMessage');
      // onSessionReceivedMessage(lineObj, sip);
    },
    onInvite: function (sip) {
      console.log(sip, '----------------sip in onInvite');
      // onSessionReinvited(lineObj, sip);
    },
    onSessionDescriptionHandler: function (sdh, provisional) {
      console.log(sdh, provisional, ' -----------------sdh, provisional in onSessionDescriptionHandler');
      onSessionDescriptionHandlerCreated(lineObj, sdh, provisional, false);
    },
  };
  var inviterOptions = {
    requestDelegate: {
      // OutgoingRequestDelegate
      onTrying: function (sip) {
        onInviteTrying(lineObj, sip);
      },
      onProgress: function (sip) {
        onInviteProgress(lineObj, sip);
      },
      onRedirect: function (sip) {
        onInviteRedirected(lineObj, sip);
      },
      onAccept: function (sip) {
        onInviteAccepted(lineObj, false, sip);
      },
      onReject: function (sip) {
        onInviteRejected(lineObj, sip);
      },
    },
  };

  lineObj.SipSession.invite(inviterOptions).catch(function (e) {
    console.warn('Failed to send INVITE:', e);
  });
}

function onSessionDescriptionHandlerCreated(lineObj, sdh, provisional, includeVideo) {
  if (sdh) {
    if (sdh.peerConnection) {
      sdh.peerConnection.ontrack = function (event) {
        onTrackAddedEvent(lineObj, includeVideo);
      };
    } else {
      console.warn('onSessionDescriptionHandler fired without a peerConnection');
    }
  } else {
    console.warn('onSessionDescriptionHandler fired without a sessionDescriptionHandler');
  }
}
function onInviteTrying(lineObj, response) {
  $('#line-' + lineObj.LineNumber + '-msg').html(lang.trying);

  // Custom Web hook
  if (typeof web_hook_on_modify !== 'undefined') web_hook_on_modify('trying', lineObj.SipSession);
}
function onInviteProgress(lineObj, response) {
  console.log('Call Progress:', response.message.statusCode);

  // Provisional 1xx
  // response.message.reasonPhrase
  if (response.message.statusCode == 180) {
    $('#line-' + lineObj.LineNumber + '-msg').html(lang.ringing);

    var soundFile = audioBlobs.EarlyMedia_European;
    if (UserLocale().indexOf('us') > -1) soundFile = audioBlobs.EarlyMedia_US;
    if (UserLocale().indexOf('gb') > -1) soundFile = audioBlobs.EarlyMedia_UK;
    if (UserLocale().indexOf('au') > -1) soundFile = audioBlobs.EarlyMedia_Australia;
    if (UserLocale().indexOf('jp') > -1) soundFile = audioBlobs.EarlyMedia_Japan;

    // Play Early Media
    console.log('Audio:', soundFile?.url);
    if (lineObj.SipSession.data.earlyMedia) {
      // There is already early media playing
      // onProgress can be called multiple times
      // Don't add it again
      console.log('Early Media already playing');
    } else {
      var earlyMedia = new Audio(soundFile.blob);
      earlyMedia.preload = 'auto';
      earlyMedia.loop = true;
      earlyMedia.oncanplaythrough = function (e) {
        if (typeof earlyMedia.sinkId !== 'undefined' && getAudioOutputID() != 'default') {
          earlyMedia
            .setSinkId(getAudioOutputID())
            .then(function () {
              console.log('Set sinkId to:', getAudioOutputID());
            })
            .catch(function (e) {
              console.warn('Failed not apply setSinkId.', e);
            });
        }
        earlyMedia
          .play()
          .then(function () {
            // Audio Is Playing
          })
          .catch(function (e) {
            console.warn('Unable to play audio file.', e);
          });
      };
      lineObj.SipSession.data.earlyMedia = earlyMedia;
    }
  } else if (response.message.statusCode === 183) {
    $('#line-' + lineObj.LineNumber + '-msg').html(response.message.reasonPhrase + '...');

    // Add UI to allow DTMF
    $('#line-' + lineObj.LineNumber + '-early-dtmf').show();
  } else {
    // 181 = Call is Being Forwarded
    // 182 = Call is queued (Busy server!)
    // 199 = Call is Terminated (Early Dialog)

    $('#line-' + lineObj.LineNumber + '-msg').html(response.message.reasonPhrase + '...');
  }

  // Custom Web hook
  if (typeof web_hook_on_modify !== 'undefined') web_hook_on_modify('progress', lineObj.SipSession);
}

function onTrackAddedEvent(lineObj, includeVideo) {
  // Gets remote tracks
  var session = lineObj.SipSession;

  var pc = session.sessionDescriptionHandler.peerConnection;

  var remoteAudioStream = new MediaStream();

  pc.getTransceivers().forEach(function (transceiver) {
    // Add Media
    var receiver = transceiver.receiver;
    if (receiver.track) {
      if (receiver.track.kind == 'audio') {
        console.log('Adding Remote Audio Track');
        remoteAudioStream.addTrack(receiver.track);
      }
    }
  });

  // Attach Audio
  if (remoteAudioStream.getAudioTracks().length >= 1) {
    var remoteAudio = $('#line-' + lineObj.LineNumber + '-remoteAudio').get(0);
    remoteAudio.srcObject = remoteAudioStream;
    remoteAudio.onloadedmetadata = function (e) {
      if (typeof remoteAudio.sinkId !== 'undefined') {
        remoteAudio
          .setSinkId(getAudioOutputID())
          .then(function () {
            console.log('sinkId applied: ' + getAudioOutputID());
          })
          .catch(function (e) {
            console.warn('Error using setSinkId: ', e);
          });
      }
      remoteAudio.play();
    };
  }
}

function onInviteAccepted(lineObj, includeVideo, response) {
  // Call in progress
  var session = lineObj.SipSession;

  if (session.data.earlyMedia) {
    session.data.earlyMedia.pause();
    session.data.earlyMedia.removeAttribute('src');
    session.data.earlyMedia.load();
    session.data.earlyMedia = null;
  }

  window.clearInterval(session.data.callTimer);
  $('#line-' + lineObj.LineNumber + '-timer').show();
  var startTime = moment.utc();
  session.data.startTime = startTime;
  session.data.callTimer = window.setInterval(function () {
    var now = moment.utc();
    var duration = moment.duration(now.diff(startTime));
    var timeStr = formatShortDuration(duration.asSeconds());
    $('#line-' + lineObj.LineNumber + '-timer').html(timeStr);
    $('#line-' + lineObj.LineNumber + '-datetime').html(timeStr);
  }, 1000);
  session.isOnHold = false;
  session.data.started = true;

  // Start Audio Monitoring
  // lineObj.LocalSoundMeter = StartLocalAudioMediaMonitoring(lineObj.LineNumber, session);
  // lineObj.RemoteSoundMeter = StartRemoteAudioMediaMonitoring(lineObj.LineNumber, session);
}

function onSessionReceivedBye(lineObj, response) {
  // They Ended the call
  $('#line-' + lineObj.LineNumber + '-msg').html(lang.call_ended);
  console.log('Call ended, bye!');

  lineObj.SipSession.data.terminateby = 'them';
  lineObj.SipSession.data.reasonCode = 16;
  lineObj.SipSession.data.reasonText = 'Normal Call clearing';

  response.accept(); // Send OK

  teardownSession(lineObj);
}
function teardownSession(lineObj) {
  $('#rightContent').empty();
  if (lineObj == null || lineObj.SipSession == null) return;

  var session = lineObj.SipSession;
  if (session.data.teardownComplete == true) return;
  session.data.teardownComplete = true; // Run this code only once

  // Call UI
  if (session.data.earlyReject != true) {
    HidePopup();
  }

  // End any child calls
  if (session.data.childsession) {
    session.data.childsession
      .dispose()
      .then(function () {
        session.data.childsession = null;
      })
      .catch(function (error) {
        session.data.childsession = null;
        // Suppress message
      });
  }

  // Mixed Tracks
  if (session.data.AudioSourceTrack && session.data.AudioSourceTrack.kind == 'audio') {
    session.data.AudioSourceTrack.stop();
    session.data.AudioSourceTrack = null;
  }
  // Stop any Early Media
  if (session.data.earlyMedia) {
    session.data.earlyMedia.pause();
    session.data.earlyMedia.removeAttribute('src');
    session.data.earlyMedia.load();
    session.data.earlyMedia = null;
  }
  // Stop any ringing calls
  if (session.data.ringerObj) {
    session.data.ringerObj.pause();
    session.data.ringerObj.removeAttribute('src');
    session.data.ringerObj.load();
    session.data.ringerObj = null;
  }

  // Stop Recording if we are
  StopRecording(lineObj.LineNumber, true);

  // Audio Meters
  if (lineObj.LocalSoundMeter != null) {
    lineObj.LocalSoundMeter.stop();
    lineObj.LocalSoundMeter = null;
  }
  if (lineObj.RemoteSoundMeter != null) {
    lineObj.RemoteSoundMeter.stop();
    lineObj.RemoteSoundMeter = null;
  }

  // Make sure you have released the microphone
  if (session && session.sessionDescriptionHandler && session.sessionDescriptionHandler.peerConnection) {
    var pc = session.sessionDescriptionHandler.peerConnection;
    pc.getSenders().forEach(function (RTCRtpSender) {
      if (RTCRtpSender.track && RTCRtpSender.track.kind == 'audio') {
        RTCRtpSender.track.stop();
      }
    });
  }

  // End timers
  window.clearInterval(session.data.videoResampleInterval);
  window.clearInterval(session.data.callTimer);

  // Add to stream
  AddCallMessage(lineObj.BuddyObj?.identity, session);

  // Check if this call was missed
  if (session.data.calldirection == 'inbound') {
    if (session.data.earlyReject) {
      // Call was rejected without even ringing
      IncreaseMissedBadge(session.data.buddyId);
    } else if (session.data.terminateby == 'them' && session.data.startTime == null) {
      // Call Terminated by them during ringing
      if (session.data.reasonCode == 0) {
        // Call was canceled, and not answered elsewhere
        IncreaseMissedBadge(session.data.buddyId);
      }
    }
  }

  // Close up the UI
  window.setTimeout(function () {
    RemoveLine(lineObj);
  }, 1000);

  // UpdateBuddyList();
  if (session.data.earlyReject != true) {
    UpdateUI();
  }

  // Custom Web hook
  if (typeof web_hook_on_terminate !== 'undefined') web_hook_on_terminate(session);
}
function StopRecording(lineNum, noConfirm) {
  var lineObj = FindLineByNumber(lineNum);
  if (lineObj == null || lineObj.SipSession == null) return;

  var session = lineObj.SipSession;
  if (noConfirm == true) {
    // Called at the end of a call
    $('#line-' + lineObj.LineNumber + '-btn-start-recording').show();
    $('#line-' + lineObj.LineNumber + '-btn-stop-recording').hide();

    if (session.data.mediaRecorder) {
      if (session.data.mediaRecorder.state == 'recording') {
        console.log('Stopping Call Recording');
        session.data.mediaRecorder.stop();
        session.data.recordings[session.data.recordings.length - 1].stopTime = utcDateNow();
        window.clearInterval(session.data.recordingRedrawInterval);

        $('#line-' + lineObj.LineNumber + '-msg').html(lang.call_recording_stopped);

        updateLineScroll(lineNum);
      } else {
        console.warn('Recorder is in an unknown state');
      }
    }
    return;
  } else {
    // User attempts to end call recording
    if (CallRecordingPolicy == 'enabled') {
      console.warn('Policy Enabled: Call Recording');
      return;
    }

    Confirm(lang.confirm_stop_recording, lang.stop_recording, function () {
      StopRecording(lineNum, true);
    });
  }
}
function SaveQosData(QosData, sessionId, buddy) {
  if (CallQosDataIndexDb != null) {
    // Prepare data to write
    var data = {
      uID: uID(),
      sessionid: sessionId,
      buddy: buddy,
      QosData: QosData,
    };
    // Commit Transaction
    var transaction = CallQosDataIndexDb.transaction(['CallQos'], 'readwrite');
    var objectStoreAdd = transaction.objectStore('CallQos').add(data);
    objectStoreAdd.onsuccess = function (event) {
      console.log('Call CallQos Success: ', sessionId);
    };
  } else {
    console.warn('CallQosDataIndexDb is null.');
  }
}
function AddCallMessage(buddy, session) {
  var currentStream = JSON.parse(localDB.getItem(buddy + '-stream'));
  if (currentStream == null) currentStream = InitialiseStream(buddy);

  var CallEnd = moment.utc(); // Take Now as the Hangup Time
  var callDuration = 0;
  var totalDuration = 0;
  var ringTime = 0;

  var CallStart = moment.utc(session.data.callstart.replace(' UTC', '')); // Actual start (both inbound and outbound)
  var CallAnswer = null; // On Accept when inbound, Remote Side when Outbound
  if (session.data.startTime) {
    // The time when WE answered the call (May be null - no answer)
    // or
    // The time when THEY answered the call (May be null - no answer)
    CallAnswer = moment.utc(session.data.startTime); // Local Time gets converted to UTC

    callDuration = moment.duration(CallEnd.diff(CallAnswer));
    ringTime = moment.duration(CallAnswer.diff(CallStart));
  } else {
    // There was no start time, but on inbound/outbound calls, this would indicate the ring time
    ringTime = moment.duration(CallEnd.diff(CallStart));
  }
  totalDuration = moment.duration(CallEnd.diff(CallStart));

  var srcId = '';
  var srcCallerID = '';
  var dstId = '';
  var dstCallerID = '';
  if (session.data.calldirection == 'inbound') {
    srcId = buddy;
    dstId = profileUserID;
    srcCallerID = session.remoteIdentity.displayName;
    dstCallerID = profileName;
  } else if (session.data.calldirection == 'outbound') {
    srcId = profileUserID;
    dstId = buddy;
    srcCallerID = profileName;
    dstCallerID = session.data.dst;
  }

  var callDirection = session.data.calldirection;
  var withVideo = session.data.withvideo;
  var sessionId = session.id;
  var hangupBy = session.data.terminateby;

  var newMessageJson = {
    CdrId: uID(),
    ItemType: 'CDR',
    ItemDate: CallStart.format('YYYY-MM-DD HH:mm:ss UTC'),
    CallAnswer: CallAnswer ? CallAnswer.format('YYYY-MM-DD HH:mm:ss UTC') : null,
    CallEnd: CallEnd.format('YYYY-MM-DD HH:mm:ss UTC'),
    SrcUserId: srcId,
    Src: srcCallerID,
    DstUserId: dstId,
    Dst: dstCallerID,
    RingTime: ringTime != 0 ? ringTime.asSeconds() : 0,
    Billsec: callDuration != 0 ? callDuration.asSeconds() : 0,
    TotalDuration: totalDuration != 0 ? totalDuration.asSeconds() : 0,
    ReasonCode: session.data.reasonCode,
    ReasonText: session.data.reasonText,
    WithVideo: withVideo,
    SessionId: sessionId,
    CallDirection: callDirection,
    Terminate: hangupBy,
    // CRM
    MessageData: null,
    Tags: [],
    //Reporting
    Transfers: session.data.transfer ? session.data.transfer : [],
    Mutes: session.data.mute ? session.data.mute : [],
    Holds: session.data.hold ? session.data.hold : [],
    Recordings: session.data.recordings ? session.data.recordings : [],
    ConfCalls: session.data.confcalls ? session.data.confcalls : [],
    ConfbridgeEvents: session.data.ConfbridgeEvents ? session.data.ConfbridgeEvents : [],
    QOS: [],
  };

  console.log('New CDR', newMessageJson);

  currentStream.DataCollection.push(newMessageJson);
  currentStream.TotalRows = currentStream.DataCollection.length;
  localDB.setItem(buddy + '-stream', JSON.stringify(currentStream));

  UpdateBuddyActivity(buddy);

  // Data Cleanup
  if (MaxDataStoreDays && MaxDataStoreDays > 0) {
    console.log('Cleaning up data: ', MaxDataStoreDays);
    RemoveBuddyMessageStream(FindBuddyByIdentity(buddy), MaxDataStoreDays);
  }
}
function InitialiseStream(buddy) {
  var template = { TotalRows: 0, DataCollection: [] };
  localDB.setItem(buddy + '-stream', JSON.stringify(template));
  return JSON.parse(localDB.getItem(buddy + '-stream'));
}
function UpdateBuddyActivity(buddy, lastAct) {
  var buddyObj = FindBuddyByIdentity(buddy);
  if (buddyObj == null) return;

  // Update Last Activity Time
  // =========================
  if (lastAct) {
    buddyObj.lastActivity = lastAct;
  } else {
    var timeStamp = utcDateNow();
    buddyObj.lastActivity = timeStamp;
  }
  console.log('Last Activity for ' + buddyObj.CallerIDName + ' is now: ' + buddyObj.lastActivity);

  // Take Out
  var json = JSON.parse(localDB.getItem(profileUserID + '-Buddies'));
  if (json != null) {
    $.each(json.DataCollection, function (i, item) {
      if (item.uID == buddy || item.cID == buddy || item.gID == buddy) {
        item.LastActivity = timeStamp;
        return false;
      }
    });
    // Put Back
    localDB.setItem(profileUserID + '-Buddies', JSON.stringify(json));
  }

  // List Update
  // ===========
  UpdateBuddyList();
}
function RemoveLine(lineObj) {
  if (lineObj == null) return;

  var earlyReject = lineObj.SipSession.data.earlyReject;
  for (var l = 0; l < Lines.length; l++) {
    if (Lines[l].LineNumber == lineObj.LineNumber) {
      Lines.splice(l, 1);
      break;
    }
  }

  if (earlyReject != true) {
    CloseLine(lineObj.LineNumber);
    $('#line-ui-' + lineObj.LineNumber).remove();
  }

  // UpdateBuddyList();

  if (earlyReject != true) {
    // Rather than showing nothing, go to the last Buddy Selected
    // Select Last user
    if (localDB.getItem('SelectedBuddy') != null) {
      console.log('Selecting previously selected buddy...', localDB.getItem('SelectedBuddy'));
      SelectBuddy(localDB.getItem('SelectedBuddy'));
      UpdateUI();
    }
  }
}
function CloseLine(lineNum) {
  // Lines and Buddies (Left)
  $('.buddySelected').each(function () {
    $(this).prop('class', 'buddy');
  });
  // Streams (Right)
  $('.streamSelected').each(function () {
    $(this).prop('class', 'stream');
  });

  // SwitchLines(0);

  console.log('Closing Line: ' + lineNum);
  for (var l = 0; l < Lines.length; l++) {
    Lines[l].IsSelected = false;
  }
  selectedLine = null;
  for (var b = 0; b < Buddies.length; b++) {
    Buddies[b].IsSelected = false;
  }
  selectedBuddy = null;

  // Save Selected
  // localDB.setItem("SelectedBuddy", null);

  // Change to Stream if in Narrow view
  UpdateUI();
}

// ============================================================ Inbound ======================================================================
// Inbound Calls
// =============
function ReceiveCall(session) {
  // First Determine Identity from From
  var callerID = session.remoteIdentity.displayName;
  var did = session.remoteIdentity.uri.user;
  if (typeof callerID === 'undefined') callerID = did;

  console.log('New Incoming Call!', callerID + ' <' + did + '>');

  var startTime = moment.utc();

  // Create the line and add the session so we can answer or reject it.
  newLineNumber = newLineNumber + 1;
  var lineObj = new Line(newLineNumber, callerID, did);
  lineObj.SipSession = session;
  lineObj.SipSession.data = {};
  lineObj.SipSession.data.line = lineObj.LineNumber;
  lineObj.SipSession.data.calldirection = 'inbound';
  lineObj.SipSession.data.terminateby = '';
  lineObj.SipSession.data.src = did;
  // lineObj.SipSession.data.buddyId = lineObj.BuddyObj?.identity;
  lineObj.SipSession.data.callstart = startTime.format('YYYY-MM-DD HH:mm:ss UTC');
  lineObj.SipSession.data.callTimer = window.setInterval(function () {
    var now = moment.utc();
    var duration = moment.duration(now.diff(startTime));
    var timeStr = formatShortDuration(duration.asSeconds());
    $('#line-' + lineObj.LineNumber + '-timer').html(timeStr);
    $('#line-' + lineObj.LineNumber + '-datetime').html(timeStr);
  }, 1000);
  lineObj.SipSession.data.earlyReject = false;
  Lines.push(lineObj);

  // Session Delegates
  lineObj.SipSession.delegate = {
    onBye: function (sip) {
      onSessionReceivedBye(lineObj, sip);
    },
    onMessage: function (sip) {
      console.log(sip, '----------------sip in onMessage');
      // onSessionReceivedMessage(lineObj, sip);
    },
    onInvite: function (sip) {
      console.log(sip, '----------------sip in onInvite');
      // onSessionReinvited(lineObj, sip);
    },
    onSessionDescriptionHandler: function (sdh, provisional) {
      onSessionDescriptionHandlerCreated(lineObj, sdh, provisional, lineObj.SipSession.data.withvideo);
    },
  };
  // incomingInviteRequestDelegate
  lineObj.SipSession.incomingInviteRequest.delegate = {
    onCancel: function (sip) {
      onInviteCancel(lineObj, sip);
    },
  };

  // Create the call HTML
  AddLineHtml(lineObj, 'inbound');

  // Play Ring Tone if not on the phone
  if (EnableRingtone == true) {
    // Play Ring Tone
    console.log('Audio:', audioBlobs.Ringtone.url);
    var ringer = new Audio(audioBlobs.Ringtone.blob);
    ringer.preload = 'auto';
    ringer.loop = true;
    ringer.oncanplaythrough = function (e) {
      if (typeof ringer.sinkId !== 'undefined' && getRingerOutputID() != 'default') {
        ringer
          .setSinkId(getRingerOutputID())
          .then(function () {
            console.log('Set sinkId to:', getRingerOutputID());
          })
          .catch(function (e) {
            console.warn('Failed not apply setSinkId.', e);
          });
      }
      // If there has been no interaction with the page at all... this page will not work
      ringer
        .play()
        .then(function () {
          // Audio Is Playing
        })
        .catch(function (e) {
          console.warn('Unable to play audio file.', e);
        });
    };
    lineObj.SipSession.data.ringerObj = ringer;
  }
}

function SelectBuddy(buddy) {
  var buddyObj = FindBuddyByIdentity(buddy);
  if (buddyObj == null) return;

  var displayName =
    BuddyShowExtenNum == true && (buddyObj.type == 'extension' || buddyObj.type == 'xmpp')
      ? ' ' + buddyObj.ExtNo + ' - ' + buddyObj.CallerIDName
      : buddyObj.CallerIDName;
  $('#contact-' + buddyObj.identity + '-name').html(displayName);
  var presence = '';
  if (buddyObj.type == 'extension') {
    presence += buddyObj.presence;
    if (presence == 'Unknown') presence = lang.state_unknown;
    if (presence == 'Not online') presence = lang.state_not_online;
    if (presence == 'Ready') presence = lang.state_ready;
    if (presence == 'On the phone') presence = lang.state_on_the_phone;
    if (presence == 'Ringing') presence = lang.state_ringing;
    if (presence == 'On hold') presence = lang.state_on_hold;
    if (presence == 'Unavailable') presence = lang.state_unavailable;
    if (buddyObj.EnableSubscribe != true) presence = buddyObj.Desc;
  } else if (buddyObj.type == 'xmpp') {
    presence += '<i class="fa fa-comments"></i> ';
    presence += buddyObj.presenceText;
  } else if (buddyObj.type == 'contact') {
    presence += buddyObj.Desc;
  } else if (buddyObj.type == 'group') {
    presence += buddyObj.Desc;
  }
  $('#contact-' + buddyObj.identity + '-presence-main').html(presence);

  $('#contact-' + buddyObj.identity + '-picture-main').css(
    'background-image',
    $('#contact-' + buddyObj.identity + '-picture-main').css('background-image')
  );

  for (var b = 0; b < Buddies.length; b++) {
    if (Buddies[b].IsSelected == true && Buddies[b].identity == buddy) {
      // Nothing to do, you re-selected the same buddy;
      return;
    }
  }

  console.log('Selecting Buddy: ' + buddyObj.CallerIDName);

  selectedBuddy = buddyObj;

  // Can only display one thing on the Right
  $('.streamSelected').each(function () {
    $(this).prop('class', 'stream');
  });
  $('#stream-' + buddy).prop('class', 'streamSelected');

  // Update Lines List
  for (var l = 0; l < Lines.length; l++) {
    var classStr = 'buddy';
    if (Lines[l].SipSession != null) classStr = Lines[l].SipSession.isOnHold ? 'buddyActiveCallHollding' : 'buddyActiveCall';
    $('#line-' + Lines[l].LineNumber).prop('class', classStr);
    Lines[l].IsSelected = false;
  }

  ClearMissedBadge(buddy);
  // Update Buddy List
  for (var b = 0; b < Buddies.length; b++) {
    var classStr = Buddies[b].identity == buddy ? 'buddySelected' : 'buddy';
    $('#contact-' + Buddies[b].identity).prop('class', classStr);

    $('#contact-' + Buddies[b].identity + '-ChatHistory').empty();

    Buddies[b].IsSelected = Buddies[b].identity == buddy;
  }

  // Change to Stream if in Narrow view
  UpdateUI();

  // Refresh Stream
  // console.log("Refreshing Stream for you(" + profileUserID + ") and : " + buddyObj.identity);
  RefreshStream(buddyObj);

  try {
    $('#contact-' + buddy)
      .get(0)
      .scrollIntoViewIfNeeded();
  } catch (e) {}

  // Save Selected
  localDB.setItem('SelectedBuddy', buddy);
}
function ClearMissedBadge(buddy) {
  var buddyObj = FindBuddyByIdentity(buddy);
  if (buddyObj == null) return;

  buddyObj.missed = 0;

  // Take Out
  var json = JSON.parse(localDB.getItem(profileUserID + '-Buddies'));
  if (json != null) {
    $.each(json.DataCollection, function (i, item) {
      if (item.uID == buddy || item.cID == buddy || item.gID == buddy) {
        item.missed = 0;
        return false;
      }
    });
    // Put Back
    localDB.setItem(profileUserID + '-Buddies', JSON.stringify(json));
  }

  $('#contact-' + buddy + '-missed').text(buddyObj.missed);
  $('#contact-' + buddy + '-missed').hide(400);

  if (typeof web_hook_on_missed_notify !== 'undefined') web_hook_on_missed_notify(buddyObj.missed);
}
function updateScroll(buddy) {
  var history = $('#contact-' + buddy + '-ChatHistory');
  try {
    if (history.children().length > 0) history.children().last().get(0).scrollIntoView(false);
    history.get(0).scrollTop = history.get(0).scrollHeight;
  } catch (e) {}
}
function RefreshStream(buddyObj, filter) {
  $('#contact-' + buddyObj.identity + '-ChatHistory').empty();

  var json = JSON.parse(localDB.getItem(buddyObj.identity + '-stream'));
  if (json == null || json.DataCollection == null) return;

  // Sort DataCollection (Newest items first)
  json.DataCollection.sort(function (a, b) {
    var aMo = moment.utc(a.ItemDate.replace(' UTC', ''));
    var bMo = moment.utc(b.ItemDate.replace(' UTC', ''));
    if (aMo.isSameOrAfter(bMo, 'second')) {
      return -1;
    } else return 1;
    return 0;
  });

  // Filter
  if (filter && filter != '') {
    console.log('Rows without filter (' + filter + '): ', json.DataCollection.length);
    json.DataCollection = json.DataCollection.filter(function (item) {
      if (filter.indexOf('date: ') != -1) {
        // Apply Date Filter
        var dateFilter = getFilter(filter, 'date');
        if (dateFilter != '' && item.ItemDate.indexOf(dateFilter) != -1) return true;
      }
      if (item.MessageData && item.MessageData.length > 1) {
        if (item.MessageData.toLowerCase().indexOf(filter.toLowerCase()) != -1) return true;
        if (filter.toLowerCase().indexOf(item.MessageData.toLowerCase()) != -1) return true;
      }
      if (item.ItemType == 'MSG') {
        // Special search??
      } else if (item.ItemType == 'CDR') {
        // Tag Search
        if (item.Tags && item.Tags.length > 1) {
          var tagFilter = getFilter(filter, 'tag');
          if (tagFilter != '') {
            if (
              item.Tags.some(function (i) {
                if (tagFilter.toLowerCase().indexOf(i.value.toLowerCase()) != -1) return true;
                if (i.value.toLowerCase().indexOf(tagFilter.toLowerCase()) != -1) return true;
                return false;
              }) == true
            )
              return true;
          }
        }
      } else if (item.ItemType == 'FILE') {
        // Not yest implemented
      } else if (item.ItemType == 'SMS') {
        // Not yest implemented
      }
      // return true to keep;
      return false;
    });
    console.log('Rows After Filter: ', json.DataCollection.length);
  }

  // Create Buffer
  if (json.DataCollection.length > StreamBuffer) {
    console.log('Rows:', json.DataCollection.length, ' (will be trimmed to ' + StreamBuffer + ')');
    // Always limit the Stream to {StreamBuffer}, users much search for messages further back
    json.DataCollection.splice(StreamBuffer);
  }

  $.each(json.DataCollection, function (i, item) {
    var IsToday = moment.utc(item.ItemDate.replace(' UTC', '')).isSame(moment.utc(), 'day');
    var DateTime = moment.utc(item.ItemDate.replace(' UTC', '')).local().calendar(null, { sameElse: DisplayDateFormat });
    if (IsToday) DateTime = moment.utc(item.ItemDate.replace(' UTC', '')).local().format(DisplayTimeFormat);

    if (item.ItemType == 'MSG') {
      // Add Chat Message
      // ===================

      //Billsec: "0"
      //Dst: "sip:800"
      //DstUserId: "8D68C1D442A96B4"
      //ItemDate: "2019-05-14 09:42:15"
      //ItemId: "89"
      //ItemType: "MSG"
      //MessageData: "........."
      //Src: ""Keyla James" <100>"
      //SrcUserId: "8D68B3EFEC8D0F5"

      var deliveryStatus = '<i class="fa fa-question-circle-o SendingMessage"></i>';
      if (item.Sent == true) deliveryStatus = '<i class="fa fa-check SentMessage"></i>';
      if (item.Sent == false) deliveryStatus = '<i class="fa fa-exclamation-circle FailedMessage"></i>';
      if (item.Delivered && item.Delivered.state == true) {
        deliveryStatus += ' <i class="fa fa-check DeliveredMessage"></i>';
      }
      if (item.Displayed && item.Displayed.state == true) {
        deliveryStatus = '<i class="fa fa-check CompletedMessage"></i>';
      }

      var formattedMessage = ReformatMessage(item.MessageData);
      var longMessage = formattedMessage.length > 1000;

      if (item.SrcUserId == profileUserID) {
        // You are the source (sending)
        var messageString = '<table class=ourChatMessage cellspacing=0 cellpadding=0><tr>';
        messageString += '<td class=ourChatMessageText onmouseenter="ShowChatMenu(this)" onmouseleave="HideChatMenu(this)">';
        messageString +=
          "<span onclick=\"ShowMessageMenu(this,'MSG','" +
          item.ItemId +
          "', '" +
          buddyObj.identity +
          '\')" class=chatMessageDropdown style="display:none"><i class="fa fa-chevron-down"></i></span>';
        messageString +=
          '<div id=msg-text-' +
          item.ItemId +
          ' class=messageText style="' +
          (longMessage ? 'max-height:190px; overflow:hidden' : '') +
          '">' +
          formattedMessage +
          '</div>';
        if (longMessage) {
          messageString +=
            '<div id=msg-readmore-' +
            item.ItemId +
            ' class=messageReadMore><span onclick="ExpandMessage(this,\'' +
            item.ItemId +
            "', '" +
            buddyObj.identity +
            '\')">' +
            lang.read_more +
            '</span></div>';
        }
        messageString += '<div class=messageDate>' + DateTime + ' ' + deliveryStatus + '</div>';
        messageString += '</td>';
        messageString += '</tr></table>';
      } else {
        // You are the destination (receiving)
        var ActualSender = ''; //TODO
        var messageString = '<table class=theirChatMessage cellspacing=0 cellpadding=0><tr>';
        messageString += '<td class=theirChatMessageText onmouseenter="ShowChatMenu(this)" onmouseleave="HideChatMenu(this)">';
        messageString +=
          "<span onclick=\"ShowMessageMenu(this,'MSG','" +
          item.ItemId +
          "', '" +
          buddyObj.identity +
          '\')" class=chatMessageDropdown style="display:none"><i class="fa fa-chevron-down"></i></span>';
        if (buddyObj.type == 'group') {
          messageString += '<div class=messageDate>' + ActualSender + '</div>';
        }
        messageString +=
          '<div id=msg-text-' +
          item.ItemId +
          ' class=messageText style="' +
          (longMessage ? 'max-height:190px; overflow:hidden' : '') +
          '">' +
          formattedMessage +
          '</div>';
        if (longMessage) {
          messageString +=
            '<div id=msg-readmore-' +
            item.ItemId +
            ' class=messageReadMore><span onclick="ExpandMessage(this,\'' +
            item.ItemId +
            "', '" +
            buddyObj.identity +
            '\')">' +
            lang.read_more +
            '</span></div>';
        }
        messageString += '<div class=messageDate>' + DateTime + '</div>';
        messageString += '</td>';
        messageString += '</tr></table>';

        // Update any received messages
        if (buddyObj.type == 'xmpp') {
          var streamVisible = $('#stream-' + buddyObj.identity).is(':visible');
          if (streamVisible && !item.Read) {
            console.log('Buddy stream is now visible, marking XMPP message(' + item.ItemId + ') as read');
            MarkMessageRead(buddyObj, item.ItemId);
            XmppSendDisplayReceipt(buddyObj, item.ItemId);
          }
        }
      }
      $('#contact-' + buddyObj.identity + '-ChatHistory').prepend(messageString);
    } else if (item.ItemType == 'CDR') {
      // Add CDR
      // =======

      // CdrId = uID(),
      // ItemType: "CDR",
      // ItemDate: "...",
      // SrcUserId: srcId,
      // Src: srcCallerID,
      // DstUserId: dstId,
      // Dst: dstCallerID,
      // Billsec: duration.asSeconds(),
      // MessageData: ""
      // ReasonText:
      // ReasonCode:
      // Flagged
      // Tags: [""", "", "", ""]
      // Transfers: [{}],
      // Mutes: [{}],
      // Holds: [{}],
      // Recordings: [{ uID, startTime, mediaType, stopTime: utcDateNow, size}],
      // QOS: [{}]

      var iconColor = item.Billsec > 0 ? 'green' : 'red';
      var formattedMessage = '';

      // Flagged
      var flag = '<span id=cdr-flagged-' + item.CdrId + ' style="' + (item.Flagged ? '' : 'display:none') + '">';
      flag += '<i class="fa fa-flag FlagCall"></i> ';
      flag += '</span>';

      // Comment
      var callComment = '';
      if (item.MessageData) callComment = item.MessageData;

      // Tags
      if (!item.Tags) item.Tags = [];
      var CallTags =
        '<ul id=cdr-tags-' + item.CdrId + ' class=tags style="' + (item.Tags && item.Tags.length > 0 ? '' : 'display:none') + '">';
      $.each(item.Tags, function (i, tag) {
        CallTags += '<li onclick="TagClick(this, \'' + item.CdrId + "', '" + buddyObj.identity + '\')">' + tag.value + '</li>';
      });
      CallTags +=
        '<li class=tagText><input maxlength=24 type=text onkeypress="TagKeyPress(event, this, \'' +
        item.CdrId +
        "', '" +
        buddyObj.identity +
        '\')" onfocus="TagFocus(this)"></li>';
      CallTags += '</ul>';

      // Call Type
      var callIcon = item.WithVideo ? 'fa-video-camera' : 'fa-phone';
      formattedMessage += '<i class="fa ' + callIcon + '" style="color:' + iconColor + '"></i>';
      var audioVideo = item.WithVideo ? lang.a_video_call : lang.an_audio_call;

      // Recordings
      var recordingsHtml = '';
      if (item.Recordings && item.Recordings.length >= 1) {
        $.each(item.Recordings, function (i, recording) {
          if (recording.uID) {
            var StartTime = moment.utc(recording.startTime.replace(' UTC', '')).local();
            var StopTime = moment.utc(recording.stopTime.replace(' UTC', '')).local();
            var recordingDuration = moment.duration(StopTime.diff(StartTime));
            recordingsHtml += '<div class=callRecording>';
            if (item.WithVideo) {
              if (recording.Poster) {
                var posterWidth = recording.Poster.width;
                var posterHeight = recording.Poster.height;
                var posterImage = recording.Poster.posterBase64;
                recordingsHtml +=
                  '<div><IMG src="' +
                  posterImage +
                  '"><button onclick="PlayVideoCallRecording(this, \'' +
                  item.CdrId +
                  "', '" +
                  recording.uID +
                  '\')" class=videoPoster><i class="fa fa-play"></i></button></div>';
              } else {
                recordingsHtml +=
                  '<div><button class=roundButtons onclick="PlayVideoCallRecording(this, \'' +
                  item.CdrId +
                  "', '" +
                  recording.uID +
                  "', '" +
                  buddyObj.identity +
                  '\')"><i class="fa fa-video-camera"></i></button></div>';
              }
            } else {
              recordingsHtml +=
                '<div><button class=roundButtons onclick="PlayAudioCallRecording(this, \'' +
                item.CdrId +
                "', '" +
                recording.uID +
                "', '" +
                buddyObj.identity +
                '\')"><i class="fa fa-play"></i></button></div>';
            }
            recordingsHtml +=
              '<div>' +
              lang.started +
              ': ' +
              StartTime.format(DisplayTimeFormat) +
              ' <i class="fa fa-long-arrow-right"></i> ' +
              lang.stopped +
              ': ' +
              StopTime.format(DisplayTimeFormat) +
              '</div>';
            recordingsHtml += '<div>' + lang.recording_duration + ': ' + formatShortDuration(recordingDuration.asSeconds()) + '</div>';
            recordingsHtml += '<div>';
            recordingsHtml += '<span id="cdr-video-meta-width-' + item.CdrId + '-' + recording.uID + '"></span>';
            recordingsHtml += '<span id="cdr-video-meta-height-' + item.CdrId + '-' + recording.uID + '"></span>';
            recordingsHtml += '<span id="cdr-media-meta-size-' + item.CdrId + '-' + recording.uID + '"></span>';
            recordingsHtml += '<span id="cdr-media-meta-codec-' + item.CdrId + '-' + recording.uID + '"></span>';
            recordingsHtml += '</div>';
            recordingsHtml += '</div>';
          }
        });
      }

      if (item.SrcUserId == profileUserID) {
        // (Outbound) You(profileUserID) initiated a call
        if (item.Billsec == '0') {
          formattedMessage += ' ' + lang.you_tried_to_make + ' ' + audioVideo + ' (' + item.ReasonText + ').';
        } else {
          formattedMessage += ' ' + lang.you_made + ' ' + audioVideo + ', ' + lang.and_spoke_for + ' ' + item.Billsec + '.';
        }
        var messageString = '<table class=ourChatMessage cellspacing=0 cellpadding=0><tr>';
        messageString += '<td style="padding-right:4px;">' + flag + '</td>';
        messageString += '<td class=ourChatMessageText onmouseenter="ShowChatMenu(this)" onmouseleave="HideChatMenu(this)">';
        messageString +=
          "<span onClick=\"ShowMessageMenu(this,'CDR','" +
          item.CdrId +
          "', '" +
          buddyObj.identity +
          '\')" class=chatMessageDropdown style="display:none"><i class="fa fa-chevron-down"></i></span>';
        messageString += '<div>' + formattedMessage + '</div>';
        messageString += '<div>' + CallTags + '</div>';
        messageString += '<div id=cdr-comment-' + item.CdrId + ' class=cdrComment>' + callComment + '</div>';
        messageString += '<div class=callRecordings>' + recordingsHtml + '</div>';
        messageString += '<div class=messageDate>' + DateTime + '</div>';
        messageString += '</td>';
        messageString += '</tr></table>';
      } else {
        // (Inbound) you(profileUserID) received a call
        if (item.Billsec == '0') {
          formattedMessage += ' ' + lang.you_missed_a_call + ' (' + item.ReasonText + ').';
        } else {
          formattedMessage += ' ' + lang.you_received + ' ' + audioVideo + ', ' + lang.and_spoke_for + ' ' + item.Billsec + '.';
        }
        var messageString = '<table class=theirChatMessage cellspacing=0 cellpadding=0><tr>';
        messageString += '<td class=theirChatMessageText onmouseenter="ShowChatMenu(this)" onmouseleave="HideChatMenu(this)">';
        messageString +=
          "<span onClick=\"ShowMessageMenu(this,'CDR','" +
          item.CdrId +
          "', '" +
          buddyObj.identity +
          '\')" class=chatMessageDropdown style="display:none"><i class="fa fa-chevron-down"></i></span>';
        messageString += '<div style="text-align:left">' + formattedMessage + '</div>';
        messageString += '<div>' + CallTags + '</div>';
        messageString += '<div id=cdr-comment-' + item.CdrId + ' class=cdrComment>' + callComment + '</div>';
        messageString += '<div class=callRecordings>' + recordingsHtml + '</div>';
        messageString += '<div class=messageDate> ' + DateTime + '</div>';
        messageString += '</td>';
        messageString += '<td style="padding-left:4px">' + flag + '</td>';
        messageString += '</tr></table>';
      }
      // Messages are prepended here, and appended when logging
      $('#contact-' + buddyObj.identity + '-ChatHistory').prepend(messageString);
    } else if (item.ItemType == 'FILE') {
      // TODO
    } else if (item.ItemType == 'SMS') {
      // TODO
    }
  });

  // For some reason, the first time this fires, it doesn't always work
  updateScroll(buddyObj.identity);
  window.setTimeout(function () {
    updateScroll(buddyObj.identity);
  }, 300);
}
function AnswerAudioCall(lineNumber) {
  var lineObj = FindLineByNumber(lineNumber);
  if (lineObj == null) {
    console.warn('Failed to get line (' + lineNumber + ')');
    return;
  }
  var session = lineObj.SipSession;
  // Stop the ringtone
  if (session.data.ringerObj) {
    session.data.ringerObj.pause();
    session.data.ringerObj.removeAttribute('src');
    session.data.ringerObj.load();
    session.data.ringerObj = null;
  }
  // Check vitals
  if (HasAudioDevice == false) {
    Alert(lang.alert_no_microphone);
    $('#line-' + lineObj.LineNumber + '-msg').html(lang.call_failed);
    $('#line-' + lineObj.LineNumber + '-AnswerCall').hide();
    return;
  }

  // Update UI
  $('#line-' + lineObj.LineNumber + '-AnswerCall').hide();

  // Start SIP handling
  var supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
  var spdOptions = {
    sessionDescriptionHandlerOptions: {
      constraints: {
        audio: { deviceId: 'default' },
        video: false,
      },
    },
  };

  // Configure Audio
  var currentAudioDevice = getAudioSrcID();
  if (currentAudioDevice != 'default') {
    var confirmedAudioDevice = false;
    for (var i = 0; i < AudioinputDevices.length; ++i) {
      if (currentAudioDevice == AudioinputDevices[i].deviceId) {
        confirmedAudioDevice = true;
        break;
      }
    }
    if (confirmedAudioDevice) {
      spdOptions.sessionDescriptionHandlerOptions.constraints.audio.deviceId = { exact: currentAudioDevice };
    } else {
      console.warn('The audio device you used before is no longer available, default settings applied.');
      localDB.setItem('AudioSrcId', 'default');
    }
  }
  // Add additional Constraints
  if (supportedConstraints.autoGainControl) {
    spdOptions.sessionDescriptionHandlerOptions.constraints.audio.autoGainControl = AutoGainControl;
  }
  if (supportedConstraints.echoCancellation) {
    spdOptions.sessionDescriptionHandlerOptions.constraints.audio.echoCancellation = EchoCancellation;
  }
  if (supportedConstraints.noiseSuppression) {
    spdOptions.sessionDescriptionHandlerOptions.constraints.audio.noiseSuppression = NoiseSuppression;
  }

  // Save Devices
  lineObj.SipSession.data.withvideo = false;
  lineObj.SipSession.data.VideoSourceDevice = null;
  lineObj.SipSession.data.AudioSourceDevice = getAudioSrcID();
  lineObj.SipSession.data.AudioOutputDevice = getAudioOutputID();

  // Send Answer
  lineObj.SipSession.accept(spdOptions)
    .then(function () {
      onInviteAccepted(lineObj, false);
    })
    .catch(function (error) {
      console.warn('Failed to answer call', error, lineObj.SipSession);
      lineObj.SipSession.data.reasonCode = 500;
      lineObj.SipSession.data.reasonText = 'Client Error';
      teardownSession(lineObj);
    });
}
function endSession(lineNum) {
  var lineObj = FindLineByNumber(lineNum);
  if (lineObj == null || lineObj.SipSession == null) return;

  console.log('Ending call with: ' + lineNum);
  lineObj.SipSession.data.terminateby = 'us';
  lineObj.SipSession.data.reasonCode = 16;
  lineObj.SipSession.data.reasonText = 'Normal Call clearing';

  lineObj.SipSession.bye().catch(function (e) {
    console.warn('Failed to bye the session!', e);
  });

  $('#line-' + lineNum + '-msg').html(lang.call_ended);
  $('#line-' + lineNum + '-ActiveCall').hide();

  teardownSession(lineObj);

  updateLineScroll(lineNum);
}
function RejectCall(lineNumber) {
  var lineObj = FindLineByNumber(lineNumber);
  if (lineObj == null) {
    console.warn('Unable to find line (' + lineNumber + ')');
    return;
  }
  var session = lineObj.SipSession;
  if (session == null) {
    console.warn('Reject failed, null session');
    $('#line-' + lineObj.LineNumber + '-msg').html(lang.call_failed);
    $('#line-' + lineObj.LineNumber + '-AnswerCall').hide();
  }
  if (session.state == SIP.SessionState.Established) {
    session.bye().catch(function (e) {
      console.warn('Problem in RejectCall(), could not bye() call', e, session);
    });
  } else {
    session
      .reject({
        statusCode: 486,
        reasonPhrase: 'Busy Here',
      })
      .catch(function (e) {
        console.warn('Problem in RejectCall(), could not reject() call', e, session);
      });
  }
  $('#line-' + lineObj.LineNumber + '-msg').html(lang.call_rejected);

  session.data.terminateby = 'us';
  session.data.reasonCode = 486;
  session.data.reasonText = 'Busy Here';
  teardownSession(lineObj);
}
