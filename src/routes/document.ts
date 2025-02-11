import pool from "../util/db";

export const create_document = async (req: any, res: any) => {
    const { access_type, users, content } = req.body;

    if (!access_type || !users || !content) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const result = await pool.query(
            `INSERT INTO documents (access_type, users, content) 
             VALUES ($1, $2, $3) RETURNING *`,
            [access_type, users, content]
        );

        return res.status(201).json({ message: "Document created", document: result.rows[0] });
    } catch (error) {
        console.error("Error inserting document:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const delete_document = async (req: any, res: any) => {
    const { uuid } = req.params;

    if (!uuid) {
        return res.status(400).json({ error: "UUID is required" });
    }

    try {
        const result = await pool.query(
            `DELETE FROM documents WHERE uuid = $1 RETURNING *`,
            [uuid]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Document not found" });
        }

        return res.status(200).json({ message: "Document deleted", document: result.rows[0] });
    } catch (error) {
        console.error("Error deleting document:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const update_document = async (req: any, res: any) => {
    const { uuid } = req.params;
    const { access_type, users, content } = req.body;

    if (!uuid) {
        return res.status(400).json({ error: "UUID is required" });
    }

    try {
        const result = await pool.query(
            `UPDATE documents 
             SET access_type = COALESCE($1, access_type),
                 users = COALESCE($2, users),
                 content = COALESCE($3, content),
                 modified_date = CURRENT_TIMESTAMP
             WHERE uuid = $4 RETURNING *`,
            [access_type, users, content, uuid]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Document not found" });
        }

        return res.status(200).json({ message: "Document updated", document: result.rows[0] });
    } catch (error) {
        console.error("Error updating document:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
