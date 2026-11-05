from odoo import models, fields, api


class TerrainPriceBreakdown(models.Model):
    _name = 'terrain.price.breakdown'
    _description = 'Price Breakdown'
    _rec_name = 'lot_id'

    company_id = fields.Many2one(
        'res.company', string='Company', required=True,
        default=lambda self: self.env.company
    )
    lot_id = fields.Many2one(
        'terrain.coffee.lot', string='Coffee Lot', required=True,
        check_company=True, ondelete='cascade'
    )

    # Percentage breakdown — should sum to 100
    farmer_pct = fields.Float(string='Farmer %', digits=(5, 2))
    washing_station_pct = fields.Float(string='Washing Station %', digits=(5, 2))
    incountry_buyer_pct = fields.Float(string='In-Country Buyer %', digits=(5, 2))
    shipping_pct = fields.Float(string='Shipping %', digits=(5, 2))
    importer_pct = fields.Float(string='Importer %', digits=(5, 2))
    total_pct = fields.Float(
        string='Total %', compute='_compute_total_pct', store=True, digits=(5, 2)
    )

    fob_price_usd = fields.Float(string='FOB Price ($/kg)', digits=(10, 4))
    landed_price_usd = fields.Float(string='Landed Price ($/kg)', digits=(10, 4))
    notes = fields.Text(string='Transparency Notes',
                        help='Narrative explanation for roasters — why these percentages')

    @api.depends('farmer_pct', 'washing_station_pct', 'incountry_buyer_pct',
                 'shipping_pct', 'importer_pct')
    def _compute_total_pct(self):
        for rec in self:
            rec.total_pct = (
                rec.farmer_pct + rec.washing_station_pct +
                rec.incountry_buyer_pct + rec.shipping_pct + rec.importer_pct
            )

    _sql_constraints = [
        ('lot_id_unique', 'UNIQUE(lot_id)', 'A price breakdown already exists for this lot.'),
    ]
