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
            allowNull: true,
            defaultValue: ''
        },
        beguid: {
            type: DataTypes.STRING(32),
            allowNull: false,
            defaultValue: ''
        },
        username: {
            type: DataTypes.STRING(32),
            allowNull: false,
            defaultValue: ''
        },
        ip: {
            type: DataTypes.STRING(22),
            allowNull: false,
            defaultValue: ''
        },
        connect: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
        },
        disconnect: {
            type: DataTypes.DATE,
            allowNull: true
        },
        file: {
            type: DataTypes.STRING(100),
            allowNull: false,
            defaultValue: ''
        },
        conline: {
            type: DataTypes.STRING(200),
            allowNull: false,
            defaultValue: ''
        },
        disline: {
            type: DataTypes.STRING(200),
            allowNull: false,
            defaultValue: ''
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
