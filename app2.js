var LS_USERNAME = 'LS_USERNAME';
var LS_CALL_TO = 'LS_CALL_TO';
var dialText = '200';

let sipUrl = 'pbx-2.testd.com';
let SipUsername = 'User1';
let SipPassword = '1234';

let userAgent = null;
let inviteSession = null;

$(document).ready(function () {
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
  // html += '<div style="display:none;">';
  // html += '<audio id="line-' + lineObj.LineNumber + '-remoteAudio"></audio>';
  // html += '</div>';

  html += '<button onclick="AnswerAudioCall()" class=answerButton><i class="fa fa-phone"></i> Answer Call </button> ';

  $('#Phone').append(html);
}

function AnswerAudioCall() {
  inviteSession.accept();
}

function DialByLine() {
  const target = SIP.UserAgent.makeURI(getUserAgentUri(dialText));
  // create inviter
  inviteSession = new SIP.Inviter(userAgent, target, {
    sessionDescriptionHandlerOptions: {
      constraints: { audio: true, video: false },
    },
  });
  inviteSession.stateChange.addListener((newState) => {
    console.log(newState, '---------newState');
  });
  // invite
  inviteSession
    .invite({
      sessionDescriptionHandlerOptions: {
        constraints: { audio: true, video: false },
      },
      requestDelegate: {
        // onTrying: (sip) => {},
        // onProgress: (sip) => {},
        // onRedirect: (sip) => {},
        // onReject: (sip) => {},
        onAccept: (sip) => {
          onInviteAccepted(sip);
        },
      },
    })
    .catch((e) => {
      console.warn('Failed to send INVITE:', e);
    });
}

function ReceiveCall(session) {
  inviteSession = session;
  AddLineHtml();
}

function onInviteAccepted(session) {
  console.log('---------onInviteAccepted');
}