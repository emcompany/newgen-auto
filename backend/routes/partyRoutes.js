const express = require("express");
const router = express.Router();
const pool = require("../db");

// ➕ Add Party
router.post("/add", async (req, res) => {
  const { PartyID, PartyCode, PartyType, PartyName, ContactNo, Address1, AccountID, GSTNum, Address2 } = req.body;

  if (!PartyCode || !PartyType || !PartyName) {
    return res.status(400).json({ message: "PartyCode, PartyType, and PartyName are required" });
  }

  try {
    // If PartyID not provided, auto-generate as max(partyid)+1
    let newPartyID = PartyID;
    if (!newPartyID) {
      const maxRes = await pool.query('SELECT COALESCE(MAX(partyid), 0) + 1 AS next_id FROM tblMasParty');
      newPartyID = maxRes.rows[0].next_id;
    }

    await pool.query(
      `INSERT INTO tblMasParty 
       (PartyID, PartyCode, PartyType, PartyName, ContactNo, Address1, AccountID, GSTNum, Address2, created_date, edited_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW(),NOW())`,
      [newPartyID, PartyCode, PartyType, PartyName, ContactNo || null, Address1 || null, AccountID || null, GSTNum || null, Address2 || null]
    );
    res.json({ message: "✅ Party Added", PartyID: newPartyID });
  } catch (err) {
    console.error("Insert error:", err.message);
    res.status(500).json({ message: "DB Error" });
  }
});

// 📖 Get All Parties
router.get("/all", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT partyid, partycode, partytype, partyname, contactno, address1, accountid, gstnum, address2, created_date, edited_date FROM tblMasParty ORDER BY partyid"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch error:", err.message);
    res.status(500).json({ message: "DB Error" });
  }
});

// ✏️ Edit Party
router.put("/edit/:id", async (req, res) => {
  const { id } = req.params;
  const { PartyCode, PartyType, PartyName, ContactNo, Address1, AccountID, GSTNum, Address2 } = req.body;

  try {
    const result = await pool.query(
      `UPDATE tblMasParty 
       SET PartyCode=$1, PartyType=$2, PartyName=$3, ContactNo=$4, Address1=$5, AccountID=$6, GSTNum=$7, Address2=$8, edited_date=NOW()
       WHERE PartyID=$9 
       RETURNING PartyID, PartyCode, PartyType, PartyName, ContactNo, Address1, AccountID, GSTNum, Address2, created_date, edited_date`,
      [PartyCode, PartyType, PartyName, ContactNo, Address1, AccountID, GSTNum, Address2, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Party not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Update error:", err.message);
    res.status(500).json({ error: "DB Error" });
  }
});

// ❌ Delete Party
router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM tblMasParty WHERE PartyID=$1", [id]);
    res.json({ message: "✅ Party deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err.message);
    res.status(500).json({ error: "DB Error" });
  }
});

module.exports = router;
