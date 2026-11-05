from odoo import models, fields


class TerrainSupplier(models.Model):
    _name = 'terrain.supplier'
    _description = 'Supplier'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _rec_name = 'name'

    company_id = fields.Many2one(
        'res.company', string='Company', required=True,
        default=lambda self: self.env.company
    )
    partner_id = fields.Many2one('res.partner', string='Partner', required=True)
    name = fields.Char(related='partner_id.name', store=True, readonly=False)
    supplier_code = fields.Char(string='Supplier Code', required=True, tracking=True)
    certifications = fields.Char(string='Certifications', help='e.g. organic, fair trade, Rainforest Alliance')
    state = fields.Selection([
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    ], string='Status', default='draft', tracking=True)

    farm_ids = fields.One2many('terrain.farm', 'supplier_id', string='Farms')
    washing_station_ids = fields.One2many('terrain.washing_station', 'supplier_id', string='Washing Stations')
    lot_ids = fields.One2many('terrain.coffee.lot', 'supplier_id', string='Coffee Lots')

    farm_count = fields.Integer(compute='_compute_farm_count', string='Farms')
    lot_count = fields.Integer(compute='_compute_lot_count', string='Lots')

    def _compute_farm_count(self):
        for rec in self:
            rec.farm_count = len(rec.farm_ids)

    def _compute_lot_count(self):
        for rec in self:
            rec.lot_count = len(rec.lot_ids)

    _sql_constraints = [
        ('supplier_code_company_unique', 'UNIQUE(supplier_code, company_id)',
         'Supplier code must be unique per organization.'),
    ]
