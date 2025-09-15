const express = require("express");
const router = express.Router();
const pool = require("../db");

/**
 * Create Purchase Invoice (Header Only)
 */
router.post("/", async (req, res) => {
  const {
    FYearID, TrNo, TrDate, SuppInvNo, SuppInvDt, PartyID,
    Remark, InvAmt, TptCharge, LabCharge, MiscCharge, PackCharge,
    Rounded, CGST, SGST, IGST, CostSheetPrepared, GRNPosted, Costconfirmed
  } = req.body;

  try {
    const maxIdResult = await pool.query('SELECT COALESCE(MAX(TranID), 0) + 1 as next_id FROM tblTrnPurchase');
    const nextTranID = maxIdResult.rows[0].next_id;

    const result = await pool.query(
      `INSERT INTO tblTrnPurchase
       (TranID, FYearID, TrNo, TrDate, SuppInvNo, SuppInvDt, PartyID, Remark,
        InvAmt, TptCharge, LabCharge, MiscCharge, PackCharge, Rounded,
        CGST, SGST, IGST, CostSheetPrepared, GRNPosted, Costconfirmed)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
       RETURNING TranID`,
      [nextTranID, FYearID, TrNo, TrDate, SuppInvNo, SuppInvDt, PartyID, Remark,
       InvAmt, TptCharge, LabCharge, MiscCharge, PackCharge, Rounded,
       CGST, SGST, IGST, CostSheetPrepared, GRNPosted, Costconfirmed]
    );

    res.json({ success: true, TranID: result.rows[0].tranid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create purchase" });
  }
});

/**
 * Update Purchase Invoice (Header Only)
 */
router.put("/:tranId", async (req, res) => {
  const { tranId } = req.params;
  const {
    FYearID, TrNo, TrDate, SuppInvNo, SuppInvDt, PartyID,
    Remark, InvAmt, TptCharge, LabCharge, MiscCharge, PackCharge,
    Rounded, CGST, SGST, IGST, CostSheetPrepared, GRNPosted, Costconfirmed
  } = req.body;

  try {
    await pool.query(
      `UPDATE tblTrnPurchase
       SET FYearID = $1, TrNo = $2, TrDate = $3, SuppInvNo = $4, SuppInvDt = $5, 
           PartyID = $6, Remark = $7, InvAmt = $8, TptCharge = $9, LabCharge = $10, 
           MiscCharge = $11, PackCharge = $12, Rounded = $13, CGST = $14, SGST = $15, 
           IGST = $16, CostSheetPrepared = $17, GRNPosted = $18, Costconfirmed = $19
       WHERE TranID = $20`,
      [FYearID, TrNo, TrDate, SuppInvNo, SuppInvDt, PartyID, Remark,
       InvAmt, TptCharge, LabCharge, MiscCharge, PackCharge, Rounded,
       CGST, SGST, IGST, CostSheetPrepared, GRNPosted, Costconfirmed, tranId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update purchase" });
  }
});

/**
 * Get All Purchases (List View)
 */
router.get("/", async (req, res) => {
  const { fromDate, toDate, supplierId } = req.query;
  let where = [];
  let params = [];

  if (fromDate) {
    params.push(fromDate);
    where.push(`TrDate >= $${params.length}`);
  }
  if (toDate) {
    params.push(toDate);
    where.push(`TrDate <= $${params.length}`);
  }
  if (supplierId) {
    params.push(supplierId);
    where.push(`PartyID = $${params.length}`);
  }

  const filter = where.length ? `WHERE ${where.join(" AND ")}` : "";

  try {
    const result = await pool.query(
      `SELECT p.TranID, p.TrNo, p.TrDate, p.SuppInvNo, p.SuppInvDt,
              party.PartyName, p.InvAmt, p.CGST, p.SGST, p.IGST,
              p.CostSheetPrepared, p.GRNPosted, p.Costconfirmed
       FROM tblTrnPurchase p
       JOIN tblMasParty party ON p.PartyID = party.PartyID
       ${filter}
       ORDER BY p.TrDate DESC`,
      params
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch purchases" });
  }
});

/**
 * Get Single Purchase (Header + Details)
 */
router.get("/:tranId", async (req, res) => {
  const { tranId } = req.params;

  try {
    const header = await pool.query(
      `SELECT * FROM tblTrnPurchase WHERE TranID = $1`, [tranId]
    );

    const details = await pool.query(
      `SELECT * FROM tblTrnPurchaseDet WHERE TranMasID = $1 ORDER BY Srno`,
      [tranId]
    );

    res.json({
      header: header.rows[0],
      details: details.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch purchase" });
  }
});

/**
 * Costing: get rows for a purchase
 */
router.get('/:tranId/costing', async (req, res) => {
  const { tranId } = req.params;
  try {
    const r = await pool.query(
      `SELECT CostTRID, PruchMasID, OHType, Amount
       FROM tblTrnPurchaseCosting WHERE PruchMasID = $1 ORDER BY CostTRID`,
      [tranId]
    );
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch costing rows' });
  }
});

/**
 * Costing: replace rows and update header charges + set prepared flag
 * Body: { rows: [{OHType, Amount}] }
 */
router.put('/:tranId/costing', async (req, res) => {
  const { tranId } = req.params;
  const { rows = [] } = req.body || {};
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`DELETE FROM tblTrnPurchaseCosting WHERE PruchMasID = $1`, [tranId]);

    let tpt = 0, lab = 0, misc = 0;
    for (const r of rows) {
      const rawType = (r && r.OHType != null) ? String(r.OHType) : '';
      const OHType = rawType.trim();
      const amtNum = Number((r && r.Amount) != null ? r.Amount : 0);
      const Amount = isNaN(amtNum) ? 0 : amtNum;

      // Skip empty, zero rows to avoid clutter and numeric casting issues
      if (!OHType && Amount === 0) continue;

      await client.query(
        `INSERT INTO tblTrnPurchaseCosting (PruchMasID, OHType, Amount)
         VALUES ($1,$2,$3)`,
        [tranId, OHType, Amount]
      );
      const t = OHType.toLowerCase();
      if (t.startsWith('trans') || t.includes('freight') || t.includes('tpt')) tpt += Amount;
      else if (t.startsWith('lab')) lab += Amount;
      else misc += Amount;
    }

    const prepared = rows.some(r => Number(r?.Amount) > 0);
    await client.query(
      `UPDATE tblTrnPurchase SET TptCharge = $1, LabCharge = $2, MiscCharge = $3, CostSheetPrepared = $4 WHERE TranID = $5`,
      [tpt, lab, misc, prepared, tranId]
    );

    await client.query('COMMIT');
    res.json({ success: true, TptCharge: tpt, LabCharge: lab, MiscCharge: misc, CostSheetPrepared: prepared });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to save costing' });
  } finally {
    client.release();
  }
});

/**
 * Confirm costing and persist computed item overheads
 * Body: { items: [{ Srno, OHAmt, NetRate, GTotal? }] }
 */
router.post('/:tranId/costing/confirm', async (req, res) => {
  const { tranId } = req.params;
  const { items = [] } = req.body || {};
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const it of items) {
      const { Srno, OHAmt = 0, NetRate = 0, GTotal = null } = it || {};
      if (Srno == null) continue;
      await client.query(
        `UPDATE tblTrnPurchaseDet SET OHAmt = $1, NetRate = $2${GTotal != null ? ', GTotal = $3' : ''}
         WHERE TranMasID = $4 AND Srno = $5`,
        GTotal != null ? [OHAmt, NetRate, GTotal, tranId, Srno] : [OHAmt, NetRate, tranId, Srno]
      );
    }

    await client.query(
      `UPDATE tblTrnPurchase SET Costconfirmed = true WHERE TranID = $1`,
      [tranId]
    );

    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to confirm costing' });
  } finally {
    client.release();
  }
});

/**
 * Delete a Purchase (Header + Details)
 */
router.delete("/:tranId", async (req, res) => {
  const { tranId } = req.params;
  try {
    await pool.query(`DELETE FROM tblTrnPurchaseDet WHERE TranMasID = $1`, [tranId]);
    await pool.query(`DELETE FROM tblTrnPurchase WHERE TranID = $1`, [tranId]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete purchase" });
  }
});

/**
 * Add or update a Purchase line item (Upsert by TranID + Srno)
 */
router.post('/:tranId/items', async (req, res) => {
  const { tranId } = req.params;
  const {
    FYearID,
    Srno,
    ItemCode,
    Qty = 0,
    Rate = 0,
    InvAmount = 0,
    OHAmt = 0,
    NetRate = 0,
    Rounded = 0,
    GTotal = 0,
    CGSTPer = 0,
    SGSTPer = 0,
    IGSTPer = 0
  } = req.body || {};

  // Support both request body shapes: CGST/SGST/IGST and legacy CGSTAmount/SGSTAmout/IGSTAmount
  const cgst = Number(req.body?.CGST ?? req.body?.CGSTAmount ?? 0) || 0;
  const sgst = Number(req.body?.SGST ?? req.body?.SGSTAmout ?? req.body?.SGSTAmount ?? 0) || 0; // handle misspelling
  const igst = Number(req.body?.IGST ?? req.body?.IGSTAmount ?? 0) || 0;

  if (Srno == null || ItemCode == null) {
    return res.status(400).json({ error: 'Srno and ItemCode are required' });
  }

  try {
    await pool.query(
      `WITH upd AS (
         UPDATE tblTrnPurchaseDet
         SET
           FYearID = $1,
           ItemCode = $2,
           Qty = $3,
           Rate = $4,
           InvAmount = $5,
           OHAmt = $6,
           NetRate = $7,
           Rounded = $8,
           CGST = $9,
           SGST = $10,
           IGST = $11,
           GTotal = $12,
           CGSTP = $13,
           SGSTP = $14,
           IGSTP = $15
         WHERE TranMasID = $16 AND Srno = $17
         RETURNING 1
       )
       INSERT INTO tblTrnPurchaseDet (
         FYearID, TranMasID, Srno, ItemCode,
         Qty, Rate, InvAmount, OHAmt, NetRate, Rounded,
         CGST, SGST, IGST, GTotal,
         CGSTP, SGSTP, IGSTP
       )
       SELECT $1, $16, $17, $2,
              $3, $4, $5, $6, $7, $8,
              $9, $10, $11, $12,
              $13, $14, $15
       WHERE NOT EXISTS (SELECT 1 FROM upd)`,
      [
        FYearID,
        ItemCode,
        Qty,
        Rate,
        InvAmount,
        OHAmt,
        NetRate,
        Rounded,
        cgst,
        sgst,
        igst,
        GTotal,
        CGSTPer,
        SGSTPer,
        IGSTPer,
        tranId, // $16 -> TranMasID
        Srno,   // $17 -> Srno
      ]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save purchase item' });
  }
});

module.exports = router;  
