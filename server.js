import express from "express";
import twilio from "twilio";

const app = express();
// Twilio sends x-www-form-urlencoded webhooks
app.use(express.urlencoded({ extended: false }));

app.post("/voice/incoming", (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();

  // (Optional but common) Tell caller the call is recorded
  twiml.say("This call may be recorded.");

  const dial = twiml.dial({
    // records both legs starting when the forwarded party answers:
    record: "record-from-answer",
    // Twilio will POST here when recording is ready / completed:
    recordingStatusCallback: "https://twilio-server-weld.vercel.app/voice/recording-status",
    // pick events you care about:
    recordingStatusCallbackEvent: "completed",
  });

  // // Forward destination (E.164 format recommended)
  // dial.number("+919067872194");

  res.type("text/xml").send(twiml.toString());
});

app.post("/voice/recording-status", (req, res) => {
  // Twilio will send fields like RecordingSid, RecordingUrl, CallSid, etc.
  // Store these in DB mapped by CallSid.
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

  res.sendStatus(200);
});

app.listen(3000, () => console.log("Listening on :3000"));