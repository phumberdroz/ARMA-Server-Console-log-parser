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
            type: DataTypes.STRING(32),
            allowNull: false,
            defaultValue: ''
        },
        username: {
            type: DataTypes.STRING(32),
            allowNull: true
        },
        ip: {
            type: DataTypes.STRING(22),
            allowNull: false,
            defaultValue: ''
        },
        time: {
            type: DataTypes.DATE,
            allowNull: true
        },
        message: {
            type: DataTypes.STRING(500),
            allowNull: false,
            defaultValue: ''
        },
        channel: {
            type: DataTypes.STRING(25),
            allowNull: false,
            defaultValue: ''
        }
    }, {
        tableName: 'messages',
        timestamps: false
    });
};
