import pool from "../util/db";
import Redis from 'ioredis';

const redis = new Redis({
  host: 'localhost', 
  port: 6379,                
});

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

export const get_documents = async (req, res) => {
  const cacheKey = 'public_documents';
  
  try {
    // Check if the data exists in Redis
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return res.status(200).json({ message: "Documents fetched from cache", documents: JSON.parse(cachedData) });
    }

    // If data isn't in cache, fetch it from the database
    const result = await pool.query("SELECT * FROM documents WHERE access_type='public'");
    
    // Cache the data in Redis for 1 hour
    await redis.setex(cacheKey, 3600, JSON.stringify(result.rows));

    return res.status(200).json({ message: "Documents fetched from database", documents: result.rows });

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
