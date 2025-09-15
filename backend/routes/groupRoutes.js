const express = require("express");
const router = express.Router();
const pool = require("../db");

// ➕ Add Group
router.post("/add", async (req, res) => {
  const { GroupID, GroupName } = req.body;
  if (!GroupID || !GroupName) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    await pool.query(
      `INSERT INTO tblMasGroup (GroupID, GroupName, created_date, edited_date) 
       VALUES ($1, $2, NOW(), NOW())`,
      [GroupID, GroupName]
    );
    res.json({ message: "✅ Group Added" });
  } catch (err) {
    console.error("Error adding group:", err);
    res.status(500).json({ message: "DB Error", error: err.message });
  }
});

// 📖 Get All Groups
router.get("/all", async (req, res) => {
  try {
    console.log("Fetching all groups...");
    const result = await pool.query(
      "SELECT GroupID, GroupName, created_date, edited_date FROM tblMasGroup ORDER BY GroupID"
    );
    console.log(`Found ${result.rows.length} groups`);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching groups:", err);
    res.status(500).json({ message: "DB Error", error: err.message });
  }
});

// ❌ Delete Group
router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Check if group is referenced by any items
    const ref = await pool.query(
      "SELECT COUNT(*)::int AS cnt FROM tblMasItem WHERE groupid = $1",
      [id]
    );
    if (ref.rows[0].cnt > 0) {
      return res
        .status(409)
        .json({ message: `Cannot delete: Group is used by ${ref.rows[0].cnt} item(s).` });
    }

    const result = await pool.query("DELETE FROM tblMasGroup WHERE GroupID = $1", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.json({ message: "Group deleted successfully" });
  } catch (err) {
    console.error("Error deleting group:", err);
    res.status(500).json({ message: "DB Error", error: err.message });
  }
});

// ✏️ Edit Group
router.put("/edit/:id", async (req, res) => {
  const { id } = req.params;
  const { GroupName } = req.body;
  try {
    const result = await pool.query(
      `UPDATE tblMasGroup 
       SET GroupName = $1, edited_date = NOW() 
       WHERE GroupID = $2 
       RETURNING *`,
      [GroupName, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Group not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating group:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
