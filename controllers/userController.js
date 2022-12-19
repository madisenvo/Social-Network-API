const { Thought, User } = require('../models');

module.exports = {
    // get all users
    getAllUsers(req, res) {
        User.find({})
            .select('-__v')
            .then(user => res.json(user))
            .catch((err) => res.status(500).json(err))
    },

    // get one user by id
    getUserById(req, res) {
        User.findOne({ _id: req.params.userId })
            .populate({
                path: "thoughts",
                select: "-__v",
            })
            .populate({
                path: "friends",
                select: "-__v",
            })
            .select('-__v')
            .then(user => {
                if (!user) {
                    return res.status(404).json({ message: 'User not found :(' });
                }
                res.json(user);
            })
            .catch((err) => res.status(500).json(err))
    },

    // create user
    newUser(req, res) {
        User.create(req.body)
            .then(user => res.json(user))
            .catch((err) => res.status(500).json(err))
    },

    // update user by id
    updateUser(req, res) {
        User.findOneAndUpdate(
            { _id: req.params.userId },
            { $set: req.body },
            { runValidators: true, new: true }
        )
            .then(user => {
                if (!user) {
                    return res.status(404).json({ message: 'User not found :(' });
                }
                res.json(user);
            })
            .catch((err) => res.status(500).json(err));
    },

    // delete user
    deleteUser(req, res) {
        User.findOneAndDelete({ _id: req.params.userId })
            .then(user => {
                if (!user) {
                    return res.status(404).json({ message: 'User not found :(' });
                }
                // bonus: delete thoughts associated with user
                return Thought.deleteMany({ _id: { $in: user.thoughts } 
                })
                .then (() => {
                    res.json({ message: 'User and thoughts deleted' });
                })
                .catch((err) => res.status(500).json(err));
            });
    },

    // add friend
    addFriend(req, res) {
        User.findOneAndUpdate(
            { _id: req.params.userId },
            { $addToSet: { friends: req.params.friendId } },
            { new: true, runValidators: true }
        )
            .then(user => {
                if (!user) {
                    return res.status(404).json({ message: 'User not found :(' });
                }
                res.json(user);
            })
            .catch((err) => res.status(500).json(err));
    },

    // delete friend
    deleteFriend(req, res) {
        User.findOneAndUpdate(
            { _id: req.params.userId },
            { $pull: { friends: req.params.friendId } },
            { new: true, runValidators: true }
        )
            .then(user => {
                if (!user) {
                    return res.status(404).json({ message: 'User not found :(' });
                }
                res.json(user);
            })
            .catch((err) => res.status(500).json(err));
    },
};