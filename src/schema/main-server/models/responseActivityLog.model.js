const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ResponseActivityLog extends Model {}

  ResponseActivityLog.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    templateId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    setId: {
      type: DataTypes.INTEGER,
      allowNull: false,

    },
    actionType: {
      type: DataTypes.ENUM(
        'SUBMIT_RESPONSE',
        'EDIT_RESPONSE',
        'DELETE_RESPONSE',
      ),
      allowNull: false,
    },
    entityType: {
      type: DataTypes.ENUM(
        'PROPERTY',
        'FIELD',
      ),
      allowNull: false,
    },
    entityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    changes: {
      type: DataTypes.JSON, // Store the changes in JSON format
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'ResponseActivityLog',
    tableName: 'response_activity_logs',
    underscored: true,
    timestamps: true,
  });

  ResponseActivityLog.associate = models => {
    ResponseActivityLog.belongsTo(models.Person, {
      as: 'user', // Alias for association
      foreignKey: 'userId',
    });
    ResponseActivityLog.belongsTo(models.Template, {
      as: 'template', // Alias for association
      foreignKey: 'templateId',
    });
  };

  return ResponseActivityLog;
};
