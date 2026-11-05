from odoo import models, fields


class TerrainFarmer(models.Model):
    _name = 'terrain.farmer'
    _description = 'Farmer'
    _inherit = ['mail.thread']

    company_id = fields.Many2one(
        'res.company', string='Company', required=True,
        default=lambda self: self.env.company
    )
    farm_id = fields.Many2one(
        'terrain.farm', string='Farm', required=True,
        check_company=True, ondelete='cascade'
    )
    supplier_id = fields.Many2one(
        related='farm_id.supplier_id', store=True, string='Supplier'
    )
    name = fields.Char(string='Full Name', required=True)
    phone = fields.Char(string='Phone')
    years_experience = fields.Integer(string='Years of Experience')
    photo_url = fields.Char(string='Photo URL')
    notes = fields.Text(string='Notes')
