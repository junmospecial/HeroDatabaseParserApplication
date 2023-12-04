  const express = require('express');
  const router = express.Router();
  const { param, validationResult } = require('express-validator');
  const Superhero = require('../models/superhero'); // Assuming this is your Mongoose model

  // Search endpoint
  // Modify /search endpoint in the backend to handle multiple query parameters
router.get('/search', async (req, res) => {
  const { name, race, publisher, power } = req.query;

  try {
    let searchCondition = {};
    if (name) {
      searchCondition.name = new RegExp(name, 'i');
    }
    if (race) {
      searchCondition.race = new RegExp(race, 'i');
    }
    if (publisher) {
      searchCondition.publisher = new RegExp(publisher, 'i');
    }
    if (power) {
      searchCondition.powers = new RegExp(power, 'i');
    }

    let superheroes = await Superhero.find(searchCondition);
    res.json(superheroes.map(hero => hero.id));
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



  // Get all available publisher names
  router.get('/publishers', async (req, res) => {
    try {
      const publishers = await Superhero.distinct('publisher');
      res.json(publishers);
    } catch (error) {
      console.error('Server Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Get superhero info by ID
  router.get('/:id', [
    param('id').isInt().withMessage('ID must be an integer')
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const id = parseInt(req.params.id);
    try {
      const superhero = await Superhero.findOne({ id: id });
      if (!superhero) {
        return res.status(404).send('Superhero not found');
      }
      res.json(superhero);
    } catch (error) {
      console.error('Server Error:', error);
      res.status(500).send('Server error');
    }
  });

  // Get powers for a given superhero ID
  // Note: Assuming powers are part of the superhero document
  router.get("/:id/powers", [
    param('id').isInt().withMessage('ID must be an integer')
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const id = parseInt(req.params.id);
    try {
      const superhero = await Superhero.findOne({ id: id });
      if (!superhero) {
        return res.status(404).json({ error: 'Superhero not found' });
      }
      res.json(superhero.powers);
    } catch (error) {
      console.error('Server Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Get all superheroes
  router.get('/', async (req, res) => {
    try {
      const superheroes = await Superhero.find({});
      res.json(superheroes);
    } catch (error) {
      console.error('Server Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  module.exports = router;
