const Sequelize = require('sequelize')

const options = {
  logging: false,
  dialect: 'sqlite'
}

const sequelize = new Sequelize(options)

// ---------------------------------------------------------------------------
// Purpose of this fixture
// ---------------------------------------------------------------------------
// A deliberately dense, cyclic association graph used to exercise cache
// rehydration (cache/util.js `dataToInstance`). When the include tree is derived
// from the model graph rather than the payload, cycles such as
// Record -> partyA -> records -> Record ... and Record -> segments -> blocks ->
// segmentRef -> blocks ... expand combinatorially and exhaust memory. The
// data-driven include rebuild only walks associations present in the data, which
// keeps it bounded.
//
// Identifiers and values here are intentionally generic / synthetic.

// ===========================================================================
// Core models (carry the example.json payload)
// ===========================================================================

sequelize.define(
  'Record',
  {
    name: { type: Sequelize.CHAR(1024), allowNull: true },
    colA: { type: Sequelize.INTEGER, allowNull: true, defaultValue: 1 },
    colB: { type: Sequelize.INTEGER, allowNull: true, defaultValue: 0 },
    colC: { type: Sequelize.DATE, allowNull: true },
    colD: { type: Sequelize.DATE, allowNull: true },
    colE: { type: Sequelize.JSON, allowNull: true },
    colF: { type: Sequelize.TEXT, allowNull: true },
    colG: { type: Sequelize.BOOLEAN, allowNull: true, defaultValue: false },
    colH: { type: Sequelize.STRING, allowNull: true },
    colI: { type: Sequelize.STRING, allowNull: true }
  },
  { tableName: 'record', timestamps: true }
)

sequelize.define(
  'RecordMeta',
  {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    sourceName: { type: Sequelize.STRING(255), allowNull: true },
    sourceId: { type: Sequelize.STRING(255), allowNull: true },
    status: { type: Sequelize.STRING(255), allowNull: true },
    dateA: { type: Sequelize.DATE, allowNull: true },
    dateB: { type: Sequelize.DATE, allowNull: true },
    dateC: { type: Sequelize.DATE, allowNull: true },
    dateD: { type: Sequelize.DATE, allowNull: true },
    dateE: { type: Sequelize.DATE, allowNull: true },
    dateF: { type: Sequelize.DATE, allowNull: true },
    dateG: { type: Sequelize.DATE, allowNull: true },
    dateH: { type: Sequelize.DATE, allowNull: true },
    dateI: { type: Sequelize.DATE, allowNull: true }
  },
  { tableName: 'recordmeta', timestamps: true }
)

sequelize.define(
  'Segment',
  {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    code: { type: Sequelize.STRING, allowNull: true }
  },
  { tableName: 'segment', timestamps: true }
)

sequelize.define(
  'Block',
  {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    labelA: { type: Sequelize.STRING, allowNull: true },
    text: { type: Sequelize.TEXT, allowNull: true },
    dateStart: { type: Sequelize.DATE, allowNull: true },
    dateEnd: { type: Sequelize.DATE, allowNull: true },
    // stored as TEXT, read as parsed JSON
    payload: {
      type: Sequelize.TEXT,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('payload')
        return rawValue ? JSON.parse(rawValue) : null
      }
    },
    tags: {
      type: Sequelize.STRING(1024),
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('tags')
        return rawValue ? JSON.parse(rawValue) : null
      }
    }
  },
  { tableName: 'block', timestamps: true }
)

// ===========================================================================
// Sibling models (large fan-out, reachable from the core)
// ===========================================================================

sequelize.define(
  'RecordDraft',
  { id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true }, name: { type: Sequelize.STRING, allowNull: true } },
  { tableName: 'recorddraft' }
)

sequelize.define(
  'RecordSubmission',
  { id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true }, name: { type: Sequelize.STRING, allowNull: true } },
  { tableName: 'recordsubmission' }
)

sequelize.define('RecordContact', { id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true } }, { tableName: 'recordcontact' })

sequelize.define(
  'SegmentDraft',
  { id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true }, code: { type: Sequelize.STRING, allowNull: true } },
  { tableName: 'segmentdraft' }
)

sequelize.define(
  'SegmentSubmission',
  { id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true }, code: { type: Sequelize.STRING, allowNull: true } },
  { tableName: 'segmentsubmission' }
)

