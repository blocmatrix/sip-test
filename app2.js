var LS_USERNAME = 'LS_USERNAME';
var LS_CALL_TO = 'LS_CALL_TO';
var dialText = '200';

let sipUrl = 'pbx-2.testd.com';
let SipUsername = 'User1';
let SipPassword = '1234';

const appversion = '2.2';

let userAgent = null;
let inviteSession = null;

let HasVideoDevice = false;
let HasAudioDevice = false;
let HasSpeakerDevice = false;
let AudioinputDevices = [];
let VideoinputDevices = [];
let SpeakerDevices = [];

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

  DetectDevices();
});

function DetectDevices() {
  navigator.mediaDevices
    .enumerateDevices()
    .then(function (deviceInfos) {
      console.log(deviceInfos, '---------deviceInfos');
      HasAudioDevice = false;
      HasSpeakerDevice = false; // Safari and Firefox don't have these
      AudioinputDevices = [];
      SpeakerDevices = [];
      for (var i = 0; i < deviceInfos.length; ++i) {
        if (deviceInfos[i].kind === 'audioinput') {
          HasAudioDevice = true;
          AudioinputDevices.push(deviceInfos[i]);
        } else if (deviceInfos[i].kind === 'audiooutput') {
          HasSpeakerDevice = true;
          SpeakerDevices.push(deviceInfos[i]);
        }
      }
      var supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
      console.log(supportedConstraints, '-------supportedConstraints');
    })
    .catch(function (e) {
      console.error('Error enumerating devices', e);
    });
}

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

const getUserAgentUri = (username) => `sip:${username}@${sipUrl}`;

function register() {
  // create user agent
  userAgent = new SIP.UserAgent({
    uri: SIP.UserAgent.makeURI(getUserAgentUri(SipUsername)),
    transportOptions: {
      server: `wss://${sipUrl}:4443/ws`,
      traceSip: false,
      connectionTimeout: 15,
    },
    sessionDescriptionHandlerFactoryOptions: {
      peerConnectionConfiguration: {
        bundlePolicy: 'balanced',
      },
      iceGatheringTimeout: 500,
    },
    authorizationUsername: SipUsername,
    authorizationPassword: SipPassword,
    logConfiguration: false,
    // userAgentString: '',
    hackIpInContact: true,
    autoStart: false,
    autoStop: true,
    register: false,
    noAnswerTimeout: 120,
    delegate: {
      onInvite: function (sip) {
        ReceiveCall(sip);
      },
    },
  });
  // register user agent
  const registerer = new SIP.Registerer(userAgent);
  // check fo state change
  registerer.stateChange.addListener((newState) => {
    console.log('User Agent Registration State:', newState);
    switch (newState) {
      case SIP.RegistererState.Initial:
        // Nothing to do
        break;
      case SIP.RegistererState.Registered:
        onRegistered();
        break;
      case SIP.RegistererState.Unregistered:
        onUnregistered();
        break;
      case SIP.RegistererState.Terminated:
        // Nothing to do
        break;
    }
  });

  // Start the user agent
  userAgent
    .start()
    .then(() => {
      registerer.register();
    })
    .catch((error) => {
      console.error('Registration failed:', error);
    });
}

function onRegistered() {
  userAgent.registrationCompleted = true;
  if (!userAgent.isReRegister) {
    console.log('Registered!');
    // Output to status
    $('#regStatus').html('Registered');
    // Start Subscribe Loop
    // window.setTimeout(function () {
    //   SubscribeAll();
    // }, 500);
    userAgent.registering = false;
  } else {
    userAgent.registering = false;
    console.log('ReRegistered!');
  }
  userAgent.isReRegister = true;
}

function AddLineHtml() {
  let html = '';
  html += '<div style="display:none;">';
  html += '<audio id="line-remoteAudio"></audio>';
  html += '</div>';

  html += '<button onclick="AnswerAudioCall()" class=answerButton><i class="fa fa-phone"></i> Answer Call </button>';
  html +=
    '<button onclick="RejectCall()" class=rejectButton><i class="fa fa-phone" style="transform: rotate(135deg);"></i> Reject Call </button>';

  $('#Phone').append(html);
}

function AnswerAudioCall() {
  inviteSession.accept();
}

function RejectCall() {
  if (inviteSession.state == SIP.SessionState.Established) {
    inviteSession.bye().catch(function (e) {
      console.warn('Problem in RejectCall(), could not bye() call', e, inviteSession);
    });
  } else {
    inviteSession
      .reject({
        statusCode: 486,
        reasonPhrase: 'Busy Here',
      })
      .catch(function (e) {
        console.warn('Problem in RejectCall(), could not reject() call', e, inviteSession);
      });
  }
  teardownSession();
}

function DialByLine() {
  // devices
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
  if (supportedConstraints.autoGainControl) spdOptions.sessionDescriptionHandlerOptions.constraints.audio.autoGainControl = true;
  if (supportedConstraints.echoCancellation) spdOptions.sessionDescriptionHandlerOptions.constraints.audio.echoCancellation = true;
  if (supportedConstraints.noiseSuppression) spdOptions.sessionDescriptionHandlerOptions.constraints.audio.noiseSuppression = true;
  // make Target
  const target = SIP.UserAgent.makeURI(getUserAgentUri(dialText));
  // create inviter
  inviteSession = new SIP.Inviter(userAgent, target);
  inviteSession.stateChange.addListener((newState) => {
    console.log(newState, '---------newState');
  });
  inviteSession.delegate = {
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
      // onSessionDescriptionHandlerCreated(lineObj, sdh, provisional, false);
    },
  };
  // inviter options
  var inviterOptions = {
    requestDelegate: {
      // OutgoingRequestDelegate
      onTrying: function (sip) {
        console.log(sip, '----------------sip in onTrying');
        // onInviteTrying(lineObj, sip);
      },
      onProgress: function (sip) {
        console.log(sip, '----------------sip in onProgress');
        // onInviteProgress(lineObj, sip);
      },
      onRedirect: function (sip) {
        console.log(sip, '----------------sip in onRedirect');
        // onInviteRedirected(lineObj, sip);
      },
      onAccept: function (sip) {
        onInviteAccepted(sip);
      },
      onReject: function (sip) {
        console.log(sip, '----------------sip in onReject');
        // onInviteRejected(lineObj, sip);
      },
    },
  };
  // invite
  inviteSession.invite(inviterOptions).catch((e) => {
    console.warn('Failed to send INVITE:', e);
  });
}

function onSessionDescriptionHandlerCreated(lineObj, sdh, provisional, includeVideo) {
  if (sdh) {
    if (sdh.peerConnection) {
      // console.log(sdh);
      sdh.peerConnection.ontrack = function (event) {
        // console.log(event);
        onTrackAddedEvent(lineObj, includeVideo);
      };
      // sdh.peerConnectionDelegate = {
      //     ontrack: function(event){
      //         console.log(event);
      //         onTrackAddedEvent(lineObj, includeVideo);
      //     }
      // }
    } else {
      console.warn('onSessionDescriptionHandler fired without a peerConnection');
    }
  } else {
    console.warn('onSessionDescriptionHandler fired without a sessionDescriptionHandler');
  }
}

function ReceiveCall(session) {
  inviteSession = session;
  AddLineHtml();
}

function onInviteAccepted(session) {
  console.log('---------onInviteAccepted');
}

function teardownSession() {
  console.log('teardownSession');
  $('#Phone').append(html);
}
