import pool from "../util/db";

export const create_session =  async (req: any, res: any) => {
    const { subject, date, time, email } = req.body;
    const result = await pool.query(
      "INSERT INTO study_sessions (subject, date, time, email) VALUES ($1, $2, $3, $4) RETURNING *",
      [subject, date, time, email]
    );
    res.json(result.rows[0]);
  };

export const get_sessions = async (req: any, res: any) => {
    const result = await pool.query("SELECT * FROM study_sessions");
    res.json(result.rows);
  };