sequelize.define('Agent', { id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true } }, { tableName: 'agent' })
sequelize.define('PartyA', { id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true } }, { tableName: 'partya' })
sequelize.define('PartyB', { id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true } }, { tableName: 'partyb' })
sequelize.define('PartyBZone', { id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true } }, { tableName: 'partybzone' })
sequelize.define('Bundle', { id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true } }, { tableName: 'bundle' })
sequelize.define('Place', { id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true } }, { tableName: 'place' })

// ===========================================================================
// Leaf models (referenced as association targets; no onward associations)
// ===========================================================================

const leaf = (name, tableName) =>
  sequelize.define(name, { id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true } }, { tableName })

leaf('ChildA', 'childa')
leaf('ChildB', 'childb')
leaf('ChildC', 'childc')
leaf('ChildD', 'childd')
leaf('Asset', 'asset')
leaf('RecordView', 'recordview')
leaf('AuxA', 'auxa')
leaf('AuxB', 'auxb')
leaf('AuxC', 'auxc')
leaf('AuxD', 'auxd')
leaf('AuxE', 'auxe')
leaf('AuxF', 'auxf')
leaf('AuxG', 'auxg')
leaf('AgentGroup', 'agentgroup')

// Through (junction) models for belongsToMany
leaf('LinkA', 'linka')
leaf('LinkB', 'linkb')
leaf('LinkC', 'linkc')
leaf('LinkD', 'linkd')

const {
  Record,
  RecordMeta,
  RecordDraft,
  RecordSubmission,
  RecordContact,
  Segment,
  SegmentDraft,
  SegmentSubmission,
  Block,
  Agent,
  PartyA,
  PartyB,
  PartyBZone,
  Bundle,
  Place,
  ChildA,
  ChildB,
  ChildC,
  ChildD,
  Asset,
  RecordView,
  AuxA,
  AuxB,
  AuxC,
  AuxD,
  AuxE,
  AuxF,
  AuxG,
  AgentGroup,
  LinkA,
  LinkB,
  LinkC,
  LinkD
} = sequelize.models

// ===========================================================================
// Associations — a dense, cyclic graph. Foreign keys are auto-generated by
// Sequelize from the alias / source model name unless noted.
// ===========================================================================

// --- Record ---
Record.belongsTo(PartyBZone, { as: 'zoneRef', constraints: false })
Record.belongsTo(Agent, { as: 'agentA', constraints: false })
Record.belongsTo(Agent, { as: 'agentB', constraints: false })
Record.belongsTo(Place, { as: 'placeRef', constraints: false })
Record.belongsTo(Bundle, { as: 'bundleRef', constraints: false })
Record.belongsTo(PartyA, { as: 'partyA', constraints: false })
Record.belongsTo(PartyB, { as: 'partyB', constraints: false })
Record.belongsTo(Agent, { as: 'agentC', constraints: false })
Record.belongsTo(Agent, { as: 'agentD', constraints: false })
Record.belongsTo(Agent, { as: 'agentE', constraints: false })
Record.belongsTo(Block, { as: 'blockRef', constraints: false })
Record.hasMany(RecordContact, { as: 'childContacts', foreignKey: 'recordId', sourceKey: 'id' })
Record.hasMany(SegmentDraft, { as: 'segmentDrafts', foreignKey: 'recordId', sourceKey: 'id' })
Record.hasMany(SegmentSubmission, { as: 'segmentSubmissions', foreignKey: 'recordId', sourceKey: 'id' })
Record.hasMany(Segment, { as: 'segments', foreignKey: 'recordId', sourceKey: 'id' })
Record.hasOne(RecordMeta, { as: 'recordMeta', foreignKey: 'id', sourceKey: 'id' })

// --- Place ---
Place.belongsTo(Record, { as: 'recordRef' })
Place.belongsTo(RecordDraft, { as: 'recordDraftRef' })
Place.belongsTo(RecordSubmission, { as: 'recordSubmissionRef' })

// --- PartyA ---
PartyA.hasMany(AuxA, { as: 'auxAItems', constraints: false })
PartyA.hasMany(RecordDraft, { as: 'recordDrafts', foreignKey: 'partyAId', sourceKey: 'id', constraints: false })
PartyA.hasMany(RecordSubmission, { as: 'recordSubmissions', foreignKey: 'partyAId', sourceKey: 'id', constraints: false })
PartyA.hasMany(Record, { as: 'records', foreignKey: 'partyAId', sourceKey: 'id', constraints: false })
PartyA.hasMany(AuxC, { as: 'auxCItems', sourceKey: 'id', constraints: false })
PartyA.hasMany(AuxB, { as: 'auxBItems', sourceKey: 'id', constraints: false })

