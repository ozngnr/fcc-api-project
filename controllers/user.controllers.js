const { User, Exercise } = require('../models/user');

// Get all users from the DB
const getUsers = async (req, res) => {
  const users = await User.find({}).select('_id username'); // only get the id and username properties
  res.json(users);
};

// Create a user
const createUser = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (user) {
      res.json({
        _id: user._id,
        username: user.username,
      });
    } else {
      User.create({ username: req.body.username }, (err, savedUser) => {
        if (err) return res.send(err.message);
        res.json({
          _id: savedUser._id,
          username: savedUser.username,
        });
      });
    }
  } catch (error) {
    res.status(500).send('Server error!');
  }
};

const addExercise = (req, res) => {
  try {
    const newExercise = new Exercise({
      description: req.body.description,
      duration: parseInt(req.body.duration),
      date: req.body.date,
    });

    if (newExercise.date) {
      newExercise.date = new Date(newExercise.date).toDateString();
    } else {
      newExercise.date = new Date().toDateString();
    }

    // Check if the entry is valid
    const err = newExercise.validateSync();

    if (err) {
      res.send(err.message);
    } else {
      User.findByIdAndUpdate(
        req.params._id,
        { $push: { log: newExercise } },
        { new: true },
        (err, updatedUser) => {
          if (err) res.send(err.message);
          res.json({
            _id: updatedUser._id,
            username: updatedUser.username,
            description: newExercise.description,
            duration: newExercise.duration,
            date: newExercise.date,
          });
        }
      );
    }
  } catch (error) {
    res.status(500).send(error);
  }
};

const getLogs = (req, res) => {
  User.findById(req.params._id, (err, user) => {
    if (err) res.send(err.message);

    if (req.query.from || req.query.to) {
      let fromDate = new Date(0); // Set default from date to 1970
      let toDate = new Date(); // Set default toDate to now

      if (req.query.from) {
        fromDate = new Date(req.query.from);
      }
      if (req.query.to) {
        toDate = new Date(req.query.to);
      }

      fromDate = fromDate.getTime();
      toDate = toDate.getTime();

      user.log = user.log.filter((exercise) => {
        const exerciseDate = new Date(exercise.date).getTime();

        return exerciseDate >= fromDate && exerciseDate <= toDate;
      });
    }

    if (req.query.limit) {
      user.log = user.log.slice(0, req.query.limit);
    }

    user.count = user.log.length;
    res.json(user);
  }).select('-log._id');
};

module.exports = {
  createUser,
  getUsers,
  addExercise,
  getLogs,
};
