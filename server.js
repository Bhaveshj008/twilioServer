import express from "express";
import twilio from "twilio";

const app = express();
app.use(express.urlencoded({ extended: false }));

app.post("/voice/incoming", (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();

  // Start full call recording (no silence detection)
  twiml.start().recording({
    recordingStatusCallback:
      "https://localdesktop.ngrok.app/automate/voice/recording-status",
    recordingStatusCallbackEvent: ["completed"],
  });

  // Keep call alive (VERY IMPORTANT)
  twiml.pause({ length: 3600 });

  res.type("text/xml").send(twiml.toString());
});

app.post("/voice/recording-status", (req, res) => {
  const {
    CallSid,
    RecordingSid,
    RecordingUrl,
    RecordingDuration,
    RecordingStatus,
  } = req.body;

  console.log("FULL recording callback:", {
    CallSid,
    RecordingSid,
    RecordingUrl,
    RecordingDuration,
    RecordingStatus,
  });

  res.sendStatus(200);
});

app.listen(3000, () => console.log("Listening on :3000"));
