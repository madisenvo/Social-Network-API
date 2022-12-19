const { Thought, User } = require('../models');

module.exports = {
    // get all thoughts
    getAllThoughts(req, res) {
        Thought.find({})
            .select('-__v')
            .sort({ _id: -1 })
            .then(thought => res.json(thought))
            .catch(err => {
                console.log(err);
                res.status(400).json(err);
            }
        );
    },

    // get thought by id
    getThoughtById(req, res) {
        Thought.findOne({ _id: req.params.thoughtId })
            .select('-__v')
            .then(thought => {
                if (!thought) {
                    res.status(404).json({ message: 'No thought found :(' });
                    return;
                }
                res.json(thought);
            }
        )
        .catch(err => res.status(400).json(err))
    },

    // create thought
    newThought(req, res) {
        Thought.create(req.body)
            .then(({ _id }) => {
                return User.findOneAndUpdate(
                    { _id: req.body.userId },
                    { $push: { thoughts: _id } },
                    { new: true }
                );
            })
            .then(user => {
                if (!user) {
                    res.status(404).json({ message: 'No user found :(' });
                    return;
                }
                res.json(user);
            }
        )
        .catch(err => res.status(400).json(err));
    },

    // update thought by id
    updateThought(req, res) {
        Thought.findOneAndUpdate(
            { _id: req.params.thoughtId }, 
            { $set: req.body },
            {
            new: true,
            runValidators: true,
            }
        )
        .then(thought => {
            if (!thought) {
                res.status(404).json({ message: 'No thought found :(' });
                return;
            }
            res.json(thought);
        }
        )
        .catch(err => res.status(400).json(err));
    },

    // delete thought
    deleteThought(req, res) {
        Thought.findOneAndDelete({ _id: req.params.thoughtId })
            .then(thought => {
                if (!thought) {
                    return res.status(404).json({ message: 'No thought found :(' });
                }
                return User.findOneAndUpdate(
                    { thoughts: req.params.thoughtId },
                    { $pull: { thoughts: req.params.thoughtId } },
                    { new: true }
                );
            })
        
            .then(user => {
                if (!user) {
                    res.status(404).json({ message: 'This user not found :(' });
                    return;
                }
                res.json({ message: 'Thought deleted' });
            })
            .catch(err => res.status(400).json(err));
    },

    // add reaction
    addReaction(req, res) {
        Thought.findOneAndUpdate(
            { _id: req.params.thoughtId },
            { $addToSet: { reactions: req.body } },
            { 
                new: true, 
                runValidators: true 
            }
        )
        .then(thought => {
            if (!thought) {
                res.status(404).json({ message: 'No thought found :(' });
                return;
            }
            res.json(thought);
        })
        .catch(err => res.status(400).json(err));
    },

    // delete reaction
    deleteReaction(req, res) {
        Thought.findOneAndUpdate(
            { _id: req.params.thoughtId },
            { $pull: { reactions: { reactionId: req.params.reactionId } } },
            { 
                new: true,
            runValidators: true 
            }
        )
        .then(thought => {
            if (!thought) {
                res.status(404).json({ message: 'No thought found :(' });
                return;
            }
            res.json(thought);
        })
        .catch(err => res.status(400).json(err));
    },
};