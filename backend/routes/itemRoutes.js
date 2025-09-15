const express = require("express");
const router = express.Router();
const pool = require("../db"); // <-- your PostgreSQL pool/connection file



// ✅ Get all items with related data
router.get("/all", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        i.*,
        g.groupname,
        m.makename,
        b.brandname
      FROM tblMasItem i
      LEFT JOIN tblMasGroup g ON i.groupid = g.groupid
      LEFT JOIN tblMasMake m ON i.makeid = m.makeid
      LEFT JOIN tblMasBrand b ON i.brandid = b.brandid
      ORDER BY i.itemcode ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// ✅ Get dropdown data for Groups, Makes, and Brands
router.get("/dropdown-data", async (req, res) => {
  try {
    const [groups, makes, brands] = await Promise.all([
      pool.query("SELECT groupid, groupname FROM tblMasGroup ORDER BY groupname ASC"),
      pool.query("SELECT makeid, makename FROM tblMasMake ORDER BY makename ASC"),
      pool.query("SELECT brandid, brandname FROM tblMasBrand ORDER BY brandname ASC")
    ]);

    res.json({
      groups: groups.rows,
      makes: makes.rows,
      brands: brands.rows
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// ✅ Add new item
router.post("/add", async (req, res) => {
  try {
    const {
      ItemCode,
      GroupID,
      MakeID,
      BrandID,
      ItemName,
      Packing,
      SuppRef,
      Barcode,
      Cost,
      AvgCost,
      CurStock,
      SPrice,
      MRP,
      Unit,
      Shelf,
      PartNo,
      Model,
      CGST,
      SGST,
      IGST,
      HSNCode,
      PartyID,
      IsExpence,
      Deleted,
      Billable
    } = req.body;

    await pool.query(
      `INSERT INTO tblMasItem (
        ItemCode, GroupID, MakeID, BrandID, ItemName, Packing, SuppRef, Barcode, 
        Cost, AvgCost, CurStock, SPrice, MRP, Unit, Shelf, PartNo, Model,
        CGST, SGST, IGST, HSNCode, PartyID, IsExpence, Deleted, Billable
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,
        $9,$10,$11,$12,$13,$14,$15,$16,$17,
        $18,$19,$20,$21,$22,$23,$24,$25
      )`,
      [
        ItemCode,
        GroupID,
        MakeID,
        BrandID,
        ItemName,
        Packing,
        SuppRef,
        Barcode,
        Cost,
        AvgCost,
        CurStock,
        SPrice,
        MRP,
        Unit,
        Shelf,
        PartNo,
        Model,
        CGST,
        SGST,
        IGST,
        HSNCode,
        PartyID,
        IsExpence,
        Deleted,
        Billable
      ]
    );

    res.json({ message: "✅ Item added successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// ✅ Edit/Update item
router.put("/edit/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;

    const setClause = Object.keys(fields)
      .map((key, idx) => `${key} = $${idx + 1}`)
      .join(", ");

    const values = Object.values(fields);

    if (!setClause) {
      return res.status(400).json({ message: "No fields to update" });
    }

    await pool.query(
      `UPDATE tblMasItem SET ${setClause}, edited_date = NOW() WHERE itemcode = $${values.length + 1}`,
      [...values, id]
    );

    res.json({ message: "✅ Item updated successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// ✅ Delete item
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM tblMasItem WHERE itemcode = $1", [id]);
    res.json({ message: "🗑️ Item deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
