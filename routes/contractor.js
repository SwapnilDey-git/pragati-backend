const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase');

router.get('/workers', async (req, res) => {
    const { skill, lat, lng } = req.query;
    const maxDistance = 10000; // 10 kilometers

    try {
        // If location is provided, use PostGIS function for nearby search
        if (lat && lng) {
            const { data, error } = await supabase.rpc('nearby_workers', {
                lat: parseFloat(lat),
                lng: parseFloat(lng),
                max_distance: maxDistance,
                filter_skill: skill && skill !== 'all' ? skill : null
            });

            if (error) throw error;
            return res.status(200).json(data);
        }

        // Otherwise, simple filter query
        let query = supabase
            .from('users')
            .select('*')
            .eq('user_type', 'worker')
            .eq('checked_in', true);

        // Filter by skill if provided
        if (skill && skill !== 'all') {
            query = query.eq('skill', skill);
        }

        const { data: workers, error } = await query;
        if (error) throw error;

        res.status(200).json(workers);
    } catch (error) {
        console.error('Workers query error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});

module.exports = router;