// --- PartyB ---
PartyB.hasMany(AuxB, { as: 'auxBItems', sourceKey: 'id', constraints: false })
PartyB.hasMany(AuxA, { as: 'auxAItems', constraints: false })
PartyB.hasMany(AuxD, { as: 'auxDItems' })
PartyB.belongsToMany(Segment, { as: 'segRefs', through: LinkA, foreignKey: 'refP', otherKey: 'refS' })
PartyB.belongsToMany(SegmentSubmission, { as: 'segSubRefs', through: LinkA, foreignKey: 'refP', otherKey: 'refSS' })
PartyB.belongsToMany(SegmentDraft, { as: 'segDraftRefs', through: LinkA, foreignKey: 'refP', otherKey: 'refSD' })

// --- Bundle ---
Bundle.belongsTo(PartyA, { as: 'partyA', constraints: false })
Bundle.hasMany(RecordView, { as: 'recordViews' })
Bundle.belongsTo(PartyB, { as: 'partyB', constraints: false })
Bundle.hasMany(Record, { as: 'records', sourceKey: 'id' })
Bundle.hasMany(RecordSubmission, { as: 'recordSubmissions', sourceKey: 'id' })
Bundle.hasMany(RecordDraft, { as: 'recordDrafts', sourceKey: 'id' })

// --- Segment ---
// FK 'refId' matches the payload field segments[].refId
Segment.belongsTo(PartyB, { as: 'partyB', foreignKey: 'refId', constraints: false })
Segment.belongsTo(PartyA, { as: 'partyA' })
Segment.belongsTo(PartyB, { as: 'partyBSecondary' })
Segment.hasMany(Block, { as: 'blocks', foreignKey: 'segmentId', sourceKey: 'id' })
Segment.belongsTo(Agent, { as: 'agentRef' })
Segment.belongsToMany(PartyB, { as: 'partyBRefs', through: LinkA, foreignKey: 'refS', otherKey: 'refP' })
Segment.belongsToMany(AuxG, { as: 'auxGRefs', through: LinkB, foreignKey: 'refParent', otherKey: 'refCond' })
Segment.belongsTo(RecordView, { as: 'recordViewRef', constraints: false })
Segment.belongsTo(Record, { as: 'recordRef', constraints: false })
Segment.belongsTo(RecordSubmission, { as: 'recordSubmissionRef', constraints: false })
Segment.belongsTo(RecordDraft, { as: 'recordDraftRef', constraints: false })
Segment.hasMany(Asset, { as: 'assets', sourceKey: 'id' })

// --- SegmentDraft ---
SegmentDraft.belongsTo(PartyA, { as: 'partyA' })
SegmentDraft.belongsTo(PartyB, { as: 'partyB' })
SegmentDraft.belongsTo(PartyB, { as: 'partyBSecondary' })
SegmentDraft.hasMany(Block, { as: 'blocks', foreignKey: 'segmentDraftId', sourceKey: 'id' })
SegmentDraft.belongsTo(Agent, { as: 'agentRef' })
SegmentDraft.belongsToMany(PartyB, { as: 'partyBRefs', through: LinkA, foreignKey: 'refSD', otherKey: 'refP' })
SegmentDraft.belongsToMany(AuxG, { as: 'auxGRefs', through: LinkB, foreignKey: 'refParent', otherKey: 'refCond' })
SegmentDraft.belongsTo(RecordView, { as: 'recordViewRef', constraints: false })
SegmentDraft.hasMany(Asset, { as: 'assets', sourceKey: 'id' })

// --- SegmentSubmission ---
SegmentSubmission.belongsTo(PartyB, { as: 'partyB', constraints: false })
SegmentSubmission.belongsTo(PartyA, { as: 'partyA' })
SegmentSubmission.belongsTo(PartyB, { as: 'partyBSecondary' })
SegmentSubmission.hasMany(Block, { as: 'blocks', foreignKey: 'segmentSubmissionId', sourceKey: 'id' })
SegmentSubmission.belongsTo(Agent, { as: 'agentRef' })
SegmentSubmission.belongsToMany(PartyB, { as: 'partyBRefs', through: LinkA, foreignKey: 'refSS', otherKey: 'refP' })
SegmentSubmission.belongsToMany(AuxG, { as: 'auxGRefs', through: LinkB, foreignKey: 'refParent', otherKey: 'refCond' })
SegmentSubmission.belongsTo(RecordView, { as: 'recordViewRef', constraints: false })
SegmentSubmission.hasMany(Asset, { as: 'assets', sourceKey: 'id' })

