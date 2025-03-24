import pool from "../util/db";
import OpenAI from "openai";
import { v4 as uuidv4 } from 'uuid';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const summarize = async (req: any, res: any) => {
    try {
        const { text, users } = req.body;
        if (!text || !users) {
            return res.status(400).json({ error: "Text and users are required" });
        }

        const prompt = `
        Summarize the following:
        ---
        ${text}
        ---
        `;

        const response: any = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
        });

        let rawOutput: any = response.choices[0].message.content.trim();
        if (!rawOutput) {
            throw new Error("Empty AI response");
        }

        res.json({ message: "Summary Complete", data: rawOutput });
    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ error: "Failed to generate cue cards" });
    }
};

export const rewrite = async (req: any, res: any) => {
    try {
        const { text, tone } = req.body;
        if (!text) {
            return res.status(400).json({ error: "Text is required" });
        }

        const prompt = `
        Rewrite the following text in a ${tone || "professional"} tone, be sure to keep the right html tags:
        ---
        ${text}
        ---
        Format:
        {"rewrite": new text (formatted)}
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
        });

        let rawOutput = response.choices[0].message.content?.trim();
        res.json({ message: "Rewrite Complete", data: rawOutput });

    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ error: "Failed to rewrite text" });
    }
};

export const grammarCheck = async (req: any, res: any) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: "Text is required" });
        }

        const prompt = `
        Check the following text for grammar and spelling mistakes, and provide the corrected version:
        ---
        ${text}
        ---
         Format:
        {"previous-text": existing text...., "new-text": fixed text}
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
        });

        let rawOutput = response.choices[0].message.content?.trim();
        res.json({ message: "Grammar Check Complete", data: rawOutput });

    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ error: "Failed to check grammar" });
    }
};



export const generate_cue_cards = async (req: any, res: any) => {
    try {
        const { title, text, users } = req.body;
        const newUuid = uuidv4();
        if (!text || !users) {
            return res.status(400).json({ error: "Text and users are required" });
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
                INSERT INTO cue_cards (title, question, answer, access_type, users, group_uuid) 
                VALUES ($1, $2, $3, 'restricted', $4, $5) RETURNING *;
            `;

            const savedCueCards = [];
            for (const card of cueCards) {
                const { question, answer } = card;
                const result = await client.query(insertQuery, [title, question, answer, users, newUuid]);
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
        const { users } = req.body;

        if (!users || !Array.isArray(users) || users.length === 0) {
            return res.status(400).json({ error: "Invalid or missing users array" });
        }

        const result = await pool.query(
            `
            SELECT DISTINCT ON (group_uuid) * 
            FROM cue_cards 
            WHERE users = ANY($1) 
            ORDER BY group_uuid, created_at DESC;
            `,
            [users]
        );

        res.json(result.rows);
    } catch (error) {
        console.error("Database Fetch Error:", error);
        res.status(500).json({ error: "Failed to fetch cue cards" });
    }
};

export const get_cue_cards_by_group = async (req: any, res: any) => {
    const { group_uuid } = req.params; // Extract group_uuid from URL parameters

    if (!group_uuid) {
        return res.status(400).json({ error: "group_uuid is required" });
    }

    try {
        const result = await pool.query(
            `
            SELECT * 
            FROM cue_cards 
            WHERE group_uuid = $1
            ORDER BY created_at DESC;
            `,
            [group_uuid]
        );

        res.json(result.rows);
    } catch (error) {
        console.error("Database Fetch Error:", error);
        res.status(500).json({ error: "Failed to fetch cue cards" });
    }
};

export const get_cue_cards_by_user= async (req: any, res: any) => {
    const { user } = req.body; 

    if (!user) {
        return res.status(400).json({ error: "user is required" });
    }

    try {
        const result = await pool.query(
            `
            SELECT * 
            FROM cue_cards 
            WHERE users = $1
            ORDER BY created_at DESC;
            `,
            [user]
        );

        res.json(result.rows);
    } catch (error) {
        console.error("Database Fetch Error:", error);
        res.status(500).json({ error: "Failed to fetch cue cards" });
    }
};

export const get_cue_card_groups = async (req: any, res: any) => {
    const { user } = req.body;

    if (!user) {
        return res.status(400).json({ error: "user is required" });
    }

    try {
        const result = await pool.query(
            `
            SELECT DISTINCT ON (group_uuid, title) * 
            FROM cue_cards
            WHERE users = $1
            ORDER BY group_uuid, title, created_at DESC;
            `,
            [user]
        );

        res.json(result.rows);
    } catch (error) {
        console.error("Database Fetch Error:", error);
        res.status(500).json({ error: "Failed to fetch cue cards" });
    }
};

export const create_cue_card = async (req: any, res: any) => {
    const { title, question, answer, access_type, users, group_uuid } = req.body;

    // Validate inputs
    if (!title || !question || !answer || !users || !group_uuid) {
        return res.status(400).json({ error: "All fields are required: title, question, answer, users, group_uuid" });
    }

    // Validate access_type
    const validAccessTypes = ['public', 'restricted'];
    if (access_type && !validAccessTypes.includes(access_type)) {
        return res.status(400).json({ error: "Invalid access_type. Must be 'public' or 'restricted'" });
    }

    try {
        // Insert new cue card into the database
        const result = await pool.query(
            `
            INSERT INTO cue_cards (title, question, answer, access_type, users, group_uuid)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
            `,
            [title, question, answer, access_type || 'public', users, group_uuid]
        );

        // Return the created cue card
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Database Insert Error:", error);
        res.status(500).json({ error: "Failed to create cue card" });
    }
};


export const edit_cue_card = async (req: any, res: any) => {
    try {
        const { id, title, question, answer, access_type, users, group_uuid } = req.body;

        // Validate required fields
        if (!id || !title || !question || !answer || !access_type || !users || !group_uuid) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const result = await pool.query(
            `
            UPDATE cue_cards
            SET title = $1, question = $2, answer = $3, access_type = $4, users = $5, group_uuid = $6
            WHERE id = $7
            RETURNING *;
            `,
            [title, question, answer, access_type, users, group_uuid, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Cue card not found" });
        }

        res.json(result.rows[0]); // Return updated cue card
    } catch (error) {
        console.error("Database Update Error:", error);
        res.status(500).json({ error: "Failed to update cue card" });
    }
};

export const delete_cue_card = async (req: any, res: any) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: "Missing cue card ID" });
        }

        const result = await pool.query(
            `
            DELETE FROM cue_cards
            WHERE id = $1
            RETURNING *;
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Cue card not found" });
        }

        res.json({ message: "Cue card deleted successfully", deletedCard: result.rows[0] });
    } catch (error) {
        console.error("Database Delete Error:", error);
        res.status(500).json({ error: "Failed to delete cue card" });
    }
};
