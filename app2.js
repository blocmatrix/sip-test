var LS_USERNAME = 'LS_USERNAME';
var LS_CALL_TO = 'LS_CALL_TO';
var dialText = '200';

let sipUrl = 'pbx-2.testd.com';
let SipUsername = 'User1';
let SipPassword = '1234';

const appversion = '2.6';

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

function AddLineHtml() {
  let html = '';
  html += '<div style="display:none;">';
  html += '<audio id="line-remoteAudio"></audio>';
  html += '</div>';

  html += '<button onclick="AnswerAudioCall()" class=answerButton><i class="fa fa-phone"></i> Answer Call </button>';
  html +=
    '<button onclick="RejectCall()" class=rejectButton><i class="fa fa-phone" style="transform: rotate(135deg);"></i> Reject Call </button>';

  html += '<div class=CallControlContainer>';
  // End Call
  html +=
    '<button onclick="endSession()" class="roundButtons dialButtons inCallButtons hangupButton" title="End Call"><i class="fa fa-phone" style="transform: rotate(135deg);"></i></button>';
  html += '</div>';

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
  AddLineHtml();
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
      sip.accept();
      teardownSession();
    },
    onMessage: function (sip) {
      console.log(sip, '----------------sip in onMessage');
      // onSessionReceivedMessage(sip);
    },
    onInvite: function (sip) {
      console.log(sip, '----------------sip in onInvite');
      // onSessionReinvited(sip);
    },
    onSessionDescriptionHandler: function (sdh, provisional) {
      console.log(sdh, provisional, ' -----------------sdh, provisional in onSessionDescriptionHandler');
      onSessionDescriptionHandlerCreated(sdh, provisional);
    },
  };
  // inviter options
  var inviterOptions = {
    requestDelegate: {
      // OutgoingRequestDelegate
      onTrying: function (sip) {
        console.log(sip, '----------------sip in onTrying');
        // onInviteTrying(sip);
      },
      onProgress: function (sip) {
        console.log(sip, '----------------sip in onProgress');
        // onInviteProgress(sip);
      },
      onRedirect: function (sip) {
        console.log(sip, '----------------sip in onRedirect');
        // onInviteRedirected(sip);
      },
      onAccept: function (sip) {
        onInviteAccepted(sip);
      },
      onReject: function (sip) {
        console.log(sip, '----------------sip in onReject');
        // onInviteRejected(sip);
      },
    },
  };
  // invite
  inviteSession.invite(inviterOptions).catch((e) => {
    console.warn('Failed to send INVITE:', e);
  });
}

function onSessionDescriptionHandlerCreated(sdh) {
  if (sdh) {
    if (sdh.peerConnection) {
      sdh.peerConnection.ontrack = function (event) {
        onTrackAddedEvent();
      };
    } else {
      console.warn('onSessionDescriptionHandler fired without a peerConnection');
    }
  } else {
    console.warn('onSessionDescriptionHandler fired without a sessionDescriptionHandler');
  }
}

function onTrackAddedEvent() {
  var peerConnection = inviteSession.sessionDescriptionHandler.peerConnection;

  var remoteAudioStream = new MediaStream();

  peerConnection.getTransceivers().forEach(function (transceiver) {
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
    var remoteAudio = $('#line-remoteAudio').get(0);
    remoteAudio.srcObject = remoteAudioStream;
    remoteAudio.onloadedmetadata = function (e) {
      if (typeof remoteAudio.sinkId !== 'undefined') {
        remoteAudio
          .setSinkId('default')
          .then(function () {
            console.log('sinkId applied: default');
          })
          .catch(function (e) {
            console.warn('Error using setSinkId: ', e);
          });
      }
      remoteAudio.play();
    };
  }
}

function onInviteAccepted(session) {
  console.log('---------onInviteAccepted');
}

function ReceiveCall(session) {
  inviteSession = session;
  AddLineHtml();
  // Session Delegates
  inviteSession.delegate = {
    onBye: function (sip) {
      console.log(sip, '----------------sip in onBye');
      sip.accept();
      teardownSession();
    },
    onMessage: function (sip) {
      console.log(sip, '----------------sip in onMessage');
      // onSessionReceivedMessage(sip);
    },
    onInvite: function (sip) {
      console.log(sip, '----------------sip in onInvite');
      // onSessionReinvited(sip);
    },
    onSessionDescriptionHandler: function (sdh, provisional) {
      console.log(sdh, provisional, ' -----------------sdh, provisional in onSessionDescriptionHandler');
      onSessionDescriptionHandlerCreated(sdh, provisional);
    },
  };
  // incomingInviteRequestDelegate
  inviteSession.incomingInviteRequest.delegate = {
    onCancel: function (sip) {
      console.log(sip, '----------------sip in onCancel');
      endSession();
    },
  };
}

function endSession() {
  inviteSession?.bye().catch(function (e) {
    console.warn('Failed to bye the session!', e);
  });
  teardownSession();
}

function teardownSession() {
  console.log('teardownSession');
  $('#Phone').empty();
}
