import express from "express";
import twilio from "twilio";

const app = express();
app.use(express.urlencoded({ extended: false }));

app.post("/voice/incoming", (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();

  // Optional prompt (remove if you want silent auto-answer)
  twiml.say("This call may be recorded.");

  // Exactly ONE <Record> => exactly ONE recording per call
  twiml.record({
    recordingStatusCallback:
      "https://localdesktop.ngrok.app/automate/voice/recording-status",
    recordingStatusCallbackEvent: ["completed"],

    // Keep it simple: no trim, no beep, no finish key
    // Twilio will stop when the caller hangs up OR when it hits maxLength/timeout defaults.
    // If you want it to keep going until hangup, set a big maxLength:
    maxLength: 3600, // 1 hour (raise if you want)
  });

  // If recording ends (hangup / maxLength), end the call.
  twiml.hangup();

  res.type("text/xml").send(twiml.toString());
});

app.post("/voice/recording-status", (req, res) => {
  // Twilio will hit this ONCE when recording completes (with the config above)
  const {
    CallSid,
    RecordingSid,
    RecordingUrl,
    RecordingDuration,
    RecordingStatus,
  } = req.body;

  console.log("ONE recording callback:", {
    CallSid,
    RecordingSid,
    RecordingUrl,
    RecordingDuration,
    RecordingStatus,
  });

  res.sendStatus(200);
});

app.listen(3000, () => console.log("Listening on :3000"));