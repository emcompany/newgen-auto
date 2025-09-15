const express = require('express');
const router = express.Router();
const pool = require('../db');

// Dashboard metrics and charts
router.get('/summary', async (req, res) => {
  try {
    const [totals, suppliers, customers, monthly] = await Promise.all([
      pool.query(`
        SELECT 
          COALESCE(SUM(InvAmt),0) AS total_purchase,
          COALESCE(SUM(CGST+SGST+IGST),0) AS total_tax,
          COUNT(*) AS purchase_count
        FROM tblTrnPurchase
      `),
      pool.query(`SELECT COUNT(*)::int AS suppliers FROM tblMasParty WHERE PartyType = 2`),
      pool.query(`SELECT COUNT(*)::int AS customers FROM tblMasParty WHERE PartyType = 1`),
      pool.query(`
        SELECT to_char(TrDate, 'YYYY-MM') AS ym,
               COALESCE(SUM(InvAmt),0) AS total
        FROM tblTrnPurchase
        GROUP BY 1
        ORDER BY 1
      `)
    ]);

    const total_purchase = Number(totals.rows[0]?.total_purchase || 0);
    const total_tax = Number(totals.rows[0]?.total_tax || 0);
    const purchase_count = Number(totals.rows[0]?.purchase_count || 0);
    const suppliers_count = Number(suppliers.rows[0]?.suppliers || 0);
    const customers_count = Number(customers.rows[0]?.customers || 0);

    res.json({
      metrics: {
        totalPurchase: total_purchase,
        totalTax: total_tax,
        purchaseCount: purchase_count,
        suppliers: suppliers_count,
        customers: customers_count
      },
      charts: {
        purchaseMonthly: monthly.rows // [{ ym: '2025-01', total: 1234.56 }, ...]
      }
    });
  } catch (err) {
    console.error('Dashboard summary error:', err);
    res.status(500).json({ error: 'Failed to load dashboard data' });
  }
});

module.exports = router;