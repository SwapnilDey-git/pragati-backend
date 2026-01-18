const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase');

router.post('/login', async (req, res) => {
  const { name, userType, phoneNumber } = req.body;

  // Validate required fields
  if (!name || !userType || !phoneNumber) {
    return res.status(400).json({ message: 'Name, phone number, and user type are required.' });
  }

  // Validate phone number format (10 digits)
  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(phoneNumber)) {
    return res.status(400).json({ message: 'Phone number must be exactly 10 digits.' });
  }

  try {
    // Check if user exists with this phone number
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phoneNumber)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected for new users
      throw fetchError;
    }

    let user;
    if (existingUser) {
      // User exists - check if role matches
      if (existingUser.user_type !== userType) {
        return res.status(400).json({
          message: `This phone number is already registered as a ${existingUser.user_type}. Please use a different phone number or login with the correct role.`
        });
      }

      // Update name if it changed
      if (existingUser.name !== name.trim()) {
        const { data: updated } = await supabase
          .from('users')
          .update({ name: name.trim() })
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
          phone: phoneNumber,
          location: null // Will be updated on check-in
        }])
        .select()
        .single();

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }
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