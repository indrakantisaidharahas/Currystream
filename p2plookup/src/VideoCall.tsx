import React, { useRef, useState } from "react";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot
} from "firebase/firestore";
import { db } from "./firebase";

export default function VideoCall() {
  const [callId, setCallId] = useState("");
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);
  const pc = useRef<RTCPeerConnection>();

  // STUN server config
  const servers = {
    iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }]
  };

  async function startCall() {
    pc.current = new RTCPeerConnection(servers);

    // Local stream
    const localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    localStream.getTracks().forEach(track => {
      pc.current?.addTrack(track, localStream);
    });
    if (localRef.current) localRef.current.srcObject = localStream;

    // Remote stream
    const remoteStream = new MediaStream();
    if (remoteRef.current) remoteRef.current.srcObject = remoteStream;
    pc.current.ontrack = event => {
      event.streams[0].getTracks().forEach(track => {
        remoteStream.addTrack(track);
      });
    };

    // Firestore room
    const callDoc = doc(collection(db, "calls"));
    const offerCandidates = collection(callDoc, "offerCandidates");
    const answerCandidates = collection(callDoc, "answerCandidates");
    setCallId(callDoc.id);

    // ICE candidates
    pc.current.onicecandidate = event => {
      if (event.candidate) {
        setDoc(doc(offerCandidates), event.candidate.toJSON());
      }
    };

    // Create offer
    const offerDesc = await pc.current.createOffer();
    await pc.current.setLocalDescription(offerDesc);

    const offer = {
      sdp: offerDesc.sdp,
      type: offerDesc.type
    };
    await setDoc(callDoc, { offer });

    // Listen for answer
    onSnapshot(callDoc, snapshot => {
      const data = snapshot.data();
      if (!pc.current?.currentRemoteDescription && data?.answer) {
        const answerDesc = new RTCSessionDescription(data.answer);
        pc.current?.setRemoteDescription(answerDesc);
      }
    });

    // Listen for ICE candidates from callee
    onSnapshot(answerCandidates, snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type === "added") {
          const candidate = new RTCIceCandidate(change.doc.data());
          pc.current?.addIceCandidate(candidate);
        }
      });
    });
  }

  async function joinCall() {
    pc.current = new RTCPeerConnection(servers);

    const localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    localStream.getTracks().forEach(track => {
      pc.current?.addTrack(track, localStream);
    });
    if (localRef.current) localRef.current.srcObject = localStream;

    const remoteStream = new MediaStream();
    if (remoteRef.current) remoteRef.current.srcObject = remoteStream;
    pc.current.ontrack = event => {
      event.streams[0].getTracks().forEach(track => {
        remoteStream.addTrack(track);
      });
    };

    const callDoc = doc(db, "calls", callId);
    const offerCandidates = collection(callDoc, "offerCandidates");
    const answerCandidates = collection(callDoc, "answerCandidates");

    pc.current.onicecandidate = event => {
      if (event.candidate) {
        setDoc(doc(answerCandidates), event.candidate.toJSON());
      }
    };

    const callData = (await getDoc(callDoc)).data();
    if (!callData?.offer) return alert("Call not found");

    await pc.current.setRemoteDescription(new RTCSessionDescription(callData.offer));

    const answerDesc = await pc.current.createAnswer();
    await pc.current.setLocalDescription(answerDesc);

    const answer = {
      sdp: answerDesc.sdp,
      type: answerDesc.type
    };
    await updateDoc(callDoc, { answer });

    // Listen for ICE candidates from caller
    onSnapshot(offerCandidates, snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type === "added") {
          const candidate = new RTCIceCandidate(change.doc.data());
          pc.current?.addIceCandidate(candidate);
        }
      });
    });
  }

  return (
    <div>
      <h1>WebRTC Firebase Video Call</h1>
      <video ref={localRef} autoPlay playsInline muted style={{ width: "300px" }} />
      <video ref={remoteRef} autoPlay playsInline style={{ width: "300px" }} />

      <div>
        <button onClick={startCall}>Start Call</button>
        <input
          value={callId}
          onChange={e => setCallId(e.target.value)}
          placeholder="Enter Call ID"
        />
        <button onClick={joinCall}>Join Call</button>
      </div>
      <p>Call ID: {callId}</p>
    </div>
  );
}
