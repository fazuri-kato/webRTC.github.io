let localVideo = document.getElementById("localVideo");
let remoteVideo = document.getElementById("remoteVideo");
let localStream;
let peerConnection = new RTCPeerConnection();
let candidates = [];

// ローカルメディアストリームを取得
navigator.mediaDevices
  .getUserMedia({ video: true, audio: true })
  .then((stream) => {
    localStream = stream;
    localVideo.srcObject = localStream;
    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });
    console.log("Local stream added.");
  })
  .catch((error) => console.error("MediaStream error:", error));

peerConnection.ontrack = function (event) {
  remoteVideo.srcObject = event.streams[0];
  console.log("Remote stream added. : ", event);
};

peerConnection.onicecandidate = function (event) {
  if (event.candidate) {
    let candidate = JSON.stringify(event.candidate);
    candidates.push(candidate);
    document.getElementById("candidate").textContent =
      JSON.stringify(candidates);
    console.log("New ICE candidate:", event.candidate);
  }
};

// 原因は詳しくわからないが初回offerCreate時にcandidate情報がなく、
// 2回目以降に含まれるので一回捨てで作成
// peerConnection.createOffer().then((offer) => {
//   return peerConnection.setLocalDescription(offer);
// });

// Offerを生成し、ローカルディスクリプションとしてセット
function createOffer() {
  peerConnection
    .createOffer()
    .then((offer) => {
      return peerConnection.setLocalDescription(offer);
    })
    .then(() => {
      document.getElementById("sdpTextarea").value = JSON.stringify(
        peerConnection.localDescription
      );
      console.log("Offer created and set as local description.");
    })
    .catch((error) => console.error("Failed to create offer:", error));
}

// リモートのSDPをセットし、Answerを生成
function setRemoteSDP() {
  const remoteDescription = JSON.parse(
    document.getElementById("sdpTextarea").value
  );
  peerConnection
    .setRemoteDescription(new RTCSessionDescription(remoteDescription))
    .then(() => {
      console.log("Remote description set. Generating answer...");
      return peerConnection.createAnswer();
    })
    .then((answer) => {
      return peerConnection.setLocalDescription(answer);
    })
    .then(() => {
      document.getElementById("sdpTextarea").value = JSON.stringify(
        peerConnection.localDescription
      );
      console.log(
        "Answer created and set as local description. Copy this SDP back to the initiator."
      );
    })
    .catch((error) => console.error("Failed to create answer:", error));
}

// リモートのanswerSDPをセット
function setAnswer() {
  const remoteDescription = JSON.parse(
    document.getElementById("sdpTextarea").value
  );
  peerConnection
    .setRemoteDescription(new RTCSessionDescription(remoteDescription))
    .then(() => {
      console.log("answer Remote description set.");
    })
    .catch((error) => console.error("Failed set answer:", error));
}

peerConnection.oniceconnectionstatechange = function () {
  console.log(
    `ICE connection state change: ${peerConnection.iceConnectionState}`
  );
};

// 相手からもらったcandidateのリストをセット
function setCandidates() {
  const remoteCandidates = JSON.parse(
    document.getElementById("candidateTextarea").value
  );
  remoteCandidates.forEach((remoteCandidate) => {
    console.log("candidate : ", remoteCandidate);
    peerConnection
      .addIceCandidate(new RTCIceCandidate(remoteCandidate))
      .then(() => {
        console.log("set candidate");
      })
      .catch((e) => console.error("Faild set candidate: ", e));
  });
}
