from odoo import models, fields


class TerrainFarm(models.Model):
    _name = 'terrain.farm'
    _description = 'Farm'
    _inherit = ['mail.thread', 'mail.activity.mixin']

    company_id = fields.Many2one(
        'res.company', string='Company', required=True,
        default=lambda self: self.env.company
    )
    supplier_id = fields.Many2one(
        'terrain.supplier', string='Supplier', required=True,
        check_company=True, ondelete='cascade'
    )
    name = fields.Char(string='Farm Name', required=True, tracking=True)
    region = fields.Char(string='Region', help='e.g. Guji, Yirgacheffe, Sidama')
    zone = fields.Char(string='Zone', help='Sub-region within the main region')
    altitude_min = fields.Integer(string='Min Altitude (masl)')
    altitude_max = fields.Integer(string='Max Altitude (masl)')
    latitude = fields.Float(string='Latitude', digits=(10, 7))
    longitude = fields.Float(string='Longitude', digits=(10, 7))
    size_hectares = fields.Float(string='Size (hectares)')
    variety = fields.Char(string='Coffee Variety', help='e.g. Heirloom Ethiopian, Typica')
    harvest_months = fields.Char(string='Harvest Months', help='e.g. Oct–Jan')
    state = fields.Selection([
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('approved', 'Approved'),
        ('active', 'Active'),
    ], string='Status', default='draft', tracking=True)

    photo_ids = fields.One2many('terrain.farm.photo', 'farm_id', string='Photos')
    farmer_ids = fields.One2many('terrain.farmer', 'farm_id', string='Farmers')
    washing_station_ids = fields.Many2many(
        'terrain.washing_station',
        'terrain_washing_station_farm_rel',
        'farm_id', 'washing_station_id',
        string='Washing Stations'
    )
    lot_ids = fields.Many2many(
        'terrain.coffee.lot',
        'terrain_coffee_lot_farm_rel',
        'farm_id', 'lot_id',
        string='Coffee Lots'
    )

    photo_count = fields.Integer(compute='_compute_photo_count', string='Photos')
    farmer_count = fields.Integer(compute='_compute_farmer_count', string='Farmers')

    def _compute_photo_count(self):
        for rec in self:
            rec.photo_count = len(rec.photo_ids)

    def _compute_farmer_count(self):
        for rec in self:
            rec.farmer_count = len(rec.farmer_ids)
