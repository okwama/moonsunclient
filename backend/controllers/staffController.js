const db = require('../database/db');

const staffController = {
  getAllStaff: async (req, res) => {
    try {
      const [staff] = await db.query('SELECT * FROM staff ORDER BY createdAt DESC');
      res.json(staff);
    } catch (error) {
      console.error('Error fetching staff:', error);
      res.status(500).json({ message: 'Error fetching staff list' });
    }
  },

  getStaffById: async (req, res) => {
    try {
      const [staff] = await db.query('SELECT * FROM staff WHERE id = ?', [req.params.id]);
      
      if (staff.length === 0) {
        return res.status(404).json({ message: 'Staff member not found' });
      }
      
      res.json(staff[0]);
    } catch (error) {
      console.error('Error fetching staff member:', error);
      res.status(500).json({ message: 'Error fetching staff member' });
    }
  },

  createStaff: async (req, res) => {
    const { name, photo_url, position, department } = req.body;
    
    try {
      const [result] = await db.query(
        'INSERT INTO staff (name, photo_url, position, department) VALUES (?, ?, ?, ?)',
        [name, photo_url, position, department]
      );
      
      res.status(201).json({
        id: result.insertId,
        name,
        photo_url,
        position,
        department
      });
    } catch (error) {
      console.error('Error creating staff member:', error);
      res.status(500).json({ message: 'Error creating staff member' });
    }
  },

  updateStaff: async (req, res) => {
    const { name, photo_url, position, department } = req.body;
    
    try {
      await db.query(
        'UPDATE staff SET name = ?, photo_url = ?, position = ?, department = ? WHERE id = ?',
        [name, photo_url, position, department, req.params.id]
      );
      
      res.json({
        id: parseInt(req.params.id),
        name,
        photo_url,
        position,
        department
      });
    } catch (error) {
      console.error('Error updating staff member:', error);
      res.status(500).json({ message: 'Error updating staff member' });
    }
  },

  deleteStaff: async (req, res) => {
    try {
      await db.query('DELETE FROM staff WHERE id = ?', [req.params.id]);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting staff member:', error);
      res.status(500).json({ message: 'Error deleting staff member' });
    }
  }
};

module.exports = staffController; 