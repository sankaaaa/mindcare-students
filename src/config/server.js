import express from "express";
import cors from "cors";
import { EmailProvider } from "./EmailProvider.js";

const app = express();
app.use(cors());
app.use(express.json());

const emailProvider = new EmailProvider();

app.post("/api/send-registration-email", async (req, res) => {
    try {
        const { email, name } = req.body;
        await emailProvider.sendRegistrationEmail(email, name);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: true });
    }
});

app.post("/api/send-booking-email", async (req, res) => {
    try {
        const { email, therapistName, date, time } = req.body;
        await emailProvider.sendBookingEmail(email, therapistName, date, time);
        res.json({ success: true });
    } catch {
        res.status(500).json({ error: true });
    }
});

app.post("/api/send-cancel-email", async (req, res) => {
    try {
        const { email, therapistName, date, time } = req.body;
        await emailProvider.sendCancelEmail(email, therapistName, date, time);
        res.json({ success: true });
    } catch {
        res.status(500).json({ error: true });
    }
});

app.post("/api/send-reminder-24h", async (req, res) => {
    try {
        const { email, therapistName, date, time } = req.body;
        await emailProvider.sendReminder24h(email, therapistName, date, time);
        res.json({ success: true });
    } catch {
        res.status(500).json({ error: true });
    }
});

app.post("/api/send-reminder-1h", async (req, res) => {
    try {
        const { email, therapistName, date, time } = req.body;
        await emailProvider.sendReminder1h(email, therapistName, date, time);
        res.json({ success: true });
    } catch {
        res.status(500).json({ error: true });
    }
});

app.post("/api/send-new-client-email", async (req, res) => {
    try {
        const { email, clientName, date, time } = req.body;
        await emailProvider.notifyTherapistNewClient(email, clientName, date, time);
        res.json({ success: true });
    } catch {
        res.status(500).json({ error: true });
    }
});

const PORT = 4000;
app.listen(PORT, () => console.log("Server started on port", PORT));
