const db = require("../../db/database");


const addTerm = async (req, res) => {
    const { signup_id } = req.user;
    const { terms } = req.body; // expect an array of term strings
  
    if (!Array.isArray(terms) || terms.length === 0) {
      return res.status(400).json({ message: "Terms array is required" });
    }
  
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
  
      // Count existing terms for the user
      const [countResult] = await connection.query(
        "SELECT COUNT(*) AS count FROM terms_conditions WHERE signup_id = ?",
        [signup_id]
      );
  
      const existingCount = countResult[0].count;
      const remainingSlots = 4 - existingCount;
  
      if (remainingSlots <= 0) {
        await connection.rollback();
        return res
          .status(400)
          .json({ message: "Maximum 4 terms already exist for this user" });
      }
  
      if (terms.length > remainingSlots) {
        await connection.rollback();
        return res
          .status(400)
          .json({
            message: `You can only add ${remainingSlots} more term(s)`,
          });
      }
  
      // Insert terms one by one
      for (let term_text of terms) {
        term_text = term_text.trim();
        if (!term_text) continue; // skip empty strings
        await connection.query(
          "INSERT INTO terms_conditions (signup_id, term_text) VALUES (?, ?)",
          [signup_id, term_text]
        );
      }
  
      await connection.commit();
      res.status(201).json({ message: "Terms added successfully" });
    } catch (err) {
      await connection.rollback();
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ message: "One or more terms already exist" });
      }
      console.error(err);
      res.status(500).json({ message: "Server error" });
    } finally {
      connection.release();
    }
  };

// Update term with transaction
const updateTerm = async (req, res) => {
  const { signup_id } = req.user;
  const { term_id } = req.params;
  const { term_text } = req.body;

  if (!term_text || term_text.trim() === "") {
    return res.status(400).json({ message: "Term text is required" });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      "UPDATE terms_conditions SET term_text = ? WHERE terms_id = ? AND signup_id = ?",
      [term_text.trim(), term_id, signup_id]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Term not found" });
    }

    await connection.commit();
    res.status(200).json({ message: "Term updated successfully" });
  } catch (err) {
    await connection.rollback();
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "This term already exists" });
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
  } finally {
    connection.release();
  }
};

// Delete term with transaction
const deleteTerm = async (req, res) => {
  const { signup_id } = req.user;
  const { term_id } = req.params;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      "DELETE FROM terms_conditions WHERE terms_id = ? AND signup_id = ?",
      [term_id, signup_id]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Term not found" });
    }

    await connection.commit();
    res.status(200).json({ message: "Term deleted successfully" });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ message: "Server error" });
  } finally {
    connection.release();
  }
};

// Get all terms (no transaction needed)
const getTerms = async (req, res) => {
  const { signup_id } = req.user;

  try {
    const [terms] = await db.query(
      "SELECT terms_id, term_text, created_date, created_time FROM terms_conditions WHERE signup_id = ?",
      [signup_id]
    );

    res.status(200).json({ terms });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { addTerm, updateTerm, deleteTerm, getTerms };
