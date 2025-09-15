const express = require("express");
const router = express.Router();
const pool = require("../db");

// ➕ Add Brand
router.post("/add", async (req, res) => {
  const { BrandID, BrandName } = req.body;
  if (!BrandID || !BrandName) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    await pool.query(
      "INSERT INTO tblMasBrand (BrandID, BrandName, created_date, edited_date) VALUES ($1, $2, NOW(), NOW())",
      [BrandID, BrandName]
    );
    res.json({ message: "✅ Brand Added" });
  } catch (err) {
    console.error("Error adding brand:", err);
    res.status(500).json({ message: "DB Error", error: err.message });
  }
});

// 📖 Get All Brands
router.get("/all", async (req, res) => {
  try {
    console.log("Fetching all brands...");
    const result = await pool.query("SELECT BrandID, BrandName, created_date, edited_date FROM tblMasBrand ORDER BY BrandID");
    console.log(`Found ${result.rows.length} brands`);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching brands:", err);
    res.status(500).json({ message: "DB Error", error: err.message });
  }
});

//delete
router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Check if brand is referenced by any items
    const ref = await pool.query(
      "SELECT COUNT(*)::int AS cnt FROM tblMasItem WHERE brandid = $1",
      [id]
    );
    if (ref.rows[0].cnt > 0) {
      return res
        .status(409)
        .json({ message: `Cannot delete: Brand is used by ${ref.rows[0].cnt} item(s).` });
    }

    const result = await pool.query("DELETE FROM tblMasBrand WHERE BrandID = $1", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Brand not found" });
    }

    res.json({ message: "Brand deleted successfully" });
  } catch (err) {
    console.error("Error deleting brand:", err);
    res.status(500).json({ message: "DB Error", error: err.message });
  }
});

// edit
router.put("/edit/:id", async (req, res) => {
  const { id } = req.params;
  const { BrandName } = req.body;
  try {
    const result = await pool.query(
      "UPDATE tblMasBrand SET BrandName = $1, edited_date = NOW() WHERE BrandID = $2 RETURNING *",
      [BrandName, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Brand not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating brand:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
