const express = require("express");
const router = express.Router();
const pool = require("../db");

// ➕ Add Make
router.post("/add", async (req, res) => {
  const { MakeID, MakeName } = req.body;
  if (!MakeID || !MakeName) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    await pool.query(
      `INSERT INTO tblMasMake (MakeID, MakeName, created_date, edited_date) 
       VALUES ($1, $2, NOW(), NOW())`,
      [MakeID, MakeName]
    );
    res.json({ message: "✅ Make Added" });
  } catch (err) {
    console.error("Error adding make:", err);
    res.status(500).json({ message: "DB Error", error: err.message });
  }
});

// 📖 Get All Makes
router.get("/all", async (req, res) => {
  try {
    console.log("Fetching all makes...");
    const result = await pool.query(
      "SELECT MakeID, MakeName, created_date, edited_date FROM tblMasMake ORDER BY MakeID"
    );
    console.log(`Found ${result.rows.length} makes`);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching makes:", err);
    res.status(500).json({ message: "DB Error", error: err.message });
  }
});

// ❌ Delete Make
router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Block delete if referenced by items
    const ref = await pool.query(
      "SELECT COUNT(*)::int AS cnt FROM tblMasItem WHERE makeid = $1",
      [id]
    );
    if (ref.rows[0].cnt > 0) {
      return res
        .status(409)
        .json({ message: `Cannot delete: Make is used by ${ref.rows[0].cnt} item(s).` });
    }

    const result = await pool.query("DELETE FROM tblMasMake WHERE MakeID = $1", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Make not found" });
    }

    res.json({ message: "✅ Make deleted successfully" });
  } catch (err) {
    console.error("Error deleting make:", err);
    res.status(500).json({ message: "DB Error", error: err.message });
  }
});

// ✏️ Edit Make
router.put("/edit/:id", async (req, res) => {
  const { id } = req.params;
  const { MakeName } = req.body;
  try {
    const result = await pool.query(
      `UPDATE tblMasMake 
       SET MakeName = $1, edited_date = NOW() 
       WHERE MakeID = $2 
       RETURNING MakeID, MakeName, created_date, edited_date`,
      [MakeName, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Make not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating make:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
