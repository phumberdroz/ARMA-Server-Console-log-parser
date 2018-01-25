/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('sessions', {
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
        connect: {
            type: DataTypes.DATE,
            allowNull: true
        },
        disconnect: {
            type: DataTypes.DATE,
            allowNull: true
        },
        file: {
            type: DataTypes.STRING(12999),
            allowNull: true
        },
        conline: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        disline: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        connectadj: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        disconnectadj: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        }
    }, {
        tableName: 'sessions',
        timestamps: false
    });
};
