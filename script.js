const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");
const remoteAudio = document.getElementById("remoteAudio");
let localStream;
let remoteStream;
let peerConnection;

document.getElementById("createOffer").addEventListener("click", async () => {
  console.log("on click createOffer");
  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });
  localVideo.srcObject = localStream;

  peerConnection = new RTCPeerConnection();
  localStream
    .getTracks()
    .forEach((track) => peerConnection.addTrack(track, localStream));

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      console.log("New ICE candidate:", event.candidate);
    }
  };

  peerConnection.ontrack = (event) => {
    console.log("event : ", event);
    if (event.track.kind == "audio") {
      console.log("audio");
      remoteAudio.srcObject = event.streams[0];
    }
    if (event.track.kind == "video") {
      console.log("video");
      remoteVideo.srcObject = event.streams[0];
    }
  };

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  document.getElementById("localOffer").value = JSON.stringify(offer);
});

document.getElementById("setOffer").addEventListener("click", async () => {
  console.log("on click setOffer");
  const offer = JSON.parse(document.getElementById("remoteOffer").value);
  peerConnection = new RTCPeerConnection();
  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });
  localVideo.srcObject = localStream;

  localStream
    .getTracks()
    .forEach((track) => peerConnection.addTrack(track, localStream));

  peerConnection.ontrack = (event) => {
    console.log("event : ", event);
    if (event.track.kind == "audio") {
      console.log("audio");
      remoteAudio.srcObject = event.streams[0];
    }
    if (event.track.kind == "video") {
      console.log("video");
      remoteVideo.srcObject = event.streams[0];
    }
  };

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      console.log("New ICE candidate:", event.candidate);
    }
  };

  await peerConnection.setRemoteDescription(offer);
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  document.getElementById("localOffer").value = JSON.stringify(answer);
});

document.getElementById("setAnswer").addEventListener("click", async () => {
  console.log("on click setAnswer");
  const answer = JSON.parse(document.getElementById("localOffer").value);
  await peerConnection.setRemoteDescription(answer);
});
