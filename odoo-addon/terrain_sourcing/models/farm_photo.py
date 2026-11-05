from odoo import models, fields


class TerrainFarmPhoto(models.Model):
    _name = 'terrain.farm.photo'
    _description = 'Farm Photo'
    _order = 'taken_at desc, id desc'

    company_id = fields.Many2one(
        'res.company', string='Company', required=True,
        default=lambda self: self.env.company
    )
    farm_id = fields.Many2one(
        'terrain.farm', string='Farm', required=True,
        check_company=True, ondelete='cascade'
    )
    s3_url = fields.Char(string='Photo URL', required=True)
    exif_lat = fields.Float(string='EXIF Latitude', digits=(10, 7))
    exif_lng = fields.Float(string='EXIF Longitude', digits=(10, 7))
    confirmed_lat = fields.Float(string='Confirmed Latitude', digits=(10, 7))
    confirmed_lng = fields.Float(string='Confirmed Longitude', digits=(10, 7))
    taken_at = fields.Date(string='Date Taken')
    notes = fields.Char(string='Notes')
