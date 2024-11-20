const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Template extends Model {}

  Template.init(
    {

      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('DRAFT', 'LIVE', 'ARCHIVED', 'DELETED'),
        defaultValue: 'DRAFT',
      },

      projectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      createdById: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      updatedById: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      templateType: {
        type: DataTypes.ENUM('SCRATCH', 'GLOBAL', 'IMPORTED'),
        allowNull: false,
        defaultValue: 'SCRATCH',
      },

      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Template',
      tableName: 'template',
      underscored: true,
      paranoid: true,
      timestamps: true,
    },
  );

  Template.associate = models => {
    Template.belongsTo(models.Person, {
      as: 'creator',
      foreignKey: 'createdById',
      targetKey: 'id',
    });

    Template.hasMany(models.Set, {
      as: 'sets',
      foreignKey: 'templateId',
    });

    Template.hasMany(models.TableField, {
      as: 'fields',
      foreignKey: 'templateId',
    });

    Template.hasMany(models.TemplateProperty, {
      as: 'properties',
      foreignKey: 'templateId',
    });

    Template.hasMany(models.FieldResponse, {
      as: 'fieldResponses',
      foreignKey: 'templateId',
    });
  };
  return Template;
};
