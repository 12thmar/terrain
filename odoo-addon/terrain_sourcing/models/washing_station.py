from odoo import models, fields


class TerrainWashingStation(models.Model):
    _name = 'terrain.washing_station'
    _description = 'Washing Station'
    _inherit = ['mail.thread', 'mail.activity.mixin']

    company_id = fields.Many2one(
        'res.company', string='Company', required=True,
        default=lambda self: self.env.company
    )
    supplier_id = fields.Many2one(
        'terrain.supplier', string='Supplier', required=True,
        check_company=True, ondelete='cascade'
    )
    name = fields.Char(string='Station Name', required=True, tracking=True)
    latitude = fields.Float(string='Latitude', digits=(10, 7))
    longitude = fields.Float(string='Longitude', digits=(10, 7))
    altitude = fields.Integer(string='Altitude (masl)')
    mill_type = fields.Selection([
        ('wet', 'Wet Mill'),
        ('dry', 'Dry Mill'),
        ('both', 'Wet & Dry'),
    ], string='Mill Type', default='wet')
    capacity_kg_day = fields.Integer(string='Capacity (kg/day)')
    certifications = fields.Char(string='Certifications')

    farm_ids = fields.Many2many(
        'terrain.farm',
        'terrain_washing_station_farm_rel',
        'washing_station_id', 'farm_id',
        string='Farms Served'
    )
    lot_ids = fields.One2many('terrain.coffee.lot', 'washing_station_id', string='Lots Processed')

    farm_count = fields.Integer(compute='_compute_farm_count', string='Farms')

    def _compute_farm_count(self):
        for rec in self:
            rec.farm_count = len(rec.farm_ids)
