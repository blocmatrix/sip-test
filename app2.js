var LS_USERNAME = 'LS_USERNAME';
var LS_CALL_TO = 'LS_CALL_TO';
var dialText = '200';

let sipUrl = 'pbx-2.testd.com';
let SipUsername = 'User1';
let SipPassword = '1234';

const appversion = '2.10';

let userAgent = null;
let inviteSession = null;

let audioBlobs = {};
let ringMedia = null;

const inviterOptions = {
  sessionDescriptionHandlerOptions: {
    constraints: {
      audio: { deviceId: 'default' },
      video: false,
    },
  },
};

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

  PreloadAudioFiles();
});

function PreloadAudioFiles() {
  audioBlobs.Ringtone = { file: 'Ringtone_1.mp3', url: 'media/Ringtone_1.mp3' };
  audioBlobs.EarlyMedia_UK = { file: 'Tone_EarlyMedia-UK.mp3', url: 'media/Tone_EarlyMedia-UK.mp3' };

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
    },
    authorizationUsername: SipUsername,
    authorizationPassword: SipPassword,
    logConfiguration: false,
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
  stopRing();
  inviteSession.accept(inviterOptions);
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
  inviteSession = new SIP.Inviter(userAgent, target, inviterOptions);
  inviteSession.stateChange.addListener((newState) => {
    console.log(newState, '---------newState');
  });
  inviteSession.delegate = {
    onMessage: function (sip) {},
    onInvite: function (sip) {},
    onBye: function (sip) {
      sip.accept();
      teardownSession();
    },
    onSessionDescriptionHandler: function (sessionDescriptionHandler) {
      onSessionDescriptionHandlerCreated(sessionDescriptionHandler);
    },
  };
  // inviter options
  var inviterOptions = {
    requestDelegate: {
      onTrying: function (sip) {},
      onRedirect: function (sip) {},
      onProgress: function (sip) {
        onInviteProgress(sip);
      },
      onAccept: function (sip) {
        onInviteAccepted(sip);
      },
      onReject: function (sip) {
        if (sip.message) alert(sip.message);
        teardownSession();
      },
    },
  };
  // invite
  inviteSession.invite(inviterOptions).catch((e) => {
    console.warn('Failed to send INVITE:', e);
  });
}

function onSessionDescriptionHandlerCreated(sessionDescriptionHandler) {
  if (sessionDescriptionHandler && sessionDescriptionHandler.peerConnection) {
    sessionDescriptionHandler.peerConnection.ontrack = function (event) {
      var peerConnection = inviteSession.sessionDescriptionHandler.peerConnection;
      var remoteAudioStream = new MediaStream();
      peerConnection.getTransceivers().forEach(function (transceiver) {
        // Add Media
        var receiver = transceiver.receiver;
        if (receiver.track?.kind == 'audio') {
          console.log('Adding Remote Audio Track');
          remoteAudioStream.addTrack(receiver.track);
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
    };
  } else {
    // error
  }
}
function onInviteProgress(response) {
  console.log('Call Progress:', response.message.statusCode);
  // 180 = Call is Ringing
  // 181 = Call is Being Forwarded
  // 182 = Call is queued (Busy server!)
  // 183 = Check!
  // 199 = Call is Terminated (Early Dialog)

  if (response.message.statusCode == 180) {
    ringMedia = new Audio(audioBlobs.EarlyMedia_UK.blob);
    ringMedia.preload = 'auto';
    ringMedia.loop = true;
    ringMedia.oncanplaythrough = function (e) {
      ringMedia?.play().then();
    };
  }
}

function onInviteAccepted(session) {
  stopRing();
}

function ReceiveCall(session) {
  inviteSession = session;
  // add buttons
  AddLineHtml();
  // ring
  ringMedia = new Audio(audioBlobs.Ringtone.blob);
  ringMedia.preload = 'auto';
  ringMedia.loop = true;
  ringMedia.oncanplaythrough = function (e) {
    ringMedia?.play();
  };
  // Session Delegates
  inviteSession.delegate = {
    onMessage: function (sip) {},
    onInvite: function (sip) {},
    onBye: function (sip) {
      sip.accept();
      teardownSession();
    },
    onSessionDescriptionHandler: function (sessionDescriptionHandler) {
      onSessionDescriptionHandlerCreated(sessionDescriptionHandler);
    },
  };
  // incomingInviteRequestDelegate
  inviteSession.incomingInviteRequest.delegate = {
    onCancel: function (sip) {
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

function stopRing() {
  if (ringMedia) {
    ringMedia.pause();
    ringMedia.load();
    ringMedia = null;
  }
}

function teardownSession() {
  console.log('teardownSession');
  $('#Phone').empty();
  stopRing();
}
