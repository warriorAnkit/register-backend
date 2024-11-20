const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TemplateActivityLog extends Model { }

  TemplateActivityLog.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    templateId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    actionType: {
      type: DataTypes.ENUM(
        'CREATE_TEMPLATE',
        'UPDATE_TEMPLATE',
        'DELETE_TEMPLATE',
        'CHANGE_STATUS',
      ),
      allowNull: false,
    },
    entityType: {
      type: DataTypes.ENUM('TEMPLATE', 'TEMPLATE_NAME', 'FIELD', 'PROPERTY'),
      allowNull: false,
    },
    entityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    changes: {
      type: DataTypes.JSON,
      allowNull: true,
    },

  }, {
    sequelize,
    modelName: 'TemplateActivityLog',
    tableName: 'template_activity_logs',
    underscored: true,
    timestamps: true,
  });

  TemplateActivityLog.associate = models => {
    TemplateActivityLog.belongsTo(models.Person, {
      as: 'user',
      foreignKey: 'userId',
    });
    TemplateActivityLog.belongsTo(models.Template, {
      as: 'template',
      foreignKey: 'templateId',
    });
  };

  return TemplateActivityLog;
};
