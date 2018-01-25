/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('messages', {
        id: {
            type: DataTypes.INTEGER(11).UNSIGNED,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        steamid: {
            type: DataTypes.STRING(33),
            allowNull: true
        },
        beguid: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        username: {
            type: DataTypes.STRING(32),
            allowNull: true
        },
        ip: {
            type: DataTypes.STRING(22),
            allowNull: true
        },
        time: {
            type: DataTypes.DATE,
            allowNull: true
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        channel: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'messages',
        timestamps: false
    });
};
