import pool from "../util/db";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const generate_cue_cards = async (req: any, res: any) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: "No text provided" });
        }

        const prompt = `
        Extract key questions and answers from the following text and return them in JSON format.
        Respond ONLY with a valid JSON array. Do NOT include markdown formatting or extra text.
        ---
        ${text}
        ---
        Format:
        [{"question": "What is React?", "answer": "React is a JavaScript library for building UI."}]
        `;

        const response: any = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
        });

        let rawOutput: any = response.choices[0].message.content.trim();
        const cleanedOutput = rawOutput.replace(/^```json\n/, "").replace(/\n```$/, "");

        let cueCards;
        try {
            cueCards = JSON.parse(cleanedOutput);
        } catch (parseError) {
            console.error("JSON Parse Error:", parseError);
            return res.status(500).json({ error: "AI response was not valid JSON", raw: cleanedOutput });
        }

        const client = await pool.connect();
        try {
            const insertQuery = `
                INSERT INTO cue_cards (question, answer) VALUES ($1, $2) RETURNING *;
            `;

            const savedCueCards = [];
            for (const card of cueCards) {
                const { question, answer } = card;
                const result = await client.query(insertQuery, [question, answer]);
                savedCueCards.push(result.rows[0]);
            }

            res.json({ message: "Cue cards saved successfully", data: savedCueCards });
        } catch (dbError) {
            console.error("Database Error:", dbError);
            res.status(500).json({ error: "Failed to save cue cards to database" });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ error: "Failed to generate cue cards" });
    }
};


export const get_cue_cards = async (req: any, res: any) => {
    try {
        const result = await pool.query("SELECT * FROM cue_cards ORDER BY created_at DESC;");
        res.json(result.rows);
    } catch (error) {
        console.error("Database Fetch Error:", error);
        res.status(500).json({ error: "Failed to fetch cue cards" });
    }
};