// --- Block ---
Block.belongsTo(Segment, { as: 'segmentRef', foreignKey: 'segmentId', constraints: false })
Block.belongsTo(SegmentDraft, { as: 'segmentDraftRef', foreignKey: 'segmentDraftId', constraints: false })
Block.belongsTo(SegmentSubmission, { as: 'segmentSubmissionRef', foreignKey: 'segmentSubmissionId', constraints: false })
Block.hasMany(ChildA, { as: 'slots', foreignKey: 'blockId', sourceKey: 'id' })
Block.hasMany(ChildB, { as: 'childBItems', foreignKey: 'blockId', sourceKey: 'id' })
Block.hasMany(ChildC, { as: 'markers', foreignKey: 'blockId', sourceKey: 'id' })
Block.hasMany(ChildD, { as: 'childDItems', foreignKey: 'blockId', sourceKey: 'id' })
Block.belongsTo(Agent, { as: 'agentC', constraints: false })
Block.belongsTo(Agent, { as: 'agentD', constraints: false })
Block.belongsTo(Agent, { as: 'agentF', constraints: false })
Block.hasMany(Asset, { as: 'assets', foreignKey: 'blockId' })

// --- Agent ---
Agent.hasMany(AuxE, { as: 'auxEItems', sourceKey: 'id' })
Agent.belongsToMany(AgentGroup, { as: 'agentGroups', through: LinkC })
Agent.belongsToMany(AuxA, { as: 'auxARefs', through: LinkD, foreignKey: 'refU', otherKey: 'refR' })
Agent.hasMany(AuxF, { as: 'auxFItems', sourceKey: 'id' })

// --- RecordContact ---
RecordContact.belongsTo(PartyA, { as: 'partyA', constraints: false })
RecordContact.belongsTo(Agent, { as: 'agentRef', constraints: false })
RecordContact.belongsTo(Record, { as: 'recordRef', foreignKey: 'recordId', constraints: false })
RecordContact.belongsTo(RecordDraft, { as: 'recordDraftRef', constraints: false })
RecordContact.belongsTo(RecordSubmission, { as: 'recordSubmissionRef', constraints: false })

// --- RecordDraft ---
RecordDraft.belongsTo(PartyB, { as: 'partyB' })
RecordDraft.belongsTo(Place, { as: 'placeRef' })
RecordDraft.belongsTo(Bundle, { as: 'bundleRef', constraints: false })
RecordDraft.belongsTo(PartyA, { as: 'partyA', constraints: false })
RecordDraft.hasMany(RecordContact, { as: 'childContacts', sourceKey: 'id' })

// --- RecordSubmission ---
RecordSubmission.belongsTo(PartyBZone, { as: 'zoneRef', constraints: false })
RecordSubmission.belongsTo(Place, { as: 'placeRef', constraints: false })
RecordSubmission.belongsTo(Bundle, { as: 'bundleRef', constraints: false })
RecordSubmission.belongsTo(PartyA, { as: 'partyA', constraints: false })
RecordSubmission.belongsTo(PartyB, { as: 'partyB', constraints: false })
RecordSubmission.belongsTo(Agent, { as: 'agentC', constraints: false })
RecordSubmission.belongsTo(Agent, { as: 'agentD', constraints: false })
RecordSubmission.belongsTo(Agent, { as: 'agentE', constraints: false })
RecordSubmission.belongsTo(Block, { as: 'blockRef', constraints: false })
RecordSubmission.hasMany(RecordContact, { as: 'childContacts', sourceKey: 'id' })
RecordSubmission.hasMany(SegmentDraft, { as: 'segmentDrafts', foreignKey: 'recordSubmissionId', sourceKey: 'id' })
RecordSubmission.hasMany(SegmentSubmission, { as: 'segmentSubmissions', foreignKey: 'recordSubmissionId', sourceKey: 'id' })
RecordSubmission.hasMany(Segment, { as: 'segments', foreignKey: 'recordSubmissionId', sourceKey: 'id' })
RecordSubmission.hasOne(RecordMeta, { as: 'recordMeta', foreignKey: 'id', sourceKey: 'id' })

module.exports = sequelize
