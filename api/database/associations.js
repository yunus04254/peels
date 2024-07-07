// Apply associations between models in the database.

function applyAssociations(sequelize) {
    const {Journal, Goal, Entry, User, UserCharacter, Character, UserStyle, Style, Notification, Template, Friend, Bookmark, NonExist, XPLog} = sequelize.models;
    Journal.hasMany(Entry);
    Entry.belongsTo(Journal);
    User.hasMany(Journal);
    Journal.belongsTo(User);
    User.hasMany(Goal);
    Goal.belongsTo(User);

    Character.belongsToMany(User, { through: UserCharacter });
    User.belongsToMany(Character, { through: UserCharacter });

    Style.belongsToMany(User, { through: UserStyle });
    User.belongsToMany(Style, { through: UserStyle });

    User.hasMany(Notification);
    Notification.belongsTo(User);

    Entry.hasOne(Template)

    User.hasMany(Template);

    User.hasMany(Friend, { as: 'SentRequests', foreignKey: 'fromID' });
    User.hasMany(Friend, { as: 'ReceivedRequests', foreignKey: 'toID' });
    Friend.belongsTo(User, { as: 'Requester', foreignKey: 'fromID' });
    Friend.belongsTo(User, { as: 'Receiver', foreignKey: 'toID' });


    Bookmark.belongsTo(Entry, { foreignKey: 'entryID' });
    Entry.hasMany(Bookmark, { foreignKey: 'entryID' });
    Bookmark.belongsTo(User);

    XPLog.belongsTo(User, {allowNull: false});
    User.hasMany(XPLog);

    console.log("Associations applied!")
}

module.exports = { applyAssociations };
