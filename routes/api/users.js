const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// Load Input Validation
const validateRegisterInput = require('../../validation/register');


// Load User model
const User = require('../../models/User');

// @route   GET api/users/current
// @desc    Return current user
// @access  Private
router.get(
  '/current',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.username,
      email: req.user.email
    });
  }
);

// @route   POST api/users/register
// @desc    Register user
// @access  Public
router.post('/', async (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  // Check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  let user = await User.findOne({ email: req.body.email })
  if (user) {
    errors.email = 'Email already exists';
    return res.status(400).json(errors);
  }

  const newUser = new User({
    username: req.body.name,
    email: req.body.email,
    password: req.body.password
  });

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if (err) throw err;
      newUser.password = hash;
      console.log(hash)
      bcrypt.compare(req.body.password, newUser.password).then(isMatch => {
        if (isMatch) {console.log("match!!!")}})
      newUser
        .save()
        .then(user => res.json(user))
        .catch(err => console.log(err));
    });
  });
});

// @route   POST api/users/:username
// @desc    Get user by username
// @access  Private
router.get('/:username', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-password')
    if (!user) {
      res.status(404).send({ error: 'User not found' });
    } else {
      res.send(user);
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

// @route   GET api/users/:followers
// @desc    Get user followers
// @access  Private
router.get('/:username/followers', passport.authenticate('jwt', { session: false }), async (req, res) => {
  console.log("hello")
  try {
    const user = await User.findOne({ username: req.params.username }).populate('followers');
    if (!user) {
      res.status(404).send({ error: 'User not found' });
    } else {
      console.log(user.followers)
      res.send(user.followers);
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

// @route   GET api/users/:followers
// @desc    Get user following
// @access  Private
router.get('/:username/following', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).populate('following');
    if (!user) {
      res.status(404).send({ error: 'User not found' });
    } else {
      res.send(user.following);
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

// @route   POST api/users//:username/follow
// @desc    Follow user
// @access  Private
router.post('/:username/follow', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      res.status(404).send({ error: 'User not found' });
    } else {
      const currentUser = await User.findById(req.user.id);
      currentUser.following.push(user._id);
      user.followers.push(currentUser._id);
      await currentUser.save();
      await user.save();
      res.send({ message: `You are now following ${req.params.username}` });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

router.delete('/users/:username/follow', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      res.status(404).send({ error: 'User not found' });
    } else {
      const currentUser = await User.findById(req.user.id);
      currentUser.following.remove(user._id);
      user.followers.remove(currentUser._id);
      await currentUser.save();
      await user.save();
      res.send({ message: `You are no longer following ${req.params.username}` });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});


module.exports = router;

