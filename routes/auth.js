const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase');

router.post('/login', async (req, res) => {
  const { name, userType, phoneNumber } = req.body;

  if (!name || !userType) {
    return res.status(400).json({ message: 'Name and user type are required.' });
  }

  try {
    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('name', name.trim())
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected for new users
      throw fetchError;
    }

    let user;
    if (existingUser) {
      // Update phone if provided
      if (phoneNumber) {
        const { data: updated } = await supabase
          .from('users')
          .update({ phone: phoneNumber })
          .eq('id', existingUser.id)
          .select()
          .single();
        user = updated || existingUser;
      } else {
        user = existingUser;
      }
    } else {
      // Create new user with default location
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([{
          name: name.trim(),
          user_type: userType,
          phone: phoneNumber || null,
          location: `POINT(0 0)` // Default location (will be updated on check-in)
        }])
        .select()
        .single();

      if (insertError) throw insertError;
      user = newUser;
    }

    // Transform to camelCase for frontend
    const transformedUser = {
      _id: user.id,
      name: user.name,
      userType: user.user_type,
      phone: user.phone,
      skill: user.skill,
      checkedIn: user.checked_in,
      location: user.location,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };

    res.status(200).json({ message: 'Login successful', user: transformedUser });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

module.exports = router;