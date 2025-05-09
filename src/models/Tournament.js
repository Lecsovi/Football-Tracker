import mongoose from 'mongoose';

const MatchSchema = new mongoose.Schema({
  id: String,
  group: String,
  teamA: Object,
  teamB: Object,
  goalsA: String,
  goalsB: String,
}, { _id: false });

const GroupSchema = new mongoose.Schema({
  name: String,
  teams: [Object],
  standings: [Object],
  matches: [MatchSchema],
}, { _id: false });

const TournamentSchema = new mongoose.Schema({
  userId: String,
  groups: [GroupSchema],
}, { timestamps: true });

export default mongoose.models.Tournament || mongoose.model('Tournament', TournamentSchema);