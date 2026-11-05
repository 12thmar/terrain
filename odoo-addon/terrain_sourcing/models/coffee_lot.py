from odoo import models, fields


class TerrainCoffeeLot(models.Model):
    _name = 'terrain.coffee.lot'
    _description = 'Coffee Lot'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _rec_name = 'lot_code'

    company_id = fields.Many2one(
        'res.company', string='Company', required=True,
        default=lambda self: self.env.company
    )
    supplier_id = fields.Many2one(
        'terrain.supplier', string='Supplier', required=True,
        check_company=True, ondelete='cascade'
    )
    washing_station_id = fields.Many2one(
        'terrain.washing_station', string='Washing Station',
        check_company=True
    )
    farm_ids = fields.Many2many(
        'terrain.farm',
        'terrain_coffee_lot_farm_rel',
        'lot_id', 'farm_id',
        string='Farms'
    )

    lot_code = fields.Char(string='Lot Code', required=True, tracking=True)
    name = fields.Char(string='Origin Name', help='e.g. Yirgacheffe, Sidamo, Guji')
    grade = fields.Integer(string='Grade', help='1 (best) to 5')
    process = fields.Selection([
        ('washed', 'Washed'),
        ('natural', 'Natural'),
        ('honey', 'Honey'),
    ], string='Process', tracking=True)
    variety = fields.Char(string='Variety')
    altitude_range = fields.Char(string='Altitude Range', help='e.g. 1,700 – 2,200 masl')
    harvest_date = fields.Date(string='Harvest Date')
    export_ready_date = fields.Date(string='Export Ready Date', tracking=True)
    moisture_pct = fields.Float(string='Moisture %', digits=(5, 2))
    screen_size = fields.Char(string='Screen Size', help='e.g. 15/16')
    bag_weight_kg = fields.Integer(string='Bag Weight (kg)')
    flavor_notes = fields.Text(string='Flavor Notes')
    sca_score = fields.Float(string='SCA Score', digits=(4, 2))

    price_breakdown_id = fields.One2many(
        'terrain.price.breakdown', 'lot_id', string='Price Breakdown'
    )
    has_price_breakdown = fields.Boolean(
        compute='_compute_has_price_breakdown', string='Has Price Breakdown'
    )

    def _compute_has_price_breakdown(self):
        for rec in self:
            rec.has_price_breakdown = bool(rec.price_breakdown_id)

    _sql_constraints = [
        ('lot_code_company_unique', 'UNIQUE(lot_code, company_id)',
         'Lot code must be unique per organization.'),
    ]
