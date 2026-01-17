const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase');

router.post('/check-in', async (req, res) => {
  const { userId, skill, coordinates } = req.body;

  try {
    const [lng, lat] = coordinates;
    const { data: worker, error } = await supabase
      .from('users')
      .update({
        skill,
        checked_in: true,
        location: `POINT(${lng} ${lat})`
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ message: 'Checked in successfully.', worker });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

router.post('/check-out', async (req, res) => {
  const { userId } = req.body;

  try {
    const { data: worker, error } = await supabase
      .from('users')
      .update({ checked_in: false })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ message: 'Checked out successfully.', worker });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;