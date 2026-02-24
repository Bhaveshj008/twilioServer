import express from "express";
import twilio from "twilio";

const app = express();

// Twilio webhooks are x-www-form-urlencoded by default
app.use(express.urlencoded({ extended: false }));

app.post("/voice/incoming", (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();

  // Optional: short prompt so caller knows they are being recorded
  twiml.say("This call may be recorded");

  // Record the caller's audio (no forwarding)
  twiml.record({
    // Where Twilio will POST when recording is complete
    recordingStatusCallback: "https://twilio-server-weld.vercel.app/voice/recording-status",
    recordingStatusCallbackEvent: ["completed"],

    // Optional but useful controls:
    // playBeep: true,
    // trim: "trim-silence",      // trims leading/trailing silence
    // maxLength: 3600,           // seconds (1 hour). set what you want
    // If you want caller to press a key to finish, uncomment:
    // finishOnKey: "#",
  });

  // After <Record> ends, Twilio continues. If you want to end call explicitly:
  twiml.hangup();

  res.type("text/xml").send(twiml.toString());
});

app.post("/voice/recording-status", (req, res) => {
  // Fields Twilio posts (common ones)
  const {
    CallSid,
    RecordingSid,
    RecordingUrl,
    RecordingStatus,
    RecordingDuration,
  } = req.body;

  console.log("Recording callback:", {
    CallSid,
    RecordingSid,
    RecordingUrl,
    RecordingStatus,
    RecordingDuration,
  });

  // IMPORTANT:
  // RecordingUrl may require auth depending on Twilio settings.
  // Store CallSid -> RecordingSid/Url in DB for retrieval.

  res.sendStatus(200);
});

app.listen(3000, () => console.log("Listening on :3000"));