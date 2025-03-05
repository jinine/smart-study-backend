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

        return res.status(201).json({ message: "Document created", document: result.rows });
    } catch (error) {
        console.error("Error inserting document:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const get_documents = async (req: any, res: any) => {

    try {
        const result = await pool.query(
            `SELECT * FROM documents WHERE access_type='public'`
        );

        return res.status(201).json({ message: "Documents fetched successfully", documents: result.rows });
    } catch (error) {
        console.error("Error fetching documents", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const get_authorized_documents = async (req: any, res: any) => {
    const { users } = req.body;

    try {
        const result = await pool.query(
            `SELECT * FROM documents 
            WHERE users LIKE $1 OR users = ''`, 
            [`%${users}%`]
        );
        return res.status(201).json({ message: "Documents fetched successfully", documents: result.rows });
    } catch (error) {
        console.error("Error fetching documents", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const get_document_by_uuid = async (req: any, res: any) => {
    const { uuid } = req.params;

    if (!uuid) {
        return res.status(400).json({ error: "UUID is required" });
    }

    try {
        const result = await pool.query(
            `SELECT * FROM documents WHERE uuid = $1`,
            [uuid]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Document not found" });
        }

        return res.status(200).json({
            message: "Document fetched successfully",
            document: result.rows[0],
        });
    } catch (error) {
        console.error("Error fetching document", error);
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
